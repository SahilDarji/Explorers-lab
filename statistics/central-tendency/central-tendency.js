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

        const calculateModeBtn = document.getElementById('calculateModeBtn');
        if (calculateModeBtn) {
            calculateModeBtn.addEventListener('click', () => this.calculateMode());
        }

        const calculateMedianBtn = document.getElementById('calculateMedianBtn');
        if (calculateMedianBtn) {
            calculateMedianBtn.addEventListener('click', () => this.calculateMedian());
        }

        const calculateQuartileBtn = document.getElementById('calculateQuartileBtn');
        if (calculateQuartileBtn) {
            calculateQuartileBtn.addEventListener('click', () => this.calculateQuantile('quartile'));
        }

        const calculateDecileBtn = document.getElementById('calculateDecileBtn');
        if (calculateDecileBtn) {
            calculateDecileBtn.addEventListener('click', () => this.calculateQuantile('decile'));
        }

        const calculatePercentileBtn = document.getElementById('calculatePercentileBtn');
        if (calculatePercentileBtn) {
            calculatePercentileBtn.addEventListener('click', () => this.calculateQuantile('percentile'));
        }

        const toggleMeanSectionBtn = document.getElementById('toggleMeanSectionBtn');
        if (toggleMeanSectionBtn) {
            toggleMeanSectionBtn.addEventListener('click', () => this.toggleMeanSection());
        }
    }

    toggleMeanSection() {
        const meanSection = document.getElementById('mean-calculation-section');
        meanSection.classList.toggle('hidden');
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
        const meanAssumptions = document.getElementById('mean-assumptions');
        const assumedMeanContainer = document.getElementById('assumed-mean-container');
        const classIntervalContainer = document.getElementById('class-interval-container');

        if (this.meanMethod === 'direct') {
            meanAssumptions.classList.add('hidden');
        } else {
            meanAssumptions.classList.remove('hidden');
            if (this.meanMethod === 'shortcut') {
                assumedMeanContainer.classList.remove('hidden');
                classIntervalContainer.classList.add('hidden');
            } else if (this.meanMethod === 'step-deviation') {
                assumedMeanContainer.classList.remove('hidden');
                classIntervalContainer.classList.remove('hidden');
            }
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
        document.getElementById('grouping-method-container').classList.add('hidden');
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

    calculateMode() {
        if (this.dataType !== 'more-than-less-than' && this.dataType !== 'mid-value') {
            const convertedCfTableContainer = document.getElementById('converted-cf-table-container');
            if (convertedCfTableContainer) {
                convertedCfTableContainer.classList.add('hidden');
            }
        }
        switch (this.dataType) {
            case 'ungrouped':
                this.calculateUngroupedMode();
                break;
            case 'discrete':
                this.calculateDiscreteMode();
                break;
            case 'continuous':
                this.calculateContinuousMode();
                break;
            case 'more-than-less-than':
                this.calculateMoreThanLessThanMode();
                break;
            case 'mid-value':
                this.calculateMidValueMode();
                break;
        }
    }

    calculateContinuousMode() {
        const data = this.getContinuousData();
        if (data.length === 0) return alert('Please enter some data.');
        this._calculateModeFromContinuousData(data);
    }

    calculateMoreThanLessThanMode() {
        const data = this.getMoreThanLessThanData();
        if (data.length < 2) {
            alert('Please enter at least two rows of data for conversion.');
            return;
        }
        const convertedData = this.convertCfToFrequencyDistribution(data, this.moreThanLessThanType);
        
        this.populateConvertedCfTable(convertedData, null, null, { showFx: false });
        this._calculateModeFromContinuousData(convertedData);
    }

    calculateMidValueMode() {
        const data = this.getMidValueData().sort((a, b) => a.x - b.x);
        if (data.length < 2) {
            alert('Please enter at least two rows to determine the class interval.');
            return;
        }

        const h = data[1].x - data[0].x; // class width
        const convertedData = data.map(item => ({
            lower: item.x - h / 2,
            upper: item.x + h / 2,
            f: item.f,
        }));

        this.populateConvertedCfTable(convertedData, null, null, { showFx: false });
        this._calculateModeFromContinuousData(convertedData);
    }

    calculateContinuousModeByGrouping(data, reason = '') {
        const frequencies = data.map(d => d.f);
        const groupingColumns = [];

        // Column 2: Sums of 2s from the start
        const col2 = [];
        for (let i = 0; i < frequencies.length - 1; i += 2) {
            col2.push({ sum: frequencies[i] + frequencies[i + 1], indices: [i, i + 1] });
        }
        groupingColumns.push(col2);

        // Column 3: Sums of 2s, leaving the first
        const col3 = [];
        for (let i = 1; i < frequencies.length - 1; i += 2) {
            col3.push({ sum: frequencies[i] + frequencies[i + 1], indices: [i, i + 1] });
        }
        groupingColumns.push(col3);

        // Column 4: Sums of 3s from the start
        const col4 = [];
        for (let i = 0; i < frequencies.length - 2; i += 3) {
            col4.push({ sum: frequencies[i] + frequencies[i + 1] + frequencies[i + 2], indices: [i, i + 1, i + 2] });
        }
        groupingColumns.push(col4);

        // Column 5: Sums of 3s, leaving the first
        const col5 = [];
        for (let i = 1; i < frequencies.length - 2; i += 3) {
            col5.push({ sum: frequencies[i] + frequencies[i + 1] + frequencies[i + 2], indices: [i, i + 1, i + 2] });
        }
        groupingColumns.push(col5);

        // Column 6: Sums of 3s, leaving the first two
        const col6 = [];
        for (let i = 2; i < frequencies.length - 2; i += 3) {
            col6.push({ sum: frequencies[i] + frequencies[i + 1] + frequencies[i + 2], indices: [i, i + 1, i + 2] });
        }
        groupingColumns.push(col6);
        
        const analysisCounts = data.reduce((acc, item) => {
            const key = `${item.lower}-${item.upper}`;
            return { ...acc, [key]: 0 };
        }, {});

        const analysisTableRows = [];

        const allColumns = [data.map(d => d.f), ...groupingColumns];

        allColumns.forEach((column, colIndex) => {
            const analysisRow = data.reduce((acc, item) => {
                const key = `${item.lower}-${item.upper}`;
                return { ...acc, [key]: { ticked: false, sourceGroups: [] } };
            }, {});

            if (colIndex === 0) { 
                if (column.length > 0) {
                    const maxFreq = Math.max(...column);
                    column.forEach((freq, index) => {
                        if (freq === maxFreq) {
                            if(data[index]) {
                                const key = `${data[index].lower}-${data[index].upper}`;
                                analysisCounts[key]++;
                                analysisRow[key].ticked = true;
                                analysisRow[key].sourceGroups.push([index]);
                            }
                        }
                    });
                }
            } else { 
                if (column.length > 0) {
                    const maxSum = Math.max(...column.map(item => item.sum));
                    const maxItems = column.filter(item => item.sum === maxSum);

                    maxItems.forEach(group => {
                        group.indices.forEach(dataIndex => {
                            if (data[dataIndex]) {
                                const key = `${data[dataIndex].lower}-${data[dataIndex].upper}`;
                                analysisCounts[key]++;
                                analysisRow[key].ticked = true;
                                if (!analysisRow[key].sourceGroups.some(g => JSON.stringify(g) === JSON.stringify(group.indices))) {
                                    analysisRow[key].sourceGroups.push(group.indices);
                                }
                            }
                        });
                    });
                }
            }
            analysisTableRows.push(analysisRow);
        });

        const maxCount = Math.max(...Object.values(analysisCounts));
        const modalClassStrings = Object.keys(analysisCounts).filter(key => analysisCounts[key] === maxCount);

        const modalClassString = modalClassStrings[0];
        const modalClass = data.find(item => `${item.lower}-${item.upper}` === modalClassString);
        const modalClassIndex = data.indexOf(modalClass);

        const l = modalClass.lower;
        const fm = modalClass.f;
        const f1 = modalClassIndex > 0 ? data[modalClassIndex - 1].f : 0;
        const f2 = modalClassIndex < data.length - 1 ? data[modalClassIndex + 1].f : 0;
        const c = modalClass.upper - modalClass.lower;

        if ((2 * fm - f1 - f2) === 0) {
            this.displayResults({ Mode: 'Cannot be calculated' });
            this.displayModeSolution('The denominator in the mode formula is zero for the identified modal class.');
            return;
        }

        const mode = l + ((fm - f1) / (2 * fm - f1 - f2)) * c;

        this.displayResults({ Mode: mode.toFixed(4) });
        this.populateGroupingTableUI(data, groupingColumns, true);
        this.populateAnalysisTableUI(data, analysisTableRows, analysisCounts, true);
        this.displayContinuousModeSolution(l, fm, f1, f2, c, mode, true, reason);
    }

    _calculateModeFromContinuousData(data) {
        if (data.length === 0) return alert('Please enter some data.');
        document.getElementById('grouping-method-container').classList.add('hidden');

        let isUniform = true;
        if (data.length > 1) {
            const firstWidth = data[0].upper - data[0].lower;
            for (let i = 1; i < data.length; i++) {
                if ((data[i].upper - data[i].lower) !== firstWidth) {
                    isUniform = false;
                    break;
                }
            }
        }

        const maxFrequency = Math.max(...data.map(item => item.f));
        const modalClasses = data.filter(item => item.f === maxFrequency);

        if (modalClasses.length === 1 && isUniform) {
            const modalClass = modalClasses[0];
            const modalClassIndex = data.indexOf(modalClass);

            const l = modalClass.lower;
            const fm = modalClass.f;
            const f1 = modalClassIndex > 0 ? data[modalClassIndex - 1].f : 0;
            const f2 = modalClassIndex < data.length - 1 ? data[modalClassIndex + 1].f : 0;
            const c = modalClass.upper - modalClass.lower;

            if ((2 * fm - f1 - f2) === 0) {
                this.displayResults({ Mode: 'Cannot be calculated' });
                this.displayModeSolution('The denominator in the mode formula is zero, so the mode cannot be calculated.');
                return;
            }

            const mode = l + ((fm - f1) / (2 * fm - f1 - f2)) * c;

            this.displayResults({ Mode: mode.toFixed(4) });
            this.displayContinuousModeSolution(l, fm, f1, f2, c, mode, false);
        } else {
            let reason = '';
            if (!isUniform) {
                reason = 'the class intervals are unequal';
            }
            if (modalClasses.length > 1) {
                reason += (reason ? ' and ' : '') + 'there is a tie for the highest frequency';
            }
            this.calculateContinuousModeByGrouping(data, reason);
        }
    }

    calculateUngroupedMode() {
        const data = this.getUngroupedData();
        if (data.length === 0) return alert('Please enter some data.');

        const frequencyMap = data.reduce((acc, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
        }, {});

        let maxFrequency = 0;
        for (const val in frequencyMap) {
            if (frequencyMap[val] > maxFrequency) {
                maxFrequency = frequencyMap[val];
            }
        }

        if (maxFrequency === 1) {
            this.displayResults({ Mode: 'No mode' });
            this.displayModeSolution('No mode found (all values appear only once).');
            return;
        }

        const modes = Object.keys(frequencyMap).filter(val => frequencyMap[val] === maxFrequency);
        this.displayResults({ Mode: modes.join(', ') });
        this.displayModeSolution(`The value(s) appearing most frequently (${maxFrequency} times) is/are: ${modes.join(', ')}.`);
    }

    calculateDiscreteMode() {
        const data = this.getDiscreteData();
        if (data.length === 0) return alert('Please enter some data.');

        // Hide grouping table container initially
        document.getElementById('grouping-method-container').classList.add('hidden');

        let maxFrequency = 0;
        data.forEach(item => {
            if (item.f > maxFrequency) {
                maxFrequency = item.f;
            }
        });

        const modes = data.filter(item => item.f === maxFrequency).map(item => item.x);

        if (modes.length === 1) {
            this.displayResults({ Mode: modes.join(', ') });
            this.displayModeSolution(`The x value with the highest frequency (${maxFrequency}) is: ${modes.join(', ')}.`);
        } else {
            // Use grouping method if there's a tie for the highest frequency
            this.calculateModeByGrouping(data);
        }
    }

    calculateModeByGrouping(data) {
        const frequencies = data.map(d => d.f);
        const groupingColumns = [];

        // Column 1 is just the original frequencies, handled separately.
        
        // Column 2: Sums of 2s from the start
        const col2 = [];
        for (let i = 0; i < frequencies.length - 1; i += 2) {
            col2.push({ sum: frequencies[i] + frequencies[i + 1], indices: [i, i + 1] });
        }
        groupingColumns.push(col2);

        // Column 3: Sums of 2s, leaving the first
        const col3 = [];
        for (let i = 1; i < frequencies.length - 1; i += 2) {
            col3.push({ sum: frequencies[i] + frequencies[i + 1], indices: [i, i + 1] });
        }
        groupingColumns.push(col3);

        // Column 4: Sums of 3s from the start
        const col4 = [];
        for (let i = 0; i < frequencies.length - 2; i += 3) {
            col4.push({ sum: frequencies[i] + frequencies[i + 1] + frequencies[i + 2], indices: [i, i + 1, i + 2] });
        }
        groupingColumns.push(col4);

        // Column 5: Sums of 3s, leaving the first
        const col5 = [];
        for (let i = 1; i < frequencies.length - 2; i += 3) {
            col5.push({ sum: frequencies[i] + frequencies[i + 1] + frequencies[i + 2], indices: [i, i + 1, i + 2] });
        }
        groupingColumns.push(col5);

        // Column 6: Sums of 3s, leaving the first two
        const col6 = [];
        for (let i = 2; i < frequencies.length - 2; i += 3) {
            col6.push({ sum: frequencies[i] + frequencies[i + 1] + frequencies[i + 2], indices: [i, i + 1, i + 2] });
        }
        groupingColumns.push(col6);
        
        // Analysis Table
        const analysisCounts = data.reduce((acc, item) => ({ ...acc, [item.x]: 0 }), {});
        const analysisTableRows = [];

        const allColumns = [frequencies, ...groupingColumns];

        allColumns.forEach((column, colIndex) => {
            const analysisRow = data.reduce((acc, item) => ({ ...acc, [item.x]: { ticked: false, sourceGroups: [] } }), {});
            let values;
            if (colIndex === 0) { // Handling original frequencies (Column I)
                if (column.length > 0) {
                    const maxFreq = Math.max(...column);
                    column.forEach((freq, index) => {
                        if (freq === maxFreq) {
                            if(data[index]) {
                                const x = data[index].x;
                                analysisCounts[x]++;
                                analysisRow[x].ticked = true;
                                analysisRow[x].sourceGroups.push([index]);
                            }
                        }
                    });
                }
            } else { // Handling grouped columns (II-VI)
                values = column;
                if (values.length > 0) {
                    const maxSum = Math.max(...values.map(item => item.sum));
                    const maxItems = values.filter(item => item.sum === maxSum);

                    maxItems.forEach(group => {
                        group.indices.forEach(dataIndex => {
                            if (data[dataIndex]) {
                                const x = data[dataIndex].x;
                                analysisCounts[x]++;
                                analysisRow[x].ticked = true;
                                if (!analysisRow[x].sourceGroups.some(g => JSON.stringify(g) === JSON.stringify(group.indices))) {
                                    analysisRow[x].sourceGroups.push(group.indices);
                                }
                            }
                        });
                    });
                }
            }
            analysisTableRows.push(analysisRow);
        });

        const maxCount = Math.max(...Object.values(analysisCounts));
        const modes = Object.keys(analysisCounts).filter(x => analysisCounts[x] === maxCount);

        this.displayResults({ Mode: modes.join(', ') });
        this.populateGroupingTableUI(data, groupingColumns, false);
        this.populateAnalysisTableUI(data, analysisTableRows, analysisCounts, false);
        this.displayModeSolution(`After applying the grouping method, the mode(s) is/are: ${modes.join(', ')}.`);
    }

    addAnalysisTableInteractivity(data, analysisTableRows, isContinuous = false) {
        const tickCells = document.querySelectorAll('.analysis-tick-cell');
    
        tickCells.forEach(cell => {
            if (cell.innerText !== '✓') return;
    
            const colIndex = parseInt(cell.dataset.colIndex, 10);
            const xValue = cell.dataset.xValue;
            const sourceGroups = analysisTableRows[colIndex][xValue].sourceGroups;
    
            const highlight = (doAdd, isClick = false) => {
                sourceGroups.forEach(indices => {
                    const highlightClass = isClick ? 'bg-blue-300' : 'bg-blue-200';
    
                    indices.forEach(idx => {
                        const xCellId = isContinuous ? `group-class-${idx}` : `group-x-${idx}`;
                        document.getElementById(xCellId)?.classList.toggle(highlightClass, doAdd);
                        document.getElementById(`group-f-${idx}`)?.classList.toggle(highlightClass, doAdd);
                    });
    
                    if (indices.length > 1) {
                        const indicesStr = indices.join(',');
                        document.querySelector(`.group-sum-cell[data-indices="${indicesStr}"]`)?.classList.toggle(isClick ? 'bg-yellow-300' : 'bg-yellow-200', doAdd);
                    }
                });
            };
    
            let isClicked = false;
            cell.addEventListener('click', () => {
                isClicked = !isClicked;
                highlight(isClicked, true);
            });
    
            cell.addEventListener('mouseover', () => {
                if (!isClicked) highlight(true, false);
            });
            cell.addEventListener('mouseout', () => {
                if (!isClicked) highlight(false, false);
            });
        });
    }

    addGroupingTableInteractivity(isContinuous = false) {
        const table = document.getElementById('grouping-table');
        if (!table) return;
    
        const sumCells = table.querySelectorAll('.group-sum-cell');
    
        sumCells.forEach(cell => {
            const indices = cell.dataset.indices.split(',').map(Number);
    
            const highlight = (doAdd) => {
                indices.forEach(index => {
                    const xCellId = isContinuous ? `group-class-${index}` : `group-x-${index}`;
                    document.getElementById(xCellId)?.classList.toggle('bg-blue-200', doAdd);
                    document.getElementById(`group-f-${index}`)?.classList.toggle('bg-blue-200', doAdd);
                });
            };
    
            const toggleClickHighlight = () => {
                 indices.forEach(index => {
                    const xCellId = isContinuous ? `group-class-${index}` : `group-x-${index}`;
                    document.getElementById(xCellId)?.classList.toggle('bg-blue-300');
                    document.getElementById(`group-f-${index}`)?.classList.toggle('bg-blue-300');
                });
            }
    
            cell.addEventListener('mouseover', () => highlight(true));
            cell.addEventListener('mouseout', () => highlight(false));
            cell.addEventListener('click', toggleClickHighlight);
        });
    }

    populateGroupingTableUI(data, groupingColumns, isContinuous = false) {
        const table = document.getElementById('grouping-table');
        table.innerHTML = '';

        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr class="bg-gray-50">
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">${isContinuous ? 'Class' : 'x'}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">f (I)</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">II</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">III</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">IV</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">V</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">VI</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        for (let i = 0; i < data.length; i++) {
            const row = document.createElement('tr');
            const identifier = isContinuous ? `${data[i].lower}-${data[i].upper}` : data[i].x;
            const xCellId = isContinuous ? `group-class-${i}` : `group-x-${i}`;
            row.innerHTML = `<td id="${xCellId}" class="px-4 py-2 border">${identifier}</td><td id="group-f-${i}" class="px-4 py-2 border">${data[i].f}</td>`;

            for(let j=0; j<5; j++) { // For columns II to VI
                const column = groupingColumns[j];
                const group = column.find(g => g.indices[0] === i);
                if (group) {
                    row.innerHTML += `<td class="px-4 py-2 border group-sum-cell cursor-pointer" rowspan="${group.indices.length}" data-indices="${group.indices.join(',')}">${group.sum}</td>`;
                } else {
                    const isInGroup = column.some(g => g.indices.includes(i));
                    if (!isInGroup) {
                        row.innerHTML += `<td class="px-4 py-2 border"></td>`;
                    }
                }
            }
            tbody.appendChild(row);
        }
        table.appendChild(tbody);
        
        this.addGroupingTableInteractivity(isContinuous);
        document.getElementById('grouping-method-container').classList.remove('hidden');
    }

    populateAnalysisTableUI(data, analysisTableRows, analysisCounts, isContinuous = false) {
        const table = document.getElementById('analysis-table');
        table.innerHTML = '';
        table.classList.add('table-auto', 'w-auto', 'border-collapse');

        const thead = document.createElement('thead');
        let headerRow = '<tr class="bg-gray-50">';
        headerRow += `<th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border border-gray-300">Column</th>`;
        data.forEach(item => {
            const identifier = isContinuous ? `${item.lower}-${item.upper}` : item.x;
            headerRow += `<th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border border-gray-300">${identifier}</th>`;
        });
        headerRow += '</tr>';
        thead.innerHTML = headerRow;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        analysisTableRows.forEach((row, rowIndex) => {
            const tr = document.createElement('tr');
            let rowHtml = `<td class="px-4 py-2 font-semibold border border-gray-300">${['I', 'II', 'III', 'IV', 'V', 'VI'][rowIndex]}</td>`;
            data.forEach(item => {
                const identifier = isContinuous ? `${item.lower}-${item.upper}` : item.x;
                const cellData = row[identifier];
                rowHtml += `<td class="px-4 py-2 text-center border border-gray-300 ${cellData.ticked ? 'analysis-tick-cell cursor-pointer' : ''}"
                                data-col-index="${rowIndex}"
                                data-x-value="${identifier}">
                                ${cellData.ticked ? '✓' : ''}
                            </td>`;
            });
            tr.innerHTML = rowHtml;
            tbody.appendChild(tr);
        });

        const totalRow = document.createElement('tr');
        let totalRowHtml = `<td class="px-4 py-2 font-semibold border border-gray-300">Total</td>`;
        data.forEach(item => {
            const identifier = isContinuous ? `${item.lower}-${item.upper}` : item.x;
            totalRowHtml += `<td class="px-4 py-2 font-semibold text-center border border-gray-300">${analysisCounts[identifier]}</td>`;
        });
        totalRow.innerHTML = totalRowHtml;
        tbody.appendChild(totalRow);
        
        table.appendChild(tbody);
        this.addAnalysisTableInteractivity(data, analysisTableRows, isContinuous);
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
        this.populateConvertedCfTable(calculationSteps, sumF, sumFx, { showFx: true });
        this.displayMoreThanLessThanMeanSolution(sumF, sumFx, mean, this.moreThanLessThanType);
    }

    populateConvertedCfTable(calculationSteps, sumF, sumFx, options = { showFx: true }) {
        const tableContainer = document.getElementById('converted-cf-table-container');
        const tableBody = document.getElementById('converted-cf-table-body');
        const fTotalCell = document.getElementById('converted-cf-f-total');
        const fxTotalCell = document.getElementById('converted-cf-fx-total');
        const midValueHeader = document.getElementById('converted-cf-mid-value-header');
        const fxHeader = document.getElementById('converted-cf-fx-header');
        const midValueTotal = document.getElementById('converted-cf-mid-value-total');
        const cfHeader = document.getElementById('converted-cf-cf-header');
        const cfTotal = document.getElementById('converted-cf-cf-total');
    
        tableBody.innerHTML = ''; // Clear previous data

        fxTotalCell.classList.add('hidden');
        cfHeader.classList.add('hidden');
        cfTotal.classList.add('hidden');

        if (options.showFx) {
            midValueHeader.classList.remove('hidden');
            fxHeader.classList.remove('hidden');
            midValueTotal.classList.remove('hidden');
            fxTotalCell.classList.remove('hidden');
        } 
        
        if (options.showCf) {
            cfHeader.classList.remove('hidden');
        }
    
        let calculatedSumF = 0;
        calculationSteps.forEach(item => {
            const row = document.createElement('tr');
            let rowHTML = `
                <td class="px-4 py-2 whitespace-nowrap">${item.lower} - ${item.upper}</td>
                <td class="px-4 py-2 whitespace-nowrap">${item.f}</td>
            `;
            calculatedSumF += item.f;

            let cfCellHtml = '';
            if (options.showCf) {
                cfCellHtml = `<td class="px-4 py-2 whitespace-nowrap">${item.cf}</td>`;
            }

            let fxCellsHtml = '';
            if (options.showFx) {
                fxCellsHtml = `
                    <td class="px-4 py-2 whitespace-nowrap">${item.midValue.toFixed(2)}</td>
                    <td class="px-4 py-2 whitespace-nowrap">${item.fx.toFixed(2)}</td>
                `;
            }

            // This order must match the header order in index.html
            row.innerHTML = rowHTML + cfCellHtml + fxCellsHtml;
            tableBody.appendChild(row);
        });
    
        const finalSumF = sumF !== null ? sumF : calculatedSumF;
        fTotalCell.innerHTML = `$\\Sigma f = ${finalSumF}$`;
        if (options.showFx) {
            fxTotalCell.innerHTML = `$\\Sigma fx = ${sumFx.toFixed(2)}$`;
        } else {
            fxTotalCell.innerHTML = '';
        }

        if (options.showCf) {
            cfTotal.classList.remove('hidden');
            cfTotal.innerHTML = ''; // CF total is not a sum
        }
    
        tableContainer.classList.remove('hidden');

        if (typeof MathJax !== 'undefined') {
            const elementsToTypeset = [fTotalCell];
            if (options.showFx) {
                elementsToTypeset.push(fxTotalCell);
            }
            MathJax.typesetPromise(elementsToTypeset);
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
            table.querySelector('.mid-value-header').classList.remove('hidden');
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
        this.populateConvertedCfTable(calculationSteps, sumF, sumFx, { showFx: true });
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

        table.querySelectorAll('.fx-header, .deviation-header, .step-deviation-header, .fd-header, .fu-header, .cf-header').forEach(h => h.classList.add('hidden'));
        const tfoot = table.querySelector('tfoot');
        if (tfoot) {
            tfoot.classList.add('hidden');
            tfoot.querySelectorAll('.fx-total-cell, .d-total-cell, .u-total-cell, .fd-total-cell, .fu-total-cell, .cf-total-cell').forEach(c => c.classList.add('hidden'));
        }

        table.querySelectorAll('.fx-col-cell, .deviation-col, .step-deviation-col, .fd-col, .fu-col, .cf-col-cell').forEach(cell => cell.remove());
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
            <div class="overflow-x-auto"><p>$$ \\bar{x} = \\frac{\\Sigma fx}{\\Sigma f} $$</p></div>
            <p>Where:</p>
            <ul>
                <li>$x$ is the mid-value.</li>
                <li>$\\Sigma fx$ is the sum of the products of mid-values and frequencies.</li>
                <li>$\\Sigma f$ is the sum of all frequencies.</li>
            </ul>
            <p><strong>Calculation:</strong></p>
            <div class="overflow-x-auto"><p>$$ \\bar{x} = \\frac{${sumFx.toFixed(2)}}{${sumF}} = ${mean.toFixed(4)} $$</p></div>
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
            <div class="overflow-x-auto"><p>$$ \\bar{x} = \\frac{\\Sigma fx}{\\Sigma f} $$</p></div>
            <p>Where:</p>
            <ul>
                <li>$x$ is the mid-value of the class interval.</li>
                <li>$\\Sigma fx$ is the sum of the products of mid-values and frequencies.</li>
                <li>$\\Sigma f$ is the sum of all frequencies.</li>
            </ul>
            <p><strong>Calculation:</strong></p>
            <div class="overflow-x-auto"><p>$$ \\bar{x} = \\frac{${sumFx.toFixed(2)}}{${sumF}} = ${mean.toFixed(4)} $$</p></div>
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
            <div class="overflow-x-auto"><p>$$ \\bar{x} = \\frac{\\Sigma fx}{\\Sigma f} $$</p></div>
            <p>Where:</p>
            <ul>
                <li>$\\Sigma fx$ is the sum of the products of observations and frequencies.</li>
                <li>$\\Sigma f$ is the sum of all frequencies.</li>
            </ul>
            <p><strong>Calculation:</strong></p>
            <div class="overflow-x-auto"><p>$$ \\bar{x} = \\frac{${sumFx}}{${sumF}} = ${mean.toFixed(4)} $$</p></div>
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
            <div class="overflow-x-auto"><p>$$ \\bar{x} = \\frac{\\Sigma x}{n} $$</p></div>
            <p>Where:</p>
            <ul>
                <li>$\\Sigma x$ is the sum of all observations.</li>
                <li>$n$ is the number of observations.</li>
            </ul>
            <p><strong>Calculation:</strong></p>
            <div class="overflow-x-auto"><p>$$ \\bar{x} = \\frac{${sum}}{${n}} = ${mean.toFixed(4)} $$</p></div>
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
            <div class="overflow-x-auto"><p>$$ \\bar{x} = \\frac{\\Sigma fx}{\\Sigma f} $$</p></div>
            <p><strong>Calculation:</strong></p>
            <div class="overflow-x-auto"><p>$$ \\bar{x} = \\frac{${sumFx.toFixed(2)}}{${sumF}} = ${mean.toFixed(4)} $$</p></div>
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
            <div class="overflow-x-auto"><p>$$ \\bar{x} = A + \\frac{\\Sigma d}{n} $$</p></div>
            <p><strong>Calculation:</strong></p>
            <div class="overflow-x-auto"><p>$$ \\bar{x} = ${A} + \\frac{${sumD.toFixed(2)}}{${n}} = ${mean.toFixed(4)} $$</p></div>
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
            <div class="overflow-x-auto"><p>$$ \\bar{x} = A + \\left( \\frac{\\Sigma u}{n} \\times c \\right) $$</p></div>
            <p><strong>Calculation:</strong></p>
            <div class="overflow-x-auto"><p>$$ \\bar{x} = ${A} + \\left( \\frac{${sumU.toFixed(2)}}{${n}} \\times ${c} \\right) = ${mean.toFixed(4)} $$</p></div>
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
            <div class="overflow-x-auto"><p>$$ \\bar{x} = A + \\frac{\\Sigma fd}{\\Sigma f} $$</p></div>
            <p><strong>Calculation:</strong></p>
            <div class="overflow-x-auto"><p>$$ \\bar{x} = ${A} + \\frac{${sumFd.toFixed(2)}}{${sumF}} = ${mean.toFixed(4)} $$</p></div>
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
            <div class="overflow-x-auto"><p>$$ \\bar{x} = A + \\left( \\frac{\\Sigma fu}{\\Sigma f} \\times c \\right) $$</p></div>
            <p><strong>Calculation:</strong></p>
            <div class="overflow-x-auto"><p>$$ \\bar{x} = ${A} + \\left( \\frac{${sumFu.toFixed(2)}}{${sumF}} \\times ${c} \\right) = ${mean.toFixed(4)} $$</p></div>
            <p><strong>The mean for the given data is ${mean.toFixed(4)}.</strong></p>
        `;

        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([solutionSteps]);
        }
    }

    displayModeSolution(solutionText) {
        const solutionContainer = document.getElementById('step-by-step-solution-container');
        const solutionSteps = document.getElementById('solution-steps');
        solutionContainer.classList.remove('hidden');

        solutionSteps.innerHTML = `
            <h3 class="font-semibold text-lg">Calculating the Mode</h3>
            <p>${solutionText}</p>
        `;

        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([solutionSteps]);
        }
    }

    displayContinuousModeSolution(l, fm, f1, f2, c, mode, usedGrouping = false, reason = '') {
        const solutionContainer = document.getElementById('step-by-step-solution-container');
        const solutionSteps = document.getElementById('solution-steps');
        solutionContainer.classList.remove('hidden');

        const fm_description = usedGrouping ? 'Frequency of the modal class' : 'Frequency of the modal class (highest frequency)';

        let solutionHTML = `
            <h3 class="font-semibold text-lg">Calculating the Mode for Continuous Data</h3>
        `;

        if (usedGrouping) {
            const reasonText = reason ? `because ${reason}` : 'due to a tie for the highest frequency';
            solutionHTML += `<p>The modal class was determined using the grouping method ${reasonText}, as shown in the tables above. The identified modal class is <strong>${l} - ${l+c}</strong>.</p>`;
        }

        solutionHTML += `
            <p><strong>Formula:</strong></p>
            <div class="overflow-x-auto"><p>$$ Mode = l + \\frac{f_m - f_1}{2f_m - f_1 - f_2} \\times c $$</p></div>
            <p>Where:</p>
            <ul>
                <li>$l$ = Lower limit of the modal class = ${l}</li>
                <li>$f_m$ = ${fm_description} = ${fm}</li>
                <li>$f_1$ = Frequency of the class preceding the modal class = ${f1}</li>
                <li>$f_2$ = Frequency of the class succeeding the modal class = ${f2}</li>
                <li>$c$ = Class length of the modal class = ${c}</li>
            </ul>
            <p><strong>Calculation:</strong></p>
            <div class="overflow-x-auto"><p>$$ Mode = ${l} + \\frac{${fm} - ${f1}}{2 \\times ${fm} - ${f1} - ${f2}} \\times ${c} = ${mode.toFixed(4)} $$</p></div>
            <p><strong>The mode for the given data is ${mode.toFixed(4)}.</strong></p>
        `;

        solutionSteps.innerHTML = solutionHTML;

        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([solutionSteps]);
        }
    }

    calculateMedian() {
        // Future implementation will clear other calculation displays
        switch (this.dataType) {
            case 'ungrouped':
                this.calculateUngroupedMedian();
                break;
            case 'discrete':
                this.resetDiscreteTable();
                this.calculateDiscreteMedian();
                break;
            case 'continuous':
                this.resetContinuousTable();
                this.calculateContinuousMedian();
                break;
            case 'more-than-less-than':
                this.calculateMoreThanLessThanMedian();
                break;
            case 'mid-value':
                this.calculateMidValueMedian();
                break;
        }
    }

    calculateDiscreteMedian() {
        const data = this.getDiscreteData();
        if (data.length === 0) {
            alert('Please enter some data.');
            return;
        }

        const sortedData = [...data].sort((a, b) => a.x - b.x);
        
        let sumF = 0;
        const dataWithCf = sortedData.map(item => {
            sumF += item.f;
            return { ...item, cf: sumF };
        });

        const N = sumF;
        const pos = (N + 1) / 2;

        let median;
        let solutionOptions = {};

        const fraction = pos - Math.floor(pos);
        if (fraction > 0) {
            const lowerCfItem = dataWithCf.find(item => item.cf === Math.floor(pos));
            if (lowerCfItem) {
                const lowerCfIndex = dataWithCf.indexOf(lowerCfItem);
                if (lowerCfIndex + 1 < dataWithCf.length) {
                    const lowerValue = lowerCfItem.x;
                    const upperValue = dataWithCf[lowerCfIndex + 1].x;
                    median = lowerValue + fraction * (upperValue - lowerValue);
                    solutionOptions = { isInterpolated: true, pos, lowerValue, upperValue, fraction, lowerCf: lowerCfItem.cf };
                }
            }
        }
        
        if (median === undefined) {
            const medianItem = dataWithCf.find(item => item.cf >= pos);
            median = medianItem.x;
            solutionOptions = { isInterpolated: false, pos, cf: medianItem.cf, x: medianItem.x };
        }

        this.displayResults({ Median: median.toFixed(4) });
        this.updateDiscreteTableForMedian(dataWithCf, N);
        const solutionHtml = this.displayDiscreteMedianSolution(dataWithCf, N, pos, median, solutionOptions);
        this.displaySolution(solutionHtml);
    }

    calculateContinuousMedian() {
        const data = this.getContinuousData();
        if (data.length === 0) {
            alert('Please enter some data.');
            return;
        }
        this._calculateMedianFromContinuousData(data, false);
    }

    calculateMoreThanLessThanMedian() {
        const data = this.getMoreThanLessThanData();
        if (data.length < 2) {
            alert('Please enter at least two rows of data for conversion.');
            return;
        }

        const convertedData = this.convertCfToFrequencyDistribution(data, this.moreThanLessThanType);
        this._calculateMedianFromContinuousData(convertedData, true, 'more-than-less-than');
    }

    calculateMidValueMedian() {
        const data = this.getMidValueData().sort((a, b) => a.x - b.x);
        if (data.length < 2) {
            alert('Please enter at least two rows to determine the class interval.');
            return;
        }

        const h = data[1].x - data[0].x; // class width
        const convertedData = data.map(item => ({
            lower: item.x - h / 2,
            upper: item.x + h / 2,
            f: item.f,
        }));

        this._calculateMedianFromContinuousData(convertedData, true, 'mid-value');
    }

    _calculateMedianFromContinuousData(data, isConverted = false, originalDataType = 'continuous') {
        let sumF = 0;
        const dataWithCf = data.map(item => {
            sumF += item.f;
            return { ...item, cf: sumF };
        });

        const N = sumF;
        const medianPos = N / 2;
        
        const medianClass = dataWithCf.find(item => item.cf >= medianPos);
        if (!medianClass) {
            alert('Could not determine the median class. Please check your data.');
            return;
        }
        const medianClassIndex = dataWithCf.indexOf(medianClass);

        const l = medianClass.lower;
        const f = medianClass.f;
        const c = medianClass.upper - medianClass.lower;
        const cf = medianClassIndex > 0 ? dataWithCf[medianClassIndex - 1].cf : 0;
        
        const median = l + ((medianPos - cf) / f) * c;

        this.displayResults({ Median: median.toFixed(4) });

        let solutionHtml;
        if (isConverted) {
            const calculationSteps = dataWithCf.map(item => ({
                ...item,
                midValue: (item.lower + item.upper) / 2
            }));
            this.populateConvertedCfTable(calculationSteps, N, null, { showFx: false, showCf: true });
            
            if (originalDataType === 'more-than-less-than') {
                solutionHtml = this.displayMoreThanLessThanMedianSolution(N, medianPos, l, f, c, cf, median, this.moreThanLessThanType);
            } else if (originalDataType === 'mid-value') {
                solutionHtml = this.displayMidValueMedianSolution(N, medianPos, l, f, c, cf, median);
            }
        } else {
            this.updateContinuousTableForMedian(dataWithCf, N);
            solutionHtml = this.displayContinuousMedianSolution(N, medianPos, l, f, c, cf, median);
        }
        
        this.displaySolution(solutionHtml);
    }

    calculateUngroupedMedian() {
        this.resetUngroupedTable();
        const data = this.getUngroupedData();
        if (data.length === 0) {
            alert('Please enter some data.');
            return;
        }

        const sortedData = [...data].sort((a, b) => a - b);
        const n = sortedData.length;
        const pos = (n + 1) / 2;

        let median;
        let solutionHtml;

        if (Number.isInteger(pos)) {
            // Position is a whole number
            median = sortedData[pos - 1];
            solutionHtml = this.displayUngroupedMedianSolution(sortedData, n, pos, median);
        } else {
            // Position is a decimal (e.g., 2.5)
            const lowerIndex = Math.floor(pos) - 1;
            const upperIndex = Math.ceil(pos) - 1;
            const lowerValue = sortedData[lowerIndex];
            const upperValue = sortedData[upperIndex];
            const fraction = pos - Math.floor(pos);

            median = lowerValue + fraction * (upperValue - lowerValue);
            solutionHtml = this.displayUngroupedMedianSolution(sortedData, n, pos, median, {
                isInterpolated: true,
                lowerIndex,
                upperIndex,
                lowerValue,
                upperValue,
                fraction
            });
        }

        this.displayResults({ Median: median.toFixed(4) });
        this.displaySolution(solutionHtml);
    }

    displaySolution(solutionHtml) {
        const solutionContainer = document.getElementById('step-by-step-solution-container');
        const solutionSteps = document.getElementById('solution-steps');
        solutionContainer.classList.remove('hidden');
        solutionSteps.innerHTML = solutionHtml;
        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([solutionSteps]);
        }
    }

    displayDiscreteMedianSolution(dataWithCf, N, pos, median, options) {
        let solution = `
            <h3 class="font-semibold text-lg">Calculating the Median for Discrete Data</h3>
            <p><strong>1. Arrange data and find Cumulative Frequency (c.f.):</strong></p>
            <p>First, we arrange the data in ascending order of x and calculate the 'less than' cumulative frequency for each observation. The full table is shown above.</p>
            <p><strong>2. Find the position of the median:</strong></p>
            <p>The sum of frequencies (N) is ${N}.</p>
            <div class="overflow-x-auto"><p>$$ \\text{Position} = \\left( \\frac{N+1}{2} \\right)^{\\text{th}} \\text{ observation} $$</p></div>
            <div class="overflow-x-auto"><p>$$ \\text{Position} = \\left( \\frac{${N}+1}{2} \\right)^{\\text{th}} = ${pos}^{\\text{th}} \\text{ observation} $$</p></div>
        `;

        if (options.isInterpolated) {
            solution += `
                <p><strong>3. Calculate the median value:</strong></p>
                <p>Since the position is ${pos}, we need to interpolate.</p>
                <p>The cumulative frequency up to the ${Math.floor(pos)}<sup>th</sup> observation is ${options.lowerCf}, corresponding to an x-value of ${options.lowerValue}.</p>
                <p>The next observation corresponds to an x-value of ${options.upperValue}.</p>
                <div class="overflow-x-auto"><p>$$ M = (\\text{value of } ${Math.floor(pos)}^{\\text{th}} \\text{ obs}) + ${options.fraction} \\times ((\\text{value of next obs}) - (\\text{value of } ${Math.floor(pos)}^{\\text{th}} \\text{ obs})) $$</p></div>
                <div class="overflow-x-auto"><p>$$ M = ${options.lowerValue} + ${options.fraction} \\times (${options.upperValue} - ${options.lowerValue}) = ${median.toFixed(4)} $$</p></div>
            `;
        } else {
            solution += `
                <p><strong>3. Find the median value:</strong></p>
                <p>We look for the cumulative frequency which is just greater than or equal to ${pos}.</p>
                <p>The c.f. value is ${options.cf}, and the corresponding value of x is <strong>${options.x}</strong>.</p>
            `;
        }

        solution += `<p><strong>The median for the given data is ${median.toFixed(4)}.</strong></p>`;
        return solution;
    }

    updateDiscreteTableForMedian(dataWithCf, N) {
        const table = document.getElementById('discrete-table');
        const rows = Array.from(table.querySelectorAll('#discrete-data-table tr'));
    
        // Show CF header
        table.querySelector('.cf-header').classList.remove('hidden');
    
        // Add CF data cells
        rows.forEach((row, index) => {
            if (dataWithCf[index]) {
                const cfCell = document.createElement('td');
                cfCell.className = 'px-4 py-2 whitespace-nowrap cf-col-cell';
                cfCell.textContent = dataWithCf[index].cf;
                row.appendChild(cfCell);
            }
        });
    
        // Update footer
        const tfoot = document.getElementById('discrete-data-table-foot');
        if (tfoot) {
            tfoot.querySelector('#discrete-f-total').innerHTML = `$\\Sigma f = ${N}$`;
            tfoot.classList.remove('hidden');
            if (typeof MathJax !== 'undefined') MathJax.typesetPromise([tfoot]);
        }
    }

    updateContinuousTableForMedian(dataWithCf, N) {
        const table = document.getElementById('continuous-table');
        const rows = Array.from(table.querySelectorAll('#continuous-data-table tr'));

        table.querySelector('.cf-header').classList.remove('hidden');

        rows.forEach((row, index) => {
            if (dataWithCf[index]) {
                const cfCell = document.createElement('td');
                cfCell.className = 'px-4 py-2 whitespace-nowrap cf-col-cell';
                cfCell.textContent = dataWithCf[index].cf;
                row.appendChild(cfCell);
            }
        });

        const tfoot = document.getElementById('continuous-data-table-foot');
        if (tfoot) {
            tfoot.querySelector('#continuous-f-total').innerHTML = `$\\Sigma f = ${N}$`;
            tfoot.classList.remove('hidden');
            if (typeof MathJax !== 'undefined') MathJax.typesetPromise([tfoot]);
        }
    }

    displayDiscreteMedianSolution(dataWithCf, N, pos, median, options) {
        let solution = `
            <h3 class="font-semibold text-lg">Calculating the Median for Discrete Data</h3>
            <p><strong>1. Arrange data and find Cumulative Frequency (c.f.):</strong></p>
            <p>First, we arrange the data in ascending order of x and calculate the 'less than' cumulative frequency for each observation. The full table is shown above.</p>
            <p><strong>2. Find the position of the median:</strong></p>
            <p>The sum of frequencies (N) is ${N}.</p>
            <div class="overflow-x-auto"><p>$$ \\text{Position} = \\left( \\frac{N+1}{2} \\right)^{\\text{th}} \\text{ observation} $$</p></div>
            <div class="overflow-x-auto"><p>$$ \\text{Position} = \\left( \\frac{${N}+1}{2} \\right)^{\\text{th}} = ${pos}^{\\text{th}} \\text{ observation} $$</p></div>
        `;

        if (options.isInterpolated) {
            solution += `
                <p><strong>3. Calculate the median value:</strong></p>
                <p>Since the position is ${pos}, we need to interpolate.</p>
                <p>The cumulative frequency up to the ${Math.floor(pos)}<sup>th</sup> observation is ${options.lowerCf}, corresponding to an x-value of ${options.lowerValue}.</p>
                <p>The next observation corresponds to an x-value of ${options.upperValue}.</p>
                <div class="overflow-x-auto"><p>$$ M = (\\text{value of } ${Math.floor(pos)}^{\\text{th}} \\text{ obs}) + ${options.fraction} \\times ((\\text{value of next obs}) - (\\text{value of } ${Math.floor(pos)}^{\\text{th}} \\text{ obs})) $$</p></div>
                <div class="overflow-x-auto"><p>$$ M = ${options.lowerValue} + ${options.fraction} \\times (${options.upperValue} - ${options.lowerValue}) = ${median.toFixed(4)} $$</p></div>
            `;
        } else {
            solution += `
                <p><strong>3. Find the median value:</strong></p>
                <p>We look for the cumulative frequency which is just greater than or equal to ${pos}.</p>
                <p>The c.f. value is ${options.cf}, and the corresponding value of x is <strong>${options.x}</strong>.</p>
            `;
        }

        solution += `<p><strong>The median for the given data is ${median.toFixed(4)}.</strong></p>`;
        return solution;
    }

    displayContinuousMedianSolution(N, medianPos, l, f, c, cf, median) {
        return `
            <h3 class="font-semibold text-lg">Calculating the Median for Continuous Data</h3>
            <p><strong>1. Find Cumulative Frequency (c.f.):</strong></p>
            <p>First, we calculate the 'less than' cumulative frequency for each class. The full table with the c.f. column is shown above.</p>
            <p><strong>2. Locate the Median Class:</strong></p>
            <p>The sum of frequencies (N) is ${N}.</p>
            <p>We find the median position using: $$ \\frac{N}{2} = \\frac{${N}}{2} = ${medianPos} $$</p>
            <p>The median class is the class where the cumulative frequency is just greater than or equal to ${medianPos}. In this case, it is the class <strong>${l} - ${l+c}</strong>.</p>
            <p><strong>3. Apply the Median Formula:</strong></p>
            <div class="overflow-x-auto"><p>$$ M = l + \\frac{\\frac{N}{2} - cf}{f} \\times c $$</p></div>
            <p>Where:</p>
            <ul>
                <li>$l$ = Lower limit of the median class = ${l}</li>
                <li>$\\frac{N}{2}$ = ${medianPos}</li>
                <li>$cf$ = Cumulative frequency of the class preceding the median class = ${cf}</li>
                <li>$f$ = Frequency of the median class = ${f}</li>
                <li>$c$ = Class length of the median class = ${c}</li>
            </ul>
            <p><strong>Calculation:</strong></p>
            <div class="overflow-x-auto"><p>$$ M = ${l} + \\frac{${medianPos} - ${cf}}{${f}} \\times ${c} = ${median.toFixed(4)} $$</p></div>
            <p><strong>The median for the given data is ${median.toFixed(4)}.</strong></p>
        `;
    }

    displayMoreThanLessThanMedianSolution(N, medianPos, l, f, c, cf, median, type) {
        return `
            <h3 class="font-semibold text-lg">Calculating the Median for ${type === 'less-than' ? 'Less Than' : 'More Than'} Data</h3>
            <p><strong>1. Convert to Frequency Distribution:</strong></p>
            <p>First, we convert the cumulative frequency distribution into a simple frequency distribution, which is shown in the table above.</p>
            <p><strong>2. Locate the Median Class:</strong></p>
            <p>The sum of frequencies (N) is ${N}.</p>
            <p>We find the median position using: $$ \\frac{N}{2} = \\frac{${N}}{2} = ${medianPos} $$</p>
            <p>The median class is the class where the cumulative frequency is just greater than or equal to ${medianPos}. In this case, it is the class <strong>${l} - ${l+c}</strong>.</p>
            <p><strong>3. Apply the Median Formula:</strong></p>
            <div class="overflow-x-auto"><p>$$ M = l + \\frac{\\frac{N}{2} - cf}{f} \\times c $$</p></div>
            <p>Where:</p>
            <ul>
                <li>$l$ = Lower limit of the median class = ${l}</li>
                <li>$\\frac{N}{2}$ = ${medianPos}</li>
                <li>$cf$ = Cumulative frequency of the class preceding the median class = ${cf}</li>
                <li>$f$ = Frequency of the median class = ${f}</li>
                <li>$c$ = Class length of the median class = ${c}</li>
            </ul>
            <p><strong>Calculation:</strong></p>
            <div class="overflow-x-auto"><p>$$ M = ${l} + \\frac{${medianPos} - ${cf}}{${f}} \\times ${c} = ${median.toFixed(4)} $$</p></div>
            <p><strong>The median for the given data is ${median.toFixed(4)}.</strong></p>
        `;
    }

    displayMidValueMedianSolution(N, medianPos, l, f, c, cf, median) {
        return `
            <h3 class="font-semibold text-lg">Calculating the Median for Mid-Value Data</h3>
            <p><strong>1. Convert to Frequency Distribution:</strong></p>
            <p>First, we determine the class intervals from the mid-values. The resulting frequency distribution is shown in the table above.</p>
            <p><strong>2. Locate the Median Class:</strong></p>
            <p>The sum of frequencies (N) is ${N}.</p>
            <p>We find the median position using: $$ \\frac{N}{2} = \\frac{${N}}{2} = ${medianPos} $$</p>
            <p>The median class is the class where the cumulative frequency is just greater than or equal to ${medianPos}. In this case, it is the class <strong>${l} - ${l+c}</strong>.</p>
            <p><strong>3. Apply the Median Formula:</strong></p>
            <div class="overflow-x-auto"><p>$$ M = l + \\frac{\\frac{N}{2} - cf}{f} \\times c $$</p></div>
            <p>Where:</p>
            <ul>
                <li>$l$ = Lower limit of the median class = ${l}</li>
                <li>$\\frac{N}{2}$ = ${medianPos}</li>
                <li>$cf$ = Cumulative frequency of the class preceding the median class = ${cf}</li>
                <li>$f$ = Frequency of the median class = ${f}</li>
                <li>$c$ = Class length of the median class = ${c}</li>
            </ul>
            <p><strong>Calculation:</strong></p>
            <div class="overflow-x-auto"><p>$$ M = ${l} + \\frac{${medianPos} - ${cf}}{${f}} \\times ${c} = ${median.toFixed(4)} $$</p></div>
            <p><strong>The median for the given data is ${median.toFixed(4)}.</strong></p>
        `;
    }

    calculateQuantile(quantileType) {
        const inputId = `${quantileType}Input`;
        const k = parseInt(document.getElementById(inputId).value, 10);
        
        const limits = {
            quartile: { min: 1, max: 3 },
            decile: { min: 1, max: 9 },
            percentile: { min: 1, max: 99 }
        };

        if (isNaN(k) || k < limits[quantileType].min || k > limits[quantileType].max) {
            alert(`Please enter a valid ${quantileType} number between ${limits[quantileType].min} and ${limits[quantileType].max}.`);
            return;
        }

        switch (this.dataType) {
            case 'ungrouped':
                this.calculateUngroupedQuantile(quantileType, k);
                break;
            case 'discrete':
                this.calculateDiscreteQuantile(quantileType, k);
                break;
            case 'continuous':
                this.calculateContinuousQuantile(quantileType, k);
                break;
            case 'more-than-less-than':
                this.calculateMoreThanLessThanQuantile(quantileType, k);
                break;
            case 'mid-value':
                this.calculateMidValueQuantile(quantileType, k);
                break;
        }
    }

    calculateDiscreteQuantile(quantileType, k) {
        this.resetDiscreteTable();
        const data = this.getDiscreteData();
        if (data.length === 0) {
            alert('Please enter some data.');
            return;
        }

        const sortedData = [...data].sort((a, b) => a.x - b.x);
        
        let sumF = 0;
        const dataWithCf = sortedData.map(item => {
            sumF += item.f;
            return { ...item, cf: sumF };
        });

        const N = sumF;
        const divisors = { quartile: 4, decile: 10, percentile: 100 };
        const divisor = divisors[quantileType];
        const pos = (k * (N + 1)) / divisor;

        let quantileValue;
        let solutionOptions = {};

        const fraction = pos - Math.floor(pos);
        if (fraction > 0) {
            const lowerCfItem = dataWithCf.find(item => item.cf === Math.floor(pos));
            if (lowerCfItem) {
                const lowerCfIndex = dataWithCf.indexOf(lowerCfItem);
                if (lowerCfIndex + 1 < dataWithCf.length) {
                    const lowerValue = lowerCfItem.x;
                    const upperValue = dataWithCf[lowerCfIndex + 1].x;
                    quantileValue = lowerValue + fraction * (upperValue - lowerValue);
                    solutionOptions = { isInterpolated: true, lowerValue, upperValue, fraction, lowerCf: lowerCfItem.cf };
                }
            }
        }
        
        if (quantileValue === undefined) {
            const quantileItem = dataWithCf.find(item => item.cf >= pos);
            quantileValue = quantileItem.x;
            solutionOptions = { isInterpolated: false, cf: quantileItem.cf, x: quantileItem.x };
        }

        const quantileName = `${quantileType.charAt(0).toUpperCase()}${k}`;
        this.displayResults({ [quantileName]: quantileValue.toFixed(4) });
        this.updateDiscreteTableForMedian(dataWithCf, N);
        
        solutionOptions.pos = pos;
        const solutionHtml = this.displayDiscreteQuantileSolution(dataWithCf, quantileType, k, quantileValue, solutionOptions);
        this.displaySolution(solutionHtml);
    }

    calculateContinuousQuantile(quantileType, k) {
        this.resetContinuousTable();
        const data = this.getContinuousData();
        if (data.length === 0) {
            alert('Please enter some data.');
            return;
        }
        this._calculateQuantileFromContinuousData(data, quantileType, k, false);
    }

    calculateMoreThanLessThanQuantile(quantileType, k) {
        const data = this.getMoreThanLessThanData();
        if (data.length < 2) {
            alert('Please enter at least two rows of data for conversion.');
            return;
        }
        const convertedData = this.convertCfToFrequencyDistribution(data, this.moreThanLessThanType);
        this._calculateQuantileFromContinuousData(convertedData, quantileType, k, true, 'more-than-less-than');
    }

    calculateMidValueQuantile(quantileType, k) {
        const data = this.getMidValueData().sort((a, b) => a.x - b.x);
        if (data.length < 2) {
            alert('Please enter at least two rows to determine the class interval.');
            return;
        }
        const h = data[1].x - data[0].x;
        const convertedData = data.map(item => ({
            lower: item.x - h / 2,
            upper: item.x + h / 2,
            f: item.f,
        }));
        this._calculateQuantileFromContinuousData(convertedData, quantileType, k, true, 'mid-value');
    }

    _calculateQuantileFromContinuousData(data, quantileType, k, isConverted = false, originalDataType = 'continuous') {
        let sumF = 0;
        const dataWithCf = data.map(item => {
            sumF += item.f;
            return { ...item, cf: sumF };
        });

        const N = sumF;
        const divisors = { quartile: 4, decile: 10, percentile: 100 };
        const divisor = divisors[quantileType];
        const pos = (k * N) / divisor;

        const quantileClass = dataWithCf.find(item => item.cf >= pos);
        if (!quantileClass) {
            alert('Could not determine the quantile class. Please check your data.');
            return;
        }
        const quantileClassIndex = dataWithCf.indexOf(quantileClass);

        const l = quantileClass.lower;
        const f = quantileClass.f;
        const c = quantileClass.upper - quantileClass.lower;
        const cf = quantileClassIndex > 0 ? dataWithCf[quantileClassIndex - 1].cf : 0;
        
        const quantileValue = l + ((pos - cf) / f) * c;

        const quantileName = `${quantileType.charAt(0).toUpperCase()}${k}`;
        this.displayResults({ [quantileName]: quantileValue.toFixed(4) });
        
        let solutionHtml;
        const solutionOptions = { N, pos, l, f, c, cf, value: quantileValue };

        if (isConverted) {
            const calculationSteps = dataWithCf.map(item => ({...item}));
            this.populateConvertedCfTable(calculationSteps, N, null, { showFx: false, showCf: true });
            
            if (originalDataType === 'more-than-less-than') {
                solutionHtml = this.displayConvertedQuantileSolution(quantileType, k, solutionOptions, 'more-than-less-than', this.moreThanLessThanType);
            } else if (originalDataType === 'mid-value') {
                solutionHtml = this.displayConvertedQuantileSolution(quantileType, k, solutionOptions, 'mid-value');
            }
        } else {
            this.updateContinuousTableForMedian(dataWithCf, N);
            solutionHtml = this.displayContinuousQuantileSolution(quantileType, k, solutionOptions);
        }
        
        this.displaySolution(solutionHtml);
    }

    calculateUngroupedQuantile(quantileType, k) {
        const data = this.getUngroupedData();
        if (data.length === 0) {
            alert('Please enter some data.');
            return;
        }

        const sortedData = [...data].sort((a, b) => a - b);
        const n = sortedData.length;

        const divisors = { quartile: 4, decile: 10, percentile: 100 };
        const divisor = divisors[quantileType];
        
        const pos = (k * (n + 1)) / divisor;

        let quantileValue;
        let solutionOptions = {};
        
        const lowerPos = Math.floor(pos);
        const upperPos = Math.ceil(pos);
        const fraction = pos - lowerPos;

        if (fraction === 0) {
            quantileValue = sortedData[pos - 1];
            solutionOptions = { isInterpolated: false };
        } else {
            const lowerValue = sortedData[lowerPos - 1];
            const upperValue = sortedData[upperPos - 1];
            
            if (lowerValue !== undefined && upperValue !== undefined) {
                quantileValue = lowerValue + fraction * (upperValue - lowerValue);
                solutionOptions = { isInterpolated: true, lowerPos, upperPos, lowerValue, upperValue, fraction };
            } else if (upperValue !== undefined) {
                quantileValue = upperValue;
                solutionOptions = { isInterpolated: false, boundaryCase: true };
            } else if (lowerValue !== undefined) {
                quantileValue = lowerValue;
                solutionOptions = { isInterpolated: false, boundaryCase: true };
            } else {
                alert("Cannot calculate quantile for this data.");
                return;
            }
        }
        
        const quantileName = `${quantileType.charAt(0).toUpperCase()}${k}`;
        this.displayResults({ [quantileName]: quantileValue.toFixed(4) });
        
        solutionOptions.pos = pos;
        const solutionHtml = this.displayUngroupedQuantileSolution(sortedData, quantileType, k, quantileValue, solutionOptions);
        this.displaySolution(solutionHtml);
    }

    displayUngroupedQuantileSolution(sortedData, quantileType, k, value, options) {
        const n = sortedData.length;
        const divisors = { quartile: 4, decile: 10, percentile: 100 };
        const divisor = divisors[quantileType];
        const quantileName = `${quantileType.charAt(0).toUpperCase()}${k}`;
        
        let solution = `
            <h3 class="font-semibold text-lg">Calculating ${quantileName} for Ungrouped Data</h3>
            <p><strong>1. Arrange the data in ascending order:</strong></p>
            <p>${sortedData.join(', ')}</p>
            <p><strong>2. Find the position of ${quantileName}:</strong></p>
            <p>The total number of observations (n) is ${n}.</p>
            <div class="overflow-x-auto"><p>$$ \\text{Position} = \\frac{${k}(n+1)}{${divisor}} = \\frac{${k}(${n}+1)}{${divisor}} = ${options.pos.toFixed(2)}^{\\text{th}} \\text{ observation} $$</p></div>
        `;

        if (options.isInterpolated) {
             solution += `
                <p><strong>3. Calculate the value by interpolation:</strong></p>
                <p>Since the position is a decimal, we interpolate between the ${options.lowerPos}<sup>th</sup> and ${options.upperPos}<sup>th</sup> observations.</p>
                <p>The ${options.lowerPos}<sup>th</sup> observation is ${options.lowerValue}.</p>
                <p>The ${options.upperPos}<sup>th</sup> observation is ${options.upperValue}.</p>
                <div class="overflow-x-auto"><p>$$ ${quantileName} = (${options.lowerPos}^{\\text{th}} \\text{ obs}) + ${options.fraction.toFixed(2)} \\times ((${options.upperPos}^{\\text{th}} \\text{ obs}) - (${options.lowerPos}^{\\text{th}} \\text{ obs})) $$</p></div>
                <div class="overflow-x-auto"><p>$$ ${quantileName} = ${options.lowerValue} + ${options.fraction.toFixed(2)} \\times (${options.upperValue} - ${options.lowerValue}) = ${value.toFixed(4)} $$</p></div>
            `;
        } else {
            if (options.boundaryCase) {
                 solution += `
                    <p><strong>3. Find the value:</strong></p>
                    <p>The calculated position is near the boundary of the dataset. The value is taken from the nearest data point.</p>
                    <p>The ${quantileName} is <strong>${value.toFixed(4)}</strong>.</p>
                `;
            } else {
                 solution += `
                    <p><strong>3. Find the value:</strong></p>
                    <p>The ${quantileName} is the value at the ${options.pos}<sup>th</sup> position in the sorted data, which is <strong>${value.toFixed(4)}</strong>.</p>
                `;
            }
        }
        
        solution += `<p><strong>The ${quantileName} for the given data is ${value.toFixed(4)}.</strong></p>`;
        return solution;
    }

    displayDiscreteQuantileSolution(dataWithCf, quantileType, k, value, options) {
        const N = dataWithCf[dataWithCf.length - 1].cf;
        const divisors = { quartile: 4, decile: 10, percentile: 100 };
        const divisor = divisors[quantileType];
        const quantileName = `${quantileType.charAt(0).toUpperCase()}${k}`;

        let solution = `
            <h3 class="font-semibold text-lg">Calculating ${quantileName} for Discrete Data</h3>
            <p><strong>1. Arrange data and find Cumulative Frequency (c.f.):</strong></p>
            <p>The full table with the c.f. column is shown above.</p>
            <p><strong>2. Find the position of ${quantileName}:</strong></p>
            <p>The sum of frequencies (N) is ${N}.</p>
            <div class="overflow-x-auto"><p>$$ \\text{Position} = \\frac{${k}(N+1)}{${divisor}} = \\frac{${k}(${N}+1)}{${divisor}} = ${options.pos.toFixed(2)}^{\\text{th}} \\text{ observation} $$</p></div>
        `;

        if (options.isInterpolated) {
            solution += `
                <p><strong>3. Calculate the value by interpolation:</strong></p>
                <p>Since the position is ${options.pos.toFixed(2)}, we need to interpolate.</p>
                <p>The cumulative frequency up to the ${Math.floor(options.pos)}<sup>th</sup> observation is ${options.lowerCf}, corresponding to an x-value of ${options.lowerValue}.</p>
                <p>The next observation corresponds to an x-value of ${options.upperValue}.</p>
                <div class="overflow-x-auto"><p>$$ ${quantileName} = (${Math.floor(options.pos)}^{\\text{th}} \\text{ obs}) + ${options.fraction.toFixed(2)} \\times ((\\text{next obs}) - (${Math.floor(options.pos)}^{\\text{th}} \\text{ obs})) $$</p></div>
                <div class="overflow-x-auto"><p>$$ ${quantileName} = ${options.lowerValue} + ${options.fraction.toFixed(2)} \\times (${options.upperValue} - ${options.lowerValue}) = ${value.toFixed(4)} $$</p></div>
            `;
        } else {
            solution += `
                <p><strong>3. Find the value:</strong></p>
                <p>We look for the cumulative frequency which is just greater than or equal to ${options.pos.toFixed(2)}.</p>
                <p>The c.f. value is ${options.cf}, and the corresponding value of x is <strong>${options.x}</strong>.</p>
            `;
        }

        solution += `<p><strong>The ${quantileName} for the given data is ${value.toFixed(4)}.</strong></p>`;
        return solution;
    }

    displayContinuousQuantileSolution(quantileType, k, options) {
        const { N, pos, l, f, c, cf, value } = options;
        const quantileName = `${quantileType.charAt(0).toUpperCase()}${k}`;
        const divisor = { quartile: 4, decile: 10, percentile: 100 }[quantileType];

        return `
            <h3 class="font-semibold text-lg">Calculating ${quantileName} for Continuous Data</h3>
            <p><strong>1. Find Cumulative Frequency (c.f.):</strong></p>
            <p>The full table with the c.f. column is shown above.</p>
            <p><strong>2. Locate the ${quantileName} Class:</strong></p>
            <p>The sum of frequencies (N) is ${N}.</p>
            <p>We find the position using: $$ \\frac{${k}N}{${divisor}} = \\frac{${k} \\times ${N}}{${divisor}} = ${pos} $$</p>
            <p>The ${quantileName} class is the class where the cumulative frequency is just greater than or equal to ${pos}. In this case, it is the class <strong>${l} - ${l+c}</strong>.</p>
            <p><strong>3. Apply the Formula:</strong></p>
            <div class="overflow-x-auto"><p>$$ ${quantileName} = l + \\frac{\\frac{${k}N}{${divisor}} - cf}{f} \\times c $$</p></div>
            <p>Where:</p>
            <ul>
                <li>$l$ = ${l}</li>
                <li>$\\frac{${k}N}{${divisor}}$ = ${pos}</li>
                <li>$cf$ = ${cf}</li>
                <li>$f$ = ${f}</li>
                <li>$c$ = ${c}</li>
            </ul>
            <p><strong>Calculation:</strong></p>
            <div class="overflow-x-auto"><p>$$ ${quantileName} = ${l} + \\frac{${pos} - ${cf}}{${f}} \\times ${c} = ${value.toFixed(4)} $$</p></div>
            <p><strong>The ${quantileName} for the given data is ${value.toFixed(4)}.</strong></p>
        `;
    }

    displayConvertedQuantileSolution(quantileType, k, options, originalDataType, moreLessThanType = '') {
        const { N, pos, l, f, c, cf, value } = options;
        const quantileName = `${quantileType.charAt(0).toUpperCase()}${k}`;
        const divisor = { quartile: 4, decile: 10, percentile: 100 }[quantileType];

        let dataTypeString = '';
        let conversionStep = '';
        if (originalDataType === 'more-than-less-than') {
            dataTypeString = moreLessThanType === 'less-than' ? 'Less Than' : 'More Than';
            conversionStep = '<p>First, we convert the cumulative frequency distribution into a simple frequency distribution, which is shown in the table above.</p>';
        } else if (originalDataType === 'mid-value') {
            dataTypeString = 'Mid-Value';
            conversionStep = '<p>First, we determine the class intervals from the mid-values. The resulting frequency distribution is shown in the table above.</p>';
        }

        return `
            <h3 class="font-semibold text-lg">Calculating ${quantileName} for ${dataTypeString} Data</h3>
            <p><strong>1. Convert to Frequency Distribution:</strong></p>
            ${conversionStep}
            <p><strong>2. Locate the ${quantileName} Class:</strong></p>
            <p>The sum of frequencies (N) is ${N}.</p>
            <p>We find the position using: $$ \\frac{${k}N}{${divisor}} = \\frac{${k} \\times ${N}}{${divisor}} = ${pos} $$</p>
            <p>The ${quantileName} class is the class where the cumulative frequency is just greater than or equal to ${pos}. In this case, it is the class <strong>${l} - ${l+c}</strong>.</p>
            <p><strong>3. Apply the Formula:</strong></p>
            <div class="overflow-x-auto"><p>$$ ${quantileName} = l + \\frac{\\frac{${k}N}{${divisor}} - cf}{f} \\times c $$</p></div>
            <p>Where:</p>
            <ul>
                <li>$l$ = ${l}</li>
                <li>$\\frac{${k}N}{${divisor}}$ = ${pos}</li>
                <li>$cf$ = ${cf}</li>
                <li>$f$ = ${f}</li>
                <li>$c$ = ${c}</li>
            </ul>
            <p><strong>Calculation:</strong></p>
            <div class="overflow-x-auto"><p>$$ ${quantileName} = ${l} + \\frac{${pos} - ${cf}}{${f}} \\times ${c} = ${value.toFixed(4)} $$</p></div>
            <p><strong>The ${quantileName} for the given data is ${value.toFixed(4)}.</strong></p>
        `;
    }

    displayUngroupedMedianSolution(sortedData, n, pos, median, options = {}) {
        let solution = `
            <h3 class="font-semibold text-lg">Calculating the Median for Ungrouped Data</h3>
            <p><strong>1. Arrange the data in ascending order:</strong></p>
            <p>${sortedData.join(', ')}</p>
            <p><strong>2. Find the position of the median:</strong></p>
            <p>The total number of observations (n) is ${n}.</p>
            <div class="overflow-x-auto"><p>$$ \\text{Position} = \\left( \\frac{n+1}{2} \\right)^{\\text{th}} \\text{ observation} $$</p></div>
            <div class="overflow-x-auto"><p>$$ \\text{Position} = \\left( \\frac{${n}+1}{2} \\right)^{\\text{th}} = ${pos}^{\\text{th}} \\text{ observation} $$</p></div>
        `;

        if (options.isInterpolated) {
            solution += `
                <p><strong>3. Calculate the median value:</strong></p>
                <p>Since the position is ${pos}, we need to interpolate.</p>
                <p>The cumulative frequency up to the ${Math.floor(pos)}<sup>th</sup> observation is ${options.lowerCf}, corresponding to an x-value of ${options.lowerValue}.</p>
                <p>The next observation corresponds to an x-value of ${options.upperValue}.</p>
                <div class="overflow-x-auto"><p>$$ M = (\\text{value of } ${Math.floor(pos)}^{\\text{th}} \\text{ obs}) + ${options.fraction} \\times ((\\text{value of next obs}) - (\\text{value of } ${Math.floor(pos)}^{\\text{th}} \\text{ obs})) $$</p></div>
                <div class="overflow-x-auto"><p>$$ M = ${options.lowerValue} + ${options.fraction} \\times (${options.upperValue} - ${options.lowerValue}) = ${median.toFixed(4)} $$</p></div>
            `;
        } else {
            solution += `
                <p><strong>3. Find the median value:</strong></p>
                <p>We look for the cumulative frequency which is just greater than or equal to ${pos}.</p>
                <p>The c.f. value is ${options.cf}, and the corresponding value of x is <strong>${options.x}</strong>.</p>
            `;
        }

        solution += `<p><strong>The median for the given data is ${median.toFixed(4)}.</strong></p>`;
        return solution;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CentralTendencyCalculator();
});
