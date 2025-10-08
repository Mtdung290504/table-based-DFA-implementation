// @ts-check
// Main, đang triển khai ví dụ bảng dịch chuyển cho biểu thức chính quy (a + b)(a + b + 1)*
{
	// DFA(Q, Σ, δ, q0, F)
	const stateMachine = createDFA(1);

	// Tạo và đặt trạng thái (Sửa lại tùy bảng trạng thái)
	const [q1, q2, q3, q4, q5, q6] = stateMachine.useStates(6); // Q
	stateMachine.setStartState(q1); // q0
	stateMachine.setAcceptStates([q2, q3, q4, q5, q6]); // F

	// Đặt bảng chữ (Sửa lại tùy bảng trạng thái)
	stateMachine.useSigma(['a', 'b', '1']); // Σ

	// Tạo các hàm dịch chuyển (δ) (Sửa lại tùy bảng trạng thái)
	// Bản chất mỗi transaction là mỗi row trong bảng dịch chuyển (sau rút gọn)
	const transaction_1 = stateMachine.defineTransaction([q2, q3, null]);
	const transaction_2 = stateMachine.defineTransaction([q4, q5, q6]);

	// Đặt hàm dịch chuyển cho các state
	stateMachine.useTransaction(q1, transaction_1);
	[q2, q3, q4, q5, q6].forEach((stateID) => stateMachine.useTransaction(stateID, transaction_2)); // Các hàm dịch chuyển có thể tái sử dụng cho các trạng thái khác nhau để tối ưu bộ nhớ

	// Check input (Sửa lại tùy ý hoặc có yêu cầu nhất định)
	const input = 'ab111ba';
	console.log(stateMachine.check(input) ? '[Pass]' : '[Fail]');
}

/**
 * @param {number} [startStateID=0] - ID bắt đầu, để dễ đọc log trong trường hợp đặt trạng thái đầu là q1 chẳng hạn
 * @returns
 */
function createDFA(startStateID = 0) {
	const nextStateID = createIdGenerator(startStateID);
	const nextTransactionID = createIdGenerator();

	/**Mặc định q0 là trạng thái được tạo đầu tiên, có thể đặt lại sau */
	let q0 = 0;

	/**
	 * Set các state ID
	 * @type {Set<number>}
	 */
	const states = new Set();

	/**
	 * Set các state ID là trạng thái kết thúc
	 * @type {Set<number>}
	 */
	const acceptStates = new Set();

	/**
	 * Bộ chữ sử dụng, map với index để truy cập transaction
	 * @type {Map<string, number>}
	 */
	let sigmaMap = new Map();

	/**Kích thước bộ chữ đang sử dụng */
	let sigmaSize = 0;

	/**
	 * Lưu các transation
	 * @type {Map<number, (number | null)[]>}
	 */
	const transactions = new Map();

	/**
	 * Map lưu hàm dịch chuyển cho các state: Map<stateID, transactionID>
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
	 * Khởi tạo các state dựa trên số lượng muốn dùng
	 *
	 * @param {number} count - Số lượng state
	 * @returns - Mảng các state ID đã tạo
	 */
	function useStates(count) {
		assert(count >= 1, 'Invalid number of states (min = 1)');

		states.clear();
		for (let i = 0; i < count; i++) states.add(nextStateID());

		return Array.from(states);
	}

	/**
	 * Đặt trạng thái làm trạng thái bắt đầu
	 * @param {number} stateID
	 */
	function setStartState(stateID) {
		assert(states.has(stateID), 'Invalid state ID');
		q0 = stateID;
	}

	/**
	 * Đặt các state là trạng thái kết thúc
	 * @param {number[]} stateIDs
	 */
	function setAcceptStates(stateIDs) {
		stateIDs.forEach((stateID) => {
			assert(states.has(stateID), 'Invalid state ID');
			acceptStates.add(stateID);
		});
	}

	/**
	 * Đặt bộ chữ sử dụng
	 * @param {string[]} sigma
	 */
	function useSigma(sigma) {
		const filteredSigma = Array.from(new Set(sigma));

		sigmaMap = new Map(filteredSigma.map((char, index) => [char, index]));
		sigmaSize = filteredSigma.length;
	}

	/**
	 * Định nghĩa các trạng thái chuyển tiếp theo thứ tự bộ chữ, ***nếu không có dịch chuyển, phải đặt `null`***
	 * @param {(number | null)[]} transaction
	 */
	function defineTransaction(transaction) {
		assert(transaction.length === sigmaSize, 'The number of transition states must match the character set.');

		const tID = nextTransactionID();
		transactions.set(tID, transaction);

		return tID;
	}

	/**
	 * Áp dụng hàm dịch chuyển cho một state
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
	 * Kiểm tra đầu vào có hợp lệ không
	 * @param {string} input
	 */
	function check(input) {
		const chars = input.split('');
		let state = q0;

		for (let i = 0; i < chars.length; i++) {
			const char = chars[i];
			const tID = transactionsMap.get(state);
			if (typeof tID !== 'number') return false; // State không có hàm dịch chuyển, reject

			const stateIndex = sigmaMap.get(char);
			if (typeof stateIndex !== 'number') return false; // Char không có trong bộ chữ, reject

			const nextStateID = transactions.get(tID)?.[stateIndex];

			// Nếu có next state thì tiếp tục, nếu không thì reject
			if (typeof nextStateID === 'number') {
				console.log(`Read "${char}" at stateID:[${state}], goto stateID:[${nextStateID}]`);
				state = nextStateID;
			} else {
				console.log(`Read "${char}" at stateID:[${state}], reject`);
				return false;
			}
		}

		// Nếu pass qua vòng lặp, chắc chắn chuỗi hợp lệ.
		// Kiểm tra state dừng có phải trạng thái kết thúc hay không
		return acceptStates.has(state);
	}
}

/**
 * Thảy lỗi nếu condition sai
 *
 * @param {boolean} condition
 * @param {string} message
 */
function assert(condition, message) {
	if (!condition) throw new Error(message);
}

/**
 * Helper: Tạo ID tăng dần
 * @param {number} startID - ID đầu tiên
 */
function createIdGenerator(startID = 0) {
	let i = startID;
	return () => i++;
}
