

//@ts-check
import { WRender, ComponentsManager, html } from "../../WModules/WComponentsTools.js";
import { StylesControlsV2, StylesControlsV3, StyleScrolls } from "../../StyleModules/WStyleComponents.js"
import { css } from "../../WModules/WStyledRender.js";
import { ColumChart } from "../../WComponents/WChartJSComponents.js";
import { WAppNavigator } from "../../WComponents/WAppNavigator.js";

const GlobalAnaliticDataset = {}
let jsonData;

const responseMapping = {
    "Nunca": 1,
    "Rara vez": 2,
    "A veces": 3,
    "Frecuentemente": 4,
    "Siempre": 5
};

/**
 * @typedef {Object.<string, any>} ComponentConfig
 * * @property {Object.<string, any>} [propierty]
 */
class WEstadisicAnalitic extends HTMLElement {
    /**
     * 
     * @param {ComponentConfig} props 
     */
    constructor(props) {
        super();
        this.OptionContainer = WRender.Create({ className: "OptionContainer" });
        this.TabContainer = WRender.Create({ className: "TabContainer", id: 'TabContainer' });
        this.Manager = new ComponentsManager({ MainContainer: this.TabContainer, SPAManage: false });

        const excelFile = html`<input type="file" onchange="${(e) => { this.ExportData(e) }}" id="excelFile" accept=".xlsx" style="margin-top: 1rem;" />`
        const printBtn = html`<button id="printBtn" onclick="${() => {
            const jsonContent = this.jsonOutput.innerText;
            const summaryHTML = this.summaryOutput.innerHTML;
            const printWindow = window.open('', '_blank');
            // @ts-ignore
            printWindow.document.open();
            // @ts-ignore
            printWindow.document.write(`${summaryHTML} <hr/> ${this.AnaliticChi2Container.innerHTML}<style>${this.CustomStyle.innerHTML}</style>`);
            // @ts-ignore
            printWindow.document.close();
            // @ts-ignore
            printWindow.focus();
            // @ts-ignore
            printWindow.print();
        }}" class="BtnPrimary">Imprimir Resultados</button>`


        this.jsonOutput = html`<pre id="jsonOutput"></pre>`
        this.summaryOutput = html`<div id="summaryOutput"></div>`
        this.container = html`<div id="container">
            ${this.jsonOutput}
            ${this.summaryOutput}
        </div>`
        this.AnaliticChi2Container = html`<div id="containerAnalitic"></div>`
        this.append(this.CustomStyle);
        this.nav = new WAppNavigator({
            Inicialize: true,
            NavStyle: "tab",
            Elements: [
                {
                    name: "Inicio",
                    action: () => this.container
                }, {
                    name: "Analitic",
                    action: () => this.AnaliticChi2Container
                }
            ]
        })
        this.OptionContainer.append(excelFile, printBtn);
        this.append(
            StylesControlsV2.cloneNode(true),
            StyleScrolls.cloneNode(true),
            StylesControlsV3.cloneNode(true),
            html`<h2>Sube un archivo Excel (.xlsx) y conviértelo a JSON</h2>`,
            this.OptionContainer,
            this.nav,
            this.TabContainer
        );
        this.Draw();
    }
    ExportData(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            // @ts-ignore
            const data = event.target.result;
            // @ts-ignore
            const workbook = XLSX.read(data, { type: 'binary' });
            // Seleccionamos la primera hoja
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            // Convertimos a JSON
            // @ts-ignore
            jsonData = XLSX.utils.sheet_to_json(sheet).map(row => {
                const cleanRow = {};
                for (let key in row) {
                    if (row.hasOwnProperty(key)) {
                        const cleanKey = key.trim().normalize("NFKC");
                        cleanRow[cleanKey] = row[key];
                    }
                }
                return cleanRow;
            });
            // Mostramos el JSON
            // @ts-ignore
            this.jsonOutput.textContent = JSON.stringify(jsonData, null, 2);
            // Generamos el resumen excluyendo las columnas ignoradas
            const summary = this.generateSummary(jsonData, []);
            this.displaySummary(summary);
            //StadisticTest()
            const dataChi2 = this.StadisticChi2Test()
            // Insertar todas las tablas en el DOM
            Object.entries(dataChi2).forEach(([varName, content]) => {
                Object.entries(content).forEach(([varName2, content2]) => {
                    if (varName === varName2) {
                        return;
                    }
                    this.AnaliticChi2Container.append(html`<div><h3>${varName} (Filas)</h3><h3>+</h3><h3>${varName2} (Columnas)</h3></div>`);
                    this.AnaliticChi2Container.append(this.generateTableHTML(content2));
                });
            });

        };

        reader.onerror = function (error) {
            console.error("Error al leer el archivo:", error);
            alert("Hubo un error al leer el archivo.");
        };

        reader.readAsBinaryString(file);
    }
    Draw = async () => {
        //this.SetOption();

    }
    async SetOption() {
        /*this.OptionContainer.append(WRender.Create({
            tagName: 'button', className: 'Block-Primary', innerText: 'Home',
            onclick: async () => this.Manager.NavigateFunction("id", await this.MainComponent())
        }))*/
    }
    generateSummary(data, ignoreList = []) {
        const summary = {};

        if (!Array.isArray(data) || data.length === 0) return summary;

        const fields = Object.keys(data[0]);

        fields.forEach(field => {
            if (!ignoreList.includes(field)) {
                summary[field] = {};
            }
        });

        data.forEach(row => {
            for (const field in row) {
                if (ignoreList.includes(field)) continue;

                const value = row[field];
                if (value === undefined || value === null || value === "") continue;

                if (!summary[field]) {
                    summary[field] = {};
                }

                summary[field][value] = (summary[field][value] || 0) + 1;
            }
        });

        return summary;
    }

    displaySummary(summary) {
        const datacontainer = document.createElement('div');
        datacontainer.classList.add('data-container');
        this.summaryOutput.innerHTML = '<h2>Resumen Estadístico</h2>';
        for (const field in summary) {
            const DataSetSumary = [];
            const values = summary[field];
            const total = Object.values(values).reduce((a, b) => a + b, 0);

            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const tbody = document.createElement('tbody');

            // Encabezado de tabla
            const headerRow = document.createElement('tr');
            ['Valor', 'Conteo', 'Porcentaje (%)'].forEach(text => {
                const th = document.createElement('th');
                th.textContent = text;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);

            // Filas de datos
            for (const value in values) {
                const tr = document.createElement('tr');
                const percent = ((values[value] / total) * 100).toFixed(2);
                [value, values[value], percent].forEach(text => {
                    const td = document.createElement('td');
                    td.textContent = text;
                    tr.appendChild(td);
                });
                DataSetSumary.push({ Valor: value, Conteo: values[value], Porcentaje: percent })
                tbody.appendChild(tr);
            }

            table.appendChild(thead);
            table.appendChild(tbody);

            const h3 = document.createElement('h3');
            h3.textContent = field;
            //datacontainer.appendChild(h3);
            datacontainer.appendChild(html`<div class="table-container">
                ${h3}
                ${table}
                ${new ColumChart({
                Dataset: DataSetSumary,
                EvalValue: "Porcentaje",
                groupParams: ["Valor"]
            })}
            </div>`);
            GlobalAnaliticDataset[field] = DataSetSumary;
        }

        this.summaryOutput.appendChild(datacontainer);
    }

    generateTableHTML(content) {
        const tableData = content.table;
        const chiSquare = content.chiSquare || null;

        const htmlContainer = html`<div class="table-container"></div>`

        const htmlTableHead = WRender.Create({ tagName: "tr", innerHTML: `<th></th>` });
        const htmlTable = html`<table></table>`;
        htmlTable.append(htmlTableHead);

        // Encabezados de columnas
        tableData.cols.forEach(col => htmlTableHead.append(WRender.Create({ tagName: "th", innerText: col })));
        htmlTableHead.append(WRender.Create({ tagName: "th", innerText: "Total" }));

        // Filas de datos
        for (let i = 0; i < tableData.rows.length; i++) {
            const row = WRender.Create({ tagName: "tr", innerHTML: `<th>${tableData.rows[i]}</th>` })
            htmlTable.append(row);
            tableData.data[i].forEach(val => row.append(WRender.Create({ tagName: "td", innerHTML: `${val}` })));
            row.append(WRender.Create({ tagName: "td", innerHTML: `<strong>${tableData.rowTotals[i]}</strong>` }));
        }

        const row = WRender.Create({ tagName: "tr", innerHTML: `<th>Total</th>` })
        htmlTable.append(row);
        tableData.colTotals.forEach(val => row.append(WRender.Create({ tagName: "td", innerHTML: `${val}` })));
        row.append(WRender.Create({ tagName: "td", innerHTML: `<strong>${tableData.grandTotal}</strong>` }));

        // Agregar sección para categorías significativas       
        if (chiSquare) {
            htmlContainer.append(
                htmlTable,
                html`<div class="chi-square">
                    <div>Chi²: ${chiSquare.chiSquare.toFixed(4)}</div>
                    <div>gl: ${chiSquare.degreesOfFreedom}</div>
                    <div>p: ${chiSquare.pValue.toFixed(4)}</div>
                </div>`,
                html`<div class="${chiSquare.pValue < 0.05 ? "h1" : "h0"}">${chiSquare.pValue < 0.05
                    ? `se rechaza hipotesis nula: podemos concluir que existe una relación estadísticamente significativa`
                    : `no se rechaza hipotesis nula: no existe relacion`}</div>`);

            if (chiSquare.pValue < 0.05) {
                htmlContainer.append(this.runPostHocAnalysis(tableData))                
                const significantCategories = AnaliticModule.findSignificantCategories(tableData);
                const significantHtml = html`<div class="significant-categories">
                    <h4>Categorías más significativas:</h4>
                    <ul></ul>
                </div>`;
                significantCategories.significantCategories.forEach(([rowIdx, colIdx]) => {
                    const rowValue = tableData.rows[rowIdx];
                    const colValue = tableData.cols[colIdx];
                    const count = tableData.data[rowIdx][colIdx];
                    significantHtml.querySelector("ul")?.append(
                        WRender.Create({
                            tagName: "li",
                            innerHTML: `${rowValue} - ${colValue}: ${count}`
                        })
                    );
                });
                htmlContainer.append(significantHtml);
            }
        }

        return htmlContainer;
    }
    runPostHocAnalysis(tableData) {
        const { rows, cols, data } = tableData;
        const nGroups = rows.length;
        const pruebasTests = html`<div class="significant-categories-post-hoc"></div>`

        // Comparar cada par de filas
        for (let i = 0; i < nGroups; i++) {
            for (let j = i + 1; j < nGroups; j++) {
                const group1 = data[i];
                const group2 = data[j];

                // Calcular Chi-cuadrado para dos grupos
                let chi2 = 0;
                for (let k = 0; k < group1.length; k++) {
                    const expected1 = (group1[k] + group2[k]) / 2;
                    if (expected1 === 0) continue;
                    chi2 += Math.pow(group1[k] - expected1, 2) / expected1;
                    chi2 += Math.pow(group2[k] - expected1, 2) / expected1;
                }

                const pVal = 1 - this.chi2CDF(chi2, 1); // Aproximación simple
                const isSignificant = pVal < 0.05;

                pruebasTests.append(html`<div>Comparando ${rows[i]} vs ${rows[j]}: χ²=${chi2.toFixed(3)}, p=${pVal.toFixed(4)} → ${isSignificant ? 'Diferentes' : 'Similares'}</div>`);
            }
        }
        return pruebasTests;
    }
    chi2CDF(x, df) {
        return 1 - Math.exp(-x / 2) * Math.sqrt(x / (Math.PI * 2)) / Math.pow(df, 0.5);
    }
    StadisticChi2Test() {
        this.AnaliticChi2Container.innerHTML = '<h2>Resumen Estadístico - CHI2</h2>';
        // Ejemplo de uso con tus datos
        const surveyData = jsonData;
        // Realizar análisis
        const analysisResults = AnaliticModule.analyzeSurvey(surveyData, Object.keys(jsonData[0]), Object.keys(jsonData[0]));
        //Mostrar resultados para algunas tablas como ejemplo
        /*console.log("=== Ejemplo de Tabla Cruzada ===");
        const exampleTable = AnaliticModule.createCrossTable(surveyData, "Tipo de contratación", "Diseña materiales educativos digitales con estructura pedagógica clara.");
        AnaliticModule.printTable(exampleTable);
    
        console.log("\n=== Prueba Chi-Cuadrado para la tabla anterior ===");
        const chi2Result = AnaliticModule.chiSquareTest(exampleTable);
        console.log(`Chi-cuadrado: ${chi2Result.chiSquare.toFixed(4)}`);
        console.log(`Grados de libertad: ${chi2Result.degreesOfFreedom}`);
        console.log(`Valor p: ${chi2Result.pValue.toFixed(6)}`);
        console.log(chi2Result.pValue < 0.05
            ? `se rechaza hipotesis nula: podemos concluir que existe una relación estadísticamente significativa`
            : `no se rechaza hipotesis nula: no existe relacion`)*/
        return analysisResults;
    }

    // Función para encontrar las categorías más significativas



    CustomStyle = css`
        body {
            font-family: Arial, sans-serif;
            margin: 2rem;
        }
        .OptionContainer {
            padding: 10px;
        }

        h3, h2 {
            margin: 10px auto;
            display: block;
            text-align: center;
        }

        h2 {
            color: #0657cf
        }
        .significant-categories {
            margin-top: 20px;
            font-size: 16px;
            display: flex;
            flex-direction: column;
        }

        .significant-categories h4 {
            color: #007bff;
        }

        .significant-categories ul {
            list-style-type: disc;
            padding-left: 20px;
        }
        #jsonOutput,
        #summaryOutput, #containerAnalitic {
            white-space: pre-wrap;
            background-color: #f4f4f4;
            padding: 1rem;
            margin-top: 1rem;
            max-height: 100vh;
            overflow-y: auto;
            border: 1px solid #ccc;
        }
        #jsonOutput {
            overflow-x: auto;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 1rem;
        }
        th,
        td {
            border: 1px solid #999;
            padding: 8px;
            text-align: center;
        }

        th {
            background-color: #f2f2f2;
        }
        .h1 {
            color: green;   
            padding: 10px;
            text-align: center;
        }
        .h0 {
            color: red;
            padding: 10px;
            text-align: center;
        }

        #container {
            display: grid;
            grid-template-columns: 1fr 4fr;
            gap: 1rem;
            margin-top: 1rem;
        }

        .data-container {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .table-container {
            width: 210mm;
            padding: 20px;
            margin: 10px auto;
            background-color: #fff;
            border-radius: 10px;
            display: flex;
            flex-direction: column;
        }
        .chi-square {  
            display: flex;
            justify-content: space-around;
            padding: 10px;
         }

        @media print {
            * {
                -webkit-print-color-adjust: exact !important;
                border-collapse: collapse;
            }
            .page {
                border: none;
                /* Optional: Remove border for printing */
                margin: 0;
                padding: 0;
                box-shadow: none;
                /* Optional: Remove any shadow for printing */
                page-break-after: always;
                /* Ensure each .page-container starts on a new page */
            }

            .detail-content .container,
            .detail-content .element-details {
                flex-direction: row
            }

            .hidden {
                display: none;
            }
        }        
    `
}
customElements.define('w-component', WEstadisicAnalitic);
export { WEstadisicAnalitic }



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

            // @ts-ignore
            result.data.push(rowData);
            // @ts-ignore
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
                // @ts-ignore
                expected[i][j] = exp;

                const obs = data[i][j];
                const diff = obs - exp;
                // @ts-ignore
                residuals[i][j] = diff;

                if (exp > 0) {
                    const contrib = Math.pow(diff, 2) / exp;
                    // @ts-ignore
                    contributions[i][j] = contrib;
                    chiSquare += contrib;
                } else {
                    // @ts-ignore
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
    static findSignificantCategories(table) {
        const { data } = table;
        let maxCount = 0;
        let significantCategories = [];

        // Recorrer todas las celdas de la tabla
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].length; j++) {
                if (data[i][j] > maxCount) {
                    maxCount = data[i][j];
                    significantCategories = [[i, j]];
                } else if (data[i][j] === maxCount) {
                    significantCategories.push([i, j]);
                }
            }
        }

        return {
            maxCount,
            significantCategories
        };
    }

}