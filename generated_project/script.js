// script.js
// Core calculator logic and UI interaction

/**
 * Utility function to replace calculator symbols with JavaScript operators.
 * @param {string} expr - The calculator expression.
 * @returns {string} - Expression safe for eval.
 */
function toEvalExpression(expr) {
  return expr
    .replace(/÷/g, '/')
    .replace(/×/g, '*')
    .replace(/−/g, '-')
    .replace(/\s+/g, '');
}

/**
 * Calculator class.
 * Maintains expression and result, provides methods for manipulation and evaluation.
 */
class Calculator {
  constructor() {
    this.expression = '';
    this.result = '0';
  }

  /**
   * Append a value (number, operator, or decimal) to the expression.
   * @param {string} value - The value to append.
   */
  append(value) {
    const operators = new Set(['+', '-', '×', '÷', '−', '*', '/']);
    const isOperator = operators.has(value);
    const isDot = value === '.';

    if (isOperator) {
      // Allow minus (both '-' and '−') at start
      if (this.expression.length === 0) {
        if (value === '-' || value === '−') {
          this.expression += value;
        }
        return;
      }
      const lastChar = this.expression[this.expression.length - 1];
      if (operators.has(lastChar)) {
        // Prevent two operators in a row
        return;
      }
      this.expression += value;
    } else if (isDot) {
      // Ensure only one dot per number segment
      const lastNumber = this.expression.split(/\+|\-|×|÷|−/).pop();
      if (lastNumber && lastNumber.includes('.')) {
        return;
      }
      // If expression ends with an operator or is empty, start a new number with '0.'
      const lastChar = this.expression[this.expression.length - 1] || '';
      if (operators.has(lastChar) || this.expression.length === 0) {
        this.expression += '0.';
      } else {
        this.expression += value;
      }
    } else {
      // Number
      this.expression += value;
    }
  }

  /**
   * Clear the calculator.
   */
  clear() {
    this.expression = '';
    this.result = '0';
  }

  /**
   * Evaluate the current expression using a safe parser.
   */
  evaluate() {
    if (this.expression.length === 0) {
      this.result = '0';
      return;
    }
    // Replace calculator symbols with standard operators
    const expr = this.expression
      .replace(/÷/g, '/')
      .replace(/×/g, '*')
      .replace(/−/g, '-')
      .replace(/\s+/g, '');

    // Tokenize
    const tokens = [];
    let i = 0;
    const operators = new Set(['+', '-', '*', '/']);
    while (i < expr.length) {
      const ch = expr[i];
      if (ch >= '0' && ch <= '9' || ch === '.') {
        // Number token
        let num = '';
        while (i < expr.length && ((expr[i] >= '0' && expr[i] <= '9') || expr[i] === '.')) {
          num += expr[i];
          i++;
        }
        tokens.push(num);
      } else if (operators.has(ch)) {
        // Handle unary minus: if '-' and at start or after another operator
        if (ch === '-' && (tokens.length === 0 || operators.has(tokens[tokens.length - 1]))) {
          // Unary minus: treat as part of number
          let num = '-';
          i++;
          // Consume number part
          while (i < expr.length && ((expr[i] >= '0' && expr[i] <= '9') || expr[i] === '.')) {
            num += expr[i];
            i++;
          }
          tokens.push(num);
        } else {
          tokens.push(ch);
          i++;
        }
      } else {
        // Unexpected character: syntax error
        this.result = 'Error';
        return;
      }
    }

    // Shunting-yard to RPN
    const outputQueue = [];
    const operatorStack = [];
    const precedence = {'+': 1, '-': 1, '*': 2, '/': 2};
    for (const token of tokens) {
      if (!isNaN(token)) {
        outputQueue.push(token);
      } else if (operators.has(token)) {
        while (operatorStack.length > 0) {
          const top = operatorStack[operatorStack.length - 1];
          if (operators.has(top) && precedence[top] >= precedence[token]) {
            outputQueue.push(operatorStack.pop());
          } else {
            break;
          }
        }
        operatorStack.push(token);
      } else {
        // Unknown token
        this.result = 'Error';
        return;
      }
    }
    while (operatorStack.length > 0) {
      outputQueue.push(operatorStack.pop());
    }

    // Evaluate RPN
    const stack = [];
    for (const token of outputQueue) {
      if (!isNaN(token)) {
        stack.push(parseFloat(token));
      } else if (operators.has(token)) {
        if (stack.length < 2) {
          this.result = 'Error';
          return;
        }
        const b = stack.pop();
        const a = stack.pop();
        let res;
        switch (token) {
          case '+': res = a + b; break;
          case '-': res = a - b; break;
          case '*': res = a * b; break;
          case '/':
            if (b === 0) {
              this.result = 'Infinity';
              return;
            }
            res = a / b;
            break;
          default:
            this.result = 'Error';
            return;
        }
        stack.push(res);
      } else {
        this.result = 'Error';
        return;
      }
    }
    if (stack.length !== 1) {
      this.result = 'Error';
      return;
    }
    const finalValue = stack[0];
    if (typeof finalValue === 'number' && !isFinite(finalValue)) {
      this.result = 'Infinity';
    } else {
      this.result = String(finalValue);
    }
  }

  /**
   * Update the DOM display elements.
   */
  updateDisplay() {
    const exprEl = document.getElementById('expression');
    const resEl = document.getElementById('result');
    if (exprEl) exprEl.textContent = this.expression;
    if (resEl) resEl.textContent = this.result;
  }
}

// Attach to window for debugging
window.Calculator = Calculator;

// Initialize once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const calculator = new Calculator();

  const buttons = document.querySelectorAll('.button');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      const value = btn.dataset.value;
      switch (type) {
        case 'number':
        case 'operator':
          calculator.append(value);
          break;
        case 'clear':
          calculator.clear();
          break;
        case 'equals':
          calculator.evaluate();
          break;
        default:
          break;
      }
      calculator.updateDisplay();
    });
  });

  /**
   * Keyboard support for calculator.
   *
   * Mapping of keys to calculator actions:
   *   - Digits (0‑9) and '.' → calculator.append(value)
   *   - Operators '+', '-', '*', '/' → calculator.append(value)
   *   - 'Enter' or '=' → calculator.evaluate()
   *   - 'Backspace', 'Delete', 'Escape' → calculator.clear()
   *
   * The event listener also prevents default behavior for keys that may
   * interfere with the calculator, such as arrow keys that would cause
   * page scrolling. After handling a key, the display is updated.
   */
  window.addEventListener('keydown', (e) => {
    const key = e.key;
    let handled = false;

    // Prevent default for arrow keys to stop page scrolling
    if (key.startsWith('Arrow')) {
      e.preventDefault();
    }

    if (/^[0-9]$/.test(key) || key === '.') {
      calculator.append(key);
      handled = true;
    } else if (['+', '-', '*', '/'].includes(key)) {
      calculator.append(key);
      handled = true;
    } else if (key === 'Enter' || key === '=') {
      calculator.evaluate();
      handled = true;
    } else if (['Backspace', 'Delete', 'Escape'].includes(key)) {
      calculator.clear();
      handled = true;
    }

    if (handled) {
      e.preventDefault();
      calculator.updateDisplay();
    }
  });
});
