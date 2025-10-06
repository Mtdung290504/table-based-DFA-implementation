# DFA Transition Table Implementation

This repo provides a simple **Deterministic Finite Automaton (DFA)** implementation using a **transition table**.
The code runs in both **Node.js** and **browser** environments without modification.

---

## How It Works

- The DFA is defined as **DFA(Q, Σ, δ, q0, F)**:

  - `Q` → Set of states
  - `Σ` → Alphabet
  - `δ` → Transition functions (defined as a table)
  - `q0` → Start state
  - `F` → Accept states

- The transition table is written directly in code.

- Each character of the input moves the automaton to the next state, or rejects if no transition exists.

---

## Example

See **index.js** for an example DFA implementation based on the regular expression:

```
(a + b)(a + b + 1)*
```

Open the code to read how states, alphabet, and transitions are defined.

---

## Run

### Node.js

```bash
node .\index.js
```

### Browser

Copy and paste into the browser console

Or

Include the script in an HTML file:

```html
<script src="index.js"></script>
```

Open the console to see logs.

---

## Customization

To try different problems:

- Open **index.js**
- Inside the `main()` function:

  - Change the number of states
  - Adjust start/accept states
  - Redefine the alphabet
  - Update the transition table
  - Provide your own input string

---

## Notes

- This project is for **learning purposes**.
- It shows how to map a DFA transition table directly into code.
