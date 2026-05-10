//@ts-check

// @ts-ignore
import { ModelProperty } from "../../../WModules/CommonModel.js";
import { DateTime } from "../../../WModules/Types/DateTime.js";


export const Examples = [
	{ id: 1, descripcion: "Option 1" },
	{ id: 2, descripcion: "Option 2" },
	{ id: 3, descripcion: "Option 3" }
];
export const Paises = [{ Id: 1, Texto: "Nicaragua" }, { Id: 2, Texto: "Salvador" }]
class Example_ModelComponent {
	/** @param {Partial<Example_ModelComponent>} [props] */
	constructor(props) {
		Object.assign(this, props);
	}
	/**@type {ModelProperty}*/ Date = { type: 'date', defaultValue: new DateTime().toISO() };
	/**@type {ModelProperty}*/ DateTime = { type: 'datetime-local', defaultValue: new DateTime().toISO() };
	/**@type {ModelProperty}*/ Number = { type: 'number', min: 1990, require: false };
	/**@type {ModelProperty}*/ Time = { type: 'time' };
	/**@type {ModelProperty}*/ TextArea = { type: 'textarea' };
	/**@type {ModelProperty}*/ CheckBox = { type: 'CHECKBOX' }

	/**@type {ModelProperty}*/ Radio = { type: 'radio', Dataset: Examples, require: false }
	/**@type {ModelProperty}*/ Password = { type: 'Password', Dataset: Examples };
	/**@type {ModelProperty}*/ Select = { type: 'select', Dataset: Examples };
	/**@type {ModelProperty}*/ Operation = { type: 'Operation', action: () => { return new DateTime().getMonthFormatEs() } };

	/**@type {ModelProperty}*/ WSelect = {
		type: 'WSelect',
		ModelObject: () => new Paises_ModelComponent(), Dataset: Paises
	};
	/**@type {ModelProperty}*/ WCHECKBOX = {
		type: 'WCHECKBOX',
		ModelObject: () => new Paises_ModelComponent(), Dataset: Paises
	};
	/**@type {ModelProperty}*/ MULTISELECT = {
		type: 'MULTISELECT',
		ModelObject: () => new Paises_ModelComponent(), Dataset: Paises
	};

	/**@type {ModelProperty}*/ Image = { type: 'img' };
	/**@type {ModelProperty}*/ Images = { type: 'images' };
	/**@type {ModelProperty}*/ RICHTEXT = { type: 'RICHTEXT' };
	/**@type {ModelProperty}*/ Draw = { type: 'Draw' };
	/**@type {ModelProperty}*/ MaterDetail = { type: 'masterdetail', ModelObject: () => new Adress_ModelComponent() };
	/**@type {ModelProperty}*/ Calendar = { type: 'Calendar' };
}
export { Example_ModelComponent }

export class Adress_ModelComponent {
	/** @type {ModelProperty}*/
	Direccion = { type: 'textarea' };
	/** @type {ModelProperty} IDA o VUELTA*/
	Trayecto = { type: 'select', Dataset: ["IDA", "VUELTA"], hidden: true };
}

class Paises_ModelComponent {
	/** @param {Partial<Paises_ModelComponent>} [props] */
	constructor(props) {
		Object.assign(this, props);
	}
	/**@type {ModelProperty}*/ Id_pais = { type: 'number', primary: true };
	/**@type {ModelProperty}*/ Idtpais = { type: 'number', primary: true };
	/**@type {ModelProperty}*/ Texto = { type: 'text' };
}
export { Paises_ModelComponent }