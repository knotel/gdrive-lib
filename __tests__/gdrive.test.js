// const getAll = require('../src/getAll')
// import { google } from 'googleapis'
import GDrive from '../gdrive'



test('the data is peanut butter', () => {
  let gdrive = new GDrive({
    rootFolderId: '1RlH4Cx5ElvGsN4j6tbERNImwlxfhbHEU'
  })

  return gdrive.getAll().then(data => {
    expect(data).toEqual(
      [{
        "id": "1_eMVGj9_oM-eJ9vgW-UC0RMhOcwugJBI", 
        "mimeType": "application/vnd.google-apps.folder",
        "name": "Base Folder", 
        "parents": ["1RlH4Cx5ElvGsN4j6tbERNImwlxfhbHEU"],
        "trashed": false
      }]
    )
    // done()
  })
})