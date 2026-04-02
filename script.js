// State variables
let activeTab = 'calc';
let regime = 'composto';
let calculando = 'FV';
let pv = 1000;
let fv = 1200;
let i = 5;
let n = 12;
let isCalculating = false;

// DOM elements
const calcTab = document.getElementById('calc-tab');
const formulasTab = document.getElementById('formulas-tab');
const calcSection = document.getElementById('calc-section');
const formulasSection = document.getElementById('formulas-section');

const simplesBtn = document.getElementById('simples-btn');
const compostoBtn = document.getElementById('composto-btn');

const fvBtn = document.getElementById('FV-btn');
const pvBtn = document.getElementById('PV-btn');
const iBtn = document.getElementById('i-btn');
const nBtn = document.getElementById('n-btn');

const pvInput = document.getElementById('pv');
const fvInput = document.getElementById('fv');
const iInput = document.getElementById('i');
const nInput = document.getElementById('n');

const pvGroup = document.getElementById('pv-input');
const fvGroup = document.getElementById('fv-input');
const iGroup = document.getElementById('i-input');
const nGroup = document.getElementById('n-input');

const resultLabel = document.getElementById('result-label');
const resultValue = document.getElementById('result-value');
const insightText = document.getElementById('insight-text');

// Utility functions
function formatCurrency(val) {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(val);
}

function showError(input, message) {
    input.classList.add('error');
    const errorElement = input.parentElement.querySelector('.error-message') || document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    if (!input.parentElement.querySelector('.error-message')) {
        input.parentElement.appendChild(errorElement);
    }
    setTimeout(() => {
        input.classList.remove('error');
        errorElement.remove();
    }, 3000);
}

function clearErrors() {
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.error-message').forEach(el => el.remove());
}

function validateInputs() {
    clearErrors();
    let isValid = true;

    // Check for negative values
    if (parseFloat(pv) < 0) {
        showError(pvInput, 'Valor deve ser positivo');
        isValid = false;
    }
    if (parseFloat(fv) < 0) {
        showError(fvInput, 'Valor deve ser positivo');
        isValid = false;
    }
    if (parseFloat(i) < 0) {
        showError(iInput, 'Taxa deve ser positiva');
        isValid = false;
    }
    if (parseFloat(n) <= 0) {
        showError(nInput, 'Período deve ser maior que zero');
        isValid = false;
    }

    // Check for division by zero scenarios
    if (calculando === 'i' && parseFloat(n) === 0) {
        showError(nInput, 'Período necessário para calcular taxa');
        isValid = false;
    }
    if (calculando === 'n' && parseFloat(i) === 0) {
        showError(iInput, 'Taxa necessária para calcular período');
        isValid = false;
    }

    return isValid;
}

function setLoading(loading) {
    isCalculating = loading;
    const calculateBtn = document.querySelector('.calculate-btn');
    if (calculateBtn) {
        calculateBtn.disabled = loading;
        if (loading) {
            calculateBtn.classList.add('loading');
        } else {
            calculateBtn.classList.remove('loading');
            calculateBtn.textContent = '📊 Calcular';
        }
    }

    // Add loading class to result card
    const resultCard = document.querySelector('.result-card');
    if (loading) {
        resultCard.classList.add('loading');
    } else {
        resultCard.classList.remove('loading');
    }
}

// Calculate result
function calculate() {
    if (isCalculating) return;

    if (!validateInputs()) {
        return;
    }

    setLoading(true);

    // Simulate calculation delay for better UX
    setTimeout(() => {
        const _pv = parseFloat(pv) || 0;
        const _fv = parseFloat(fv) || 0;
        const _i = (parseFloat(i) || 0) / 100;
        const _n = parseFloat(n) || 0;

        let resultado = 0;
        let label = "";
        let insight = "";

        try {
            if (regime === 'simples') {
                switch (calculando) {
                    case 'FV':
                        resultado = _pv * (1 + _i * _n);
                        label = "Montante Final (FV)";
                        insight = `Acumulação linear de ${formatCurrency(resultado - _pv)} em juros.`;
                        break;
                    case 'PV':
                        if (_i * _n === -1) throw new Error('Divisão por zero');
                        resultado = _fv / (1 + _i * _n);
                        label = "Capital Inicial (PV)";
                        insight = `Valor necessário hoje para atingir o objetivo em ${_n} meses.`;
                        break;
                    case 'i':
                        if (_n === 0) throw new Error('Período zero');
                        resultado = _n > 0 ? ((_fv / _pv) - 1) / _n * 100 : 0;
                        label = "Taxa de Juro (i)";
                        insight = `Rendimento de ${resultado.toFixed(2)}% por cada período unitário.`;
                        break;
                    case 'n':
                        if (_i === 0) throw new Error('Taxa zero');
                        resultado = _i > 0 ? ((_fv / _pv) - 1) / _i : 0;
                        label = "Período (n)";
                        const roundN = Math.round(resultado);
                        insight = resultado > 0
                            ? `Aproximadamente ${roundN} meses.`
                            : "Dados insuficientes.";
                        break;
                }
            } else {
                switch (calculando) {
                    case 'FV':
                        resultado = _pv * Math.pow(1 + _i, _n);
                        label = "Montante Final (FV)";
                        const profit = resultado - _pv;
                        insight = `Lucro de ${(profit / _pv * 100).toFixed(1)}% sobre o capital inicial.`;
                        break;
                    case 'PV':
                        if (Math.pow(1 + _i, _n) === 0) throw new Error('Divisão por zero');
                        resultado = _fv / Math.pow(1 + _i, _n);
                        label = "Capital Inicial (PV)";
                        insight = `Desconto composto aplicado sobre o valor futuro.`;
                        break;
                    case 'i':
                        if (_n === 0) throw new Error('Período zero');
                        if (_fv / _pv <= 0) throw new Error('Valores inválidos para cálculo');
                        resultado = _n > 0 ? (Math.pow(_fv / _pv, 1 / _n) - 1) * 100 : 0;
                        label = "Taxa de Juro (i)";
                        insight = `Taxa efetiva considerando o efeito de juros sobre juros.`;
                        break;
                    case 'n':
                        if (_i === 0 || _fv / _pv <= 0) throw new Error('Valores inválidos');
                        resultado = (_i > 0 && (_fv / _pv) > 0) ? Math.log(_fv / _pv) / Math.log(1 + _i) : 0;
                        label = "Período (n)";
                        insight = resultado > 0
                            ? `Tende para ${Math.round(resultado)} meses.`
                            : "Impossível calcular.";
                        break;
                }
            }

            // Check for invalid results
            if (!isFinite(resultado) || isNaN(resultado)) {
                throw new Error('Resultado inválido');
            }

            resultLabel.textContent = label;
            if (calculando === 'i' || calculando === 'n') {
                resultValue.textContent = resultado.toFixed(2) + (calculando === 'i' ? '%' : '');
            } else {
                resultValue.textContent = formatCurrency(resultado);
            }

            // Add update animation
            resultValue.classList.add('update');
            setTimeout(() => resultValue.classList.remove('update'), 800);

            insightText.textContent = insight;

        } catch (error) {
            resultLabel.textContent = "Erro no Cálculo";
            resultValue.textContent = "--";
            insightText.textContent = `Erro: ${error.message}. Verifique os valores inseridos.`;
            resultValue.classList.add('error');
            setTimeout(() => resultValue.classList.remove('error'), 3000);
        }

        setLoading(false);
    }, 300); // Small delay for better UX
}

// Auto-calculate on input change with debouncing
let calculationTimeout;
function debounceCalculate() {
    clearTimeout(calculationTimeout);
    calculationTimeout = setTimeout(calculate, 500);
}

// Event listeners
calcTab.addEventListener('click', () => {
    activeTab = 'calc';
    calcTab.classList.add('active');
    formulasTab.classList.remove('active');
    calcSection.classList.add('active');
    formulasSection.classList.remove('active');
});

formulasTab.addEventListener('click', () => {
    activeTab = 'formulas';
    formulasTab.classList.add('active');
    calcTab.classList.remove('active');
    formulasSection.classList.add('active');
    calcSection.classList.remove('active');
});

simplesBtn.addEventListener('click', () => {
    regime = 'simples';
    simplesBtn.classList.add('active');
    compostoBtn.classList.remove('active');
    calculate();
});

compostoBtn.addEventListener('click', () => {
    regime = 'composto';
    compostoBtn.classList.add('active');
    simplesBtn.classList.remove('active');
    calculate();
});

fvBtn.addEventListener('click', () => {
    calculando = 'FV';
    fvBtn.classList.add('active');
    pvBtn.classList.remove('active');
    iBtn.classList.remove('active');
    nBtn.classList.remove('active');
    updateInputs();
    calculate();
});

pvBtn.addEventListener('click', () => {
    calculando = 'PV';
    pvBtn.classList.add('active');
    fvBtn.classList.remove('active');
    iBtn.classList.remove('active');
    nBtn.classList.remove('active');
    updateInputs();
    calculate();
});

iBtn.addEventListener('click', () => {
    calculando = 'i';
    iBtn.classList.add('active');
    fvBtn.classList.remove('active');
    pvBtn.classList.remove('active');
    nBtn.classList.remove('active');
    updateInputs();
    calculate();
});

nBtn.addEventListener('click', () => {
    calculando = 'n';
    nBtn.classList.add('active');
    fvBtn.classList.remove('active');
    pvBtn.classList.remove('active');
    iBtn.classList.remove('active');
    updateInputs();
    calculate();
});

pvInput.addEventListener('input', (e) => {
    pv = e.target.value;
    debounceCalculate();
});

fvInput.addEventListener('input', (e) => {
    fv = e.target.value;
    debounceCalculate();
});

iInput.addEventListener('input', (e) => {
    i = e.target.value;
    debounceCalculate();
});

nInput.addEventListener('input', (e) => {
    n = e.target.value;
    debounceCalculate();
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    // Tab navigation between sections
    if (e.key === 'Tab' && e.ctrlKey) {
        e.preventDefault();
        if (activeTab === 'calc') {
            formulasTab.click();
        } else {
            calcTab.click();
        }
    }

    // Enter to calculate
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        calculate();
    }

    // Number keys for quick target selection
    if (e.target.tagName !== 'INPUT') {
        switch (e.key) {
            case '1':
                fvBtn.click();
                break;
            case '2':
                pvBtn.click();
                break;
            case '3':
                iBtn.click();
                break;
            case '4':
                nBtn.click();
                break;
            case 's':
            case 'S':
                simplesBtn.click();
                break;
            case 'c':
            case 'C':
                compostoBtn.click();
                break;
        }
    }
});

// Tooltips
function createTooltip(element, text) {
    element.setAttribute('title', text);
    element.setAttribute('aria-label', text);
}

// Add tooltips to buttons
createTooltip(fvBtn, 'Calcular Montante Final (FV) - Pressione 1');
createTooltip(pvBtn, 'Calcular Capital Inicial (PV) - Pressione 2');
createTooltip(iBtn, 'Calcular Taxa de Juros (i) - Pressione 3');
createTooltip(nBtn, 'Calcular Período (n) - Pressione 4');
createTooltip(simplesBtn, 'Juros Simples - Pressione S');
createTooltip(compostoBtn, 'Juros Compostos - Pressione C');
createTooltip(calcTab, 'Calculadora - Ctrl+Tab para alternar');
createTooltip(formulasTab, 'Fórmulas - Ctrl+Tab para alternar');

function updateInputs() {
    // Show/hide input fields based on what's being calculated
    const inputs = [pvGroup, fvGroup, iGroup, nGroup];
    const inputIds = ['pv-input', 'fv-input', 'i-input', 'n-input'];

    // Reset all inputs to visible
    inputs.forEach(group => group.style.display = 'block');

    // Hide the input that's being calculated
    switch (calculando) {
        case 'FV':
            fvGroup.style.display = 'none';
            break;
        case 'PV':
            pvGroup.style.display = 'none';
            break;
        case 'i':
            iGroup.style.display = 'none';
            break;
        case 'n':
            nGroup.style.display = 'none';
            break;
    }

    // Update result label
    const labels = {
        'FV': 'Montante Final (FV)',
        'PV': 'Capital Inicial (PV)',
        'i': 'Taxa de Juro (i)',
        'n': 'Período (n)'
    };
    resultLabel.textContent = labels[calculando] || 'Resultado';
}

// Initialize controls and run initial calculation
updateInputs();
calculate();