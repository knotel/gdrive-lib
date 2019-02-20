const GDrive = require('./gdrive')

let gdrive = new GDrive()
gdrive.init()

gdrive.getAll({
  rootFolderId: '1RlH4Cx5ElvGsN4j6tbERNImwlxfhbHEU'
}).then((files) =>{
  console.log(files)
})