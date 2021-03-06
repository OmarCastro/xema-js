const boolean = require('../..').boolean
const should = require('chai').should()

describe('testing boolean validation', () => {
  it('should show error when validating null values', () => boolean.validate(null).error.should.eq('value = null is not a boolean'))
  it('should show error when validating undefined values', () => boolean.validate(undefined).error.should.eq('value = undefined is not a boolean'))
  it('should show error when validating non-boolean values', () => {
    boolean.validate({}).error.should.eq('value of type object is not a boolean')
    boolean.validate('').error.should.eq('value of type string is not a boolean')
    boolean.validate(0).error.should.eq('value of type number is not a boolean')
    boolean.validate(Symbol()).error.should.eq('value of type symbol is not a boolean')
  })

  it('should not show errors when validating null values if optional', () => boolean.optional().validate(null).should.deep.eql({}))
  it('should not show errors when validating undefined values if optional', () => boolean.optional().validate(undefined).should.deep.eql({}))

  it('should show not show error when validating boolean', () => {
    should.not.exist(boolean.validate(true).error)
    should.not.exist(boolean.validate(false).error)
  })
})

describe('testing boolean schema subset validation', () => {
  it('should show error when checking with null ', () => {
    boolean.checkSubsetOf(null).should.deep.eql({
      isSubset: false,
      reason: 'target schema is null'
    })
  })

  it('should show error when checking with undefined ', () => {
    boolean.checkSubsetOf(undefined).should.deep.eql({
      isSubset: false,
      reason: 'target schema is undefined'
    })
  })

  it('should show error when checking with a number ', () => {
    boolean.checkSubsetOf(1).should.deep.eql({
      isSubset: false,
      reason: 'target of type number is not a schema'
    })
  })

  it('should show error when checking with an empty object ', () => {
    boolean.checkSubsetOf({}).should.deep.eql({
      isSubset: false,
      reason: 'target object is not a schema'
    })
  })

  it('should show error when checking with a different schema ', () => {
    const number = require('../..').number
    boolean.checkSubsetOf(number).should.deep.eql({
      isSubset: false,
      reason: 'BooleanSchema cannot be a subset of NumberSchema'
    })
  })

  it('should show error when checking optional with required', () => {
    boolean.optional().checkSubsetOf(boolean).should.deep.eql({
      isSubset: false,
      reason: 'source schema allows null values while target does not'
    })
  })

  it('should be a subset if equal', () => {
    boolean.checkSubsetOf(boolean).should.deep.eql({
      isSubset: true
    })
  })
})

describe('testing boolean schema sequential data generation', () => {
  it('should generate the two posible values', () => {
    var it = boolean.generateSequentialData()
    var result = []
    for (var c of it) {
      result.push(c)
    }
    result.should.deep.eql([false, true])
  })
})

describe('testing boolean schema sequential data generation', () => {
  it('should generate the two posible values', () => {
    var it = boolean.generateSequentialData()
    var result = []
    for (var c of it) {
      result.push(c)
    }
    result.should.deep.eql([false, true])
  })
})

describe('testing boolean schema random data generation', () => {
  it('should generate the two posible values', () => {
    var it = boolean.generateRandomData()
    let allTrueORFalse = true
    for (var c of it) {
      allTrueORFalse = allTrueORFalse && (c === true || c === false)
    }
    allTrueORFalse.should.be.true
  })
})
