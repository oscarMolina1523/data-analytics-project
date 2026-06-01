import { WAjaxTools } from "../../WDevCore/WModules/WAjaxTools.js";

let chart;

const CONFIG = {

    H1: {
        endpoint: "/api/ApiGymAnalitic/FrecuenciaEvolucion",

        groups: [
            "Tipo_Actividad",
            "Rango_Frecuencia",
            "Genero",
            "Nivel_Fitness_Inicial",
            "Tipo_Suscripcion",
            "Anio",
            "Mes",
            "Nombre_Mes",
            "Trimestre",
            "Semana_Anio"
        ],

        evals: [
            "Frecuencia_Semanal_Real",
            "Mejora_Peso_Pct",
            "Mejora_IMC_Pct",
            "Mejora_Masa_Muscular_Pct"
        ]
    },

    H2: {
        endpoint: "/api/ApiGymAnalitic/GamificacionRenovacion",

        groups: [
            "Tipo_Suscripcion",
            "Nivel_Gamificacion",
            "Anio",
            "Mes",
            "Nombre_Mes",
            "Trimestre",
            "Semana_Anio"
        ],

        evals: [
            "Score_Gamificacion_Mensual",
            "Retos_Completados",
            "Retos_Totales_Asignados",
            "Puntos_Ganados",
            "Pct_Cumplimiento_Retos"
        ]
    },

    H3: {
        endpoint: "/api/ApiGymAnalitic/ChurnPredictor",

        groups: [
            "Tipo_Suscripcion",
            "Nivel_Riesgo",
            "Anio",
            "Mes",
            "Nombre_Mes",
            "Trimestre",
            "Semana_Anio"
        ],

        evals: [
            "Dias_Inactividad_Consecutiva",
            "Lag_Periodo",
            "Probabilidad_Churn"
        ]
    },

    H4: {
        endpoint: "/api/ApiGymAnalitic/ConsistenciaPremium",

        groups: [
            "Tipo_Suscripcion",
            "Objetivo_Salud",
            "Nivel_Consistencia",
            "Anio",
            "Mes",
            "Nombre_Mes",
            "Trimestre",
            "Semana_Anio"
        ],

        evals: [
            "Sesiones_Programadas",
            "Sesiones_Completadas",
            "Cumplimiento_Pct",
            "Variacion_Metrica_Semanal"
        ]
    },

    H5: {
        endpoint: "/api/ApiGymAnalitic/SocialFactorProtector",

        groups: [
            "Genero",
            "Nivel_Interaccion",
            "Anio",
            "Mes",
            "Nombre_Mes",
            "Trimestre",
            "Semana_Anio"
        ],

        evals: [
            "Volumen_Carga_Semanal",
            "Densidad_Interaccion_Recibida",
            "Likes_Recibidos",
            "Comentarios_Recibidos",
            "Score_Percepcion_Esfuerzo_Borg",
            "Total_Interacciones"
        ]
    }

};

window.onload = () => {

    cargarHipotesis();

    document
        .getElementById("hipotesis")
        .addEventListener("change", actualizarCombos);

    document
        .getElementById("btnConsultar")
        .addEventListener("click", consultar);

};

function cargarHipotesis() {

    const select =
        document.getElementById("hipotesis");

    Object.keys(CONFIG).forEach(h => {

        const option =
            document.createElement("option");

        option.value = h;
        option.textContent = h;

        select.appendChild(option);

    });

    actualizarCombos();
}

function actualizarCombos() {

    const hipotesis =
        document.getElementById("hipotesis").value;

    const config =
        CONFIG[hipotesis];

    llenarSelect(
        "groupParam",
        config.groups
    );

    llenarSelect(
        "evalParam",
        config.evals
    );
}

function llenarSelect(id,data){

    const select =
        document.getElementById(id);

    select.innerHTML = "";

    data.forEach(x=>{

        const option =
            document.createElement("option");

        option.value=x;
        option.textContent=x;

        select.appendChild(option);

    });

}

async function consultar(){

    try{

        showLoading();

        const hipotesis =
            document.getElementById("hipotesis").value;

        const config =
            CONFIG[hipotesis];

        const request = {

            Desde:
                document.getElementById("desde").value +
                "T00:00:00",

            Hasta:
                document.getElementById("hasta").value +
                "T23:59:59",

            GroupParams:[
                document.getElementById("groupParam").value
            ],

            EvalParams:[
                document.getElementById("evalParam").value
            ]
        };

        const response =
            await WAjaxTools.PostRequest(
                config.endpoint,
                request
            );

        console.log(response);

        renderChart(
            response,
            document.getElementById("evalParam").value
        );

        renderHipotesis(
            response.hipotesisTestResults
        );

        renderRawData(response);

    }
    catch(ex){

        console.error(ex);

        alert(
            "Error consultando API. Revisar consola."
        );
    }
    finally{

        hideLoading();

    }
}

function renderChart(response, evalParam) {

    const metricLevels = response.metricLevels;

    if (!metricLevels) {
        document.getElementById("tableContainer").innerHTML =
            "<h3>No existe metricLevels en la respuesta</h3>";
        return;
    }

    const labels = [];
    const values = [];

    Object.entries(metricLevels).forEach(([grupo, metrics]) => {

        if (
            grupo === ""
            || grupo === "General Summary"
            || grupo.includes(">")
        ) {
            return;
        }

        const metric = metrics[evalParam];

        if (!metric) return;

        labels.push(grupo);

        values.push(metric.avg);
    });

    if (labels.length === 0) {

        document.getElementById("tableContainer").innerHTML =
            "<h3>No hay datos para graficar</h3>";

        return;
    }

    if (window.chartInstance) {
        window.chartInstance.destroy();
    }

    const ctx = document
        .getElementById("chart")
        .getContext("2d");

    window.chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: evalParam,
                data: values
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}

function renderRawData(response) {

    const evalParam =
        document.getElementById("evalParam").value;

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Grupo</th>
                    <th>Promedio</th>
                    <th>Total</th>
                    <th>Registros</th>
                </tr>
            </thead>
            <tbody>
    `;

    Object.entries(response.metricLevels)
        .forEach(([grupo, metrics]) => {

            if (
                grupo === ""
                || grupo === "General Summary"
                || grupo.includes(">")
            ) {
                return;
            }

            const metric =
                metrics[evalParam];

            if (!metric) return;

            html += `
                <tr>
                    <td>${grupo}</td>
                    <td>${metric.avg.toFixed(2)}</td>
                    <td>${metric.sum}</td>
                    <td>${metric.count}</td>
                </tr>
            `;
        });

    html += `
            </tbody>
        </table>
    `;

    document.getElementById(
        "tableContainer"
    ).innerHTML = html;
}

function renderHipotesis(resultados){

    const div =
        document.getElementById(
            "hipotesisContainer"
        );

    if(!resultados?.length){

        div.innerHTML =
            "<p>Sin prueba estadística</p>";

        return;
    }

    const h = resultados[0];

    div.innerHTML = `

        <h3>${h.NombreHipotesis}</h3>

        <p>
            <b>p-value:</b>
            ${h.P_Value}
        </p>

        <p>
            <b>Conclusión:</b>
            ${h.Conclusion_Estadistica}
        </p>

        <p>
            <b>Efecto:</b>
            ${h.Tamanio_Efecto}
        </p>

    `;
}

function showLoading(){

    document
        .getElementById("loading")
        .style.display = "block";
}

function hideLoading(){

    document
        .getElementById("loading")
        .style.display = "none";
}