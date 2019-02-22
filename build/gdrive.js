'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')

Object.defineProperty(exports, '__esModule', {
  value: true,
})
exports.default = void 0

var _regenerator = _interopRequireDefault(require('@babel/runtime/regenerator'))

var _asyncToGenerator2 = _interopRequireDefault(require('@babel/runtime/helpers/asyncToGenerator'))

var _objectSpread2 = _interopRequireDefault(require('@babel/runtime/helpers/objectSpread'))

var _construct2 = _interopRequireDefault(require('@babel/runtime/helpers/construct'))

var _toConsumableArray2 = _interopRequireDefault(require('@babel/runtime/helpers/toConsumableArray'))

var _classCallCheck2 = _interopRequireDefault(require('@babel/runtime/helpers/classCallCheck'))

var _createClass2 = _interopRequireDefault(require('@babel/runtime/helpers/createClass'))

var _require = require('googleapis')
var google = _require.google

require('dotenv').config()

var GDrive =
/* #__PURE__ */
(function () {
  function GDrive () {
    (0, _classCallCheck2.default)(this, GDrive)
    this.driveOptions = {
      pageSize: 200,
      corpora: 'teamDrive',
      supportsTeamDrives: true,
      includeTeamDriveItems: true,
      teamDriveId: process.env.TEAM_DRIVE,
      fields: 'files(id, name, mimeType, parents, trashed)',
    }
    this.authCredentials = [process.env.CLIENT_EMAIL, null, process.env.PRIVATE_KEY, ['https://www.googleapis.com/auth/drive'], process.env.USER_EMAIL]
  }
  /**
   * Initializes the Google Drive connection by creating the authorization token.
   *
   * @since 0.0.1
   *
   */

  (0, _createClass2.default)(GDrive, [{
    key: 'init',
    value: function init () {
      var _this = this

      return new Promise(function (resolve, reject) {
        var auth = (0, _construct2.default)(google.auth.JWT, (0, _toConsumableArray2.default)(_this.authCredentials))
        _this.drive = google.drive({
          version: 'v3',
          auth: auth,
        })
        auth.authorize(function (err, tokens) {
          if (err) reject(err); else resolve(auth)
        })
      })
    },
  }, {
    key: 'get',
    value: function get (fileId) {
      var _this2 = this

      return new Promise(function (resolve, reject) {
        _this2.drive.files.get({
          fileId: fileId,
        }).then(function (res) {
          resolve(res.data)
        }, function (err) {
          reject(err)
        })
      })
    },
    /**
     * Returns file by ID. If folder, will return children up to pageSize limit.
     *
     * @since 0.0.1
     * @param {Object} options Specific configurations for how to get files from Google Drive.
     * @param {string } fileId Unique Google Drive file ID.
     * @returns {Array} Returns direct descendents of root folder specified with names, MIME Types and select metadata.
     *
     */

  }, {
    key: 'getAll',
    value: function getAll (options) {
      var _this3 = this

      var rootFolderId = options.rootFolderId
      return new Promise(function (resolve, reject) {
        _this3.drive.files.list((0, _objectSpread2.default)({}, _this3.driveOptions, {
          q: "'".concat(rootFolderId, "' in parents and trashed = false"),
        })).then(function (res) {
          resolve(res.data.files)
        }, function (err) {
          reject(err)
        })
      })
    },
  }, {
    key: 'upsert',
    value: function upsert (options, directorySchema) {
      var _this4 = this

      var rootFolderId = options.rootFolderId
      return new Promise(function (resolve, reject) {
        return (0, _asyncToGenerator2.default)(
        /* #__PURE__ */
          _regenerator.default.mark(function _callee () {
            return _regenerator.default.wrap(function _callee$ (_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.next = 2
                    return _this4._buildDirectory(_this4.drive, directorySchema, rootFolderId)

                  case 2:
                    resolve(directorySchema)

                  case 3:
                  case 'end':
                    return _context.stop()
                }
              }
            }, _callee, this)
          }))()
      })
    },
  }, {
    key: 'update',
    value: function update () {},
  }, {
    key: 'destroy',
    value: function destroy () {},
  }, {
    key: '_upsert',
    value: function _upsert (drive, parentFolderId, fileMetaData) {
      var _this5 = this

      return new Promise(function (resolve, reject) {
        drive.files.list((0, _objectSpread2.default)({}, _this5.driveOptions, {
          q: "'".concat(parentFolderId, "' in parents and trashed = false"),
        })).then(function (res) {
          var file = res.data.files.find(function (file) {
            return file.name === fileMetaData.resource['name']
          })

          if (!file) {
            drive.files.create(fileMetaData).then(function (res) {
              console.log('Created '.concat(fileMetaData.resource['mimeType'], ': ').concat(fileMetaData.resource['name']))
              resolve(res.data)
            }, function (err) {
              reject(err)
            })
          } else {
            // TODO: Get count of all non-folder files directly within
            // IF SPACE ALREADY EXISTS, CHECK 'SPACE PHOTOS' FOR COUNT OF IMAGE FILES
            // if mimetype == folder
            // check folder for sizes
            console.log('File already exists! '.concat(fileMetaData.resource['mimeType'], ': ').concat(fileMetaData.resource['name']))
            resolve(file)
          }
        }, function (err) {
          reject(err)
        })
      })
    },
  }, {
    key: '_buildDirectory',
    value: (function () {
      var _buildDirectory2 = (0, _asyncToGenerator2.default)(
      /* #__PURE__ */
        _regenerator.default.mark(function _callee2 (drive, fileStructArray, parentFolderId) {
          var i, fileStruct, file
          return _regenerator.default.wrap(function _callee2$ (_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  i = 0

                case 1:
                  if (!(i < fileStructArray.length)) {
                    _context2.next = 13
                    break
                  }

                  fileStruct = fileStructArray[i]
                  _context2.next = 5
                  return this._upsert(drive, parentFolderId, this._fileMetaData(fileStruct, parentFolderId))

                case 5:
                  file = _context2.sent
                  // TODO: check for error
                  fileStruct.id = file.id

                  if (!fileStruct.children) {
                    _context2.next = 10
                    break
                  }

                  _context2.next = 10
                  return this._buildDirectory(drive, fileStruct.children, fileStruct.id)

                case 10:
                  i++
                  _context2.next = 1
                  break

                case 13:
                case 'end':
                  return _context2.stop()
              }
            }
          }, _callee2, this)
        }))

      function _buildDirectory (_x, _x2, _x3) {
        return _buildDirectory2.apply(this, arguments)
      }

      return _buildDirectory
    }()),
  }, {
    key: '_fileMetaData',
    value: function _fileMetaData (fileStruct, parentFolderId) {
      // TODO: Handle for files created from template.
      // TODO: Handle for dynamic folders created using spaces.
      var resource = {
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
    },
  }])
  return GDrive
}())

var _default = GDrive
exports.default = _default
