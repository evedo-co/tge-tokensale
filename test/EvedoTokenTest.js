const EvedoTokenContract = artifacts.require('EvedoToken')
const BigNumber = require('bignumber.js')
const expect = require('chai').expect

contract('EvedoToken', function (accounts) {
  let tokenContract
  const creatorAccount = accounts[0]
  const secondAccount = accounts[1]
  const decimals = 18
  const initialAmount = new BigNumber(100).times(new BigNumber(10).pow(6 + decimals))

  let init = async () => {
    tokenContract = await EvedoTokenContract.new(initialAmount)
  }

  describe('Creation', () => {
    beforeEach(init)

    it('should give all the initial balance to the creator', async () => {
      let balance = await tokenContract.balanceOf.call(creatorAccount)
      expect(balance.toNumber()).to.equal(initialAmount.toNumber())
      let decimalsResult = await tokenContract.decimals.call()
      expect(decimalsResult.toNumber()).to.equal(decimals)
      let symbol = await tokenContract.symbol.call()
      expect(symbol).to.equal('EVED')
    })
  })

  describe('Normal Transfers', () => {
    beforeEach(init)

    it('ether transfer should be reversed.', async () => {
      let expectedError
      try {
        await web3.eth.sendTransaction({
          from: creatorAccount,
          to: tokenContract.address,
          value: web3.toWei('10', 'Ether')
        })
      } catch (e) {
        expectedError = e
        let balanceAfter = await tokenContract.balanceOf.call(creatorAccount)
        expect(balanceAfter.toNumber()).to.equal(initialAmount.toNumber())
      }
      assert.ok(expectedError)
    })

    it('should transfer all tokens', async () => {
      let success = await tokenContract.transfer(secondAccount, initialAmount, {from: creatorAccount})
      assert.ok(success)
      let balance = await tokenContract.balanceOf.call(secondAccount)
      expect(balance.toNumber()).to.equal(initialAmount.toNumber())
    })

    it('should fail when trying to transfer initialAmount + 1', async () => {
      let expectedError
      try {
        await tokenContract.transfer(secondAccount, initialAmount.add(1), {from: creatorAccount})
      } catch (e) {
        expectedError = e
      }
      assert.ok(expectedError)
    })

    it('transfers: should transfer 1 token', async () => {
      let res = await tokenContract.transfer(secondAccount, 1, {from: creatorAccount})
      assert.ok(res)

      // check event log
      const transferLog = res.logs[0]
      expect(transferLog.args.from).to.equal(creatorAccount)
      expect(transferLog.args.to).to.equal(secondAccount)
      expect(transferLog.args.value.toString()).to.equal('1')
    })
  })

  describe('Approvals', () => {
    beforeEach(init)

    it('when msg.sender approves 100 to accounts[1] then account[1] should be able to withdraw 20 from msg.sender', async () => {
      let sender = creatorAccount

      let res = await tokenContract.approve(secondAccount, 100, {from: sender})
      assert.ok(res)

      // check event logs
      const approvalLog = res.logs[0]
      expect(approvalLog.args.owner).to.equal(creatorAccount)
      expect(approvalLog.args.spender).to.equal(secondAccount)
      expect(approvalLog.args.value.toString()).to.equal('100')

      let allowance = await tokenContract.allowance.call(sender, secondAccount)
      expect(allowance.toNumber()).to.equal(100)
      let success = await tokenContract.transferFrom(sender, accounts[2], 20, {from: secondAccount})
      assert.ok(success)
      allowance = await tokenContract.allowance.call(sender, secondAccount)
      expect(allowance.toNumber()).to.equal(80)
      let balance = await tokenContract.balanceOf.call(accounts[2])
      expect(balance.toNumber()).to.equal(20)
      balance = await tokenContract.balanceOf.call(creatorAccount)
      expect(balance.plus(20).toNumber()).to.equal(initialAmount.toNumber())
    })

    it('when msg.sender approves 100 to accounts[1] then account[1] should not be able to withdraw 101 from msg.sender', async () => {
      let sender = creatorAccount

      let success = await tokenContract.approve(secondAccount, 100, {from: sender})
      assert.ok(success)

      let allowance = await tokenContract.allowance.call(sender, secondAccount)
      expect(allowance.toNumber()).to.equal(100)

      let expectedError
      try {
        await tokenContract.transferFrom(sender, accounts[2], 101, {from: secondAccount})
      } catch (e) {
        expectedError = e
      }
      assert.ok(expectedError)
    })

    it('withdrawal from account with no allowance should fail', async () => {
      let expectedError
      try {
        await tokenContract.transferFrom(creatorAccount, accounts[2], 60, {from: accounts[1]})
      } catch (e) {
        expectedError = e
      }
      assert.ok(expectedError)
    })
  })
})
