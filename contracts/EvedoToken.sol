pragma solidity ^0.4.24;

import "./BurnableToken.sol";
import "./Ownable.sol";
/**
 * The Smart contract for They Party Token. Based on OpenZeppelin: https://github.com/OpenZeppelin/openzeppelin-solidity
 */
contract EvedoToken is BurnableToken, Ownable  {

	string public constant name = "ThePartyToken"; 
	string public constant symbol = "EVED";
	uint8 public constant decimals = 18;

	constructor(uint initialBalance) public {
	   balances[msg.sender] = initialBalance;
	   totalSupply_ = initialBalance;
	}
}
