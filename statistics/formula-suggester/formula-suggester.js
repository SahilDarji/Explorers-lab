import {
    calculateCorrelationRawScores,
    calculateCorrelationMeanDeviation,
    calculateCorrelationCovariance,
    formatNumber,
    getCorrelationInterpretation
} from '../../../shared/js/utils.js';

// Define the structure of all possible formulas and their requirements
const ALL_FORMULAS = [
    {
        id: 'rawScore',
        name: 'Raw Score Method',
        latex: `r = \\frac{n\\sum xy - (\\sum x)(\\sum y)}{\\sqrt{[n\\sum x^2 - (\\sum x)^2][n\\sum y^2 - (\\sum y)^2]}}`,
        requiredInputs: ['val-n', 'val-sumXY', 'val-sumX', 'val-sumY', 'val-sumX2', 'val-sumY2'],
        calculator: 'calculateRawScoreFromSums'
    },
    {
        id: 'meanDeviation',
        name: 'Mean-Deviation Method',
        latex: `r = \\frac{\\sum (x - \\bar{x})(y - \\bar{y})}{\\sqrt{\\sum (x - \\bar{x})^2 \\cdot \\sum (y - \\bar{y})^2}}`,
        requiredInputs: ['val-sumProdDev', 'val-sumXDevSq', 'val-sumYDevSq'],
        calculator: 'calculateMeanDeviationFromSums'
    },
    {
        id: 'covarianceBased',
        name: 'Covariance-Based Method',
        latex: `r = \\frac{\\text{Cov}(x, y)}{s_x \\cdot s_y}`,
        requiredInputs: ['val-covXY', 'val-sdX', 'val-sdY'],
        calculator: 'calculateCovarianceBasedFromSums'
    },
    {
        id: 'meanDeviationNormalized',
        name: 'Mean-Deviation Normalized Method',
        latex: `r = \\frac{\\sum (x - \\bar{x})(y - \\bar{y})}{n \\cdot s_x \\cdot s_y}`,
        requiredInputs: ['val-sumProdDev', 'val-n', 'val-sdX', 'val-sdY'],
        calculator: 'calculateMeanDeviationNormalizedFromSums'
    },
    {
        id: 'meanProductForm',
        name: 'Mean Product Form',
        latex: `r = \\frac{\\sum xy - n \\cdot \\bar{x} \\cdot \\bar{y}}{n \\cdot s_x \\cdot s_y}`,
        requiredInputs: ['val-sumXY', 'val-n', 'val-meanX', 'val-meanY', 'val-sdX', 'val-sdY'],
        calculator: 'calculateMeanProductFormFromSums'
    }
    // { // Example for sX2, sY2 if a formula needed them directly
    //     id: 'varianceBasedAlternative',
    //     name: 'Variance-Based (Alternative)',
    //     latex: `r = \\frac{\\text{Cov}(x, y)}{\\sqrt{s_x^2 \\cdot s_y^2}}`,
    //     requiredInputs: ['val-covXY', 'val-varX', 'val-varY'] // Using varX, varY IDs from HTML
    // }
];

const ID_TO_KEY_MAP = { 
    'val-n': 'n',
    'val-sumX': 'sumX',
    'val-sumY': 'sumY',
    'val-sumX2': 'sumX2',
    'val-sumY2': 'sumY2',
    'val-sumXY': 'sumXY',
    'val-meanX': 'meanX',
    'val-meanY': 'meanY',
    'val-sdX': 'sdX',
    'val-sdY': 'sdY',
    'val-varX': 'varX',
    'val-varY': 'varY',
    'val-covXY': 'covXY',
    'val-sumXDevSq': 'sumXDevSq',
    'val-sumYDevSq': 'sumYDevSq',
    'val-sumProdDev': 'sumProdDev'
};

export class FormulaSuggester {
    constructor() {
        console.log('FormulaSuggester class instantiated');
        this.formulas = ALL_FORMULAS;
        this.inputContainer = document.getElementById('formulaInputs');
        this.availableFormulasContainer = document.getElementById('availableFormulasContainer');
        this.calculationStepsContainer = document.getElementById('calculationStepsContainer');

        if (!this.inputContainer || !this.availableFormulasContainer || !this.calculationStepsContainer) {
            console.error('Required DOM elements for FormulaSuggester not found.');
            return;
        }

        this.inputElements = Array.from(this.inputContainer.querySelectorAll('input[type="number"]'));
        this.initializeEventListeners();
        
        // Update the initial message with better styling
        this.calculationStepsContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center p-6 text-center bg-blue-50 rounded-lg border border-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-blue-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p class="text-blue-700 font-medium text-lg">Select a formula to see calculation steps</p>
                <p class="text-gray-600 mt-2">Enter your values and click on any available formula card to calculate</p>
            </div>
        `;
        
        this.updateSuggestedFormulas(); // Initial update
    }

    initializeEventListeners() {
        this.inputElements.forEach(input => {
            input.addEventListener('input', () => {
                this.updateSuggestedFormulas();
                // Clear steps if inputs change after a calculation was shown - replace with better message
                this.calculationStepsContainer.innerHTML = `
                    <div class="flex flex-col items-center justify-center p-6 text-center bg-blue-50 rounded-lg border border-blue-100">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-blue-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <p class="text-blue-700 font-medium text-lg">Values updated!</p>
                        <p class="text-gray-600 mt-2">Click on an available formula to see new calculation steps</p>
                    </div>
                `;
            });
        });
    }

    getProvidedInputDetails() {
        const providedValues = {};
        const providedInputIds = new Set();
        let anyInputTouched = false;

        this.inputElements.forEach(input => {
            const valueStr = input.value.trim();
            if (valueStr !== '') {
                anyInputTouched = true;
                const parsedValue = parseFloat(valueStr);
                if (!isNaN(parsedValue)) {
                    const key = ID_TO_KEY_MAP[input.id];
                    if (key) providedValues[key] = parsedValue;
                    providedInputIds.add(input.id);
                }
            }
        });
        return { providedInputIds, anyInputTouched, providedValues };
    }

    updateSuggestedFormulas() {
        const { providedInputIds, anyInputTouched } = this.getProvidedInputDetails();
        
        let formulasToConsider;
        if (!anyInputTouched || providedInputIds.size === 0) {
            // INITIAL STATE or inputs touched but no valid numbers yet: show all formulas.
            formulasToConsider = [...this.formulas];
        } else {
            // Valid numeric inputs exist. Filter: a formula is a candidate if AT LEAST ONE of its required inputs is among the providedInputIds.
            formulasToConsider = this.formulas.filter(formula => {
                return formula.requiredInputs.some(reqId => providedInputIds.has(reqId));
            });
        }
        this.displayFormulas(formulasToConsider, anyInputTouched, providedInputIds);
    }

    mjxWrapper(latex) {
        return `<div class="math-display my-3 p-3 border border-gray-200 rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition-all duration-300" style="overflow-x: auto;">$$${latex}$$</div>`;
    }

    displayFormulas(formulasToDisplay, anyInputTouched, providedInputIds) {
        this.availableFormulasContainer.innerHTML = ''; 

        if (formulasToDisplay.length === 0 && anyInputTouched && providedInputIds.size > 0) {
            this.availableFormulasContainer.innerHTML = '<p class="text-gray-500 p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">No formulas match the combination of inputs provided. Try adjusting your values.</p>';
            return;
        } else if (formulasToDisplay.length === 0 && this.formulas.length > 0) { // Fallback if all formulas were filtered out, or initially empty
             this.availableFormulasContainer.innerHTML = '<p class="text-gray-500 p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">Please enter valid numbers in the input fields to see relevant formulas.</p>';
             return;
        } else if (this.formulas.length === 0) { // No formulas defined at all
            this.availableFormulasContainer.innerHTML = '<p class="text-gray-500 p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">No formulas available to display.</p>';
            return;
        }

        formulasToDisplay.forEach(formula => {
            const formulaCard = document.createElement('div');
            // Check if ALL required inputs for THIS specific formula are currently provided with valid numbers
            const allSpecificInputsProvided = formula.requiredInputs.every(reqId => providedInputIds.has(reqId));
            
            let cardClasses = 'formula-card p-5 border rounded-xl shadow-sm transition-all duration-300 mb-5 ';
            let nameClasses = 'text-lg font-semibold mb-3 ';
            let hintText = '';
            let isClickable = false;

            // Determine styling and clickability
            if (allSpecificInputsProvided) { // Fully calculable
                cardClasses += 'border-blue-400 hover:shadow-lg cursor-pointer bg-gradient-to-br from-white to-blue-50 hover:scale-101';
                nameClasses += 'text-blue-700';
                isClickable = true;
            } else if (!anyInputTouched || (anyInputTouched && providedInputIds.size === 0)) { 
                // Initial state (nothing touched) OR touched but no valid numbers yet - show all as templates
                cardClasses += 'border-gray-300 bg-white opacity-85'; 
                nameClasses += 'text-gray-600';
                hintText = 'Enter all required values to enable calculation.';
            } else { 
                // Some valid inputs provided, but not enough for THIS formula
                cardClasses += 'border-gray-300 bg-gray-50 opacity-75'; 
                nameClasses += 'text-gray-500';
                const missingForThis = formula.requiredInputs.filter(reqId => !providedInputIds.has(reqId));
                if (missingForThis.length > 0) {
                    hintText = `Requires: ${missingForThis.map(id => (document.querySelector(`label[for="${id}"]`)?.textContent?.split(' (')[0] || id.replace('val-',''))).join(', ')}`;
                }
            }
            
            formulaCard.className = cardClasses;
            formulaCard.dataset.formulaId = formula.id;
            if(isClickable) {
                formulaCard.addEventListener('click', () => this.handleFormulaSelection(formula.id));
                
                // Add pulsing effect to clickable cards
                const pulseEffect = document.createElement('div');
                pulseEffect.className = 'absolute inset-0 rounded-xl bg-blue-300 opacity-0';
                pulseEffect.style.animation = 'pulse-light 2s infinite';
                formulaCard.style.position = 'relative';
                formulaCard.style.overflow = 'hidden';
                
                // Add CSS animation
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes pulse-light {
                        0% { opacity: 0; }
                        50% { opacity: 0.1; }
                        100% { opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
                
                formulaCard.appendChild(pulseEffect);
            }

            const nameEl = document.createElement('h3');
            nameEl.className = nameClasses;
            nameEl.textContent = formula.name;
            formulaCard.appendChild(nameEl);

            const latexContainer = document.createElement('div');
            latexContainer.innerHTML = this.mjxWrapper(formula.latex);
            formulaCard.appendChild(latexContainer);
            
            if (hintText) {
                const hintEl = document.createElement('p');
                hintEl.className = 'text-xs text-gray-500 mt-2 italic';
                hintEl.textContent = hintText;
                formulaCard.appendChild(hintEl);
            }
            
            // Add an icon for clickable cards
            if (isClickable) {
                const iconContainer = document.createElement('div');
                iconContainer.className = 'flex justify-end mt-2';
                const icon = document.createElement('span');
                icon.className = 'text-blue-500 text-sm font-medium flex items-center';
                icon.innerHTML = 'Calculate <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>';
                iconContainer.appendChild(icon);
                formulaCard.appendChild(iconContainer);
            }

            this.availableFormulasContainer.appendChild(formulaCard);
        });

        if (window.MathJax) {
            if (typeof window.MathJax.typesetPromise === 'function') {
                window.MathJax.typesetPromise([this.availableFormulasContainer])
                    .catch(err => console.error("MathJax typesetPromise error on list:", err));
            } else if (typeof window.MathJax.typeset === 'function') {
                try { window.MathJax.typeset([this.availableFormulasContainer]); } 
                catch (err) { console.error("MathJax typeset error on list:", err); }
            }
        }
    }

    handleFormulaSelection(formulaId) {
        const formulaConfig = this.formulas.find(f => f.id === formulaId);
        if (!formulaConfig) {
            this.calculationStepsContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center p-6 text-center bg-red-50 rounded-lg border border-red-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-red-700 font-medium text-lg">Error: Formula details not found</p>
                    <p class="text-gray-600 mt-2">Please try selecting a different formula</p>
                </div>
            `;
            return;
        }

        const { providedValues } = this.getProvidedInputDetails();

        const missingOrInvalidForThisFormula = formulaConfig.requiredInputs.filter(reqId => {
            const key = ID_TO_KEY_MAP[reqId];
            return providedValues[key] === undefined || isNaN(providedValues[key]);
        });

        if (missingOrInvalidForThisFormula.length > 0) {
            const missingLabels = missingOrInvalidForThisFormula
                .map(reqId => (document.querySelector(`label[for="${reqId}"]`)?.textContent?.split(' (')[0] || reqId.replace('val-','')))
                .join(', ');
            this.calculationStepsContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center p-6 text-center bg-orange-50 rounded-lg border border-orange-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-orange-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p class="text-orange-700 font-medium text-lg">Missing Required Values</p>
                    <p class="text-gray-700 mt-2">To calculate with <strong>${formulaConfig.name}</strong>, please provide values for:</p>
                    <p class="font-semibold text-orange-800 mt-1">${missingLabels}</p>
                </div>
            `;
            return;
        }

        console.log(`Calculating with ${formulaConfig.name} using values:`, providedValues);
        
        let result = { r: NaN, stepsHtml: `
            <div class="flex flex-col items-center justify-center p-6 text-center bg-red-50 rounded-lg border border-red-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-red-700 font-medium text-lg">Calculation function not implemented</p>
                <p class="text-gray-600 mt-2">The calculator for this formula has not been implemented yet</p>
            </div>
        ` };

        if (typeof this[formulaConfig.calculator] === 'function') {
            result = this[formulaConfig.calculator](providedValues, formulaConfig);
        } else {
            console.error(`Calculator function ${formulaConfig.calculator} not found.`);
            result.stepsHtml = `
                <div class="flex flex-col items-center justify-center p-6 text-center bg-red-50 rounded-lg border border-red-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-red-700 font-medium text-lg">Internal Error</p>
                    <p class="text-gray-600 mt-2">Calculator for ${formulaConfig.name} is missing or not properly implemented</p>
                </div>
            `;
        }

        this.calculationStepsContainer.innerHTML = result.stepsHtml;
        if (window.MathJax) {
            if (typeof window.MathJax.typesetPromise === 'function') {
                window.MathJax.typesetPromise([this.calculationStepsContainer])
                    .catch(err => console.error("MathJax typesetPromise error on steps:", err));
            } else if (typeof window.MathJax.typeset === 'function') {
                try { window.MathJax.typeset([this.calculationStepsContainer]); } 
                catch (err) { console.error("MathJax typeset error on steps:", err); }
            }
        }
    }

    mjx(latex) {
        return `<div class="math-display my-3" style="overflow-x: auto;">$$ ${latex} $$</div>`;
    }

    calculateRawScoreFromSums(values, config) {
        const { n, sumX, sumY, sumX2, sumY2, sumXY } = values;
        if ([n, sumX, sumY, sumX2, sumY2, sumXY].some(v => v === undefined || isNaN(v))) {
            return { r: NaN, stepsHtml: '<p class="text-red-500 p-4 bg-red-50 rounded-lg border border-red-200">Internal error: Missing values for Raw Score calculation despite pre-check.</p>' };
        }

        let r = NaN;
        let stepsHTML = `<div class="bg-white p-5 rounded-xl shadow-md border border-gray-200">
                          <h3 class="text-xl font-bold text-blue-800 mb-4 pb-2 border-b">Step-by-Step: ${config.name}</h3>`;
        
        stepsHTML += `<h4 class="text-lg font-semibold text-gray-700 mt-4">1. Formula:</h4>${this.mjx(config.latex)}`;
        
        stepsHTML += `<h4 class="text-lg font-semibold text-gray-700 mt-4">2. Provided Values:</h4>
                     <ul class="list-disc pl-6 space-y-1 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100">
                     <li>n = ${formatNumber(n)}</li>
                     <li>\\sum x = ${formatNumber(sumX)}</li>
                     <li>\\sum y = ${formatNumber(sumY)}</li>
                     <li>\\sum x² = ${formatNumber(sumX2)}</li>
                     <li>\\sum y² = ${formatNumber(sumY2)}</li>
                     <li>\\sum xy = ${formatNumber(sumXY)}</li></ul>`;

        stepsHTML += `<h4 class="text-lg font-semibold text-gray-700 mt-4">3. Substituting Values &amp; Simplification:</h4>
                     <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">`;
        stepsHTML += this.mjx(`r = \\frac{${n} \\cdot ${formatNumber(sumXY)} - (${formatNumber(sumX)})(${formatNumber(sumY)})}{\\sqrt{[${n} \\cdot ${formatNumber(sumX2)} - (${formatNumber(sumX)})^2][${n} \\cdot ${formatNumber(sumY2)} - (${formatNumber(sumY)})^2]}}`);

        const n_sumXY = n * sumXY;
        const sumX_sumY = sumX * sumY;
        const numerator_calc = n_sumXY - sumX_sumY;
        stepsHTML += this.mjx(`r = \\frac{${formatNumber(n_sumXY)} - ${formatNumber(sumX_sumY)}}{\\sqrt{[${n} \\cdot ${formatNumber(sumX2)} - (${formatNumber(sumX)})^2][${n} \\cdot ${formatNumber(sumY2)} - (${formatNumber(sumY)})^2]}}`);
        stepsHTML += this.mjx(`r = \\frac{${formatNumber(numerator_calc)}}{\\sqrt{[${n} \\cdot ${formatNumber(sumX2)} - (${formatNumber(sumX)})^2][${n} \\cdot ${formatNumber(sumY2)} - (${formatNumber(sumY)})^2]}}`);

        const n_sumX2 = n * sumX2;
        const sumX_sq = sumX * sumX;
        const den_partX_calc = n_sumX2 - sumX_sq;
        stepsHTML += this.mjx(`r = \\frac{${formatNumber(numerator_calc)}}{\\sqrt{[${formatNumber(n_sumX2)} - ${formatNumber(sumX_sq)}][${n} \\cdot ${formatNumber(sumY2)} - (${formatNumber(sumY)})^2]}}`);
        stepsHTML += this.mjx(`r = \\frac{${formatNumber(numerator_calc)}}{\\sqrt{${formatNumber(den_partX_calc)}[${n} \\cdot ${formatNumber(sumY2)} - (${formatNumber(sumY)})^2]}}`);

        const n_sumY2 = n * sumY2;
        const sumY_sq = sumY * sumY;
        const den_partY_calc = n_sumY2 - sumY_sq;
        stepsHTML += this.mjx(`r = \\frac{${formatNumber(numerator_calc)}}{\\sqrt{${formatNumber(den_partX_calc)}[${formatNumber(n_sumY2)} - ${formatNumber(sumY_sq)}]}}`);
        stepsHTML += this.mjx(`r = \\frac{${formatNumber(numerator_calc)}}{\\sqrt{${formatNumber(den_partX_calc)} \\cdot ${formatNumber(den_partY_calc)}}}`);

        if (den_partX_calc < 0 || den_partY_calc < 0) {
            stepsHTML += `<p class="text-red-600 font-semibold mt-2 p-2 bg-red-50 rounded">Error: Calculation involves square root of a negative value for one of the denominator parts (${formatNumber(den_partX_calc)} or ${formatNumber(den_partY_calc)}).</p>`;
            r = NaN;
        } else {
            const den_product = den_partX_calc * den_partY_calc;
            stepsHTML += this.mjx(`r = \\frac{${formatNumber(numerator_calc)}}{\\sqrt{${formatNumber(den_product)}}}`);

            if (den_product < 0) { // Should be caught by previous check, but for safety
                 stepsHTML += `<p class="text-red-600 font-semibold mt-2 p-2 bg-red-50 rounded">Error: Product under square root is negative (${formatNumber(den_product)}).</p>`;
                 r = NaN;
            } else {
                const denominator_final = Math.sqrt(den_product);
                stepsHTML += this.mjx(`r = \\frac{${formatNumber(numerator_calc)}}{${formatNumber(denominator_final)}}`);
                
                if (denominator_final === 0) {
                    stepsHTML += `<p class="text-red-600 font-semibold mt-2 p-2 bg-red-50 rounded">Error: Denominator is zero. Correlation is undefined.</p>`;
                    r = (numerator_calc === 0) ? NaN : (numerator_calc > 0 ? Infinity : -Infinity); 
                } else {
                    r = numerator_calc / denominator_final;
                    stepsHTML += this.mjx(`r = ${formatNumber(r)}`);
                }
            }
        }
        stepsHTML += `</div>`; // Close the bg-blue-50 div for calculations
        
        stepsHTML += `<h4 class="text-lg font-semibold text-gray-700 mt-5">Result:</h4>
                     <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                         <p class="text-lg">The Pearson's r is <strong class="text-blue-700 text-xl">${formatNumber(r)}</strong></p>
                         <p class="mt-1 text-gray-700">${getCorrelationInterpretation(r)}</p>
                     </div>
                    </div>`; // Close the main container div
        
        return { r, stepsHtml: stepsHTML };
    }

    calculateMeanDeviationFromSums(values, config) {
        const { sumProdDev, sumXDevSq, sumYDevSq } = values;
        if ([sumProdDev, sumXDevSq, sumYDevSq].some(v => v === undefined || isNaN(v))) {
            return { r: NaN, stepsHtml: '<p class="text-red-500 p-4 bg-red-50 rounded-lg border border-red-200">Internal error: Missing values for Mean Deviation calculation.</p>' };
        }

        let r = NaN;
        let stepsHTML = `<div class="bg-white p-5 rounded-xl shadow-md border border-gray-200">
                          <h3 class="text-xl font-bold text-blue-800 mb-4 pb-2 border-b">Step-by-Step: ${config.name}</h3>`;
        
        stepsHTML += `<h4 class="text-lg font-semibold text-gray-700 mt-4">1. Formula:</h4>${this.mjx(config.latex)}`;
        
        stepsHTML += `<h4 class="text-lg font-semibold text-gray-700 mt-4">2. Provided Values:</h4>
                     <ul class="list-disc pl-6 space-y-1 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100">
                     <li>\\sum (x-\\bar{x})(y-\\bar{y}) = ${formatNumber(sumProdDev)}</li>
                     <li>\\sum (x-\\bar{x})² = ${formatNumber(sumXDevSq)}</li>
                     <li>\\sum (y-\\bar{y})² = ${formatNumber(sumYDevSq)}</li></ul>`;
        
        stepsHTML += `<h4 class="text-lg font-semibold text-gray-700 mt-4">3. Substituting Values &amp; Simplification:</h4>
                     <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">`;
        stepsHTML += this.mjx(`r = \\frac{${formatNumber(sumProdDev)}}{\\sqrt{${formatNumber(sumXDevSq)} \\cdot ${formatNumber(sumYDevSq)}}}`);

        const numerator_calc = sumProdDev;
        // Numerator is already simple, so no extra step for it.

        if (sumXDevSq < 0 || sumYDevSq < 0) {
            stepsHTML += `<p class="text-red-600 font-semibold mt-2 p-2 bg-red-50 rounded">Error: Sum of squared deviations is negative (${formatNumber(sumXDevSq)} or ${formatNumber(sumYDevSq)}).</p>`;
            r = NaN;
        } else {
            const den_product = sumXDevSq * sumYDevSq;
            stepsHTML += this.mjx(`r = \\frac{${formatNumber(numerator_calc)}}{\\sqrt{${formatNumber(den_product)}}}`);

            if (den_product < 0) {
                stepsHTML += `<p class="text-red-600 font-semibold mt-2 p-2 bg-red-50 rounded">Error: Product under square root is negative (${formatNumber(den_product)}).</p>`;
                r = NaN;
            } else {
                const denominator_final = Math.sqrt(den_product);
                stepsHTML += this.mjx(`r = \\frac{${formatNumber(numerator_calc)}}{${formatNumber(denominator_final)}}`);
                
                if (denominator_final === 0) {
                    stepsHTML += `<p class="text-red-600 font-semibold mt-2 p-2 bg-red-50 rounded">Error: Denominator is zero. Correlation is undefined.</p>`;
                    r = (numerator_calc === 0) ? NaN : (numerator_calc > 0 ? Infinity : -Infinity);
                } else {
                    r = numerator_calc / denominator_final;
                    stepsHTML += this.mjx(`r = ${formatNumber(r)}`);
                }
            }
        }
        stepsHTML += `</div>`; // Close the bg-blue-50 div for calculations
        
        stepsHTML += `<h4 class="text-lg font-semibold text-gray-700 mt-5">Result:</h4>
                     <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                         <p class="text-lg">The Pearson's r is <strong class="text-blue-700 text-xl">${formatNumber(r)}</strong></p>
                         <p class="mt-1 text-gray-700">${getCorrelationInterpretation(r)}</p>
                     </div>
                    </div>`; // Close the main container div
        
        return { r, stepsHtml: stepsHTML };
    }
    
    calculateCovarianceBasedFromSums(values, config) {
        const { covXY, sdX, sdY } = values;
        if ([covXY, sdX, sdY].some(v => v === undefined || isNaN(v))) {
            return { r: NaN, stepsHtml: '<p class="text-red-500 p-4 bg-red-50 rounded-lg border border-red-200">Internal error: Missing values for Covariance method.</p>' };
        }

        let r = NaN;
        let stepsHTML = `<div class="bg-white p-5 rounded-xl shadow-md border border-gray-200">
                          <h3 class="text-xl font-bold text-blue-800 mb-4 pb-2 border-b">Step-by-Step: ${config.name}</h3>`;
        
        stepsHTML += `<h4 class="text-lg font-semibold text-gray-700 mt-4">1. Formula:</h4>${this.mjx(config.latex)}`;
        
        stepsHTML += `<h4 class="text-lg font-semibold text-gray-700 mt-4">2. Provided Values:</h4>
                     <ul class="list-disc pl-6 space-y-1 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100">
                     <li>\\text{Cov}(x,y) = ${formatNumber(covXY)}</li>
                     <li>s<sub>x</sub> = ${formatNumber(sdX)}</li>
                     <li>s<sub>y</sub> = ${formatNumber(sdY)}</li></ul>`;
        
        stepsHTML += `<h4 class="text-lg font-semibold text-gray-700 mt-4">3. Substituting Values &amp; Simplification:</h4>
                     <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">`;
        stepsHTML += this.mjx(`r = \\frac{${formatNumber(covXY)}}{${formatNumber(sdX)} \\cdot ${formatNumber(sdY)}}`);

        const numerator_calc = covXY;
        // Numerator is already simple

        const denominator_calc = sdX * sdY;
        stepsHTML += this.mjx(`r = \\frac{${formatNumber(numerator_calc)}}{${formatNumber(denominator_calc)}}`);

        if (denominator_calc === 0) {
            stepsHTML += `<p class="text-red-600 font-semibold mt-2 p-2 bg-red-50 rounded">Error: Denominator (s<sub>x</sub> \\cdot s<sub>y</sub>) is zero. Correlation is undefined.</p>`;
            r = (numerator_calc === 0) ? NaN : (numerator_calc > 0 ? Infinity : -Infinity);
        } else {
            r = numerator_calc / denominator_calc;
            stepsHTML += this.mjx(`r = ${formatNumber(r)}`);
        }
        stepsHTML += `</div>`; // Close the bg-blue-50 div for calculations
        
        stepsHTML += `<h4 class="text-lg font-semibold text-gray-700 mt-5">Result:</h4>
                     <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                         <p class="text-lg">The Pearson's r is <strong class="text-blue-700 text-xl">${formatNumber(r)}</strong></p>
                         <p class="mt-1 text-gray-700">${getCorrelationInterpretation(r)}</p>
                     </div>
                    </div>`; // Close the main container div
        
        return { r, stepsHtml: stepsHTML };
    }

    calculateMeanDeviationNormalizedFromSums(values, config) {
        const { sumProdDev, n, sdX, sdY } = values;
         if ([sumProdDev, n, sdX, sdY].some(v => v === undefined || isNaN(v))) {
            return { r: NaN, stepsHtml: '<p class="text-red-500 p-4 bg-red-50 rounded-lg border border-red-200">Internal error: Missing values for Mean Deviation Normalized method.</p>' };
        }

        let r = NaN;
        let stepsHTML = `<div class="bg-white p-5 rounded-xl shadow-md border border-gray-200">
                          <h3 class="text-xl font-bold text-blue-800 mb-4 pb-2 border-b">Step-by-Step: ${config.name}</h3>`;
        
        stepsHTML += `<h4 class="text-lg font-semibold text-gray-700 mt-4">1. Formula:</h4>${this.mjx(config.latex)}`;
        
        stepsHTML += `<h4 class="text-lg font-semibold text-gray-700 mt-4">2. Provided Values:</h4>
                     <ul class="list-disc pl-6 space-y-1 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100">
                     <li>\\sum (x-\\bar{x})(y-\\bar{y}) = ${formatNumber(sumProdDev)}</li>
                     <li>n = ${formatNumber(n)}</li>
                     <li>s<sub>x</sub> = ${formatNumber(sdX)}</li>
                     <li>s<sub>y</sub> = ${formatNumber(sdY)}</li></ul>`;

        stepsHTML += `<h4 class="text-lg font-semibold text-gray-700 mt-4">3. Substituting Values &amp; Simplification:</h4>
                     <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">`;
        stepsHTML += this.mjx(`r = \\frac{${formatNumber(sumProdDev)}}{${formatNumber(n)} \\cdot ${formatNumber(sdX)} \\cdot ${formatNumber(sdY)}}`);
        
        const numerator_calc = sumProdDev;
        // Numerator is simple

        const denominator_calc = n * sdX * sdY;
        stepsHTML += this.mjx(`r = \\frac{${formatNumber(numerator_calc)}}{${formatNumber(denominator_calc)}}`);

        if (denominator_calc === 0) {
            stepsHTML += `<p class="text-red-600 font-semibold mt-2 p-2 bg-red-50 rounded">Error: Denominator (n \\cdot s<sub>x</sub> \\cdot s<sub>y</sub>) is zero. Correlation is undefined.</p>`;
            r = (numerator_calc === 0) ? NaN : (numerator_calc > 0 ? Infinity : -Infinity);
        } else {
            r = numerator_calc / denominator_calc;
            stepsHTML += this.mjx(`r = ${formatNumber(r)}`);
        }
        stepsHTML += `</div>`; // Close the bg-blue-50 div for calculations
        
        stepsHTML += `<h4 class="text-lg font-semibold text-gray-700 mt-5">Result:</h4>
                     <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                         <p class="text-lg">The Pearson's r is <strong class="text-blue-700 text-xl">${formatNumber(r)}</strong></p>
                         <p class="mt-1 text-gray-700">${getCorrelationInterpretation(r)}</p>
                     </div>
                    </div>`; // Close the main container div
        
        return { r, stepsHtml: stepsHTML };
    }

    calculateMeanProductFormFromSums(values, config) {
        const { sumXY, n, meanX, meanY, sdX, sdY } = values;
        if ([sumXY, n, meanX, meanY, sdX, sdY].some(v => v === undefined || isNaN(v))) {
            return { r: NaN, stepsHtml: '<p class="text-red-500 p-4 bg-red-50 rounded-lg border border-red-200">Internal error: Missing values for Mean Product Form method.</p>' };
        }

        let r = NaN;
        let stepsHTML = `<div class="bg-white p-5 rounded-xl shadow-md border border-gray-200">
                          <h3 class="text-xl font-bold text-blue-800 mb-4 pb-2 border-b">Step-by-Step: ${config.name}</h3>`;
        
        stepsHTML += `<h4 class="text-lg font-semibold text-gray-700 mt-4">1. Formula:</h4>${this.mjx(config.latex)}`;
        
        stepsHTML += `<h4 class="text-lg font-semibold text-gray-700 mt-4">2. Provided Values:</h4>
                     <ul class="list-disc pl-6 space-y-1 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100">
                     <li>\\sum xy = ${formatNumber(sumXY)}</li>
                     <li>n = ${formatNumber(n)}</li>
                     <li>\\bar{x} = ${formatNumber(meanX)}</li>
                     <li>\\bar{y} = ${formatNumber(meanY)}</li>
                     <li>s<sub>x</sub> = ${formatNumber(sdX)}</li>
                     <li>s<sub>y</sub> = ${formatNumber(sdY)}</li></ul>`;
        
        stepsHTML += `<h4 class="text-lg font-semibold text-gray-700 mt-4">3. Substituting Values &amp; Simplification:</h4>
                     <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">`;
        stepsHTML += this.mjx(`r = \\frac{${formatNumber(sumXY)} - ${formatNumber(n)} \\cdot ${formatNumber(meanX)} \\cdot ${formatNumber(meanY)}}{${formatNumber(n)} \\cdot ${formatNumber(sdX)} \\cdot ${formatNumber(sdY)}}`);

        const num_part2_calc = n * meanX * meanY;
        const numerator_calc = sumXY - num_part2_calc;
        stepsHTML += this.mjx(`r = \\frac{${formatNumber(sumXY)} - ${formatNumber(num_part2_calc)}}{${formatNumber(n)} \\cdot ${formatNumber(sdX)} \\cdot ${formatNumber(sdY)}}`);
        stepsHTML += this.mjx(`r = \\frac{${formatNumber(numerator_calc)}}{${formatNumber(n)} \\cdot ${formatNumber(sdX)} \\cdot ${formatNumber(sdY)}}`);
        
        const denominator_calc = n * sdX * sdY;
        stepsHTML += this.mjx(`r = \\frac{${formatNumber(numerator_calc)}}{${formatNumber(denominator_calc)}}`);

        if (denominator_calc === 0) {
            stepsHTML += `<p class="text-red-600 font-semibold mt-2 p-2 bg-red-50 rounded">Error: Denominator (n \\cdot s<sub>x</sub> \\cdot s<sub>y</sub>) is zero. Correlation is undefined.</p>`;
            r = (numerator_calc === 0) ? NaN : (numerator_calc > 0 ? Infinity : -Infinity);
        } else {
            r = numerator_calc / denominator_calc;
            stepsHTML += this.mjx(`r = ${formatNumber(r)}`);
        }
        stepsHTML += `</div>`; // Close the bg-blue-50 div for calculations
        
        stepsHTML += `<h4 class="text-lg font-semibold text-gray-700 mt-5">Result:</h4>
                     <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                         <p class="text-lg">The Pearson's r is <strong class="text-blue-700 text-xl">${formatNumber(r)}</strong></p>
                         <p class="mt-1 text-gray-700">${getCorrelationInterpretation(r)}</p>
                     </div>
                    </div>`; // Close the main container div
        
        return { r, stepsHtml: stepsHTML };
    }
}

// Initialize the suggester when the DOM is loaded
// document.addEventListener('DOMContentLoaded', () => {
// new FormulaSuggester(); // This is already handled in shortsums.html
// });
