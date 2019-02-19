'use strict'

const { google } = require('googleapis')
const { log } = require('./log')
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
   * Returns file by ID. If folder, will return children up to pageSize limit.
   *
   * @since 0.0.1
   * @param {Object} options Specific configurations for how to get files from Google Drive.
   * @param {string } fileId Unique Google Drive file ID.
   * @returns {Array} Returns direct descendents of root folder specified with names, MIME Types and select metadata.
   *
   */
  getAll (options) {
    const { rootFolderId } = options
    return new Promise((resolve, reject) => {
      this.drive.files.list({
        ...this.driveOptions,
        q: `'${rootFolderId}' in parents and trashed = false`,
      }).then((res) => {
        resolve(res.data.files)
      }, (err) => {
        reject(err)
      })
    })
  }

  upsert (options, directorySchema) {
    const { rootFolderId } = options
    return new Promise((resolve, reject) => {
      return (async () => {
        await this._buildDirectory(this.drive, directorySchema, rootFolderId)
        resolve(directorySchema)
      })()
    })
  }

  update () {}

  destroy () {}

  _upsert (drive, parentFolderId, fileMetaData) {
    return new Promise((resolve, reject) => {
      drive.files.list({
        ...this.driveOptions,
        q: `'${parentFolderId}' in parents and trashed = false`,
      }).then((res) => {
        const file = res.data.files.find((file) => file.name === fileMetaData.resource['name'])
        if (!file) {
          drive.files.create(fileMetaData).then((res) => {
            log(`Created ${fileMetaData.resource['mimeType']}: ${fileMetaData.resource['name']}`)
            resolve(res.data)
          }, (err) => {
            reject(err)
          })
        } else {
          log(`File already exists! ${fileMetaData.resource['mimeType']}: ${fileMetaData.resource['name']}`)
          resolve(file)
        }
      }, (err) => {
        reject(err)
      })
    })
  }

  async _buildDirectory (drive, fileStructArray, parentFolderId) {
    let i = 0
    while (i < fileStructArray.length) {
      const fileStruct = fileStructArray[i]
      const file = await this._upsert(drive, parentFolderId, this._fileMetaData(fileStruct, parentFolderId))
      // TODO: check for error
      fileStruct.id = file.id
      if (fileStruct.children) await this._buildDirectory(drive, fileStruct.children, fileStruct.id)
      i++
    }
  }

  _fileMetaData (fileStruct, parentFolderId) {
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
}

export default GDrive
