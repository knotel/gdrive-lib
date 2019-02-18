import GDrive from '../gdrive'
// import { describe, it } from 'mocha'
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)

const gdrive = new GDrive()
gdrive.init()

describe('GDrive', () => {
  describe('#getAll()', () => {
    it('should return an array of 1 file', () => {
      const promise = gdrive.getAll({
        rootFolderId: '1RlH4Cx5ElvGsN4j6tbERNImwlxfhbHEU',
      })
      return expect(promise).to.eventually.deep.equal([{
        id: '1_eMVGj9_oM-eJ9vgW-UC0RMhOcwugJBI',
        name: 'Base Folder',
        mimeType: 'application/vnd.google-apps.folder',
        trashed: false,
        parents: [ '1RlH4Cx5ElvGsN4j6tbERNImwlxfhbHEU' ]
      }])
    })

    it('should should err if the folder doesnt exist', () => {
      const promise = gdrive.getAll({
        rootFolderId: 'not a real folder',
      })
      return expect(promise).to.eventually.be.rejected
    })
    // google.drive.list => new Promise({})
  })
})
