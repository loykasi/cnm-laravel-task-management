// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Transaction {
    struct Payment {
        address user;
        uint256 amount;
        string package;
        uint256 timestamp;
    }

    Payment[] public payments;

    event PaymentReceived(address indexed user, uint256 amount, string package);

    function makePayment(string memory _package) public payable {
        require(msg.value > 0, "Payment must be greater than 0");

        payments.push(Payment(msg.sender, msg.value, _package, block.timestamp));
        emit PaymentReceived(msg.sender, msg.value, _package);
    }

    function getPayments() public view returns (Payment[] memory) {
        return payments;
    }
}
