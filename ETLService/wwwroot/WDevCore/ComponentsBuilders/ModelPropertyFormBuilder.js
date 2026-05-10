//@ts-check
import { WForm } from "../WComponents/WForm.js";
// @ts-ignore
import { ModelProperty } from "../WModules/CommonModel.js";
import { DateTime } from "../WModules/Types/DateTime.js";
import { WArrayF } from "../WModules/WArrayF.js";
import { WRender } from "../WModules/WComponentsTools.js";
import { WOrtograficValidation } from "../WModules/WOrtograficValidation.js";
export class ModelPropertyFormBuilder {

	/**
	 * @param {ModelProperty} ModelProperty
	 * @param {Object.<string, any>} EditingObject
	 * @param {string} prop	 * 
	 * @param {(event: Event) => void} onChangeEvent
	 * @returns {Promise<HTMLInputElement>}
	 */
	static async CreateInput(ModelProperty, EditingObject, prop, onChangeEvent) {

		const { require, disabled } = await this.DefineRequireAndDisable(ModelProperty, EditingObject);
		const placeholder = ModelProperty.placeholder ?? WArrayF.Capitalize(WOrtograficValidation.es(prop));
		const { pattern, calculatePlaceholder } = this.DefinePatternAndPlaceholder(ModelProperty);
		const { max, min, defaultValue } = this.DefineMaxAndMinDefault(ModelProperty);
		//const actionFunction = ModelProperty.action ?? null;
		ModelProperty.require = require;
		EditingObject[prop] = EditingObject[prop] ?? defaultValue ?? min ?? "";

		/**@type {HTMLInputElement} */
		// @ts-ignore
		const InputControl = WRender.Create({
			tagName: "input",
			id: "ControlValue" + prop,
			className: prop,
			value: this.PrepareVisualization(EditingObject[prop] ?? defaultValue, ModelProperty.type.toUpperCase()),
			type: ModelPropertyFormBuilder.GetInputType(ModelProperty),
			min: min,
			max: max,
			placeholder: calculatePlaceholder ?? placeholder,
			pattern: pattern,
			onchange: disabled ? undefined : onChangeEvent,
			disabled: disabled,
			require: require
		});
		return InputControl;
	}
	/**
	* @param {ModelProperty} ModelProperty 
	* @returns {String}
	*/
	static GetInputType(ModelProperty) {
		if (ModelProperty.type.toUpperCase() == "DATETIME") {
			return "datetime-local"
		}
		return ModelProperty.type.toUpperCase() == "MONEY" || ModelProperty.type.toUpperCase() == "PERCENTAGE" ? "number" : ModelProperty.type;
	}

	/**
	 * @param {string} value
	 * @param {string} type
	 */
	static PrepareVisualization(value, type) {
		if (type == "MONEY") {
			//console.log(value, parseFloat(value));
			return parseFloat(value).toFixed(3);
		}
		if (type == "PERCENTAGE") {
			return parseFloat(value).toFixed(2);
		}
		if (type == "DATE") {
			return new DateTime(value).toISO();
		}
		if (type == "DATETIME") {
			return new DateTime(value).toISODateTime();
		}
		return value;
	}

	/**
	 * @param {ModelProperty} ModelProperty
	 * @param {Object.<string, any>} EditingObject
	 * @param {String} prop
	 * @param {Function} [onChangeEvent]
	 * @returns {Promise<HTMLSelectElement>}
	*/
	static async CreateSelect(ModelProperty, EditingObject, prop, onChangeEvent) {
		const { require, disabled } = await this.DefineRequireAndDisable(ModelProperty, EditingObject);
		ModelProperty.require = require;

		const dataset = ModelProperty.Dataset?.map(option => {
			let OValue, ODisplay;
			if (option.__proto__ == Object.prototype) {
				OValue = option["id"];
				ODisplay = option["desc"] ?? option["Descripcion"] ?? option["descripcion"];
			} else {
				OValue = option;
				ODisplay = option;
			}
			const OptionObject = WRender.Create({
				tagName: "option", value: OValue, innerText: ODisplay,
				selected: (EditingObject[prop] != undefined && EditingObject[prop].toString() == OValue.toString()) ? true : false
			});
			return OptionObject;
		})
		if (!require) {
			dataset?.unshift(WRender.Create({
				tagName: "option", value: undefined, innerText: "Seleccionar",
				selected: !EditingObject[prop] ? true : false
			}))
		}
		/**
		 * @type {HTMLSelectElement}
		 */
		// @ts-ignore
		const InputControl = WRender.Create({
			tagName: "select",
			className: prop,
			id: "ControlValue" + prop,
			disabled: disabled,
			require: require,
			onchange: disabled ? undefined : onChangeEvent,
			children: dataset
		})
		if (require) {
			EditingObject[prop] = EditingObject[prop] ?? InputControl.value
		}
		return InputControl;
	}


	/**
	 * @param {ModelProperty} ModelProperty
	 * @param {Object.<string, any>} EditingObject
	 * @param {string} prop
	 * @param {Function | undefined} onChangeListener
	 */
	static async CreateTextArea(ModelProperty, EditingObject, prop, onChangeListener) {
		const { require, disabled } = await this.DefineRequireAndDisable(ModelProperty, EditingObject);
		EditingObject[prop] = EditingObject[prop] ?? ModelProperty.defaultValue ?? "";
		ModelProperty.require = require;
		return WRender.Create({
			tagName: "textarea",
			style: { height: "38px", borderRadius: "10px" },
			className: prop,
			value: EditingObject[prop],
			onchange: disabled ? undefined : onChangeListener,
			disabled: disabled
		});
	}
	/**
	 * @param {ModelProperty} ModelProperty
	 * @param {Object.<string, any>} EditingObject
	 * @param {String} prop
	 * @param {Function} [onChangeListener]
	 * @returns {Promise<HTMLElement>}
	*/
	static async CreateRadioGroups(ModelProperty, EditingObject, prop, onChangeListener) {
		const { require, disabled } = await this.DefineRequireAndDisable(ModelProperty, EditingObject);
		EditingObject[prop] = EditingObject[prop] ?? ModelProperty.defaultValue ?? "";
		ModelProperty.require = require;
		const dataset = ModelProperty.Dataset?.map((radioElement, index) => {
			let OValue, ODisplay;
			if (radioElement.__proto__ == Object.prototype) {
				OValue = radioElement["id"] ?? radioElement["Id"];
				ODisplay = radioElement["desc"] ?? radioElement["Descripcion"] ?? radioElement["descripcion"];
			} else {
				OValue = radioElement;
				ODisplay = radioElement;
			}
			if ((EditingObject[prop] == null || EditingObject[prop] == "" || EditingObject[prop] == undefined) && index == 0 && require) {
				EditingObject[prop] = OValue;
			}
			return WRender.Create({
				className: "radio-element", children: [
					{
						tagName: 'label', htmlFor: OValue + "Radio" + prop, innerText: ODisplay
					}, {
						tagName: "input",
						id: OValue + "Radio" + prop,
						className: prop,
						name: prop,
						checked: EditingObject[prop] == OValue,
						value: OValue,
						onchange: disabled ? undefined : onChangeListener,
						type: ModelProperty.type,
						disabled: disabled
					}
				]
			})
		})
		if (!require) {
			dataset?.unshift(WRender.Create({
				className: "radio-element", children: [
					{
						tagName: 'label', htmlFor: "NingunoRadio" + prop, innerText: "Ninguno"
					}, {
						tagName: "input", id: "NingunoRadio" + prop, className: prop, name: prop,
						checked: !EditingObject[prop] ? true : false,
						value: undefined,
						onchange: disabled ? undefined : onChangeListener,
						type: ModelProperty.type,
						disabled: disabled
					}
				]
			}))
		}
		const InputControl = WRender.Create({
			className: "radio-group-container",
			id: "ControlValue" + prop,
			children: dataset
		});
		return InputControl;
	}
	/**
	 * @param {ModelProperty} ModelProperty
	 * @param {Object.<string, any>} EditingObject
	 * @param {String} prop
	 * @param {Function} [onChangeListener]
	 * @param {Function} [createAlertToolTip]
	 * @returns {Promise<HTMLElement>}
	*/
	static async CreatePassword(ModelProperty, EditingObject, prop, onChangeListener, createAlertToolTip) {
		const { require, disabled } = await this.DefineRequireAndDisable(ModelProperty, EditingObject);

		ModelProperty.require = require;
		EditingObject[prop] = EditingObject[prop] ?? ModelProperty.defaultValue ?? "";
		const placeholderp = ModelProperty.placeholder ?? ModelProperty.label ?? WArrayF.Capitalize(WOrtograficValidation.es(prop));
		const pass = WRender.Create({
			tagName: "input",
			id: "ControlPass1" + prop,
			className: prop,
			value: EditingObject[prop],
			disabled: disabled,
			type: ModelProperty.type,
			autocomplete: "off"
			, placeholder: placeholderp,
			onchange: onChangeListener
		})
		const pass2 = WRender.Create({
			tagName: "input", id: "ControlPass2" + prop,
			autocomplete: "off",
			className: prop,
			value: EditingObject[prop],
			disabled: disabled,
			type: ModelProperty.type, placeholder: placeholderp, onchange: () => {
				// @ts-ignore
				if (pass.value != pass2.value && createAlertToolTip) {
					createAlertToolTip(pass2, `contraseñas no coinciden`);
				}
			}
		})
		const InputControl = WRender.Create({
			class: "password-container",
			children: [
				WRender.Create({
					class: "ModalElement", children: ["Contraseña", pass]
				}), WRender.Create({
					class: "ModalElement", children: ["Repetir contraseña", pass2]
				})
			]
		});
		return InputControl;
	}

	/**
	 * @param {ModelProperty} ModelProperty
	 * @param {Object.<string, any>} EditingObject
	 * @param {String} prop
	 * @param {Function} [onChangeListener]
	 * @returns {Promise<HTMLElement>}
	*/
	static async CreateCheckBox(ModelProperty, EditingObject, prop, onChangeListener) {
		const { require, disabled } = await this.DefineRequireAndDisable(ModelProperty, EditingObject);
		EditingObject[prop] = typeof EditingObject[prop] === "boolean" ? EditingObject[prop] : false;
		ModelProperty.require = require;
		const InputControl = WRender.Create({
			tagName: "input",
			id: "ControlValue" + prop,
			className: prop,
			value: EditingObject[prop],
			checked: typeof EditingObject[prop] === "boolean" ? EditingObject[prop] : false,
			onchange: disabled ? undefined : onChangeListener,
			type: ModelProperty.type, placeholder: WArrayF.Capitalize(WOrtograficValidation.es(prop)),
			disabled: disabled
		});
		return InputControl;
	}

	//COMPLEX COMPONENTS######################################################################################### 
	/**
	* @param {ModelProperty} ModelProperty
	* @param {Object.<string, any>} EditingObject
	* @param {String} prop
	* @param {Function} onChangeListener
	* @returns {Promise<HTMLElement>}
	*/
	static async CreateWSelect(ModelProperty, EditingObject, prop, onChangeListener) {
		//console.log(prop);		
		const { MultiSelect } = await import("../WComponents/WMultiSelect.js");
		//const { EntityClass } = await import("../WModules/EntityClass.js");
		const { require, disabled } = await this.DefineRequireAndDisable(ModelProperty, EditingObject);
		const { multiple, modType } = this.DefineMultiSelectConfig(ModelProperty);
		ModelProperty.require = require;
		//EditingObject[prop] = EditingObject[prop]?.__proto__ == Object.prototype ? EditingObject[prop] : null;		
		ModelProperty.ModelObject = WArrayF.isModelFromFunction(ModelProperty.ModelObject, EditingObject);
		ModelProperty.EntityModel = WArrayF.isModelFromFunction(ModelProperty.EntityModel, EditingObject);

		const { Dataset, selectedItems } = await ModelPropertyFormBuilder.GetDatasetsAndSelectsItems(ModelProperty, EditingObject, prop, require, multiple);

		const InputControl = new MultiSelect({
			MultiSelect: multiple,
			Mode: modType, //ModelProperty.type?.toUpperCase() == "WRADIO" ? "SELECT_BOX" : "SELECT",
			FullDetail: ModelProperty.fullDetail == false ? false : ModelProperty.type?.toUpperCase() != "WRADIO",
			Dataset: Dataset,
			selectedItems: selectedItems,
			//AddObject: ModelProperty.type?.toUpperCase() != "WRADIO" && this.Config.WSelectAddObject,
			ModelObject: ModelProperty.ModelObject,
			action: (/** @type {any[]} */ ItemSelects) => {
				if (!multiple) {
					EditingObject[prop] = ItemSelects[0].id ?? ItemSelects[0].id_ ?? ItemSelects[0];
				}
				if (onChangeListener) {
					onChangeListener()
				}
			}
		});
		if (multiple) {
			EditingObject[prop] = InputControl.selectedItems;
		}
		if (disabled) {
			InputControl.style.pointerEvents = "none";
		}
		//this.FindObjectMultiselect(val, InputControl);

		InputControl.id = "ControlValue" + prop;
		return InputControl;
	}
	/**
	 * @param {ModelProperty} ModelProperty
	 * @param {Object.<string, any>} EditingObject
	 * @param {String} prop
	 * @param {boolean} require
	 * @param {boolean} multiple
	 */
	static async GetDatasetsAndSelectsItems(ModelProperty, EditingObject, prop, require, multiple) {
		const isWTableControl = (ModelProperty.type?.toUpperCase() != "WSELECT" 
			&& ModelProperty.type?.toUpperCase() != "WRADIO"
			&& ModelProperty.type?.toUpperCase() != "MULTISELECT") || ModelProperty.IsGridDisplay == true

		const entity = ModelProperty.EntityModel ?? ModelProperty.ModelObject;
		if ((ModelProperty.Dataset == undefined || ModelProperty.Dataset.length == 0)
			&& entity?.Get
			&& !isWTableControl) {
			ModelProperty.Dataset = await entity.Get();
		}
		const selectedItems = [];
		let Dataset = []
		if (isWTableControl) {
			Dataset = EditingObject[prop];
		}

		if ((EditingObject[prop] == null || EditingObject[prop] == undefined)
			&& require != false
			&& ModelProperty.Dataset
			&& ModelProperty.Dataset?.length > 0
			&& !multiple) {
			EditingObject[prop] = ModelProperty?.Dataset[0];
			selectedItems.push(ModelProperty?.Dataset[0]);
		} else if ((EditingObject[prop] != null || EditingObject[prop] != undefined)
			&& !multiple) {
			selectedItems.push(EditingObject[prop]);
		} else if (EditingObject[prop] != null || EditingObject[prop] != undefined) {
			selectedItems.push(...EditingObject[prop]);
		}
		if (ModelProperty.type?.toUpperCase() == "WSELECT"
			|| ModelProperty.type?.toUpperCase() == "WRADIO"
			|| ModelProperty.type?.toUpperCase() == "MULTISELECT") {
			Dataset = this.CreateDatasetForMultiSelect(ModelProperty, EditingObject[prop]);
		}
		return { Dataset, selectedItems };
	}




	/**
	* @param {ModelProperty} ModelProperty
	* @param {Object.<string, any>} EditingObject
	* @param {String} prop
	* @param {WForm} fatherForm
	* @returns {Promise<WForm>}
	*/
	static async CreateModel(ModelProperty, EditingObject, prop, fatherForm) {
		const { require, disabled } = await this.DefineRequireAndDisable(ModelProperty, EditingObject);
		ModelProperty.ModelObject = WArrayF.isModelFromFunction(ModelProperty.ModelObject, EditingObject);
		ModelProperty.EntityModel = WArrayF.isModelFromFunction(ModelProperty.EntityModel, EditingObject);

		EditingObject[prop] = EditingObject[prop] ?? {};
		const form = new WForm({
			ModelObject: ModelProperty.ModelObject,
			EntityModel: ModelProperty.EntityModel,
			EditObject: EditingObject[prop],
			limit: fatherForm.limit,
			DivColumns: fatherForm.DivColumns,
			Options: false
		});
		form.style.pointerEvents = disabled ? "none" : "auto";

		return form;
	}


	/**
	 * @param {ModelProperty} ModelProperty
	 * @param {Object.<string, any>} EditingObject
	 * @param {string} prop	  
	 * @param {string} ImageUrlPath	
	 * @param {(ev: any) => Promise<void>} onChangeListener
	 * @returns {Promise<WTableComponent>}
	 */
	static async CreateTable(ModelProperty, EditingObject, prop, ImageUrlPath, onChangeListener) {
		const { require, disabled } = await this.DefineRequireAndDisable(ModelProperty, EditingObject);
		const { WTableComponent } = await import('../WComponents/WTableComponent.js');
		EditingObject[prop] = WArrayF.isArray(EditingObject[prop]) ? EditingObject[prop] : [];
		ModelProperty.require = require;
		ModelProperty.ModelObject = WArrayF.isModelFromFunction(ModelProperty.ModelObject, EditingObject);
		ModelProperty.EntityModel = WArrayF.isModelFromFunction(ModelProperty.EntityModel, EditingObject);
		const { Dataset, selectedItems } = await ModelPropertyFormBuilder.GetDatasetsAndSelectsItems(
			ModelProperty,
			EditingObject,
			prop,
			require,
			ModelProperty.type?.toUpperCase() == "MULTISELECT");
		/**
		* @param {Object.<string, any>} entity 
		* @param {import("../WComponents/WTableComponent.js").WTableComponent} tableForm 
		*/
		const tableAction = (entity, tableForm) => {
			if (ModelProperty.type?.toUpperCase() == "WSELECT") {
				EditingObject[prop] = tableForm.selectedItems[0].id ?? tableForm.selectedItems[0].id_ ?? tableForm.selectedItems[0];
			} else if (ModelProperty.type?.toUpperCase() == "MULTISELECT") {
				EditingObject[prop] = tableForm.selectedItems;
			}
			if (onChangeListener) {				
				onChangeListener(undefined)
			}
		}
		// @ts-ignore
		const options = ModelPropertyFormBuilder.BuildTableOptions(ModelProperty, tableAction);
		const InputControl = new WTableComponent({
			Dataset: Dataset,
			selectedItems: selectedItems,
			AddItemsFromApi: false,
			ModelObject: ModelProperty.ModelObject,
			EntityModel: ModelProperty.EntityModel,
			ParentEntity: EditingObject,
			ImageUrlPath: ImageUrlPath,
			maxElementByPage: 4,
			Options: options
		});
		InputControl.id = "ControlValue" + prop;
		if (disabled) {
			InputControl.style.pointerEvents = "none";
		}
		// @ts-ignore
		return InputControl;
	}

	/**
	 * @param {ModelProperty} ModelProperty
	 * @param {() => void} tableAction
	 * @returns {import("../WModules/CommonModel.js").TableOptions}
	 */
	static BuildTableOptions(ModelProperty, tableAction) {
		if (ModelProperty.type?.toUpperCase() == "WSELECT" || ModelProperty.type?.toUpperCase() == "MULTISELECT") {
			return {
				Search: true,
				Select: ModelProperty.type?.toUpperCase() == "WSELECT",
				MultiSelect: ModelProperty.type?.toUpperCase() == "MULTISELECT",
				SelectAction: tableAction
			}
		}
		/**@type {import("../WModules/CommonModel.js").TableOptions} */
		const defaultOptions = {
			Add: ModelProperty.Options?.Add ?? true,
			Edit: ModelProperty.Options?.Edit ?? true,
			Delete: ModelProperty.Options?.Delete ?? true,
			//Search: ModelProperty.Options?.Search ?? true,
			AddAction: tableAction,
			EditAction: tableAction,
			DeleteAction: tableAction,
			SelectAction: tableAction
		};
		ModelProperty.Options = ModelProperty.Options ?? defaultOptions
		//TODO REVISAR BIEN A POSTERIOR EL COMAND ORIGINAL
		ModelProperty.Options.AddAction = tableAction
		ModelProperty.Options.EditAction = tableAction
		ModelProperty.Options.DeleteAction = tableAction
		ModelProperty.Options.SelectAction = tableAction
		return ModelProperty.Options
	}

	/**
	* @param {ModelProperty} ModelProperty
	* @param {Object.<string, any>} EditingObject
	* @param {String} prop
	* @param {Function} [onChangeListener]
	* @returns {Promise<HTMLElement>}
	*/
	static async CreateFileInput(ModelProperty, EditingObject, prop, onChangeListener) {
		const { FileComponent } = await import("../WComponents/FormComponents/FileComponent.js");
		const { require, disabled } = await this.DefineRequireAndDisable(ModelProperty, EditingObject);
		const { multiple, filesType } = this.DefineFileConfig(ModelProperty);
		ModelProperty.require = require;
		let InputControl = new FileComponent({
			Multiple: multiple,
			require: require,
			disabled: disabled,
			Files: EditingObject[prop]?.__proto__ == Array.prototype ? EditingObject[prop] : (typeof EditingObject[prop] === "string" && !multiple ? [EditingObject[prop]] : []),
			Types: filesType,
			action: disabled ? undefined : async () => {
				if (["IMG", "IMAGE"].includes(ModelProperty.type?.toUpperCase())) {
					EditingObject[prop] = InputControl.GetModelValue()[0]?.Value;
				} else {
					EditingObject[prop] = InputControl.GetModelValue();
				}

				if (onChangeListener) {
					onChangeListener();
				}
			}
		});
		if (disabled) {
			InputControl.style.pointerEvents = "none";
		}
		InputControl.id = "ControlValue" + prop;
		return InputControl;
	}

	/**
	* @param {ModelProperty} ModelProperty
	* @param {Object.<string, any>} EditingObject
	* @param {String} prop
	* @param {Function} [onChangeListener]
	* @returns {Promise<HTMLElement>}
	*/
	static async CreateRichText(ModelProperty, EditingObject, prop, onChangeListener) {
		const { WRichText } = await import("../WComponents/FormComponents/WRichText.js");
		const { require, disabled } = await this.DefineRequireAndDisable(ModelProperty, EditingObject);
		ModelProperty.require = require;
		const InputControl = new WRichText({
			value: EditingObject[prop],
			activeAttached: false,
			action: (/** @type {any} */ value) => {
				EditingObject[prop] = value;
				if (onChangeListener) {
					onChangeListener()
				}
			}
		});
		if (disabled) {
			InputControl.style.pointerEvents = "none";
		}
		InputControl.id = "ControlValue" + prop;
		return InputControl;
	}



	/**
	* @param {ModelProperty} ModelProperty
	* @param {Object.<string, any>} EditingObject
	* @param {String} prop
	* @param {Function} [onChangeListener]
	* @returns {Promise<HTMLElement>}
	*/
	static async CreateDraw(ModelProperty, EditingObject, prop, onChangeListener) {
		const { DrawComponent } = await import("../WComponents/FormComponents/DrawComponent.js");
		const { require, disabled } = await this.DefineRequireAndDisable(ModelProperty, EditingObject);
		ModelProperty.require = require;
		const InputControl = new DrawComponent({
			value: typeof EditingObject[prop] === "string" ? EditingObject[prop] : "",
			action: (/** @type {any} */ value) => {
				EditingObject[prop] = value;
				if (onChangeListener) {
					onChangeListener();
				}
			}
		});
		if (disabled) {
			InputControl.style.pointerEvents = "none";
		}
		return InputControl;
	}
	/**
	* @param {ModelProperty} ModelProperty
	* @param {Object.<string, any>} EditingObject
	* @param {String} prop
	* @param {Function} [onChangeListener]
	* @returns {Promise<HTMLElement>}
	*/
	static async CreateCalendar(ModelProperty, EditingObject, prop, onChangeListener) {
		const { require, disabled } = await this.DefineRequireAndDisable(ModelProperty, EditingObject);
		ModelProperty.require = require;
		EditingObject[prop] = EditingObject[prop] ?? [];
		const { WCalendarComponent } = await import("../WComponents/FormComponents/WCalendarComponent.js");
		const InputControl = new WCalendarComponent({
			SelectedBlocks: EditingObject[prop],
			action: () => {
				if (onChangeListener) {
					onChangeListener();
				}
			},
			CalendarFunction: ModelProperty.CalendarFunction
		});
		if (disabled) {
			InputControl.style.pointerEvents = "none";
		}
		return InputControl;
	}

	//TUILIDADES
	/**
	 * @param {ModelProperty} ModelProperty
	 */
	static DefineFileConfig(ModelProperty) {
		let multiple = false;
		let filesType = ModelProperty.fileType ?? [];

		switch (ModelProperty.type?.toUpperCase()) {
			case "IMG": case "IMAGE":
				multiple = false;
				filesType = ModelProperty.fileType ?? ["image/*"];
				break;
			case "IMAGES":
				multiple = true;
				filesType = ModelProperty.fileType ?? ["image/*"];
				break;
			case "FILE":
				multiple = false;
				filesType = ModelProperty.fileType ?? [];
				break;
			case "FILES":
				multiple = true;
				filesType = ModelProperty.fileType ?? [];
				break;
		}
		return { multiple, filesType }
	}
	/**
	 * @param {ModelProperty} ModelProperty
	 */
	static DefineMaxAndMinDefault(ModelProperty) {
		let max = ModelProperty.max;
		let min = ModelProperty.min;
		let defaultValue = ModelProperty.defaultValue;
		switch (ModelProperty.type?.toUpperCase()) {
			case "TIME":
				min = min ?? "06:00";
				max = min ?? "20:00";
				defaultValue = defaultValue ?? "06:00"
				break;
			case "DATE": case "FECHA":
				max = max ?? '3000-01-01';
				min = min ?? '0001-01-01';
				defaultValue = defaultValue ?? new DateTime().toISO();
				break;
			case "DATETIME":
				max = max ?? '3000-01-01T23:59';
				min = min ?? '0001-01-01T00:00';
				defaultValue = defaultValue ?? new DateTime().formatDateTimeToYYYYMMDDHHMM();
				break;
		}
		return { max, min, defaultValue }
	}
	/**
	 * @param {ModelProperty} ModelProperty
	 */
	static DefinePatternAndPlaceholder(ModelProperty) {
		let pattern;
		let calculatePlaceholder;
		if (ModelProperty.pattern) {
			pattern = ModelProperty.pattern;
		}
		switch (ModelProperty.type?.toUpperCase()) {
			case "EMAIL":
				pattern = pattern ?? "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}";
				calculatePlaceholder = "Ejem.: user@example.com";
				break;
			case "TEL":
				pattern = pattern ?? "^(\\+\\d{1,4})?\\d{7,8}$"
				calculatePlaceholder = "Ejem.: +1234567890";
				break;
			case "URL":
				pattern = pattern ?? "https?://.+";
				calculatePlaceholder = "Ejem.: https://site.com";
				break;
			default:
				pattern = "";
				break;
		}
		return { pattern, calculatePlaceholder }
	}

	/**
	 * @param {ModelProperty} ModelProperty
	 * @param {Object.<string, any>} EditingObject	 * 
	 */
	static async DefineRequireAndDisable(ModelProperty, EditingObject) {
		/**@type {Boolean} */
		let require = ModelProperty.require != undefined
			&& ModelProperty.require != null
			&& typeof ModelProperty.require !== "boolean"
			&& (Object.getPrototypeOf(ModelProperty.require) == Function.prototype
				|| Object.getPrototypeOf(ModelProperty.require)?.constructor.name == 'AsyncFunction')
			? await (ModelProperty.require?.(EditingObject, this) ?? true)
			: (ModelProperty.require ?? true);


		/**@type {Boolean} */
		let disabled = ModelProperty.disabled != undefined
			&& ModelProperty.disabled != null
			&& typeof ModelProperty.disabled !== "boolean"
			&& (Object.getPrototypeOf(ModelProperty.disabled) == Function.prototype
				|| Object.getPrototypeOf(ModelProperty.disabled)?.constructor.name == 'AsyncFunction')
			? await (ModelProperty.disabled?.(EditingObject, this) ?? false)
			: (ModelProperty.disabled ?? false);

		return { require, disabled };
	}
	/**
	 * @param {ModelProperty} ModelProperty 
	 */
	static DefineMultiSelectConfig(ModelProperty) {
		let multiple = ["WRADIO", "WSELECT"].includes(ModelProperty.type?.toUpperCase()) ? false : true;
		let modType = ["WRADIO", "WCHECKBOX"].includes(ModelProperty.type?.toUpperCase()) ? "SELECT_BOX" : "SELECT";
		//console.log(multiple, modType);
		return { multiple, modType }
	}
	/**
	* @param {ModelProperty} ModelProperty 
	* @param {any} val
	 */
	static CreateDatasetForMultiSelect(ModelProperty, val) {
		if (val == null || val == undefined || Object.keys(val).length == 0) {
			return ModelProperty.Dataset ?? [];
		}
		const Dataset = ModelProperty.Dataset?.map(item => {
			/**@type {Object.<string, any>} */
			const MapObject = {};
			for (const key in item) {
				const element = item[key];
				if (element != null && element != undefined) {
					MapObject[key] = element;
				}
			}
			return MapObject;
		}) ?? [];
		const findvale = Dataset.find(item => item != null && val != null && WArrayF.compareObj(item, val));
		if (!findvale) {
			if (val.__proto__ == Object.prototype) {
				Dataset.push(val);
			} else if (val.__proto__ == Object.prototype) {
				Dataset.push(...val);
			}
		}
		return Dataset;
	}

	/**
	* Busca y agrega elementos seleccionados en un control de entrada.
	* @param {Array<any>|Object|string|number} val - Valor o valores a buscar.
	* @param {Object.<string, any>} InputControl - Control de entrada con Dataset y selectedItems.
	*/
	static FindObjectMultiselect(val, InputControl) {
		if (!val || !InputControl?.Dataset) return; // Validación básica

		const addSelectedItem = (/** @type {string | number | Object} */ item) => {
			const FindItem = InputControl.Dataset.find((/** @type {Object.<string, any>} */ i) =>
				WArrayF.compareObj(i, item) || i.id === item || i.id_ === item || i[this.findKey(i)] === item);
			if (FindItem) {
				InputControl.selectedItems.push(FindItem);
			}
		};

		if (Array.isArray(val)) {
			val.forEach(addSelectedItem); // Si es un array, procesa cada elemento
		} else if (typeof val === 'object') {
			addSelectedItem(val); // Si es un objeto, lo procesa directamente
		} else {
			addSelectedItem(val); // Si es un valor primitivo (string, number), lo procesa
		}
	}

	/**
	 * Encuentra la clave que contiene "id_" en un objeto.
	 * @param {Object.<string, any>} object - Objeto en el que buscar la clave.
	 * @returns {string} - La clave encontrada o una cadena vacía si no se encuentra.
	 */
	static findKey(object) {
		if (!object || typeof object !== 'object') return ""; // Validación básica
		return Object.keys(object).find(key => (typeof object[key] === 'string' || typeof object[key] === 'number') && key.includes('id_')) || "";
	}


	//onchange event
	/**
		* 
		* @param { HTMLInputElement } targetControl 
		* @param { HTMLInputElement | HTMLSelectElement | HTMLElement } currentTarget 
		* @param { Object.<string, any> } ObjectF 
		* @param { String } prop 
		* @param { Object.<string, any> } Model 
		* @returns 
		*/
	static OnChange = async (targetControl, currentTarget, ObjectF, prop, Model) => { //evento de actualizacion del componente
		if (Model[prop].validateFunction) {
			const result = Model[prop].validateFunction(ObjectF, targetControl?.value);
			if (!result.success) {
				alert(result.message);
				return;
			}
		}
		const tool = targetControl?.parentNode?.querySelector(".ToolTip");
		if (tool) tool.remove();

		if (currentTarget?.tagName?.toUpperCase().includes("W-CALENDAR-COMPONENT")) {
			//TODO
		} else if (["IMG", "IMAGE", "IMAGES", "FILE", "FILES"].includes(Model[prop].type.toUpperCase())) {
			//TODO
		} else if (targetControl?.type == "checkbox") {
			ObjectF[prop] = targetControl?.checked;
		} else if (targetControl?.type == "radio") {
			ObjectF[prop] = targetControl?.value;
		} else {
			if (parseFloat(targetControl?.value) < parseFloat(targetControl?.min)) {
				//targetControl.value = targetControl?.min;
				this.CreateInfoToolTip(targetControl, `El valor mínimo permitido es: ${targetControl?.min}`);
			}
			if (parseFloat(targetControl?.value) > parseFloat(targetControl?.max)) {
				//targetControl.value = targetControl?.max;
				this.CreateInfoToolTip(targetControl, `El valor máximo permitido es: ${targetControl?.max}`);
			}
			ObjectF[prop] = targetControl?.value;
			if (targetControl?.pattern) {
				let regex = new RegExp(targetControl?.pattern);
				if (regex.test(ObjectF[prop])) {
					WRender.SetStyle(targetControl, {
						boxShadow: "none"
					});
				} else {
					let regex = new RegExp(targetControl.pattern);
					if (!regex.test(ObjectF[prop])) {
						if (!targetControl.parentNode?.querySelector(".ToolTip")) {
							targetControl.parentNode?.append(WRender.Create({
								tagName: "span",
								innerHTML: `Ingresar formato correcto: ${targetControl.placeholder}`,
								className: "ToolTip"
							}));
						}
						WRender.SetStyle(targetControl, {
							boxShadow: "0 0 3px #ef4d00"
						});
					}
				}
			}
		}
	}

	/**
	 * @param {HTMLElement} control
	 * @param {string} message
	 */
	static CreateInfoToolTip(control, message) {
		if (!control.parentNode?.querySelector(".ToolTip")) {
			const toolTip = WRender.Create({
				tagName: "span",
				innerHTML: message,
				className: "ToolTip ToolInfo"
			});
			control.parentNode?.append(toolTip);
		}
		WRender.SetStyle(control, {
			boxShadow: "0 0 3px #ef4d00"
		});
		control.focus();
	}

}