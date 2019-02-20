import GDrive from '../gdrive'
// import { describe, it } from 'mocha'
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
// import sinon from 'sinon'
// import { google } from 'googleapis'
chai.use(chaiAsPromised)

const gdrive = new GDrive()
// const jwtStub = sinon.stub(google.auth, 'JWT')
// const driveStub = sinon.stub(google, 'drive').returns({
//   files: sinon.stub().returns({
//     list: sinon.stub().returns({})
//   })
// })
gdrive.init()

describe('GDrive', () => {
  describe('#getAll()', () => {
    // it('should return an array of 1 file', () => {
    //   const promise = gdrive.getAll({
    //     rootFolderId: '1RlH4Cx5ElvGsN4j6tbERNImwlxfhbHEU',
    //   })
    //   return expect(promise).to.eventually.deep.equal([{
    //     id: '1_eMVGj9_oM-eJ9vgW-UC0RMhOcwugJBI',
    //     name: 'Base Folder',
    //     mimeType: 'application/vnd.google-apps.folder',
    //     trashed: false,
    //     parents: [ '1RlH4Cx5ElvGsN4j6tbERNImwlxfhbHEU' ],
    //   }])
    // })

    // it('should return an array of 2 files', () => {
    //   const promise = gdrive.getAll({
    //     rootFolderId: '15Y8ow6r7QU6jc1XmTHxIpRSKX19bxNYS',
    //   })
    //   return expect(promise).to.eventually.deep.equal([{
    //     id: '1_eMVGj9_oM-eJ9vgW-UC0RMhOcwugJBI',
    //     name: 'Base Folder',
    //     mimeType: 'application/vnd.google-apps.folder',
    //     trashed: false,
    //     parents: [ '1RlH4Cx5ElvGsN4j6tbERNImwlxfhbHEU' ]
    //   }])
    // })

    // it('should should err if the folder doesnt exist', () => {
    //   const promise = gdrive.getAll({
    //     rootFolderId: 'not a real folder',
    //   })
    //   return expect(promise).to.eventually.be.rejected
    // })
    // google.drive.list => new Promise({})
  })
})
