# DFA Transition Table Implementation

This repo provides a simple **Deterministic Finite Automaton (DFA)** implementation using a **transition table**.
It is based on what is usually taught in computer science courses about automata and regular expressions.

The DFA is implemented in **JavaScript**, and the code can run in both **Node.js** and **browser** environments without modification.

---

## How It Works

- The DFA is defined as **DFA(Q, Σ, δ, q0, F)**:

  - `Q` → Set of states
  - `Σ` → Alphabet
  - `δ` → Transition functions (defined as a table)
  - `q0` → Start state
  - `F` → Accept states

- The transition table is created in code and reused for multiple states when possible to save memory.

- Input strings are checked step by step.
  Each character moves the automaton to the next state, or rejects if no transition is defined.

---

## Example

The main function in **index.js** shows an example DFA for the regular expression:

```
(a + b)(a + b + 1)*
```

Steps in `main()`:

1. Create DFA instance
2. Define states and mark start/accept states
3. Define the alphabet (e.g. `['a', 'b', '1']`)
4. Define transition table rows with `defineTransaction()`
5. Apply transitions to each state with `useTransaction()`
6. Check input string with `stateMachine.check(input)`

Example input:

```js
const input = "ab111ba";
console.log(stateMachine.check(input) ? "[Pass]" : "[Fail]");
```

Console output will log the state transitions, and finally `[Pass]` or `[Fail]`.

---

## Customization

- To try different problems:

  - Open **index.js**
  - Modify the DFA inside the `main()` function:

    - Change the number of states
    - Adjust start/accept states
    - Redefine the alphabet
    - Update the transition table
    - Provide your own input string

- The `assert` function is used to throw errors when an invalid DFA definition is created (e.g., wrong state IDs).

---

## Run

### Node.js

```bash
node index.js
```

### Browser

Include the script in an HTML file:

```html
<script src="index.js"></script>
```

Open the console to see logs.

Or

Copy and paste into the browser console.

---

## Notes

- This code is meant for **learning purposes**, focusing on clarity and simplicity.
- It demonstrates how to map a transition table directly into code.
