export class StadisticModule {
    static GenerateCrossTable(data, field1, field2) {
        const crossTable = {};

        data.forEach(row => {
            const val1 = row[field1];
            const val2 = row[field2];

            if (!val1 || !val2) return;

            if (!crossTable[val1]) {
                crossTable[val1] = {};
            }

            if (!crossTable[val1][val2]) {
                crossTable[val1][val2] = 0;
            }

            crossTable[val1][val2]++;
        });

        return crossTable;
    }

    static DisplayCrossTable(crossTable, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '<h4>Tabla Cruzada</h4>';

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        // Encabezados
        const headerRow = document.createElement('tr');
        headerRow.appendChild(document.createElement('th'));

        const allColumns = new Set();
        for (const row in crossTable) {
            for (const col in crossTable[row]) {
                allColumns.add(col);
            }
        }

        allColumns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);

        // Filas de datos
        for (const row in crossTable) {
            const tr = document.createElement('tr');
            const th = document.createElement('th');
            th.textContent = row;
            tr.appendChild(th);

            allColumns.forEach(col => {
                const td = document.createElement('td');
                td.textContent = crossTable[row][col] || 0;
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        }

        table.appendChild(thead);
        table.appendChild(tbody);
        container.appendChild(table);
    }
    static ChiSquareTest(crossTable) {
        const rows = Object.keys(crossTable);
        const cols = Object.keys(crossTable[rows[0]]);

        let chi2 = 0;
        const n = rows.reduce((total, r) =>
            total + cols.reduce((sum, c) => sum + (crossTable[r][c] || 0), 0), 0);

        // Total por fila y columna
        const rowTotals = {};
        const colTotals = {};

        rows.forEach(r => {
            rowTotals[r] = cols.reduce((sum, c) => sum + (crossTable[r][c] || 0), 0);
        });

        cols.forEach(c => {
            colTotals[c] = rows.reduce((sum, r) => sum + (crossTable[r][c] || 0), 0);
        });

        // Calcular chi2
        rows.forEach(r => {
            cols.forEach(c => {
                const observed = crossTable[r][c] || 0;
                const expected = (rowTotals[r] * colTotals[c]) / n;
                chi2 += Math.pow(observed - expected, 2) / expected;
            });
        });

        return { chi2, pValue: this.Chi2ToPValue(chi2, rows.length - 1, cols.length - 1) };
    }

    // Aproximación simple de p-value (puedes usar una librería como jStat para mayor precisión)
    static Chi2ToPValue(chi2, df1, df2) {
        // Aquí iría el cálculo real usando una librería o tabla predefinida
        // Como aproximación básica:
        return chi2 > 5 ? "Significativo" : "No significativo";
    }
}