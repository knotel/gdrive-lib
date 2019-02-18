import GDrive from '../gdrive'
import { describe, it } from 'mocha'
import { expect } from 'chai'

describe('GDrive', () => {
  describe('#getAll()', () => {
    it('should return an array of 1 file', () => {
      const gdrive = new GDrive()
      gdrive.init()
      return gdrive.getAll({
        rootFolderId: '1RlH4Cx5ElvGsN4j6tbERNImwlxfhbHEU',
      }).then((result) => {
        expect(result).to.have.length(1)
      })
    })
  })
})
