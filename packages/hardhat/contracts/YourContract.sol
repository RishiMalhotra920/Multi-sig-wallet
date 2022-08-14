pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";

// import "@openzeppelin/contracts/access/Ownable.sol";
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract YourContract {
    // Type Declarations

    struct pendingTxType {
        address account;
        uint256 amount;
        address[] signers;
    }

    // state variables
    uint256 numSignersRequired;

    address[] authorizedSigners;

    mapping(address => bool) thisSigners;

    pendingTxType pendingTx;

    // events
    event SignersAuthorized(
        address multiSigCreator,
        address[] authorizedSigners,
        uint256 numSignersRequired
    );

    event UnsignedTxCreated(address account, uint256 amount, address signer);
    event TxSigned(address account, uint256 amount, address signer);
    event TxSent(address account, uint256 amount);
    event AuthorizedSignersAndPendingTxsRemoved(address signer);

    modifier signable(uint256 amount) {
        require(
            amount > address(this).balance,
            "Contract does not have enough balance"
        );
        require(
            contains(authorizedSigners, msg.sender),
            "caller is not an authorized sender"
        );
        _;
    }

    function setAuthorizedSigners(
        address[] memory signers,
        uint256 thisNumSignersRequired
    ) public {
        require(signers.length > 0, "Number of total signers needs to be > 0");
        require(
            thisNumSignersRequired > 0,
            "Number of required signers needs to be > 0"
        );
        authorizedSigners = signers;
        numSignersRequired = thisNumSignersRequired;
        emit SignersAuthorized(
            msg.sender,
            authorizedSigners,
            numSignersRequired
        );
    }

    function removeAuthorizedSignersAndPendingTxs() public {
        delete pendingTx;
        emit AuthorizedSignersAndPendingTxsRemoved(msg.sender);
    }

    function createUnsignedTx(address account, uint256 amount)
        public
        signable(amount)
    {
        // signing a tx with a new amount

        removeAuthorizedSignersAndPendingTxs();
        pendingTx.account = account;
        pendingTx.amount = amount;
        pendingTx.signers.push(account);
        emit UnsignedTxCreated(account, amount, msg.sender);
    }

    function signTx() public signable(pendingTx.amount) {
        // signing a tx with an existing amount
        require(
            pendingTx.amount > address(this).balance,
            "Contract does not have enough balance"
        );
        require(
            contains(authorizedSigners, msg.sender),
            "caller is not an authorized sender"
        );
        if (!contains(pendingTx.signers, msg.sender)) {
            pendingTx.signers.push(msg.sender);
        }
        uint256 numSigners;
        for (uint256 i = 0; i < authorizedSigners.length; i++) {
            address signer = authorizedSigners[i];

            // if the signer of the pending transacation
            if (contains(pendingTx.signers, signer)) {
                numSigners += 1;
            }
        }
        console.log("tr 100 pendingTx.account", pendingTx.account);
        emit TxSigned(pendingTx.account, pendingTx.amount, msg.sender);

        if (numSigners >= numSignersRequired) {
            sendTx();
            // delete pendingTx
            pendingTx.account = address(0x0);
            pendingTx.amount = 0;
            delete pendingTx.signers;
        }
    }

    function sendTx() private {
        // require(pendingTxArray > 0, "sending 0 ether");

        require(pendingTx.amount > 0, "tx has 0 amount");
        (bool sent, ) = pendingTx.account.call{value: pendingTx.amount}("");
        require(sent, "Could not send transaction");
        emit TxSent(pendingTx.account, pendingTx.amount);
    }

    function contains(address[] memory array, address account)
        private
        pure
        returns (bool isPresent)
    {
        isPresent = false;

        for (uint i; i < array.length; i++) {
            if (array[i] == account) {
                isPresent = true;
                break;
            }
        }

        return isPresent;
    }

    // to support receiving ETH by default
    receive() external payable {}

    fallback() external payable {}
}
