//@ts-check
import { WBarChart } from "../../WDevCore/WComponents/ChartsComponents/WBarChar.js";
import { WAjaxTools } from "../../WDevCore/WModules/WAjaxTools.js"


window.onload = async () => {
    const GroupParams = [
        "Anio", "Rango_Antiguedad"
    ]
    const EvalParams = [
        "Estado_Final_Color"
    ];
    const request = {
        "Desde": "2025-04-05T04:15:41.242Z",
        "Hasta": "2027-04-05T04:15:41.242Z",
        "GroupParams": GroupParams,
        "EvalParams": EvalParams
    }

    const response = await WAjaxTools.PostRequest("/api/ApiAnalitic/AntiguedadBienestar", request);
    document.body.querySelector("#mainContent")?.append(new WBarChart({
        // @ts-ignore
        data: response,
        GroupParams: GroupParams,
        EvalParams: EvalParams,
        title: 'Bienestar X Antiguedad',
        Colors: ["#27e512", "#e56412", "#e51212"]
    }));
    document.body.querySelector("#mainContent")?.append(generarTarjetasHipotesis(response.hipotesisTestResults))
}

/**
 * Genera tarjetas HTML autocontenidas a partir de resultados de pruebas de hipótesis
 * Compatible con la estructura JSON devuelta por el servicio CPAD010
 * @param {any[]} resultados
 */
function generarTarjetasHipotesis(resultados) {
    // Aceptar string JSON u objeto ya parseado
    if (!Array.isArray(resultados) || resultados.length === 0) {
        return '<p style="color:#dc2626; padding:1rem; background:#fef2f2; border-radius:8px;">⚠️ No se encontraron datos válidos para generar las tarjetas.</p>';
    }

    // CSS embebido y scoped para evitar conflictos con tu frontend
    const styles = `
    <style>
    .hypothesis-card {
        font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        margin: 1.5rem auto;
        max-width: 960px;
        overflow: hidden;
    }
    .hc-header {
        background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
        padding: 1.25rem;
        border-bottom: 1px solid #e5e7eb;
    }
    .hc-header h2 { margin: 0 0 0.5rem; font-size: 1.25rem; color: #0f172a; }
    .hc-header p { margin: 0; color: #475569; font-size: 0.9rem; }
    .hc-meta { display: flex; gap: 0.75rem; margin-top: 0.75rem; flex-wrap: wrap; }
    .hc-tag { background: #e2e8f0; padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.75rem; color: #334155; }
    
    .hc-metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 1rem;
        padding: 1.25rem;
        background: #fafbfc;
    }
    .hc-metric { text-align: center; padding: 0.75rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; }
    .hc-metric .lbl { font-size: 0.7rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .hc-metric .val { font-size: 1.1rem; font-weight: 600; color: #0f172a; margin-top: 0.25rem; }
    
    .hc-decision {
        margin: 0 1.25rem;
        padding: 1rem;
        border-left: 4px solid #3b82f6;
        background: #eff6ff;
        border-radius: 6px;
    }
    .hc-decision.hc-ok { border-left-color: #10b981; background: #ecfdf5; }
    .hc-decision.hc-warn { border-left-color: #f59e0b; background: #fffbeb; }
    .hc-decision h3 { margin: 0 0 0.5rem; font-size: 1rem; }
    .hc-decision p { margin: 0; line-height: 1.5; color: #334155; }

    .hc-section { padding: 1.25rem; }
    .hc-section h3 { margin: 0 0 1rem; font-size: 1.1rem; color: #1e293b; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
    
    .hc-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-bottom: 1rem; }
    .hc-table th, .hc-table td { padding: 0.6rem 0.8rem; border: 1px solid #e5e7eb; text-align: left; }
    .hc-table th { background: #f8fafc; font-weight: 600; color: #334155; }
    .hc-table td { color: #475569; }
    
    .hc-recs ul { padding-left: 1.25rem; margin: 0; }
    .hc-recs li { margin: 0.5rem 0; line-height: 1.5; color: #334155; }
    
    .hc-footer {
        background: #f8fafc;
        padding: 1rem 1.25rem;
        font-size: 0.8rem;
        color: #64748b;
        border-top: 1px solid #e5e7eb;
        word-break: break-word;
    }
    .hc-footer strong { color: #0f172a; }
    </style>`;

    let html = styles;

    resultados.forEach((res, i) => {
        // Formateo seguro de valores
        const fecha = res.FechaEjecucion
            ? new Date(res.FechaEjecucion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            : 'N/A';
        const rho = res.Estadistico_Principal != null ? Number(res.Estadistico_Principal).toFixed(3) : 'N/A';
        const pval = res.P_Value != null ? Number(res.P_Value).toExponential(3) : 'N/A';
        const ic = (res.IC_Inferior_95 != null && res.IC_Superior_95 != null)
            ? `[${Number(res.IC_Inferior_95).toFixed(3)}, ${Number(res.IC_Superior_95).toFixed(3)}]`
            : 'N/A';
        const decisionClass = res.Rechazar_Hipotesis_Nula ? 'hc-ok' : 'hc-warn';
        const icon = res.Rechazar_Hipotesis_Nula ? '✅' : '📌';

        // Tablas descriptivas
        let contHtml = '<table class="hc-table"><thead><tr><th>Variable</th><th>Media</th><th>Mediana</th><th>DE</th><th>Min</th><th>Max</th><th>N</th></tr></thead><tbody>';
        let catHtml = '<table class="hc-table"><thead><tr><th>Variable</th><th>Distribución (Valor: Cantidad)</th></tr></thead><tbody>';

        Object.entries(res.Estadisticos_Descriptivos || {}).forEach(([key, stats]) => {
            if (stats?.Media != null) {
                contHtml += `<tr>
                    <td>${key}</td><td>${stats.Media}</td><td>${stats.Mediana}</td>
                    <td>${stats.Desviacion_Estandar}</td><td>${stats.Minimo}</td><td>${stats.Maximo}</td><td>${stats.Count_Validos}</td>
                </tr>`;
            } else if (stats?.Distribucion_Categorica) {
                const dist = Object.entries(stats.Distribucion_Categorica).map(([k, v]) => `${k}: ${v}`).join(' • ');
                catHtml += `<tr><td>${key}</td><td>${dist}</td></tr>`;
            }
        });
        contHtml += '</tbody></table>';
        catHtml += '</tbody></table>';

        // Recomendaciones
        const recsList = (res.Recomendaciones || []).map(r => `<li>${r}</li>`).join('') || '<li>Sin recomendaciones generadas.</li>';

        // Configuración usada
        const cfg = res.Config_Usada || {};
        const cfgText = `
            <strong>VI:</strong> ${cfg.Variable_Independiente || '-'} | 
            <strong>VD:</strong> ${cfg.Variable_Dependiente || '-'} | 
            <strong>Prueba:</strong> ${cfg.Tipo_Prueba || '-'} | 
            <strong>α:</strong> ${cfg.Alpha ?? '0.05'} |
            <strong>Agrupación:</strong> ${(cfg.Campos_Agrupacion || []).join(', ') || '-'} |
            <strong>Controles:</strong> ${(cfg.Variables_Control || []).join(', ') || '-'}
        `;

        html += `
        <article class="hypothesis-card" id="hc-${i}">
            <header class="hc-header">
                <h2>${res.NombreHipotesis || 'Prueba Estadística'}</h2>
                <p>${res.DescripcionHipotesis || ''}</p>
                <div class="hc-meta">
                    <span class="hc-tag">📅 ${fecha}</span>
                    <span class="hc-tag">📊 ${res.TotalRegistrosAnalizados || 0} registros</span>
                    <span class="hc-tag">👥 ${res.TotalUnicosAgrupacion || 0} unidades</span>
                </div>
            </header>

            <section class="hc-metrics">
                <div class="hc-metric"><div class="lbl">ρ (Spearman)</div><div class="val">${rho}</div></div>
                <div class="hc-metric"><div class="lbl">Valor-p</div><div class="val">${pval}</div></div>
                <div class="hc-metric"><div class="lbl">IC 95%</div><div class="val">${ic}</div></div>
                <div class="hc-metric"><div class="lbl">Tamaño Efecto</div><div class="val">${res.Tamanio_Efecto || '-'}</div></div>
            </section>

            <section class="hc-decision ${decisionClass}">
                <h3>${icon} Decisión Estadística</h3>
                <p>${res.Conclusion_Estadistica || 'Sin conclusión disponible.'}</p>
            </section>

            <section class="hc-section">
                <h3>📈 Estadísticos Descriptivos</h3>
                ${contHtml}
                ${catHtml}
            </section>

            <section class="hc-section hc-recs">
                <h3>💡 Recomendaciones</h3>
                <ul>${recsList}</ul>
            </section>

            <footer class="hc-footer">
                <strong>⚙️ Configuración de la Prueba:</strong><br>${cfgText}
            </footer>
        </article>`;
    });

    const div = document.createElement("div");
    div.innerHTML = html
    return div;
}

