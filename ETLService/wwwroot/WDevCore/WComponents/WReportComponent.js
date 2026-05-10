//@ts-check
import { StylesControlsV2 } from "../StyleModules/WStyleComponents.js";
// @ts-ignore
import { ModelProperty } from "../WModules/CommonModel.js";
import { Money } from "../WModules/Types/Money.js";
import { WArrayF } from "../WModules/WArrayF.js";
import { ComponentsManager, ConvertToMoneyString, html, WRender } from "../WModules/WComponentsTools.js";
import { WOrtograficValidation } from "../WModules/WOrtograficValidation.js";
import { css } from "../WModules/WStyledRender.js";
import { WDocumentViewer } from "./WDocumentViewer.js";

/**
 * @typedef {Object} ReportConfig
 * @property {Array<Object.<string, any>>} [Dataset]
 * @property {Object.<string, ModelProperty>} [ModelObject]
 * @property {HTMLElement} [Header]
 * @property {HTMLStyleElement} [CustomStyle]
 * @property {String} [PageType]
 * @property {String} [title]
 * @property {Function} [exportXlsAction]
 * @property {boolean} [DocumentViewFirst]
 * @property {boolean} [exportPdf]
 * @property {boolean} [print]
 * @property {boolean} [exportPdfApi]
 * @property {boolean} [exportXls]
 * @property {Array<string>} [GroupParams] - Parámetros para agrupar los datos.
 * @property {Array<string>} [EvalParams] - Parámetros para evaluar (suma, conteo, avg) en cada 
 */class WReportComponent extends HTMLElement {
	/**
	 * @param {ReportConfig} Config 
	 */
	constructor(Config) {
		super();
		this.Config = Config;
		this.OptionContainer = WRender.Create({ className: "OptionContainer" });
		this.MainContainer = WRender.Create({ className: "MainContainer", id: 'Container' });
		this.Manager = new ComponentsManager({ MainContainer: this.MainContainer, SPAManage: false });
		this.ReportContainer = WRender.Create({ className: "ReportContainer", id: 'Container' });
		this.appendChild(this.OptionContainer);
		this.appendChild(this.MainContainer);
		this.appendChild(this.CustomStyle);
		this.columnWidth = 100
		if (Config.CustomStyle) {
			this.appendChild(Config.CustomStyle);
		}
		this.append(StylesControlsV2.cloneNode(true));
	}

	connectedCallback() {
		this.Draw();
	}

	Draw = async () => {
		if (!this.Config.Dataset) return;
		this.OptionContainer.innerHTML = "";
		this.MainContainer.innerHTML = "";
		this.ReportContainer.innerHTML = "";
		this.Manager.DomComponents = [];
		
		const { GroupParams, EvalParams, ModelObject } = this.Config;
		const { groupedData, metricLevels } = WArrayF.GroupData(this.Config.Dataset, GroupParams, EvalParams, ModelObject, this.Config.title);
		this.MetricLevels = metricLevels; // Reiniciamos la propiedad para recalcular
		this.RenderGroups(groupedData);
		
		

		this.ReportContainer.append(WRender.Create({
			tagName: "table",
			className: "report-table summary",
			children: [this.RenderMetrics(this.MetricLevels["General Summary"], 0, "Total")]
		}));
		this.SetOptions();
		if (this.Config.Dataset.length == 0) {
			this.ReportContainer.innerHTML = "<h1 class='no-data'>No hay datos que mostrar!</h1>"
		}
		if (this.Config.DocumentViewFirst == true) {
			this.GoToDocumentView();
		} else {
			this.Manager.NavigateFunction("report", this.ReportContainer);
		}

	}

	SetOptions() {
		this.OptionContainer.appendChild(html`<button class="Btn-Mini" onclick="${() => {
			this.Manager.NavigateFunction("report", this.ReportContainer);
		}}">${this.Config.title ? this.Config.title : "Reporte"}</button>`);

		this.OptionContainer.appendChild(html`<button class="Btn-Mini" onclick="${() => {
			this.GoToDocumentView();
		}}">Vista de documento</button>`);
	}

	GoToDocumentView() {
		const documentViewer = this.ViewDocument();
		this.Manager.Remove("documentViewer")
		this.Manager.NavigateFunction("documentViewer", documentViewer);
	}

	ViewDocument() {
		return new WDocumentViewer({
			Header: this.Config.Header,
			PageType: this.Config.PageType,
			exportPdf: this.Config.exportPdf,
			exportPdfApi: this.Config.exportPdfApi,
			exportXls: this.Config.exportXls,
			print: this.Config.print,
			exportXlsAction: this.Config.exportXlsAction,
			CustomStyle: this.CustomStyle.cloneNode(true),
			// @ts-ignore
			Dataset: this.ReportContainer.cloneNode(true).childNodes
		});
	}

	

	RenderGroups(groupedData, level = 0, path = []) {
		Object.keys(groupedData).forEach(key => {
			const currentPath = [...path, key]; // Construimos el identificador del grupo
			const groupKey = currentPath.join(" > "); // Formato de clave para recuperar métricas
			// Obtener resumen del grupo actual
			// @ts-ignore
			const summary = this.MetricLevels[groupKey] || {};
			// Crear un contenedor para el grupo
			const container = WRender.Create({
				className: `group-level-${level} group-level`,
				children: [
					WRender.Create({
						className: "group-title" + ` group-${level}`,
						children: [WOrtograficValidation.es(key)]
					})
				]
			});
			// Agregar al contenedor principal del reporte
			this.ReportContainer.appendChild(container);
			if (Array.isArray(groupedData[key])) {
				// Si es una lista de datos, renderizar la tabla
				this.CreateTable(groupedData[key], this.ReportContainer, summary, level + 1);
			} else {
				// Si es un subgrupo, renderizarlo recursivamente
				this.RenderGroups(groupedData[key], level + 1, currentPath);
				//this.ReportContainer.appendChild(this.RenderMetrics(summary, level + 1));
				this.ReportContainer.append(WRender.Create({
					tagName: "table",
					className: "report-table group-summary",
					children: [this.RenderMetrics(summary, level + 1, key)]
				}));
			}

		});
	}

	// Método auxiliar para renderizar métricas
	RenderMetrics(summary, level, summaryName) {
		if (Object.keys(summary ?? {}).length === 0) {
			return html`<span></span>`;
		}
		const metricRow = WRender.Create({
			tagName: "tr",
			className: "metrics-container summary level" + level,
			children: this.allProps?.map(prop => WRender.Create({
				tagName: "td",
				style: { width: `${this.columnWidth}%` },
				className: prop + " metric"
				//colSpan: (this.allProps?.length ?? 1) - (this.Config.EvalParams?.length ?? 0),
				//children: [summaryName]
			}))
		});
		/*WRender.Create({
				tagName: "td",
				colSpan: (this.allProps?.length ?? 1) - (this.Config.EvalParams?.length ?? 0),
				children: [summaryName]
			}),WRender.Create({
					tagName: "td",
					className: "metric",
					children: [this.RenderProcessMetricValue(metric, summary)]
				})*/
		Object.keys(summary ?? {}).forEach(metric => {
			const metricData = this.RenderProcessMetricValue(metric, summary);
			metricRow.querySelector(`.${metric}`)?.append(metricData)
		})
		return metricRow;
	}

	RenderProcessMetricValue(metric, summary) {
		const isWithModel = this.Config.ModelObject != null && this.Config.ModelObject != undefined;
		const isMoney = isWithModel && this.Config.ModelObject[metric]?.type?.toUpperCase() === "MONEY";
		const isNumber = isWithModel && this.Config.ModelObject[metric]?.type?.toUpperCase() === "NUMBER";
		let sumValue = "";
		let countValue = `${summary[metric].count}`;
		let avgValue = `${summary[metric].avg.toFixed(1)}%`;
		if (isMoney || isNumber) {
			sumValue = `${summary[metric].sum}`;
			if (isMoney) {
				sumValue = new Money(summary[metric].sum, this.Config.ModelObject[metric]?.Currency).toString();
			}
		}
		return html`<div class="metric-container">               
                ${(isMoney || isNumber) ? html`<label class="metric-label-container sum">						
						<span class="metric-name">${metric}: </span>						
                        <span class="metric-value ${metric}">${sumValue}</span>
                    </label>`
				: ""}
                <label class="metric-label-container">
					<span class="metric-name">Conteo: </span>
                    <span class="metric-value">${countValue}</span>
                </label>
                <label class="metric-label-container">
					<span class="metric-name"></span>
                    <span class="metric-value">${avgValue}</span>
                </label>
            </div>`;
	}
	GetAllPropertyNames(obj) {
		const props = new Set();
		while (obj && obj !== Object.prototype) {
			Object.getOwnPropertyNames(obj).forEach(p => props.add(p));
			obj = Object.getPrototypeOf(obj);
		}
		return [...props];
	}
	CreateTable(data, parent, summary, level) {
		const table = WRender.Create({ tagName: "table", className: "report-table" });
		data.forEach((item, index) => {

			this.TableHeader(index, item, table);
			const row = WRender.Create({
				tagName: "tr", className: "table-row"
			});

			// Usamos el método para obtener todas las propiedades incluidas getters
			this.allProps?.forEach(prop => {
				const modelProperty = this.Config.ModelObject[prop];
				if (this.IsDrawableRow(item, prop, modelProperty)) {
					let value;
					// Intentamos leer el valor de la propiedad, puede ser getter
					try {
						value = item[prop];
					} catch (e) {
						value = undefined;
						console.warn(`Error leyendo getter ${prop}`, e);
					}
					row.appendChild(this.BuildTD(prop, value, item));
				}
			});

			table.appendChild(row);
		});
		table.appendChild(this.RenderMetrics(summary, level, ""));
		parent.appendChild(table);
	}

	TableHeader(index, item, table) {
		if (index == 0) {

			const row = WRender.Create({
				tagName: "tr", className: "table-row"
			});
			this.allProps = this.GetAllPropertyNames(item).filter(prop => {
				return this.IsDrawableRow(item, prop);
			});

			this.columnWidth = 100 / this.allProps.length;

			this.allProps.forEach(prop => {
				/**@type {ModelProperty} */
				const modelProperty = this.Config.ModelObject[prop];
				row.appendChild(WRender.Create({
					tagName: "th",
					className: "table-cell",
					style: { width: `${this.columnWidth}%` },
					children: [modelProperty?.label ? modelProperty.label : WOrtograficValidation.es(prop)]
				}));
			})
			table.appendChild(row);
		}
	}

	BuildTD(prop, value, item) {
		let classType = `${prop} `;
		let processValue = value;
		if (this.Config.ModelObject && this.Config.ModelObject[prop]) {
			switch (this.Config.ModelObject[prop].type?.toUpperCase()) {
				case "DATE":
					classType += "row-date";
					processValue = new Date(value).toLocaleDateString();
					break;
				case "NUMBER":
					classType += "row-number";
					break;
				case "PHONE":
					classType += "row-number";
					break;
				case "DATETIME":
					processValue = new Date(value).toLocaleString();
					classType += "row-date";
					break;
				case "MONEY":
					classType += "row-money";
					return WRender.Create({
						tagName: "td", className: "table-cell " + classType,
						style: { width: `${this.columnWidth}%` },
						children: [
							html`<label>
								<span>${new Money(value, this.Config.ModelObject[prop].Currency).toString()}</span>
							</label>`
						]
					});
				case "OPERATION":
					processValue = this.Config.ModelObject[prop].action(item)
					break
				case "PERCENTAGE":
					processValue = `${processValue?.toFixed(2)}%`;
					classType += " row-number";
					break;
			}
		}

		return WRender.Create({
			tagName: "td", className: "table-cell " + classType,
			style: { width: `${this.columnWidth}%` },
			children: [processValue?.toString()]
		});
	}
	/**
	  * @param {{ [x: string]: any; }} element
	  * @param {string | number} prop
	  * @param {ModelProperty} [modelProperty]
	  */
	IsDrawableRow(element, prop, modelProperty) {
		const model = this.Config.ModelObject;

		// Si no hay modelo, mostrar solo propiedades primitivas
		if (!model) {
			const value = element[prop];
			return ["number", "string", "boolean", "bigint"].includes(typeof value);
		}
		if (modelProperty) {
			//return modelProperty.hidden == false;
		}

		const modelProp = model[prop];
		if (modelProp == undefined) return false;
		// Si el modelo dice que se oculta, o es tipo que no se debe mostrar
		const hidden = typeof modelProp.hidden === "function" ? modelProp.hidden(element) : modelProp.hidden;
		const type = modelProp.type?.toUpperCase();

		if (
			modelProp?.type == undefined ||
			hidden ||
			modelProp.primary ||
			modelProp.hiddenInTable ||
			type === "MASTERDETAIL" ||
			type === "MULTISELECT"
		) {
			return false;
		}

		// ⚠️ Extra: si es un getter que lanza error, lo ignoramos
		try {
			const value = element[prop];
			// Evita mostrar funciones (a menos que el modelo lo permita explícitamente)
			if (typeof value === "function") return false;

			return true;
		} catch (e) {
			console.warn(`No se pudo acceder al getter '${prop}'`, e);
			return false;
		}
	}




	CustomStyle = css`
		*{
			-webkit-print-color-adjust: exact !important;
			border-collapse: collapse;
			box-sizing: border-box;
			font-family: "Open Sans", sans-serif;		
		}
		w-report {
			display: block;
			padding: 20px;
			background-color: #ffffff;
			padding: 20px;
			margin: 0px;
			border-radius: 5px;
			border: 1px solid #eee;
		}
		.group-level {
			height: auto;
			overflow: hidden;
		}
		.MainContainer{
			overflow-y: auto;
			color: #292929;
		}

		.container {
			flex: 8;
			display: grid;
			flex-direction: column;            
			border: 1px #cdcbcb solid;    
			grid-auto-rows: min-content;
		}   
		.container label { padding: 5px; }      
		.header-container {
			display: grid;
			grid-template-columns: 100px calc(100% - 120px);
			gap: 15px 30px;
			margin-bottom: 20px;
		} 
		.header-container .logo {
			grid-row: span 3;
			width: 100%;
		}
		.header, .sub-header {
			margin: 0px;
			font-weight: bold;
			text-align: center;
		}
		.report-container {
			border-collapse: collapse;
			border: 1px solid #D2D2D2;
		}
		.child {
			border: none;
			padding: 0px;  
		}
		.child-object{
			display: flex;
			flex-direction: column;            
			gap: 10px;
			padding: 5px 10px;  
			font-size: 12px;
		}
		.report-container:first-child {
			border-left: 1px solid #D2D2D2;
		}		
		/* Grupos */
		.group-title {
			font-size: 16px;
			font-weight: bold;
			padding: 10px;
			margin: 10px 0;
			border-left: 5px solid #3498db;
		}
		.group-title {
			text-transform: capitalize;
		}

		.group-title.group-0 {
			text-transform: capitalize;
			font-size: 20px;
			border-left: unset;
			border-bottom: 5px solid #3498db;
		}
			

		/* Métricas */
		.metrics-container {
			padding: 10px;
			border: 1px solid #d0e1ff;
			align-items: center;
		}

		.metric-container {
			display: grid;
			grid-template-columns: 50% 50%;
			flex-direction: column;
			align-items: flex-end;

		}
		.sum {
			grid-column: span 2;
		}


		

		/* Tablas */
		.report-table {
			width: 100%;
			border-collapse: collapse;
			margin-top: 10px;
			background: #fff;
		}

		.table-row {
			border-bottom: 1px solid #ddd;
		}
		.table-row th { 
			text-transform: capitalize;
		}
		.ReportContainer td, .ReportContainer th {
			padding: 8px 12px;
			text-align: left;
			font-size: 12px;
			border: 1px solid #ddd;
			text-transform: capitalize;
		
		}

		.row-title, .row-footer, .row-number, .row-string {
			padding: 5px 10px;			
			border: 1px solid #dadada;
		}       
		.row-money  label{
			display: flex;
			justify-content: flex-end
			
		}
		.row-title, .row-footer {
			padding: 5px 10px;
			color: #5D6975;
			background-color: #f1f1f1;
			white-space: nowrap;
			font-weight: normal;
			text-transform: uppercase;
			font-weight: bold;
		}   
		
		.row-number {
			text-align: right;
		}

		.table-row:nth-child(even) {
			background-color: #f2f2f2;
		}

		/* Botón de exportación */
		.OptionContainer {
			display: flex;
			justify-content: flex-end;
			margin-bottom: 10px;
		}
		.level0 {
			border: solid 1px #0055a5;
			font-weight: bold;
		}
		.level1 {
			border: solid 1px #3098f8;
		}
		.level2 {	
			border: solid 1px #6b9fcf;
		}
		.level3 {	
			border: solid 1px #76a7d4;
		}
		.metric {
			font-size: 14px;
			font-weight: bold;
			min-width: 180px;
			justify-content: space-between;
			padding: 0 !important;
		}

		.report-table.group-summary .metric, .report-table.summary .metric {
			width: 300px;
		}

		.metric-label {
			font-weight: bold;
			padding: 0px 5px;
			text-transform: capitalize;
		}
		.metric-label-container {
			display: flex;
			justify-content: space-between;
			align-items: center;
		    width: 100%;
			box-sizing: border-box;
			padding: 5px;
			border: solid 1px #eee;
		}

		.metric-name {
			font-size: 14px;
		}

		.metric-value {
			font-size: 14px;
			color: #222;
		}

		.document-container .table-cell {
			padding: 5px;
			font-size: 12px;
			border: solid 1px #eee;
			text-transform: capitalize;
		}

		.no-data {
			padding: 20px;
			margin: 0px;
			border-radius: 5px;
			border: 1px solid #eee;
		}

		/* Modo impresión */
		@media print {
			.MainContainer {
				border: none;
				background: white;
				padding: 0;
				margin: 0;
				box-shadow: none;
			}		
			.group-title {
				background: none;
				border-left: none;
				font-size: 14px;
			}

			.table-cell {
				padding: 5px;
				font-size: 12px;
			}

			
		}      
	`;

	replacer(value) {
		if (value == null) return null;
		const replacerElement = {};

		for (const prop of Object.keys(value)) {
			if ([
				"ApiMethods", "FilterData", "Get", "Find", "GetByProps", "FindByProps",
				"Save", "Update", "GetData", "SaveData", "OrderData"
			].includes(prop)) continue;

			const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(value), prop);

			// Evitar funciones explícitas
			if (typeof value[prop] === "function") continue;

			// Ignora getters que devuelven funciones
			if (descriptor?.get) {
				try {
					const result = value[prop];
					if (typeof result === "function") continue;
					replacerElement[prop] = result;
				} catch (err) {
					// En caso de error en el getter
					continue;
				}
			} else {
				// Asegura que no sea un valor peligroso
				if (value[prop]?.__proto__ == Function.prototype) continue;
				replacerElement[prop] = value[prop];
			}
		}

		return replacerElement;
	}

}
customElements.define('w-report', WReportComponent);
export { WReportComponent };

const PageType = {
	A4: "A4",
	A4_HORIZONTAL: "A4-horizontal",
	CARTA: "carta",
	CARTA_HORIZONTAL: "carta-horizontal",
	OFICIO: "oficio",
	OFICIO_HORIZONTAL: "oficio-horizontal"
}
export { PageType };
