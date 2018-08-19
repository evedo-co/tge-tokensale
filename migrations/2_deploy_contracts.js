const EvedoToken = artifacts.require('./EvedoToken.sol')
const EvedoTokenSale = artifacts.require('./EvedoTokenSale.sol')

module.exports = async function (deployer) {
  const rate = 2700 // 1 ETH = 2700 EVED (Pre-Private)
  const totalTokenSupply = 160000000000000000000000000 // 160 Mil
  const totalTokensForSale = totalTokenSupply / 2 // 80 Mil
  const collectorWallet = '0x57E24c76e55dfB89Bc395bae4e5b073D33C566C3'

  await deployer.deploy(EvedoToken, totalTokenSupply)
  await deployer.deploy(EvedoTokenSale, rate, collectorWallet, EvedoToken.address)

  // transfer the tokens for the CrowdSale
  const token = EvedoToken.at(EvedoToken.address)
  token.transfer(EvedoTokenSale.address, totalTokensForSale)
}
