'use strict'

const { google } = require('googleapis')
require('dotenv').config()

const delay = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
  })
}

class GDrive {
  constructor () {
    const buff = Buffer.from(process.env.PRIVATE_KEY, 'base64')
    const PRIVATE_KEY = buff.toString()
    this.driveOptions = {
      pageSize: 200,
      corpora: 'teamDrive',
      supportsTeamDrives: true,
      includeTeamDriveItems: true,
      teamDriveId: process.env.TEAM_DRIVE,
      fields: 'files(id, name, mimeType, parents, trashed)',
    }
    this.authCredentials = [
      process.env.CLIENT_EMAIL,
      null,
      PRIVATE_KEY,
      ['https://www.googleapis.com/auth/drive'],
      process.env.USER_EMAIL,
    ]
  }

  /**
   * Initializes the Google Drive connection by creating the authorization token.
   *
   * @since 0.0.1
   *
   */
  init () {
    return new Promise((resolve, reject) => {
      const auth = new google.auth.JWT(...this.authCredentials)
      this.auth = auth
      this.drive = google.drive({ version: 'v3', auth })
      auth.authorize(function (err, tokens) {
        if (err) {
          console.error(err)
          reject(err)
        } else {
          resolve(auth)
        }
      })
    })
  }

  get (fileId) {
    return new Promise((resolve, reject) => {
      this.drive.files.get({ fileId: fileId })
        .then((res) => {
          resolve(res.data)
        }, (err) => {
          console.error(err)
          reject(err)
        })
    })
  }

  /**
   * Fetch all files from Google Drive folder specified. Can recursively traverse folder if specified in `recursive` option.
   * Can return folders only with `foldersOnly` option. Can add a non-folder file count with `nonFolderFileCount`.
   *
   * @since 0.0.1
   * @param {Object} options Specific configurations for how to get files from Google Drive.
   * @returns {Array} Returns descendents of root folder in either a flat object array or nested object array.
   *
   */
  getAll ({ rootFolderId, recursive = false, foldersOnly = false, nonFolderFileCount = true } = {}) {
    const fileStructure = {
      id: rootFolderId,
      children: [],
    }
    return new Promise((resolve, reject) => {
      return (async () => {
        await this._getDirectory({ recursive, foldersOnly, nonFolderFileCount }, fileStructure, rootFolderId)
        resolve(fileStructure)
      })()
    })
  }

  async _getDirectory (options, parentFolder, parentFolderId) {
    await delay(500)
    const files = await this._fetchGoogleFiles(parentFolderId, options.foldersOnly)
    parentFolder.children = files // push onto file structure
    if (options.nonFolderFileCount) {
      parentFolder.nonFolderFileCount = files.filter(file => file.mimeType !== 'application/vnd.google-apps.folder').length
    }
    if (files.length <= 0) return // base case
    if (options.recursive) {
      let i = 0
      while (i < files.length) {
        const file = files[i]
        if (file.mimeType === 'application/vnd.google-apps.folder') await this._getDirectory(options, file, file.id)
        i++
      }
    }
  }

  async _fetchGoogleFiles (parentFolderId, foldersOnly = false) {
    await delay(500)
    return new Promise((resolve, reject) => {
      this.drive.files.list({
        ...this.driveOptions,
        q: `${foldersOnly ? 'mimeType = "application/vnd.google-apps.folder" and ' : ''}'${parentFolderId}' in parents and trashed = false`,
      }).then(res => {
        resolve(res.data.files)
      }, err => {
        console.error(err)
        reject(err)
      })
    })
  }

  /**
   * Recursively upsert folders by ID or name specified in schema.
   *
   * @since 0.0.1
   * @param {Object} options Specific configurations for how to get files from Google Drive.
   * @param {Array} directorySchema Nested structure of objects and object arrays. All files should have an ID or name.
   * @returns {Array} Returns directorySchema in the same format, except missing names and IDs are returned where files are newly created.
   *
   */
  upsert ({ rootFolderId, rename }, directorySchema) {
    return new Promise((resolve, reject) => {
      return (async () => {
        await this._upsertDirectory(directorySchema, rootFolderId, rename)
        resolve(directorySchema)
      })()
    })
  }

  async _upsertDirectory (fileStructArray, parentFolderId, rename) {
    let i = 0
    while (i < fileStructArray.length) {
      await delay(500)
      const file = await this._upsertFile(parentFolderId, rename, fileStructArray[i])
      // TODO: check for error
      fileStructArray[i].id = file.id
      fileStructArray[i].name = file.name
      if (fileStructArray[i].children) await this._upsertDirectory(fileStructArray[i].children, fileStructArray[i].id, rename)
      i++
    }
  }

  async _upsertFile (parentFolderId, rename, fileStruct) {
    await delay(500)
    return new Promise((resolve, reject) => {
      this._fetchGoogleFiles(parentFolderId, false).then(files => {
        let file = files.find((file) => {
          if (rename && fileStruct.id) return file.id === fileStruct.id
        })
        if (!file) file = files.find(file => file.name === fileStruct.name)
        if (!file) {
          fileStruct.nonFolderFileCount = 0
          this._createGoogleFile(parentFolderId, fileStruct).then(file => {
            resolve(file)
          }, (err) => {
            console.error(err)
            reject(err)
          })
        } else {
          this._fetchGoogleFiles(file.id, false).then(files => {
            fileStruct.nonFolderFileCount = files.filter(file => file.mimeType !== 'application/vnd.google-apps.folder').length
          })
          if (rename && file.name !== fileStruct.name) {
            this._updateGoogleFile(file, fileStruct).then(file => {
              resolve(file)
            }, (err) => {
              console.error(err)
              reject(err)
            })
          } else {
            console.log(`File already exists! ${fileStruct.mimeType}: ${fileStruct.name}`)
            resolve(file)
          }
        }
      }, (err) => {
        console.error(err)
        reject(err)
      })
    })
  }

  async _createGoogleFile (parentFolderId, fileStruct) {
    await delay(500)
    const fileMetadata = this._createGoogleMetadata(fileStruct, parentFolderId)
    return new Promise((resolve, reject) => {
      this.drive.files.create(fileMetadata).then(res => {
        console.log(`Created ${fileStruct.mimeType}: ${fileStruct.name}`)
        resolve({ ...res.data, name: fileStruct.name, mimeType: fileStruct.mimeType })
      }, err => {
        console.error(err)
        reject(err)
      })
    })
  }

  async _updateGoogleFile (file, fileStruct) {
    await delay(500)
    return new Promise((resolve, reject) => {
      this.drive.files.update({
        fileId: fileStruct.id,
        supportsTeamDrives: true,
        resource: {
          'name': fileStruct.name,
        },
      }).then(res => {
        console.log(`Updated ${fileStruct.mimeType}: ${file.name} -> ${fileStruct.name}`)
        resolve(res.data)
      }, err => {
        console.error(err)
        reject(err)
      })
    })
  }

  _createGoogleMetadata (fileStruct, parentFolderId) {
    // TODO: Handle for files created from template.
    // TODO: Handle for dynamic folders created using spaces.
    const resource = {
      'name': fileStruct.name,
      'parents': [parentFolderId],
      'mimeType': fileStruct.mimeType,
      'teamDriveId': this.driveOptions.teamDriveId,
      'fields': 'id name',
    }
    return {
      resource: resource,
      supportsTeamDrives: true,
      fields: 'id, parents',
    }
  }

  update () {}

  destroy () {}
}

module.exports = GDrive
