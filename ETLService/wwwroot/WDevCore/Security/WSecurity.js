import { ComponentsManager, WRender } from "../WModules/WComponentsTools.js";
import { WArrayF } from "../WModules/WArrayF.js";
import { WAjaxTools } from "../WModules/WAjaxTools.js";
import { ModalMessage } from "../WComponents/ModalMessage.js";
import { WAlertMessage } from "../WComponents/WAlertMessage.js";
//import { WModalForm } from "../WComponents/WModalForm.js";
// import "../WComponents/WLoginTemplate.js";

class WSecurity {
    constructor() {
        WSecurity.Authenticate = true;
        WAjaxTools.PostRequest(WSecurity.urlVerification).then((result) => {
            if (result == false) {
                console.log("no auth");
                WSecurity.LogOut();
            }
        })
    }
    static Path = location.origin;
    static Authenticate = false;
    //VIEWS
    static LoginInView = WSecurity.Path + "/Security/Login";
    static urlHomeView = WSecurity.Path;
    //API
    static urlVerification = WSecurity.Path + "/api/Security/Verification";
    static urlLogIn = WSecurity.Path + "/api/Security/Login";
    static urlRecovery = WSecurity.Path + "/api/Security/RecoveryPassword";
    static urlRegister = WSecurity.Path + "/api/Security/Register";
    static urlLogOut = WSecurity.Path + "/api/Security/LogOut";

    static UserData = localStorage.getItem(WSecurity.urlLogIn) != null ?
        JSON.parse(localStorage.getItem(WSecurity.urlLogIn)) : {
            success: false,
            mail: "null",
            nickname: "null",
            password: "null"
        };
    static RegisterModel = {
        nickname: "xx",
        name: "xx",
        surnames: "xx",
        birthday: "xx",
        mail: "xx",
        password: "xx",
        confirm_password: "xx",
        photo: "xx",
        //state: "xx",
    };
    static Login = async (UserData, url) => {
        const result = await WAjaxTools.PostRequest(WSecurity.urlLogIn, UserData)
        //alert(JSON.stringify(result));
        if (result == true || result.success == true) {
            //this.UserData = result;
            window.location = url ?? WSecurity.urlHomeView;
        } else if (result != false || result.success == false) {
            //alert(result?.message)
            WAlertMessage.Danger(result?.message,true)
            //document.body.append(ModalMessage(result?.message));
        } else {
            //alert("ERROR")
           WAlertMessage.Danger("ERROR")
           //document.body.append(ModalMessage("ERROR"));
        }
    }
    static RecoveryPassword = async (UserData, url) => {
        const result = await WAjaxTools.PostRequest(WSecurity.urlRecovery, UserData)
        console.log(result);
        if (result == true || result.success == true) {
            alert("Contraseña enviada.");
        } else {
            alert("ERROR")
            console.log("Fail to recover");
        }
    }
    static LogOut = async () => {
        const result = await WAjaxTools.PostRequest(WSecurity.urlLogOut);
        localStorage.clear();
        window.location = WSecurity.LoginInView;
        return result;
    }
    static HavePermission(/**@type {String} */ permission) {
        return this.UserData.permissions.includes(permission) || this.UserData.permissions.includes(Permissions.ADMIN_ACCESS)
    }
    static async ValidateResponse(ProcessRequest) {
        if (ProcessRequest.AuthVal == false) {   
            const result = await WAjaxTools.PostRequest(WSecurity.urlLogOut);
            localStorage.clear();        
            ModalMessage("No autorizado", undefined, true);
        }
    }
}
export { WSecurity }


const Permissions = {
    //generales
    ADMIN_ACCESS: "ADMIN_ACCESS", // PERMITE ACCESO TOTAL AL SISTEMA
    ADMINISTRAR_USUARIOS: "ADMINISTRAR_USUARIOS", // PERMITE ADMINISTRAR USUARIOS
    PERFIL_MANAGER: "PERFIL_MANAGER", // PERMITE ADMINISTRAR EL PERFIL DEL USUARIO
    PERFIL_ACCESS: "PERFIL_ACCESS", // PERMITE ACCESO AL PERFIL
    //otros
    GESTION_CLIENTES: "GESTION_CLIENTES", // PERMITE GESTIONAR CLIENTES EDITARLOS Y CREARLOS
    GESTION_EMPEÑOS: "GESTION_EMPEÑOS", // PERMITE HACER EMPEÑOS Y VALORACIONES
    GESTION_PRESTAMOS: "GESTION_PRESTAMOS", // PERMITE HACER PRESTAMOS
    GESTION_PRESTAMOS_POR_PERSONAS_NATURALES: "GESTION_PRESTAMOS_POR_PERSONAS_NATURALES", // PERMITE HACER PRESTAMOS DE PERSONAS NATURALES
    GESTION_SUCURSAL: "GESTION_SUCURSAL", // PERMITE EDITAR DATOS DE LA SUCURSAL
    GESTION_MOVIMIENTOS: "GESTION_MOVIMIENTOS", // PERMITE INGRESOS Y EGRESOS, Y MOVIMIENTOS DE CAJA
    GESTION_COMPRAS: "GESTION_COMPRAS", // PERMITE HACER COMPRAS
    GESTION_VENTAS: "GESTION_VENTAS", // PERMITE HACER VENTAS
    GESTION_LOTES: "GESTION_LOTES", // PERMITE GESTIONAR LOTES
    GESTION_RECIBOS: "GESTION_RECIBOS", // PERMITE GESTIONAR RECIBOS
    GESTOR_TAREAS: "GESTOR_TAREAS", //  PUEDE GESTIONAR TAREAS CREARLAS EDITARLAS
    //helpdesk
    GENERADOR_SOLICITUDES: "GENERADOR_SOLICITUDES", // HELPDESK - GENERADOR DE SOLICITUDES
    ADMINISTRAR_CASOS_DEPENDENCIA: "ADMINISTRAR_CASOS_DEPENDENCIA", // HELPDESK - ADMINISTRAR CASOS DEPENDENCIA
    TECNICO_CASOS_DEPENDENCIA: "TECNICO_CASOS_DEPENDENCIA", // HELPDESK - TÉCNICO DE CASOS DEPENDENCIA
    QUESTIONNAIRES_MANAGER: "QUESTIONNAIRES_MANAGER", // ADMINISTRADOR DE CUESTIONARIOS
    QUESTIONNAIRES_GESTOR: "QUESTIONNAIRES_GESTOR", // GESTOR DE CUESTIONARIOS
    ADMINISTRAR_CASOS_PROPIOS: "ADMINISTRAR_CASOS_PROPIOS",
    //Questionnaires
    QUESTIONNAIRES_MANAGER: "QUESTIONNAIRES_MANAGER",
    QUESTIONNAIRES_GESTOR: "QUESTIONNAIRES_GESTOR",
    QUESTIONNAIRES_USER: "QUESTIONNAIRES_USER"
};
export { Permissions }