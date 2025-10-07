class CentralTendencyCalculator {
    constructor() {
        this.dataType = 'ungrouped'; // Default data type
        this.meanMethod = 'direct'; // Default mean calculation method
        this.moreThanLessThanType = 'more-than'; // Default for the new toggle
        this.activeQuantile = 'quartile'; // Default active quantile tab
        this.initializeEventListeners();
        this.initializeInputWidths(); // Set initial widths on page load
    }

    initializeEventListeners() {
        const dataTypeSelector = document.getElementById('dataTypeSelector');
        if (dataTypeSelector) {
            dataTypeSelector.addEventListener('change', (e) => {
                this.dataType = e.target.value;
                this.updateTableVisibility();
            });
        }

        const addRowBtn = document.getElementById('addRowBtn');
        if (addRowBtn) {
            addRowBtn.addEventListener('click', () => this.addRow());
        }

        const dataEntryTables = document.getElementById('data-entry-tables');
        if (dataEntryTables) {
            dataEntryTables.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const target = e.target;
                    if (target.tagName === 'INPUT') {
                        e.preventDefault();
                        const currentRow = target.closest('tr');
                        const inputsInRow = Array.from(currentRow.querySelectorAll('input'));
                        const isLastInputInRow = inputsInRow.indexOf(target) === inputsInRow.length - 1;

                        if (isLastInputInRow) {
                            this.addRow();
                            const tableBody = this.getCurrentTableBody();
                            const newRow = tableBody.lastElementChild;
                            if (newRow) {
                                const firstInput = newRow.querySelector('input');
                                if (firstInput) {
                                    firstInput.focus();
                                }
                            }
                        } else {
                            const nextInput = inputsInRow[inputsInRow.indexOf(target) + 1];
                            if (nextInput) {
                                nextInput.focus();
                            }
                        }
                    }
                }
            });
        }
        
        // Add input event listener to adjust width dynamically
        if (dataEntryTables) {
            dataEntryTables.addEventListener('input', (e) => {
                if (e.target.tagName === 'INPUT') {
                    this.adjustInputWidth(e.target);
                }
            });
        }

        const moreLessToggle = document.getElementById('more-less-toggle');
        if (moreLessToggle) {
            moreLessToggle.addEventListener('change', (e) => {
                this.moreThanLessThanType = e.target.checked ? 'less-than' : 'more-than';
                this.updateMoreThanLessThanUI();
            });
        }

        // Event listeners for quantile tabs
        document.getElementById('selectQuartileBtn').addEventListener('click', () => this.setActiveQuantile('quartile'));
        document.getElementById('selectDecileBtn').addEventListener('click', () => this.setActiveQuantile('decile'));
        document.getElementById('selectPercentileBtn').addEventListener('click', () => this.setActiveQuantile('percentile'));

        const meanMethodSelector = document.getElementById('meanMethodSelector');
        if (meanMethodSelector) {
            meanMethodSelector.addEventListener('change', (e) => {
                this.meanMethod = e.target.value;
                this.updateMeanMethodUI();
            });
        }

        const calculateMeanBtn = document.getElementById('calculateMeanBtn');
        if (calculateMeanBtn) {
            calculateMeanBtn.addEventListener('click', () => this.calculateMean());
        }
    }

    initializeInputWidths() {
        const initialInputs = document.querySelectorAll('#data-entry-tables input');
        initialInputs.forEach(input => this.adjustInputWidth(input));
    }

    updateTableVisibility() {
        const ungroupedTable = document.getElementById('ungrouped-data-table-container');
        const discreteTable = document.getElementById('discrete-data-table-container');
        const continuousTable = document.getElementById('continuous-data-table-container');
        const moreThanLessThanTable = document.getElementById('more-than-less-than-data-table-container');
        const midValueTable = document.getElementById('mid-value-data-table-container');

        ungroupedTable.classList.add('hidden');
        discreteTable.classList.add('hidden');
        continuousTable.classList.add('hidden');
        moreThanLessThanTable.classList.add('hidden');
        midValueTable.classList.add('hidden');

        if (this.dataType === 'ungrouped') {
            ungroupedTable.classList.remove('hidden');
        } else if (this.dataType === 'discrete') {
            discreteTable.classList.remove('hidden');
        } else if (this.dataType === 'continuous') {
            continuousTable.classList.remove('hidden');
        } else if (this.dataType === 'more-than-less-than') {
            moreThanLessThanTable.classList.remove('hidden');
        } else if (this.dataType === 'mid-value') {
            midValueTable.classList.remove('hidden');
        }
    }

    setActiveQuantile(quantileType) {
        this.activeQuantile = quantileType;

        // Update tab styles
        document.querySelectorAll('.quantile-tab-btn').forEach(btn => {
            btn.classList.remove('active', 'border-blue-500', 'font-semibold', 'text-blue-600');
            btn.classList.add('text-gray-500', 'hover:text-gray-700');
        });
        const activeBtn = document.getElementById(`select${quantileType.charAt(0).toUpperCase() + quantileType.slice(1)}Btn`);
        activeBtn.classList.add('active', 'border-blue-500', 'font-semibold', 'text-blue-600');
        activeBtn.classList.remove('text-gray-500', 'hover:text-gray-700');

        // Update form visibility
        document.querySelectorAll('.quantile-input-form').forEach(form => {
            form.classList.add('hidden');
        });
        document.getElementById(`${quantileType}-input-container`).classList.remove('hidden');
    }

    updateMoreThanLessThanUI() {
        const header = document.getElementById('more-less-than-header');
        const label = document.getElementById('more-less-label');
        if (header && label) {
            if (this.moreThanLessThanType === 'less-than') {
                header.textContent = 'Less Than Value';
                label.textContent = 'Less Than';
            } else {
                header.textContent = 'More Than Value';
                label.textContent = 'More Than';
            }
        }
    }

    updateMeanMethodUI() {
        const assumedMeanContainer = document.getElementById('assumed-mean-container');
        const classIntervalContainer = document.getElementById('class-interval-container');

        if (this.meanMethod === 'shortcut') {
            assumedMeanContainer.classList.remove('hidden');
            classIntervalContainer.classList.add('hidden');
        } else if (this.meanMethod === 'step-deviation') {
            assumedMeanContainer.classList.remove('hidden');
            classIntervalContainer.classList.remove('hidden');
        } else {
            assumedMeanContainer.classList.add('hidden');
            classIntervalContainer.classList.add('hidden');
        }
    }

    getCurrentTableBody() {
        if (this.dataType === 'ungrouped') {
            return document.getElementById('ungrouped-data-table');
        } else if (this.dataType === 'discrete') {
            return document.getElementById('discrete-data-table');
        } else if (this.dataType === 'continuous') {
            return document.getElementById('continuous-data-table');
        } else if (this.dataType === 'more-than-less-than') {
            return document.getElementById('more-than-less-than-data-table');
        } else if (this.dataType === 'mid-value') {
            return document.getElementById('mid-value-data-table');
        }
        return null;
    }

    addRow() {
        const tableBody = this.getCurrentTableBody();
        if (!tableBody) return;

        const newRow = document.createElement('tr');
        let rowHtml = '';

        if (this.dataType === 'ungrouped') {
            rowHtml = `
                <td class="px-4 py-2"><input type="number" step="any"></td>
            `;
        } else if (this.dataType === 'discrete') {
            rowHtml = `
                <td class="px-4 py-2"><input type="number" step="any"></td>
                <td class="px-4 py-2"><input type="number" step="any"></td>
            `;
        } else if (this.dataType === 'continuous') {
            rowHtml = `
                <td class="px-4 py-2"><input type="text" placeholder="e.g., 10-20"></td>
                <td class="px-4 py-2"><input type="number" step="any"></td>
            `;
        } else if (this.dataType === 'more-than-less-than') {
            rowHtml = `
                <td class="px-4 py-2"><input type="number" step="any"></td>
                <td class="px-4 py-2"><input type="number" step="any"></td>
            `;
        } else if (this.dataType === 'mid-value') {
            rowHtml = `
                <td class="px-4 py-2"><input type="number" step="any"></td>
                <td class="px-4 py-2"><input type="number" step="any"></td>
            `;
        }
        
        newRow.innerHTML = rowHtml;
        tableBody.appendChild(newRow);

        // Adjust the width of the inputs in the new row
        newRow.querySelectorAll('input').forEach(input => this.adjustInputWidth(input));
    }
    
    adjustInputWidth(input) {
        const minWidth = 150; // Corresponds to the min-width in CSS
        // Create a temporary span to measure the text width
        const span = document.createElement('span');
        span.style.visibility = 'hidden';
        span.style.position = 'absolute';
        span.style.whiteSpace = 'pre';
        span.style.fontSize = window.getComputedStyle(input).fontSize;
        span.style.fontFamily = window.getComputedStyle(input).fontFamily;
        span.textContent = input.value || input.placeholder;
        
        document.body.appendChild(span);
        const textWidth = span.getBoundingClientRect().width;
        document.body.removeChild(span);
        
        // Set the new width, respecting the minimum width
        const newWidth = Math.max(minWidth, textWidth + 20); // Add some padding
        input.style.width = `${newWidth}px`;
    }

    calculateMean() {
        switch (this.dataType) {
            case 'ungrouped':
                this.calculateUngroupedMean();
                break;
            case 'discrete':
                this.calculateDiscreteMean();
                break;
            case 'continuous':
                this.calculateContinuousMean();
                break;
            case 'mid-value':
                this.calculateMidValueMean();
                break;
            case 'more-than-less-than':
                this.calculateMoreThanLessThanMean();
                break;
            // Other cases will be added here
        }
        // Hide the converted CF table if another calculation is run
        if (this.dataType !== 'more-than-less-than' && this.dataType !== 'mid-value') {
            const convertedCfTableContainer = document.getElementById('converted-cf-table-container');
            if (convertedCfTableContainer) {
                convertedCfTableContainer.classList.add('hidden');
            }
        }
    }

    getAssumedMean() {
        const assumedMeanInput = document.getElementById('assumedMean');
        const a = parseFloat(assumedMeanInput.value);
        if (isNaN(a)) {
            alert('Please enter a valid number for the Assumed Mean (A).');
            return null;
        }
        return a;
    }

    getClassInterval() {
        const classIntervalInput = document.getElementById('classInterval');
        const c = parseFloat(classIntervalInput.value);
        if (isNaN(c) || c === 0) {
            alert('Please enter a valid, non-zero number for the Class Interval (c).');
            return null;
        }
        return c;
    }

    calculateMoreThanLessThanMean() {
        const data = this.getMoreThanLessThanData();
        if (data.length < 2) {
            alert('Please enter at least two rows of data for conversion.');
            return;
        }
    
        const convertedData = this.convertCfToFrequencyDistribution(data, this.moreThanLessThanType);
    
        let sumFx = 0;
        let sumF = 0;
        const calculationSteps = convertedData.map(item => {
            const midValue = (item.lower + item.upper) / 2;
            const fx = midValue * item.f;
            sumF += item.f;
            sumFx += fx;
            return { ...item, midValue, fx };
        });
    
        if (sumF === 0) {
            alert('Total frequency cannot be zero after conversion.');
            return;
        }
    
        const mean = sumFx / sumF;
    
        this.displayResults({ Mean: mean.toFixed(4) });
        this.populateConvertedCfTable(calculationSteps, sumF, sumFx);
        this.displayMoreThanLessThanMeanSolution(sumF, sumFx, mean, this.moreThanLessThanType);
    }

    populateConvertedCfTable(calculationSteps, sumF, sumFx) {
        const tableContainer = document.getElementById('converted-cf-table-container');
        const tableBody = document.getElementById('converted-cf-table-body');
        const fTotalCell = document.getElementById('converted-cf-f-total');
        const fxTotalCell = document.getElementById('converted-cf-fx-total');
    
        tableBody.innerHTML = ''; // Clear previous data
    
        calculationSteps.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-4 py-2 whitespace-nowrap">${item.lower} - ${item.upper}</td>
                <td class="px-4 py-2 whitespace-nowrap">${item.f}</td>
                <td class="px-4 py-2 whitespace-nowrap">${item.midValue.toFixed(2)}</td>
                <td class="px-4 py-2 whitespace-nowrap">${item.fx.toFixed(2)}</td>
            `;
            tableBody.appendChild(row);
        });
    
        fTotalCell.innerHTML = `$\\Sigma f = ${sumF}$`;
        fxTotalCell.innerHTML = `$\\Sigma fx = ${sumFx.toFixed(2)}$`;
    
        tableContainer.classList.remove('hidden');

        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([fTotalCell, fxTotalCell]);
        }
    }

    getMoreThanLessThanData() {
        const tableBody = document.getElementById('more-than-less-than-data-table');
        const rows = tableBody.querySelectorAll('tr');
        const data = [];
        rows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length === 2) {
                const value = parseFloat(inputs[0].value);
                const cf = parseFloat(inputs[1].value);
                if (!isNaN(value) && !isNaN(cf)) {
                    data.push({ value, cf });
                }
            }
        });
        // Sort data by value just in case it's not entered in order
        return data.sort((a, b) => a.value - b.value);
    }

    convertCfToFrequencyDistribution(data, type) {
        const distribution = [];
        if (type === 'less-than') {
            let prevCf = 0;
            let prevValue = 0;
            // Assuming the first class starts from 0 if not specified otherwise.
            // A better approach might be to take the first value as the upper limit of the first class.
            // Let's assume the first value given is the first upper limit, and the lower limit is 0, or the previous upper limit.
            
            // For example, if data is [{'value': 10, 'cf': 5}, {'value': 20, 'cf': 12}]
            // First class: 0-10, f = 5
            // Second class: 10-20, f = 12-5=7
            
            // Let's find the class interval assuming it's uniform
            const interval = data[1].value - data[0].value;
            prevValue = data[0].value - interval; // Estimate a starting lower bound.
            if(prevValue < 0) prevValue = 0;


            for (let i = 0; i < data.length; i++) {
                const lower = i === 0 ? prevValue : data[i-1].value;
                const upper = data[i].value;
                const f = data[i].cf - prevCf;
                distribution.push({ lower, upper, f });
                prevCf = data[i].cf;
            }
        } else { // more-than
            for (let i = 0; i < data.length - 1; i++) {
                const lower = data[i].value;
                const upper = data[i + 1].value;
                const f = data[i].cf - data[i + 1].cf;
                distribution.push({ lower, upper, f });
            }
            // For the last class, we assume the same class interval
            const lastItem = data[data.length - 2];
            const lastCf = data[data.length - 1].cf;
            if (lastCf > 0) {
                const lower = data[data.length-1].value;
                const interval = lastItem ? (data[data.length-1].value - lastItem.value) : (data[data.length-1].value - data[data.length-2].value);
                const upper = lower + interval;
                distribution.push({ lower, upper, f: lastCf });
            }
        }
        return distribution;
    }

    calculateContinuousMean() {
        this.resetContinuousTable();
        const tableBody = document.getElementById('continuous-data-table');
        const rows = Array.from(tableBody.querySelectorAll('tr'));
        const data = this.getContinuousData();
        if (data.length === 0) return alert('Please enter some data.');

        let sumF = 0, sumFx = 0, sumFd = 0, sumFu = 0;
        let A = null, c = null;
        const table = document.getElementById('continuous-table');

        if (this.meanMethod !== 'direct') {
            A = this.getAssumedMean();
            if (A === null) return;
            table.querySelector('.mid-value-header').classList.remove('hidden');
            table.querySelector('.deviation-header').classList.remove('hidden');
            table.querySelector('.fd-header').classList.remove('hidden');
        }
        if (this.meanMethod === 'step-deviation') {
            c = this.getClassInterval();
            if (c === null) return;
            table.querySelector('.step-deviation-header').classList.remove('hidden');
            table.querySelector('.fu-header').classList.remove('hidden');
        }
        if (this.meanMethod === 'direct') {
            table.querySelector('.fx-header-cont').classList.remove('hidden');
        }

        data.forEach((item, index) => {
            const row = rows[index];
            const midValue = (item.lower + item.upper) / 2;
            sumF += item.f;

            // Direct Method
            if (this.meanMethod === 'direct') {
                const fx = midValue * item.f;
                sumFx += fx;
                
                const midValueCell = document.createElement('td');
                midValueCell.className = 'px-4 py-2 whitespace-nowrap mid-value-col-cell';
                midValueCell.textContent = midValue.toFixed(2);
                row.appendChild(midValueCell);

                const fxCell = document.createElement('td');
                fxCell.className = 'px-4 py-2 whitespace-nowrap fx-col-cell-cont';
                fxCell.textContent = fx.toFixed(2);
                row.appendChild(fxCell);
            }

            // Shortcut & Step Deviation
            if (this.meanMethod !== 'direct') {
                const midValueCell = document.createElement('td');
                midValueCell.className = 'px-4 py-2 whitespace-nowrap mid-value-col-cell';
                midValueCell.textContent = midValue.toFixed(2);
                row.appendChild(midValueCell);

                const d = midValue - A;
                const dCell = document.createElement('td');
                dCell.className = 'px-4 py-2 whitespace-nowrap deviation-col';
                dCell.textContent = d.toFixed(2);
                row.appendChild(dCell);

                let u = null;
                if (this.meanMethod === 'step-deviation') {
                    u = d / c;
                    const uCell = document.createElement('td');
                    uCell.className = 'px-4 py-2 whitespace-nowrap step-deviation-col';
                    uCell.textContent = u.toFixed(2);
                    row.appendChild(uCell);
                }

                const fd = d * item.f;
                sumFd += fd;
                const fdCell = document.createElement('td');
                fdCell.className = 'px-4 py-2 whitespace-nowrap fd-col';
                fdCell.textContent = fd.toFixed(2);
                row.appendChild(fdCell);

                if (this.meanMethod === 'step-deviation') {
                    const fu = u * item.f;
                    sumFu += fu;
                    const fuCell = document.createElement('td');
                    fuCell.className = 'px-4 py-2 whitespace-nowrap fu-col';
                    fuCell.textContent = fu.toFixed(2);
                    row.appendChild(fuCell);
                }
            }
        });

        const tfoot = document.getElementById('continuous-data-table-foot');
        if (tfoot) {
            tfoot.querySelector('#continuous-f-total').innerHTML = `$\\Sigma f = ${sumF}$`;
            if (this.meanMethod === 'direct') {
                const fxTotalCell = tfoot.querySelector('.fx-total-cell');
                fxTotalCell.innerHTML = `$\\Sigma fx = ${sumFx.toFixed(2)}$`;
                tfoot.querySelector('.mid-value-total-cell').classList.remove('hidden');
                fxTotalCell.classList.remove('hidden');
            } else if (this.meanMethod === 'shortcut') {
                const fdTotalCell = tfoot.querySelector('.fd-total-cell');
                fdTotalCell.innerHTML = `$\\Sigma fd = ${sumFd.toFixed(2)}$`;
                tfoot.querySelector('.mid-value-total-cell').classList.remove('hidden');
                tfoot.querySelector('.d-total-cell').classList.remove('hidden');
                fdTotalCell.classList.remove('hidden');
            } else if (this.meanMethod === 'step-deviation') {
                const fdTotalCell = tfoot.querySelector('.fd-total-cell');
                const fuTotalCell = tfoot.querySelector('.fu-total-cell');
                fdTotalCell.innerHTML = `$\\Sigma fd = ${sumFd.toFixed(2)}$`;
                fuTotalCell.innerHTML = `$\\Sigma fu = ${sumFu.toFixed(2)}$`;
                tfoot.querySelector('.mid-value-total-cell').classList.remove('hidden');
                tfoot.querySelector('.d-total-cell').classList.remove('hidden');
                tfoot.querySelector('.u-total-cell').classList.remove('hidden');
                fdTotalCell.classList.remove('hidden');
                fuTotalCell.classList.remove('hidden');
            }
            tfoot.classList.remove('hidden');
            if (typeof MathJax !== 'undefined') MathJax.typesetPromise([tfoot]);
        }

        // Final calculation and solution display will be implemented later
        if (this.meanMethod === 'direct') {
            if (sumF === 0) return alert('Total frequency cannot be zero.');
            const mean = sumFx / sumF;
            this.displayResults({ Mean: mean.toFixed(4) });
            this.displayContinuousMeanSolution(sumFx, sumF, mean);
        } else {
            if (sumF === 0) return alert('Total frequency cannot be zero.');
            let mean;
            if (this.meanMethod === 'shortcut') {
                mean = A + sumFd / sumF;
                this.displayResults({ Mean: mean.toFixed(4) });
                this.displayGroupedMeanShortcutSolution(A, sumFd, sumF, mean, 'Continuous');
            } else if (this.meanMethod === 'step-deviation') {
                mean = A + (sumFu / sumF) * c;
                this.displayResults({ Mean: mean.toFixed(4) });
                this.displayGroupedMeanStepDeviationSolution(A, sumFu, sumF, c, mean, 'Continuous');
            }
        }
    }

    calculateMidValueMean() {
        const data = this.getMidValueData().sort((a, b) => a.x - b.x);
        if (data.length < 2) {
            alert('Please enter at least two rows to determine the class interval.');
            return;
        }
    
        const h = data[1].x - data[0].x; // class width
        let sumFx = 0;
        let sumF = 0;
    
        const calculationSteps = data.map(item => {
            const lower = item.x - h / 2;
            const upper = item.x + h / 2;
            const fx = item.x * item.f;
            sumF += item.f;
            sumFx += fx;
            return { lower, upper, midValue: item.x, f: item.f, fx };
        });
    
        if (sumF === 0) {
            alert('Total frequency cannot be zero.');
            return;
        }
    
        const mean = sumFx / sumF;
    
        this.displayResults({ Mean: mean.toFixed(4) });
        this.populateConvertedCfTable(calculationSteps, sumF, sumFx);
        this.displayMidValueMeanSolution(sumF, sumFx, mean);
    }

    getMidValueData() {
        const tableBody = document.getElementById('mid-value-data-table');
        const rows = tableBody.querySelectorAll('tr');
        const data = [];
        rows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length === 2) {
                const x = parseFloat(inputs[0].value);
                const f = parseFloat(inputs[1].value);
                if (!isNaN(x) && !isNaN(f)) {
                    data.push({ x, f });
                }
            }
        });
        return data;
    }

    getContinuousData() {
        const tableBody = document.getElementById('continuous-data-table');
        const rows = tableBody.querySelectorAll('tr');
        const data = [];
        rows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            const interval = inputs[0].value.split('-').map(s => parseFloat(s.trim()));
            const f = parseFloat(inputs[1].value);
            if (interval.length === 2 && !isNaN(interval[0]) && !isNaN(interval[1]) && !isNaN(f)) {
                data.push({ lower: interval[0], upper: interval[1], f });
            }
        });
        return data;
    }

    resetContinuousTable() {
        const table = document.getElementById('continuous-table');
        if (!table) return;

        table.querySelectorAll('.mid-value-header, .fx-header-cont, .deviation-header, .step-deviation-header, .fd-header, .fu-header').forEach(h => h.classList.add('hidden'));
        const tfoot = table.querySelector('tfoot');
        if (tfoot) {
            tfoot.classList.add('hidden');
            tfoot.querySelectorAll('.mid-value-total-cell, .fx-total-cell, .d-total-cell, .u-total-cell, .fd-total-cell, .fu-total-cell').forEach(c => c.classList.add('hidden'));
        }

        table.querySelectorAll('.mid-value-col-cell, .fx-col-cell-cont, .deviation-col, .step-deviation-col, .fd-col, .fu-col').forEach(cell => cell.remove());
    }

    calculateDiscreteMean() {
        this.resetDiscreteTable();
        const tableBody = document.getElementById('discrete-data-table');
        const rows = Array.from(tableBody.querySelectorAll('tr'));
        const data = this.getDiscreteData();
        if (data.length === 0) return alert('Please enter some data.');

        let sumF = 0, sumFx = 0, sumFd = 0, sumFu = 0;
        let A = null, c = null;
        const table = document.getElementById('discrete-table');

        if (this.meanMethod !== 'direct') {
            A = this.getAssumedMean();
            if (A === null) return;
            table.querySelector('.deviation-header').classList.remove('hidden');
            table.querySelector('.fd-header').classList.remove('hidden');
        }
        if (this.meanMethod === 'step-deviation') {
            c = this.getClassInterval();
            if (c === null) return;
            table.querySelector('.step-deviation-header').classList.remove('hidden');
            table.querySelector('.fu-header').classList.remove('hidden');
        }
        if (this.meanMethod === 'direct') {
            table.querySelector('.fx-header').classList.remove('hidden');
        }

        data.forEach((item, index) => {
            const row = rows[index];
            sumF += item.f;

            if (this.meanMethod === 'direct') {
                const fx = item.x * item.f;
                sumFx += fx;
                const fxCell = document.createElement('td');
                fxCell.className = 'px-4 py-2 whitespace-nowrap fx-col-cell';
                fxCell.textContent = fx.toFixed(2);
                row.appendChild(fxCell);
            } else { // Shortcut or Step-Deviation
                const d = item.x - A;
                const dCell = document.createElement('td');
                dCell.className = 'px-4 py-2 whitespace-nowrap deviation-col';
                dCell.textContent = d.toFixed(2);
                row.appendChild(dCell);

                let u = null;
                if (this.meanMethod === 'step-deviation') {
                    u = d / c;
                    const uCell = document.createElement('td');
                    uCell.className = 'px-4 py-2 whitespace-nowrap step-deviation-col';
                    uCell.textContent = u.toFixed(2);
                    row.appendChild(uCell);
                }

                const fd = d * item.f;
                sumFd += fd;
                const fdCell = document.createElement('td');
                fdCell.className = 'px-4 py-2 whitespace-nowrap fd-col';
                fdCell.textContent = fd.toFixed(2);
                row.appendChild(fdCell);

                if (this.meanMethod === 'step-deviation') {
                    const fu = u * item.f;
                    sumFu += fu;
                    const fuCell = document.createElement('td');
                    fuCell.className = 'px-4 py-2 whitespace-nowrap fu-col';
                    fuCell.textContent = fu.toFixed(2);
                    row.appendChild(fuCell);
                }
            }
        });
        
        const tfoot = document.getElementById('discrete-data-table-foot');
        if (tfoot) {
            tfoot.querySelector('#discrete-f-total').innerHTML = `$\\Sigma f = ${sumF}$`;
            if (this.meanMethod === 'direct') {
                const fxTotalCell = tfoot.querySelector('.fx-total-cell');
                fxTotalCell.innerHTML = `$\\Sigma fx = ${sumFx.toFixed(2)}$`;
                fxTotalCell.classList.remove('hidden');
            } else if (this.meanMethod === 'shortcut') {
                const fdTotalCell = tfoot.querySelector('.fd-total-cell');
                fdTotalCell.innerHTML = `$\\Sigma fd = ${sumFd.toFixed(2)}$`;
                tfoot.querySelector('.d-total-cell').classList.remove('hidden');
                fdTotalCell.classList.remove('hidden');
            } else if (this.meanMethod === 'step-deviation') {
                const fdTotalCell = tfoot.querySelector('.fd-total-cell');
                const fuTotalCell = tfoot.querySelector('.fu-total-cell');
                fdTotalCell.innerHTML = `$\\Sigma fd = ${sumFd.toFixed(2)}$`;
                fuTotalCell.innerHTML = `$\\Sigma fu = ${sumFu.toFixed(2)}$`;
                tfoot.querySelector('.d-total-cell').classList.remove('hidden');
                tfoot.querySelector('.u-total-cell').classList.remove('hidden');
                fdTotalCell.classList.remove('hidden');
                fuTotalCell.classList.remove('hidden');
            }
            tfoot.classList.remove('hidden');
            if (typeof MathJax !== 'undefined') MathJax.typesetPromise([tfoot]);
        }

        // Final calculation and solution display will be implemented later
        if (this.meanMethod === 'direct') {
            if (sumF === 0) return alert('Total frequency cannot be zero.');
            const mean = sumFx / sumF;
            this.displayResults({ Mean: mean.toFixed(4) });
            this.displayDiscreteMeanSolution(sumFx, sumF, mean);
        } else {
            if (sumF === 0) return alert('Total frequency cannot be zero.');
            let mean;
            if (this.meanMethod === 'shortcut') {
                mean = A + sumFd / sumF;
                this.displayResults({ Mean: mean.toFixed(4) });
                this.displayGroupedMeanShortcutSolution(A, sumFd, sumF, mean, 'Discrete');
            } else if (this.meanMethod === 'step-deviation') {
                mean = A + (sumFu / sumF) * c;
                this.displayResults({ Mean: mean.toFixed(4) });
                this.displayGroupedMeanStepDeviationSolution(A, sumFu, sumF, c, mean, 'Discrete');
            }
        }
    }

    resetDiscreteTable() {
        const table = document.getElementById('discrete-table');
        if (!table) return;

        table.querySelectorAll('.fx-header, .deviation-header, .step-deviation-header, .fd-header, .fu-header').forEach(h => h.classList.add('hidden'));
        const tfoot = table.querySelector('tfoot');
        if (tfoot) {
            tfoot.classList.add('hidden');
            tfoot.querySelectorAll('.fx-total-cell, .d-total-cell, .u-total-cell, .fd-total-cell, .fu-total-cell').forEach(c => c.classList.add('hidden'));
        }

        table.querySelectorAll('.fx-col-cell, .deviation-col, .step-deviation-col, .fd-col, .fu-col').forEach(cell => cell.remove());
    }

    getDiscreteData() {
        const tableBody = document.getElementById('discrete-data-table');
        const rows = tableBody.querySelectorAll('tr');
        const data = [];
        rows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length === 2) {
                const x = parseFloat(inputs[0].value);
                const f = parseFloat(inputs[1].value);
                if (!isNaN(x) && !isNaN(f)) {
                    data.push({ x, f });
                }
            }
        });
        return data;
    }

    getUngroupedData() {
        const tableBody = document.getElementById('ungrouped-data-table');
        const inputs = tableBody.querySelectorAll('input');
        const data = [];
        inputs.forEach(input => {
            const value = parseFloat(input.value);
            if (!isNaN(value)) {
                data.push(value);
            }
        });
        return data;
    }

    displayResults(results) {
        const resultsContainer = document.getElementById('results-container');
        resultsContainer.innerHTML = ''; // Clear previous results

        for (const key in results) {
            const resultCard = `
                <div class="bg-gray-50 p-4 rounded-lg shadow-sm border">
                    <h4 class="text-sm font-medium text-gray-600">${key}</h4>
                    <p class="text-2xl font-semibold text-gray-900">${results[key]}</p>
                </div>
            `;
            resultsContainer.innerHTML += resultCard;
        }
    }

    displayMidValueMeanSolution(sumFx, sumF, mean) {
        const solutionContainer = document.getElementById('step-by-step-solution-container');
        const solutionSteps = document.getElementById('solution-steps');
        
        solutionContainer.classList.remove('hidden');

        solutionSteps.innerHTML = `
            <h3 class="font-semibold text-lg">Calculating the Mean for Mid-Value Data</h3>
            <p>First, we determine the class intervals from the mid-values and then calculate fx. The full distribution is shown in the table above.</p>
            <p><strong>Formula:</strong></p>
            <p>$$ \\bar{x} = \\frac{\\Sigma fx}{\\Sigma f} $$</p>
            <p>Where:</p>
            <ul>
                <li>$x$ is the mid-value.</li>
                <li>$\\Sigma fx$ is the sum of the products of mid-values and frequencies.</li>
                <li>$\\Sigma f$ is the sum of all frequencies.</li>
            </ul>
            <p><strong>Calculation:</strong></p>
            <p>$$ \\bar{x} = \\frac{${sumFx.toFixed(2)}}{${sumF}} = ${mean.toFixed(4)} $$</p>
            <p><strong>The mean for the given data is ${mean.toFixed(4)}.</strong></p>
        `;

        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([solutionSteps]);
        }
    }

    displayContinuousMeanSolution(sumFx, sumF, mean) {
        const solutionContainer = document.getElementById('step-by-step-solution-container');
        const solutionSteps = document.getElementById('solution-steps');
        
        solutionContainer.classList.remove('hidden');

        solutionSteps.innerHTML = `
            <h3 class="font-semibold text-lg">Calculating the Mean for Continuous Data</h3>
            <p>First, we find the mid-value (x) for each class interval. Then, we calculate fx for each class.</p>
            <p><strong>Formula:</strong></p>
            <p>$$ \\bar{x} = \\frac{\\Sigma fx}{\\Sigma f} $$</p>
            <p>Where:</p>
            <ul>
                <li>$x$ is the mid-value of the class interval.</li>
                <li>$\\Sigma fx$ is the sum of the products of mid-values and frequencies.</li>
                <li>$\\Sigma f$ is the sum of all frequencies.</li>
            </ul>
            <p><strong>Calculation:</strong></p>
            <p>$$ \\bar{x} = \\frac{${sumFx.toFixed(2)}}{${sumF}} = ${mean.toFixed(4)} $$</p>
            <p><strong>The mean for the given data is ${mean.toFixed(4)}.</strong></p>
        `;

        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([solutionSteps]);
        }
    }

    displayDiscreteMeanSolution(sumFx, sumF, mean) {
        const solutionContainer = document.getElementById('step-by-step-solution-container');
        const solutionSteps = document.getElementById('solution-steps');
        
        solutionContainer.classList.remove('hidden');

        solutionSteps.innerHTML = `
            <h3 class="font-semibold text-lg">Calculating the Mean for Discrete Data</h3>
            <p><strong>Formula:</strong></p>
            <p>$$ \\bar{x} = \\frac{\\Sigma fx}{\\Sigma f} $$</p>
            <p>Where:</p>
            <ul>
                <li>$\\Sigma fx$ is the sum of the products of observations and frequencies.</li>
                <li>$\\Sigma f$ is the sum of all frequencies.</li>
            </ul>
            <p><strong>Calculation:</strong></p>
            <p>$$ \\bar{x} = \\frac{${sumFx}}{${sumF}} = ${mean.toFixed(4)} $$</p>
            <p><strong>The mean for the given data is ${mean.toFixed(4)}.</strong></p>
        `;

        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([solutionSteps]);
        }
    }

    displayUngroupedMeanSolution(sum, n, mean) {
        const solutionContainer = document.getElementById('step-by-step-solution-container');
        const solutionSteps = document.getElementById('solution-steps');
        
        solutionContainer.classList.remove('hidden');

        solutionSteps.innerHTML = `
            <h3 class="font-semibold text-lg">Calculating the Mean for Ungrouped Data</h3>
            <p><strong>Formula:</strong></p>
            <p>$$ \\bar{x} = \\frac{\\Sigma x}{n} $$</p>
            <p>Where:</p>
            <ul>
                <li>$\\Sigma x$ is the sum of all observations.</li>
                <li>$n$ is the number of observations.</li>
            </ul>
            <p><strong>Calculation:</strong></p>
            <p>$$ \\bar{x} = \\frac{${sum}}{${n}} = ${mean.toFixed(4)} $$</p>
            <p><strong>The mean for the given data is ${mean.toFixed(4)}.</strong></p>
        `;

        // Re-render MathJax if it's available
        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([solutionSteps]);
        }
    }

    displayMoreThanLessThanMeanSolution(sumF, sumFx, mean, type) {
        const solutionContainer = document.getElementById('step-by-step-solution-container');
        const solutionSteps = document.getElementById('solution-steps');
        solutionContainer.classList.remove('hidden');

        solutionSteps.innerHTML = `
            <h3 class="font-semibold text-lg">Calculating the Mean for ${type === 'less-than' ? 'Less Than' : 'More Than'} Data</h3>
            <p>First, we convert the cumulative frequency distribution into a simple frequency distribution, which is shown in the table above. Then we calculate the mid-value (x) for each class and the product fx.</p>
            <p><strong>Formula:</strong></p>
            <p>$$ \\bar{x} = \\frac{\\Sigma fx}{\\Sigma f} $$</p>
            <p><strong>Calculation:</strong></p>
            <p>$$ \\bar{x} = \\frac{${sumFx.toFixed(2)}}{${sumF}} = ${mean.toFixed(4)} $$</p>
            <p><strong>The mean for the given data is ${mean.toFixed(4)}.</strong></p>
        `;

        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([solutionSteps]);
        }
    }

    calculateUngroupedMean() {
        this.resetUngroupedTable();
        const tableBody = document.getElementById('ungrouped-data-table');
        const rows = Array.from(tableBody.querySelectorAll('tr'));
        const data = this.getUngroupedData();
        if (data.length === 0) return alert('Please enter some data.');

        let sumD = 0, sumU = 0;
        let A = null, c = null;

        if (this.meanMethod === 'shortcut' || this.meanMethod === 'step-deviation') {
            A = this.getAssumedMean();
            if (A === null) return;
            document.querySelector('#ungrouped-table .deviation-header').classList.remove('hidden');
        }
        if (this.meanMethod === 'step-deviation') {
            c = this.getClassInterval();
            if (c === null) return;
            document.querySelector('#ungrouped-table .step-deviation-header').classList.remove('hidden');
        }

        data.forEach((value, index) => {
            const row = rows[index];
            if (this.meanMethod === 'shortcut' || this.meanMethod === 'step-deviation') {
                const d = value - A;
                sumD += d;
                const dCell = document.createElement('td');
                dCell.className = 'px-4 py-2 whitespace-nowrap deviation-col';
                dCell.textContent = d.toFixed(2);
                row.appendChild(dCell);

                if (this.meanMethod === 'step-deviation') {
                    const u = d / c;
                    sumU += u;
                    const uCell = document.createElement('td');
                    uCell.className = 'px-4 py-2 whitespace-nowrap step-deviation-col';
                    uCell.textContent = u.toFixed(2);
                    row.appendChild(uCell);
                }
            }
        });

        if (this.meanMethod !== 'direct') {
            const tfoot = document.getElementById('ungrouped-data-table-foot');
            if (tfoot) {
                const dTotalCell = tfoot.querySelector('.d-total-cell');
                dTotalCell.innerHTML = `$\\Sigma d = ${sumD.toFixed(2)}$`;
                dTotalCell.classList.remove('hidden');

                if (this.meanMethod === 'step-deviation') {
                    const uTotalCell = tfoot.querySelector('.u-total-cell');
                    uTotalCell.innerHTML = `$\\Sigma u = ${sumU.toFixed(2)}$`;
                    uTotalCell.classList.remove('hidden');
                }
                tfoot.classList.remove('hidden');
                if (typeof MathJax !== 'undefined') {
                    MathJax.typesetPromise([tfoot]);
                }
            }
        }
        
        if (this.meanMethod === 'direct') {
            const sum = data.reduce((acc, val) => acc + val, 0);
            const n = data.length;
            const mean = sum / n;
            this.displayResults({ Mean: mean.toFixed(4) });
            this.displayUngroupedMeanSolution(sum, n, mean);
        } else {
            const n = data.length;
            let mean;
            if (this.meanMethod === 'shortcut') {
                mean = A + sumD / n;
                this.displayResults({ Mean: mean.toFixed(4) });
                this.displayUngroupedMeanShortcutSolution(A, sumD, n, mean);
            } else if (this.meanMethod === 'step-deviation') {
                mean = A + (sumU / n) * c;
                this.displayResults({ Mean: mean.toFixed(4) });
                this.displayUngroupedMeanStepDeviationSolution(A, sumU, n, c, mean);
            }
        }
    }

    resetUngroupedTable() {
        const table = document.getElementById('ungrouped-data-table');
        if (!table) return;

        table.querySelectorAll('.deviation-header, .step-deviation-header').forEach(h => h.classList.add('hidden'));
        const tfoot = table.querySelector('tfoot');
        if (tfoot) {
            tfoot.classList.add('hidden');
            tfoot.querySelectorAll('.d-total-cell, .u-total-cell').forEach(c => c.classList.add('hidden'));
        }

        table.querySelectorAll('.deviation-col, .step-deviation-col').forEach(cell => cell.remove());
    }

    displayUngroupedMeanShortcutSolution(A, sumD, n, mean) {
        const solutionContainer = document.getElementById('step-by-step-solution-container');
        const solutionSteps = document.getElementById('solution-steps');
        solutionContainer.classList.remove('hidden');

        solutionSteps.innerHTML = `
            <h3 class="font-semibold text-lg">Calculating the Mean for Ungrouped Data (Shortcut Method)</h3>
            <p>The table above shows the calculation of the deviation (d) from the Assumed Mean (A = ${A}).</p>
            <p><strong>Formula:</strong></p>
            <p>$$ \\bar{x} = A + \\frac{\\Sigma d}{n} $$</p>
            <p><strong>Calculation:</strong></p>
            <p>$$ \\bar{x} = ${A} + \\frac{${sumD.toFixed(2)}}{${n}} = ${mean.toFixed(4)} $$</p>
            <p><strong>The mean for the given data is ${mean.toFixed(4)}.</strong></p>
        `;

        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([solutionSteps]);
        }
    }

    displayUngroupedMeanStepDeviationSolution(A, sumU, n, c, mean) {
        const solutionContainer = document.getElementById('step-by-step-solution-container');
        const solutionSteps = document.getElementById('solution-steps');
        solutionContainer.classList.remove('hidden');

        solutionSteps.innerHTML = `
            <h3 class="font-semibold text-lg">Calculating the Mean for Ungrouped Data (Step Deviation Method)</h3>
            <p>The table above shows the calculation of the deviation (d) from the Assumed Mean (A = ${A}) and the step-deviation (u) using a common factor (c = ${c}).</p>
            <p><strong>Formula:</strong></p>
            <p>$$ \\bar{x} = A + \\left( \\frac{\\Sigma u}{n} \\times c \\right) $$</p>
            <p><strong>Calculation:</strong></p>
            <p>$$ \\bar{x} = ${A} + \\left( \\frac{${sumU.toFixed(2)}}{${n}} \\times ${c} \\right) = ${mean.toFixed(4)} $$</p>
            <p><strong>The mean for the given data is ${mean.toFixed(4)}.</strong></p>
        `;

        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([solutionSteps]);
        }
    }

    displayGroupedMeanShortcutSolution(A, sumFd, sumF, mean, dataType) {
        const solutionContainer = document.getElementById('step-by-step-solution-container');
        const solutionSteps = document.getElementById('solution-steps');
        solutionContainer.classList.remove('hidden');

        solutionSteps.innerHTML = `
            <h3 class="font-semibold text-lg">Calculating the Mean for ${dataType} Data (Shortcut Method)</h3>
            <p>The table above shows the calculation of the deviation (d) from the Assumed Mean (A = ${A}) and the product of frequency and deviation (fd).</p>
            <p><strong>Formula:</strong></p>
            <p>$$ \\bar{x} = A + \\frac{\\Sigma fd}{\\Sigma f} $$</p>
            <p><strong>Calculation:</strong></p>
            <p>$$ \\bar{x} = ${A} + \\frac{${sumFd.toFixed(2)}}{${sumF}} = ${mean.toFixed(4)} $$</p>
            <p><strong>The mean for the given data is ${mean.toFixed(4)}.</strong></p>
        `;

        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([solutionSteps]);
        }
    }

    displayGroupedMeanStepDeviationSolution(A, sumFu, sumF, c, mean, dataType) {
        const solutionContainer = document.getElementById('step-by-step-solution-container');
        const solutionSteps = document.getElementById('solution-steps');
        solutionContainer.classList.remove('hidden');

        solutionSteps.innerHTML = `
            <h3 class="font-semibold text-lg">Calculating the Mean for ${dataType} Data (Step Deviation Method)</h3>
            <p>The table above shows the calculation of d, u (using c = ${c}), and fu based on the Assumed Mean (A = ${A}).</p>
            <p><strong>Formula:</strong></p>
            <p>$$ \\bar{x} = A + \\left( \\frac{\\Sigma fu}{\\Sigma f} \\times c \\right) $$</p>
            <p><strong>Calculation:</strong></p>
            <p>$$ \\bar{x} = ${A} + \\left( \\frac{${sumFu.toFixed(2)}}{${sumF}} \\times ${c} \\right) = ${mean.toFixed(4)} $$</p>
            <p><strong>The mean for the given data is ${mean.toFixed(4)}.</strong></p>
        `;

        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([solutionSteps]);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CentralTendencyCalculator();
});
