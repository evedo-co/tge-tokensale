#Evedo's Smart Contracts and Truffle test suite


* ERC20 Interface
* StandardToken implements ERC20
* EvedoToken implements StandardToken
* EvedoTokenSale regulates and executes the token sale


## Test locally

    npm install -g ganache-cli
    npm install
    npm test
    
## Deploy locally

* Start testrpc
* Deploy the contracts using truffle: ```truffle migrate```
* Then launch truffle console to play with the contracts: ```truffle console```  

## Deploy on test net (Ropsten)

The fastest way is to use Metamask rather than running your own node.

## Deploy on main net

We won't use truffle migrations to deploy to main net. We'll use ```truffle-flattener```

```npm install truffle-flattener -g```

Use to concatenate all files, so the can be deployed using Remix and can be verified by Ethscan.

```truffle-flattener [files]```