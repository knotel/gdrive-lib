'use strict'

import GDrive from 'gdrive'

const gdrive = new GDrive()

gdrive.getAll({
  rootFolderId: '1RlH4Cx5ElvGsN4j6tbERNImwlxfhbHEU'
}).then((files) => {
  console.log(util.inspect(files))
})

// GDrive.get('1dnUAEuNiiSRL0v0gYv5SXm6v6PYeJvPgb2DqRFlp7vk').then((files) => {
//   console.log(util.inspect(files))
// })

// fs.readFile('test.json', 'utf8', (err, data) => {
//   if (err) {
//     console.log(err)
//   } else {
//     GDrive.create({
//       rootFolderId: '1RlH4Cx5ElvGsN4j6tbERNImwlxfhbHEU'
//     }, data).then((directory) => {
//       console.log(util.inspect(directory))
//     })
//   }
// })