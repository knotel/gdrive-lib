'use strict'

const { google } = require('googleapis')
const { log } = require('../utils/browser')
require('dotenv').config()

class GDrive {
  constructor() {
    this.auth = await authorize()
    this.driveOptions = {
      pageSize: 200,
      corpora: 'teamDrive',
      supportsTeamDrives: true,
      includeTeamDriveItems: true,
      teamDriveId: process.env.TEAM_DRIVE,
      fields: 'files(id, name, mimeType, parents, trashed)'
    }
    this.authCredentials = [
      process.env.CLIENT_EMAIL,
      null,
      process.env.PRIVATE_KEY,
      ['https://www.googleapis.com/auth/drive'],
      process.env.USER_EMAIL
    ]
  }

  authorize() {
    return new Promise((resolve, reject) => {
      const auth = new google.auth.JWT(...this.authCredentials)
      auth.authorize(function (err, tokens) {
        if (err) reject(err)
        else resolve(auth)
      })
    })
  }

  get(fileId) {
    return new Promise((resolve, reject) => {
      const drive = google.drive({ version: 'v3', auth: this.auth })
      drive.files.get({ fileId: fileId }, (err, res) => {
        if (err) reject(err)
        else resolve(res.data)
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
  getAll(options) {
    const { rootFolderId } = options
    return new Promise((resolve, reject) => {
      const drive = google.drive({ version: 'v3', auth: this.auth })
      drive.files.list({
        ...this.driveOptions,
        q: `'${rootFolderId}' in parents and trashed = false`
      }, (err, res) => {
        if (err) reject(err)
        else resolve(res.data.files)
      })
    })
  }

  create(options, directorySchema) {
    const { rootFolderId } = options
    return new Promise((resolve, reject) => {
      // validate JSON
      let directory
      try { directory = JSON.parse(directorySchema) }
      catch (err) { reject(err) }
      // then start build
      const drive = google.drive({ version: 'v3', auth: this.auth })
      await buildDirectory(drive, directory, rootFolderId)
      resolve(directory)
    })
  }

  update() {}

  destroy() {}

  _upsert(drive, parentFolderId, fileMetaData) {
    return new Promise((resolve, reject) => {
      drive.files.list({
        ...this.driveOptions,
        q: `'${parentFolderId}' in parents and trashed = false`
      }, (err, res) => {
        if (err) { reject(err) }
        const file = res.data.files.find((file) => file.name === fileMetaData.resource['name'])
        if (!file) {
          drive.files.create(fileMetaData, (err, res) => {
            if (err) reject(err)
            else {
              log(`Created ${fileMetaData.resource['mimeType']}: ${fileMetaData.resource['name']}`)
              resolve(res.data)
            }
          })
        } else {
          log(`File already exists! ${fileMetaData.resource['mimeType']}: ${fileMetaData.resource['name']}`)
          resolve(file)
        }
      })
    })
  }

  async _buildDirectory(drive, fileStructArray, parentFolderId) {
    let i = 0
    while (i < fileStructArray.length) {
      const fileStruct = fileStructArray[i]
      const file = await _upsert(drive, parentFolderId, _fileMetaData(fileStruct, parentFolderId))
      // TODO: check for error
      fileStruct.id = file.id
      if (fileStruct.children) await _buildDirectory(drive, fileStruct.children, fileStruct.id)
      i++
    }
  }

  _fileMetaData(fileStruct, parentFolderId) {
    // TODO: Handle for files created from template.
    // TODO: Handle for dynamic folders created using spaces.
    const resource = {
      'name': fileStruct.name,
      'parents': [parentFolderId],
      'mimeType': fileStruct.mimeType,
      'teamDriveId': process.env.TEAM_DRIVE,
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