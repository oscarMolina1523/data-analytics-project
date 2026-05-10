import { StyleScrolls } from "../StyleModules/WStyleComponents.js";
import { ModelProperty } from "../WModules/CommonModel.js";
import { Money } from "../WModules/Types/Money.js";
import { WArrayF } from "../WModules/WArrayF.js";
import { WRender } from "../WModules/WComponentsTools.js";
import { css, WCssClass } from "../WModules/WStyledRender.js";
import "./WChartJSComponents.js";
import { ColumChart, RadialChart } from "./WChartJSComponents.js";
import { WFilterOptions } from "./WFilterControls.js";
import { WForm } from "./WForm.js";
import { WModalForm } from "./WModalForm.js";
import { WTableComponent } from "./WTableComponent.js";
class DinamicConfigModel {
    constructor(/**@type {Function}*/ action) {
        this.action = action
    }
    /**@type {ModelProperty}*/ Grafico = { type: 'radio', Dataset: ["Barras", "Linea"], action: (element) => this.action(element) };
    /**@type {ModelProperty}*/ Data = { type: 'radio', Dataset: ["Porcentaje", "Totales"], action: (element) => this.action(element) };
}
class WTableDynamicComp extends HTMLElement {
    constructor(TableConfig = {}) {
        super();
        this.TableClass = "WTable WScroll";
        this.className = "DinamicContainer";
        this.Dataset = [];
        this.TableConfig = TableConfig;
        this.groupParams = this.TableConfig.groupParams ?? [];
        this.ParamsForOptions = this.TableConfig.ParamsForOptions ?? null;
        this.DisplayFilts = this.TableConfig.DisplayFilts ?? null;
        this.EvalValue = this.TableConfig.EvalValue ?? null;
        this.AttNameEval = this.TableConfig.AttNameEval ?? null;
        this.OperationsType = "sum";//"sum" count;
        this.ModelObject = this.TableConfig.ModelObject;
        this.Config = TableConfig.ConfigOptions ?? {}
        this.ChartDisplayConfig(this.Config);
        this.ConfigForm = new WForm({
            DivColumns: "calc(33% - 5px)  calc(33% - 5px) calc(33% - 5px)", Options: false,
            EditObject: this.Config, ModelObject: new DinamicConfigModel((element) => {
                this.ChartDisplayConfig(element);
                this.DefineTable();
            })
        });
        this.attachShadow({ mode: "open" });
        this.MainTable = WRender.createElement({ type: "div", props: { class: this.TableClass, id: "MainTable" + this.id }, children: [] });
        this.divTableContainer = WRender.createElement({
            type: "div", props: { class: "tableContainer" },
            children: [this.MainTable]
        });
        this.ChartContainer = WRender.createElement({
            type: "div",
            props: { id: "Chart" + this.id, className: "CharttableReport" },
        });
        this.FilterControl = this.FilterOptions();
        this.ConfigControl = this.CreateConfig();
    }
    ChartDisplayConfig(element) {
        if (element.Data == "Totales") {
            this.percentCalc = false;
        } else {
            this.percentCalc = true;
        }
        if (element.Grafico == "Linea") {
            this.TableConfig.TypeChart = "Line";
        } else {
            this.TableConfig.TypeChart = undefined;
        }
    }

    connectedCallback() {
        if (this.MainTable.innerHTML != "") {
            return;
        }
        this.RunTable();
    }
    RunTable() {
        if (typeof this.TableConfig.Dataset === "undefined" || this.TableConfig.Dataset.length == 0) {
            this.innerHTML = "Defina un Dataset en formato JSON";
            return;
        }
        this.Dataset = this.TableConfig.Dataset;
        //this.Colors = ["#ff6699", "#ffbb99", "#adebad"];
        this.AttNameEval = this.TableConfig.AttNameEval;
        this.EvalValue = this.TableConfig.EvalValue;
        this.Options = this.TableConfig.Options;
        if (this.TableConfig.TableClass) {
            this.TableClass = this.TableConfig.TableClass + " WScroll";
        }
        this.GroupsData = [];
        this.ProcessData = [];
        this.EvalArray = WArrayF.GroupBy(this.TableConfig.Dataset, this.AttNameEval);
        this.append(css`
            .DinamicContainer {
                height: auto;
                display: grid;
                border: solid 1px #d1cfcf;
                border-radius: 0.2cm;
                grid-template-columns: 30% calc(70% - 370px) 350px;
                grid-template-rows:  auto;
                font-size: 12px;
                grid-gap: 5px;
                padding: 10px;
                transition: all 1s;
                max-width: 100%;                
                box-sizing: border-box;
                width:100%;
            }
        `);
        this.GridTC = "1/3";
        if (this.TableConfig.DisplayOptions != false) {
            this.GridTC = "1/2";
            this.shadowRoot.append(WRender.createElement(this.TableOptions()));
        }
        this.TableStyle = WRender.createElement(this.TableStyleDinamic());
        this.shadowRoot.append(this.TableStyle);
        this.shadowRoot.append(this.divTableContainer);
        this.shadowRoot.append(this.ChartContainer, StyleScrolls.cloneNode(true));
        this.ChartContainer.innerHTML = "";
        this.DrawGroupTable(this.Dataset);
        if (this.TableConfig.AddChart) {
            this.DrawChart();
        }
        return;
    }
    //FIN BASIOC TABLE-------------------------------------------------------------------
    //#region TABLA DINAMICA-------------------------------------------------------------
    DrawGroupTable(Dataset) {
        this.groupParams.forEach(groupParam => {
            this.GroupsData.push(WArrayF.GroupBy(Dataset, groupParam))
        });
        let div = this.DrawGroupDiv(this.ChargeGroup(this.GroupsData))
        this.MainTable.append(WRender.createElement(div));
    }
    ChargeGroup = (Groups, inicio = 0) => {
        if (!Groups[inicio]) {
            return null;
        }
        let ObjGroup = {
            data: Groups[inicio],
            groupParam: this.groupParams[inicio],
            children: this.ChargeGroup(Groups, inicio + 1)
        }
        return ObjGroup;
    }
    AttEval = () => {
        let div = { type: "div", props: { class: "TContainerBlockL" }, children: [] };
        div.children.push({ type: "Tlabel", children: [WArrayF.Capitalize(this.AttNameEval)] });
        if (this.EvalArray != null) {
            this.EvalArray.forEach(evalValue => {
                div.children.push({ type: "TData", children: [WArrayF.Capitalize(evalValue[this.AttNameEval])] });
            });
            div.children.push({ type: "TDataTotal", children: ["Total"] });
        }
        return div;
    }
    DrawGroupDiv = (Groups, div = { type: "div", props: { class: "TContainer" }, children: [this.AttEval()] }, arrayP = {}) => {
        if (Groups == null) { return ""; }
        Groups.data.forEach((Group) => {
            let trGroup = { type: "div", props: { class: "TContainerBlock" }, children: [] };
            trGroup.children.push({ type: "Tlabel", children: [WArrayF.Capitalize(Group[Groups.groupParam])] });
            let dataGroup = { type: "div", props: { class: "Cajon" }, children: [] };
            trGroup.children.push(dataGroup);
            arrayP[Groups.groupParam] = Group[Groups.groupParam];
            if (Groups.children != null) {
                if (Groups.children.children == null) {
                    trGroup.props.class = "flexChild";
                }
                this.DrawGroupDiv(Groups.children, dataGroup, arrayP);
            } else {
                trGroup.props.class = "TContainerBlockData";
                if (this.EvalArray != null) {
                    this.EvalArray.forEach(Eval => {
                        arrayP[this.AttNameEval] = Eval[this.AttNameEval];
                        const Data = this.FindData(arrayP)
                        if (typeof Data === "number" && Data.toString() != "NaN") {
                            dataGroup.children.push({ type: "TData",  children: [new Money(Data).toString()] });
                        } else {
                            dataGroup.children.push({ type: "TData", children: [Data] });
                        }

                        let NewObject = {};
                        for (const prop in arrayP) {
                            NewObject[prop] = arrayP[prop];
                        }
                        if (typeof Data === "number" && parseFloat(Data).toString() != "NaN") {
                            NewObject[this.EvalValue] = Data;
                            this.ProcessData.push(NewObject)
                        } 
                    });
                    let sum = 0;
                    dataGroup.children.forEach(element => {
                        const value = parseFloat(element.children[0].replace("$", "").replace(",", ""));
                        if (typeof value === "number" && value.toString() != "NaN") {
                            sum = sum + value;
                        }
                    });
                    dataGroup.children.push({ type: "TDataTotal", children: [new Money(sum).toString()] });
                }
            }
            div.children.push(trGroup);
        });
        return div;
    }
    DefineTable(Dataset = this.Dataset) {
        this.ProcessData = [];
        this.Dataset = Dataset;
        if (this.EvalValue == null) {
            this.MainTable.innerHTML = "Agregue un Value";
        } else {
            this.EvalArray = WArrayF.GroupBy(Dataset, this.AttNameEval);
            this.MainTable.innerHTML = "";
            this.GroupsData = [];
            //this.MainTable.style.display = "flex";
            this.DrawGroupTable(Dataset);
        }
        this.ChartContainer.innerHTML = "";

        if (this.TableConfig.AddChart) {
            this.DrawChart();
        }

    }
    TableOptions = () => {
        if (this.shadowRoot.querySelector("#TableOptionstable")) {
            return "";
        }
        const allowDrop = (ev) => { ev.preventDefault(); }
        const drag = (ev) => { ev.dataTransfer.setData("text", ev.target.id); }
        let divAtt = WRender.createElement({
            type: "div",
            props: {
                class: "TableOptionsAtribs", id: "ListAtribs", ondrop: this.drop, ondragover: allowDrop
            }, children: [{ type: "label", props: { innerText: "Parametros", class: "titleParam" } }]
        });
        let model = this.Dataset[0];
        let divEvalAttib = WRender.createElement({
            type: "div",
            props: {
                class: "TableOptionsAtribs", style: "height: 35%", id: "ListEval", ondrop: this.drop, ondragover: allowDrop
            }, children: [{
                type: "label", props: { innerText: "Filas", class: "titleParam" }
            }]
        });
        let divEvalGroups = WRender.createElement({
            type: "div",
            props: {
                class: "TableOptionsAtribs", id: "ListGroups", ondrop: this.drop, ondragover: allowDrop
            }, children: [{
                type: "label", props: { innerText: "Columnas", class: "titleParam" }, children: []
            }]
        });
        let select = {
            type: "select",
            props: {
                id: "Select" + this.id, class: "titleParam", onchange: (ev) => {
                    this.OperationsType = ev.target.value;
                    this.DefineTable();
                }
            }, children: [
                { type: "option", props: { innerText: "Value - Suma", value: "sum" } },
                { type: "option", props: { innerText: "Value - Count", value: "count" } }
            ]
        }
        let divEvalValue = WRender.createElement({
            type: "div",
            props: {
                class: "TableOptionsAtribs",
                id: "ListValue",
                ondrop: this.drop,
                ondragover: allowDrop
            }, children: [select]
        });
        for (const props in model) {
            if (!WArrayF.checkDisplay(this.ParamsForOptions, props, model)) {
                continue;
            }
            const LabelP = WRender.createElement({
                type: "label",
                children: [WArrayF.Capitalize(props), {
                    type: 'input', props: {
                        type: 'button', value: 'x', onclick: async () => {
                            const btn = LabelP.querySelector("input");
                            btn.style.display = "none";
                            divAtt.append(LabelP);
                            this.DefineParams();
                            this.DefineTable();
                        }
                    }
                }],
                props: {
                    id: props + this.id, name: props, class: "labelParam", draggable: true, ondragstart: drag
                }
            });
            if (props == this.EvalValue) {
                divEvalValue.append(LabelP);
            } else if (props == this.AttNameEval) {
                divEvalAttib.append(LabelP);
            } else if (this.groupParams.find(x => x == props)) {
                divEvalGroups.append(LabelP);
            } else {
                const btn = LabelP.querySelector("input");
                btn.style.display = "none";
                divAtt.append(LabelP);
            }
        }
        const TOpcion = WRender.createElement({
            type: "div",
            props: { class: "TableOptions", id: "TableOptions" + this.id }
        });
        const divBTNS = WRender.createElement({
            type: 'div', props: { id: '', class: 'TableOptionsBTN' }, children: [
                {//display
                    type: 'input', props: {
                        style: 'transform: rotate(90deg)', type: 'button', class: 'BtnDinamictT', type: "button", value: '>', onclick: async (ev) => {
                            if (TOpcion.className == "TableOptions") {
                                ev.target.style["transform"] = "inherit";
                                TOpcion.className = "TableOptionsInact";
                                this.style.gridTemplateColumns = "calc(100% - 70px) 70px";
                            } else {
                                ev.target.style["transform"] = "rotate(90deg)";
                                TOpcion.className = "TableOptions";
                                this.style.gridTemplateColumns = "calc(100% - 350px) 350px";
                            }
                        }
                    }
                }, {//filters
                    type: 'button', props: {
                        class: 'BtnDinamictT', innerText: '', onclick: async () => {
                            this.shadowRoot.append(new WModalForm({
                                title: "Filtros",
                                ObjectModal: this.FilterControl,
                                ObjectOptions: {
                                    SaveFunction: (NewObject) => { }
                                }
                            }));
                        }
                    }, children: [{ type: 'img', props: { src: this.Icons.filter, srcset: this.Icons.filter } }]
                }, {//Data
                    type: 'button', props: {
                        class: 'BtnDinamictT', innerText: '', onclick: async () => {
                            this.shadowRoot.append(new WModalForm({
                                title: "Datos",
                                ObjectModal: new WTableComponent({
                                    Dataset: this.TableConfig.Dataset,
                                    Options: { Search: true }
                                }), ObjectOptions: {
                                    SaveFunction: (NewObject) => { }
                                }
                            }));
                        }
                    }, children: [{ type: 'img', props: { src: this.Icons.config, srcset: this.Icons.dataset } }]
                }, {//Print
                    type: 'button', props: {
                        class: 'BtnDinamictT', innerText: '', onclick: async () => {
                            const MainTable = this.MainTable.innerHTML + `<style>${this.TableStyle.innerHTML}</style>`;
                            const MainChart = this.ChartContainer.querySelector("w-colum-chart");
                            const PrintNode = MainTable + MainChart.shadowRoot.innerHTML;
                            //console.log(PrintNode);
                            const ventimp = window.open(' ', 'popimpr');
                            ventimp.document.write(PrintNode);
                            ventimp.document.close();
                            ventimp.print();
                            ventimp.close();
                        }
                    }, children: [{ type: 'img', props: { src: this.Icons.config, srcset: this.Icons.printI } }]
                },/*{//Config
                    type: 'button', props: {
                        class: 'BtnDinamictT', innerText: '', onclick: async () => {
                            this.shadowRoot.append(WRender.createElement({
                                type: "w-modal-form",
                                props: {
                                    title: "Configuraciones",
                                    ObjectModal: this.ConfigControl,
                                    ObjectOptions: {
                                        SaveFunction: (NewObject) => { }
                                    }
                                }
                            }));
                        }
                    }, children: [{ type: 'img', props: { src: this.Icons.config, srcset: this.Icons.config } }]
                }*/
            ]
        });
        TOpcion.append(divBTNS, divAtt,
            WRender.createElement({ type: 'div', props: { class: 'TableOptionsAtribs OptionsAtribsGroup' }, children: [divEvalAttib, divEvalGroups, divEvalValue] }), this.ConfigForm)
        return TOpcion;
    }
    DrawChart() {
        if (this.groupParams.length > 0 && this.EvalArray != null) {
            if (this.TableConfig.TypeChart == undefined) {// bar or staked
                this.TableConfig.TypeChart = "bar";
            }
            var CharConfig = {
                TypeChart: this.TableConfig.TypeChart,
                Dataset: this.ProcessData,
                ColumnLabelDisplay: 0,
                AttNameEval: this.AttNameEval,
                EvalValue: this.EvalValue,
                groupParams: this.groupParams,
                percentCalc: this.percentCalc
            };
            this.ChartContainer.append(new ColumChart(CharConfig));
            this.groupParams.forEach(param => {
                this.ChartContainer.append(new RadialChart({
                    Dataset: this.Dataset,
                    Title: param,
                    AttNameEval: param,
                    percentCalc: this.percentCalc
                    //EvalValue: this.EvalValue
                }))
            });
            return;
        }
        this.ChartContainer.append("No hay agrupaciones");
    }
    FindData(arrayP) {
        let val = false;
        let nodes = [];
        this.TableConfig.Dataset.forEach(Data => {
            val = WArrayF.compareObj(arrayP, Data)
            if (val == true) {
                nodes.push(Data)
            }
        });
        if (nodes.length != []) {
            //let Operations = this.OperationsType;// this.shadowRoot.querySelector("#Select" + this.id);
            let value = "fail!";
            if (this.OperationsType != null) {
                if (this.OperationsType == "sum") {
                    value = WArrayF.SumValAtt(nodes, this.EvalValue);
                } else if (this.OperationsType == "count") {
                    value = nodes.length;
                }
            } else {
                value = WArrayF.SumValAtt(nodes, this.EvalValue);
            }
            return value;
        } else {
            return "n/a";
        }
    }
    drop = (ev) => {
        ev.preventDefault();
        var data = ev.dataTransfer.getData("text");
        let target = ev.target;
        let control = this.shadowRoot.querySelector("#" + data);
        const OriginalParent = control.parentNode.id;
        if (control == null) {
            console.log("error", target.parentNode.id, "TableOptions" + this.id)
            return;
        }
        if (target.className == "TableOptionsAtribs") {
            if (target.id.includes("ListEval")) {
                if (target.children.length == 2) {
                    //console.log("entro1");
                    return;
                }
                this.AttNameEval = this.shadowRoot.querySelector("#" + data).name;
                this.EvalArray = WArrayF.GroupBy(this.TableConfig.Dataset, this.AttNameEval);
                let find = this.groupParams.find(a => a == this.shadowRoot.querySelector("#" + data).name);
                if (find) {
                    this.groupParams.splice(this.groupParams.indexOf(find), 1);
                }
            } else if (target.id.includes("ListValue")) {
                if (target.children.length == 2) {
                    //console.log("entro1");
                    return;
                }
                this.EvalValue = this.shadowRoot.querySelector("#" + data).name;
                let find = this.groupParams.find(a => a == this.shadowRoot.querySelector("#" + data).name);
                if (find) {
                    this.groupParams.splice(this.groupParams.indexOf(find), 1);
                }
            } else if (target.id.includes("ListGroups")) {
                if (target.children.length == 5) {
                    console.log("Grupos excedidos");
                    return;
                }
                let find = this.groupParams.find(a => a == this.shadowRoot.querySelector("#" + data).name);
                if (!find) {
                    this.groupParams.push(this.shadowRoot.querySelector("#" + data).name);
                }
            } else if (target.id.includes("ListAtribs")) {
                let find = this.groupParams.find(a => a == this.shadowRoot.querySelector("#" + data).name);
                if (find) {
                    this.groupParams.splice(this.groupParams.indexOf(find), 1);
                }
            }
            target.appendChild(this.shadowRoot.querySelector("#" + data));
            if (OriginalParent.includes("ListEval")) {
                this.AttNameEval = null;
                this.EvalArray = null;
            }
            if (OriginalParent.includes("ListValue")) {
                this.EvalValue = null;
            }
            if (OriginalParent.includes("ListGroups")) {
                this.groupParams = [];
                const Parent = this.shadowRoot.querySelector("#" + OriginalParent);
                Parent.querySelectorAll(".labelParam").forEach(element => {
                    this.groupParams.push(element.name);
                });
            }
            const btn = control.querySelector("input");
            if (target.id.includes("ListAtribs")) {
                btn.style.display = "none";
            } else {
                btn.style.display = "block";
            }
            this.DefineTable();
        } else {
            console.log("error")
        }
    }
    DefineParams = () => {
        this.EvalValue = null;
        this.groupParams = [];
        this.AttNameEval = null;
        const ContEval = this.shadowRoot.querySelector("#ListEval");
        const LabelEval = ContEval.querySelector(".labelParam");
        if (LabelEval != null) {
            this.AttNameEval = LabelEval.name;
        }
        const ContGroups = this.shadowRoot.querySelector("#ListGroups");
        ContGroups.querySelectorAll(".labelParam").forEach(labelParam => {
            this.groupParams.push(labelParam.name);
        });
        const ConValue = this.shadowRoot.querySelector("#ListValue");
        const LabelValue = ConValue.querySelector(".labelParam");
        if (LabelValue != null) {
            this.EvalValue = LabelValue.name;
        }
    }
    FilterOptions = () => {
        return new WFilterOptions({
            Dataset: this.TableConfig.Dataset,
            DisplayFilts: this.DisplayFilts,
            AutoSetDate: true,
            ModelObject: this.ModelObject,
            Display: true,
            FilterFunction: (DFilt) => {
                this.DefineTable(DFilt);
            }
        })
    }
    CreateConfig = () => {
        const ConfigContainer = {
            type: 'div',
            props: { class: "ConfigContainer" }, children: [{
                type: 'w-style', props: {
                    id: '', ClassList: [
                        new WCssClass(`.ConfigContainer`, {
                            padding: 20,
                            display: "grid",
                            "grid-template-columns": "50% 50%",
                            "grid-gap": 10
                        }), new WCssClass(`.ConfigContainer label`, {
                            padding: 10,
                            display: "block"
                        }),
                    ]
                }
            }]
        }
        return ConfigContainer;
    }
    //#endregion FIN TABLA DINAMICA---------------------------------------------------------------------------
    //ESTILOS-------------------------------------------------------###################
    TableStyleDinamic() {
        const style = this.shadowRoot.querySelector("#TableStyleDinamic" + this.id);
        if (style) {
            style.parentNode.removeChild(style);
        }
        const WTableStyle = css`
            * {
                font-family: arial;
                -webkit-print-color-adjust: exact !important;
            }        
            .tableContainer {
                overflow: auto;
                grid-row: 1/3;
                grid-column: ${this.GridTC};
                border: 1px solid #d1cfcf;
            }            
            .WTable {
                font-family: Verdana, sans-serif;
                width: 100%;
                border-collapse: collapse;
                font-size: 1rem;
                position: relative;
            }            
            .TContainer {
                padding: 0px;
                display: flex;
                flex-grow: 1px;
            }            
            .TContainerBlockL {
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
                background-color: #fafafa;
                font-weight: bold;
            }            
            .TContainerBlockData {
                width: 100%;
            }            
            Tlabel {
                display: block;
                border-bottom: 1px solid #707070;
                overflow-y: hidden;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                min-width: 60px;
                background-color: #fafafa;
                padding: 10px;
                font-size: 11px;
                text-align: left;
                font-weight: bold;
                color: #2c2c2c;
            }            
            .TContainerBlockData .Cajon {
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }            
            .flexChild {
                padding: 0px;
            }            
            TData {
                overflow-y: hidden;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                min-width: 60px;
                padding: 10px;
                font-size: 11px;
                text-align: left;
            }            
            TDataTotal {
                overflow-y: hidden;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                min-width: 60px;
                border-top: solid 1px #ccc;
                text-align: left;
                font-size: 11px;
                padding: 10px;
                font-weight: bold;
            }            
            .Cajon {
                display: flex;
            }            
            .TableOptions {
                display: grid;
                grid-gap: 10px;
                padding: 10px;
                min-height: 500px;
                max-height: 700px;
                transition: all 1s;
                overflow: hidden;
                grid-column: 3/4;
                grid-row: 1/3;
                grid-template-columns: 49% 49%;
                grid-template-rows: 50px 70% auto;
                box-shadow: 0 0 2px 0 rgba(0, 0, 0, 50%);
            }            
            .TableOptions .TableOptionsBTN {
                grid-column: 1/3;
                padding: 10px;
                background-color: var(--secundary-color);
                display: flex;
                align-items: center;
            }            
            .TableOptions .TableOptionsAtribs {
                display: flex;
                width: 100%;
                grid-row: 2/3;
                flex-direction: column;
                background-color: var(--secundary-color);
                box-shadow: 0 0 2px 0 rgba(0, 0, 0, 30%);
                height: 100%;
            }            
            .TableOptions .OptionsAtribsGroup {
                display: flex;
                overflow: hidden;
                flex-direction: column;
            }            
            .TableOptionsInact {
                display: grid;
                grid-gap: 10px;
                background-color: #eee;
                padding: 10px;
                transition: all 1s;
                overflow: hidden;
                grid-column: 2/3;
                grid-row: 1/3;
                grid-template-columns: 98%;
                grid-template-rows: 50px 70% auto;
                box-shadow: 0 0 2px 0 rgba(0, 0, 0, 50%);
            }            
            .TableOptionsInact .TableOptionsBTN {
                grid-column: 1/2;
                grid-row: 1/4;
                padding: 10px;
                background-color: var(--secundary-color);
                display: flex;
                flex-direction: column;
                align-items: center;
            }            
            .TableOptionsInact .TableOptionsAtribs {
                display: none;
            }            
            .Btn,
            .BtnTable,
            .BtnTableA,
            .BtnTableS,
            .BtnDinamictT {
                font-weight: bold;
                border: none;
                margin: 2px;
                text-align: center;
                display: inline-block;
                font-size: 12px;
                cursor: pointer;
                background-color: #4894aa;
                color: #fff;
                border-radius: 0.2cm;
                display: flex;
                justify-content: center;
                align-items: center;
            }           
            .BtnDinamictT {
                width: 30px;
                height: 30px;
                background-color: #4894aa;
                font-family: monospace;
            }            
            .BtnDinamictT img {
                width: 20px;
                height: 20px;
                filter: invert(100%);
            }            
            .titleParam {
                display: flex;
                background-color: #cee4f3;
                color: #126e8d;
                margin-bottom: 10px;
                cursor: pointer;
                text-align: center;
                position: relative;
                height: 30px;
                min-height: 30px;
                max-height: 30px;
                align-items: center;
                justify-content: center;
            }            
            select.titleParam,
            select.titleParam:focus,
            select.titleParam:active {
                cursor: pointer;
                background-color: #cee4f3;
                border: none;
                color: #126e8d;
                outline: none;
                padding: 10px;
                outline-width: 0;
                margin: 0px;
                font: 400 12px Arial;
                margin-bottom: 10px;
            }            
            .labelParam {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                background-color: var(--secundary-color);
                cursor: pointer;
                border-bottom: solid 2px #efefef;
            }            
            .labelParam input {
                outline: none;
                border: none;
                background: none;
                cursor: pointer;
            }            
            .CharttableReport {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
                grid-row: 1/3;
                grid-column: 2/3;
            }
            .CharttableReport w-colum-chart {
                grid-column: span 3;
            }
            .TableOptions w-form {
                grid-column: span 2;
                background-color: var(--secundary-color);
                box-shadow: 0 0 2px 0 rgba(0, 0, 0, 30%);
            }
            .TableOptionsInact w-form  {
                display: none !important;
            }
        `
        return WTableStyle;
    }
    Icons = {
        printI: "data:image/svg+xml;base64," + "PHN2ZyBpZD0iTGF5ZXIiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUxMiA1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgd2lkdGg9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJtNDE0IDgwaC0zMTZjLTUuNTIzIDAtMTAtNC40NzctMTAtMTB2LTI2YzAtMjQuMzAxIDE5LjY5OS00NCA0NC00NGgyNDhjMjQuMzAxIDAgNDQgMTkuNjk5IDQ0IDQ0djI2YzAgNS41MjMtNC40NzcgMTAtMTAgMTB6Ii8+PHBhdGggZD0ibTQ1OCAxMTJoLTQwNGMtMjkuNzc2IDAtNTQgMjQuMjI0LTU0IDU0djE4OGMwIDI5Ljc3NiAyNC4yMjQgNTQgNTQgNTRoMzR2LTgwYzAtMzkuNzAxIDMyLjI5OS03MiA3Mi03MmgxOTJjMzkuNzAxIDAgNzIgMzIuMjk5IDcyIDcydjgwaDM0YzI5Ljc3NiAwIDU0LTI0LjIyNCA1NC01NHYtMTg4YzAtMjkuNzc2LTI0LjIyNC01NC01NC01NHptLTM2MS45OCAxMjBjLTEzLjI1NSAwLTI0LjAwNS0xMC43NDUtMjQuMDA1LTI0czEwLjc0LTI0IDIzLjk5NS0yNGguMDFjMTMuMjU1IDAgMjQgMTAuNzQ1IDI0IDI0cy0xMC43NDUgMjQtMjQgMjR6Ii8+PHBhdGggZD0ibTM1MiAzMDRoLTE5MmMtMTMuMjU1IDAtMjQgMTAuNzQ1LTI0IDI0djgwIDMyYzAgMTMuMjU1IDEwLjc0NSAyNCAyNCAyNGgxOTJjMTMuMjU1IDAgMjQtMTAuNzQ1IDI0LTI0di0zMi04MGMwLTEzLjI1NS0xMC43NDUtMjQtMjQtMjR6Ii8+PC9zdmc+",
        dataset: "data:image/svg+xml;base64," + "PHN2ZyBoZWlnaHQ9IjUxMnB0IiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgd2lkdGg9IjUxMnB0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Im00OTcgMzMxaC00NXYtNDVjMC04LjI4NTE1Ni02LjcxNDg0NC0xNS0xNS0xNWgtMTY2di0zMGg0NWM4LjI4NTE1NiAwIDE1LTYuNzE0ODQ0IDE1LTE1cy02LjcxNDg0NC0xNS0xNS0xNWgtNDV2LTMwaDEwNWM4LjI4NTE1NiAwIDE1LTYuNzE0ODQ0IDE1LTE1di0xNTFjMC04LjI4NTE1Ni02LjcxNDg0NC0xNS0xNS0xNWgtMjQwYy04LjI4NTE1NiAwLTE1IDYuNzE0ODQ0LTE1IDE1djE1MWMwIDguMjg1MTU2IDYuNzE0ODQ0IDE1IDE1IDE1aDEwNXYzMGgtNDVjLTguMjg1MTU2IDAtMTUgNi43MTQ4NDQtMTUgMTVzNi43MTQ4NDQgMTUgMTUgMTVoNDV2MzBoLTE2NmMtOC4yODUxNTYgMC0xNSA2LjcxNDg0NC0xNSAxNXY0NWgtNDVjLTguMjg1MTU2IDAtMTUgNi43MTQ4NDQtMTUgMTV2MTUxYzAgOC4yODUxNTYgNi43MTQ4NDQgMTUgMTUgMTVoMTIwYzguMjg1MTU2IDAgMTUtNi43MTQ4NDQgMTUtMTV2LTE1MWMwLTguMjg1MTU2LTYuNzE0ODQ0LTE1LTE1LTE1aC00NXYtMzBoMTUxdjMwaC00NWMtOC4yODUxNTYgMC0xNSA2LjcxNDg0NC0xNSAxNXYxNTFjMCA4LjI4NTE1NiA2LjcxNDg0NCAxNSAxNSAxNWgxMjBjOC4yODUxNTYgMCAxNS02LjcxNDg0NCAxNS0xNXYtMTUxYzAtOC4yODUxNTYtNi43MTQ4NDQtMTUtMTUtMTVoLTQ1di0zMGgxNTF2MzBoLTQ1Yy04LjI4NTE1NiAwLTE1IDYuNzE0ODQ0LTE1IDE1djE1MWMwIDguMjg1MTU2IDYuNzE0ODQ0IDE1IDE1IDE1aDEyMGM4LjI4NTE1NiAwIDE1LTYuNzE0ODQ0IDE1LTE1di0xNTFjMC04LjI4NTE1Ni02LjcxNDg0NC0xNS0xNS0xNXptLTM0Ni0zMDFoMjEwdjEyMWgtMjEwem0tMzEgNDUyaC05MHYtMTIxaDkwem0xODEgMGgtOTB2LTEyMWg5MHptMTgxIDBoLTkwdi0xMjFoOTB6bTAgMCIvPjxwYXRoIGQ9Im00NTIgNDM2YzAgOC4yODUxNTYtNi43MTQ4NDQgMTUtMTUgMTVzLTE1LTYuNzE0ODQ0LTE1LTE1IDYuNzE0ODQ0LTE1IDE1LTE1IDE1IDYuNzE0ODQ0IDE1IDE1em0wIDAiLz48cGF0aCBkPSJtMjcxIDQzNmMwIDguMjg1MTU2LTYuNzE0ODQ0IDE1LTE1IDE1cy0xNS02LjcxNDg0NC0xNS0xNSA2LjcxNDg0NC0xNSAxNS0xNSAxNSA2LjcxNDg0NCAxNSAxNXptMCAwIi8+PHBhdGggZD0ibTkwIDQzNmMwIDguMjg1MTU2LTYuNzE0ODQ0IDE1LTE1IDE1cy0xNS02LjcxNDg0NC0xNS0xNSA2LjcxNDg0NC0xNSAxNS0xNSAxNSA2LjcxNDg0NCAxNSAxNXptMCAwIi8+PC9zdmc+",
        filter: "data:image/svg+xml;base64," + "PHN2ZyBoZWlnaHQ9IjUxMXB0IiB2aWV3Qm94PSIwIDAgNTExIDUxMS45OTk4MiIgd2lkdGg9IjUxMXB0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Im00OTIuNDc2NTYyIDBoLTQ3MS45NzY1NjJjLTExLjA0Njg3NSAwLTIwIDguOTUzMTI1LTIwIDIwIDAgNTUuNjk1MzEyIDIzLjg3NSAxMDguODY3MTg4IDY1LjUwMzkwNiAxNDUuODcxMDk0bDg3LjU4OTg0NCA3Ny44NTE1NjJjMTUuMTg3NSAxMy41IDIzLjg5ODQzOCAzMi44OTg0MzggMjMuODk4NDM4IDUzLjIyMjY1NnYxOTUuMDMxMjVjMCAxNS45Mzc1IDE3LjgxMjUgMjUuNDkyMTg4IDMxLjA4OTg0MyAxNi42MzY3MTlsMTE3Ljk5NjA5NC03OC42NjAxNTZjNS41NjI1LTMuNzEwOTM3IDguOTA2MjUtOS45NTMxMjUgOC45MDYyNS0xNi42NDA2MjV2LTExNi4zNjcxODhjMC0yMC4zMjQyMTggOC43MTA5MzctMzkuNzIyNjU2IDIzLjg5ODQzNy01My4yMjI2NTZsODcuNTg1OTM4LTc3Ljg1MTU2MmM0MS42Mjg5MDYtMzcuMDAzOTA2IDY1LjUwMzkwNi05MC4xNzU3ODIgNjUuNTAzOTA2LTE0NS44NzEwOTQgMC0xMS4wNDY4NzUtOC45NTMxMjUtMjAtMTkuOTk2MDk0LTIwem0tNzIuMDgyMDMxIDEzNS45NzI2NTYtODcuNTg1OTM3IDc3Ljg1NTQ2OWMtMjMuNzE4NzUgMjEuMDg1OTM3LTM3LjMyNDIxOSA1MS4zNzg5MDYtMzcuMzI0MjE5IDgzLjExMzI4MXYxMDUuNjY3OTY5bC03Ny45OTYwOTQgNTEuOTk2MDk0di0xNTcuNjYwMTU3YzAtMzEuNzM4MjgxLTEzLjYwNTQ2OS02Mi4wMzEyNS0zNy4zMjQyMTktODMuMTE3MTg3bC04Ny41ODU5MzctNzcuODUxNTYzYy0yOC4wNzAzMTMtMjQuOTU3MDMxLTQ1Ljk4ODI4MS01OS4xNTIzNDMtNTAuNzg1MTU2LTk1Ljk4MDQ2OGg0MjkuMzg2NzE5Yy00Ljc5Njg3NiAzNi44MjgxMjUtMjIuNzEwOTM4IDcxLjAyMzQzNy01MC43ODUxNTcgOTUuOTc2NTYyem0wIDAiLz48L3N2Zz4=",
        config: "data:image/svg+xml;base64," + "PHN2ZyBoZWlnaHQ9IjUxMnB0IiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgd2lkdGg9IjUxMnB0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Im00OTkuOTUzMTI1IDE5Ny43MDMxMjUtMzkuMzUxNTYzLTguNTU0Njg3Yy0zLjQyMTg3NC0xMC40NzY1NjMtNy42NjAxNTYtMjAuNjk1MzEzLTEyLjY2NDA2Mi0zMC41MzkwNjNsMjEuNzg1MTU2LTMzLjg4NjcxOWMzLjg5MDYyNS02LjA1NDY4NyAzLjAzNTE1Ni0xNC4wMDM5MDYtMi4wNTA3ODEtMTkuMDg5ODQ0bC02MS4zMDQ2ODctNjEuMzA0Njg3Yy01LjA4NTkzOC01LjA4NTkzNy0xMy4wMzUxNTctNS45NDE0MDYtMTkuMDg5ODQ0LTIuMDUwNzgxbC0zMy44ODY3MTkgMjEuNzg1MTU2Yy05Ljg0Mzc1LTUuMDAzOTA2LTIwLjA2MjUtOS4yNDIxODgtMzAuNTM5MDYzLTEyLjY2NDA2MmwtOC41NTQ2ODctMzkuMzUxNTYzYy0xLjUyNzM0NC03LjAzMTI1LTcuNzUzOTA2LTEyLjA0Njg3NS0xNC45NDkyMTktMTIuMDQ2ODc1aC04Ni42OTUzMTJjLTcuMTk1MzEzIDAtMTMuNDIxODc1IDUuMDE1NjI1LTE0Ljk0OTIxOSAxMi4wNDY4NzVsLTguNTU0Njg3IDM5LjM1MTU2M2MtMTAuNDc2NTYzIDMuNDIxODc0LTIwLjY5NTMxMyA3LjY2MDE1Ni0zMC41MzkwNjMgMTIuNjY0MDYybC0zMy44ODY3MTktMjEuNzg1MTU2Yy02LjA1NDY4Ny0zLjg5MDYyNS0xNC4wMDM5MDYtMy4wMzUxNTYtMTkuMDg5ODQ0IDIuMDUwNzgxbC02MS4zMDQ2ODcgNjEuMzA0Njg3Yy01LjA4NTkzNyA1LjA4NTkzOC01Ljk0MTQwNiAxMy4wMzUxNTctMi4wNTA3ODEgMTkuMDg5ODQ0bDIxLjc4NTE1NiAzMy44ODY3MTljLTUuMDAzOTA2IDkuODQzNzUtOS4yNDIxODggMjAuMDYyNS0xMi42NjQwNjIgMzAuNTM5MDYzbC0zOS4zNTE1NjMgOC41NTQ2ODdjLTcuMDMxMjUgMS41MzEyNS0xMi4wNDY4NzUgNy43NTM5MDYtMTIuMDQ2ODc1IDE0Ljk0OTIxOXY4Ni42OTUzMTJjMCA3LjE5NTMxMyA1LjAxNTYyNSAxMy40MTc5NjkgMTIuMDQ2ODc1IDE0Ljk0OTIxOWwzOS4zNTE1NjMgOC41NTQ2ODdjMy40MjE4NzQgMTAuNDc2NTYzIDcuNjYwMTU2IDIwLjY5NTMxMyAxMi42NjQwNjIgMzAuNTM5MDYzbC0yMS43ODUxNTYgMzMuODg2NzE5Yy0zLjg5MDYyNSA2LjA1NDY4Ny0zLjAzNTE1NiAxNC4wMDM5MDYgMi4wNTA3ODEgMTkuMDg5ODQ0bDYxLjMwNDY4NyA2MS4zMDQ2ODdjNS4wODU5MzggNS4wODU5MzcgMTMuMDM1MTU3IDUuOTQxNDA2IDE5LjA4OTg0NCAyLjA1MDc4MWwzMy44ODY3MTktMjEuNzg1MTU2YzkuODQzNzUgNS4wMDM5MDYgMjAuMDYyNSA5LjI0MjE4OCAzMC41MzkwNjMgMTIuNjY0MDYybDguNTU0Njg3IDM5LjM1MTU2M2MxLjUyNzM0NCA3LjAzMTI1IDcuNzUzOTA2IDEyLjA0Njg3NSAxNC45NDkyMTkgMTIuMDQ2ODc1aDg2LjY5NTMxMmM3LjE5NTMxMyAwIDEzLjQyMTg3NS01LjAxNTYyNSAxNC45NDkyMTktMTIuMDQ2ODc1bDguNTU0Njg3LTM5LjM1MTU2M2MxMC40NzY1NjMtMy40MjE4NzQgMjAuNjk1MzEzLTcuNjYwMTU2IDMwLjUzOTA2My0xMi42NjQwNjJsMzMuODg2NzE5IDIxLjc4NTE1NmM2LjA1NDY4NyAzLjg5MDYyNSAxNC4wMDM5MDYgMy4wMzkwNjMgMTkuMDg5ODQ0LTIuMDUwNzgxbDYxLjMwNDY4Ny02MS4zMDQ2ODdjNS4wODU5MzctNS4wODU5MzggNS45NDE0MDYtMTMuMDM1MTU3IDIuMDUwNzgxLTE5LjA4OTg0NGwtMjEuNzg1MTU2LTMzLjg4NjcxOWM1LjAwMzkwNi05Ljg0Mzc1IDkuMjQyMTg4LTIwLjA2MjUgMTIuNjY0MDYyLTMwLjUzOTA2M2wzOS4zNTE1NjMtOC41NTQ2ODdjNy4wMzEyNS0xLjUzMTI1IDEyLjA0Njg3NS03Ljc1MzkwNiAxMi4wNDY4NzUtMTQuOTQ5MjE5di04Ni42OTUzMTJjMC03LjE5NTMxMy01LjAxNTYyNS0xMy40MTc5NjktMTIuMDQ2ODc1LTE0Ljk0OTIxOXptLTE1Mi4xNjAxNTYgNTguMjk2ODc1YzAgNTAuNjEzMjgxLTQxLjE3OTY4OCA5MS43OTI5NjktOTEuNzkyOTY5IDkxLjc5Mjk2OXMtOTEuNzkyOTY5LTQxLjE3OTY4OC05MS43OTI5NjktOTEuNzkyOTY5IDQxLjE3OTY4OC05MS43OTI5NjkgOTEuNzkyOTY5LTkxLjc5Mjk2OSA5MS43OTI5NjkgNDEuMTc5Njg4IDkxLjc5Mjk2OSA5MS43OTI5Njl6bTAgMCIvPjwvc3ZnPg==",
    }
}
customElements.define("w-table-dynamic", WTableDynamicComp);
export { WTableDynamicComp };
