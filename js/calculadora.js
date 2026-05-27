let display = document.getElementById('display');
let operation = document.getElementById('operation');
let currentInput = '';
let operationString = '';

function appendToDisplay(value) {
    if (value === 'pi') {
        operationString += 'π';
    } else if (value === 'e') {
        operationString += 'e';
    } else {
        operationString += value;
    }
    operation.textContent = operationString;
    updateDisplay();
}

function updateDisplay() {
    try {
        let result = math.evaluate(operationString.replace('π', Math.PI.toString()).replace('e', Math.E.toString()));
        display.textContent = result;
    } catch (e) {
        display.textContent = '0';
    }
}

function calculateFunction(func) {
    operationString += func + '(';
    operation.textContent = operationString;
}

function clearDisplay() {
    display.textContent = '0';
    operation.textContent = '';
    operationString = '';
}

function backspace() {
    operationString = operationString.slice(0, -1);
    operation.textContent = operationString;
    updateDisplay();
}

function calculate() {
    try {
        let result = math.evaluate(operationString.replace('π', Math.PI.toString()).replace('e', Math.E.toString()));
        operationString += ' = ' + result;
        operation.textContent = operationString;
        display.textContent = result;
    } catch (e) {
        display.textContent = 'Error';
        operation.textContent = operationString + ' = Error';
    }
}
