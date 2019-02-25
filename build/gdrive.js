'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _construct2 = _interopRequireDefault(require("@babel/runtime/helpers/construct"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _require = require('googleapis'),
    google = _require.google;

require('dotenv').config();

var GDrive =
/*#__PURE__*/
function () {
  function GDrive() {
    (0, _classCallCheck2.default)(this, GDrive);
    this.driveOptions = {
      pageSize: 200,
      corpora: 'teamDrive',
      supportsTeamDrives: true,
      includeTeamDriveItems: true,
      teamDriveId: process.env.TEAM_DRIVE,
      fields: 'files(id, name, mimeType, parents, trashed)'
    };
    this.authCredentials = [process.env.CLIENT_EMAIL, null, process.env.PRIVATE_KEY, ['https://www.googleapis.com/auth/drive'], process.env.USER_EMAIL];
  }
  /**
   * Initializes the Google Drive connection by creating the authorization token.
   *
   * @since 0.0.1
   *
   */


  (0, _createClass2.default)(GDrive, [{
    key: "init",
    value: function init() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var auth = (0, _construct2.default)(google.auth.JWT, (0, _toConsumableArray2.default)(_this.authCredentials));
        _this.auth = auth;
        _this.drive = google.drive({
          version: 'v3',
          auth: auth
        });
        auth.authorize(function (err, tokens) {
          if (err) reject(err);else resolve(auth);
        });
      });
    }
  }, {
    key: "get",
    value: function get(fileId) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.drive.files.get({
          fileId: fileId
        }).then(function (res) {
          resolve(res.data);
        }, function (err) {
          reject(err);
        });
      });
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

  }, {
    key: "getAll",
    value: function getAll() {
      var _this3 = this;

      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          rootFolderId = _ref.rootFolderId,
          _ref$recursive = _ref.recursive,
          recursive = _ref$recursive === void 0 ? false : _ref$recursive,
          _ref$foldersOnly = _ref.foldersOnly,
          foldersOnly = _ref$foldersOnly === void 0 ? false : _ref$foldersOnly,
          _ref$nonFolderFileCou = _ref.nonFolderFileCount,
          nonFolderFileCount = _ref$nonFolderFileCou === void 0 ? true : _ref$nonFolderFileCou;

      var fileStructure = {
        id: rootFolderId,
        children: []
      };
      return new Promise(function (resolve, reject) {
        return (0, _asyncToGenerator2.default)(
        /*#__PURE__*/
        _regenerator.default.mark(function _callee() {
          return _regenerator.default.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return _this3._getDirectory({
                    recursive: recursive,
                    foldersOnly: foldersOnly,
                    nonFolderFileCount: nonFolderFileCount
                  }, fileStructure, rootFolderId);

                case 2:
                  resolve(fileStructure);

                case 3:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }))();
      });
    }
  }, {
    key: "_getDirectory",
    value: function () {
      var _getDirectory2 = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee2(options, parentFolder, parentFolderId) {
        var files, i, file;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this._fetchGoogleFiles(parentFolderId, options.foldersOnly);

              case 2:
                files = _context2.sent;
                parentFolder.children = files; // push onto file structure

                if (options.nonFolderFileCount) {
                  parentFolder.nonFolderFileCount = files.filter(function (file) {
                    return file.mimeType !== 'application/vnd.google-apps.folder';
                  }).length;
                }

                if (!(files.length <= 0)) {
                  _context2.next = 7;
                  break;
                }

                return _context2.abrupt("return");

              case 7:
                if (!options.recursive) {
                  _context2.next = 17;
                  break;
                }

                i = 0;

              case 9:
                if (!(i < files.length)) {
                  _context2.next = 17;
                  break;
                }

                file = files[i];

                if (!(file.mimeType === 'application/vnd.google-apps.folder')) {
                  _context2.next = 14;
                  break;
                }

                _context2.next = 14;
                return this._getDirectory(options, file, file.id);

              case 14:
                i++;
                _context2.next = 9;
                break;

              case 17:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function _getDirectory(_x, _x2, _x3) {
        return _getDirectory2.apply(this, arguments);
      }

      return _getDirectory;
    }()
  }, {
    key: "_fetchGoogleFiles",
    value: function () {
      var _fetchGoogleFiles2 = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee3(parentFolderId) {
        var _this4 = this;

        var foldersOnly,
            _args3 = arguments;
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                foldersOnly = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : false;
                return _context3.abrupt("return", new Promise(function (resolve, reject) {
                  _this4.drive.files.list((0, _objectSpread2.default)({}, _this4.driveOptions, {
                    q: "".concat(foldersOnly ? 'mimeType = "application/vnd.google-apps.folder" and ' : '', "'").concat(parentFolderId, "' in parents and trashed = false")
                  })).then(function (res) {
                    resolve(res.data.files);
                  }, function (err) {
                    reject(err);
                  });
                }));

              case 2:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function _fetchGoogleFiles(_x4) {
        return _fetchGoogleFiles2.apply(this, arguments);
      }

      return _fetchGoogleFiles;
    }()
    /**
     * Recursively upsert folders by ID or name specified in schema.
     *
     * @since 0.0.1
     * @param {Object} options Specific configurations for how to get files from Google Drive.
     * @param {Array} directorySchema Nested structure of objects and object arrays. All files should have an ID or name.
     * @returns {Array} Returns directorySchema in the same format, except missing names and IDs are returned where files are newly created.
     *
     */

  }, {
    key: "upsert",
    value: function upsert(_ref3, directorySchema) {
      var _this5 = this;

      var rootFolderId = _ref3.rootFolderId,
          rename = _ref3.rename;
      return new Promise(function (resolve, reject) {
        return (0, _asyncToGenerator2.default)(
        /*#__PURE__*/
        _regenerator.default.mark(function _callee4() {
          return _regenerator.default.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  _context4.next = 2;
                  return _this5._upsertDirectory(directorySchema, rootFolderId, rename);

                case 2:
                  resolve(directorySchema);

                case 3:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4);
        }))();
      });
    }
  }, {
    key: "_upsertDirectory",
    value: function () {
      var _upsertDirectory2 = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee5(fileStructArray, parentFolderId, rename) {
        var i, file;
        return _regenerator.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                i = 0;

              case 1:
                if (!(i < fileStructArray.length)) {
                  _context5.next = 13;
                  break;
                }

                _context5.next = 4;
                return this._upsertFile(parentFolderId, rename, fileStructArray[i]);

              case 4:
                file = _context5.sent;
                // TODO: check for error
                fileStructArray[i].id = file.id;
                fileStructArray[i].name = file.name;

                if (!fileStructArray[i].children) {
                  _context5.next = 10;
                  break;
                }

                _context5.next = 10;
                return this._upsertDirectory(fileStructArray[i].children, fileStructArray[i].id, rename);

              case 10:
                i++;
                _context5.next = 1;
                break;

              case 13:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function _upsertDirectory(_x5, _x6, _x7) {
        return _upsertDirectory2.apply(this, arguments);
      }

      return _upsertDirectory;
    }()
  }, {
    key: "_upsertFile",
    value: function _upsertFile(parentFolderId, rename, fileStruct) {
      var _this6 = this;

      return new Promise(function (resolve, reject) {
        _this6._fetchGoogleFiles(parentFolderId, false).then(function (files) {
          var file = files.find(function (file) {
            if (rename && fileStruct.id) return file.id === fileStruct.id;
          });
          if (!file) file = files.find(function (file) {
            return file.name === fileStruct.name;
          });

          if (!file) {
            _this6._createGoogleFile(parentFolderId, fileStruct).then(function (file) {
              resolve(file);
            }, function (err) {
              reject(err);
            });
          } else {
            if (rename && file.name !== fileStruct.name) {
              _this6._updateGoogleFile(file, fileStruct).then(function (file) {
                resolve(file);
              }, function (err) {
                reject(err);
              });
            } else {
              console.log("File already exists! ".concat(fileStruct.mimeType, ": ").concat(fileStruct.name));
              resolve(file);
            }
          }
        }, function (err) {
          reject(err);
        });
      });
    }
  }, {
    key: "_createGoogleFile",
    value: function _createGoogleFile(parentFolderId, fileStruct) {
      var _this7 = this;

      var fileMetadata = this._createGoogleMetadata(fileStruct, parentFolderId);

      return new Promise(function (resolve, reject) {
        _this7.drive.files.create(fileMetadata).then(function (res) {
          console.log("Created ".concat(fileStruct.mimeType, ": ").concat(fileStruct.name));
          resolve((0, _objectSpread2.default)({}, res.data, {
            name: fileStruct.name,
            mimeType: fileStruct.mimeType
          }));
        }, function (err) {
          reject(err);
        });
      });
    }
  }, {
    key: "_updateGoogleFile",
    value: function _updateGoogleFile(file, fileStruct) {
      var _this8 = this;

      return new Promise(function (resolve, reject) {
        _this8.drive.files.update({
          fileId: fileStruct.id,
          supportsTeamDrives: true,
          resource: {
            'name': fileStruct.name
          }
        }).then(function (res) {
          console.log("Updated ".concat(fileStruct.mimeType, ": ").concat(file.name, " -> ").concat(fileStruct.name));
          resolve(res.data);
        }, function (err) {
          reject(err);
        });
      });
    }
  }, {
    key: "_createGoogleMetadata",
    value: function _createGoogleMetadata(fileStruct, parentFolderId) {
      // TODO: Handle for files created from template.
      // TODO: Handle for dynamic folders created using spaces.
      var resource = {
        'name': fileStruct.name,
        'parents': [parentFolderId],
        'mimeType': fileStruct.mimeType,
        'teamDriveId': this.driveOptions.teamDriveId,
        'fields': 'id name'
      };
      return {
        resource: resource,
        supportsTeamDrives: true,
        fields: 'id, parents'
      };
    }
  }, {
    key: "update",
    value: function update() {}
  }, {
    key: "destroy",
    value: function destroy() {}
  }]);
  return GDrive;
}();

module.exports = GDrive;
