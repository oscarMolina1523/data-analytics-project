import { ModelProperty } from "../WModules/CommonModel.js";
import { EntityClass } from "../WModules/EntityClass.js";
import { Tbl_Profile } from "./Tbl_Profile.js";

//@ts-check
class Security_Roles extends EntityClass {
	constructor(props) {
		super(props, "EntitySECURITY");
		Object.assign(this, props);
	}
	Id_Role = { type: "number", primary: true };
	Descripcion = { type: "text" };
	Security_Permissions_Roles = {
		type: "MULTISELECT", ModelObject: new Security_Permissions(), Dataset: [{ Descripcion: "Permission 1" }]
	};
	Estado = { type: "Select", Dataset: ["ACTIVO", "INACTIVO"] };
}
export { Security_Roles }
class Security_Permissions {
	constructor(props) {
		Object.assign(this, props);
	}
	Id_Permission = { type: "number", primary: true };
	Descripcion = { type: "text" };
	Detalles = { type: "text" };
	Estado = { type: "Select", Dataset: ["ACTIVO", "INACTIVO"] };
}
export { Security_Permissions }

class Security_Permissions_Roles {
	constructor(props) {
		Object.assign(this, props);
	}
	Id_Role = { type: "number", primary: true };
	Id_Permission = { type: "number", primary: true };
	Estado = { type: "Select", Dataset: ["ACTIVO", "INACTIVO"] };
}
export { Security_Permissions_Roles }

class Security_Users_Roles {
	constructor(props) {
		Object.assign(this, props);
	}
	Id_Role = { type: "number", primary: true };
	Id_User = { type: "number", primary: true };
	Estado = { type: "Select", Dataset: ["ACTIVO", "INACTIVO"] };
}
export { Security_Users_Roles }


class Security_Users  extends EntityClass{
	constructor(props) {
		super(props, "EntitySECURITY");
		Object.assign(this, props);
	}
	/**@type {ModelProperty} */
	//Tbl_Profiles = { type: "masterdetail", ModelObject: new Tbl_Profile(), max: 1 };
	Id_User = { type: "number", primary: true };
	Nombres = { type: "text" };
	Descripcion = { type: "text", require: false };
	Mail = { type: "email" };
	Estado = { type: "Select", Dataset: ["ACTIVO", "INACTIVO"] };
	Password = { type: "password", hiddenInTable: true };
	Security_Users_Roles = {
		type: "MULTISELECT", ModelObject: new Security_Roles(), Dataset: [{ Descripcion: "Role 1" }]
	};
}
export { Security_Users }
class ChangePasswordModel {
	constructor(props) {
		Object.assign(this, props);
	}
	Id_User = { type: "number", primary: true };
	Password = { type: "password", hiddenInTable: true };
}
export { ChangePasswordModel }
class ChangeStateModel {
	constructor(props) {
		Object.assign(this, props);
	}
	Id_User = { type: "number", primary: true };
	Estado = { type: "radio", hiddenInTable: true, Dataset: ["ACTIVO", "INACTIVO"] };
}
export { ChangeStateModel }
class ChangeRolesModel {
	constructor(props) {
		Object.assign(this, props);
	}
	Id_User = { type: "number", primary: true };
	Security_Users_Roles = {
		type: "MULTISELECT", Dataset: [{ Descripcion: "Role 1" }]
	};
}
export { ChangeRolesModel }

