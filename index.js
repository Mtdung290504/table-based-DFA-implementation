// @ts-check
// Main example: implementing transition table for regex (a + b)(a + b + 1)*
{
	// DFA(Q, Σ, δ, q0, F)
	const stateMachine = createDFA(1);

	// Create and set states (Modify according to your state table)
	const [q1, q2, q3, q4, q5, q6] = stateMachine.useStates(6); // Q
	stateMachine.setStartState(q1); // q0
	stateMachine.setAcceptStates([q2, q3, q4, q5, q6]); // F

	// Set alphabet (Modify according to your state table)
	stateMachine.useSigma(['a', 'b', '1']); // Σ

	// Create transition functions (δ) (Modify according to your state table)
	// Each transaction is essentially a row in the transition table (after minimization)
	const transaction_1 = stateMachine.defineTransaction([q2, q3, null]);
	const transaction_2 = stateMachine.defineTransaction([q4, q5, q6]);

	// Set transition functions for states
	stateMachine.useTransaction(q1, transaction_1);
	[q2, q3, q4, q5, q6].forEach((stateID) => stateMachine.useTransaction(stateID, transaction_2)); // Transition functions can be reused for different states to optimize memory

	// Check input (Modify as needed or based on requirements)
	const input = 'ab111ba';
	console.log(stateMachine.check(input) ? '[Pass]' : '[Fail]');
}

/**
 * @param {number} [startStateID=0] - Starting ID, for easier log reading when first state is q1 for example
 * @returns
 */
function createDFA(startStateID = 0) {
	const nextStateID = createIdGenerator(startStateID);
	const nextTransactionID = createIdGenerator();

	/** By default q0 is the first state created, can be reset later */
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
	 * Alphabet in use, mapped with index to access transaction
	 * @type {Map<string, number>}
	 */
	let sigmaMap = new Map();

	/** Size of alphabet in use */
	let sigmaSize = 0;

	/**
	 * Store transactions
	 * @type {Map<number, (number | null)[]>}
	 */
	const transactions = new Map();

	/**
	 * Map storing transition functions for states: Map<stateID, transactionID>
	 * @type {Map<number, number>}
	 */
	const transactionsMap = new Map();

	return {
		states,
		acceptStates,

		useStates,
		setStartState,
		setAcceptStates,

		useSigma,

		defineTransaction,
		useTransaction,

		check,
	};

	/**
	 * Initialize states based on desired quantity
	 *
	 * @param {number} count - Number of states
	 * @returns - Array of created state IDs
	 */
	function useStates(count) {
		assert(count >= 1, 'Invalid number of states (min = 1)');

		states.clear();
		for (let i = 0; i < count; i++) states.add(nextStateID());

		return Array.from(states);
	}

	/**
	 * Set a state as the start state
	 * @param {number} stateID
	 */
	function setStartState(stateID) {
		assert(states.has(stateID), 'Invalid state ID');
		q0 = stateID;
	}

	/**
	 * Set states as accept states
	 * @param {number[]} stateIDs
	 */
	function setAcceptStates(stateIDs) {
		stateIDs.forEach((stateID) => {
			assert(states.has(stateID), 'Invalid state ID');
			acceptStates.add(stateID);
		});
	}

	/**
	 * Set the alphabet to use
	 * @param {string[]} sigma
	 */
	function useSigma(sigma) {
		const filteredSigma = Array.from(new Set(sigma));

		sigmaMap = new Map(filteredSigma.map((char, index) => [char, index]));
		sigmaSize = filteredSigma.length;
	}

	/**
	 * Define transition states in alphabet order, ***if there is no transition, must set `null`***
	 * @param {(number | null)[]} transaction
	 */
	function defineTransaction(transaction) {
		assert(transaction.length === sigmaSize, 'The number of transition states must match the character set.');

		const tID = nextTransactionID();
		transactions.set(tID, transaction);

		return tID;
	}

	/**
	 * Apply transition function to a state
	 *
	 * @param {number} stateID
	 * @param {number} transactionID
	 */
	function useTransaction(stateID, transactionID) {
		assert(states.has(stateID), 'Invalid state ID');
		assert(transactions.has(transactionID), 'Invalid transaction ID');

		transactionsMap.set(stateID, transactionID);
	}

	/**
	 * Check if input is valid
	 * @param {string} input
	 */
	function check(input) {
		const chars = input.split('');
		let state = q0;

		for (let i = 0; i < chars.length; i++) {
			const char = chars[i];
			const tID = transactionsMap.get(state);
			if (typeof tID !== 'number') return false; // State has no transition function, reject

			const stateIndex = sigmaMap.get(char);
			if (typeof stateIndex !== 'number') return false; // Char not in alphabet, reject

			const nextStateID = transactions.get(tID)?.[stateIndex];

			// If there is a next state, continue; otherwise reject
			if (typeof nextStateID === 'number') {
				console.log(`Read "${char}" at stateID:[${state}], goto stateID:[${nextStateID}]`);
				state = nextStateID;
			} else {
				console.log(`Read "${char}" at stateID:[${state}], reject`);
				return false;
			}
		}

		// If passed the loop, the string is definitely valid
		// Check if the final state is an accept state
		return acceptStates.has(state);
	}
}

/**
 * Throw error if condition is false
 *
 * @param {boolean} condition
 * @param {string} message
 */
function assert(condition, message) {
	if (!condition) throw new Error(message);
}

/**
 * Helper: Create incrementing ID generator
 * @param {number} startID - First ID
 */
function createIdGenerator(startID = 0) {
	let i = startID;
	return () => i++;
}
