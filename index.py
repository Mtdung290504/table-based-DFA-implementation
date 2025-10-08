from typing import List, Set, Dict, Optional


class DFA:
    """
    Deterministic Finite Automaton implementation using transition table.
    DFA(Q, Σ, δ, q0, F)
    """
    
    def __init__(self, start_state_id: int = 0):
        """
        Initialize DFA.
        
        Args:
            start_state_id: Starting ID for state numbering (for readable logs)
        """
        self._next_state_id = start_state_id
        self._next_transaction_id = 0
        
        # By default q0 is the first state created, can be reset later
        self.q0: int = 0
        
        # Set of state IDs
        self.states: Set[int] = set()
        
        # Set of state IDs that are accept states
        self.accept_states: Set[int] = set()
        
        # Alphabet in use, mapped with index to access transaction
        self._sigma_map: Dict[str, int] = {}
        
        # Size of alphabet in use
        self._sigma_size: int = 0
        
        # Store transactions: transaction_id -> next_states
        self._transactions: Dict[int, List[Optional[int]]] = {}
        
        # Map storing transition functions for states: state_id -> transaction_id
        self._transactions_map: Dict[int, int] = {}
    
    def use_states(self, count: int) -> List[int]:
        """
        Initialize states based on desired quantity.
        
        Args:
            count: Number of states (min = 1)
            
        Returns:
            List of created state IDs
        """
        assert count >= 1, "Invalid number of states (min = 1)"
        
        self.states.clear()
        state_ids = []
        for _ in range(count):
            state_id = self._next_state_id
            self._next_state_id += 1
            self.states.add(state_id)
            state_ids.append(state_id)
        
        return state_ids
    
    def set_start_state(self, state_id: int):
        """
        Set a state as the start state.
        
        Args:
            state_id: State ID to set as start state
        """
        assert state_id in self.states, "Invalid state ID"
        self.q0 = state_id
    
    def set_accept_states(self, state_ids: List[int]):
        """
        Set states as accept states.
        
        Args:
            state_ids: List of state IDs to set as accept states
        """
        for state_id in state_ids:
            assert state_id in self.states, "Invalid state ID"
            self.accept_states.add(state_id)
    
    def use_sigma(self, sigma: List[str]):
        """
        Set the alphabet to use.
        
        Args:
            sigma: List of characters in the alphabet
        """
        # Remove duplicates while preserving order
        filtered_sigma = list(dict.fromkeys(sigma))
        
        self._sigma_map = {char: index for index, char in enumerate(filtered_sigma)}
        self._sigma_size = len(filtered_sigma)
    
    def define_transaction(self, transaction: List[Optional[int]]) -> int:
        """
        Define transition states in alphabet order.
        If there is no transition, must set None.
        
        Args:
            transaction: List of next state IDs (or None for no transition)
            
        Returns:
            Transaction ID
        """
        assert len(transaction) == self._sigma_size, \
            "The number of transition states must match the character set."
        
        transaction_id = self._next_transaction_id
        self._next_transaction_id += 1
        self._transactions[transaction_id] = transaction
        
        return transaction_id
    
    def use_transaction(self, state_id: int, transaction_id: int):
        """
        Apply transition function to a state.
        
        Args:
            state_id: State ID to apply transition to
            transaction_id: Transaction ID to apply
        """
        assert state_id in self.states, "Invalid state ID"
        assert transaction_id in self._transactions, "Invalid transaction ID"
        
        self._transactions_map[state_id] = transaction_id
    
    def check(self, input_string: str) -> bool:
        """
        Check if input is valid.
        
        Args:
            input_string: Input string to validate
            
        Returns:
            True if input is accepted, False otherwise
        """
        chars = list(input_string)
        state = self.q0
        
        for char in chars:
            # State has no transition function, reject
            if state not in self._transactions_map:
                return False
            
            transaction_id = self._transactions_map[state]
            
            # Char not in alphabet, reject
            if char not in self._sigma_map:
                return False
            
            state_index = self._sigma_map[char]
            next_state_id = self._transactions[transaction_id][state_index]
            
            # If there is a next state, continue; otherwise reject
            if next_state_id is not None:
                print(f'Read "{char}" at stateID:[{state}], goto stateID:[{next_state_id}]')
                state = next_state_id
            else:
                print(f'Read "{char}" at stateID:[{state}], reject')
                return False
        
        # If passed the loop, the string is definitely valid
        # Check if the final state is an accept state
        return state in self.accept_states


# Main example: implementing transition table for regex (a + b)(a + b + 1)*
if __name__ == "__main__":
    # DFA(Q, Σ, δ, q0, F)
    state_machine = DFA(start_state_id=1)
    
    # Create and set states (Modify according to your state table)
    q1, q2, q3, q4, q5, q6 = state_machine.use_states(6)  # Q
    state_machine.set_start_state(q1)  # q0
    state_machine.set_accept_states([q2, q3, q4, q5, q6])  # F
    
    # Set alphabet (Modify according to your state table)
    state_machine.use_sigma(['a', 'b', '1'])  # Σ
    
    # Create transition functions (δ) (Modify according to your state table)
    # Each transaction is essentially a row in the transition table (after minimization)
    transaction_1 = state_machine.define_transaction([q2, q3, None])
    transaction_2 = state_machine.define_transaction([q4, q5, q6])
    
    # Set transition functions for states
    state_machine.use_transaction(q1, transaction_1)
    # Transition functions can be reused for different states to optimize memory
    for state_id in [q2, q3, q4, q5, q6]:
        state_machine.use_transaction(state_id, transaction_2)
    
    # Check input (Modify as needed or based on requirements)
    input_str = 'ab111ba'
    result = '[Pass]' if state_machine.check(input_str) else '[Fail]'
    print(result)