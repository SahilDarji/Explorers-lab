import {
    calculateMean,
    formatNumber,
    validateInputs
} from '../../shared/js/utils.js';

export class TimeSeriesCalculator {
    constructor() {
        this.chart = null;
        this.yValues = [];
        this.tValues = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const solveBtn = document.getElementById('solveBtn');
        if (solveBtn) {
            solveBtn.addEventListener('click', () => {
                this.solve();
            });
        }

        const addRowBtn = document.getElementById('addRowBtn');
        if (addRowBtn) {
            addRowBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addRow();
                const newRow = document.getElementById('dataTable').lastElementChild;
                if (newRow) {
                    const firstInput = newRow.querySelector('input[type="number"]');
                    if (firstInput) firstInput.focus();
                }
            });
        }

        const dataTableBody = document.getElementById('dataTable');
        if (dataTableBody) {
            dataTableBody.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type === 'number') {
                    e.preventDefault();
                    
                    const currentRow = e.target.closest('tr');
                    const allRows = Array.from(dataTableBody.querySelectorAll('tr'));
                    const isLastRow = allRows.indexOf(currentRow) === allRows.length - 1;

                    if (isLastRow || e.target.value.trim() !== '') {
                        this.addRow();
                        const newRowAdded = dataTableBody.lastElementChild;
                        if (newRowAdded) {
                            const firstInput = newRowAdded.querySelector('input[type="number"]');
                            if (firstInput) firstInput.focus();
                        }
                    }
                }
            });
        }
    }

    addRow() {
        const tbody = document.getElementById('dataTable');
        if (!tbody) {
            return;
        }
        const newRow = document.createElement('tr');
        
        let rowHTML = `
            <td class="px-4 py-2"><input type="number" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" step="any"></td>
        `;
        newRow.innerHTML = rowHTML;
        tbody.appendChild(newRow);
    }

    getInputData() {
        const dataTableBody = document.getElementById('dataTable');
        this.yValues = [];
        this.tValues = [];

        const rows = dataTableBody.querySelectorAll('tr');

        let t = 1;
        rows.forEach(row => {
            const input = row.querySelector('input[type="number"]');
            if (input) {
                const yVal = input.value.trim();
                if (yVal !== '') { 
                    const y = parseFloat(yVal);
                    if (!isNaN(y)) {
                        this.yValues.push(y);
                        this.tValues.push(t++);
                    }
                } 
            }
        });
        return { yValues: this.yValues, tValues: this.tValues };
    }

    solve() {
        try {
            this.getInputData();
            if (this.yValues.length < 2) {
                alert("Please enter at least 2 data points.");
                return;
            }

            const n = this.yValues.length;
            const sumT = this.tValues.reduce((a, b) => a + b, 0);
            const sumY = this.yValues.reduce((a, b) => a + b, 0);
            const sumT2 = this.tValues.reduce((s, v) => s + v * v, 0);
            const sumTY = this.tValues.reduce((s, v, i) => s + v * this.yValues[i], 0);

            const tMean = sumT / n;
            const yMean = sumY / n;

            const b_numerator = n * sumTY - sumT * sumY;
            const b_denominator = n * sumT2 - sumT * sumT;
            const b = b_denominator === 0 ? 0 : b_numerator / b_denominator;
            
            const a = yMean - b * tMean;

            this.updateTable(a, b);
            this.updateResults(a, b);
            this.updatePlot(a, b);
            this.updateStepByStepSolution(n, sumT, sumY, sumT2, sumTY, tMean, yMean, a, b);

        } catch (error) {
            alert(error.message);
            console.error("Error during calculation:", error);
        }
    }

    updateTable() {
        const tableHead = document.querySelector('table thead');
        if (tableHead) {
            tableHead.innerHTML = `
                <tr>
                    <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">t</th>
                    <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">y</th>
                    <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ty</th>
                    <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">t²</th>
                </tr>
            `;
        }

        const tableBody = document.getElementById('dataTable');
        const rows = tableBody.querySelectorAll('tr');
        const yValuesFromInputs = Array.from(rows).map(row => row.querySelector('input[type="number"]')?.value || '');

        tableBody.innerHTML = ''; // Clear existing rows before rebuilding

        yValuesFromInputs.forEach((yValue, index) => {
            const newRow = document.createElement('tr');
            if (index < this.yValues.length) {
                const t = this.tValues[index];
                const y = this.yValues[index];
                const ty = t * y;
                const t2 = t * t;
                newRow.innerHTML = `
                    <td class="px-4 py-2 text-sm text-gray-700 text-center">${t}</td>
                    <td class="px-4 py-2"><input type="number" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" step="any" value="${yValue}"></td>
                    <td class="px-4 py-2 text-sm text-gray-700 text-center">${formatNumber(ty)}</td>
                    <td class="px-4 py-2 text-sm text-gray-700 text-center">${formatNumber(t2)}</td>
                `;
            } else {
                // This handles empty rows at the end
                newRow.innerHTML = `
                    <td class="px-4 py-2 text-sm text-gray-700 text-center">${index + 1}</td>
                    <td class="px-4 py-2"><input type="number" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" step="any" value="${yValue}"></td>
                    <td class="px-4 py-2 text-sm text-gray-700 text-center">-</td>
                    <td class="px-4 py-2 text-sm text-gray-700 text-center">-</td>
                `;
            }
            tableBody.appendChild(newRow);
        });
    }

    updateResults(a, b) {
        const resultEl = document.querySelector('.text-3xl');
        if (resultEl) {
            resultEl.textContent = `ŷ = ${formatNumber(a)} + ${formatNumber(b)}t`;
        }
    }

    updatePlot(a, b) {
        const plotCanvas = document.getElementById('timeSeriesPlot');
        if (this.chart) {
            this.chart.destroy();
        }
        if (!plotCanvas) return;

        const dataPoints = this.tValues.map((t, i) => ({ x: t, y: this.yValues[i] }));
        const trendLine = this.tValues.map(t => ({ x: t, y: a + b * t }));

        this.chart = new Chart(plotCanvas, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Data Points',
                    data: dataPoints,
                    backgroundColor: 'rgba(59, 130, 246, 0.5)'
                }, {
                    label: 'Trend Line',
                    data: trendLine,
                    borderColor: 'rgba(239, 68, 68, 0.8)',
                    borderWidth: 2,
                    fill: false,
                    type: 'line',
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: { display: true, text: 'Time (t)' }
                    },
                    y: {
                        title: { display: true, text: 'Value (y)' }
                    }
                }
            }
        });
    }
    
    updateStepByStepSolution(n, sumT, sumY, sumT2, sumTY, tMean, yMean, a, b) {
        const solutionDiv = document.querySelector('.prose');
        if (!solutionDiv) return;

        const mjx = (latex) => `<div class="math-display my-2" style="overflow-x: auto;">$$ ${latex} $$</div>`;

        let stepsHTML = `
            <h3>Step-by-Step Solution</h3>
            <p>The formula for the trend line is ŷ = a + bt.</p>
            
            <h4>1. Calculate b:</h4>
            ${mjx(`b = \\frac{ n\\Sigma ty - (\\Sigma t)(\\Sigma y) }{n \\Sigma t^2 - (\\Sigma t)^2}`)}
            <ul class="list-disc pl-5 space-y-1">
                <li>n = ${n}</li>
                <li>Σt = ${formatNumber(sumT)}</li>
                <li>Σy = ${formatNumber(sumY)}</li>
                <li>Σt² = ${formatNumber(sumT2)}</li>
                <li>Σty = ${formatNumber(sumTY)}</li>
            </ul>
            ${mjx(`b = \\frac{ (${n} \\cdot ${formatNumber(sumTY)}) - (${formatNumber(sumT)} \\cdot ${formatNumber(sumY)}) }{(${n} \\cdot ${formatNumber(sumT2)}) - (${formatNumber(sumT)})^2}`)}
            ${mjx(`b = \\frac{ ${formatNumber(n * sumTY)} - ${formatNumber(sumT * sumY)} }{${formatNumber(n * sumT2)} - ${formatNumber(sumT * sumT)}}`)}
            ${mjx(`b = \\frac{ ${formatNumber(n * sumTY - sumT * sumY)} }{${formatNumber(n * sumT2 - sumT * sumT)}} = ${formatNumber(b)}`)}

            <h4 class="mt-4">2. Calculate a:</h4>
            ${mjx(`a = \\bar{y} - b \\cdot \\bar{t}`)}
            <ul class="list-disc pl-5 space-y-1">
                <li>ȳ (Mean of y) = ${formatNumber(yMean)}</li>
                <li>t̄ (Mean of t) = ${formatNumber(tMean)}</li>
                <li>b = ${formatNumber(b)}</li>
            </ul>
            ${mjx(`a = ${formatNumber(yMean)} - ${formatNumber(b)} \\cdot ${formatNumber(tMean)}`)}
            ${mjx(`a = ${formatNumber(yMean)} - ${formatNumber(b * tMean)} = ${formatNumber(a)}`)}

            <h4 class="mt-4">3. Final Equation:</h4>
            ${mjx(`\\hat{y} = ${formatNumber(a)} + ${formatNumber(b)}t`)}
        `;
        solutionDiv.innerHTML = stepsHTML;
        if (window.MathJax) {
            window.MathJax.typesetPromise([solutionDiv]).catch(err => console.error("MathJax typesetPromise error:", err));
        }
    }
}
