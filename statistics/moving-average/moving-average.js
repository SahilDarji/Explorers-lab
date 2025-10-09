import { formatNumber } from '../../shared/js/utils.js';

export class MovingAverageCalculator {
    constructor() {
        this.values = [];
        this.activeTab = 3;
        this.initializeEventListeners();
        this.calculateAndDisplay();
    }

    initializeEventListeners() {
        const addRowBtn = document.getElementById('addRowBtn');
        addRowBtn.addEventListener('click', () => this.addRow());

        const dataTable = document.getElementById('dataTable');
        dataTable.addEventListener('input', () => this.calculateAndDisplay());
        dataTable.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type === 'number') {
                e.preventDefault();
                const currentRow = e.target.closest('tr');
                if (currentRow === dataTable.querySelector('tr:last-child')) {
                    this.addRow();
                    dataTable.querySelector('tr:last-child input').focus();
                }
            }
        });

        document.getElementById('tab3').addEventListener('click', () => this.setActiveTab(3));
        document.getElementById('tab4').addEventListener('click', () => this.setActiveTab(4));
        document.getElementById('tab5').addEventListener('click', () => this.setActiveTab(5));
    }

    addRow() {
        const tbody = document.getElementById('dataTable');
        const newRow = document.createElement('tr');
        const newIndex = tbody.rows.length;
        newRow.innerHTML = `<td class="px-4 py-2"><input type="number" step="any" class="w-full" data-obs-id="${newIndex}"></td>`;
        tbody.appendChild(newRow);
    }

    getInputData() {
        const inputs = document.querySelectorAll('#dataTable input[type="number"]');
        this.values = Array.from(inputs)
            .map(input => input.value.trim())
            .filter(val => val !== '')
            .map(val => parseFloat(val));
    }

    setActiveTab(period) {
        this.activeTab = period;
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`tab${period}`).classList.add('active');
        this.calculateAndDisplay();
    }
    
    attachHoverListeners() {
        const totalCells = document.querySelectorAll('[data-total-for]');
        totalCells.forEach(cell => {
            const obsIds = cell.getAttribute('data-total-for').split(',');
            cell.addEventListener('mouseover', () => {
                obsIds.forEach(id => {
                    const valueCell = document.querySelector(`[data-value-id="${id}"]`);
                    if (valueCell) {
                        valueCell.classList.add('highlight');
                    }
                });
            });
            cell.addEventListener('mouseout', () => {
                obsIds.forEach(id => {
                    const valueCell = document.querySelector(`[data-value-id="${id}"]`);
                    if (valueCell) {
                        valueCell.classList.remove('highlight');
                    }
                });
            });
        });
    }

    calculateAndDisplay() {
        this.getInputData();
        const container = document.getElementById('resultTableContainer');
        container.innerHTML = '';

        if (this.values.length < this.activeTab) {
            container.innerHTML = `<p class="text-gray-500">Enter at least ${this.activeTab} values to calculate.</p>`;
            return;
        }

        let tableHtml = '';
        if (this.activeTab === 3 || this.activeTab === 5) {
            tableHtml = this.getStandardMovingAverageTable();
        } else if (this.activeTab === 4) {
            tableHtml = this.getCenteredMovingAverageTable();
        }
        container.innerHTML = tableHtml;
        this.attachHoverListeners();
    }

    getStandardMovingAverageTable() {
        const period = this.activeTab;
        const totals = new Array(this.values.length).fill({ value: '-', 'data-total-for': '' });
        const averages = new Array(this.values.length).fill('-');
        const offset = Math.floor(period / 2);

        for (let i = 0; i <= this.values.length - period; i++) {
            const window = this.values.slice(i, i + period);
            const sum = window.reduce((a, b) => a + b, 0);
            const obsIds = Array.from({length: period}, (_, k) => i + k);

            totals[i + offset] = {
                value: formatNumber(sum),
                'data-total-for': obsIds.join(',')
            };
            averages[i + offset] = `${formatNumber(sum)} / ${period} = ${formatNumber(sum / period)}`;
        }

        let table = `
            <table class="min-w-full divide-y divide-gray-200">
                <thead>
                    <tr>
                        <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Period</th>
                        <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Value</th>
                        <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">${period}-Period Total</th>
                        <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">${period}-Period MA</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">`;

        for (let i = 0; i < this.values.length; i++) {
            table += `
                <tr>
                    <td class="px-4 py-2 text-sm text-gray-700">${i + 1}</td>
                    <td class="px-4 py-2 text-sm text-gray-700" data-value-id="${i}">${formatNumber(this.values[i])}</td>
                    <td class="px-4 py-2 text-sm text-gray-700" data-total-for="${totals[i]['data-total-for']}">${totals[i].value}</td>
                    <td class="px-4 py-2 text-sm text-gray-700">${averages[i]}</td>
                </tr>`;
        }
        table += `</tbody></table>`;
        return table;
    }

    getCenteredMovingAverageTable() {
        let table = `
            <table class="min-w-full divide-y divide-gray-200">
                <thead>
                    <tr>
                        <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Period</th>
                        <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Value</th>
                        <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">4-Period Total</th>
                        <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Centered Total</th>
                        <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Centered MA</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">`;

        const fourPeriodTotals = [];
        for (let i = 0; i <= this.values.length - 4; i++) {
            const window = this.values.slice(i, i + 4);
            const sum = window.reduce((a, b) => a + b, 0);
            const obsIds = Array.from({length: 4}, (_, k) => i + k);
            fourPeriodTotals.push({
                value: sum,
                'data-total-for': obsIds.join(',')
            });
        }

        const centeredTotals = [];
        for (let i = 0; i < fourPeriodTotals.length - 1; i++) {
            const sum = fourPeriodTotals[i].value + fourPeriodTotals[i + 1].value;
            const obsIds = fourPeriodTotals[i]['data-total-for'] + ',' + fourPeriodTotals[i+1]['data-total-for'];
            centeredTotals.push({
                value: sum,
                'data-total-for': obsIds
            });
        }
        
        const centeredAverages = centeredTotals.map(item => `${formatNumber(item.value)} / 8 = ${formatNumber(item.value / 8)}`);

        for (let i = 0; i < this.values.length; i++) {
            const centeredTotalItem = (i >= 2 && i - 2 < centeredTotals.length) ? centeredTotals[i-2] : { value: '-', 'data-total-for': '' };
            const centeredAverage = (i >= 2 && i - 2 < centeredAverages.length) ? centeredAverages[i-2] : '-';

            // Observation Row
            table += `
                <tr>
                    <td class="px-4 py-2 text-sm text-gray-700">${i + 1}</td>
                    <td class="px-4 py-2 text-sm text-gray-700" data-value-id="${i}">${formatNumber(this.values[i])}</td>
                    <td class="px-4 py-2 text-sm text-gray-700"></td>
                    <td class="px-4 py-2 text-sm text-gray-700" data-total-for="${centeredTotalItem['data-total-for']}">${centeredTotalItem.value !== '-' ? formatNumber(centeredTotalItem.value) : '-'}</td>
                    <td class="px-4 py-2 text-sm text-gray-700">${centeredAverage}</td>
                </tr>`;

            // In-between row for 4-period totals
            if (i < this.values.length - 1) {
                const fourPeriodTotalItem = (i >= 1 && i - 1 < fourPeriodTotals.length) ? fourPeriodTotals[i-1] : { value: '', 'data-total-for': '' };
                table += `
                <tr class="bg-gray-50">
                    <td class="py-1"></td>
                    <td class="py-1"></td>
                    <td class="px-4 py-1 text-sm text-gray-700" data-total-for="${fourPeriodTotalItem['data-total-for']}">${fourPeriodTotalItem.value !== '' ? formatNumber(fourPeriodTotalItem.value) : ''}</td>
                    <td class="py-1"></td>
                    <td class="py-1"></td>
                </tr>`;
            }
        }
        table += `</tbody></table>`;
        return table;
    }
}
