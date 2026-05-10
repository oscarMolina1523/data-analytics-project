//@ts-check
import { StyleScrolls, StylesControlsV2 } from "../StyleModules/WStyleComponents.js";
// @ts-ignore
import { FilterData, ModelProperty, OrderData } from "../WModules/CommonModel.js";
import { EntityClass } from "../WModules/EntityClass.js";
import { html, WRender } from "../WModules/WComponentsTools.js";
import { WOrtograficValidation } from "../WModules/WOrtograficValidation.js";
import { css } from "../WModules/WStyledRender.js";
import { MultiSelect } from "./WMultiSelect.js";
import { WArrayF } from "../WModules/WArrayF.js";
/**
 * @typedef {Object.<string, any>} FilterConfig 
 *  * @property {Array} [Dataset]  
	* @property {Function} FilterFunction
	* @property {String} [DateRange]
	* @property {String} [Direction]
	* @property {Array<OrderData>} [Sorts]
	* @property {Boolean} [Display]
	* @property {Boolean} [UseEntityMethods]
	* @property {Boolean} [AutoFilter]
	* @property {Boolean} [AutoSetDate] define un rango de fecha automatico para filtros del tipo fecha
	* @property {Boolean} [IsDataFromFilter] indica se se ha realizado un filtro y los datos son resultado de este
	* @property {Boolean} [UseManualControlForFiltering]
	* @property {Boolean} [FullDetail]
	* @property {Object.<string, any>} [ModelObject]
	* @property {Object.<string, any>} [EntityModel]	
**/

class WFilterOptions extends HTMLElement {
	/**
	 * 
	 * @param {FilterConfig} Config 
	 */
	constructor(Config) {
		super();
		this.Config = Config;
		this.Dataset = Config.Dataset ?? [];
		this.FilterFunction = Config.FilterFunction;
		this.ModelObject = Config.ModelObject;
		this.EntityModel = Config.EntityModel;
		this.Display = Config.Display;
		this.FilterContainer = WRender.Create({ className: "filter-container" });
		if (this.Config.Direction?.toLowerCase() == "row") {
			this.FilterContainer.style.flexDirection = "row";
			this.FilterContainer.style.alignItems = "flex-start";
			this.FilterContainer.style.gap = "10px";
		}
		/** @type {Array<any>} */
		this.FilterControls = [];
		this.attachShadow({ mode: "open" });
		this.shadowRoot?.append(StyleScrolls.cloneNode(true));
		this.shadowRoot?.append(StylesControlsV2.cloneNode(true));
		this.shadowRoot?.append(WRender.createElement(this.styles));
		this.shadowRoot?.append(this.FilterContainer);
		this.ModelObject.FilterData = [];
		this.ModelObject.OrderData = [];
		this.IsDataFromFilter = this.Config.IsDataFromFilter ?? false; // es podible indicarle que desde el principio que los datos han venido de un filtro	
		this.UseManualControlForFiltering = this.Config.UseManualControlForFiltering ?? false;
		this.DrawFilter();
		/**@type {Array<OrderData>} */
		this.Sorts = Config.Sorts ?? [];
	}
	connectedCallback() {
		this.shadowRoot?.addEventListener("click", (e) => this.undisplayMultiSelects(e));
		this.shadowRoot?.addEventListener("scroll", (e) => this.undisplayMultiSelects(e));//TODO VER SCROLL
	}
	undisplayMultiSelects = (/** @type {Event} */ e) => {
		// @ts-ignore
		if (!e.target.tagName.includes("W-MULTI-SELECT")) {
			this.shadowRoot?.querySelectorAll("w-multi-select").forEach(m => {
				// @ts-ignore
				if (m.tool && !m.tool.className.includes("SELECT_BOX")) {
					// @ts-ignore
					m.tool.className += " toolInactive";
				}
				//TODO HACER LO DEL SPAN
			})
		}
	}
	DrawFilter = () => {
		this.FilterContainer.innerHTML = "";
		const ControlOptions = WRender.Create({ className: "OptionContainer" });
		const FilterOptions = html`<div class="filter-options ${this.Display ? "OptionContainerActive" : ""}">
			${ControlOptions} 
			${this.UseManualControlForFiltering == true ? WRender.Create({
			tagName: "button", className: "btn-go", innerText: "Filtrar",
			onclick: async () => this.filterFunction(this.Sorts)
		}) : ""}
			</div>`
		this.FilterContainer.append(WRender.Create({
			class: "options", children: [
				this.Display != true ? {
					tagName: "button",
					className: "accordion-button" + (this.Display ? " active-btn" : ""),
					innerText: "Filtros", onclick: async (/** @type {Event} */ ev) => {
						if (!FilterOptions.className.includes("OptionContainerActive")) {
							FilterOptions.className = "filter-options OptionContainerActive";
						} else {
							FilterOptions.className = "filter-options";
						}
						// @ts-ignore
						ev.target.className = ev.target.className.includes("active-btn") ? "accordion-button" : "accordion-button active-btn";
					}
				} : ""
			]
		}));
		this.ModelObject = this.ModelObject ?? this.Dataset[0];
		for (const prop in this.ModelObject) {
			const SelectData = WArrayF.GroupBy(this.Config.Dataset ?? [], prop).map(s => s[prop]);
			if (this.isDrawable(this.ModelObject, prop)) {
				if (this.ModelObject[prop].__proto__ == Object.prototype) {
					const filterControl = this.CreateModelControl(this.ModelObject, prop, this.ModelObject[prop].Dataset ?? SelectData);
					if (filterControl != null) {
						ControlOptions.append(WRender.Create({
							className: this.ModelObject[prop].type.toUpperCase() == "DATE"
								|| this.ModelObject[prop].type.toUpperCase() == "MONEY"
								//|| this.ModelObject[prop].type.toUpperCase() == "WSELECT"
								//|| this.ModelObject[prop].type.toUpperCase() == "MULTISELECT" 
								? "multi-control-container" : "",
							children: [this.ModelObject[prop].label ? WOrtograficValidation.es(this.ModelObject[prop].label) : WOrtograficValidation.es(prop), filterControl]
						}));
						this.FilterControls.push(filterControl);
					}
				} else {
					// @ts-ignore
					const filterControl = this.CreateWSelect(SelectData, prop);
					ControlOptions.append(WRender.Create({ children: [WOrtograficValidation.es(prop), filterControl] }));
					this.FilterControls.push(filterControl);
				}
			}
		}
		if (this.Config.AutoFilter == true) {
			this.filterFunction(this.Sorts);
		}
		this.FilterContainer.append(FilterOptions);
	}
	/**
	 * 
	 * @param {Object.<string, any>} Model 
	 * @param {String} prop 
	 * @param {Array<any>} Dataset 
	 * @returns 
	 */
	CreateModelControl = (Model, prop, Dataset) => {
		const ModelProperty = Model[prop];
		switch (ModelProperty.type?.toUpperCase()) {
			case "TEXT": case "EMAIL": case "EMAIL": case "TEL": case "URL": case "TEXTAREA": case "NUMBER":
				return this.CreateTextControl(prop, ModelProperty);
			case "TITLE": case "IMG": case "IMAGE": case "IMAGES":
				break;
			case "DATE": case "FECHA": case "TIME":
				/**TODO */
				return this.CreateDateControl(prop);
			case "MONEY":
				return this.CreateNumberControl(prop);
			case "SELECT":
				return this.CreateSelectControl(prop, Dataset);
			case "WSELECT": case "MULTISELECT":
				return this.CreateWSelect(ModelProperty, prop);
			case "MASTERDETAIL": case "MODEL": case "FILE": case "DRAW": case "TEXTAREA": case "PASSWORD":
				break;
			case "RADIO": case "CHECKBOX":
				/**TODO */
				break;
			case "CALENDAR":
				/**TODO */
				break;
			default:
				//return await this.CreateSelectControl(Dataset, prop);
				break;
		}
		return null
	}
	/**
	 * @param {Object.<string, any>} Model
	 * @param {string} prop
	 */
	isDrawable(Model, prop) {
		if (Model[prop] == null || prop == "FilterData") {
			return false;
		}
		return (Model[prop].__proto__ = Object.prototype && Model[prop].type &&
			(!Model[prop].hidden && !Model[prop].hiddenFilter))
			&& Model[prop].__proto__ != Function.prototype
			&& Model[prop].__proto__.constructor.name != "AsyncFunction";
	}
	/**
	* @param {Array<OrderData>} [sorts] 
	*/
	filterFunction = async (sorts) => {
		//this.IsDataFromFilter = true;
		this.BuildFiltersAndSorts(sorts);
		const Model = this.EntityModel ?? this.ModelObject;
		if (Model.Get || this.Config.UseEntityMethods == false) {
			if (this.Config.UseEntityMethods == false
				&& this.Config.FilterFunction != undefined) {
				this.Config.FilterFunction(Model.FilterData, this.IsDataFromFilter);
				this.IsDataFromFilter = false;
				return;
			} else if (this.Config.UseEntityMethods == true) {
				const Dataset = await Model.Get();
				if (this.Config.FilterFunction != undefined) {
					this.Config.FilterFunction(Dataset, this.IsDataFromFilter);
					this.IsDataFromFilter = false;
				} else {
					console.log(Dataset);
				}
				return;
			}
		}
		// @ts-ignore
		if (this.ModelObject.FilterData.length == 0 && this.Config.Dataset.length > 0) {
			if (this.Config.FilterFunction != undefined) {
				this.Config.FilterFunction(this.Config.Dataset, this.IsDataFromFilter);
				this.IsDataFromFilter = false;
			}
			return;
		}
		if (this.Dataset.length > 0) {
			const DFilt = this.Dataset.filter((/**@type {Object.<string, any>} */ obj) => {
				let flagObj = true;
				this.FilterControls.forEach(control => {
					if (this.ModelObject[control.id]?.__proto__ == Object.prototype) {
						const ModelProperty = this.ModelObject[control.id];
						switch (ModelProperty.type?.toUpperCase()) {
							case "TEXT": case "SELECT": case "EMAIL": case "EMAIL": case "TEL": case "URL": case "NUMBER":
								if (control.value != null && control.value != undefined && control.value != "") {
									findByValue(control);
								}
								break;
							case "TITLE": case "IMG": case "IMAGE": case "IMAGES": case "TIME": case "PASSWORD":
								break;
							case "DATE": case "FECHA": case "TIME":
								/**TODO */
								const inputs = control.querySelectorAll("input");
								findElementByDate(inputs[0].value, inputs[1].value);
								break;
							case "WSELECT": case "MULTISELECT":
								if (control.selectedItems.length > 0) {
									findElement(control);
								}
								break;
							case "MASTERDETAIL": case "MODEL": case "FILE": case "DRAW": case "TEXTAREA":
								break;
							case "RADIO": case "CHECKBOX":
								/**TODO */
								break;
							case "CALENDAR":
								/**TODO */
								break;
							default:
								break;
						}
					} else {
						findElement(control);
					}
					/** @param { MultiSelect } multiSelect */
					function findElement(multiSelect) {
						if (multiSelect.selectedItems.length > 0) {
							let find;
							//@ts-ignore  
							const objectlement = obj[multiSelect.id];
							if (objectlement?.__proto__ == Object.prototype)
								find = multiSelect.selectedItems.find((/**@type {Object.<string, any>} */ x) => WArrayF.evalValue(objectlement, x) != undefined);
							else if (objectlement?.__proto__ == Array.prototype)
								find = multiSelect.selectedItems.find((/**@type {Object.<string, any>} */ x) => WArrayF.evalValue(objectlement, x) != undefined);
							else
								find = multiSelect.selectedItems.find((/**@type {Object.<string, any>} */ x) => x[multiSelect.id] == objectlement);
							if (find == undefined) {
								flagObj = false;
							}
						}
					}
					/** @param { HTMLInputElement } input */
					function findByValue(input) {
						if (!flagObj) {
							return;
						}
						if (obj[input.id] == null || obj[input.id] == undefined) {
							flagObj = false;
							return undefined;
						}
						if (obj[input.id] != null && WArrayF.evalValue(obj[input.id], input.value.toUpperCase()) == null) {
							flagObj = false;
							return undefined;
						}
						return obj[input.id]
					}

					/**
					 * @param {string} firstDate
					 * @param {string} secondDate
					 */
					function findElementByDate(firstDate, secondDate) {
						if (firstDate != "" && new Date(obj[control.id]) < new Date(firstDate + "T00:00:00")) {
							flagObj = false;
							return undefined;
						}

						if (secondDate != "" && new Date(obj[control.id]) > new Date(secondDate + "T00:00:00")) {
							flagObj = false;
							return undefined;
						}
						return obj[control.id]
					}

				});
				return flagObj;
			});

			if (this.Config.FilterFunction != undefined && DFilt.length > 0) {
				WArrayF.SortArray(sorts, DFilt);
				this.Config.FilterFunction(DFilt, this.IsDataFromFilter); this.IsDataFromFilter = false;
				return;
			} else {
				console.log(DFilt);
			}
		}



	}
	/**
	 * @param {any[] | undefined} sorts
	 */
	BuildFiltersAndSorts(sorts) {
		this.ModelObject.FilterData = [];
		this.ModelObject.OrderData = [];
		if (sorts) {
			sorts.forEach(sort => {
				this.ModelObject.OrderData.push(sort);
			});
		}
		if (this.EntityModel) {
			this.EntityModel.FilterData = [];
			this.EntityModel.OrderData = [];
			if (sorts) {
				sorts.forEach(sort => {
					this.EntityModel.OrderData.push(sort);
				});
			}
		}
		this.FilterControls.forEach(control => {
			if (this.ModelObject[control.id]) {
				let values;
				let filterType;
				let propType;
				/**
				 * @type {ModelProperty}
				 */
				const ModelProperty = this.ModelObject[control.id];
				let propiertyName = control.id;
				switch (ModelProperty.type?.toUpperCase()) {
					case "TEXT": case "SELECT": case "EMAIL": case "EMAIL": case "TEL": case "URL": case "TEXTAREA":
						if (control.value != null && control.value != undefined && control.value != "") {
							filterType = "LIKE";
							values = [control.value];
						}
						break;
					case "NUMBER":
						if (control.value != null
							&& control.value != undefined
							&& control.value != ""
							&& !isNaN(control.value)) {
							filterType = "=";
							values = [control.value];
						}
						break;
					case "TITLE": case "IMG": case "IMAGE": case "IMAGES":
						break;
					case "DATE": case "FECHA": case "TIME":
						/**TODO */
						filterType = "BETWEEN";
						propType = "Date";
						const inputs = control.querySelectorAll("input");

						if (inputs[0].value != '' || inputs[1].value != '') {
							values = [];
							if (inputs[0].value != '') {
								values.push(inputs[0].value);
							} else {
								values.push(null);
							}
							if (inputs[1].value != '') {
								values.push(inputs[1].value);
							}
						}
						break;
					case "WSELECT": case "MULTISELECT":
						if (control.selectedItems.length > 0 && ModelProperty.ModelObject != undefined) {
							if (ModelProperty.ModelObject.__proto__ == Function.prototype) {
								ModelProperty.ModelObject = ModelProperty.ModelObject();
							}
							//TODO REPARAR LO DE LAS FORANES EN MODELPROPIERTY
							let foraingKeyName = null;
							const foreynKeyExist = ModelProperty.ForeignKeyColumn != undefined;
							if (!foreynKeyExist) {
								for (const propiedad in ModelProperty.ModelObject) {
									const keyNameSames = ModelProperty.ModelObject[propiedad]?.primary
										&& ModelProperty.ModelObject?.hasOwnProperty(propiedad)
										&& this.ModelObject?.hasOwnProperty(propiedad);
									if (keyNameSames) {
										foraingKeyName = propiedad;
									}
								}
							} else {
								foraingKeyName = ModelProperty.ForeignKeyColumn;
							}
							if (foraingKeyName != null) {
								values = [];
								filterType = "IN";
								propiertyName = foraingKeyName;
								let primaryKey = null;
								for (const key in control.ModelObject) {
									if (control.ModelObject[key]?.primary) {
										primaryKey = key;
										break;
									}
								}
								control.selectedItems?.forEach((/**@type {Object.<string, any>} */ element) => {
									// @ts-ignore
									values.push(element[primaryKey]?.toString());
								});
								//console.log(foraingKeyName, primaryKey, control.selectedItems, values);                                    
							}
						}
						break;
					case "MASTERDETAIL": case "MODEL": case "FILE": case "DRAW": case "PASSWORD":
						break;
					case "RADIO": case "CHECKBOX":
						/**TODO */
						break;
					case "CALENDAR":
						/**TODO */
						break;
					default:
						break;
				}
				if (values != undefined || values != null) {
					const filterData = new FilterData( {
							PropName: propiertyName,
							FilterType: filterType,
							Values: values, 
							PropSQLType: propType
						});
					if (this.EntityModel) {
						this.EntityModel.FilterData.push(filterData);
					}
					this.ModelObject.FilterData.push(filterData);
				}

			}
		});
	}

	/** @param {String} value  */

	/**
	 * @param {String} prop 
	 * @param {Array<any>} Dataset 
	 * @returns 
	 */
	CreateSelectControl(prop, Dataset) {
		const options = Dataset?.map(option => {
			const OValue = option;
			const ODisplay = option;
			const OptionObject = WRender.Create({
				tagName: "option", value: OValue, innerText: ODisplay
			});
			return OptionObject;
		})
		options.unshift(WRender.Create({ tagName: "option", value: "", innerText: "Seleccionar" }));
		let InputControl = WRender.Create({
			tagName: "select", className: prop, onchange: () => this.OnChange(), id: prop,
			children: options
		});
		return InputControl;
	}
	/**
	 * @param {String} prop 
	  * @param {ModelProperty} modelProperty
	 * @returns 
	 */
	CreateTextControl(prop, modelProperty) {
		let InputControl = WRender.Create({
			tagName: "input",
			type: "text",
			className: prop,
			id: prop,
			placeholder: modelProperty.placeholder ?? modelProperty.label ?? WOrtograficValidation.es(prop),
			onchange: () => { this.OnChange(); }
		});
		return InputControl;
	}
	OnChange() {
		if (!this.UseManualControlForFiltering) {
			this.IsDataFromFilter = true;
			this.filterFunction(this.Sorts);
		}
	}

	/**
	 * @param {String} prop 
	 * @returns 
	 */
	CreateDateControl(prop) {
		let InputControl = WRender.Create({
			id: prop,
			class: "multi-control", children: [
				{
					tagName: "input",
					type: "date",
					className: prop + " firstDate",
					id: prop + "first",
					value: this.Config.AutoSetDate == true ?  // @ts-ignore
						(this.GetFilterDate()) : undefined,
					placeholder: prop,
					onchange: () => { this.OnChange(); }
				}, {
					tagName: "input",
					type: "date",
					className: prop + " secondDate",
					// @ts-ignore
					value: this.Config.AutoSetDate == true ? new Date().addDays(1).toISO() : undefined,
					id: prop + "second",
					placeholder: prop,
					onchange: () => { this.OnChange(); }
				}
			]
		});
		return InputControl;
	}
	GetFilterDate() {
		// @ts-ignore
		return this.Config.DateRange == FilterDateRange.YEAR ? new Date().subtractDays(865).toISO() :
			(this.Config.DateRange == FilterDateRange.MOUNT ?
				// @ts-ignore
				new Date().subtractDays(30).toISO() : new Date().subtractDays(7).toISO());
	}

	/**
	 * @param {string | undefined} prop
	 */
	CreateNumberControl(prop) {
		let InputControl = WRender.Create({
			id: prop,
			class: "multi-control", children: [
				{
					tagName: "input",
					type: "number",
					className: prop + " firstNumber",
					id: prop + "first",
					placeholder: WOrtograficValidation.es(prop),
					onchange: () => { this.OnChange(); }
				}, {
					tagName: "input",
					type: "number",
					className: prop + " secondNumber",
					id: prop + "second",
					placeholder: WOrtograficValidation.es(prop),
					onchange: () => { this.OnChange(); }
				}
			]
		});
		return InputControl;
	}
	/**
	 * @param {ModelProperty} ModelProperty
	 * @param {string} prop
	 */
	CreateWSelect(ModelProperty, prop) {
		// Envolvemos el dataset con un Proxy
		ModelProperty.Dataset = new Proxy(ModelProperty.Dataset || [], {
			set(target, property, value) {
				// Si el cambio afecta el contenido del array (y no propiedades como 'length', etc.)
				const index = Number(property);
				const isArrayChange = !isNaN(index) || property === 'length';

				const result = Reflect.set(target, property, value);

				if (isArrayChange && InputControl) {
					InputControl.Draw(); // Redibuja si se agrega/modifica/elimina
				}

				return result;
			},
			deleteProperty(target, property) {
				const result = Reflect.deleteProperty(target, property);
				if (InputControl) {
					InputControl.Draw(); // Redibuja si se elimina
				}
				return result;
			}
		});
		const InputControl = new MultiSelect({
			//MultiSelect: false,
			Dataset: ModelProperty.Dataset,
			IsFilterControl: true,
			ModelObject: ModelProperty.ModelObject.__proto__ == Function.prototype ? ModelProperty.ModelObject() : ModelProperty.ModelObject,
			id: prop,
			FullDetail: this.Config.FullDetail ?? false,
			clickAction: async () => {
				ModelProperty.ModelObject = await WArrayF.ModelFromFunction(ModelProperty.ModelObject);
				ModelProperty.EntityModel = await WArrayF.ModelFromFunction(ModelProperty.EntityModel);
				/**@type {EntityClass} */
				const entity = ModelProperty.EntityModel ?? ModelProperty.ModelObject;
				if (entity.Get) {
					const newData = await entity.Get();
					// Actualizamos el array por referencia
					// @ts-ignore
					ModelProperty.Dataset.length = 0;
					ModelProperty.Dataset?.push(...newData);
					// No necesitas llamar a Draw aquí porque el proxy lo hará automáticamente
				}
			}, action: (/** @type {any} */ element) => {
				if (ModelProperty.action) {
					ModelProperty.action(element);
				}
				this.OnChange();
			}
		});

		return InputControl;
	}

	styles = css`
		*{
			font-family: Verdana, Geneva, Tahoma, sans-serif;
		}
		.reportV {
			margin: 10px;
		}

		.filter-container {
			display: flex;
			justify-content: center;
			flex-direction: column;
			border-radius: 10px;
			gap: 10px;
		}

		.filter-options {
			display: flex;
			gap: 10px;
			align-items: center;
			max-height: 0px;
			overflow: hidden;
			width: 100%;
			border-radius: 10px;			
			box-sizing: border-box;
			padding: 0px 20px;
			& .btn-go {
				height: 40px;
			}
		}
		.OptionContainer {
			display: grid;
			width: -webkit-fill-available;
			grid-template-columns: repeat(3,32%);
			grid-gap: 10px;
			padding: 0px;		
			transition: all 0.3s;
			border-radius: 10px; 		   
			container-type: inline-size;			
		}

		.OptionContainerActive {
			max-height: inherit;
			transition: all 0.3s;
			border: 1px solid var(--fifty-color);
			overflow: unset;
			padding: 20px;
			
		}

		.OptionContainer label {
			padding-bottom: 10px;
			display: block;
			text-transform: capitalize;
			color: var(--font-primary-color);
		}
		.options {
			font-size: 12px;
			display: flex;
			align-items: center;
		}

		.BtnDinamictT {
			justify-content: center;
			align-items: center;
			display: flex;
			font-weight: bold;
			border: none;
			padding: 0px;
			margin: 5px;
			outline: none;
			text-align: center;
			font-size: 12px;
			cursor: pointer;
			background-color: #4894aa;
			color: #fff;
			border-radius: 0.2cm;
			width: 15px;
			height: 15px;
			background-color:#4894aa;
			font-family: monospace;
		}

		.OptionContainer div {
			grid-template-rows: 30px auto;
			font-size: 12px;
		}

	   
		.multi-control-container{
			grid-column: span 2;
		} .w-multi-select-container {
			grid-column: span 1;
		}
		.multi-control {
			display: flex !important;
			gap: 15px;			
		}

		.BtnSuccess {
			font-weight: bold;
			border: none;
			padding: 10px;
			text-align: center;
			display: inline-block;
			min-width: 100px;
			cursor: pointer;
			background-color: #09f;
			color: #fff;
			border-right: rgb(3, 106, 175) 5px solid;
		}

		input.firstDate,
		input.secondDate {
			padding-left: 5px;
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
		input.firstDate::before {
			content: "Desde: ";
		}
		input.secondDate::before {
			content: "Hasta: ";
		}
		.firstNumber,
		.secondNumber {
			padding-left: 10px;
		}
		.firstNumber::before {
			content: "Desde: ";
		}
		.secondNumber::before {
			content: "Hasta: ";
		}
		@container (width < 400px) { 
			.multi-control { 
				flex-direction: column;
			}
		}

		@media (max-width: 900px) {
			.OptionContainer, .OptionContainer div {
				display: flex !important;
				flex-direction: column;
			}
			.filter-container {
				flex-direction: column !important;
			}

			.OptionContainer div {
				display: grid;
				grid-template-rows: 30px 30px;
				grid-template-columns: auto;
				font-size: 12px;
			}
		}		
	`
}
customElements.define("w-filter-option", WFilterOptions);
export { WFilterOptions }
export const FilterDateRange = {
	YEAR: "YEAR", MOUNT: "MOUNT", WEEK: "WEEK"
}