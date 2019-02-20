'use strict'

const { google } = require('googleapis')
require('dotenv').config()

class GDrive {
  constructor () {
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
      process.env.PRIVATE_KEY,
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
      this.drive = google.drive({ version: 'v3', auth })
      auth.authorize(function (err, tokens) {
        if (err) reject(err)
        else resolve(auth)
      })
    })
  }

  get (fileId) {
    return new Promise((resolve, reject) => {
      this.drive.files.get({ fileId: fileId })
        .then((res) => {
          resolve(res.data)
        }, (err) => {
          reject(err)
        })
    })
  }

  /**
   * Fetch all files from Google Drive folder specified. Can recursively traverse folder if specified in `recursive` option.
   *
   * @since 0.0.1
   * @param {Object} options Specific configurations for how to get files from Google Drive.
   * @returns {Array} Returns descendents of root folder in either a flat object array or nested object array.
   *
   */
  getAll ({ rootFolderId, recursive = false } = {}) {
    const fileStructure = {
      id: rootFolderId,
      children: [],
    }
    return new Promise((resolve, reject) => {
      return (async () => {
        await this._getDirectory(fileStructure, rootFolderId, recursive)
        resolve(fileStructure)
      })()
    })
  }

  async _getDirectory (parentFolder, parentFolderId, recursive = false) {
    const files = await this._fetchGoogleFiles(parentFolderId)
    if (files.length <= 0) return // base case
    parentFolder.children = files // push onto file structure
    if (recursive) {
      let i = 0
      while (i < files.length) {
        const file = files[i]
        if (file.mimeType === 'application/vnd.google-apps.folder') await this._getDirectory(file, file.id, recursive)
        i++
      }
    }
  }

  async _fetchGoogleFiles (parentFolderId) {
    return new Promise((resolve, reject) => {
      this.drive.files.list({
        ...this.driveOptions,
        q: `'${parentFolderId}' in parents and trashed = false`,
      }).then((res) => {
        resolve(res.data.files)
      }, (err) => {
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
  upsert ({ rootFolderId }, directorySchema) {
    return new Promise((resolve, reject) => {
      return (async () => {
        await this._upsertDirectory(directorySchema, rootFolderId)
        resolve(directorySchema)
      })()
    })
  }

  async _upsertDirectory (fileStructArray, parentFolderId) {
    let i = 0
    while (i < fileStructArray.length) {
      const fileStruct = fileStructArray[i]
      const file = await this._upsertFile(parentFolderId, fileStruct)
      // TODO: check for error
      fileStruct.id = file.id
      fileStruct.name = file.name
      if (fileStruct.children) await this._upsertDirectory(fileStruct.children, fileStruct.id)
      i++
    }
  }

  _upsertFile (parentFolderId, fileStruct) {
    return new Promise((resolve, reject) => {
      this._fetchGoogleFiles(parentFolderId, fileStruct).then((files) => {
        const file = files.find((file) => file.id === fileStruct.id || file.name === fileStruct.name)
        if (!file) {
          this._createGoogleFile(parentFolderId, fileStruct).then((file) => {
            resolve(file)
          }, (err) => {
            reject(err)
          })
        } else {
          console.log(`File already exists! ${fileStruct.mimeType}: ${fileStruct.name}`)
          resolve(file)
        }
      }, (err) => {
        reject(err)
      })
    })
  }

  _createGoogleFile (parentFolderId, fileStruct) {
    const fileMetaData = this._googleFileMetaData(fileStruct, parentFolderId)
    return new Promise((resolve, reject) => {
      this.drive.files.create(fileMetaData).then((res) => {
        console.log(`Created ${fileStruct.mimeType}: ${fileStruct.name}`)
        resolve(res.data)
      }, (err) => {
        reject(err)
      })
    })
  }

  _googleFileMetaData (fileStruct, parentFolderId) {
    // TODO: Handle for files created from template.
    // TODO: Handle for dynamic folders created using spaces.
    const resource = {
      'name': fileStruct.name,
      'parents': [parentFolderId],
      'mimeType': fileStruct.mimeType,
      'teamDriveId': this.driveOptions.teamDriveId,
      'fields': 'id',
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
