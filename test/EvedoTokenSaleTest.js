const EvedoTokenContract = artifacts.require('EvedoToken')
const EvedoTokenSaleContract = artifacts.require('EvedoTokenSale')
const BigNumber = require('bignumber.js')
const expect = require('chai').expect

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
      expect(currentStage.toNumber()).to.equal(0)

      let rate = await crowdsaleContract.rate.call()
      expect(rate.toNumber()).to.equal(2700)

      let wallet = await crowdsaleContract.wallet.call()
      expect(wallet.address).to.equal(creatorAccount.address)

      let stage1 = await crowdsaleContract.stages.call(0)
      expect(stage1[0].toNumber()).to.equal(2700)
      expect(web3.fromWei(stage1[1]).toNumber()).to.equal(2000)
      expect(stage1[2].toNumber()).to.equal(0)

      let stage2 = await crowdsaleContract.stages.call(1)
      expect(stage2[0].toNumber()).to.equal(2600)
      expect(web3.fromWei(stage2[1]).toNumber()).to.equal(6000)
      expect(stage2[2].toNumber()).to.equal(0)

      let stage8 = await crowdsaleContract.stages.call(7)
      expect(stage8[0].toNumber()).to.equal(2000)
      expect(web3.fromWei(stage8[1]).toNumber()).to.equal(300000)
      expect(stage8[2].toNumber()).to.equal(0)
    })
  })

  describe('Stage 1. Exclusive sale', () => {
    beforeEach(init)

    it('Sender should be able to buy tokens', async () => {
      let initialOwnerBalance = await web3.eth.getBalance(creatorAccount)
      console.log('Initial owner balance', web3.fromWei(initialOwnerBalance).toString())
      // when user sends 1 eth to EvedoTokenSale contract
      await web3.eth.sendTransaction({
        from: userAccount,
        to: crowdsaleContract.address,
        value: web3.toWei('1', 'Ether')
      })
      let userTokenBalance = await tokenContract.balanceOf.call(userAccount)
      console.log('User Token Balance', userTokenBalance)
      expect(userTokenBalance.toNumber()).to.equal(2700)

      // check that funds have been transferred
      let balanceAfterSale = await tokenContract.balanceOf.call(creatorAccount)
      console.log('Owner Balance After sale', web3.fromWei(balanceAfterSale).toString())
      expect(web3.fromWei(initialOwnerBalance.minus(balanceAfterSale))).to.equal(1)
    })
  })
})
