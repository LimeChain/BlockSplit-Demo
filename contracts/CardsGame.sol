pragma solidity ^0.4.17;

import "./Verifier.sol";

contract CardsGame is Verifier {

	address public owner;

	uint public firstPlace;
	uint public secondPlace;
	uint public thirdPlace;

	address public winner;
	address public second;
	address public third;

	function CardsGame(uint _firstPlace, uint _secondPlace, uint _thirdPlace) public payable {
		require(_firstPlace + _secondPlace + _thirdPlace == msg.value);
		firstPlace = _firstPlace;
		secondPlace = _secondPlace;
		thirdPlace = _thirdPlace;
		owner = msg.sender;
	}

	function submitSolution(
            uint[2] a,
            uint[2] a_p,
            uint[2][2] b,
            uint[2] b_p,
            uint[2] c,
            uint[2] c_p,
            uint[2] h,
            uint[2] k,
            uint[0] input
        ) external {
			require(msg.sender != owner);
			require(verifyProof(a, a_p, b, b_p, c, c_p, h, k, input));

			distributeAwards();

	}

	function distributeAwards() private {
		if(winner == address(0)) {
			winner = msg.sender;
			msg.sender.transfer(firstPlace);
			return;
		}

		if(second == address(0) && msg.sender != winner) {
			second = msg.sender;
			msg.sender.transfer(secondPlace);
			return;
		}

		if(third == address(0) && msg.sender != winner  && msg.sender != second) {
			third = msg.sender;
			msg.sender.transfer(thirdPlace);
			return;
		}
	}
	
}