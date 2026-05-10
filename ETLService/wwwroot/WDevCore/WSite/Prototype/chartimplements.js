//@ts-check
import { WBarChart } from "../../WComponents/ChartsComponents/WBarChar.js";
import { WLineChart } from "../../WComponents/ChartsComponents/WLineChart.js";
import { WArrayF } from "../../WModules/WArrayF.js";
import { html, WRender } from "../../WModules/WComponentsTools.js";
import { css } from "../../WModules/WStyledRender.js";
import { data, ModelObject } from "../WDevCoreSite/Examples/ExampleData.js";



// 1. Preparar datos de ejemplo




const GroupParams = ["Sucursal", "Categoria", "Tipo", "Producto"]
const EvalParams = ["SubTotal",
    "Descuento",
    "Iva",
    "Total"]


// 3. Agrupar datos con WArrayF (máximo 4 niveles)
const groupedResult = WArrayF.GroupData(
    data,
    GroupParams,  // Parámetros de agrupación
    EvalParams,      // Métricas a evaluar
    new ModelObject(),
    'Ventas',
    true
);

// 4. Crear instancia del componente con configuración
const chart = new WBarChart({
    // @ts-ignore
    data: groupedResult,
    metric: 'Total',
    GroupParams: GroupParams,
    EvalParams: EvalParams,
    title: '📊 Ventas por Sucursal'
});

// 5. Insertar en el DOM
document.body.appendChild(chart);


// 4. Crear instancia del componente con configuración
const lineChart = new WLineChart({
    // @ts-ignore
    data: groupedResult,
    metric: 'Total',
    GroupParams: GroupParams,
    EvalParams: EvalParams,
    title: '📊 Ventas por Sucursal'
});

// 5. Insertar en el DOM
document.body.appendChild(lineChart);


// 6. (Opcional) Métodos de control programático
// chart.setData(newData, 'SubTotal');  // Actualizar datos
// chart.navigateTo(['Sucursal A']);     // Navegar a nivel específico
// chart.goBack();                       // Retroceder
// chart.reset();                        // Reiniciar vista