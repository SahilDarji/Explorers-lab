import {
    calculateMean,
    calculateCorrelationRawScores,
    calculateCorrelationMeanDeviation,
    calculateCorrelationAssumedMean,
    getCorrelationInterpretation,
    formatNumber,
    validateInputs
} from '../../shared/js/utils.js';

export class CorrelationCalculator {
    constructor() {
        console.log('CorrelationCalculator constructor called');
        this.chart = null;
        this.xValues = [];
        this.yValues = [];
        this.assumedMeanA = null;
        this.assumedMeanB = null;
        this.currentCorrelation = undefined;
        this.currentFormulaResults = {};
        this.currentRegressionResults = {}; // Add this to store regression results
        this.isCalculatingRegression = false; // Flag to indicate if regression is being calculated
        this.initializeEventListeners();
        this.updateAssumedMeanInputVisibility();
        // this.showPage('correlationRegressionContent'); // Show correlation/regression by default - now handled by common.js
    }

    initializeEventListeners() {
        console.log('Initializing event listeners');
        
        // Sidebar controls - Moved to common.js
        // const openSidebarBtn = document.getElementById('openSidebarBtn');
        // const closeSidebarBtn = document.getElementById('closeSidebarBtn');
        // const sidebar = document.getElementById('sidebar');
        // const overlay = document.getElementById('overlay');

        // if (openSidebarBtn) {
        //     openSidebarBtn.addEventListener('click', () => {
        //         sidebar.classList.add('open');
        //         overlay.classList.add('open');
        //     });
        // }

        // if (closeSidebarBtn) {
        //     closeSidebarBtn.addEventListener('click', () => {
        //         sidebar.classList.remove('open');
        //         overlay.classList.remove('open');
        //     });
        // }

        // if (overlay) {
        //     overlay.addEventListener('click', () => {
        //         sidebar.classList.remove('open');
        //         overlay.classList.remove('open');
        //     });
        // }

        // Navigation links - Moved to common.js
        // document.getElementById('navHome')?.addEventListener('click', (e) => {
        //     e.preventDefault();
        //     this.showPage('homePageContent');
        //     this.updateNavActiveLink('navHome');
        //     this.clearResultsAndTable();
        // });

        // document.getElementById('navCorrelation')?.addEventListener('click', (e) => {
        //     e.preventDefault();
        //     this.showPage('correlationRegressionContent');
        //     this.updateNavActiveLink('navCorrelation');
        //     this.clearResultsAndTable();
        // });

        // document.getElementById('navProbability')?.addEventListener('click', (e) => {
        //     e.preventDefault();
        //     this.showPage('probabilityContent');
        //     this.updateNavActiveLink('navProbability');
        //     this.clearResultsAndTable();
        // });

        const solveBtn = document.getElementById('solveBtn');
        if (solveBtn) {
            solveBtn.addEventListener('click', () => {
                console.log('Solve button clicked');
                this.solve();
            });
        } else {
            console.error('Solve button not found');
        }

        const regressionBtn = document.getElementById('regressionBtn');
        if (regressionBtn) {
            regressionBtn.addEventListener('click', () => {
                console.log('Regression button clicked');
                this.calculateRegression();
            });
        } else {
            console.error('Regression button not found');
        }

        const formulaSelect = document.getElementById('formulaSelect');
        if (formulaSelect) {
            formulaSelect.addEventListener('change', () => {
                console.log('Formula selection changed');
                this.updateAssumedMeanInputVisibility();
                this.clearResultsAndTable();
            });
        } else {
            console.error('Formula select not found');
        }

        const addRowBtn = document.getElementById('addRowBtn');
        if (addRowBtn) {
            addRowBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Add row button clicked');
                this.addRow();
                const newRow = document.getElementById('dataTable').lastElementChild;
                if (newRow) {
                    const firstInput = newRow.querySelector('input[type="number"]');
                    if (firstInput) firstInput.focus();
                }
            });
        } else {
            console.error('Add row button not found');
        }

        const dataTableBody = document.getElementById('dataTable');
        if (dataTableBody) {
            dataTableBody.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type === 'number') {
                    console.log('Enter key pressed in input');
                    e.preventDefault();
                    
                    const currentRow = e.target.closest('tr');
                    const inputsInRow = Array.from(currentRow.querySelectorAll('input[type="number"]'));
                    const currentInputIndex = inputsInRow.indexOf(e.target);

                    if (currentInputIndex === inputsInRow.length - 1) {
                        const allRows = Array.from(dataTableBody.querySelectorAll('tr'));
                        const isLastRow = allRows.indexOf(currentRow) === allRows.length - 1;
                        
                        const xVal = inputsInRow[0].value.trim();
                        const yVal = inputsInRow[1].value.trim();

                        if (isLastRow || (xVal !== '' && yVal !== '')) {
                            this.addRow();
                            const newRowAdded = dataTableBody.lastElementChild;
                            if (newRowAdded) {
                                const firstInput = newRowAdded.querySelector('input[type="number"]');
                                if (firstInput) firstInput.focus();
                            }
                        }
                    } else if (currentInputIndex < inputsInRow.length - 1) {
                        inputsInRow[currentInputIndex + 1].focus();
                    }
                }
            });
        } else {
            console.error('Data table body not found');
        }
    }
    
    updateAssumedMeanInputVisibility() {
        const formulaSelect = document.getElementById('formulaSelect');
        const assumedMeanInputsDiv = document.getElementById('assumedMeanInputs');
        if (!formulaSelect || !assumedMeanInputsDiv) return;
        if (formulaSelect.value === 'assumed') {
            assumedMeanInputsDiv.classList.remove('hidden');
        } else {
            assumedMeanInputsDiv.classList.add('hidden');
        }
    }
    
    // showPage(pageId) { // Moved to common.js
    //     document.querySelectorAll('main').forEach(page => {
    //         page.classList.add('hidden');
    //     });
    //     document.getElementById(pageId)?.classList.remove('hidden');
    //     // Close sidebar after navigation
    //     document.getElementById('sidebar')?.classList.remove('open');
    //     document.getElementById('overlay')?.classList.remove('open');
    // }

    // updateNavActiveLink(activeLinkId) { // Moved to common.js
    //     document.querySelectorAll('#sidebar nav a').forEach(link => {
    //         link.classList.remove('text-blue-600');
    //         link.classList.remove('font-bold');
    //         link.classList.add('text-gray-700');
    //         link.classList.add('font-medium');
    //     });
    //     const activeLink = document.getElementById(activeLinkId);
    //     if (activeLink) {
    //         activeLink.classList.remove('text-gray-700');
    //         activeLink.classList.remove('font-medium');
    //         activeLink.classList.add('text-blue-600');
    //         activeLink.classList.add('font-bold');
    //     }
    // }

    clearResultsAndTable() {
        this.currentCorrelation = undefined;
        this.currentFormulaResults = {};
        this.currentRegressionResults = {}; // Add this to store regression results
        this.isCalculatingRegression = false; // Flag to indicate if regression is being calculated

        const rValueEl = document.querySelector('.text-3xl');
        if (rValueEl) rValueEl.textContent = '--';
        const interpretationEl = document.querySelector('.p-4.bg-gray-50:nth-child(2) p');
        if (interpretationEl) interpretationEl.textContent = 'Enter data and click solve to see results';
        const solutionDiv = document.querySelector('.prose');
        if (solutionDiv) solutionDiv.innerHTML = `
            <div class="flex flex-col items-center justify-center py-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-blue-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p class="text-blue-700 font-medium text-lg">Ready to calculate!</p>
                <p class="text-gray-600 mt-2">Enter data and click Correlation or Regression to see detailed steps</p>
            </div>
        `;
        
        const scatterPlotCanvas = document.getElementById('scatterPlot');
        // More robust chart destruction
        const existingChartById = Chart.getChart('scatterPlot');
        if (existingChartById) {
            console.log('Destroying existing chart (found by ID) in clearResultsAndTable', existingChartById.id);
            existingChartById.destroy();
        }
        // Also ensure our local reference is cleared
        if (this.chart && typeof this.chart.destroy === 'function') {
            console.log('Destroying chart from this.chart reference in clearResultsAndTable', this.chart.id);
            this.chart.destroy(); // Should be redundant if getChart worked, but safe
        }
        this.chart = null;

        if(scatterPlotCanvas){
            const ctx = scatterPlotCanvas.getContext('2d');
            ctx.clearRect(0, 0, scatterPlotCanvas.width, scatterPlotCanvas.height);
        } else {
            console.error("Scatter plot canvas not found in clearResultsAndTable");
        }

        const dataTableBody = document.getElementById('dataTable');
        const tableElement = dataTableBody ? dataTableBody.parentElement : null;
        const tableHead = tableElement ? tableElement.querySelector('thead tr') : null;

        if (tableHead) {
            tableHead.innerHTML = `
                <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">X Values</th>
                <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Y Values</th>
            `;
        }
        
        if(dataTableBody){
            const tableBodyRows = dataTableBody.querySelectorAll('tr');
            tableBodyRows.forEach((row) => {
                const cells = row.querySelectorAll('td');
                for (let i = cells.length - 1; i >= 2; i--) {
                    row.removeChild(cells[i]);
                }
            });
        }
        
        this.xValues = [];
        this.yValues = [];
        this.assumedMeanA = null;
        this.assumedMeanB = null;
    }

    addRow() {
        console.log('Adding new row triggered');
        const tbody = document.getElementById('dataTable');
        if (!tbody) {
            console.error("Could not find tbody with id 'dataTable' in addRow");
            return;
        }
        const newRow = document.createElement('tr');
        
        let rowHTML = `
            <td class="px-4 py-2"><input type="number" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" step="any"></td>
            <td class="px-4 py-2"><input type="number" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" step="any"></td>
        `;

        const tableElement = tbody.parentElement;
        const headerCells = tableElement ? tableElement.querySelectorAll('thead tr th') : [];
        if (headerCells.length > 2) {
            for (let i = 2; i < headerCells.length; i++) {
                rowHTML += `<td class="px-4 py-2 text-sm text-gray-700 text-center">-</td>`;
            }
        }
        
        newRow.innerHTML = rowHTML;
        tbody.appendChild(newRow);
    }

    getInputData() {
        const dataTableBody = document.getElementById('dataTable');
        this.xValues = [];
        this.yValues = [];

        if (!dataTableBody) {
            console.error("#dataTable (tbody) not found in getInputData");
            return { xValues: [], yValues: [], assumedMeanA: 0, assumedMeanB: 0 };
        }
        const rows = dataTableBody.querySelectorAll('tr');

        rows.forEach(row => {
            const inputs = row.querySelectorAll('input[type="number"]');
            if (inputs.length >= 2) {
                const xVal = inputs[0].value.trim();
                const yVal = inputs[1].value.trim();

                if (xVal !== '' && yVal !== '') { 
                    const x = parseFloat(xVal);
                    const y = parseFloat(yVal);
                    if (!isNaN(x) && !isNaN(y)) {
                        this.xValues.push(x);
                        this.yValues.push(y);
                    }
                } 
            }
        });
        
        const formulaSelect = document.getElementById('formulaSelect');
        const formula = formulaSelect ? formulaSelect.value : 'raw';

        if (formula === 'assumed') {
            const valAEl = document.getElementById('assumedMeanA');
            const valBEl = document.getElementById('assumedMeanB');
            const valA = valAEl ? valAEl.value : '0';
            const valB = valBEl ? valBEl.value : '0';
            this.assumedMeanA = valA.trim() === '' ? 0 : parseFloat(valA); 
            this.assumedMeanB = valB.trim() === '' ? 0 : parseFloat(valB); 
            if (isNaN(this.assumedMeanA)) this.assumedMeanA = 0; 
            if (isNaN(this.assumedMeanB)) this.assumedMeanB = 0;
        }

        console.log("Collected X Values for calculation:", this.xValues);
        console.log("Collected Y Values for calculation:", this.yValues);
        return { xValues: this.xValues, yValues: this.yValues, assumedMeanA: this.assumedMeanA, assumedMeanB: this.assumedMeanB };
    }

    updateTableHeaders(formula) {
        const dataTableBody = document.getElementById('dataTable');
        const tableElement = dataTableBody ? dataTableBody.parentElement : null;
        const tableHeadRow = tableElement ? tableElement.querySelector('thead tr') : null;

        if (!tableHeadRow) {
            console.error("Table head row not found in updateTableHeaders");
            return;
        }
        // Base classes for all header cells
        const baseThClasses = "px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-max";

        let headers = `
            <th class="${baseThClasses}">X Values</th>
            <th class="${baseThClasses}">Y Values</th>
        `;
        if (formula === 'raw') {
            headers += `
                <th class="${baseThClasses}">X²</th>
                <th class="${baseThClasses}">Y²</th>
                <th class="${baseThClasses}">XY</th>
            `;
        } else if (formula === 'mean') {
            headers += `
                <th class="${baseThClasses}">x - x̄</th>
                <th class="${baseThClasses}">y - ȳ</th>
                <th class="${baseThClasses}">(x - x̄)²</th>
                <th class="${baseThClasses}">(y - ȳ)²</th>
                <th class="${baseThClasses}">(x - x̄)(y - ȳ)</th>
            `;
        } else if (formula === 'assumed') {
            headers += `
                <th class="${baseThClasses}">u = X-A</th>
                <th class="${baseThClasses}">v = Y-B</th>
                <th class="${baseThClasses}">u²</th>
                <th class="${baseThClasses}">v²</th>
                <th class="${baseThClasses}">uv</th>
            `;
        }
        tableHeadRow.innerHTML = headers;
    }

    updateTableRows(formula) {
        const tableBody = document.getElementById('dataTable');
        if (!tableBody) {
            console.error("Table body (#dataTable) not found in updateTableRows");
            return;
        }

        const xMean = (formula === 'mean' && this.xValues.length > 0) ? calculateMean(this.xValues) : null;
        const yMean = (formula === 'mean' && this.yValues.length > 0) ? calculateMean(this.yValues) : null;
        
        const allInputRows = tableBody.querySelectorAll('tr'); 
        let dataRowIndex = 0; 

        allInputRows.forEach((row) => {
            const xInputEl = row.cells[0] ? row.cells[0].querySelector('input[type="number"]') : null;
            const yInputEl = row.cells[1] ? row.cells[1].querySelector('input[type="number"]') : null;
            const xInputValue = xInputEl ? xInputEl.value : '';
            const yInputValue = yInputEl ? yInputEl.value : '';

            let cellsHTML = `
                <td class="px-4 py-2"><input type="number" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" step="any" value="${xInputValue}"></td>
                <td class="px-4 py-2"><input type="number" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" step="any" value="${yInputValue}"></td>
            `;

            if (xInputValue.trim() !== '' && yInputValue.trim() !== '' && dataRowIndex < this.xValues.length) {
                const x = this.xValues[dataRowIndex];
                const y = this.yValues[dataRowIndex];

                if (formula === 'raw') {
                    cellsHTML += `
                        <td class="px-4 py-2 text-sm text-gray-700 text-center">${formatNumber(x * x)}</td>
                        <td class="px-4 py-2 text-sm text-gray-700 text-center">${formatNumber(y * y)}</td>
                        <td class="px-4 py-2 text-sm text-gray-700 text-center">${formatNumber(x * y)}</td>
                    `;
                } else if (formula === 'mean') {
                    if (xMean !== null && yMean !== null) {
                        const xDev = x - xMean;
                        const yDev = y - yMean;
                        cellsHTML += `
                            <td class="px-4 py-2 text-sm text-gray-700 text-center">${formatNumber(xDev)}</td>
                            <td class="px-4 py-2 text-sm text-gray-700 text-center">${formatNumber(yDev)}</td>
                            <td class="px-4 py-2 text-sm text-gray-700 text-center">${formatNumber(xDev * xDev)}</td>
                            <td class="px-4 py-2 text-sm text-gray-700 text-center">${formatNumber(yDev * yDev)}</td>
                            <td class="px-4 py-2 text-sm text-gray-700 text-center">${formatNumber(xDev * yDev)}</td>
                        `;
                    } else {
                         for(let i=0; i<5; i++) cellsHTML += `<td class="px-4 py-2 text-sm text-gray-700 text-center">-</td>`;
                    }
                } else if (formula === 'assumed') {
                    const u = x - (this.assumedMeanA || 0); 
                    const v = y - (this.assumedMeanB || 0);
                    cellsHTML += `
                        <td class="px-4 py-2 text-sm text-gray-700 text-center">${formatNumber(u)}</td>
                        <td class="px-4 py-2 text-sm text-gray-700 text-center">${formatNumber(v)}</td>
                        <td class="px-4 py-2 text-sm text-gray-700 text-center">${formatNumber(u * u)}</td>
                        <td class="px-4 py-2 text-sm text-gray-700 text-center">${formatNumber(v * v)}</td>
                        <td class="px-4 py-2 text-sm text-gray-700 text-center">${formatNumber(u * v)}</td>
                    `;
                }
                dataRowIndex++;
            } else {
                const tableElement = tableBody.parentElement;
                const headerCells = tableElement ? tableElement.querySelectorAll('thead tr th') : [];
                const headerCellsCount = headerCells.length;
                for(let i = 2; i < headerCellsCount; i++) {
                    cellsHTML += `<td class="px-4 py-2 text-sm text-gray-700 text-center">-</td>`;
                }
            }
            row.innerHTML = cellsHTML;
        });
    }

    updateScatterPlot() {
        const scatterPlotCanvas = document.getElementById('scatterPlot');
        
        // More robust chart destruction
        const existingChartById = Chart.getChart('scatterPlot');
        if (existingChartById) {
            console.log('Destroying existing chart (found by ID) in updateScatterPlot', existingChartById.id);
            existingChartById.destroy();
        }
        // Also ensure our local reference is cleared if it exists, though getChart is more reliable
        if (this.chart && typeof this.chart.destroy === 'function') {
             console.log('Destroying chart from this.chart reference in updateScatterPlot', this.chart.id);
             this.chart.destroy();
        }
        this.chart = null;

        if (!scatterPlotCanvas) {
            console.error("Scatter plot canvas not found in updateScatterPlot");
            return;
        }

        const datasets = [];
        const dataPoints = this.xValues && this.yValues ? this.xValues.map((x, i) => ({ x, y: this.yValues[i] })) : [];

        if (dataPoints.length > 0) {
            datasets.push({
                label: 'Data Points',
                data: dataPoints,
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1
            });
        }

        if (!this.xValues || !this.yValues || this.xValues.length < 2 || this.yValues.length < 2) { 
            console.log("Not enough data for scatter plot (requires at least 2 points).");
            const ctx = scatterPlotCanvas.getContext('2d');
            ctx.clearRect(0, 0, scatterPlotCanvas.width, scatterPlotCanvas.height);
            ctx.font = "16px Inter, sans-serif";
            ctx.fillStyle = "rgb(107, 114, 128)"; 
            ctx.textAlign = "center";
            ctx.fillText("Need at least 2 data points for scatter plot.", scatterPlotCanvas.width / 2, scatterPlotCanvas.height / 2);
            return;
        }
        
        const ctx = scatterPlotCanvas.getContext('2d');
        const xMin = Math.min(...this.xValues);
        const xMax = Math.max(...this.xValues);
        const yMin = Math.min(...this.yValues);
        const yMax = Math.max(...this.yValues);
        let xRange = xMax - xMin;
        let yRange = yMax - yMin;

        const bufferFactor = 0.2; 
        const minBuffer = 2; 

        let xBuffer = xRange === 0 ? (Math.abs(xMax * bufferFactor) || minBuffer) : xRange * bufferFactor;
        let yBuffer = yRange === 0 ? (Math.abs(yMax * bufferFactor) || minBuffer) : yRange * bufferFactor;
        
        let xPlotMin = xMin - xBuffer;
        let xPlotMax = xMax + xBuffer;
        let yPlotMin = yMin - yBuffer;
        let yPlotMax = yMax + yBuffer;

        let xDataSpan = xPlotMax - xPlotMin;
        let yDataSpan = yPlotMax - yPlotMin;

        if (xDataSpan < yDataSpan) {
            const diff = yDataSpan - xDataSpan;
            xBuffer += diff / 2;
            xPlotMin = xMin - xBuffer; // Recalculate plot min/max with new buffer
            xPlotMax = xMax + xBuffer;
        } else if (yDataSpan < xDataSpan) {
            const diff = xDataSpan - yDataSpan;
            yBuffer += diff / 2;
            yPlotMin = yMin - yBuffer; // Recalculate plot min/max with new buffer
            yPlotMax = yMax + yBuffer;
        }

        // Regression Line Calculation - now conditional based on current mode
        if (this.xValues.length >= 2 && this.isCalculatingRegression && !isNaN(this.currentRegressionResults.slope) && !isNaN(this.currentRegressionResults.intercept)) {
            const m = this.currentRegressionResults.slope;
            const c = this.currentRegressionResults.intercept;

            datasets.push({
                label: 'Regression Line',
                data: [{ x: xPlotMin, y: m * xPlotMin + c }, { x: xPlotMax, y: m * xPlotMax + c }],
                borderColor: 'rgba(239, 68, 68, 0.8)', // Red color
                borderWidth: 2,
                fill: false,
                type: 'line',
                pointRadius: 0,
                tension: 0
            });
        } else if (this.xValues.length >= 2 && !this.isCalculatingRegression && this.currentFormulaResults) {
            // Existing correlation regression line logic (if still desired for correlation view)
            const n = this.currentFormulaResults.n || this.xValues.length;
            const sumX = this.currentFormulaResults.sumX || this.xValues.reduce((a, b) => a + b, 0);
            const sumY = this.currentFormulaResults.sumY || this.yValues.reduce((a, b) => a + b, 0);
            const sumXY = this.currentFormulaResults.sumXY || this.xValues.reduce((s, val, i) => s + val * this.yValues[i], 0);
            const sumX2 = this.currentFormulaResults.sumX2 || this.xValues.reduce((s, val) => s + val * val, 0);

            const meanX = sumX / n;
            const meanY = sumY / n;

            const denominator_m = n * sumX2 - sumX * sumX;

            if (denominator_m === 0) { // Vertical line
                const allYAreSame = this.yValues.every(val => val === this.yValues[0]);
                if (!allYAreSame) { // Only draw vertical if Y values vary
                    datasets.push({
                        label: 'Regression Line (Vertical)',
                        data: [{ x: this.xValues[0], y: yPlotMin }, { x: this.xValues[0], y: yPlotMax }],
                        borderColor: 'rgba(239, 68, 68, 0.8)', // Red color
                        borderWidth: 2,
                        fill: false,
                        type: 'line',
                        pointRadius: 0,
                        tension: 0
                    });
                }
            } else {
                const m = (n * sumXY - sumX * sumY) / denominator_m;
                const c = meanY - m * meanX;

                datasets.push({
                    label: 'Regression Line',
                    data: [{ x: xPlotMin, y: m * xPlotMin + c }, { x: xPlotMax, y: m * xPlotMax + c }],
                    borderColor: 'rgba(239, 68, 68, 0.8)', // Red color
                    borderWidth: 2,
                    fill: false,
                    type: 'line',
                    pointRadius: 0,
                    tension: 0 // For straight line segments
                });
            }
        }
        
        console.log("Attempting to create new chart on canvas:", scatterPlotCanvas.id);
        this.chart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, 
                scales: {
                    x: {
                        title: { display: true, text: 'X Values' },
                        min: xPlotMin, 
                        max: xPlotMax, 
                        grid: { color: 'rgba(209, 213, 219, 0.5)' }
                    },
                    y: {
                        title: { display: true, text: 'Y Values' },
                        min: yPlotMin, 
                        max: yPlotMax, 
                        grid: { color: 'rgba(209, 213, 219, 0.5)' }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `(${formatNumber(context.parsed.x)}, ${formatNumber(context.parsed.y)})`;
                            }
                        }
                    }
                },
                layout: {
                    padding: 10 
                }
            }
        });
        console.log("New chart created with ID:", this.chart.id);
    }

    updateResults(correlation) {
        const rValueEl = document.querySelector('.text-3xl');
        const interpretationEl = document.querySelector('.p-4.bg-gray-50:nth-child(2) p');
        const rValueHeaderEl = document.querySelector('.p-4.bg-gradient-to-r h3'); // Select the header element

        if (rValueHeaderEl) {
            rValueHeaderEl.textContent = 'Correlation Coefficient (r)'; // Set the header text back to Correlation
        } else {
            console.error("R value header element not found");
        }

        if (rValueEl) {
            if (isNaN(correlation)) {
                rValueEl.textContent = 'Invalid';    
            } else {
                rValueEl.textContent = formatNumber(correlation);
            }
        } else console.error("R value element not found");

        if (interpretationEl) {
            if (isNaN(correlation)) {
                interpretationEl.textContent = 'Cannot interpret: Invalid data or calculation (e.g. not enough data points or no variance).';
            } else {
                interpretationEl.textContent = getCorrelationInterpretation(correlation);
            }
        } else console.error("Interpretation element not found");
    }

    updateStepByStepSolution() {
        const formulaSelect = document.getElementById('formulaSelect');
        const formula = formulaSelect ? formulaSelect.value : 'raw';
        const solutionDiv = document.querySelector('.prose');
        
        console.log(`Updating steps for formula: ${formula}, Correlation: ${this.currentCorrelation}`, this.currentFormulaResults);

        if (!solutionDiv) {
            console.error("Solution div not found");
            return;
        }

        if (this.xValues.length < 2 || this.yValues.length < 2 ) {
            solutionDiv.innerHTML = '<p class="text-gray-600">Need at least 2 complete data pairs to calculate and show steps.</p>';
            return;
        }
        if (this.currentCorrelation === undefined || isNaN(this.currentCorrelation)) {
            solutionDiv.innerHTML = '<p class="text-gray-600">Cannot show steps: Correlation is invalid or not calculated (e.g., due to insufficient data, no variance, or division by zero).</p>';
            return;
        }
        
        const r = this.currentCorrelation;
        const res = this.currentFormulaResults;
        let steps = '';

        switch (formula) {
            case 'raw':
                if(res && res.n !== undefined && res.sumX !== undefined && res.sumY !== undefined && res.sumX2 !== undefined && res.sumY2 !== undefined && res.sumXY !== undefined) {
                   steps = this.getRawScoresSteps(r, res.n, res.sumX, res.sumY, res.sumX2, res.sumY2, res.sumXY);
                } else {
                   steps = '<p class="text-red-500">Error: Missing data for raw score steps. Check console for details on currentFormulaResults.</p>';
                   console.error("Missing data for raw score steps. CurrentFormulaResults:", res);
                }
                break;
            case 'mean':
                 if(res && res.xMean !== undefined && res.yMean !== undefined && res.sumXDevSq !== undefined && res.sumYDevSq !== undefined && res.sumProdDev !== undefined) {
                    steps = this.getMeanDeviationSteps(r, res.xMean, res.yMean, res.sumXDevSq, res.sumYDevSq, res.sumProdDev);
                 } else {
                    steps = '<p class="text-red-500">Error: Missing data for mean deviation steps. Check console for details on currentFormulaResults.</p>';
                    console.error("Missing data for mean deviation steps. CurrentFormulaResults:", res);
                 }
                break;
            case 'assumed':
                if(res && res.n !== undefined && res.assumedA !== undefined && res.assumedB !== undefined && res.uValues !== undefined && res.vValues !== undefined && res.sumU !== undefined && res.sumV !== undefined && res.sumU2 !== undefined && res.sumV2 !== undefined && res.sumUV !== undefined) {
                    steps = this.getAssumedMeanSteps(r, res.n, res.assumedA, res.assumedB, res.uValues, res.vValues, res.sumU, res.sumV, res.sumU2, res.sumV2, res.sumUV);
                } else {
                    steps = '<p class="text-red-500">Error: Missing data for assumed mean steps. Check console for details on currentFormulaResults.</p>';
                    console.error("Missing data for assumed mean steps. CurrentFormulaResults:", res);
                }
                break;
            default:
                steps = "<p class=\"text-gray-600\">Select a formula to see steps.</p>";
        }
        solutionDiv.innerHTML = steps;
        if (window.MathJax) {
            if (window.MathJax.typesetPromise) {
                console.log("Calling MathJax.typesetPromise()");
                window.MathJax.typesetPromise([solutionDiv]).catch(err => console.error("MathJax typesetPromise error:", err));
            } else if (window.MathJax.typeset) {
                console.log("Calling MathJax.typeset()");
                try {
                    window.MathJax.typeset([solutionDiv]);
                } catch (err) {
                    console.error("MathJax typeset error:", err);
                }
            } else {
                console.error("MathJax.typesetPromise and MathJax.typeset not found. Cannot render LaTeX.");
            }
        } else {
            console.error("MathJax object not found. Cannot render LaTeX.");
        }
    }
    
    getRawScoresSteps(correlation, n, sumX, sumY, sumX2, sumY2, sumXY) {
        // Intermediate calculations for clarity and step-by-step display
        const n_sumXY = n * sumXY;
        const sumX_sumY = sumX * sumY;
        const numerator = n_sumXY - sumX_sumY;

        const n_sumX2 = n * sumX2;
        const sumX_sq = sumX * sumX;
        const den_partX = n_sumX2 - sumX_sq;

        const n_sumY2 = n * sumY2;
        const sumY_sq = sumY * sumY;
        const den_partY = n_sumY2 - sumY_sq;

        const den_sqrt_inside = den_partX * den_partY;
        const denominator = Math.sqrt(den_sqrt_inside);

        // Simplified MathJax helper
        const mjx = (latex) => `<div class="math-display my-2" style="overflow-x: auto;">$$ ${latex} $$</div>`;

        let stepsHTML = `
            <h3>Step-by-Step Solution (Raw Scores Method)</h3>
            <p>The formula for Pearson\'s correlation coefficient (r) using raw scores is:</p>
            ${mjx(`r = \\frac{n\\sum xy - (\\sum x)(\\sum y)}{\\sqrt{[n\\sum x^2 - (\\sum x)^2][n\\sum y^2 - (\\sum y)^2]}}`)}
            
            <h4>1. Calculated Sums from Data Table:</h4>
            <ul class="list-disc pl-5 space-y-1">
                <li>n (Number of pairs) = ${n}</li>
                <li>∑x (Sum of X values) = ${formatNumber(sumX)}</li>
                <li>∑y (Sum of Y values) = ${formatNumber(sumY)}</li>
                <li>∑x² (Sum of squared X values) = ${formatNumber(sumX2)}</li>
                <li>∑y² (Sum of squared Y values) = ${formatNumber(sumY2)}</li>
                <li>∑xy (Sum of X*Y products) = ${formatNumber(sumXY)}</li>
            </ul>

            <h4>2. Substituting Values into the Formula:</h4>
            ${mjx(`r = \\frac{(${n} \\cdot ${formatNumber(sumXY)}) - (${formatNumber(sumX)} \\cdot ${formatNumber(sumY)})}{\\sqrt{[(${n} \\cdot ${formatNumber(sumX2)}) - (${formatNumber(sumX)})^2][(${n} \\cdot ${formatNumber(sumY2)}) - (${formatNumber(sumY)})^2]}}`)}
            
            <h4>3. Simplification Steps:</h4>
        `;

        // Step 1: Simplify products
        stepsHTML += `<p class="font-medium mt-3">Step 3.1: Calculate products in numerator and denominator terms.</p>`;
        stepsHTML += mjx(`r = \\frac{${formatNumber(n_sumXY)} - ${formatNumber(sumX_sumY)}}{\\sqrt{[${formatNumber(n_sumX2)} - ${formatNumber(sumX_sq)}][${formatNumber(n_sumY2)} - ${formatNumber(sumY_sq)}]}}`);

        // Step 2: Simplify differences
        stepsHTML += `<p class="font-medium mt-3">Step 3.2: Calculate differences in numerator and denominator terms.</p>`;
        stepsHTML += mjx(`r = \\frac{${formatNumber(numerator)}}{\\sqrt{[${formatNumber(den_partX)}][${formatNumber(den_partY)}]}}`);
        
        // Step 3: Multiply terms under square root
        stepsHTML += `<p class="font-medium mt-3">Step 3.3: Multiply terms under the square root.</p>`;
        stepsHTML += mjx(`r = \\frac{${formatNumber(numerator)}}{\\sqrt{${formatNumber(den_sqrt_inside)}}}`);

        // Step 4: Calculate square root
        if (den_sqrt_inside < 0) {
             stepsHTML += `<p class="font-medium mt-3">Step 3.4: The value under the square root is negative (${formatNumber(den_sqrt_inside)}), so the denominator is undefined (cannot take square root of a negative number).</p>`;
             stepsHTML += mjx(`r = \\frac{${formatNumber(numerator)}}{\\text{undefined (sqrt of negative)}}`);
        } else {
            stepsHTML += `<p class="font-medium mt-3">Step 3.4: Calculate the square root.</p>`;
            stepsHTML += mjx(`r = \\frac{${formatNumber(numerator)}}{${formatNumber(denominator)}}`);
        }
        
        // Step 5: Final division
        stepsHTML += `<p class="font-medium mt-3">Step 3.5: Final calculation for r.</p>`;
        if (denominator === 0) {
            if (numerator === 0) {
                 stepsHTML += mjx(`r = \\frac{0}{0} = \\text{Undefined (0/0)}`);
                 stepsHTML += `<p class="mt-1">The result is undefined because both the numerator and denominator are zero. This often occurs when there\'s no variability in one or both sets of data, or too few data points.</p>`;
            } else {
                 stepsHTML += mjx(`r = \\frac{${formatNumber(numerator)}}{0} = \\text{Undefined (division by zero)}`);
                 stepsHTML += `<p class="mt-1">The result is undefined because the denominator is zero.</p>`;
            }
        } else if (isNaN(correlation)) {
             stepsHTML += mjx(`r = \\text{Invalid or Undefined}`);
             stepsHTML += `<p class="mt-1">The correlation could not be calculated (e.g., due to square root of a negative number or other mathematical issues).</p>`;
        }
        else {
            stepsHTML += mjx(`r = ${formatNumber(correlation)}`);
        }
        
        stepsHTML += `
            <h4 class="mt-4">Result:</h4>
            <p>The Pearson\'s correlation coefficient (r) is <strong>${formatNumber(correlation)}</strong>.</p>
            <p>${getCorrelationInterpretation(correlation)}</p>
        `;
        return stepsHTML;
    }

    getMeanDeviationSteps(correlation, xMean, yMean, sumXDevSq, sumYDevSq, sumProdDev) {
        const den_sqrt_inside = sumXDevSq * sumYDevSq;
        const denominator = Math.sqrt(den_sqrt_inside);
        const numerator_val = sumProdDev; // This is the final value for the numerator sum.

        const mjx = (latex) => `<div class="math-display my-2" style="overflow-x: auto;">$$ ${latex} $$</div>`; 

        let stepsHTML = `
            <h3>Step-by-Step Solution (Mean-Deviation Method)</h3>
            <p>The formula for Pearson\'s correlation coefficient (r) using mean deviations is:</p>
            ${mjx(`r = \\frac{\\sum (x - \\bar{x})(y - \\bar{y})}{\\sqrt{\\sum (x - \\bar{x})^2 \\cdot \\sum (y - \\bar{y})^2}}`)}
            
            <h4>1. Calculated Means and Sums from Data Table:</h4>
            <p>(Note: The individual (x - x̄), (y - ȳ), etc. values are shown in the table above after clicking \"Solve\")</p>
            <ul class="list-disc pl-5 space-y-1">
                <li>x̄ (Mean of X) = ${formatNumber(xMean)}</li>
                <li>ȳ (Mean of Y) = ${formatNumber(yMean)}</li>
                <li>A = ∑(x - x̄)² (Sum of squared X deviations) = ${formatNumber(sumXDevSq)}</li>
                <li>B = ∑(y - ȳ)² (Sum of squared Y deviations) = ${formatNumber(sumYDevSq)}</li>
                <li>C = ∑(x - x̄)(y - ȳ) (Sum of products of deviations) = ${formatNumber(sumProdDev)}</li>
            </ul>

            <h4>2. Substituting Summed Values into the Formula:</h4>
            <p>Using A, B, and C from above:</p>
            ${mjx(`r = \\frac{C}{\\sqrt{A \\cdot B}}`)}
            ${mjx(`r = \\frac{${formatNumber(sumProdDev)}}{\\sqrt{${formatNumber(sumXDevSq)} \\cdot ${formatNumber(sumYDevSq)}}}`)}
            
            <h4>3. Simplification Steps:</h4>
        `;

        // Step 1: Multiply terms under square root
        stepsHTML += `<p class="font-medium mt-3">Step 3.1: Multiply terms under the square root.</p>`;
        stepsHTML += mjx(`r = \\frac{${formatNumber(numerator_val)}}{\\sqrt{${formatNumber(den_sqrt_inside)}}}`);

        // Step 2: Calculate square root
        if (den_sqrt_inside < 0) {
            stepsHTML += `<p class="font-medium mt-3">Step 3.2: The value under the square root is negative (${formatNumber(den_sqrt_inside)}), so the denominator is undefined.</p>`;
            stepsHTML += mjx(`r = \\frac{${formatNumber(numerator_val)}}{\\text{undefined (sqrt of negative)}}`);
        } else {
            stepsHTML += `<p class="font-medium mt-3">Step 3.2: Calculate the square root.</p>`;
            stepsHTML += mjx(`r = \\frac{${formatNumber(numerator_val)}}{${formatNumber(denominator)}}`);
        }
        
        // Step 3: Final division
        stepsHTML += `<p class="font-medium mt-3">Step 3.3: Final calculation for r.</p>`;
        if (denominator === 0) {
            if (numerator_val === 0) {
                stepsHTML += mjx(`r = \\frac{0}{0} = \\text{Undefined (0/0)}`);
                stepsHTML += `<p class="mt-1">The result is undefined because both the numerator and denominator are zero. This often occurs when there\'s no variability in one or both sets of data.</p>`;
            } else {
                stepsHTML += mjx(`r = \\frac{${formatNumber(numerator_val)}}{0} = \\text{Undefined (division by zero)}`);
                stepsHTML += `<p class="mt-1">The result is undefined because the denominator is zero.</p>`;
            }
        } else if (isNaN(correlation)) {
            stepsHTML += mjx(`r = \\text{Invalid or Undefined}`);
            stepsHTML += `<p class="mt-1">The correlation could not be calculated (e.g., due to square root of a negative number or other mathematical issues).</p>`;
        }
        else {
            stepsHTML += mjx(`r = ${formatNumber(correlation)}`);
        }
        
        stepsHTML += `
            <h4 class="mt-4">Result:</h4>
            <p>The Pearson\'s correlation coefficient (r) is <strong>${formatNumber(correlation)}</strong>.</p>
            <p>${getCorrelationInterpretation(correlation)}</p>
        `;
        return stepsHTML;
    }

    getAssumedMeanSteps(correlation, n, assumedA, assumedB, uValues, vValues, sumU, sumV, sumU2, sumV2, sumUV) {
        // Intermediate calculations for clarity and step-by-step display
        const n_sumUV = n * sumUV;
        const sumU_sumV = sumU * sumV;
        const numerator = n_sumUV - sumU_sumV;

        const n_sumU2 = n * sumU2;
        const sumU_sq = sumU * sumU;
        const den_partU = n_sumU2 - sumU_sq;

        const n_sumV2 = n * sumV2;
        const sumV_sq = sumV * sumV;
        const den_partV = n_sumV2 - sumV_sq;

        const den_sqrt_inside = den_partU * den_partV;
        const denominator = Math.sqrt(den_sqrt_inside);
        
        const mjx = (latex) => `<div class="math-display my-2" style="overflow-x: auto;">$$ ${latex} $$</div>`;

        let stepsHTML = `
            <h3>Step-by-Step Solution (Assumed Mean Method)</h3>
            <p>Let A = ${formatNumber(assumedA)} (Assumed Mean for X) and B = ${formatNumber(assumedB)} (Assumed Mean for Y).</p>
            <p>Derived values: u = X - A and v = Y - B.</p>
            <p>The formula for r using assumed means (u,v) is:</p>
            ${mjx(`r = \\frac{n\\sum uv - (\\sum u)(\\sum v)}{\\sqrt{[n\\sum u^2 - (\\sum u)^2][n\\sum v^2 - (\\sum v)^2]}}`)}
            
            <h4>1. Calculated Sums for u and v from Data Table:</h4>
            <p>(Note: The individual u, v, u², v², uv values are shown in the table above after clicking \"Solve\")</p>
            <ul class="list-disc pl-5 space-y-1">
                <li>n (Number of pairs) = ${n}</li>
                <li>∑u (Sum of u values) = ${formatNumber(sumU)}</li>
                <li>∑v (Sum of v values) = ${formatNumber(sumV)}</li>
                <li>∑u² (Sum of squared u values) = ${formatNumber(sumU2)}</li>
                <li>∑v² (Sum of squared v values) = ${formatNumber(sumV2)}</li>
                <li>∑uv (Sum of u*v products) = ${formatNumber(sumUV)}</li>
            </ul>

            <h4>2. Substituting Values into the Formula:</h4>
            ${mjx(`r = \\frac{(${n} \\cdot ${formatNumber(sumUV)}) - (${formatNumber(sumU)} \\cdot ${formatNumber(sumV)})}{\\sqrt{[(${n} \\cdot ${formatNumber(sumU2)}) - (${formatNumber(sumU)})^2][(${n} \\cdot ${formatNumber(sumV2)}) - (${formatNumber(sumV)})^2]}}`)}
            
            <h4>3. Simplification Steps:</h4>
        `;

        // Step 1: Simplify products
        stepsHTML += `<p class="font-medium mt-3">Step 3.1: Calculate products in numerator and denominator terms.</p>`;
        stepsHTML += mjx(`r = \\frac{${formatNumber(n_sumUV)} - ${formatNumber(sumU_sumV)}}{\\sqrt{[${formatNumber(n_sumU2)} - ${formatNumber(sumU_sq)}][${formatNumber(n_sumV2)} - ${formatNumber(sumV_sq)}]}}`);

        // Step 2: Simplify differences
        stepsHTML += `<p class="font-medium mt-3">Step 3.2: Calculate differences in numerator and denominator terms.</p>`;
        stepsHTML += mjx(`r = \\frac{${formatNumber(numerator)}}{\\sqrt{[${formatNumber(den_partU)}][${formatNumber(den_partV)}]}}`);
        
        // Step 3: Multiply terms under square root
        stepsHTML += `<p class="font-medium mt-3">Step 3.3: Multiply terms under the square root.</p>`;
        stepsHTML += mjx(`r = \\frac{${formatNumber(numerator)}}{\\sqrt{${formatNumber(den_sqrt_inside)}}}`);

        // Step 4: Calculate square root
        if (den_sqrt_inside < 0) {
             stepsHTML += `<p class="font-medium mt-3">Step 3.4: The value under the square root is negative (${formatNumber(den_sqrt_inside)}), so the denominator is undefined.</p>`;
             stepsHTML += mjx(`r = \\frac{${formatNumber(numerator)}}{\\text{undefined (sqrt of negative)}}`);
        } else {
            stepsHTML += `<p class="font-medium mt-3">Step 3.4: Calculate the square root.</p>`;
            stepsHTML += mjx(`r = \\frac{${formatNumber(numerator)}}{${formatNumber(denominator)}}`);
        }
        
        // Step 5: Final division
        stepsHTML += `<p class="font-medium mt-3">Step 3.5: Final calculation for r.</p>`;
        if (denominator === 0) {
            if (numerator === 0) {
                 stepsHTML += mjx(`r = \\frac{0}{0} = \\text{Undefined (0/0)}`);
                 stepsHTML += `<p class="mt-1">The result is undefined because both the numerator and denominator are zero. This often occurs when there\'s no variability in one or both sets of data.</p>`;
            } else {
                 stepsHTML += mjx(`r = \\frac{${formatNumber(numerator)}}{0} = \\text{Undefined (division by zero)}`);
                 stepsHTML += `<p class="mt-1">The result is undefined because the denominator is zero.</p>`;
            }
        } else if (isNaN(correlation)) {
             stepsHTML += mjx(`r = \\text{Invalid or Undefined}`);
             stepsHTML += `<p class="mt-1">The correlation could not be calculated (e.g., due to square root of a negative number or other mathematical issues).</p>`;
        }
        else {
            stepsHTML += mjx(`r = ${formatNumber(correlation)}`);
        }
        
        stepsHTML += `
            <h4 class="mt-4">Result:</h4>
            <p>The Pearson\'s correlation coefficient (r) is <strong>${formatNumber(correlation)}</strong>.</p>
            <p>${getCorrelationInterpretation(correlation)}</p>
        `;
        return stepsHTML;
    }
    
    // New method for Regression Calculation
    calculateRegression() {
        try {
            this.getInputData();
            validateInputs(this.xValues, this.yValues);

            const formulaSelect = document.getElementById('formulaSelect');
            const formula = formulaSelect ? formulaSelect.value : 'raw';

            this.isCalculatingRegression = true; // Set flag
            this.currentFormulaResults = {}; // Clear correlation results
            this.currentCorrelation = undefined; // Clear correlation value

            // Always calculate basic sums and means as they are useful for totals row and context
            const n = this.xValues.length;
            const sumX = this.xValues.reduce((a, b) => a + b, 0);
            const sumY = this.yValues.reduce((a, b) => a + b, 0);
            const sumX2 = this.xValues.reduce((s, v) => s + v * v, 0);
            const sumY2 = this.yValues.reduce((s, v) => s + v * v, 0);
            const sumXY = this.xValues.reduce((s, v, i) => s + v * this.yValues[i], 0);

            const xMean = calculateMean(this.xValues);
            const yMean = calculateMean(this.yValues);

            let slope = NaN;
            let intercept = NaN;
            let regressionStepsHtml = '';
            let regressionFormulaResults = {
                n, sumX, sumY, sumX2, sumY2, sumXY, xMean, yMean,
                assumedA: this.assumedMeanA, assumedB: this.assumedMeanB
            };

            this.updateTableHeaders(formula);
            this.updateTableRows(formula);

            switch (formula) {
                case 'raw':
                    regressionFormulaResults = { ...regressionFormulaResults, ...this.getRawScoresForRegression() };
                    slope = this.calculateSlopeRawScores(regressionFormulaResults);
                    intercept = this.calculateIntercept(yMean, slope, xMean);
                    regressionStepsHtml = this.getRegressionRawScoresSteps(slope, intercept, regressionFormulaResults);
                    break;
                case 'mean':
                    regressionFormulaResults = { ...regressionFormulaResults, ...this.getMeanDeviationSumsForRegression(xMean, yMean) };
                    slope = this.calculateSlopeMeanDeviation(regressionFormulaResults);
                    intercept = this.calculateIntercept(yMean, slope, xMean);
                    regressionStepsHtml = this.getRegressionMeanDeviationSteps(slope, intercept, regressionFormulaResults);
                    break;
                case 'assumed':
                    regressionFormulaResults = { ...regressionFormulaResults, ...this.getAssumedMeanSumsForRegression(this.assumedMeanA, this.assumedMeanB) };
                    slope = this.calculateSlopeAssumedMean(regressionFormulaResults);
                    intercept = this.calculateIntercept(yMean, slope, xMean);
                    regressionStepsHtml = this.getRegressionAssumedMeanSteps(slope, intercept, regressionFormulaResults);
                    break;
                default:
                    console.error("Unknown formula selected for regression:", formula);
                    regressionStepsHtml = `<p class="text-red-500">Error: Unknown formula selected for regression.</p>`;
            }

            this.currentRegressionResults = { slope, intercept, ...regressionFormulaResults }; // Store all regression related results
            
            this.updateScatterPlot(); // This will now use currentRegressionResults for the line
            this.updateResultsRegression(slope, intercept); // New function to update regression results
            this.updateStepByStepSolutionRegression(regressionStepsHtml); // New function to display regression steps

            this.displayTotalsRow(formula, regressionFormulaResults);


        } catch (error) {
            alert(error.message);
            console.error("Error during regression calculation:", error);
            this.clearResultsAndTable();
            this.updateResultsRegression(NaN, NaN);
            this.updateStepByStepSolutionRegression(`<p class="text-red-500">Error during regression calculation: ${error.message}</p>`);
        } finally {
            this.isCalculatingRegression = false; // Reset flag
        }
    }

    // Helper functions for regression calculations
    getRawScoresForRegression() {
        const n = this.xValues.length;
        const sumX = this.xValues.reduce((a, b) => a + b, 0);
        const sumY = this.yValues.reduce((a, b) => a + b, 0);
        const sumXY = this.xValues.reduce((s, x, i) => s + x * this.yValues[i], 0);
        const sumX2 = this.xValues.reduce((s, v) => s + v * v, 0);
        return { n, sumX, sumY, sumXY, sumX2 };
    }

    calculateSlopeRawScores({ n, sumX, sumY, sumXY, sumX2 }) {
        const numerator = n * sumXY - sumX * sumY;
        const denominator = n * sumX2 - sumX * sumX;
        return denominator === 0 ? (numerator === 0 ? NaN : (numerator > 0 ? Infinity : -Infinity)) : numerator / denominator;
    }

    getMeanDeviationSumsForRegression(xMean, yMean) {
        const sumProdDev = this.xValues.reduce((sum, x, i) => sum + (x - xMean) * (this.yValues[i] - yMean), 0);
        const sumXDevSq = this.xValues.reduce((sum, x) => sum + Math.pow(x - xMean, 2), 0);
        return { sumProdDev, sumXDevSq };
    }

    calculateSlopeMeanDeviation({ sumProdDev, sumXDevSq }) {
        return sumXDevSq === 0 ? (sumProdDev === 0 ? NaN : (sumProdDev > 0 ? Infinity : -Infinity)) : sumProdDev / sumXDevSq;
    }

    getAssumedMeanSumsForRegression(assumedA, assumedB) {
        const n = this.xValues.length;
        const uValues = this.xValues.map(x => x - assumedA);
        const vValues = this.yValues.map(y => y - assumedB);

        const sumU = uValues.reduce((sum, val) => sum + val, 0);
        const sumV = vValues.reduce((sum, val) => sum + val, 0);
        const sumUV = uValues.reduce((sum, u, i) => sum + u * vValues[i], 0);
        const sumU2 = uValues.reduce((sum, val) => sum + val * val, 0);
        
        return { n, sumU, sumV, sumUV, sumU2, uValues, vValues };
    }

    calculateSlopeAssumedMean({ n, sumU, sumV, sumUV, sumU2 }) {
        const numerator = n * sumUV - sumU * sumV;
        const denominator = n * sumU2 - sumU * sumU;
        return denominator === 0 ? (numerator === 0 ? NaN : (numerator > 0 ? Infinity : -Infinity)) : numerator / denominator;
    }

    calculateIntercept(yMean, slope, xMean) {
        return yMean - slope * xMean;
    }

    // New methods to update regression specific UI
    updateResultsRegression(slope, intercept) {
        const rValueEl = document.querySelector('.text-3xl'); // This element is typically for 'r'
        const interpretationEl = document.querySelector('.p-4.bg-gray-50:nth-child(2) p');
        const rValueHeaderEl = document.querySelector('.p-4.bg-gradient-to-r h3'); // Select the header element
        
        if (rValueHeaderEl) {
            rValueHeaderEl.textContent = 'Regression Equation (ŷ)'; // Update the header text
        } else {
            console.error("R value header element not found");
        }

        if (rValueEl) {
            if (isNaN(slope) || isNaN(intercept)) {
                rValueEl.textContent = 'Invalid';
            } else {
                rValueEl.textContent = `ŷ = ${formatNumber(intercept)} + ${formatNumber(slope)}x`;
            }
        } else console.error("R value element not found");

        if (interpretationEl) {
            if (isNaN(slope) || isNaN(intercept)) {
                interpretationEl.textContent = 'Cannot compute regression: Invalid data or calculation (e.g. not enough data points or no variance in X).';
            } else {
                interpretationEl.textContent = `The estimated linear regression equation is ŷ = ${formatNumber(intercept)} + ${formatNumber(slope)}x`;
            }
        } else console.error("Interpretation element not found");
    }

    updateStepByStepSolutionRegression(stepsHtml) {
        const solutionDiv = document.querySelector('.prose');
        if (!solutionDiv) {
            console.error("Solution div not found");
            return;
        }
        solutionDiv.innerHTML = stepsHtml;
        if (window.MathJax) {
            if (window.MathJax.typesetPromise) {
                console.log("Calling MathJax.typesetPromise() for regression steps");
                window.MathJax.typesetPromise([solutionDiv]).catch(err => console.error("MathJax typesetPromise error:", err));
            } else if (window.MathJax.typeset) {
                console.log("Calling MathJax.typeset() for regression steps");
                try {
                    window.MathJax.typeset([solutionDiv]);
                } catch (err) {
                    console.error("MathJax typeset error:", err);
                }
            } else {
                console.error("MathJax.typesetPromise and MathJax.typeset not found. Cannot render LaTeX.");
            }
        } else {
            console.error("MathJax object not found. Cannot render LaTeX.");
        }
    }

    // Regression Step-by-Step HTML Generation Functions
    getRegressionRawScoresSteps(slope, intercept, { n, sumX, sumY, sumXY, sumX2, xMean, yMean }) {
        const numerator_b = n * sumXY - sumX * sumY;
        const denominator_b = n * sumX2 - sumX * sumX;

        const mjx = (latex) => `<div class="math-display my-2" style="overflow-x: auto;">$$ ${latex} $$</div>`;

        let stepsHTML = `
            <h3>Step-by-Step Solution (Raw Scores Method for Regression)</h3>
            <p>The formula for the slope (b) of the regression line is:</p>
            ${mjx(`b = \\frac{n\\sum xy - (\\sum x)(\\sum y)}{n\\sum x^2 - (\\sum x)^2}`)}
            
            <h4>1. Calculate the slope (b):</h4>
            <ul class="list-disc pl-5 space-y-1">
                <li>n (Number of pairs) = ${n}</li>
                <li>∑x (Sum of X values) = ${formatNumber(sumX)}</li>
                <li>∑y (Sum of Y values) = ${formatNumber(sumY)}</li>
                <li>∑x² (Sum of squared X values) = ${formatNumber(sumX2)}</li>
                <li>∑xy (Sum of X*Y products) = ${formatNumber(sumXY)}</li>
            </ul>
            ${mjx(`b = \\frac{(${n} \\cdot ${formatNumber(sumXY)}) - (${formatNumber(sumX)} \\cdot ${formatNumber(sumY)})}{(${n} \\cdot ${formatNumber(sumX2)}) - (${formatNumber(sumX)})^2}`)}
            ${mjx(`b = \\frac{${formatNumber(n * sumXY)} - ${formatNumber(sumX * sumY)}}{${formatNumber(n * sumX2)} - ${formatNumber(sumX * sumX)}}`)}
        `;
        if (denominator_b === 0) {
            stepsHTML += mjx(`b = \\frac{${formatNumber(numerator_b)}}{0} = \\text{Undefined (division by zero)}`);
            stepsHTML += `<p class="mt-1">The slope is undefined because the denominator (variance of X) is zero, indicating no variability in X values.</p>`;
        } else {
            stepsHTML += mjx(`b = \\frac{${formatNumber(numerator_b)}}{${formatNumber(denominator_b)}} = ${formatNumber(slope)}`);
        }

        stepsHTML += `
            <h4 class="mt-4">2. Calculate the Y-intercept (a):</h4>
            <p>The formula for the Y-intercept (a) is:</p>
            ${mjx(`a = \\bar{y} - b\\bar{x}`)}
            <ul class="list-disc pl-5 space-y-1">
                <li>x̄ (Mean of X) = ${formatNumber(xMean)}</li>
                <li>ȳ (Mean of Y) = ${formatNumber(yMean)}</li>
                <li>b (Slope) = ${formatNumber(slope)}</li>
            </ul>
            ${mjx(`a = ${formatNumber(yMean)} - (${formatNumber(slope)}) \\cdot (${formatNumber(xMean)})`)}
            ${mjx(`a = ${formatNumber(yMean)} - ${formatNumber(slope * xMean)}`)}
            ${mjx(`a = ${formatNumber(intercept)}`)}
            
            <h4 class="mt-4">3. Formulate the Regression Line Equation:</h4>
            <p>The linear regression line equation is:</p>
            ${mjx(`\\hat{y} = a + bx`)}
            ${mjx(`\\hat{y} = ${formatNumber(intercept)} + ${formatNumber(slope)}x`)}

            <h4 class="mt-4">Result:</h4>
            <p>The estimated linear regression equation is <strong>ŷ = ${formatNumber(intercept)} + ${formatNumber(slope)}x</strong>.</p>
        `;
        return stepsHTML;
    }

    getRegressionMeanDeviationSteps(slope, intercept, { xMean, yMean, sumProdDev, sumXDevSq }) {
        const mjx = (latex) => `<div class="math-display my-2" style="overflow-x: auto;">$$ ${latex} $$</div>`;

        let stepsHTML = `
            <h3>Step-by-Step Solution (Mean-Deviation Method for Regression)</h3>
            <p>The formula for the slope (b) of the regression line is:</p>
            ${mjx(`b = \\frac{\\sum (x - \\bar{x})(y - \\bar{y})}{\\sum (x - \\bar{x})^2}`)}
            
            <h4>1. Calculate the slope (b):</h4>
            <ul class="list-disc pl-5 space-y-1">
                <li>∑(x - x̄)(y - ȳ) = ${formatNumber(sumProdDev)}</li>
                <li>∑(x - x̄)² = ${formatNumber(sumXDevSq)}</li>
            </ul>
        `;
        if (sumXDevSq === 0) {
            stepsHTML += mjx(`b = \\frac{${formatNumber(sumProdDev)}}{0} = \\text{Undefined (division by zero)}`);
            stepsHTML += `<p class="mt-1">The slope is undefined because the denominator (sum of squared X deviations) is zero, indicating no variability in X values.</p>`;
        } else {
            stepsHTML += mjx(`b = \\frac{${formatNumber(sumProdDev)}}{${formatNumber(sumXDevSq)}} = ${formatNumber(slope)}`);
        }

        stepsHTML += `
            <h4 class="mt-4">2. Calculate the Y-intercept (a):</h4>
            <p>The formula for the Y-intercept (a) is:</p>
            ${mjx(`a = \\bar{y} - b\\bar{x}`)}
            <ul class="list-disc pl-5 space-y-1">
                <li>x̄ (Mean of X) = ${formatNumber(xMean)}</li>
                <li>ȳ (Mean of Y) = ${formatNumber(yMean)}</li>
                <li>b (Slope) = ${formatNumber(slope)}</li>
            </ul>
            ${mjx(`a = ${formatNumber(yMean)} - (${formatNumber(slope)}) \\cdot (${formatNumber(xMean)})`)}
            ${mjx(`a = ${formatNumber(yMean)} - ${formatNumber(slope * xMean)}`)}
            ${mjx(`a = ${formatNumber(intercept)}`)}
            
            <h4 class="mt-4">3. Formulate the Regression Line Equation:</h4>
            <p>The linear regression line equation is:</p>
            ${mjx(`\\hat{y} = a + bx`)}
            ${mjx(`\\hat{y} = ${formatNumber(intercept)} + ${formatNumber(slope)}x`)}

            <h4 class="mt-4">Result:</h4>
            <p>The estimated linear regression equation is <strong>ŷ = ${formatNumber(intercept)} + ${formatNumber(slope)}x</strong>.</p>
        `;
        return stepsHTML;
    }

    getRegressionAssumedMeanSteps(slope, intercept, { n, assumedA, assumedB, sumU, sumV, sumUV, sumU2, xMean, yMean }) {
        const numerator_b_assumed = n * sumUV - sumU * sumV;
        const denominator_b_assumed = n * sumU2 - sumU * sumU;

        const mjx = (latex) => `<div class="math-display my-2" style="overflow-x: auto;">$$ ${latex} $$</div>`;

        let stepsHTML = `
            <h3>Step-by-Step Solution (Assumed Mean Method for Regression)</h3>
            <p>Let A = ${formatNumber(assumedA)} (Assumed Mean for X) and B = ${formatNumber(assumedB)} (Assumed Mean for Y).</p>
            <p>Derived values: u = X - A and v = Y - B.</p>
            <p>The formula for the slope (b) of the regression line using u and v is:</p>
            ${mjx(`b = \\frac{n\\sum uv - (\\sum u)(\\sum v)}{n\\sum u^2 - (\\sum u)^2}`)}
            
            <h4>1. Calculate the slope (b):</h4>
            <ul class="list-disc pl-5 space-y-1">
                <li>n (Number of pairs) = ${n}</li>
                <li>∑u (Sum of u values) = ${formatNumber(sumU)}</li>
                <li>∑v (Sum of v values) = ${formatNumber(sumV)}</li>
                <li>∑u² (Sum of squared u values) = ${formatNumber(sumU2)}</li>
                <li>∑uv (Sum of u*v products) = ${formatNumber(sumUV)}</li>
            </ul>
            ${mjx(`b = \\frac{(${n} \\cdot ${formatNumber(sumUV)}) - (${formatNumber(sumU)} \\cdot ${formatNumber(sumV)})}{(${n} \\cdot ${formatNumber(sumU2)}) - (${formatNumber(sumU)})^2}`)}
            ${mjx(`b = \\frac{${formatNumber(n * sumUV)} - ${formatNumber(sumU * sumV)}}{${formatNumber(n * sumU2)} - ${formatNumber(sumU * sumU)}}`)}
        `;
        if (denominator_b_assumed === 0) {
            stepsHTML += mjx(`b = \\frac{${formatNumber(numerator_b_assumed)}}{0} = \\text{Undefined (division by zero)}`);
            stepsHTML += `<p class="mt-1">The slope is undefined because the denominator (variance of U) is zero, indicating no variability in X values.</p>`;
        } else {
            stepsHTML += mjx(`b = \\frac{${formatNumber(numerator_b_assumed)}}{${formatNumber(denominator_b_assumed)}} = ${formatNumber(slope)}`);
        }

        stepsHTML += `
            <h4 class="mt-4">2. Calculate the Y-intercept (a):</h4>
            <p>The formula for the Y-intercept (a) is:</p>
            ${mjx(`a = \\bar{y} - b\\bar{x}`)}
            <ul class="list-disc pl-5 space-y-1">
                <li>x̄ (Mean of X) = ${formatNumber(xMean)}</li>
                <li>ȳ (Mean of Y) = ${formatNumber(yMean)}</li>
                <li>b (Slope) = ${formatNumber(slope)}</li>
            </ul>
            ${mjx(`a = ${formatNumber(yMean)} - (${formatNumber(slope)}) \\cdot (${formatNumber(xMean)})`)}
            ${mjx(`a = ${formatNumber(yMean)} - ${formatNumber(slope * xMean)}`)}
            ${mjx(`a = ${formatNumber(intercept)}`)}
            
            <h4 class="mt-4">3. Formulate the Regression Line Equation:</h4>
            <p>The linear regression line equation is:</p>
            ${mjx(`\\hat{y} = a + bx`)}
            ${mjx(`\\hat{y} = ${formatNumber(intercept)} + ${formatNumber(slope)}x`)}

            <h4 class="mt-4">Result:</h4>
            <p>The estimated linear regression equation is <strong>ŷ = ${formatNumber(intercept)} + ${formatNumber(slope)}x</strong>.</p>
        `;
        return stepsHTML;
    }

    solve() {
        try {
            this.getInputData(); 
            validateInputs(this.xValues, this.yValues); 

            const formulaSelect = document.getElementById('formulaSelect');
            const formula = formulaSelect ? formulaSelect.value : 'raw';
            let resultsForSteps = {
                // Initialize all possible keys that displayTotalsRow and step-by-step might need
                n: 0, sumX: 0, sumY: 0, sumX2: 0, sumY2: 0, sumXY: 0,
                xMean: NaN, yMean: NaN, sumXDevSq: 0, sumYDevSq: 0, sumProdDev: 0,
                assumedA: NaN, assumedB: NaN, uValues: [], vValues: [], 
                sumU: 0, sumV: 0, sumU2: 0, sumV2: 0, sumUV: 0
            };
            let correlation = NaN; 

            console.log(`Starting solve for formula: ${formula}`);

            this.updateTableHeaders(formula);
            this.updateTableRows(formula);

            // Always calculate basic sums as they are useful for totals row and context
            resultsForSteps.n = this.xValues.length;
            if (resultsForSteps.n > 0) {
                resultsForSteps.sumX = this.xValues.reduce((a,b)=>a+b,0);
                resultsForSteps.sumY = this.yValues.reduce((a,b)=>a+b,0);
                resultsForSteps.sumX2 = this.xValues.reduce((s,v)=>s+v*v,0);
                resultsForSteps.sumY2 = this.yValues.reduce((s,v)=>s+v*v,0);
                resultsForSteps.sumXY = this.xValues.reduce((s,v,i)=>s+v*this.yValues[i],0);
            }

            switch (formula) {
                case 'raw':
                    correlation = calculateCorrelationRawScores(this.xValues, this.yValues);
                    // Basic sums already calculated above
                    break;
                case 'mean':
                    if (this.xValues.length > 0) { 
                        resultsForSteps.xMean = calculateMean(this.xValues);
                        resultsForSteps.yMean = calculateMean(this.yValues);
                        correlation = calculateCorrelationMeanDeviation(this.xValues, this.yValues);
                        resultsForSteps.sumXDevSq = this.xValues.reduce((s,x)=>s+Math.pow(x-resultsForSteps.xMean,2),0);
                        resultsForSteps.sumYDevSq = this.yValues.reduce((s,y)=>s+Math.pow(y-resultsForSteps.yMean,2),0);
                        resultsForSteps.sumProdDev = this.xValues.reduce((s,x,i)=>s+(x-resultsForSteps.xMean)*(this.yValues[i]-resultsForSteps.yMean),0);
                    } else {
                        correlation = NaN;
                    }
                    break;
                case 'assumed':
                    const assumedResult = calculateCorrelationAssumedMean(this.xValues, this.yValues, this.assumedMeanA, this.assumedMeanB);
                    correlation = assumedResult.correlation;
                    // Merge assumedResult into resultsForSteps, ensuring basic sums (n, sumX etc.) are preserved if not in assumedResult
                    resultsForSteps = { ...resultsForSteps, ...assumedResult }; 
                    resultsForSteps.assumedA = this.assumedMeanA; // Ensure these are set from the class properties
                    resultsForSteps.assumedB = this.assumedMeanB;
                    break;
                default:
                    console.error("Unknown formula selected in solve():", formula);
                    correlation = NaN; 
            }
            
            console.log("Calculated correlation:", correlation);
            console.log("Results for steps:", resultsForSteps);

            this.currentCorrelation = correlation;
            this.currentFormulaResults = resultsForSteps;
            this.currentRegressionResults = {}; // Clear regression results

            this.updateScatterPlot();
            this.updateResults(correlation);
            this.updateStepByStepSolution();
            this.displayTotalsRow(formula, this.currentFormulaResults);

        } catch (error) {
            alert(error.message); 
            console.error("Error during solve process:", error);
            this.clearResultsAndTable();
            this.updateResults(NaN); 
            this.updateStepByStepSolution(); 
        }
    }

    displayTotalsRow(formula, sums) {
        const tableElement = document.getElementById('dataTable').parentElement;
        if (!tableElement) {
            console.error("Table element not found in displayTotalsRow");
            return;
        }

        let tfoot = tableElement.querySelector('tfoot');
        if (tfoot) {
            tfoot.remove(); // Remove existing tfoot to refresh
        }
        tfoot = document.createElement('tfoot');
        tfoot.classList.add('bg-gray-100', 'font-semibold');

        const totalsRow = document.createElement('tr');
        let cellsHTML = `
            <td class="px-4 py-2 text-sm text-gray-700 text-left">Total: ${formatNumber(sums.sumX)}</td>
            <td class="px-4 py-2 text-sm text-gray-700 text-center">${formatNumber(sums.sumY)}</td>
        `;

        if (formula === 'raw') {
            cellsHTML += `
                <td class="px-4 py-2 text-sm text-gray-700 text-center">${formatNumber(sums.sumX2)}</td>
                <td class="px-4 py-2 text-sm text-gray-700 text-center">${formatNumber(sums.sumY2)}</td>
                <td class="px-4 py-2 text-sm text-gray-700 text-center">${formatNumber(sums.sumXY)}</td>
            `;
        } else if (formula === 'mean') {
            // For mean deviation, the direct sums of (x-x̄) and (y-ȳ) are always 0. 
            // The relevant sums are sumXDevSq, sumYDevSq, sumProdDev.
            cellsHTML += `
                <td class="px-4 py-2 text-sm text-gray-700 text-center">0</td> <!-- sum(x-x̄) -->
                <td class="px-4 py-2 text-sm text-gray-700 text-center">0</td> <!-- sum(y-ȳ) -->
                <td class="px-4 py-2 text-sm text-gray-700 text-center">${formatNumber(sums.sumXDevSq)}</td>
                <td class="px-4 py-2 text-sm text-gray-700 text-center">${formatNumber(sums.sumYDevSq)}</td>
                <td class="px-4 py-2 text-sm text-gray-700 text-center">${formatNumber(sums.sumProdDev)}</td>
            `;
        } else if (formula === 'assumed') {
            cellsHTML += `
                <td class="px-4 py-2 text-sm text-gray-700 text-center">${formatNumber(sums.sumU)}</td>
                <td class="px-4 py-2 text-sm text-gray-700 text-center">${formatNumber(sums.sumV)}</td>
                <td class="px-4 py-2 text-sm text-gray-700 text-center">${formatNumber(sums.sumU2)}</td>
                <td class="px-4 py-2 text-sm text-gray-700 text-center">${formatNumber(sums.sumV2)}</td>
                <td class="px-4 py-2 text-sm text-gray-700 text-center">${formatNumber(sums.sumUV)}</td>
            `;
        }

        totalsRow.innerHTML = cellsHTML;
        tfoot.appendChild(totalsRow);
        tableElement.appendChild(tfoot);
    }
}
