const EvedoTokenContract = artifacts.require('EvedoToken')
const BigNumber = require('bignumber.js')
const chai = require('chai')
chai.use(require('chai-bignumber')(BigNumber))
const expect = chai.expect
const expectRevert = require('./helpers').expectRevert

contract('EvedoToken', function (accounts) {
  let tokenContract
  const creatorAccount = accounts[0]
  const userAccount = accounts[1]
  const decimals = 18
  const initialAmount = new BigNumber(100).times(new BigNumber(10).pow(6 + decimals))

  let init = async () => {
    tokenContract = await EvedoTokenContract.new(initialAmount, {from: creatorAccount})
  }

  describe('Creation', () => {
    beforeEach(init)

    it('should give all the initial balance to the creator', async () => {
      let balance = await tokenContract.balanceOf.call(creatorAccount)
      expect(balance).bignumber.to.equal(initialAmount)
      let decimalsResult = await tokenContract.decimals.call()
      expect(decimalsResult).bignumber.to.equal(decimals)
      let symbol = await tokenContract.symbol.call()
      expect(symbol).to.equal('EVED')
    })
  })

  describe('Normal Transfers', () => {
    beforeEach(init)

    it('ether transfer should be reversed.', async () => {
      await expectRevert(tokenContract.sendTransaction({from: userAccount, value: web3.toWei(10, 'Ether')}))
      let balanceAfter = await tokenContract.balanceOf.call(creatorAccount)
      expect(balanceAfter).bignumber.to.equal(initialAmount)
    })

    it('should transfer all tokens', async () => {
      let success = await tokenContract.transfer(userAccount, initialAmount, {from: creatorAccount})
      assert.ok(success)
      let balance = await tokenContract.balanceOf.call(userAccount)
      expect(balance).bignumber.to.equal(initialAmount)
    })

    it('should fail when trying to transfer initialAmount + 1', async () => {
      await expectRevert(tokenContract.transfer(userAccount, initialAmount.add(1), {from: creatorAccount}))
    })

    it('transfers: should transfer 1 token', async () => {
      let res = await tokenContract.transfer(userAccount, 1, {from: creatorAccount})
      assert.ok(res)

      // check event log
      const transferLog = res.logs[0]
      expect(transferLog.args.from).to.equal(creatorAccount)
      expect(transferLog.args.to).to.equal(userAccount)
      expect(transferLog.args.value.toString()).to.equal('1')
    })
  })

  describe('Approvals', () => {
    beforeEach(init)

    it('when msg.sender approves 100 to accounts[1] then account[1] should be able to withdraw 20 from msg.sender', async () => {
      let sender = creatorAccount

      let res = await tokenContract.approve(userAccount, 100, {from: sender})
      assert.ok(res)

      // check event logs
      const approvalLog = res.logs[0]
      expect(approvalLog.args.owner).to.equal(creatorAccount)
      expect(approvalLog.args.spender).to.equal(userAccount)
      expect(approvalLog.args.value.toString()).to.equal('100')

      let allowance = await tokenContract.allowance.call(sender, userAccount)
      expect(allowance).bignumber.to.equal(100)
      let success = await tokenContract.transferFrom(sender, accounts[2], 20, {from: userAccount})
      assert.ok(success)
      allowance = await tokenContract.allowance.call(sender, userAccount)
      expect(allowance).bignumber.to.equal(80)
      let balance = await tokenContract.balanceOf.call(accounts[2])
      expect(balance).bignumber.to.equal(20)
      balance = await tokenContract.balanceOf.call(creatorAccount)
      expect(balance.plus(20)).bignumber.to.equal(initialAmount)
    })

    it('when msg.sender approves 100 to accounts[1] then account[1] should not be able to withdraw 101 from msg.sender', async () => {
      let sender = creatorAccount

      let success = await tokenContract.approve(userAccount, 100, {from: sender})
      assert.ok(success)

      let allowance = await tokenContract.allowance.call(sender, userAccount)
      expect(allowance).bignumber.to.equal(100)

      await expectRevert(tokenContract.transferFrom(sender, accounts[2], 101, {from: userAccount}))
    })

    it('withdrawal from account with no allowance should fail', async () => {
      await expectRevert(tokenContract.transferFrom(creatorAccount, accounts[2], 60, {from: accounts[1]}))
    })
  })

  describe('Token Burning', () => {
    beforeEach(init)

    it('only token holder should be able to burn tokens', async () => {
      await expectRevert(tokenContract.burn(1, {from: userAccount}))
    })

    it('owner should be able to burn X tokens', async () => {
      const amountToBurn = new BigNumber(11).times(new BigNumber(10).pow(6 + decimals))
      await tokenContract.burn(amountToBurn)
      let tokenBalance = await tokenContract.balanceOf.call(creatorAccount)
      expect(tokenBalance).bignumber.to.equal(initialAmount.minus(amountToBurn))
    })
  })
})
