//@ts-check
export class AnaliticModule {// Función para crear tablas cruzadas
    static createCrossTable(data, rowVar, colVar) {
        // Inicializar tabla de frecuencias
        const table = {};
        const rowValues = new Set();
        const colValues = new Set();

        // Contar frecuencias
        data.forEach(item => {
            const rowValue = item[rowVar];
            const colValue = item[colVar];

            if (!rowValue || !colValue) return;

            rowValues.add(rowValue);
            colValues.add(colValue);

            if (!table[rowValue]) table[rowValue] = {};
            table[rowValue][colValue] = (table[rowValue][colValue] || 0) + 1;
        });

        // Convertir Sets a Arrays ordenados
        const sortedRowValues = Array.from(rowValues).sort();
        const sortedColValues = Array.from(colValues).sort();

        // Crear matriz de resultados
        const result = {
            rows: sortedRowValues,
            cols: sortedColValues,
            data: [],
            rowTotals: [],
            colTotals: new Array(sortedColValues.length).fill(0),
            grandTotal: 0
        };

        // Llenar la matriz de datos
        sortedRowValues.forEach((rowVal, rowIdx) => {
            const rowData = [];
            let rowTotal = 0;

            sortedColValues.forEach((colVal, colIdx) => {
                const count = table[rowVal]?.[colVal] || 0;
                rowData.push(count);
                rowTotal += count;
                result.colTotals[colIdx] += count;
            });

            result.data.push(rowData);
            result.rowTotals.push(rowTotal);
            result.grandTotal += rowTotal;
        });

        return result;
    }

    // Función para calcular el chi-cuadrado
    static chiSquareTest(table) {
        const { rows, cols, data, rowTotals, colTotals, grandTotal } = table;
        const numRows = rows.length;
        const numCols = cols.length;

        // Calcular valores esperados y chi-cuadrado
        let chiSquare = 0;
        const expected = [];
        const residuals = [];
        const contributions = [];

        for (let i = 0; i < numRows; i++) {
            expected[i] = [];
            residuals[i] = [];
            contributions[i] = [];

            for (let j = 0; j < numCols; j++) {
                const exp = (rowTotals[i] * colTotals[j]) / grandTotal;
                expected[i][j] = exp;

                const obs = data[i][j];
                const diff = obs - exp;
                residuals[i][j] = diff;

                if (exp > 0) {
                    const contrib = Math.pow(diff, 2) / exp;
                    contributions[i][j] = contrib;
                    chiSquare += contrib;
                } else {
                    contributions[i][j] = 0;
                }
            }
        }

        // Grados de libertad
        const df = (numRows - 1) * (numCols - 1);

        // Valor p (aproximación usando distribución chi-cuadrado)
        // Esta es una aproximación simple - en producción usaría una librería estadística
        function chiSquareCDF(x, k) {
            // Aproximación simple (no precisa para todos los casos)
            if (x <= 0) return 0;
            if (k <= 0) return 0;

            // Usando la aproximación de Wilson-Hilferty
            const a = Math.pow(x / k, 1 / 3);
            const b = 1 - 2 / (9 * k);
            const z = (a - b) * Math.sqrt(9 * k / 2);

            // Aproximación normal estándar
            return 0.5 * (1 + erf(z / Math.sqrt(2)));
        }

        function erf(x) {
            // Aproximación de error function
            const a1 = 0.254829592;
            const a2 = -0.284496736;
            const a3 = 1.421413741;
            const a4 = -1.453152027;
            const a5 = 1.061405429;
            const p = 0.3275911;

            const sign = x < 0 ? -1 : 1;
            x = Math.abs(x);

            const t = 1.0 / (1.0 + p * x);
            const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

            return sign * y;
        }

        const pValue = 1 - chiSquareCDF(chiSquare, df);

        return {
            chiSquare,
            degreesOfFreedom: df,
            pValue,
            expected,
            residuals,
            contributions
        };
    }

    // Función para imprimir tablas en formato legible
    static printTable(table) {
        const { rows, cols, data, rowTotals, colTotals, grandTotal } = table;

        // Encabezados de columnas
        let header = "          | " + cols.join(" | ") + " | Total";
        console.log(header);
        console.log("-".repeat(header.length));

        // Filas de datos
        for (let i = 0; i < rows.length; i++) {
            let rowStr = `${rows[i].padEnd(10)} | `;
            for (let j = 0; j < cols.length; j++) {
                rowStr += `${data[i][j].toString().padEnd(cols[j].length)} | `;
            }
            rowStr += rowTotals[i];
            console.log(rowStr);
        }

        // Totales por columna
        let footer = "Total     | ";
        for (let j = 0; j < cols.length; j++) {
            footer += `${colTotals[j].toString().padEnd(cols[j].length)} | `;
        }
        footer += grandTotal;
        console.log("-".repeat(header.length));
        console.log(footer);
    }

    // Función para analizar todas las preguntas contra variables demográficas
    static analyzeSurvey(data, demographicVars, questionPrefixes) {
        const results = {};

        demographicVars.forEach(demVar => {
            results[demVar] = {};

            // Encontrar todas las preguntas que coincidan con los prefijos
            const questions = Object.keys(data[0]).filter(key => {
                return key !== demVar &&
                    questionPrefixes.some(prefix => key.startsWith(prefix));
            });

            questions.forEach(question => {
                // Crear tabla cruzada
                const table = this.createCrossTable(data, demVar, question);

                // Calcular chi-cuadrado si la tabla no es demasiado pequeña
                let chiSquareResult = null;
                if (table.rows.length > 1 && table.cols.length > 1) {
                    chiSquareResult = this.chiSquareTest(table);
                }

                // Almacenar resultados
                results[demVar][question] = {
                    table,
                    chiSquare: chiSquareResult
                };
            });
        });

        return results;
    }

}



