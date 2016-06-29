#QueueBot

QueueBot is a contract which you can use to group an arbitrary number of transactions into a single all-or-nothing transaction. That means if a single transaction fails, they all fail.

QueueBot is very useful for dapp UX and simplifying contract interfaces. To see why, imagine we have a contract with 10 fields. We want to create a UX that can update any 10 combination of those 10 fields.

Without QueueBot there would be two options:
	1. Make 10 different transactions (its possible that some of these get mined and some do not)
	2. Create 10! (10 factorial) "setter" functions with each combination of fields.

### ABI

You can compile QueueBot yourself, or grab the abi from [generated/contracts.json](generated/contracts.json).

### Usage

#### Current owner

    queuebot.owner() constant returns (address)

#### Set owner

    queuebot.setOwner(address _owner)

#### Queue transactions

    queuebot.queue(
    	address[] [contractAddress1, contractAddress2, ...],
    	uint[] [value1, value2, ...]
    	uint[] [calldataLength1, calldataLength2, ....]
    	bytes gluedCalldata
    )

`gluedCalldata` is a concatenated bytestring of your original `calldata`s. For example if you had two `calldata`s

0. `0xabcd....`
1. `0x1234....`

Your `gluedCalldata` would be `0xabcd....1234....`. While your `calldataLength` array would be the respective lengths of the 0th and 1st `calldata`.

This ugliness is due to the fact that you cannot pass in a `bytes[]` to a public solidity function.