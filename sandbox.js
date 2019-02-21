const GDrive = require('./gdrive')
const fs = require('fs')

const gdrive = new GDrive()
gdrive.init()

// gdrive.getAll({
//   rootFolderId: '1WgUZCgFIJX8P5_V33DoYMGhw4yZiJKga',
//   recursive: false,
// }).then((files) => {
//   console.log(files)
// })

let schema = JSON.parse(fs.readFileSync('./example.json', 'utf8'))

gdrive.upsert({ rootFolderId: '1RlH4Cx5ElvGsN4j6tbERNImwlxfhbHEU', rename: true }, schema).then(function(folder) {
  // save space folder contents to JSON with IDs
  fs.writeFile(`./upsertResponse.json`, JSON.stringify(folder), (err) => {
    console.log(`Schema San Francisco has been created`)
  })
})