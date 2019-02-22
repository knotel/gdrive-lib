const GDrive = require('./gdrive')
const fs = require('fs')

const gdrive = new GDrive()
gdrive.init()

gdrive.getAll({
  rootFolderId: '1RlH4Cx5ElvGsN4j6tbERNImwlxfhbHEU',
  recursive: true,
}).then((files) => {
  fs.writeFile(`./getResponse.json`, JSON.stringify(files), (err) => {
    console.log(`Schema San Francisco has been created`)
  })
})

// let schema = JSON.parse(fs.readFileSync('./example.json', 'utf8'))

// gdrive.upsert({ rootFolderId: '1RlH4Cx5ElvGsN4j6tbERNImwlxfhbHEU', rename: true }, schema).then(function(folder) {
//   // save space folder contents to JSON with IDs
//   fs.writeFile(`./upsertResponse.json`, JSON.stringify(folder), (err) => {
//     console.log(`Schema San Francisco has been created`)
//   })
// })