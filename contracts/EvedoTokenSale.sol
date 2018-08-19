pragma solidity 0.4.24;

import "./Crowdsale.sol";
import "./Ownable.sol";
import "./EvedoToken.sol";
import "./ERC20.sol";

contract EvedoTokenSale is Crowdsale, Ownable {

    using SafeMath for uint;

    uint public constant HARD_CAP = 300000 * (10 ** 18);

    struct Stage {
        uint stage_rate; // tokens for one ETH
        uint stage_cap; // max ETH to be raised at this stage
        uint stage_raised; // amount raised in ETH
    }

    Stage[8] public stages;

    uint public currentStage = 0;

    uint public tokensSold = 0;

    bool private isOpen = true;

    modifier isSaleOpen() {
        require(isOpen);
        _;
    }

    /**
    * @param _rate is the amount of tokens for 1ETH at the main event
    * @param _wallet the address of the owner
    * @param _token the address of the token contract
    */
    constructor(uint256 _rate, address _wallet, ERC20 _token) public Crowdsale(_rate, _wallet, _token) {
        // hardcode stages
        stages[0] = Stage(2700, 2000 * (10 ** 18), 0);
        stages[1] = Stage(2600, 6000 * (10 ** 18), 0);
        stages[2] = Stage(2600, 6000 * (10 ** 18), 0);
        stages[3] = Stage(2400, HARD_CAP, 0);
        stages[4] = Stage(2300, HARD_CAP, 0);
        stages[5] = Stage(2200, HARD_CAP, 0);
        stages[6] = Stage(2100, HARD_CAP, 0);
        stages[7] = Stage(2000, HARD_CAP, 0);

        // call superclass constructor and set rate at current stage
        currentStage = 0;
    }

    function setStage(uint _stage) public onlyOwner {
        currentStage = _stage;
        // update rate
        rate = stages[currentStage].stage_rate;
    }

    function open() public onlyOwner {
        isOpen = true;
    }

    function close() public onlyOwner {
        isOpen = false;
    }

    function finalize() public onlyOwner {
        // =================================
        // send tokens to team, advisors and etc
        // and we close the sales until owner dont open it

        isOpen = false;
    }

    function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal isSaleOpen {
        // make sure we don't raise more than cap
        require(stages[currentStage].stage_raised < stages[currentStage].stage_cap, "");

        stages[currentStage].stage_raised = stages[currentStage].stage_raised.add(_weiAmount);

        super._preValidatePurchase(_beneficiary, _weiAmount);
    }
}