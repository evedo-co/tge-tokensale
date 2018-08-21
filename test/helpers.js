const expect = require('chai').expect

async function expectRevert (promise) {
  try {
    await promise
  } catch (error) {
    expect(error.message).to.include('revert', `Expected "revert", got ${error} instead`)
    return
  }
  throw new Error('Expected revert not received')
}

async function expectError (promise) {
  try {
    await promise
  } catch (error) {
    return
  }
  throw new Error('Expected error not received')
}

module.exports = {
  expectRevert,
  expectError
}
