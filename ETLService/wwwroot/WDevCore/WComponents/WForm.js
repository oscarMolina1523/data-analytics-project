//@ts-check
import { StyleScrolls, StylesControlsV2 } from "../StyleModules/WStyleComponents.js";
import { EntityClass } from '../WModules/EntityClass.js';
import { html, WRender } from '../WModules/WComponentsTools.js';
import { WOrtograficValidation } from '../WModules/WOrtograficValidation.js';
import { css } from '../WModules/WStyledRender.js';
import { ModelPropertyFormBuilder } from '../ComponentsBuilders/ModelPropertyFormBuilder.js';
// @ts-ignore
import { ModelProperty, TableConfig } from '../WModules/CommonModel.js';
import { WAjaxTools } from "../WModules/WAjaxTools.js";
import { WArrayF } from "../WModules/WArrayF.js";
import { WFormStyle } from './ComponentsStyles/WFormStyle.mjs';
import { GroupComponent } from './FormComponents/GroupComponent.js';
import { ModalMessage } from './ModalMessage.js';
import { ModalVericateAction } from './ModalVericateAction.js';
import { WAlertMessage } from "./WAlertMessage.js";

/**
 * @typedef {Object} FormConfig 
	* @property {Object.<string, any>} [EditObject] obejto que se esta editando en caso de ser null crea un objeto interno al que le agrega las propiedades
	* @property {Array<{Name:string, WithAcordeon?: Boolean, Propertys:string[]}>} [Groups] arreglo de objetos que contienen el nombre del grupo y las propiedades que contiene esto es para separar las propiedades en contenedores separados
	* @property {Object} [ParentModel] objejeto que contiene al objeto modelo del padre del que se esta editando
	* @property {Object} [ParentEntity] objeto que contiene al objeto padre del que se esta editando
	* @property {Array<{ name:string, action: (EditingObject:Object)=> {}}>} [UserActions] acciones personalizadas que se pueden agregar al formulario, estas se representan como botones adicionales
	* @property {Object} [ModelObject] objeto que contiene las propiedades del modelo que se va a editar
	* @property {EntityClass} [EntityModel] objeto que contiene el modelo de la entidad que se esta editando
	* @property {Boolean} [AutoSave] indica si el formulario se guarda automaticamente y debe hacer una peticion ajax a los metodos entity del modelo ejemplo Save o Update
	* @property {Boolean} [WSelectAddObject] indica si el formulario permitira que un control wselect podra agregar un objeto nuevo
	* @property {Boolean} [DataRequire]  indica si los datos son requeridos   
	* @property {String} [Title]  titulo del formulario
	* @property {String} [StyleForm] - columnX1 | columnX3 | columnX3   
	* @property {String} [DivColumns] - columnX1 | columnX3 | columnX3 
	* @property {Number} [limit]  limite de columnas que se mostraran en el formulario
	* @property {Boolean} [Options] indica si se muestran las opciones de guardar
	* @property {import('../WModules/CommonModel.js').ObjectOptions} [ObjectOptions]
	* @property {String} [ImageUrlPath] ruta base de las imagenes, esto en caso que las propiedades marcadas como imagenes no poseen el http o https cuando no son base64
	* @property {Function} [SaveFunction] funcion que se ejecuta al guardar el formulario, esta es independiente del autosave y se ejecuta de forma posterior recuperando el response
	* @property {Function} [ValidateFunction] funcion de validacion del formulario, esta funcion debe retornar un objeto con la propiedad validate y un mensaje de error
	* @property {Function} [ProxyAction] funcion que se ejecuta al cambiar un valor en el formulario
	* @property {HTMLStyleElement} [CustomStyle] estilo personalizado que se agregara al formulario, dado que este componente posee un shadowRoot se puede agregar estilos personalizados 
	* @property {Array<HTMLElement>} [Groups]  limite de columnas que se mostraran en el formulario
**/
class WForm extends HTMLElement {
	/**
	 * @param {FormConfig} Config 
	 */
	constructor(Config) {
		super();
		this.attachShadow({ mode: 'open' });
		WRender.SetStyle(this, {
			//height: "90%",
			display: "block"
		})
		/**@type {FormConfig} */
		this.Config = Config;
		/**@type {Object.<string,HTMLElement>} */
		this.Controls = {};

		this.DivForm = WRender.Create({ class: "ContainerFormWModal" });
		this.DivFormOptions = WRender.Create({ class: "ContainerFormWModal" });
		this.shadowRoot?.append(StyleScrolls.cloneNode(true));
		this.shadowRoot?.append(StylesControlsV2.cloneNode(true));
		/**@type {Object.<string,any>} */
		this.ModelObject = this.CreateModelProxy(Config.ModelObject);

		this.InizializeConfig(this.Config);

		this.shadowRoot?.append(WRender.createElement(this.FormStyle()));
		if (this.Config.CustomStyle) {
			this.shadowRoot?.append(this.Config.CustomStyle);
		}
		this.shadowRoot?.append(this.DivForm, this.DivFormOptions);
		this.ExistChange = false;
		this.ObjectProxy = this.ObjectProxy ?? undefined;
		this.OptionsActive = false;
		this.DrawComponent();
	}
	/**
	* @param {FormConfig} Config 
	*/
	InizializeConfig(Config) {
		if (this.IsInizialized == true) {
			return;
		}
		//TODO CREO QUE ESTO ES INNECESARIO
		for (const p in Config) {
			// @ts-ignore
			this[p] = Config[p];
		}
		/**@type {Object.<string,any>} */
		this.ModelObject = this.CreateModelProxy(Config.ModelObject);
		this.ImageUrlPath = Config.ImageUrlPath;
		this.Options = this.Options ?? true;
		this.DataRequire = this.DataRequire ?? true;
		this.StyleForm = this.Config.StyleForm;
		if (!this.limit && !this.DivColumns) {
			const props = Object.keys(this.ModelObject).filter(prop => !this.isNotDrawable(this.ModelObject, prop));
			if (props.length < 5) {
				this.limit = 1;
				this.DivColumns = "calc(100% - 20px)";
			} else {
				this.limit = this.Config.limit ?? 2;
				this.DivColumns = "calc(50% - 10px)  calc(50% - 10px)";
			}
		} else if (this.limit && !this.DivColumns) {
			this.limit = this.Config.limit ?? 2;
			this.DivColumns = `repeat(${this.limit}, 1fr)`;
		} else if (!this.limit && this.DivColumns) {
			this.limit = 2;
			this.DivColumns = this.Config.DivColumns;
		}
		this.DarkMode = this.DarkMode ?? false;
		if (this.Config.ObjectOptions == undefined) {
			this.Config.ObjectOptions = {
				AddObject: false,
				Url: undefined
			};
		}

		this.FormObject = this.FormObject ?? this.Config.EditObject ?? {};
		if (Config == undefined || Config == null || Object.keys(Config).length == 0) {
			this.IsInizialized = true;
		}
	}

	connectedCallback() {
		this.CreateOriginalObject();
		this.DivForm.addEventListener("click", (e) => this.undisplayMultiSelects(e));
		this.DivForm.addEventListener("scroll", (e) => this.undisplayMultiSelects(e));//TODO VER SCROLL
	}
	undisplayMultiSelects = (/** @type {Event} */ e) => {
		// @ts-ignore
		if (!e.target.tagName.includes("W-MULTI-SELECT")) {
			this.shadowRoot?.querySelectorAll("w-multi-select").forEach(m => {
				// @ts-ignore
				if (m.tool && !m.tool.className.includes("SELECT_BOX") && !m.tool.className.includes("toolInactive") ) {
					// @ts-ignore
					m.tool.className += " toolInactive";
				}
			})
		}
	}
	/**@type {Object.<string,any>} */
	#OriginalObject = {};
	DrawComponent = async () => {
		/**@type {Object.<string,any>} */
		const Model = this.ModelObject;
		const ObjectProxy = this.CreateProxy(Model);
		this.DivForm.innerHTML = ""; //AGREGA FORMULARIO CRUD A LA VISTA
		await this.CrudForm(ObjectProxy);
		if (this.Options == true && !this.OptionsActive) {
			this.OptionsActive = true;
			this.DivFormOptions.appendChild(await this.SaveOptions(ObjectProxy));
		}
	}
	/**
	 * @param { Object.<string, ModelProperty>} Model
	 */
	CreateProxy(Model, FormObject = this.FormObject) {
		/**@type {Object.<string,any>} */
		const ObjHandler = {
			get: (/** @type {{ [x: string]: any; }} */ target, /** @type {string | number} */ property) => {
				return target[property];
			}, set: (/** @type {{ [x: string]: any; }} */ target, /** @type {string} */ property, /** @type {any} */ value, /** @type {any} */ receiver) => {
				this.ExistChange = true;
				target[property] = value;
				if (!["IMG", "FILE", "DATE", "DATETIME"].includes(Model[property]?.type?.toUpperCase())) {
					/**@type {Object.<string, any>} */// @ts-ignore
					const control = this.shadowRoot?.querySelector("#ControlValue" + property);
					if (control) {
						// @ts-ignore
						control.value = target[property];
						/**@type {ModelProperty} */ const modelProperty = Model[property];
						if (modelProperty) {
							control.max = modelProperty.max ?? control.max;
							// @ts-ignore
							control.min = modelProperty.min ?? control.min;
						}
					}
				}
				if (this.Config.ProxyAction != undefined) {
					this.Config.ProxyAction(this)
				}
				this.SetOperationValues(Model, target)
				return true;
			}
		};
		const ObjectProxy = new Proxy(FormObject, ObjHandler);
		return ObjectProxy;
	}
	/**
	 * @param {Object.<string,any> | undefined} Model
	 * @returns {Object.<string, any>}
	 */
	CreateModelProxy(Model, FormObject = this.FormObject) {
		if (Model == undefined) {
			/**@type {Object.<string, ModelProperty>} */
			const Model = {}
			Object.keys(this.FormObject).forEach(prop => {
				/**@type {ModelProperty} */
				const modelProp = { type: this.CalculeType(this.FormObject[prop]) }
				Model[prop] = modelProp
			})
			return Model;
		}
		/**@type {Object.<string,any>} */
		const ObjHandler = {
			get: (/** @type {{ [x: string]: any; }} */ target, /** @type {string | number} */ property) => {
				return target[property];
			}, set: (/** @type {{ [x: string]: any; }} */ target, /** @type {string | number} */ property, /** @type {any} */ value) => {
				target[property] = value;
				this.SetOperationValues(Model, FormObject)
				return true;
			}
		};
		const ObjectProxy = new Proxy(Model, ObjHandler);
		return ObjectProxy;
	}
	/**
	 * @param {any} value
	 */
	CalculeType(value) {
		return typeof value;
	}
	SetOperationValues = (Model = this.ModelObject, target = this.FormObject) => {
		for (const prop in Model) {
			const modelProperty = /** @type {ModelProperty} */ (Model[prop]);
			if (Model[prop]?.__proto__ == Object.prototype) {
				if (Model[prop].type?.toUpperCase() == "OPERATION") {
					//if (Model[prop].type?.toUpperCase() == "OPERATION") {
					target[prop] = Model[prop].action(this.FormObject, this);
					const control = this.shadowRoot?.querySelector("#ControlValue" + prop);
					if (control) {
						control.innerHTML = target[prop];
					}
				}/* else if (['WSELECT', 'MASTERDETAIL', "CALENDAR", "MULTISELECT", "WCHECKBOX", "RICHTEXT", "PASSWORD"].includes(Model[prop].type?.toUpperCase())) {
					//if (Model[prop].type?.toUpperCase() == "OPERATION") 					
				}*/else {
					if (this.Controls[prop] && this.Controls[prop] != null) {
						// --- 1. Evaluar `require` (estático o dinámico)
						let { isHidden, isDisabled } = this.EvalHiddenDisabled(modelProperty, target);

						if (isHidden || modelProperty.primary == true) {
							// @ts-ignore
							this.Controls[prop].parentNode.style.display = "none";
						} else {
							// @ts-ignore
							this.Controls[prop].parentNode.style.display = "block";
						}

						if (isDisabled) {
							// @ts-ignore
							this.Controls[prop].disabled = true;
							this.Controls[prop].style.pointerEvents = "none";
						} else {
							// @ts-ignore
							this.Controls[prop].disabled = false;
							this.Controls[prop].style.pointerEvents = "all";
						}
						// @ts-ignore
						if (["NUMBER", "MONEY"].includes(modelProperty.type.toUpperCase()) && this.Controls[prop].value.trim() == "") {
							target[prop] = this.IsNumber(target[prop]) ? target[prop] : undefined;
							// @ts-ignore
							this.Controls[prop].value = this.IsNumber(target[prop]) ? parseFloat(target[prop])?.toFixed(3) : "";
						}
						if (['MODEL'].includes(Model[prop].type?.toUpperCase())) {
							// @ts-ignore
							this.Controls[prop].FormObject = target[prop] ?? {}
							// @ts-ignore
							this.Controls[prop]?.DrawComponent();
						}
					}
				}
			}
		}
	}
	CreateOriginalObject = (OriginalObject = this.#OriginalObject, FormObject = this.FormObject) => {
		for (const prop in FormObject) {
			if (FormObject[prop]?.__proto__ == Object.prototype || FormObject[prop]?.__proto__ == EntityClass.prototype) {
				OriginalObject[prop] = this.CreateOriginalObject({}, FormObject[prop])
			} else {
				OriginalObject[prop] = FormObject[prop];
			}
		}
		return OriginalObject;
	}
	/**
	 * @param {any} value
	 */
	IsNumber(value) {
		return !isNaN(value) && value !== null && value !== '' && value !== true && value !== false;
	}
	/**
	* 
	* @param {Object.<string, any>} ObjectF 
	*/
	CrudForm = async (ObjectF = {}) => {
		//GroupsForm.length = 0;
		//verifica que el modelo existe,
		//sino es asi le asigna el valor de un objeto existente
		/**@type {Object.<string,ModelProperty>} */
		const Model = this.ModelObject;
		const Form = new GroupComponent({ Name: this.Config.Title ?? undefined });
		const GroupsForm = [Form];
		this.Config.Groups?.forEach(group => {
			// Crear el contenedor principal del grupo
			const groupContainer = new GroupComponent(group);
			// Agregar el grupo al arreglo GroupsForm
			GroupsForm?.push(groupContainer);
		});
		GroupsForm.forEach(DivForm => {
			this.DivForm?.append(DivForm);
		});
		for (const prop in Model) {
			const DivForm = this.DefineContainer(prop, GroupsForm);
			try {
				//Model[prop] = Model[prop] != null ? Model[prop] : undefined;
				if (this.isNotDrawable(Model, prop)) {
					if (!this.isMethod(Model, prop)) {
						ObjectF[prop] = ObjectF[prop] ?? Model[prop]?.defaultValue ?? undefined;
					}
				} else {
					//ObjectF[prop] = val;
					const onChangeEvent = async (/** @type {{ target: HTMLInputElement; currentTarget: HTMLInputElement; }} */ ev) => {
						//console.log(ev);
						/**
						 * @type {HTMLInputElement}
						 */
						const targetControl = ev?.target
						/**
						* @type {HTMLInputElement}
						*/
						const currentTarget = ev?.currentTarget

						await this.onChange(targetControl, currentTarget, ObjectF, prop, Model);
					}
					/**
					 * @type {HTMLLabelElement}
					 */
					// @ts-ignore
					const ControlLabel = WRender.Create({
						tagName: "label", class: "inputTitle label_" + prop,
						innerText: WOrtograficValidation.es(prop)
					});
					const ControlContainer = WRender.Create({ class: "ModalElement" });
					if (Model[prop] != undefined) {
						ControlLabel.innerHTML = Model[prop].label ?? WOrtograficValidation.es(prop) + (Model[prop].require == false ? "" : "*");
						await this.CreateModelControl(Model, prop, ControlContainer, ObjectF, ControlLabel, onChangeEvent, DivForm);
						//console.trace();
						//console.log(DivForm.nodesList);
						//ControlContainer.append(InputControl);
					}

				}

			} catch (error) {
				console.log(Model);
				console.log(Model[prop]);
				console.log(prop);
				console.log(ObjectF[prop]);
				console.log(error);
				throw "Error in create CrudForm";
			}
		}
	}

	//TODO VERIFICAR POSTERIORMNENTE LA ASYNCRONIA
	/**
	 * @param {ModelProperty} modelProperty
	 * @param {any} target
	 */
	EvalHiddenDisabled(modelProperty, target) {
		let isRequired = false;
		if (typeof modelProperty.require === "function") {
			isRequired = Boolean(modelProperty.require(target, this));
		} else {
			isRequired = Boolean(modelProperty.require); // valor estático: true/false
		}
		// --- 2. Evaluar `disabled` (estático o dinámico)
		let isDisabled = false;
		if (typeof modelProperty.disabled === "function") {
			isDisabled = Boolean(modelProperty.disabled(target, this));
		} else {
			isDisabled = Boolean(modelProperty.disabled);
		}
		// --- 3. Evaluar `hidden` (estático o dinámico)
		let isHidden = false;
		if (typeof modelProperty.hidden === "function") {
			isHidden = Boolean(modelProperty.hidden(target, this));
		} else {
			isHidden = Boolean(modelProperty.hidden);
		}
		return { isHidden, isDisabled };
	}

	/**
	 * @param {string} prop
	*  @param {Array<GroupComponent>} GroupsForm
	 * @returns {GroupComponent}
	 */
	DefineContainer(prop, GroupsForm) {
		/** @type {GroupComponent} */
		let div = GroupsForm[0];
		// Buscar si la propiedad está en algún grupo
		for (const group of /** @type {Array<{Name: string, Propertys: string[]}>} */ (this.Config.Groups ?? [])) {
			if (group.Propertys.includes(prop)) {
				div = /** @type {GroupComponent} */ (GroupsForm?.find(d => d.className?.includes(group.Name?.replaceAll(" ", ""))));
				break;
			}
		}
		return div;
	}

	/**
	 * @param {Object.<string,any>} Model
	 * @param {string} prop
	 */
	isNotDrawable(Model, prop) {
		if (Model[prop] == undefined) {
			return true;
		}
		return (Model[prop]?.__proto__ == Object.prototype &&
			(//Model[prop]?.primary ||
				//|| Model[prop]?.hidden ||
				!Model[prop]?.type))
			|| Model[prop]?.__proto__ == Function.prototype
			|| Model[prop]?.__proto__.constructor.name == "AsyncFunction" || prop == "FilterData" || prop == "OrderData";
	}
	/**
	 * @param {Object.<string, any>} Model
	 * @param {string} prop
	 */
	isMethod(Model, prop) {
		return Model[prop]?.__proto__ == Function.prototype
			|| Model[prop]?.__proto__.constructor.name == "AsyncFunction" || prop == "ApiMethods" || prop == "FilterData" || prop == "OrderData";
	}
	/**
	 * @param {Object.<string,ModelProperty>} Model
	 * @param {String} prop
	 * @param {HTMLElement} ControlContainer
	 * @param {Object.<string,any>} ObjectF
	 * @param {HTMLLabelElement} ControlLabel
	 * @param {Function} onChangeEvent
	 * @param {GroupComponent} Form
	 */
	async CreateModelControl(Model, prop, ControlContainer, ObjectF, ControlLabel, onChangeEvent, Form) {
		/**
		 * @type {ModelProperty}
		 */
		const ModelProperty = Model[prop];
		const actionFunction = ModelProperty.action ?? null;
		ObjectF[prop] = ObjectF[prop];
		let addLabel = true;

		const onchangeListener = async (/** @type {any} */ ev) => {
			if (ModelProperty.disabled != true) {
				if (ev) {
					await onChangeEvent(ev)
				}
				if (actionFunction != null) {
					actionFunction(ObjectF, this, this.Controls[prop], prop)
				}
				//console.log(ObjectF);
			}
		}
		switch (ModelProperty.type?.toUpperCase()) {
			case "TITLE":
				addLabel = false;
				this.Controls[prop] = html`<h3>${ModelProperty.label ?? WOrtograficValidation.es(prop)}</h3>`;
				break;
			case "IMG": case "IMAGES": case "IMAGE": case "FILE": case "FILES":
				this.Controls[prop] = await ModelPropertyFormBuilder.CreateFileInput(ModelProperty,
					ObjectF, prop, onchangeListener);
				break;
			case "SELECT":
				this.Controls[prop] = await ModelPropertyFormBuilder.CreateSelect(ModelProperty,
					ObjectF, prop, onchangeListener);
				break;
			case "MASTERDETAIL":
				// @ts-ignore
				this.Controls[prop] = await ModelPropertyFormBuilder.CreateTable(ModelProperty,
					ObjectF, prop, this.Config?.ImageUrlPath ?? "", onchangeListener);
				break;
			case "MULTISELECT": case "WCHECKBOX": case "WSELECT": case "WRADIO":
				if (ModelProperty.IsGridDisplay) {
					// @ts-ignore
					this.Controls[prop] = await ModelPropertyFormBuilder.CreateTable(ModelProperty,
						ObjectF, prop, this.Config?.ImageUrlPath ?? "", onchangeListener);
				} else {
					this.Controls[prop] = await ModelPropertyFormBuilder.CreateWSelect(ModelProperty,
						ObjectF, prop, onchangeListener);
				}
				break;
			case "TEXTAREA":
				this.Controls[prop] = await ModelPropertyFormBuilder.CreateTextArea(
					ModelProperty, ObjectF, prop, onchangeListener)
				break;
			case "RICHTEXT":
				this.Controls[prop] = await ModelPropertyFormBuilder.CreateRichText(
					ModelProperty, ObjectF, prop, onchangeListener)
				break;
			case "CHECKBOX":
				this.Controls[prop] = await ModelPropertyFormBuilder.CreateCheckBox(
					ModelProperty, ObjectF, prop, onchangeListener)
				break;
			case "RADIO":
				this.Controls[prop] = await ModelPropertyFormBuilder.CreateRadioGroups(
					ModelProperty, ObjectF, prop, onchangeListener)
				break;
			case "DRAW":
				this.Controls[prop] = await ModelPropertyFormBuilder.CreateDraw(
					ModelProperty, ObjectF, prop, onchangeListener)
				break;
			case "PASSWORD":
				this.Controls[prop] = await ModelPropertyFormBuilder.CreatePassword(
					ModelProperty, ObjectF, prop, onchangeListener, this.createAlertToolTip)
				break;
			case "CALENDAR":
				this.Controls[prop] = await ModelPropertyFormBuilder.CreateCalendar(
					ModelProperty, ObjectF, prop, onchangeListener)
				break;
			case "OPERATION":
				ObjectF[prop] = ObjectF[prop] ?? ModelProperty.defaultValue ?? "";
				this.Controls[prop] = WRender.Create({
					tagName: "label",
					className: prop + " input",
					innerText: ObjectF[prop]
				});
				break;
			case "MODEL":
				this.Controls[prop] = await ModelPropertyFormBuilder.CreateModel(
					ModelProperty, ObjectF, prop, this)
				break;
			default:
				this.Controls[prop] = await ModelPropertyFormBuilder.CreateInput(
					ModelProperty, ObjectF, prop, onchangeListener)
				break;
		}
		ControlContainer.classList.add(ModelProperty.type?.toUpperCase())
		ControlContainer.classList.add(ModelProperty.IsGridDisplay ? "GRID_DISPLAY" : "ELEMENT_DYSPLAY")
		if (addLabel) {
			ControlContainer.append(ControlLabel);
		}
		ControlContainer.append(this.Controls[prop]);
		if (ModelProperty.hidden || ModelProperty.primary) {
			ControlContainer.style.display = "none";
		}
		Form.Add(ControlContainer);
	}

	SaveOptions(ObjectF = {}) {
		ObjectF = this.ObjectProxy ?? ObjectF;
		const DivOptions = WRender.Create({ class: "DivSaveOptions" });
		if (this.Config.ObjectOptions != undefined) {
			const InputSave = WRender.Create({
				tagName: 'button',
				class: 'Btn',
				type: "button",
				innerText: 'GUARDAR',
				onclick: async (/** @type {{ target: { enabled: boolean; }; }} */ ev) => {
					try {
						ev.target.enabled = false
						const response = await this.Save(ObjectF);

					} catch (error) {
						ev.target.enabled = true
					}
				}
			});
			DivOptions.append(InputSave);
		}

		this.Config.UserActions?.forEach((Action) => {
			DivOptions.append(WRender.Create({
				tagName: "button",
				class: "Btn",
				type: "button",
				innerText: Action.name,
				onclick: async (/** @type {Event} */ ev) => {
					if (ev.target) {
						try {
							// @ts-ignore
							ev.target.enabled = false
							Action.action(ev.target);
						} catch (error) {
							// @ts-ignore
							ev.target.enabled = true
						}
					}

				}
			}));
		});

		return DivOptions;
	}
	Save = async (ObjectF = this.FormObject) => {
		try {
			if (this.Config.ValidateFunction != undefined &&
				typeof this.Config.ValidateFunction === "function") {
				const response = this.Config.ValidateFunction(ObjectF);
				if (response.validate == false) {
					alert(response.message);
					return;
				}
			}
			if (!this.Validate(ObjectF)) {
				return;
			}
			if (this.Config.ObjectOptions?.Url != undefined || this.Config.SaveFunction == undefined) {
				const ModalCheck = await this.ModalCheck(ObjectF, this.Config.SaveFunction == undefined);
				this.shadowRoot?.append(ModalCheck)
			} else if ((this.Config?.EntityModel?.SaveWithModel != undefined || this.ModelObject?.SaveWithModel != undefined) && this.Config.AutoSave == true) {
				const ModalCheck = await this.ModalCheck(ObjectF, true);
				this.shadowRoot?.append(ModalCheck)
			} else {
				const { LoadinModal } = await import("./LoadinModal.js");
				const loadinModal = new LoadinModal();
				this.shadowRoot?.append(loadinModal);
				await this.Config.SaveFunction(ObjectF);
				loadinModal.close();
			}
		} catch (error) {
			console.log(error);

		}

	}
	Validate = (ObjectF = this.FormObject) => {
		if (this.DataRequire == true) {
			for (const prop in ObjectF) {
				if (!this.ModelObject[prop]) {
					continue;
				}
				let { isHidden, isDisabled } = this.EvalHiddenDisabled(this.ModelObject[prop], ObjectF);
				if (!prop.includes("_hidden")
					&& this.ModelObject[prop]?.require
					&& !this.ModelObject[prop]?.primary
					&& isHidden != true) {
					/**
					 * @type {?HTMLInputElement | undefined | any}
					 */
					const control = this.Controls[prop];
					//const control = this.DivForm?.querySelector("#ControlValue" + prop);
					if (this.ModelObject[prop]?.type.toUpperCase() == "MODEL") {
						if (control?.Validate != undefined && !control.Validate(control.FormObject)) {
							return false;
						}
					} else if (this.ModelObject[prop]?.type.toUpperCase() == "PASSWORD") {
						const passwords = control.querySelectorAll("input");
						if (passwords[0].value == null || passwords[0].value == "") {
							this.createAlertToolTip(passwords[0], WArrayF.Capitalize(WOrtograficValidation.es(prop)) + ` es requerido`);
							return false;
						}
						if (passwords[0].value != passwords[1].value) {
							this.createAlertToolTip(passwords[0], `Las contraseñas deben ser iguales`);
							return false;
						}

					} else if (this.ModelObject[prop]?.type.toUpperCase() == "MASTERDETAIL"
						|| this.ModelObject[prop]?.type.toUpperCase() == "CALENDAR") {
						if (this.ModelObject[prop].require == true) {
							this.ModelObject[prop].min = this.ModelObject[prop]?.min ?? 1;
						}
						if (this.ModelObject[prop]?.max
							&& ObjectF[prop].length > this.ModelObject[prop]?.max) {
							this.createAlertToolTip(control, `El máximo de registros permitidos es `
								+ this.ModelObject[prop]?.max);
							return false;
						}
						if (this.ModelObject[prop]?.min
							&& ObjectF[prop].length < this.ModelObject[prop]?.min) {
							this.createAlertToolTip(control, `El mínimo de registros permitidos es `
								+ this.ModelObject[prop]?.min);
							return false;
						}

					} else if ((ObjectF[prop] == null || ObjectF[prop] == "") && control != null) {
						this.createAlertToolTip(control, WArrayF.Capitalize(WOrtograficValidation.es(prop)) + ` es requerido`);
						return false;
					} else if (control != null && control.pattern) {
						let regex = new RegExp(control.pattern);
						if (!regex.test(ObjectF[prop])) {
							this.createAlertToolTip(control, `Ingresar formato correcto: ${control.placeholder}`);
							return false;
						}
					} else if (control != null && control.type?.toString().toUpperCase() == "NUMBER") {
						if (parseFloat(control.value) < parseFloat(control.min)) {
							this.createAlertToolTip(control, `El valor mínimo permitido es: ${control.min}`);
							return false;
						}
						if (parseFloat(control.value) > parseFloat(control.max)) {
							this.createAlertToolTip(control, `El valor máximo permitido es: ${control.max}`);
							return false;
						}
					} else if (control != null && control.type?.toString().toUpperCase() == "DATE") {
						if (new Date(control.value) < new Date(control.min)) {
							this.createAlertToolTip(control, `El valor mínimo permitido es: ${control.min}`);
							return false;
						}
						if (new Date(control.value) > new Date(control.max)) {
							this.createAlertToolTip(control, `El valor máximo permitido es: ${control.max}`);
							return false;
						}
					}
				}
			}
		}
		return true;
	}

	/**
	* 
	* @param { HTMLInputElement } targetControl 
	* @param { HTMLInputElement | HTMLSelectElement | HTMLElement } currentTarget 
	* @param { Object.<string, any> } ObjectF 
	* @param { String } prop 
	* @param { Object.<string, any> } Model 
	* @returns 
	*/
	onChange = async (targetControl, currentTarget, ObjectF, prop, Model) => { //evento de actualizacion del componente
		await ModelPropertyFormBuilder.OnChange(targetControl, currentTarget, ObjectF, prop, Model);
		if (Model[prop].fieldRequire) {
			this.shadowRoot?.querySelector(".label_" + Model[prop].fieldRequire)?.append("*")
			Model[Model[prop].fieldRequire].require = true;
		}
	}


	RollBack() {
		for (const prop in this.#OriginalObject) {
			this.FormObject[prop] = this.#OriginalObject[prop];
		}
	}
	/**
	 * @param {HTMLElement} control
	 * @param {string} message
	 */
	createAlertToolTip(control, message) {
		if (!control.parentNode?.querySelector(".ToolTip")) {
			const toolTip = WRender.Create({
				tagName: "span",
				innerHTML: message,
				className: "ToolTip"
			});
			control.parentNode?.append(toolTip);
		}
		WRender.SetStyle(control, {
			boxShadow: "0 0 3px #ef4d00"
		});
		control.focus();
	}
	/**
	 * @param {HTMLElement} control
	 * @param {string} message
	 */
	createInfoToolTip(control, message) {
		ModelPropertyFormBuilder.CreateInfoToolTip(control, message);
	}

	/**
	 * @param {Object | undefined} ObjectF
	 */
	async ModalCheck(ObjectF, withModel = false) {
		const { LoadinModal } = await import("./LoadinModal.js");
		const modalCheckFunction = async ( /** @type {import("./LoadinModal.js").LoadinModal} */ loadinModal) => {
			try {
				this.shadowRoot?.appendChild(loadinModal);
				
				if (withModel) {
					const saveF = this.Config?.EntityModel?.SaveWithModel ?? this.ModelObject?.SaveWithModel
					const response = await saveF(ObjectF, this.Config.EditObject != undefined);
					if (response.status != 200 && response.message) {
						loadinModal.close();
						ModalCheck.close();
						WAlertMessage.Danger(response.message,true)
						return;
					} if (response.status == 200 && response.message) {
						WAlertMessage.Success(response.message,true)
					}
					await this.ExecuteSaveFunction(ObjectF, response);
				} else if (this.Config.ObjectOptions?.Url != undefined) {
					const response = await WAjaxTools.PostRequest(this.Config.ObjectOptions?.Url, ObjectF);
					if (response.status != 200 && response.message) {
						loadinModal.close();
						ModalCheck.close();
						WAlertMessage.Danger(response.message)
						return;
					}
					if (response.status == 200 && response.message) {
						WAlertMessage.Success(response.message)						
					}
					await this.ExecuteSaveFunction(ObjectF, response);
				}
				loadinModal.close();
				ModalCheck.close();
			} catch (error) {
				loadinModal.close();
				ModalCheck.close();
				console.log(error);
				this.shadowRoot?.append(ModalMessage(error));
			}
		}
		const ModalCheck = ModalVericateAction(async (/** @type {{ target: { enabled: boolean; }; }} */ ev) => {
			ev.target.enabled = false;
			const loadinModal = new LoadinModal();
			ModalCheck.shadowRoot?.append(loadinModal);
			modalCheckFunction(loadinModal);
		}, "¿Esta seguro que desea guardar este registro?")

		return ModalCheck;
	}
	/**
	 * @param {any} ObjectF
	 * @param {any} response
	 */
	async ExecuteSaveFunction(ObjectF, response) {
		if (this.Config.SaveFunction != undefined) {
			await this.Config.SaveFunction(ObjectF, response, this);
		}
	}

	FormStyle = () => {
		let style = WFormStyle.cloneNode(true);

		const wstyle = css`
			.divForm, .group-container {
				grid-template-columns: ${this.DivColumns};
			}
			.IMG,
			.IMAGES,
			.IMAGE,
			.FILE,
			.FILES,
			.MASTERDETAIL,
			.GRID_DISPLAY,
			.RICHTEXT,
			.WRADIO,
			.DRAW,
			.CALENDAR {
				grid-column: span  ${this.limit};
				padding-bottom: 10px;
				@media (max-width: 600px) {
					grid-column: span 1;
				}
			}
			.TEXTAREA, .PASSWORD, .MODEL {
				grid-column: span  ${(this.limit ?? 1) > 1 ? this.limit : 1};
			}
		`;
		return WRender.Create({ style: { display: "none" }, children: [style, wstyle] });
	}
}
customElements.define('w-form', WForm);
export { WForm };