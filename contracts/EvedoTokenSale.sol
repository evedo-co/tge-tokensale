pragma solidity ^0.4.24;

import "./Crowdsale.sol";
import "./Ownable.sol";
import "./EvedoToken.sol";
import "./ERC20.sol";

contract EvedoTokenSale is Crowdsale, Ownable {

	using SafeMath for uint;

	struct Stage {
        uint stage_rate; // tokens for one ETH
        uint stage_cap; // limit rised funds
        uint stage_raised;
        //uint max_tokens_sold; we can add this if we dont need only ETH cap
    }

    Stage[] private stages;

    uint currentStage = 0;

    bool private isOpen = true;

    modifier isSaleOpen() {
    	require(isOpen);
    	_;
    }

	constructor(
		uint _rate,
		address _wallet,
		ERC20 _token) public 
	Crowdsale(_rate, _wallet, _token)
	{		
		stages.push(Stage(2700, 2000 * (10 ** 8), 0));
		// ............... add all stages here
	}
	
	function setStage(uint _stage) public onlyOwner 
	{
		currentStage = _stage;
	}
	
	function OpenClose() public onlyOwner {
		if (isOpen == false) {
			isOpen = true;
		} else {
			isOpen = false;
		}
	}
	
	function finalize() public onlyOwner {
		// =================================
		// send tokens to team, advisors and etc
		// and we close the sales until owner dont open it

		isOpen = false;
	}
	
	function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal isSaleOpen
	{
		require (stages[currentStage].stage_raised < stages[currentStage].stage_cap);

		rate = stages[currentStage].stage_rate;
		stages[currentStage].stage_raised = stages[currentStage].stage_raised.add(_weiAmount);
		
		super._preValidatePurchase(_beneficiary, _weiAmount);
	}
}