const GDrive = require('./gdrive')

const gdrive = new GDrive()
gdrive.init()

gdrive.getAll({
  rootFolderId: '122F51zmThpMDPiyyCLipqboHE6sM_i7s',
  recursive: true,
}).then((files) => {
  console.log(files)
})