# gdrive-lib
Library for common Google Drive functionality.

# Get Started

```
yarn add @knotel/gdrive-lib --save
```

# Google Folders

1. Recursively generate an n-deep folder structure with files created using existing Google Drive templates.
2. Get all
  - Add metadata about children length (i.e. file count) (need).
  - Add meta data about file size of directory itself (love).
  - Hide data concerning user authorized to create files.
3. Get
4. Update
5. Delete

# Config Options

1. Specify credentials.json.

## Google Drive REST API Reference

* https://developers.google.com/drive/api/v3/reference/

## Supported MIME Types

* https://developers.google.com/drive/api/v3/mime-types


## Getting Started

```
const GDrive = require('@knotel/gdrive-lib')
gdrive.init() // set auth within internal state of gdrive instance
gdrive.getAll({
  rootFolderId: 'XXX'
}).then((files) =>
  console.log(files)
)
```