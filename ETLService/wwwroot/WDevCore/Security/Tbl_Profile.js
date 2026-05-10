//@ts-check
//import { Cat_Dependencias, Tbl_Servicios } from "../../ModelProyect/Tbl_CaseModule.js";
import { WForm } from "../WComponents/WForm.js";
//import { FilterData } from "../WModules/CommonModel.js";
import { EntityClass } from "../WModules/EntityClass.js";
//import { type } from "../WModules/WComponentsTools.js";

//@ts-check
class Tbl_Profile extends EntityClass {
    constructor(props) {
        super(props, 'Profile');
        Object.assign(this, props);
    }
    Id_Perfil = { type: 'number', primary: true };
    Nombres = { type: 'text' };
    Apellidos = { type: 'text' };
    FechaNac = { type: 'date', label: "fecha de nacimiento" };
    Sexo = { type: "Select", Dataset: ["Masculino", "Femenino"] };
    Foto = { type: 'img' };
    DNI = { type: 'text' };
    Correo_institucional = { type: 'text', label: "correo", disabled: true, hidden: true };
    Estado = { type: "Select", Dataset: ["ACTIVO", "INACTIVO"] };
    //PROPIEDADES DE HELPDESK
    // Tbl_Dependencias_Usuarios = {
    //     type: 'Multiselect', hiddenFilter: true,
    //     ModelObject: () => new Cat_Dependencias(), require: false,
    //     action: async (Profile, /** @type {WForm} */ Form) => {
    //         if (Profile.Tbl_Dependencias_Usuarios.length > 0) {
    //             const servicios = await new Tbl_Servicios({
    //                 FilterData: [{
    //                     PropName: "Id_Dependencia", FilterType: "in", Values:
    //                         Profile.Tbl_Dependencias_Usuarios.map(d => d.Id_Dependencia.toString())

    //                 }]
    //             }).Get();
    //             this.Tbl_Servicios_Profile.Dataset = servicios;
    //             this.Tbl_Servicios_Profile.disabled = false;
    //             Form.DrawComponent();
    //         } else {
    //             this.Tbl_Servicios_Profile.disabled = true;
    //             this.Tbl_Servicios_Profile.Dataset = [];
    //             Profile.Tbl_Servicios_Profile = [];
    //             Form.DrawComponent();
    //         }
    //     }
    // }
    // Tbl_Servicios_Profile = {
    //     type: 'Multiselect', hiddenFilter: true, ModelObject: () => new Tbl_Servicios(),
    //     require: false, disabled: true
    // }
    // /**
    //   * @param {Array<Tbl_Profile>} perfiles
    //   * @param {Cat_Dependencias} dependencia
    //   * @returns {Object.<string, any>}
    //   */
    // AsignarDependencias = async (perfiles, dependencia) => {
    //     return await WAjaxTools.PostRequest("/api/Proyect/AsignarDependencias", {
    //         perfiles: perfiles,
    //         dependencia: dependencia
    //     });
    // }
}
export { Tbl_Profile }