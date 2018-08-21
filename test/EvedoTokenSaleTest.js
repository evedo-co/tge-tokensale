const EvedoTokenContract = artifacts.require('EvedoToken')
const EvedoTokenSaleContract = artifacts.require('EvedoTokenSale')
const BigNumber = require('bignumber.js')
const chai = require('chai')
chai.use(require('chai-bignumber')(BigNumber))
const expect = chai.expect
const expectRevert = require('./helpers').expectRevert
const expectError = require('./helpers').expectError

contract('EvedoTokenSale', function (accounts) {
  let tokenContract
  let crowdsaleContract
  const creatorAccount = accounts[0]
  const userAccount = accounts[1]
  const decimals = 18
  const totalNumberOfTokens = new BigNumber(160).times(new BigNumber(10).pow(6 + decimals))
  const tokensForSale = new BigNumber(80).times(new BigNumber(10).pow(6 + decimals))

  let init = async () => {
    tokenContract = await EvedoTokenContract.new(totalNumberOfTokens)
    crowdsaleContract = await EvedoTokenSaleContract.new(2700, creatorAccount, tokenContract.address)
    // the contract needs to own the takens for sale
    tokenContract.transfer(crowdsaleContract.address, tokensForSale)
  }

  describe('Creation', () => {
    beforeEach(init)

    it('should set all stages', async () => {
      let currentStage = await crowdsaleContract.currentStage.call()
      expect(currentStage).bignumber.to.equal(0)

      let rate = await crowdsaleContract.rate.call()
      expect(rate).bignumber.to.equal(2700)

      let wallet = await crowdsaleContract.wallet.call()
      expect(wallet.address).to.equal(creatorAccount.address)

      let stage1 = await crowdsaleContract.stages.call(0)
      expect(stage1[0]).bignumber.to.equal(2700)
      expect(web3.fromWei(stage1[1]).toNumber()).to.equal(2000)
      expect(stage1[2]).bignumber.to.equal(0)

      let stage2 = await crowdsaleContract.stages.call(1)
      expect(stage2[0]).bignumber.to.equal(2600)
      expect(web3.fromWei(stage2[1])).bignumber.to.equal(6000)
      expect(stage2[2]).bignumber.to.equal(0)

      let stage8 = await crowdsaleContract.stages.call(7)
      expect(stage8[0]).bignumber.to.equal(2000)
      expect(web3.fromWei(stage8[1])).bignumber.to.equal(300000)
      expect(stage8[2]).bignumber.to.equal(0)
    })
  })

  describe('Stage 1. Exclusive sale', () => {
    beforeEach(init)

    it('Sender should be able to buy tokens', async () => {
      let initialOwnerEthBalance = await web3.eth.getBalance(creatorAccount)
      console.log('Initial owner Eth balance', web3.fromWei(initialOwnerEthBalance).toString())
      let initialUserEthBalance = await web3.eth.getBalance(userAccount)
      console.log('Initial user Eth balance', web3.fromWei(initialUserEthBalance).toString())
      let ownerTokenBalance = await tokenContract.balanceOf.call(creatorAccount)
      console.log('Owner token balance', ownerTokenBalance.toNumber())
      let crowdsaleTokenBalance = await tokenContract.balanceOf.call(crowdsaleContract.address)
      console.log('Crowdsale contract token balance', crowdsaleTokenBalance.toNumber())

      // when user sends 1 eth to EvedoTokenSale contract
      await crowdsaleContract.sendTransaction({from: userAccount, value: web3.toWei(1, 'ether')})
      let userTokenBalance = await tokenContract.balanceOf.call(userAccount)
      console.log('User Token Balance', userTokenBalance.toNumber())
      const expectedTokenBalance = new BigNumber(2700).times(new BigNumber(10).pow(decimals))
      expect(userTokenBalance).to.bignumber.equal(expectedTokenBalance)
      crowdsaleTokenBalance = await tokenContract.balanceOf.call(crowdsaleContract.address)
      console.log('Crowdsale contract token balance after transfer', crowdsaleTokenBalance.toNumber())

      // check that funds have been transferred
      let ownerEthBalanceAfterSale = await web3.eth.getBalance(creatorAccount)
      console.log('Owner Balance After sale', web3.fromWei(ownerEthBalanceAfterSale).toString())
      expect(web3.fromWei(ownerEthBalanceAfterSale.minus(initialOwnerEthBalance))).to.bignumber.be.greaterThan(0.9)
    })

    it('Sender needs to send eth', async () => {
      // when user sends 0 eth to EvedoTokenSale contract
      await expectRevert(crowdsaleContract.sendTransaction({from: userAccount, value: web3.toWei(0, 'ether')}))
    })

    it('Sender should be able to send 2000 eth max', async () => {
      await crowdsaleContract.sendTransaction({from: userAccount, value: web3.toWei(2000, 'ether')})
      await expectRevert(crowdsaleContract.sendTransaction({from: userAccount, value: web3.toWei(10, 'ether')}))
      let userTokenBalance = await tokenContract.balanceOf.call(userAccount)
      console.log('User Token Balance', userTokenBalance.toNumber())
      const expectedTokenBalance = new BigNumber(2700 * 2000).times(new BigNumber(10).pow(decimals))
      expect(userTokenBalance).to.bignumber.equal(expectedTokenBalance)
    })
  })

  describe('Stage 2. Pre-sale', () => {
    beforeEach(init)

    it('Sender should be able to buy tokens', async () => {
      let initialOwnerEthBalance = await web3.eth.getBalance(creatorAccount)
      crowdsaleContract.setStage(1)
      // when user sends 1 eth to EvedoTokenSale contract
      await crowdsaleContract.sendTransaction({from: userAccount, value: web3.toWei(1, 'ether')})
      let userTokenBalance = await tokenContract.balanceOf.call(userAccount)
      const expectedTokenBalance = new BigNumber(2600).times(new BigNumber(10).pow(decimals))
      expect(userTokenBalance).to.bignumber.equal(expectedTokenBalance)

      // check that funds have been transferred
      let ownerEthBalanceAfterSale = await web3.eth.getBalance(creatorAccount)
      console.log('Owner Balance After sale', web3.fromWei(ownerEthBalanceAfterSale).toString())
      expect(web3.fromWei(ownerEthBalanceAfterSale.minus(initialOwnerEthBalance))).to.bignumber.be.greaterThan(0.9)
    })

    it('Sender should be able to send 6000 eth max', async () => {
      crowdsaleContract.setStage(1)
      await crowdsaleContract.sendTransaction({from: userAccount, value: web3.toWei(6000, 'ether')})
      await expectRevert(crowdsaleContract.sendTransaction({from: userAccount, value: web3.toWei(10, 'ether')}))
      let userTokenBalance = await tokenContract.balanceOf.call(userAccount)
      console.log('User Token Balance', userTokenBalance.toNumber())
      const expectedTokenBalance = new BigNumber(2600 * 6000).times(new BigNumber(10).pow(decimals))
      expect(userTokenBalance).to.bignumber.equal(expectedTokenBalance)
    })
  })

  describe('Stage switching', () => {
    beforeEach(init)

    it('Stage needs to be between 0 and 7', async () => {
      await expectError(crowdsaleContract.setStage(8))
    })

    it('Stage can only go up', async () => {
      await crowdsaleContract.setStage(3)
      await expectRevert(crowdsaleContract.setStage(1))
    })

    it('Only owner can set stage', async () => {
      await expectRevert(crowdsaleContract.setStage(1, {from: userAccount}))
    })
  })

  describe('Open/Clause', () => {
    beforeEach(init)

    it('when closed no sale is possible', async () => {
      await crowdsaleContract.close()
      await expectRevert(crowdsaleContract.sendTransaction({from: userAccount, value: web3.toWei(1, 'ether')}))
    })

    it('Only owner can open/close', async () => {
      await expectRevert(crowdsaleContract.open({from: userAccount}))
      await expectRevert(crowdsaleContract.close({from: userAccount}))
    })
  })

  describe('Finalise', () => {
    beforeEach(init)

    it('when finalised no sale is possible', async () => {
      await crowdsaleContract.finalize()
      await expectRevert(crowdsaleContract.sendTransaction({from: userAccount, value: web3.toWei(1, 'ether')}))
    })

    it('Only owner can finalise', async () => {
      await expectRevert(crowdsaleContract.finalize({from: userAccount}))
    })
  })
})
