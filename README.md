#Evedo's Smart Contracts and Truffle test suite


## Description


### EvedoToken

* ERC 20 token 
* Not mintable token. 
* Burnable Token. All unsold tokens will be burned after the Main event

### Crowdsale

* Regulated by a smart contract - EvedoTokenSale
* 50% of the tokens are available for crowdsale (80M)
* TGE rate is 1 ETH = 2 000 EVD

Stages:

* Exclusive sale: 35% bonus (1ETH=2700EVD), capped at 2000 ETH
* Private Sale 1: 30 % capped at 6000 ETH = 15,600,000 EVED (1ETH=2600 EVD)
* Private Sale 2: 30 % capped at 6000 ETH = 15,600,000 EVED 
* Pre-Sale Period 1 - 20 % Bonus (1ETH=2400 EVD)
* Pre-Sale Period 2 - 15% Bonus  (1ETH=2300 EVD)
* Pre-Sale Period 3  - 10% Bonus (1ETH=2200 EVD)
* Pre-Sale Period 4 - 5 % Bonus (1ETH=2100 EVD)
* Main Event - 0 % Bonus (1 ETH = 2000 EVD)  

A stage is completed when cap is reached or manually by the owner.

When the crowdsale is finalised, the remaining tokens are burned.


## Test and Deployment

### Test locally

    npm install -g ganache-cli
    npm install
    ganache-cli -e 10000
    npm test
    
### Deploy locally

* Start ganache-cli
* Deploy the contracts using truffle: ```truffle migrate```
* Then launch truffle console to play with the contracts: ```truffle console```  

### Deploy on test nets and main net

* We won't use truffle migrations to deploy to main net. We'll use ```truffle-flattener```

```npm install truffle-flattener -g```

* Use to concatenate all files, so the can be deployed using Remix and can be verified by Ethscan.

```truffle-flattener [files]```

* Deploy the token contract first from the owner's wallet (needs to have eth)

* Deploy the crowdsale contract after, by providing the address of the token and the wallet (can be the same as owner)

* Form owner wallet transfer 80M tokens to the crowdsale contract address
