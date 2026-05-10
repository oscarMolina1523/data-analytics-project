//@ts-check
import { StyleScrolls } from "../StyleModules/WStyleComponents.js";
import { WRender } from "../WModules/WComponentsTools.js";
import { css, WCssClass, WStyledRender } from "../WModules/WStyledRender.js";

// @ts-ignore
import { FilterData } from "../WModules/CommonModel.js";
import { WCard } from "./WCard.js";
import { WArrayF } from "../WModules/WArrayF.js";
import { WToolTip } from "./FormComponents/WToolTip.js";

/**
 * @typedef {Object.<string, any>} ConfigMS 
 *  * @property {Array} Dataset
	* @property {Array} [selectedItems]
	* @property {Function} [action]
	* @property {Function} [ValidateFunction]
	* @property {String} [id]
	* @property {Boolean} [IsFilterControl]
	* @property {Object.<string, any>} [ModelObject]
	* @property {Object.<string, any>} [EntityModel]
	* @property {Boolean} [MultiSelect]
	* @property {Boolean} [FullDetail]
	* @property {Boolean} [AddObject]
	* @property {Boolean} [AutoSave]
	* @property {String} [AddPatern]
	* @property {Object.<string, any>} [CrudOptions]
	* @property {String} [Mode]  SELECT_BOX, SELECT ImageUrlPath
	* @property {String} [ImageUrlPath]   
	* @property {Function} [clickAction] dado que el multiselect elimina la propagacion de eventos se agrega el clickaction para poder usar un onclick
**/

class MultiSelect extends HTMLElement {
	/**
	 * @param {ConfigMS} Config 
	 * @param {HTMLElement|null} [Style] 
	 */
	constructor(Config, Style = null) {
		super();
		for (const prop in Config) {
			this[prop] = Config[prop]
		}
		this.Config = Config;
		this.Dataset = this.Config.Dataset ?? [];
		this.ModelObject = this.Config.ModelObject ?? undefined;
		this.attachShadow({ mode: 'open' });
		this.selectedItems = this.Config.selectedItems ?? [];
		this.NameSelected = "";
		this.FieldName = "";
		this.FullDetail = this.Config.FullDetail ?? true;
		this.SubOptionsFieldName = "";
		this.ControlsContainer = WRender.Create({
			className: `ControlContainer ${this.Config.MultiSelect ? "multi" : "select"}`
		});
		WRender.SetStyle(this, {
			display: this.Config.IsFilterControl == true ? "grid" : "block",
			gridTemplateColumns: "20% 80%",
			transition: 'grid-template-columns 0.3s ease',
			position: "relative",
			fontSize: "12px",
			height: "initial"
		});

		if (this.Config.Mode == "SELECT_BOX") {
			WRender.SetStyle(this, {
				display: this.Config.IsFilterControl == true ? "grid" : "block",
				gridTemplateColumns: "20% 80%",
				transition: 'grid-template-columns 0.3s ease',
				position: "relative",
				padding: "0px",
				border: "none",
				height: "initial",
				backgroundColor: "unset"
			});
		}

		this.MultiSelect = this.Config.MultiSelect ?? true;
		this.LabelMultiselect = WRender.Create({
			className: "LabelMultiselect " + (this.MultiSelect ? "multi" : "select")
				+ (this.Config.IsFilterControl == true ? " IsFilterControl" : ""), children: [
					{ className: "selecteds" },
					{ tagName: "span", className: "btnSelect" }
				]
		});
		this.OptionsContainer = WRender.Create({ className: "OptionsContainer MenuInactive" });
		this.SearchControl = WRender.Create({
			tagName: "input",
			class: "txtControl",
			placeholder: "Buscar...",
			onclick: async (ev) => {
				ev.stopPropagation();
				if (this.Config.clickAction) {
					await this.Config.clickAction(this);
				}
			},
			onkeypress: async (ev) => {
				if (this.ModelObject?.__proto__ == Function.prototype) {
					this.ModelObject = this.ModelObject();
				}

				if (this.ModelObject?.Get != undefined) {
					/**
					 * @type {Array<FilterData>}
					 */
					const filterData = []
					for (const prop in this.ModelObject) {
						if (this.ModelObject[prop]?.hiddenFilter == true) {
							continue;
						}
						if ((this.ModelObject[prop]?.type?.toUpperCase() == "TEXT")
							&& ev.target.value.replaceAll(" ", "") != "") {
							// @ts-ignore
							filterData.push({ PropName: prop, FilterType: "like", Values: [ev.target.value] })
						} else if ((this.ModelObject[prop]?.type?.toUpperCase() == "NUMBER" && !isNaN(ev.target.value))
							&& ev.target.value.replaceAll(" ", "") != "") {
							// @ts-ignore
							filterData.push({ PropName: prop, FilterType: "=", Values: [ev.target.value] })
						}
					}
					const responseDataset = await new this.ModelObject.constructor({ FilterData: [{ FilterType: "or", Filters: filterData }] }).Get();
					this.Dataset = [...this.Dataset, ...responseDataset]
					this.DrawFilterData(responseDataset, ev);
				} else {
					/*const filterDataset = this.Dataset.filter((element) => {
						for (const prop in element) {
							try {
								if (WArrayF.evalValue(element[prop], ev.target.value) != null) {
									return element;
								}
							} catch (error) {
								console.log(element);
							}
						}
					});
					this.DrawFilterData(filterDataset, ev);
					return;*/
					const Dataset = await WArrayF.FilterInArrayByValue(this.Dataset, ev.target.value);
					this.Dataset = [...this.Dataset, ...Dataset]
					this.DrawFilterData(Dataset, ev);
				}
			}
		});
		if (this.Config.IsFilterControl == true) {
			this.SearchControl.addEventListener('focus', () => {
				this.style.gridTemplateColumns = '80% 20%';
			});

			this.SearchControl.addEventListener('blur', () => {
				this.style.gridTemplateColumns = '20% 80%';
			});
		}

		this.ControlsContainer?.append(
			this.LabelMultiselect,
			StyleScrolls.cloneNode(true),
			MainMenu.cloneNode(true)
		);
		this.shadowRoot?.append(
			this.ControlsContainer
		);

		// @ts-ignore
		if (Style != null && Style.__proto__ == WStyledRender.prototype) {
			this.shadowRoot?.append(Style);
		}
		//this.shadowRoot?.append(
		this.SetOptions();
		if (Config.Mode == "SELECT_BOX") {
			// @ts-ignore
			this.tool.className += "SELECT_BOX"
			this.shadowRoot?.append(selectBoxStyle.cloneNode(true));
			this.DisplayOptions();
		}
		this.LabelMultiselect.onclick = async (e) => {
			e.stopPropagation();

			if (this.Config.clickAction) {
				await this.Config.clickAction(this);
			}
			if (!this.tool?.isConnected) {
				this.DisplayOptions();
			} else if (this.tool?.isConnected && Config.Mode != "SELECT_BOX") {
				this.tool?.remove();
			}
			setTimeout(() => {
				this.SearchControl.focus();
				this.tool?.scrollTo({
					top: 0,
					behavior: "smooth"
				});
			}, 100);

		}
	}

	DrawFilterData(Dataset, ev) {
		if (Dataset.length == 0 && this.Config.AddObject == true) {
			const targetControl = ev.target;
			const addBtn = this.addBtn(targetControl);
			this.tool?.append(addBtn);
		} else {
			this.Draw(Dataset);
		}
	}

	addBtn(targetControl) {
		const addBtn = WRender.Create({
			tagName: 'input', type: 'button', className: 'addBtn', value: 'Agregar+', onclick: async (e) => {
				e.stopPropagation();
				if (this.Config.clickAction) {
					await this.Config.clickAction(this);
				}
				if (this.ModelObject != undefined) {
					this.ModalCRUD(undefined, targetControl, addBtn);
				} else {
					let regex = this.Config?.AddPatern ? new RegExp(this.Config?.AddPatern) : undefined;
					if (this.Config?.AddPatern == undefined || regex?.test(targetControl.value)) {
						this.Dataset.push(targetControl.value);
						this.selectedItems.push(targetControl.value);
						targetControl.value = "";
						this.Draw(await WArrayF.FilterInArrayByValue(this.Dataset, targetControl.value));
						this.DrawLabel();
						addBtn.remove();
						const tool = targetControl.parentNode.querySelector(".ToolTip");
						if (tool != null && this.Config.Mode != "SELECT_BOX") {
							tool.remove();
						}
					} else {
						addBtn.remove();
						this.createAlertToolTip(targetControl, `Formato inválido`);
					}
				}
			}
		});
		return addBtn;
	}

	createAlertToolTip(control, message) {
		if (!control.parentNode.querySelector(".ToolTip")) {
			const toolTip = WRender.Create({
				tagName: "span",
				innerHTML: message,
				className: "ToolTip"
			});
			control.parentNode.append(toolTip);
		}
		WRender.SetStyle(control, {
			boxShadow: "0 0 3px #ef4d00"
		});
		control.focus();
	}

	connectedCallback() {
		this.Draw();
		document.addEventListener("click", this.handleGlobalClick);
		document.addEventListener("scroll", this.undisplayMultiSelects, true);
	}
	// Método para limpiar eventos al desconectar el componente
	disconnectedCallback() {
		document.removeEventListener("click", this.handleGlobalClick);
		document.removeEventListener("scroll", this.undisplayMultiSelects, true);
	}
	// Método para detectar clic fuera del componente
	handleGlobalClick = (e) => {
		const isClickInside = this.contains(e.target) || e.target.tagName.includes("W-MULTI-SELECT");
		if (!isClickInside) {
			setTimeout(() => {
				if (this.toolHaveRemoved != false && this.Config.Mode != "SELECT_BOX") {
					this.tool?.remove();
					this.undisplayMultiSelects(e);
				}
				this.toolHaveRemoved = true;
			}, 100)
		}
	};

	Draw = (Dataset = this.Dataset) => {
		this.OptionsContainer.innerHTML = "";
		Dataset.forEach((element, index) => {
			if (element == null) { return; }
			const OType = this.MultiSelect == true ? "checkbox" : "radio";
			const OptionLabel = WRender.Create({
				tagName: "label",
				htmlFor: "OType" + (element.id_ ?? element.id ?? "ElementIndex_" + index),
				innerText: this.DisplayText(element, index),
				className: "OptionLabel"
			});
			const Option = WRender.Create({
				tagName: "input",
				id: "OType" + (element.id_ ?? element.id ?? "ElementIndex_" + index),
				type: OType,
				//hidden: OType == "radio" && this.Config.Mode != "SELECT_BOX" ? true : true,
				name: element.name,
				checked: WArrayF.FindInArray(element, this.selectedItems),
				className: "Option", onchange: (ev) => {
					this.SelectItem(OType, ev.target, element);
				}

			});
			// @ts-ignore
			Option.addEventListener("click", (ev) => {
				this.toolHaveRemoved = !this.MultiSelect;
			})

			const SubContainer = WRender.Create({ className: "SubMenu" });
			if (element.SubOptions != undefined && element.SubOptions.__proto__ == Array.prototype) {
				element.SubMultiSelect = new MultiSelect({
					Dataset: element.SubOptions,
					action: () => {
						//pendiente
					}
				}, new WStyledRender(SubMenu));
				element.selectedItems = element.SubMultiSelect.selectedItems;
				SubContainer.append(element.SubMultiSelect);
			}


			const Options = WRender.Create({   // @ts-ignore
				className: "OContainer" + (Option.checked == true ? " OContainerActive" : ""),
				// @ts-ignore                
				children: [OptionLabel, Option, SubContainer]
			});
			this.OptionsContainer.append(Options);
			if (this.FullDetail && typeof element !== "string") {
				const detail = this.BuilDetail(element);
				detail.onclick = () => {
					// @ts-ignore
					Option.checked = !Option.checked;
					this.SelectItem(OType, Option, element);
				}
				if (detail.childNodes.length > 0) {
					Options.append(detail)
				}
			}
		});
		this.DrawLabel();
	}
	SetOptions = () => {
		if (this.Config.IsFilterControl) {
			this.shadowRoot?.insertBefore(this.SearchControl, this.shadowRoot?.firstChild);
			this.style.padding = "0px";
			this.SearchControl.onfocus = () => {
				if (this.Config.IsFilterControl) {
					this.DisplayOptions();
				}
			}
			this.tool = new WToolTip([
				this.OptionsContainer
			], false);
		} else {
			this.tool = new WToolTip([
				this.SearchControl,
				this.OptionsContainer
			], false);
		}

		return this.tool
	}
	DrawLabel = () => {
		// @ts-ignore
		this.LabelMultiselect.querySelector(".selecteds").innerHTML =
			this.selectedItems.length == 0 && this.Config.IsFilterControl != true ? "Seleccionar." : "";
		let sum = 0;
		let add = 0;
		let labelsWidth = 0;
		this.selectedItems.forEach((element, index) => {
			if (!this.MultiSelect) {
				// @ts-ignore
				this.LabelMultiselect.querySelector(".selecteds").innerHTML = "";
			}
			const LabelM = WRender.Create({
				tagName: "label",
				innerText: this.DisplayText(element, index),
			});

			if (this.MultiSelect == true) {
				LabelM.append(WRender.Create({
					tagName: "button", innerText: "x", onclick: () => {
						const index = this.selectedItems.indexOf(element);
						this.selectedItems.splice(index, 1);
						if (this.selectedItems.length == 0) {
							this.NameSelected = "";
							this.FieldName = "";
							this.SubOptionsFieldName = "";
						}
						this.DrawLabel();
						this.Draw();
						if (this.Config.action) {
							this.Config.action(this.selectedItems, this);
						}
					}
				}));
			}
			//console.log(labelsWidth);
			const selectedsContainer = this.LabelMultiselect.querySelector(".selecteds");
			if (sum == 0) {
				selectedsContainer?.append(LabelM);
				labelsWidth = labelsWidth + LabelM.offsetWidth;
				add++;
			}
			//console.log(labelsWidth + 100);
			// @ts-ignore
			if (selectedsContainer?.offsetWidth <= labelsWidth + 100) {
				sum++;
			}
			//console.log(selectedsContainer.offsetWidth, labelsWidth);

		});
		if (this.selectedItems.length - add > 0) {
			this.LabelMultiselect.querySelector(".selecteds")?.append(WRender.Create({
				tagName: "label",
				innerText: "+" + (this.selectedItems.length - add).toString()
			}))
		}
	}
	SelectItem(OType, control, element) {
		this.selectedItems = OType == "checkbox" ? this.selectedItems : [];
		const index = this.selectedItems.indexOf(element);
		if (index == -1 && control.checked == true) {
			this.NameSelected = element.name;
			this.FieldName = element.FieldName;
			this.SubOptionsFieldName = element.SubOptionsFieldName;
			if (WArrayF.FindInArray(element, this.selectedItems) == false) {
				this.selectedItems.push(element);
			} else {
				console.log("Item Existente");
			}

			this.shadowRoot?.querySelectorAll(".OContainer").forEach((nodo) => {
				nodo.classList.remove("OContainerActive");
				const nodoOption = nodo.querySelector(".Option");
				// @ts-ignore
				if (nodoOption?.checked == true) {
					nodo.classList.add("OContainerActive");
				} else {
					nodo.classList.remove("OContainerActive");
				}
			});

		} else {
			this.selectedItems.splice(index, 1);
			if (this.selectedItems.length == 0) {
				this.NameSelected = "";
				this.FieldName = "";
				this.SubOptionsFieldName = "";
			}
		}
		if (this.Config.action) {
			this.Config.action(this.selectedItems, this);
		}
		this.DrawLabel();
		if (!this.MultiSelect && this.Config.Mode != "SELECT_BOX") {
			this.tool?.remove();
		}
	}

	DisplayText(element, index) {
		if (typeof element === "string") {
			return element
		}
		this.DisplayName = undefined;
		const keys = ["tipo",
			"Title", "Titulo", "title", "titulo",
			"Descripcion",
			"descripcion",
			"desc",
			"name",
			"Name",
			"nombre",
			"Nombre",
			"Nombres",
			"text",
			"Text",
			"Texto", "texto",
			"Descripcion_Servicio"]
		for (const key in element) {
			if (keys.find(k => k == key) != null) {
				this.DisplayName = key;
				break;
			}
		}
		return element[this.DisplayName ?? ""] ?? "Element" + index;
	}
	DisplayOptions = () => {
		this.tool?.DisplayOptions(this)
		/*if (this.tool.className.includes("active")) {
			this.LabelMultiselect.querySelector("span").className = "btnSelect"
			this.tool.className = w-tooltip";
		} else {
			this.LabelMultiselect.querySelector("span").className = "btnSelect spanActive"
			this.tool.className = "active";
		}*/
	}
	BuilDetail = (element) => {
		const elementDetail = WRender.Create({ className: "ElementDetail" });
		elementDetail.append(new WCard(WArrayF.replacer(element), this.ModelObject, this.Config))
		// for (const prop in WArrayF.replacer(element)) {
		//     if (this.IsDrawableProp(element, prop)) {
		//         elementDetail.append(WRender.Create({ className: "ElementProp", innerHTML: WOrtograficValidation.es(prop) + ":" }));
		//         elementDetail.append(WRender.Create({ className: "ElementValue", innerHTML: WOrtograficValidation.es(element[prop]) }));
		//     }
		// }
		return elementDetail;
	}
	IsDrawableProp(element, prop) {
		if (this.ModelObject == undefined && (typeof element[prop] == "number" || typeof element[prop] == "string")) {
			return true;
		}
		else if (this.ModelObject == undefined
			|| (this.ModelObject[prop]?.type == undefined
				|| this.ModelObject[prop]?.type.toUpperCase() == "MASTERDETAIL"
				|| this.ModelObject[prop]?.primary == true
				|| this.ModelObject[prop]?.hidden == true
				|| this.ModelObject[prop]?.hiddenInTable == true)
			|| element[prop] == null || element[prop] == undefined
			|| element[prop]?.__proto__ == Function.prototype
			|| element[prop]?.__proto__.constructor.name == "AsyncFunction") {
			return false;
		}
		return true;
	}
	undisplayMultiSelects = (e) => {
		// @ts-ignore
		if (!e.target?.tagName?.includes("W-MULTI-SELECT")) {
			// @ts-ignore
			document.querySelectorAll("w-multi-select").forEach((/**@type {MultiSelect} */ m) => {
				if (this.Config.Mode != "SELECT_BOX") {
					m.tool?.remove();
				}
				// @ts-ignore
				m.LabelMultiselect.querySelector("span").className = "btnSelect";
			})
		}
	}
	async ModalCRUD(element, targetControl, addBtn) {
		const { WModalForm } = await import("./WModalForm.js");
		this.shadowRoot?.append(
			new WModalForm({
				ModelObject: this.ModelObject,
				EntityModel: this.Config.EntityModel,
				AutoSave: this.Config.AutoSave ?? false,
				//ParentModel: this.Config.ParentModel,
				//ParentEntity: this.Config.ParentEntity, //TODO RESVISAR LO DEL PARENT ENTITY SI AL DIA DE HOY TIENE SENTIDO
				EditObject: element,
				//icon: this.Config.icon,
				ImageUrlPath: this.Config.ImageUrlPath,
				title: element ? "Editar" : "Nuevo",
				ValidateFunction: this.Config.ValidateFunction,
				ObjectOptions: {
					Url: element ? this.Config.CrudOptions?.UrlUpdate : this.Config.CrudOptions?.UrlAdd,
					AddObject: element ? false : true,
					SaveFunction: async (NewObject) => {
						this.Dataset.push(NewObject);
						if (!this.MultiSelect) {
							this.selectedItems.shift();
						}
						this.selectedItems.push(NewObject);

						targetControl.value = "";
						this.Draw(await WArrayF.FilterInArrayByValue(this.Dataset, targetControl.value));
						this.DrawLabel();
						if (this.Config.action != undefined) {
							this.Config.action(this.selectedItems, this);
						}
						addBtn.remove();
						const tool = targetControl.parentNode.querySelector(".ToolTip");
						if (tool != null && this.Config.Mode != "SELECT_BOX") {
							tool.remove();
						}
					}
				}
			}));
	}
}
customElements.define("w-multi-select", MultiSelect);
export { MultiSelect };



const MainMenu = css`
	.LabelMultiselect {
		padding: 0px 10px;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		cursor: pointer;
		height: 100%;
	}
	.LabelMultiselect .selecteds {       
		display: flex;
		flex-wrap: nowrap;
		align-items: center;
		width: calc(100% - 30px);
		overflow-x: auto;
	}

	.select .LabelMultiselect .selecteds {    
		width: calc(100% - 0px);
	}
	.select  .LabelMultiselect .selecteds label {
		max-width: calc(100% - 25px);
	}

	.LabelMultiselect.IsFilterControl,  .LabelMultiselect.IsFilterControl .selecteds {   
		width: calc(100%);
		overflow-x: hidden;
		overflow-y: hidden;
	}  
   
	.active {       
		border: solid 1px var(--fifty-color);;
		max-height: 400px;
		min-width: 300px;
	}
	.LabelMultiselect label {
		padding: 4px 7px;
		border-radius: 0.2cm;
		background-color: #1f58c7;
		color: #fff;
		margin: 0px 3px;
		font-size: 10px;
		align-items: center;
		overflow: hidden;
		display: flex;
		line-height: 12px;
		width: fit-content;
		height: fit-content;        
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: calc(100% - 65px);
	}
	.LabelMultiselect label button {
		border: none;
		margin-left: 3px;
		cursor: pointer;
		font-weight: bold;
		border-left: solid 2px var(--secundary-color);
		background: none;
		padding: 0px 5px;
	}
	.OptionsContainer {
		overflow-y: auto; overflow-y: overlay;
		transition: all .1s;
		width: 100%;
		background: var(--secundary-color);
		position: relative;
	}
	.MenuActive {
		max-height: 500px;
	}
	.Option {
		background-color: var(--secundary-color);
	}
	.OContainer {
		transition: all 0.1s;
		cursor: pointer;
		display: grid;
		background: var(--secundary-color);
		border-bottom: solid 1px var(--fifty-color);
		grid-template-columns: calc(100% - 40px) 40px;
		grid-row: auto auto;
		align-items: center;
	}
	.OContainer:hover , .OContainerActive{
		background: var(--fifty-color);
	}
	.OptionLabel {
		width: 100%;
		cursor: pointer;
		padding: 10px 10px;
		font-size: 12px;
		text-align: justify;
		min-width: 100%;
    	box-sizing: border-box;
	}
	.SubMenu {
		max-height: 0px;
		width: 100%;
		grid-column: 1/3;
		background-color: rgb(0, 0, 0, 35%);
		transition: all 0.1s;
		overflow: hidden;
	}
	.SubMenu w-multi-select:first-child {
		margin: 10px;
	}
	.Option:checked~.SubMenu {
		max-height: 500px;
	}
	.txtControl {
		width: -webkit-fill-available;
		padding: 8px;
		border-radius: 8px;
		border: none;
		outline: none;
		background-color: var(--secundary-color);		
		color: var(--font-primary-color);
	}
	.txtControl:active,
	.txtControl:focus {
		border: none;
		outline: none;
		border-bottom: solid 1px var(--fifty-color);
		box-shadow: 0 0 5px #4894aa;
	}
	.btnSelect {
		height: 12px;
		width: 14px;
		border-radius: 50%;
		position: absolute;
		right: 0px;
		margin-right: 10px;
		background: var(--sexty-color);
		clip-path: polygon(50% 50%, 100% 0%, 100% 50%, 50% 100%, 0% 50%, 0% 0%);
		transition: all 0.1s;
		top: 50%;
		transform: translateY(-50%);
	}
	.spanActive {
		transform: rotate(-180deg) translateY(50%);
	}
	.ElementDetail {
		padding: 10px;
		background-color: var(--primary-color);
		border-radius: 8px;
		margin: 10px;
		font-size: 12px;
		grid-column: span 2;
		font-weight: 500;
	}
	.ElementDetail:hover,  .OContainer:hover > .ElementDetail {
		background-color: var(--secundary-color);
	}
	.addBtn{
		position: absolute;
		right: 10px;
		top: 5px;
		padding: 5px;
		font-size: 12px;
		color: #fff;
		border: none;
		background-color: #479207;
		cursor: pointer;
		border-radius: 5px;
		font-size: 9px;
	}
	w-tooltip {
		border-radius: 0.3cm;
		font-size: 12px;
		font-weight: 500;
		top: 32px !important;
	}
	.SELECT_BOX {
		border: none;
		z-index: unset;
		.OptionsContainer  {
			flex-direction: column;
			background-color: unset;
			.OContainer::first-letter, .OContainerActive::first-letter, .OptionLabel::first-letter {
				text-transform: capitalize;
			}
			.OContainer, .OContainer:hover, .OContainerActive, .OptionLabel {
				background-color: unset;
				font-size: 14px !important;
				display: flex;
				flex-direction: row;
				position: relative;
				padding-left: 30px;
				align-items: center;
				input[type=radio] {
					position: absolute;
					left: 0;
				}
			} 
		}
	}
	input[type=radio] {
		cursor: pointer;
		appearance: none;
		background-color: var(--secundary-color);
		border-radius: 50%;
		font: inherit;
		color: currentColor;
		width: 20px;
		padding: 10px;
		height: 20px;
		border: 0.15em solid #999;
		display: grid;
		place-content: center;
	}

	input[type=radio]::before {
		content: "";
		width: 1em;
		height: 1em;
		transform: scale(0);
		box-shadow: inset 1em 1em var(--form-control-color);
		transform-origin: bottom left;
		clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
	}
	input[type=radio]:checked::before {
		content: " ";
		background-color: cornflowerblue;
		transform: scale(1);
	}

`
const SubMenu = {
	ClassList: [
		new WCssClass(`.OptionsContainer`, {
			"max-height": 500,
			position: "relative",
			"box-shadow": "none",
		})
	]
}

const selectBoxStyle = css`
	w-tooltip {  
		position: relative !important;
		box-shadow: none !important;
		top: 0px !important
	}
	.ElementDetail {
		display: none;
	}
	.OptionsContainer {
		box-shadow: none;
	}
	.txtControl, .LabelMultiselect {
		display: none;
	}
	.OptionsContainer {
		box-shadow: none;
		display: flex;
	}
	.OContainer {
		border: none;
	}
	.OContainer:hover, .OContainerActive {
		background: var(--secundary-color);
	}
	input[type=checkbox] {
		appearance: none;
		background-color: var(--secundary-color);
		margin: 0;
		font: inherit;
		color: currentColor;
		width: 1.15em;
		height: 1.15em;
		padding: 13px;
		border: 0.15em solid #999;
		border-radius: 8px;
		display: grid;
		place-content: center;
	}
	input[type=checkbox]:checked::before {
		content: " ";
		background-color: cornflowerblue;
		transform: scale(1);
	}
	input[type=checkbox]::before {
		content: "";
		width: 1em;
		height: 1em;
		transform: scale(0);
		box-shadow: inset 1em 1em var(--form-control-color);
		transform-origin: bottom left;
		clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
	}	
`