// Main, đang triển khai ví dụ bảng dịch chuyển cho biểu thức chính quy (a + b)(a + b + 1)*
{
	// DFA(Q, Σ, δ, q0, F)
	const stateMachine = createDFA();

	// Tạo và đặt trạng thái (Sửa lại tùy bảng trạng thái)
	const [q1, q2, q3, q4, q5, q6] = stateMachine.useStates(6); // Q
	stateMachine.setStartState(q1); // q0
	stateMachine.setAcceptStates([q2, q3, q4, q5, q6]); // F

	// Đặt bảng chữ (Sửa lại tùy bảng trạng thái)
	stateMachine.useSigma(['a', 'b', '1']); // Σ

	// Tạo các hàm dịch chuyển (δ) (Sửa lại tùy bảng trạng thái)
	// Bản chất mỗi transaction rất giống với mỗi hàng trong bảng dịch chuyển
	const transaction_1 = stateMachine.defineTransaction([q2, q3, null]);
	const transaction_2 = stateMachine.defineTransaction([q4, q5, q6]);

	// Đặt hàm dịch chuyển cho các state
	stateMachine.useTransaction(q1, transaction_1);
	[q2, q3, q4, q5, q6].forEach((stateID) =>
		stateMachine.useTransaction(stateID, transaction_2)
	); // Các hàm dịch chuyển có thể tái sử dụng cho các trạng thái khác nhau để tối ưu bộ nhớ

	// Check input (Sửa lại tùy ý hoặc có yêu cầu nhất định)
	const input = 'ab111ba';
	console.log(stateMachine.check(input) ? '[Pass]' : '[Fail]');
}

function createDFA() {
	/**ID tự tăng dùng để sinh ID cho các state */
	let currentID = 0;

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
	 * Bộ chữ sử dụng
	 * @type {string[]}
	 */
	let sigmaSet = [];

	/**
	 * Hàm dịch chuyển của các state
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
	 * Khởi tạo các state dựa trên số lượng muốn dùng
	 *
	 * @param {number} numberOfStates - Số lượng state
	 * @returns - Mảng các state ID đã tạo
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
	 * Đặt trạng thái làm trạng thái bắt đầu
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
	 * Đặt các state là trạng thái kết thúc
	 * @param {number[]} stateIDs - Mảng các state ID là trạng thái kết thúc
	 */
	function setAcceptStates(stateIDs) {
		stateIDs.forEach((stateID) => {
			assert(states.has(stateID), 'Invalid state ID');
			assert(q0 !== stateID, 'Cannot set start state as accept state');
			acceptStates.add(stateID);
		});
	}

	/**
	 * Đặt bộ chữ sử dụng
	 * @param {string[]} sigma
	 */
	function useSigma(sigma) {
		sigmaSet = Array.from(new Set(sigma));
	}

	/**
	 * Định nghĩa các trạng thái chuyển tiếp theo thứ tự bộ chữ, ***nếu không có dịch chuyển, phải ghi `null`***
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
	 * Sử dụng hàm dịch chuyển cho một state
	 * @param {number} stateID
	 * @param {Map<string, number | null>} transactions
	 */
	function useTransaction(stateID, transactions) {
		transactionMaps.set(stateID, transactions);
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
			const nextState = transactionMaps.get(state)?.get(char);

			if (typeof nextState === 'number') {
				console.log(
					`Read: "${char}" at stateID:[${state}], goto stateID:[${nextState}]`
				);
				state = nextState;
			} else {
				// Từ chối
				console.log(`Read: "${char}" at stateID:[${state}], reject`);
				return false;
			}
		}

		// Nếu pass qua vòng lặp, chắc chắn chuỗi hợp lệ.
		// Lúc này cần kiểm tra state dừng có phải trạng thái kết thúc hay không
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
