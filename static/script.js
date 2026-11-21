const currentEl = document.getElementById('current');
const historyEl = document.getElementById('history');
const buttons = document.querySelector('.buttons');

let currentValue = '0';
let previousValue = null;
let operator = null;
let shouldResetDisplay = false;

const operatorSymbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };

function updateDisplay() {
  currentEl.textContent = currentValue;
  historyEl.textContent =
    previousValue !== null && operator
      ? `${previousValue} ${operatorSymbols[operator]}`
      : '';
}

async function requestCalculation(num1, num2, op) {
  const response = await fetch('/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ num1, num2, operator: op }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Calculation failed');
  }
  return data.result;
}

function appendNumber(num) {
  if (shouldResetDisplay || currentValue === 'Error') {
    currentValue = num;
    shouldResetDisplay = false;
  } else {
    currentValue = currentValue === '0' ? num : currentValue + num;
  }
  updateDisplay();
}

function appendDecimal() {
  if (shouldResetDisplay || currentValue === 'Error') {
    currentValue = '0.';
    shouldResetDisplay = false;
  } else if (!currentValue.includes('.')) {
    currentValue += '.';
  }
  updateDisplay();
}

async function chooseOperator(op) {
  if (currentValue === 'Error') return;
  if (operator !== null && !shouldResetDisplay) {
    await calculate();
    if (currentValue === 'Error') return;
  }
  previousValue = currentValue;
  operator = op;
  shouldResetDisplay = true;
  updateDisplay();
}

async function calculate() {
  if (operator === null || previousValue === null) return;

  try {
    currentValue = await requestCalculation(previousValue, currentValue, operator);
  } catch {
    currentValue = 'Error';
  }

  previousValue = null;
  operator = null;
  shouldResetDisplay = true;
  updateDisplay();
}

function clearAll() {
  currentValue = '0';
  previousValue = null;
  operator = null;
  shouldResetDisplay = false;
  updateDisplay();
}

function deleteLast() {
  if (shouldResetDisplay || currentValue === 'Error') {
    clearAll();
    return;
  }
  currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : '0';
  updateDisplay();
}

async function applyPercent() {
  if (currentValue === 'Error') return;
  try {
    currentValue = await requestCalculation(currentValue, 100, '/');
  } catch {
    currentValue = 'Error';
  }
  updateDisplay();
}

buttons.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  if (btn.dataset.number) appendNumber(btn.dataset.number);
  if (btn.dataset.operator) chooseOperator(btn.dataset.operator);

  switch (btn.dataset.action) {
    case 'decimal': appendDecimal(); break;
    case 'equals': calculate(); break;
    case 'clear': clearAll(); break;
    case 'delete': deleteLast(); break;
    case 'percent': applyPercent(); break;
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') appendNumber(e.key);
  else if (e.key === '.') appendDecimal();
  else if (['+', '-', '*', '/'].includes(e.key)) chooseOperator(e.key);
  else if (e.key === 'Enter' || e.key === '=') {
    e.preventDefault();
    calculate();
  } else if (e.key === 'Backspace') deleteLast();
  else if (e.key === 'Escape') clearAll();
  else if (e.key === '%') applyPercent();
});