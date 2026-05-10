import { ModelProperty } from "./CommonModel.js";
import { EntityClass } from "./EntityClass.js";

class WArrayF {
    static isArray(array) {
        return array != "" && array != undefined && array != null && array.__proto__ == Array.prototype
    }
    static ValidateByModel(object, model) {
        for (const prop in model) {
            const exclude = ["Filterdata", "ApiMethods", "OrderData"]
            /**@type {ModelProperty} */
            const propValue = model[prop];
            if (propValue?.__proto__ != Function.Property &&
                propValue?.__proto__.constructor.name != "AsyncFunction" &&
                prop != "FilterData" &&
                prop != "OrderData" &&
                prop != "ApiMethods" &&
                propValue?.hidden != true &&
                propValue?.primary != true &&
                propValue?.require != false && (object[prop] == undefined || object[prop] == null)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Agrega o Elimina un elemento de un arreglo seg n un parametro de seleccion
     * @param {Object.<string, any>} Element Elemento a agregar o eliminar
     * @param {Array} Array Arreglo en el que se va a agregar o eliminar el elemento
     * @param {Boolean} checked Parametro de seleccion
     */
    static AddOrRemove(Element, Array, checked) {
        const index = Array.indexOf(Element);
        if (index == -1 && checked == true) {
            Array.push(Element);
        } else if (checked != true) {
            Array.splice(index, 1);
        }
    }

    static JSONParse(param) {
        return JSON.parse((param).replace(/&quot;/gi, '"'));
    }

    /**
     * @param {Array} Array Arreglo para ordenar
     * @param {number} type Valor 1 o 2
     * @returns
     */
    static orderByDate(Array, type) {
        var meses = [
            "enero", "febrero", "marzo",
            "abril", "mayo", "junio", "julio",
            "agosto", "septiembre", "octubre",
            "noviembre", "diciembre"
        ];
        if (type == 1) {
            Array.sort((a, b) => a.time - b.time);
        } else if (type == 2) {
            Array.forEach(element => {
                if (element.time.includes("diciembre")) {
                    var Year = new Date(Date.parse(element.time)).getFullYear();
                    element.time = Date.parse(Year + " December");
                } else element.time = Date.parse(element.time);
            });
            Array.sort((a, b) => a.time - b.time);

            Array.forEach(element => {
                var fecha = new Date(element.time);
                element.time = meses[fecha.getMonth()] + " " + fecha.getFullYear();
            });

        } else {
            var Array2 = [];
            Array.forEach(element => {
                var object = {
                    cuarter: null,
                    year: null
                };
                object.cuarter = element.time.substring(1, 0);
                object.year = element.time.substring(element.time.length, 14);
                Array2.push(object);
            })
            Array2.sort((a, b) => a.year - b.year);
            var Array3 = [];
            Array2.forEach(element => {
                var object = Array.find(x => x.time.substring(1, 0).includes(element.cuarter) &&
                    x.time.includes(element.year));
                Array3.push(object);
            });
            Array = Array3;
        }
        return Array;
    }

    /**
     * Agrupa un arreglo por medio de una lista de parametros y evalua
     * @param {Array} DataArray arreglo original
     * @param {String} param propiedad por la cual se va a evaluar el arreglo agrupado
     * @param {String} sumParam parametro a sumar
     * @returns {Array} Arreglo agrupado por parametro con su contador y suma
     */
    static GroupArray(DataArray, GroupPropertys = [], EvalParams = [], index = 0) {
        if (!GroupPropertys[index]) {
            return undefined;
        }
        let DataArraySR = []
        const groupedData = Object.groupBy(DataArray, (groupData) => groupData[GroupPropertys[index]]);
        for (const key in groupedData) {
            const group = {};
            group[GroupPropertys[index]] = key;
            const consolidadoModel = groupedData[key].find(m => m[GroupPropertys[index]] != null && m[GroupPropertys[index]] != undefined)
            WArrayF.ConsolidateProp(consolidadoModel, GroupPropertys[index], DataArray, group, {
                filterProp: GroupPropertys[index],
                value: key
            })
            EvalParams.forEach(evalParam => {
                const Model = groupedData[key][0]//.find(m => m[evalParam] != null && m[evalParam] != undefined)

                if (!Model || WArrayF.isNotConsolidable(evalParam, Model)) {
                    return;
                }
                WArrayF.ConsolidateProp(Model, evalParam, DataArray, group, {
                    filterProp: GroupPropertys[index],
                    value: key
                });
            });
            if (GroupPropertys[index + 1]) {
                group.Data = WArrayF.GroupArray(groupedData[key], GroupPropertys, EvalParams, index + 1);
            }
            DataArraySR.push(group);
        }
        return DataArraySR;
    }
    /**
     * @typedef {Object.<string, any>} Consolidado 
        * @property {String} EvalProperty
        * @property {Number} Max
        * @property {Number} Min
        * @property {Number} count
        * @property {Number} rate
        * @property {Number} sum
        * @property {Number} avg
        * @property {Array<Object>} Data
    **/

    /**
     * Agrupa un arreglo por medio de un parametros
     * @param {Array} DataArray arreglo original
     * @param {String} param propiedad por la cual se va a evaluar el arreglo agrupado
     * @param {String} [sumProperty] parametro a sumar
     * @returns {Array<Consolidado>} Arreglo agrupado por parametro con su contador, rate, avg, max, min y suma los ultimos 4 solo se retornan si sumProperty esta definido
     */
    static GroupBy(DataArray, Property, sumProperty) {
        let DataArraySR = [];
        let GroupData = {};
        if (Property && sumProperty) {
            GroupData = Object.groupBy(DataArray, (type) => type[Property]);
        }
        DataArray?.forEach(element => {
            const DFilt = DataArraySR.find(x => x[Property] == element[Property]);
            if (!DFilt) {
                const NewElement = {};
                if (Property) {
                    NewElement[Property] = element[Property];
                    NewElement.EvalProperty = element[Property];
                }
                if (GroupData[NewElement[Property]]) {
                    NewElement.Max = this.MaxValue(GroupData[NewElement[Property]], sumProperty)
                    NewElement.Min = this.MinValue(GroupData[NewElement[Property]], sumProperty)
                    NewElement.Data = GroupData[NewElement[Property]]
                }
                /*for (const prop in element) {
                    NewElement[prop] = element[prop]
                }*/
                //console.log(element);
                if (!element.hasOwnProperty("count")) {
                    element.count = 1;
                    NewElement.count = 1;
                } else {
                    NewElement.count = element.count;
                }
                NewElement.rate = ((1 / DataArray.length) * 100).toFixed(2) + "%";
                if (sumProperty != null && sumProperty != undefined && sumProperty != "count") {
                    NewElement[sumProperty] = element[sumProperty] ?? 0;
                    NewElement.sum = element[sumProperty] ?? 0;
                    NewElement.avg = NewElement.sum / NewElement.count;
                }
                DataArraySR.push(NewElement)
            } else {
                if (!element.count) {
                    element.count = 1;
                    DFilt.count++;
                } else {
                    DFilt.count = DFilt.count + element.count;
                }
                DFilt.rate = ((DFilt.count / DataArray.length) * 100).toFixed(2) + "%";
                if (sumProperty != null && sumProperty != undefined && sumProperty != "count") {
                    DFilt[sumProperty] = DFilt[sumProperty] + element[sumProperty];
                    DFilt.sum += element[sumProperty] ?? 0;
                    DFilt.avg = DFilt.sum / DFilt.count;
                }
            }
        });
        return DataArraySR;
    }

    /**
     * Agrupa un arreglo por medio de un parametros
     * @param {Array} DataArray arreglo original
     * @param {Object.<string, any>} param Objeto con el cual por la cual se va a evaluar el arreglo agrupado
     * @param {String} sumParam parametro a sumar
     * @returns Arreglo agrupado por parametro con su contador y suma
     */
    static GroupByObject(DataArray, param = {}, sumParam = null) {
        let DataArraySR = [];
        DataArray.forEach(element => {
            const DFilt = DataArraySR.find(obj => {
                let flagObj = true;
                for (const prop in param) {
                    if (obj[prop] != element[prop]) {
                        flagObj = false;
                    }
                }
                return flagObj;
            });
            if (!DFilt) {
                const NewElement = {};
                for (const prop in element) {
                    NewElement[prop] = element[prop]
                }
                NewElement.count = element.count ?? 1;
                //console.log(NewElement);
                NewElement.rate = ((1 / DataArray.length) * 100).toFixed(2) + "%";
                DataArraySR.push(NewElement)
            } else {
                //console.log(DFilt);
                const countVal = element.count ?? 1;
                DFilt.count = DFilt.count + countVal;
                DFilt.rate = ((DFilt.count / DataArray.length) * 100).toFixed(2) + "%";
                if (sumParam != null && element[sumParam] != null && element[sumParam] != undefined) {
                    DFilt[sumParam] = DFilt[sumParam] + element[sumParam];
                }
            }
        });
        return DataArraySR;
    }

    static MaxValue(Data, MaxParam) {
        var Maxvalue = Data[0][MaxParam] ?? 0;
        for (let index = 0; index < Data.length; index++) {
            if (parseInt(Data[index][MaxParam]) > Maxvalue) {
                Maxvalue = Data[index][MaxParam];
            }
        }
        return Maxvalue;
    }

    static MinValue(Data, MaxParam) {
        if (Data == undefined || Data == null || Data.length == 0) {
            return 0;
        }
        var MinValue = Data[0][MaxParam] ?? 0
        for (let index = 0; index < Data.length; index++) {
            if (parseInt(Data[index][MaxParam]) < MinValue) {
                MinValue = Data[index][MaxParam];
            }
        }
        return MinValue;
    }

    static MaxDateValue(Data, MaxParam) {
        var Maxvalue = new Date(Data[0][MaxParam]);
        for (let index = 0; index < Data.length; index++) {

            if (new Date(Data[index][MaxParam]) > Maxvalue) {
                Maxvalue = new Date(Data[index][MaxParam]);
            }
        }
        return Maxvalue;
    }

    static MinDateValue(Data, MaxParam) {
        var MinValue = new Date(Data[0][MaxParam]);
        for (let index = 0; index < Data.length; index++) {

            if (new Date(Data[index][MaxParam]) < MinValue) {
                MinValue = new Date(Data[index][MaxParam]);
            }
        }
        return MinValue;
    }

    //reparar
    static SumValue(DataArry, EvalValue) {
        var Maxvalue = 0;
        for (let index = 0; index < DataArry.length; index++) {
            Maxvalue = Maxvalue + parseFloat(DataArry[index][EvalValue]);
        }
        return Maxvalue;
    }

    /**
     *
     * @param {*} DataArry
     * @param {*} EvalValue
     * @returns {Number}
     */
    static SumValAtt(DataArry, EvalValue) {//retorna la suma 
        var Maxvalue = 0;
        for (let index = 0; index < DataArry.length; index++) {
            if (typeof DataArry[index][EvalValue] === "number" || parseFloat(DataArry[index][EvalValue]).toString() != "NaN") {
                Maxvalue = Maxvalue + parseFloat(DataArry[index][EvalValue]);
            } else {
                console.log("ERROR: ", EvalValue, DataArry[index][EvalValue]);
                break;
            }
        }
        return Maxvalue;
    }

    /**
     *
     * @param {*} DataArry
     * @param {*} EvalValue
     * @returns {Number}
     */
    static CountValues(DataArry, EvalValue) {//retorna la suma 
        var Maxvalue = 0;
        for (let index = 0; index < DataArry.length; index++) {
            if (!DataArry[index].hasOwnProperty(EvalValue)) {
                DataArry[index][EvalValue] = 1;
            }
            Maxvalue = Maxvalue + parseFloat(DataArry[index][EvalValue]);
        }
        return Maxvalue;
    }

    static SumValAttByProp(DataArry, Atrib, EvalValue) {
        var Maxvalue = 0;
        for (let index = 0; index < DataArry.length; index++) {
            const Obj = DataArry[index];
            if (Obj[Atrib.prop] == Atrib.value) {
                if (typeof Obj[EvalValue] === "number") {
                    Maxvalue = Maxvalue + parseFloat(Obj[EvalValue]);
                } else {
                    Maxvalue = "Error!";
                    break;
                }
            }
        }
        return Maxvalue;
    }

    //BUSQUEDA Y COMPARACIONES
    static FindInArray(element, Dataset) {
        let exists = Dataset.find((item) => this.compareObj(element, item));
        return (exists != null || exists != undefined) ? true : false;
    }

    static compareObj(ComparativeObject, EvalObject) {//compara si dos objetos son iguales en las propiedades        
        if (typeof ComparativeObject === "string" && typeof ComparativeObject === "number") {
            if (ComparativeObject == EvalObject) return true;
            else return false;
        }
        let val = true;
        for (const prop in this.replacer(ComparativeObject)) {
            if (ComparativeObject[prop] !== EvalObject[prop]) {
                val = false;
                break;
            }
        }
        return val;
    }
    /**
    * @param {Array} Dataset 
    * @param {Number|String} param
    * @returns {Array}
    */
    static async FilterInArrayByValue(Dataset, param) {
        const dataset = Dataset.filter((element) => {
            for (const prop in element) {
                try {
                    if (this.evalValue(element[prop], param) != null) {
                        return element;
                    }
                } catch (error) {
                    console.log(element);
                }
            }
        });
        return dataset;
    }

    static evalValue = (element, param) => {
        const evalF = (parametro, objetoEvaluado) => {
            if (parametro.__proto__ == Object.prototype || parametro.__proto__.__proto__ == EntityClass.prototype) {
                if (this.compareObj(objetoEvaluado, parametro)) return objetoEvaluado;
            } else if (parametro.__proto__ == Array.prototype) {
                const find = parametro.find(x => WArrayF.compareObj(objetoEvaluado, x));
                if (find == undefined) {
                    flagObj = false;
                }
            } else {
                for (const objectProto in objetoEvaluado) {
                    if (objetoEvaluado[objectProto] != null) {
                        if (objetoEvaluado[objectProto].toString().toUpperCase().includes(parametro.toString().toUpperCase())) {
                            return objetoEvaluado;
                        }
                    }
                }
            }
            return undefined
        }
        if (element != null) {
            if (element.__proto__ == Object.prototype) {
                if (evalF(param, element)) {
                    return element
                }
            } else if (element.__proto__ == Array.prototype) {
                const find = element.find(item => {
                    if (item != null) {
                        if (item.__proto__ == Object.prototype) {
                            if (evalF(param, item)) {
                                return true
                            }
                        } else if (item.toString().toUpperCase().includes(param.toString().toUpperCase())) {
                            return true;
                        }
                    }
                });
                if (find) {
                    return element;
                }
            } else if (element.toString().toUpperCase().includes(param.toString().toUpperCase())) {
                return element;
            }
        }
        return null
    }

    /**
     * @param {Object.<string, any>} Model
     * @param {Object.<string, any>} [EditingObject]
     * @param {string} prop
     */
    static isModelFromFunction(Model, EditingObject) {
        return this.ModelFromFunction(Model, EditingObject);
    }

    /**
     * @param {Object.<string, any>} propierty
     * @param {Object.<string, any>} [EditingObject]      
     */
    static ModelFromFunction(propierty, EditingObject) {
        if (propierty?.__proto__ == Function.prototype) {
            propierty = propierty(EditingObject);
        }
        return propierty;
    }

    //STRINGS
    static Capitalize(str) {
        if (str == null) {
            return str;
        }
        str = str.toString();
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    //verifica que un objeto este dentro de un array
    static checkDisplay(DisplayData, prop, Model = {}) {
        let flag = true;
        if (Model[prop] == undefined && Model[prop] == null) {
            flag = false;
        }
        if (Model[prop] != undefined && Model[prop] != null
            && Model[prop].__proto__ == Object.prototype
            && (Model[prop].primary || Model[prop].hidden)) {
            flag = false;
        }
        if (DisplayData != undefined && DisplayData.__proto__ == Array.prototype) {
            const findProp = DisplayData.find(x => x.toUpperCase() == prop.toUpperCase());
            if (!findProp) {
                flag = false;
            }
        }
        return flag;
    }

    /**
     * @param {Array} Array Arreglo para ordenar
     * @param {Object.<string, any>} [Model] Arreglo para ordenar
     * @returns {Object.<string, any>}
     */
    static Consolidado(Array, Model) {
        Model = Model ?? Array[0];
        const consolidado = {};

        for (const prop in Model) {
            if (WArrayF.isNotConsolidable(prop, Model)) {
                continue;
            }
            WArrayF.ConsolidateProp(Model, prop, Array, consolidado);
        }
        return consolidado;
    }

    static isNotConsolidable = (prop, ModelObject) => {
        if (ModelObject != undefined && ModelObject[prop]?.type != undefined && (
            //|| ModelObject[prop]?.type.toUpperCase() == "MASTERDETAIL"
            //|| ModelObject[prop]?.type.toUpperCase() == "MULTISELECT"
            ModelObject[prop]?.primary == true
            || ModelObject[prop]?.hidden == true
            || ModelObject[prop]?.hiddenInTable == true
        )
            || ModelObject[prop]?.__proto__ == Function.prototype
            || ModelObject[prop]?.__proto__.constructor.name == "AsyncFunction") {
            return true;
        }
        ;
    }

    static ConsolidateProp(Model, prop, Array, consolidado, filterData) {
        //{ filterProp: Propertys[index], value: key }
        //console.log(filterData);
        const FilterArray = !filterData ? Array : Array.filter(dato => dato[filterData.filterProp] == filterData.value)
        //console.log(FilterArray, typeof Model[prop] === "number");
        consolidado[prop] = {};

        if (Model[prop] == undefined || typeof Model[prop] === "number") {
            const sumaCantidad = this.CountValues(FilterArray, prop);
            consolidado[prop].Cantidad = sumaCantidad;
            consolidado[prop].Porcentaje = sumaCantidad / Array.length * 100;
            //consolidado[prop].Max = this.MaxValue(FilterArray, prop);
            //consolidado[prop].Min = this.MinValue(FilterArray, prop);
        } else {
            consolidado[prop].Valor = Model[prop];
        }
    }

    static replacer(value) {
        if (value == null) {
            return null;
        }
        const replacerElement = {};
        for (const prop in value) {
            if ((prop == "get" && prop == "set") ||
                prop == "ApiMethods" ||
                prop == "FilterData" ||
                prop == "Get" ||
                prop == "GetByProps" ||
                prop == "FindByProps" ||
                prop == "Save" ||
                prop == "Update" ||
                prop == "GetData" ||
                prop == "SaveData" ||
                value[prop] == null ||
                value[prop] == undefined ||
                value[prop].__proto__.constructor.name == "AsyncFunction" ||
                value[prop]?.__proto__ == Object.prototype ||
                value[prop]?.__proto__ == Function.prototype ||
                value[prop]?.__proto__ == Array.prototype || prop == "OrderData") {
                continue;
            }
            replacerElement[prop] = value[prop]

        }
        return replacerElement;
    }
    /**
     * @param {Array<OrderData>} [sorts]
     * @param {any[]} DFilt
     */
    static SortArray(sorts, DFilt) {
        if (sorts && sorts.length > 0) {
            DFilt.sort((a, b) => {
                for (const sort of sorts) {
                    const { PropName, OrderType } = sort;
                    // Verificar si la propiedad existe en los objetos
                    if (a[PropName] < b[PropName]) {
                        return OrderType === "ASC" ? -1 : 1;
                    }
                    if (a[PropName] > b[PropName]) {
                        return OrderType === "ASC" ? 1 : -1;
                    }
                }
                return 0; // Si los valores son iguales, no se cambia el orden
            });
        }
    }

    static CloneObject(object) {
        const clone = {}
        for (const key in object) {
            clone[key] = object[key];
        }
        return clone;
    }

    //NUEVA AGRUPACION

    /**
      * @param {any[]} data
      * @param {string | undefined} title
      * @param {any[] | undefined} GroupParams
      * @param {string[] | undefined} EvalParams
      * @param {Object.<string, ModelProperty>} [ModelObject]
      */
    static GroupData(data, GroupParams, EvalParams, ModelObject, title, isFinalGroupedData = false) {
        const metricLevels = {}

        if (!GroupParams || GroupParams.length === 0) {
            // @ts-ignore
            metricLevels[title ?? "Reporte"] = this.CalculateSummary(data, undefined, EvalParams, ModelObject, isFinalGroupedData);
            const metric = {};
            // @ts-ignore
            metric[title ?? "Reporte"] = data
            return metric;
        }
        const groupedData = {};
        let metricKey;
        data.forEach(itemData => {
            const item = Object.assign({}, itemData)

            /**@type {Object.<string, any>} */
            let currentLevel = groupedData;
            let path = []; // Almacena el nivel de agrupación
            GroupParams.forEach((param, index) => {
                const key = item[param] ?? "Undefined";
                path.push(key);
                if (!currentLevel[key]) {
                    currentLevel[key] = index === GroupParams.length - 1 ? [] : {};
                    metricKey = param
                }
                currentLevel = currentLevel[key];
            });

            if (isFinalGroupedData && Array.isArray(currentLevel)) {
                const itemIncluded = currentLevel.find(it => it[metricKey] == item[metricKey])
                if (itemIncluded == null) {
                    item.count = 1;
                    currentLevel.push(item);
                } else {
                    itemIncluded.count++;
                    EvalParams.forEach(param => {
                        itemIncluded[param] += item[param]
                    })
                }
            } else {
                currentLevel.push(item);
            }
        });
        // Función recursiva para calcular los resúmenes de cada grupo
        const processGroup = (group, path = []) => {
            /**
             * @type {any[]}
             */
            let allItems = [];
            Object.keys(group).forEach(key => {
                const currentPath = [...path, key];
                if (Array.isArray(group[key])) {
                    // Si es un array, calcular resumen y almacenarlo en MetricLevels
                    // @ts-ignore
                    metricLevels[currentPath.join(" > ")] = this.CalculateSummary(group[key], data, EvalParams, ModelObject, isFinalGroupedData);
                    allItems = allItems.concat(group[key]);
                } else {
                    // Si es un objeto anidado, procesarlo recursivamente
                    const subItems = processGroup(group[key], currentPath);
                    allItems = allItems.concat(subItems);
                }
            });
            // Resumen del nivel actual
            if (allItems.length > 0) {
                // @ts-ignore
                metricLevels[path.join(" > ")] = this.CalculateSummary(allItems, data, EvalParams, ModelObject, isFinalGroupedData);
            }
            return allItems;
        };
        processGroup(groupedData);
        // Consolidado general
        metricLevels["General Summary"] = this.CalculateSummary(data, undefined, EvalParams, ModelObject, isFinalGroupedData);
        
        if (isFinalGroupedData) {
            const uniqueMetricsLevels = {};
            Object.keys(metricLevels).forEach(key => {
                /*const uniqueMetricsLevel = uniqueMetricsLevels[key];      
                if (!uniqueMetricsLevel) {
                    const newObject = Object.assign({}, metricLevels[key])
                    uniqueMetricsLevels[key] = newObject;
                } else {

                }*/
            })
        }
        console.log(groupedData, metricLevels);
        return { groupedData, metricLevels };
    }

    // Método auxiliar para calcular el resumen de un conjunto de datos
    static CalculateSummary(data, parentData, EvalParams, ModelObject, isFinalGroupedData) {
        const summary = {};

        EvalParams?.forEach(param => {
            const isWithModel = ModelObject != null && ModelObject != undefined;
            const isMoney = isWithModel && ModelObject[param]?.type?.toUpperCase() === "MONEY";
            const isNumber = isWithModel && ModelObject[param]?.type?.toUpperCase() === "NUMBER";

            // Solo sumar valores numéricos si el tipo es MONEY o NUMBER
            const totalSum = (isMoney || isNumber)
                ? data.reduce((acc, item) => acc + (typeof item[param] === 'number' ? item[param] : 0), 0)
                : undefined;

            const totalElements = parentData?.length ?? data.length; // Total de elementos en data
            const validCount = isFinalGroupedData ? data[0].count : data.filter(item => item[param] !== undefined && item[param] !== null).length; // Cuenta los elementos válidos

            const avg = totalElements > 0 ? (validCount / totalElements) * 100 : 0; // % de elementos válidos

            summary[param] = {
                ...(totalSum !== undefined ? { sum: totalSum } : {}), // Solo incluir 'sum' si se calculó
                count: validCount, // Número de elementos válidos
                avg // % de elementos válidos sobre el total
            };
        });
        return summary;
    }
}

export { WArrayF };