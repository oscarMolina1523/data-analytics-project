//@ts-check
import { WSecurity } from "../Security/WSecurity.js";
import { LoadinModal } from "../WComponents/LoadinModal.js";
import { ModalMessage } from "../WComponents/ModalMessage.js";
import { WAlertMessage } from "../WComponents/WAlertMessage.js";


class PostConfig {
    /**
    * @param {Partial<PostConfig>} [props] 
    */
    constructor(props) {
        Object.assign(this, props);
    }
    /**  @type {String | undefined} */ RequestType = "POST";
    /**  @type {String | undefined} */ HeaderType = "json";
    /**  @type {String | undefined} */ CSRFToken = "";
    /**  @type {boolean} */ WithoutLoading = false;
    /**  @type {Array<{name:string, value:string}>} */ headers;
}
class WAjaxTools {
    /**
    * @param {String} Url
    * @param {Object.<string, any>} [Data]
    * @param {Partial<PostConfig>} [PostConfig]
    * @returns {Promise<any>}
    */
    static Request = async (Url, Data = {}, PostConfig, retryCount = 1) => {
        const loadinModal = new LoadinModal();
        let isComplete = false;

        setTimeout(() => {
            if (!PostConfig?.WithoutLoading && !isComplete) {
                document.body.appendChild(loadinModal);
            }
        }, 2000);

        let attempts = 0;

        //while (attempts < retryCount) {
        try {
            const config = WAjaxTools.BuildConfigRequest(PostConfig, Data);
            let response = await fetch(Url, config);
            const ProcessRequest = await WAjaxTools.ProcessRequest(response, Url);
            loadinModal.close();
            isComplete = true;
            if (!response) {
                WSecurity.ValidateResponse(ProcessRequest)
            }
            return ProcessRequest;
        } catch (error) {
            attempts++;
            if (attempts >= retryCount) {
                loadinModal.close();
                isComplete = true;
                console.error(`Error after ${retryCount} attempts:`, error);
                WAlertMessage.Danger(error.message, true);
                throw error; // Si ya alcanzamos el máximo de intentos, lanzamos el error.
            }
        }
        //}
    };
    /**
    * @param {String} Url
    * @param {Object.<string, any>} Data
    * @param {Partial<PostConfig>} postConfig 
    * @returns {Promise<any>}
    */
    static PostRequest = async (Url, Data = {}, postConfig = new PostConfig()) => {
        try {
            postConfig.RequestType = "POST";
            return await WAjaxTools.Request(Url, Data, postConfig);
        } catch (error) {
            console.log(error);
            throw error;
            //if (error == "TypeError: Failed to fetch" ) {
            // return this.LocalData(Url);
            //}
        }
    }
    static GetRequest = async (Url) => {
        try {
            return await WAjaxTools.Request(Url);
        } catch (error) {
            console.log(error)
            if (error == "TypeError: Failed to fetch") {
                return this.LocalData(Url);
            }
        }
    }
    static ProcessRequest = async (response, Url) => {
        if ([400, 403, 404, 500].includes(response.status)) {
            const messageError = await response.text();
            const lineas = messageError.split(/\r?\n/);
            console.log(lineas);
            document.body.append(ModalMessage(lineas[0]));
            throw new Error(this.ProcessError(lineas[0])).message;
        } else {
            try {
                const text = await response.text();
                if (text.trim().length === 0) {
                    return null;
                }

                // Validar si la respuesta es almacenable (puedes personalizar esta lógica)
                const isStorable = text.length < 1024 * 1024 * 2; // ejemplo: menor a 2MB

                if (isStorable) {
                    try {
                        localStorage.setItem(Url, text);
                    } catch (e) {
                        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                            console.warn(`No se pudo almacenar en localStorage: límite excedido (${Url})`);
                        } else {
                            console.warn(`Error desconocido al usar localStorage (${Url}):`, e);
                        }
                    }
                }

                const json = JSON.parse(text);
                return json;
            } catch (error) {
                console.log(error);
                console.log(response);
                console.log(`Ocurrió un error al procesar los datos de la respuesta - ${Url}`);
                return null;
            }
        }
    }


    /**
    * @param {Partial<PostConfig>} postConfig 
    * @param {any} Data 
    * @returns {any}
    */
    static BuildConfigRequest(postConfig = new PostConfig(), Data) {
        let ContentType = "application/json; charset=utf-8";
        let Accept = "*/*";
        if (postConfig.HeaderType == HeaderType.FORM) {
            ContentType = "application/x-www-form-urlencoded; charset=UTF-8";
            Accept = "*/*";
        }
        let dataRequest = {
            method: postConfig.RequestType,
            headers: {
                'Content-Type': ContentType,
                'Accept': Accept,
                dataType: 'json',
            }
        };
        if (postConfig.RequestType == RequestType.POST) {
            dataRequest.body = JSON.stringify(Data ?? {});
        }
        if (postConfig.CSRFToken != undefined && postConfig.CSRFToken != "") {
            dataRequest.headers['X-CSRF-TOKEN'] = postConfig.CSRFToken;
        }
        if (postConfig.headers) {
            postConfig.headers.forEach(header => {
                dataRequest.headers[header.name] = header.value
            })
        }
        return dataRequest;
    }

    static ProcessError(/**@type {String}*/string) {
        return string.toUpperCase().replace("SYSTEM.EXCEPTION", "ERROR");
    }

    static LocalData = (Url) => {
        let responseLocal = localStorage.getItem(Url);
        if (responseLocal != null) {
            return JSON.parse(responseLocal);
        }
        return {};
    }
}

export { WAjaxTools };

const RequestType = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    DELETE: "DELETE"
}
const HeaderType = {
    JSON: "json",
    FORM: "form"
}