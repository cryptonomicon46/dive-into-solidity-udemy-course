//SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.5.0 <0.9.0;

contract KnowledgeTest {
    string[] public tokens = ["BTC", "ETH"];
    address[] public players;
    address public owner;

    constructor() payable {
        owner = msg.sender; //Address of the deploying contract
    }
    function changeTokens() public {
        string[] storage t = tokens;
        t[0] = "VET";
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    bool _lock = false;
    function transferAll(address payable _to) external payable {
        require(!_lock,"REENTRANCY_ATTACK!");
        require(msg.sender == owner,"ONLY_OWNER");
        _lock = true;
        (bool success, ) = payable(_to).call{value: getBalance()}("");
        require(success);
        _lock = false;


    }


    function start() external {
        players.push(msg.sender);
    }

    function concatenate(string memory str1, string memory str2) external returns (string memory) {
        return string((abi.encodePacked(str1,str2)));
    }
   
    receive() external payable{}
}
