contract QueueBot{
	address public owner;
	bytes calldata;

	function QueueBot(){
		owner = msg.sender;
	}

	function setOwner(address _owner){
		if(msg.sender != owner)
			throw;
		owner = _owner;
	}

	function queue(
		address[] addrs,
		uint[] values,
		uint[] calldataLengths,
		bytes gluedCalldatas
	) {
		if(msg.sender != owner) {
			throw;
		}

		if( addrs.length != values.length || addrs.length != calldataLengths.length ) {
			throw;
		}

		uint start = 0;
		for(uint i = 0; i < addrs.length; i++) {
			calldata = "";
			for(uint j = start; j < start + calldataLengths[i]; j++){
				calldata.push(gluedCalldatas[j]);
			}
			if(!addrs[i].call.value(values[i])(calldata)){
				throw;
			}
			//don't simply use j because of https://github.com/ethereum/wiki/issues/75
			start = start + calldataLengths[i];
		}
	}
}