// Main, implementing the transition table for regular expression (a + b)(a + b + 1)*
{
	// DFA(Q, Σ, δ, q0, F)
	const stateMachine = createDFA();

	// Create and set states (Modify according to state table)
	const [q1, q2, q3, q4, q5, q6] = stateMachine.useStates(6); // Q
	stateMachine.setStartState(q1); // q0
	stateMachine.setAcceptStates([q2, q3, q4, q5, q6]); // F

	// Set alphabet (Modify according to state table)
	stateMachine.useSigma(['a', 'b', '1']); // Σ

	// Create transition functions (δ) (Modify according to state table)
	// Essentially each transaction is very similar to each row in the transition table
	const transaction_1 = stateMachine.defineTransaction([q2, q3, null]);
	const transaction_2 = stateMachine.defineTransaction([q4, q5, q6]);

	// Set transition functions for states
	stateMachine.useTransaction(q1, transaction_1);
	[q2, q3, q4, q5, q6].forEach((stateID) =>
		stateMachine.useTransaction(stateID, transaction_2)
	); // Transition functions can be reused for different states to optimize memory

	// Check input (Modify as needed or according to specific requirements)
	const input = 'ab111ba';
	console.log(stateMachine.check(input) ? '[Pass]' : '[Fail]');
}

function createDFA() {
	/**Auto-incrementing ID used to generate IDs for states */
	let currentID = 0;

	/**By default q0 is the first state created, can be reset later */
	let q0 = 0;

	/**
	 * Set of state IDs
	 * @type {Set<number>}
	 */
	const states = new Set();

	/**
	 * Set of state IDs that are accept states
	 * @type {Set<number>}
	 */
	const acceptStates = new Set();

	/**
	 * Alphabet being used
	 * @type {string[]}
	 */
	let sigmaSet = [];

	/**
	 * Transition functions for states
	 * @type {Map<number, Map<string, number | null>>}
	 */
	const transactionMaps = new Map();

	return {
		useStates,
		setStartState,
		setAcceptStates,
		useSigma,
		defineTransaction,
		useTransaction,
		check,
	};

	/**
	 * Initialize states based on the desired number
	 *
	 * @param {number} numberOfStates - Number of states
	 * @returns - Array of created state IDs
	 */
	function useStates(numberOfStates) {
		assert(numberOfStates >= 1, 'Invalid number of states (min = 1)');
		const rs = [];

		for (let i = 0; i < numberOfStates; i++) {
			const id = currentID++;
			states.add(id);
			rs.push(id);
		}

		return rs;
	}

	/**
	 * Set a state as the start state
	 * @param {number} stateID
	 */
	function setStartState(stateID) {
		assert(states.has(stateID), 'Invalid state ID');
		assert(
			!acceptStates.has(stateID),
			'Cannot set accept state as start state'
		);
		q0 = stateID;
	}

	/**
	 * Set states as accept states
	 * @param {number[]} stateIDs - Array of state IDs that are accept states
	 */
	function setAcceptStates(stateIDs) {
		stateIDs.forEach((stateID) => {
			assert(states.has(stateID), 'Invalid state ID');
			assert(q0 !== stateID, 'Cannot set start state as accept state');
			acceptStates.add(stateID);
		});
	}

	/**
	 * Set the alphabet to use
	 * @param {string[]} sigma
	 */
	function useSigma(sigma) {
		sigmaSet = Array.from(new Set(sigma));
	}

	/**
	 * Define transition states in the order of the alphabet, ***if there is no transition, must write `null`***
	 * @param {(number | null)[]} transactions
	 */
	function defineTransaction(transactions) {
		assert(
			transactions.length === sigmaSet.length,
			'The number of transition states must match the character set.'
		);

		return new Map(
			sigmaSet.map((char, index) => [char, transactions[index]])
		);
	}

	/**
	 * Use a transition function for a state
	 * @param {number} stateID
	 * @param {Map<string, number | null>} transactions
	 */
	function useTransaction(stateID, transactions) {
		transactionMaps.set(stateID, transactions);
	}

	/**
	 * Check if the input is valid
	 * @param {string} input
	 */
	function check(input) {
		const chars = input.split('');
		let state = q0;

		for (let i = 0; i < chars.length; i++) {
			const char = chars[i];
			const nextState = transactionMaps.get(state)?.get(char);

			if (typeof nextState === 'number') {
				console.log(
					`Read: "${char}" at stateID:[${state}], goto stateID:[${nextState}]`
				);
				state = nextState;
			} else {
				// Reject
				console.log(`Read: "${char}" at stateID:[${state}], reject`);
				return false;
			}
		}

		// If passed through the loop, the string is valid.
		// At this point, need to check if the stopped state is an accept state or not
		return acceptStates.has(state);
	}
}

/**
 * Throw an error if condition is false
 *
 * @param {boolean} condition
 * @param {string} message
 */
function assert(condition, message) {
	if (!condition) throw new Error(message);
}
