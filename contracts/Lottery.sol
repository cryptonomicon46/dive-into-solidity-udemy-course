//SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;
import "hardhat/console.sol";

contract Lottery {
    // declaring the state variables
    address[] public players; //dynamic array of type address payable
    address[] public gameWinners;
    address public owner;

    event NewEntry(address _account);
    event WinnerPicked(address _winner);
    event Transfer(address _to, uint amount);
    event GameReset();


    // declaring the constructor
    constructor() payable {
        // TODO: initialize the owner to the address that deploys the contract
        owner = msg.sender;
    }

    // declaring the receive() function that is necessary to receive ETH
    receive() external payable {
        // TODO: require each player to send exactly 0.1 ETH
        // TODO: append the new player to the players array
        require(msg.value == 0.1 ether,"INVALID_ENTRY_FEE");
        players.push(msg.sender);
        emit NewEntry(msg.sender);
        // console.log("Entry Address: ",msg.sender);
        // console.log("Players length:",players.length);

    }

    // returning the contract's balance in wei
    function getBalance() public view onlyOwner returns  (uint256) {
        // TODO: restrict this function so only the owner is allowed to call it
        // TODO: return the balance of this address
        return address(this).balance;
    }

    modifier onlyOwner() {
        require(msg.sender == owner ,"ONLY_OWNER");
        _;
    }

    
    bool _lock = false;
    // selecting the winner
    function pickWinner() public payable onlyOwner() {
   
        // TODO: only the owner can pick a winner 
        // TODO: owner can only pick a winner if there are at least 3 players in the lottery
        require(players.length >=3,"NOT_ENOUGH_PLAYERS");
        require(!_lock,"REENTRANCY_ATTACK!");
        _lock = true;
        console.log("Picking winners...!");

        uint256 r = random();
        address winner;

        // TODO: compute an unsafe random index of the array and assign it to the winner variable 

         winner = players[r % players.length];
         emit WinnerPicked(winner);
        //  console.log(players.length);
        //  console.log("Winner Number: ", r % players.length);
        // console.log("Winner:", winner);
        // TODO: append the winner to the gameWinners array
        gameWinners.push(winner);

        // TODO: reset the lottery for the next round
        delete players;
        // delete gameWinners;

        // TODO: transfer the entire contract's balance to the winner

        (bool success, ) = payable(winner).call{value: getBalance()}("");
        require(success,"TX_FAILED");
        _lock = false;

    }

    // helper function that returns a big random integer
    // UNSAFE! Don't trust random numbers generated on-chain, they can be exploited! This method is used here for simplicity
    // See: https://solidity-by-example.org/hacks/randomness
    function random() internal view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.difficulty,
                        block.timestamp,
                        players.length
                    )
                )
            );
    }
}
