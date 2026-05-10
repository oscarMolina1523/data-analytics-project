import { FilterData, OrderData } from "./CommonModel.js";
import { WAjaxTools } from "./WAjaxTools.js";

class EntityClass {
    constructor(props, Namespace) {
        this.ApiMethods = {
            ApiRoute: window.origin + "/api/",
            Get: "Api" + Namespace + "/get" + this.__proto__.constructor.name.replace("_ModelComponent", ""),
            Find: "Api" + Namespace + "/find" + this.__proto__.constructor.name.replace("_ModelComponent", ""),
            Set: "Api" + Namespace + "/save" + this.__proto__.constructor.name.replace("_ModelComponent", ""),
            Update: "Api" + Namespace + "/update" + this.__proto__.constructor.name.replace("_ModelComponent", ""),
            Delete: "Api" + Namespace + "/delete" + this.__proto__.constructor.name.replace("_ModelComponent", "")
        }
    }
    /**@type {Array<FilterData>} */
    FilterData = []
    /**@type {Array<OrderData>} */
    OrderData = []
    /**
     * @param {String} Param 
     * @returns {Promise<Array<any>>}
     */
    Get = async () => {
        let Data = await this.GetData(this.ApiMethods.Get);
        return Data;
    }
    /**
     * @param {Array<FilterData>} filterData 
     * @returns {Array}
     */
    Where = async (...filters) => {
        this.FilterData = filters;
        let Data = await this.GetData(this.ApiMethods.Get);
        return Data;
    }
    /**
     * @param {String} Param 
     * @returns {any}
     */
    Find = async (...filters) => {
        this.FilterData = filters;
        let FindObject = await this.GetData(this.ApiMethods.Find);
        if (FindObject) {
            return (new this.constructor(FindObject));
        }
        return null;
    }
    /**
    * @param {String} paramName 
    * @param {String} paramValue 
    * @returns {Array}
    */
    GetByProps = async (paramName, paramValue) => {
        let Data = await this.GetData();
        Data = Data.filter(ent => ent[paramName].toString().includes(paramValue.toString()));
        return Data.map(ent => new this.constructor(ent));
    }
    /**
   * 
   * @param {String} paramName 
   * @param {String} paramValue 
   * @returns {Array}
   */
    FindByProps = async (paramName, paramValue) => {
        let Data = await this.GetData();
        const FindObject = Data.find(ent => ent[paramName].toString().includes(paramValue.toString()));
        if (FindObject) {
            return (new this.constructor(FindObject));
        }
    }
    /**
     * 
     * @returns {Object.<string, any>}
     */
    Save = async () => {
        return await this.SaveData(this.ApiMethods.Set, this);
    }
    /**
     * @returns {ResponseServices}
     */
    Update = async () => {
        return await this.SaveData(this.ApiMethods.Update, this);
    }
    /**
    * @param {String} Param 
    * @returns {Array}
    */
    Delete = async (Param = "") => {
        let Data = await this.GetData(this.ApiMethods.Delete);
        return Data;
    }
    /** CORE ########################################################## */
    /**
   * 
   * @param {String} Path 
    * @param {Boolean} WithoutLoading 
   * @returns {Array}
   */
    GetData = async (Path, WithoutLoading = false) => {
        const Dataset = await WAjaxTools.PostRequest(this.ApiMethods.ApiRoute + Path, this.replacer(this), {
            WithoutLoading: WithoutLoading
        })
        // let Dataset = await fetch(this.ApiMethods.ApiRoute + this.constructor.name + '.json');
        //Dataset = await Dataset.json()
        if (Dataset == null || Dataset.__proto__ == Object.prototype) {
            return Dataset;
        }
        return Dataset.map(ent => new this.constructor(ent));
    }
    SaveWithModel = async (Object, Edit = false) => {
        if (Edit == false) {
            return await this.SaveData(this.ApiMethods.Set, Object);
        } else {
            return await this.SaveData(this.ApiMethods.Update, Object);
        }
    }
    SaveData = async (Path, Data) => {
        //console.log(this.ApiMethods.ApiRoute + Path, Data);
        return await WAjaxTools.PostRequest(this.ApiMethods.ApiRoute + Path, Data)
    }
    /**
    * @param {String} Path 
    * @param {Object.<string, any>} Data 
    * @returns {any}
    */
    Post = async (Path, Data) => {
        //console.log(this.ApiMethods.ApiRoute + Path, Data);
        return await WAjaxTools.PostRequest(this.ApiMethods.ApiRoute + Path, Data)
    }
    replacer(value) {
        const replacerElement = {};
        for (const prop in value) {
            if ((prop == "get" && prop == "set") ||
                prop == "ApiMethods" ||
                prop == "Get" ||
                prop == "GetByProps" ||
                prop == "FindByProps" ||
                prop == "Save" ||
                prop == "Update" ||
                prop == "GetData" ||
                prop == "SaveData" ||
                value[prop] == null ||
                value[prop] == undefined ||
                (value[prop]?.__proto__ == Object.prototype && value[prop].type)) {
                continue;
            }
            replacerElement[prop] = value[prop]
        }
        return replacerElement;
    }
    isRemovable;
    isEditable;
}
export { EntityClass }