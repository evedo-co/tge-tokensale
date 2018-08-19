const EvedoTokenContract = artifacts.require('EvedoToken')
const EvedoTokenSaleContract = artifacts.require('EvedoTokenSale')
const BigNumber = require('bignumber.js')
const expect = require('chai').expect

contract('EvedoTokenSale', function (accounts) {
  let tokenContract
  let crowdsaleContract
  const creatorAccount = accounts[0]
  const secondAccount = accounts[1]
  const decimals = 18
  const initialAmount = new BigNumber(180).times(new BigNumber(10).pow(6 + decimals))

  let init = async () => {
    tokenContract = await EvedoTokenContract.new(initialAmount)
    crowdsaleContract = await EvedoTokenSaleContract.new(2700, creatorAccount, tokenContract.address)
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
})
