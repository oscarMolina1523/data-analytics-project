//@ts-check
// @ts-ignore
import { FilterData, ModelProperty, OrderData, TableConfig } from "../WModules/CommonModel.js";
import { ConvertToMoneyString, html, WRender } from "../WModules/WComponentsTools.js";
import { ControlBuilder } from "../ComponentsBuilders/WControlBuilder.js";
import { WOrtograficValidation } from "../WModules/WOrtograficValidation.js";
import { WCssClass, WStyledRender, css } from "../WModules/WStyledRender.js";
import { WFilterOptions } from "./WFilterControls.js";
import { LoadinModal } from "./LoadinModal.js";
import { WArrayF } from "../WModules/WArrayF.js";
import { WAjaxTools } from "../WModules/WAjaxTools.js";
import { WTableStyle } from "./ComponentsStyles/WTableStyle.mjs";
import { StylesControlsV2 } from "../StyleModules/WStyleComponents.js";
import { DateTime } from "../WModules/Types/DateTime.js";
import { WPrintExportToolBar } from "./WPrintExportToolBar.mjs";
import { ModelPropertyFormBuilder } from "../ComponentsBuilders/ModelPropertyFormBuilder.js";
import { WCard } from "./WCard.js";


class WTableComponent extends HTMLElement {

    /**
     * @param {TableConfig} Config 
     */
    constructor(Config) {
        super();
        this.attachShadow({ mode: "open" });
        this.Config = Config
        // @ts-ignore
        for (const p in Config) { this[p] = Config[p]; }
        this.TableClass = "WTable WScroll";
        /**
         * @type {any[]}
         */
        this.selectedItems = [];
        this.isSelectAll = false;
        /**@type {Object.<string, ModelProperty>} */
        this.EntityModel = {};
        /**@type {Object.<string, ModelProperty>} */
        this.ModelObject = {};
        this.ThOptions = WRender.Create({ class: "thOptions" });
        this.Table = WRender.Create({ tagName: "Table", className: this.TableClass, id: "MainTable" });
        this.Tfooter = WRender.Create({ class: "tfooter" });
        this.divTableContainer = WRender.Create({ type: "div", class: "tableContainer", children: [this.Table] });
        this.shadowRoot?.append(this.ThOptions, this.divTableContainer, this.Tfooter);
        this.maxElementByPage = 0;
        this.numPage = 0;
        this.ActualPage = 0;
        /**
         * @type {any[]}
         */
        this.Dataset = [];
        /**
         * @type {OrderData[]}
         */
        this.Sorts = [];
        this.SelectedItemsContainer = WRender.Create({
            className: "SelectedItemsContainer", children: [
                { className: "selecteds" },
                { tagName: "span", className: "btnSelect" }
            ]
        });
        this.withFilter = false;
        this.InicializeConfig(this.Config);
    }
    /**
     * @param {{ Dataset?: any[] | undefined; selectedItems?: any[] | undefined; ModelObject?: any; UseEntityMethods?: boolean | undefined; FilterModelObject?: any; EntityModel?: any; ParentModel?: { [x: string]: any; } | undefined; ParentEntity?: { [x: string]: any; } | undefined; WSelectAddObject?: boolean | undefined; DarkMode?: boolean | undefined; paginate?: any; AddItemsFromApi?: boolean | undefined; AutoSave?: boolean | undefined; isActiveSorts?: boolean | undefined; isActiveMultiSorts?: boolean | undefined; SearchItemsFromApi?: import("../WModules/CommonModel.js").SearchItemsFromApi | undefined; TypeMoney?: any; maxElementByPage?: number | undefined; Options?: any; ImageUrlPath?: string | undefined; id?: string | undefined; SaveFunction?: Function | undefined; icon?: string | undefined; ValidateFunction?: Function | undefined; CustomStyle?: HTMLStyleElement | undefined; }} Config
     */
    InicializeConfig(Config) {
        this.paginate = Config.paginate ?? true;
        this.TypeMoney = Config.TypeMoney;
        this.Config = Config ?? {};
        this.Config.isActiveSorts = this.Config.isActiveSorts ?? true;
        this.Config.isActiveMultiSorts = this.Config.isActiveMultiSorts ?? false;
        this.Dataset = this.Config.Dataset;

        /**@type {Array<OrderData>} */
        this.Sorts = [];
        this.FilterOptions = new WFilterOptions({
            Dataset: this.Dataset,
            AutoSetDate: Config.Options?.AutoSetDate ?? true,
            Sorts: this.Sorts,
            ModelObject: Config.FilterModelObject ?? Config.ModelObject ?? {},
            EntityModel: Config.EntityModel,
            Display: Config.Options?.FilterDisplay ?? false,
            UseEntityMethods: this.Config.UseEntityMethods ?? this.Config.AddItemsFromApi ?? true, //TODO
            UseManualControlForFiltering: this.Config.Options?.UseManualControlForFiltering ?? false,
            FilterFunction: (/** @type {any[] | undefined} */ DFilt) => {
                this.withFilter = true;
                this.FilterDataset = DFilt;
                this.Dataset = [];
                if (this.Dataset.length == 0) {
                    this.Dataset = [...this.Dataset, ...DFilt];
                } else {
                    const objSet = new Set(this.Dataset.map(item => JSON.stringify(item)));
                    DFilt.forEach((/** @type {any} */ itemf) => {
                        const itemfStr = JSON.stringify(itemf);
                        if (!objSet.has(itemfStr)) {
                            this.Dataset.push(itemf);
                            objSet.add(itemfStr);
                        } else {
                            console.log("Item Existente");
                        }
                    });
                }
                this.FilterOptions.Config.Dataset = this.Dataset;
                this.DrawTable(DFilt);
            }
        });

        /**@type {Number} */
        this.maxElementByPage = this.Config.maxElementByPage ?? 10;
        /**@type {Number} */
        this.numPage = this.Dataset?.length / this.maxElementByPage;
        /**@type {Number} */
        this.ActualPage = 1;
        if (this.Config.selectedItems == undefined) {
            this.selectedItems = [];
        } else {
            this.selectedItems = this.Config.selectedItems;
        }
        if (this.Config.CustomStyle) {
            this.shadowRoot?.append(this.Config.CustomStyle);
        }
    }

    connectedCallback() {
        this.InicializeConfig(this.Config);
        this.Draw();
    }
    Draw = async () => {
        this.DarkMode = this.DarkMode ?? false;
        //this.shadowRoot?.append(this.TableStyle());
        this.shadowRoot?.append(WTableStyle.cloneNode(true));
        this.shadowRoot?.append(StylesControlsV2.cloneNode(true));
        //PAGINACION
        this.append(WRender.createElement({
            type: 'w-style', props: {
                id: '', ClassList: [
                    new WCssClass(`w-table`, {
                        display: "block"
                    }),
                ]
            }
        }));

        this.SearchItemsFromApi = this.Config.SearchItemsFromApi;
        this.Colors = ["#ff6699", "#ffbb99", "#adebad"];
        this.Options = this.Config?.Options;


        if (this.Config?.Options) {
            this.Options = this.Config?.Options;
        } else {
            /**@type {import("../WModules/CommonModel.js").TableOptions} */
            this.Options = {
                Search: true,
                Add: true,
                Edit: true,
                Show: true,
            };
        }
        this.EntityModel = this.Config.EntityModel;
        this.ModelObject = this.Config.ModelObject ?? this.Dataset[0];
        this.DrawTable();
        return;
    }
    //BASIC TABLE-----------------------------------------------------------------------
    //#region tabla basica --------------------------------------------------------------
    /**
     * @param {Array<any>} [Dataset] 
     */
    DefineModelObject(Dataset = this.Dataset) {
        //console.log(Dataset);
        if (this.Config.ModelObject == undefined) {
            for (const prop in Dataset[0]) {
                this.ModelObject[prop] = Dataset[0][prop];
            }
        } else {
            this.ModelObject = this.Config.ModelObject;
        }
    }
    /**
     * @param {Array<any>} Dataset 
     */
    async DrawTable(Dataset = this.Dataset) {
        this.DefineModelObject(Dataset);
        //console.log(this.ModelObject, this.Dataset);
        this.DrawHeadOptions();
        this.Table.innerHTML = "";

        const loadinModal = new LoadinModal();
        this.shadowRoot?.append(loadinModal);
        const isWithtUrl = (this.Config?.Options?.UrlSearch != null || this.Config?.Options?.UrlSearch != undefined);
        const isWithtModel = this.Config.ModelObject?.Get != undefined
        this.AddItemsFromApi = this.Config.AddItemsFromApi ?? (isWithtUrl || isWithtModel);
        let chargeWithFilter = false;
        if ((Dataset == undefined || Dataset == null) && this.AddItemsFromApi && !this.withFilter) {
            if (isWithtUrl) {
                // @ts-ignore
                Dataset = await WAjaxTools.PostRequest(this.Config?.Options?.UrlSearch);
                this.Dataset = [...this.Dataset, ...Dataset];
            } else if (this.Options?.Filter == true) {
                await this.FilterOptions.filterFunction(this.Sorts);
                chargeWithFilter = true;
            } else if (isWithtModel) {
                const model = this.Config.EntityModel ?? this.Config.ModelObject;
                Dataset = await model?.Get();
                this.Dataset = [...(this.Dataset ?? []), ...Dataset];
            }
        }
        this.withFilter = false;
        loadinModal.close();

        if (!chargeWithFilter) {
            this.Table.append(WRender.createElement(this.DrawTHead(Dataset?.length > 0 ? Dataset[0] : this.ModelObject)));
            await this.DrawTBody(Dataset);
            if (this.paginate == true) {
                this.Tfooter.innerHTML = "";
                this.DrawTFooter(Dataset).forEach(element => {
                    this.Tfooter.append(element);
                });
            }
        }
    }
    DrawHeadOptions() {
        if (this.ThOptions.innerHTML != "") return;
        if (this.Options != undefined && (this.Options.Search == true
            || this.Options.Add == true
            || this.Options.Filter == true)) {
            if (this.Options.Search == true) {
                this.ThOptions.append(WRender.Create({
                    tagName: "input", class: "txtControl", type: "text",
                    placeholder: "Buscar...",
                    onchange: async (/** @type {any} */ ev) => {
                        this.SearchFunction(ev);
                    }
                }));
            }
            if (this.Options.Filter == true) {
                this.ThOptions.append(this.FilterOptions)
            }
            if (this.Options.Add == true) {
                this.ThOptions.append(WRender.Create({
                    tagName: "button", class: "BtnTableSR",
                    type: "button", innerText: "Nuevo", style: "margin: 10px 0px; max-width: 300px",
                    onclick: async () => {
                        this.ModalCRUD();
                    }
                }))
            }
            if (this.Options.Print || this.Options.XlsExport || this.Options.PdfExport) {
                const printTool = new WPrintExportToolBar({
                    PrintAction: this.Options.Print ? (/**@type {WPrintExportToolBar} */ toolbar) => { toolbar.Print(this.GetFragmentNodeToExport()) } : undefined,
                    ExportXlsAction: this.Options.XlsExport ? (/**@type {WPrintExportToolBar} */ toolbar) => { } : undefined,
                    ExportPdfAction: this.Options.PdfExport ? (/**@type {WPrintExportToolBar} */ toolbar) => { } : undefined
                })
                this.ThOptions.append(printTool);
            }
            this.ThOptions.append(this.SelectedItemsContainer);

            return this.ThOptions;
        }
        return null;
    }
    GetFragmentNodeToExport() {
        return html`<div class="WTable">
            <link rel="stylesheet" href="/WDevCore/StyleModules/css/variables.css">
            ${WTableStyle.cloneNode(true)} 
            ${StylesControlsV2.cloneNode(true)}
            ${this.Table.cloneNode(true)}
        </div>`;
    }
    DrawTHead = (/** @type {any} */ element) => {
        const thead = WRender.Create({ tagName: "thead" });
        let tr = WRender.Create({ tagName: "tr" })

        for (const prop in this.ModelObject) {
            if (this.IsDrawableRow(element, prop)) {
                const { up, down } = this.CreateSortOptions(prop);
                const th = WRender.Create({
                    tagName: "th",
                    innerHTML: this.ModelObject[prop]?.label ?
                        WOrtograficValidation.es(this.ModelObject[prop]?.label) : WOrtograficValidation.es(prop),
                    children: [{ className: "sort-container", children: this.isSorteable(element, prop) ? [up, down] : [] }]
                });
                tr.append(th);
            }
        }
        if (this.Options != undefined) {
            if (this.TrueOptions()) {
                const th = WRender.Create({ tagName: "th", class: "tdAction", innerHTML: "Acciones" });
                tr.append(th);
                if (this.Config.Options?.MultiSelect == true) {
                    th.append(WRender.Create({
                        tagName: "input",
                        class: "Btn",
                        checked: this.isSelectAll,
                        type: "checkbox", onchange: (/** @type {any} */ ev) => { this.SelectAll(ev) }
                    }));
                }
            }
        }
        thead.append(tr);
        return thead;
    }
    /**
     * 
     * @param {Array<any>} [Dataset] 
     * @returns {Promise<HTMLElement>}
     */
    DrawTBody = async (Dataset = this.Dataset) => {
        //console.log(Dataset);
        this.Table?.querySelector("tbody")?.remove();
        let tbody = WRender.Create({ tagName: "tbody" });

        if (Dataset == undefined) {
            //Dataset = [{ Description: "No Data!!!" }];
        }
        Dataset?.slice((this.ActualPage - 1) * this.maxElementByPage, this.ActualPage * this.maxElementByPage)
            .forEach((element, DatasetIndex) => {
                if (element == undefined) {
                    return;
                }
                let tr = WRender.Create({ tagName: "tr" });
                this.DrawTRow(tr, element, DatasetIndex);
                tbody.append(tr);
            });

        if (tbody.children.length == 0) {
            tbody.append(WRender.Create({
                tagName: "h5", style: { padding: "20px" },
                innerText: "No hay elementos que mostrar"
            }));
        }
        this.shadowRoot?.append(WRender.createElement(this.MediaStyleResponsive()));
        this.Table.append(tbody)
        return tbody;
    }
    DrawTRow = async (/** @type {HTMLElement} */ tr, /** @type {any} */ element, /** @type {string | number} */ index) => {
        tr.innerHTML = "";
        for (const prop in this.ModelObject) {
            if (this.IsDrawableRow(element, prop)) {
                await this.EvalModelPrototype(this.ModelObject, prop, tr, element, index);
            }
        }
        if (this.TrueOptions()) {
            const Options = WRender.Create({ tagName: "td", class: "tdAction" });
            this.SelectBTN(element, Options, index, tr);
            this.ShowBTN(Options, element);
            this.EditBTN(Options, element, tr);
            this.DeleteBTN(Options, element, tr);
            if (this.Options?.UserActions != undefined) {
                this.Options.UserActions.forEach(Action => {
                    if (Action == null ||
                        (Action.rendered != undefined &&
                            // @ts-ignore
                            (Action.rendered == false || Action.rendered(element) == false))) {
                        //console.log();
                        return;
                    }
                    Options.append(WRender.Create({
                        tagName: "input",
                        className: "BtnTableSR",
                        type: "button",
                        value: Action.name,
                        onclick: async (/** @type {{ target: any; }} */ ev) => {
                            Action.action(element, ev.target);
                        }
                    }))
                });
            }
            tr.append(WRender.createElement(Options));
        }
    }
    SetOperationValues = (Model = this.Config.ModelObject, Dataset = this.Dataset) => {
        this.Dataset.forEach((target, index) => {
            for (const prop in Model) {
                if (Model[prop]?.__proto__ == Object.prototype) {
                    if (Model[prop].type?.toUpperCase() == "OPERATION") {
                        // target[prop] = Model[prop].action(target, this);
                        const control = this.shadowRoot?.querySelector("#td_" + prop + "_" + index);
                        if (control) {
                            control.innerHTML = Model[prop].action(target, this);
                        }
                    }
                }
            }
        });
    }

    /**
     * @param {string} prop
     */
    CreateSortOptions(prop) {
        const up = WRender.Create({
            tagName: 'input', type: 'button',
            className: 'sort-up ' + (this.Sorts.find(s => s.PropName == prop && s.OrderType == "ASC") ? "sort-active" : ""),
            onclick: async (/** @type {any} */ ev) => {
                await this.ExecuteSort(ev, prop, up, down, "ASC");
            }
        });
        const down = WRender.Create({
            tagName: 'input', type: 'button',
            className: 'sort-down ' + (this.Sorts.find(s => s.PropName == prop && s.OrderType == "DESC") ? "sort-active" : ""),
            onclick: async (/** @type {any} */ ev) => {
                await this.ExecuteSort(ev, prop, up, down, "DESC");
            }
        });
        return { up, down };
    }
    /**
     * @param {{ target: { checked: boolean; }; }} ev
     */
    SelectAll(ev) {
        if (ev.target.checked == true) {
            this.selectedItems = [];
            this.Dataset.forEach(element => {
                this.selectedItems.push(element);
            });
        } else {
            this.selectedItems = [];
        }
        this.DrawTBody();

    }

    /**
     * @param {{ target: { disabled: boolean; }; }} ev
     * @param {any} prop
     * @param {HTMLElement} up
     * @param {HTMLElement} down
     * @param {string} order
     */
    async ExecuteSort(ev, prop, up, down, order) {
        ev.target.disabled = true;
        const sort = new OrderData({ OrderType: order, PropName: prop });
        const findSort = this.Sorts.find(s => s.PropName == prop);
        if (this.Config.isActiveMultiSorts != true) {
            this.querySelectorAll(".sort-active").forEach(element => {
                element.classList.remove("sort-active");
            });
        }
        if (findSort) {
            if (findSort.OrderType == sort.OrderType) {
                this.Sorts.splice(this.Sorts.indexOf(findSort), 1);
                up.className = "sort-up";
                down.className = "sort-down";
            } else {
                findSort.OrderType = order;
                if (order == "ASC") {
                    up.className = "sort-up sort-active";
                    down.className = "sort-down";
                } else {
                    up.className = "sort-up";
                    down.className = "sort-down sort-active";
                }
            }
        } else {
            if (this.Config.isActiveMultiSorts == true) {
                this.Sorts.push(sort);
            } else {
                this.Sorts = [sort];
            }
            if (order == "ASC") {
                up.className = "sort-up sort-active";
                down.className = "sort-down";
            } else {
                up.className = "sort-up";
                down.className = "sort-down sort-active";
            }
        }
        await this.FilterOptions.filterFunction(this.Sorts);
        ev.target.disabled = false;
    }

    /**
     * @param {{ [x: string]: { __proto__: { constructor: { name: string; }; }; }; }} element
     * @param {string} prop
     */
    IsDrawableRow(element, prop) {
        if (this.Config.ModelObject == undefined
            && (typeof element[prop] == "number"
                || typeof element[prop] == "string"
                || typeof element[prop] == "boolean"
                || typeof element[prop] == "bigint")) {
            return true;
        }
        const hidden = typeof this.ModelObject[prop]?.hidden === "function" ? this.ModelObject[prop]?.hidden(element) : this.ModelObject[prop]?.hidden;
        if ((this.ModelObject[prop]?.type == undefined
            || this.ModelObject[prop]?.type.toUpperCase() == "MASTERDETAIL"
            || this.ModelObject[prop]?.type.toUpperCase() == "MULTISELECT"
            || this.ModelObject[prop]?.primary == true
            || hidden
            || this.ModelObject[prop]?.hiddenInTable == true)
            || element[prop]?.__proto__ == Function.prototype
            || element[prop]?.__proto__.constructor.name == "AsyncFunction") {
            return false;
        }
        return true;
    }

    /**
     * @param {{ [x: string]: { action: (arg0: any) => string | Node; }; } | undefined} Model
     * @param {string} prop
     * @param {{ append: (arg0: HTMLElement) => void; }} tr
     * @param {{ [x: string]: any; }} element
     * @param {string} index
     */
    async EvalModelPrototype(Model, prop, tr, element, index) {
        let value = element[prop] != null && element[prop] != undefined ? element[prop] : "";
        let td = WRender.Create({ tagName: "td", id: "td_" + prop + "_" + index, class: "td_" + prop });
        if (Model != undefined && Model[prop] != undefined && Model[prop].__proto__ == Object.prototype && Model[prop].type) {
            /**@type {ModelProperty} */
            const modelProperty = Model[prop];
            switch (Model[prop].type.toUpperCase()) {
                case "IMAGE": case "IMAGES": case "IMG": case "IMAGECAPTURE":
                    td.append(ControlBuilder.BuildImage(value, this.Config?.ImageUrlPath));
                    tr.append(td);
                    break;
                case "SELECT": case "RADIO":
                    if (Model[prop].ModelObject?.__proto__ == Function.prototype) {
                        Model[prop].ModelObject = Model[prop].ModelObject();
                        Model[prop].Dataset = await Model[prop].ModelObject.Get();
                    }
                    const findElement = Model[prop].Dataset?.find((/** @type {{ __proto__: Object; id: any; }} */ e) => {
                        let flag = false;
                        if (e == value) { flag = true; }
                        else if (e.__proto__ == Object.prototype && e.id == value) { flag = true; }
                        return flag;
                    });
                    value = findElement && findElement.__proto__ == Object.prototype
                        ? (findElement.desc ?? findElement.Descripcion ?? findElement.descripcion) : findElement;
                    td.append(value ?? "");
                    tr.append(td);
                    break;
                case "MULTISELECT":
                    // if (Model[prop].ModelObject?.__proto__ == Function.prototype) {
                    //     Model[prop].ModelObject = Model[prop].ModelObject();
                    //     Model[prop].Dataset = await Model[prop].ModelObject.Get();
                    // }
                    // tr.append(WRender.Create({
                    //     tagName: "td", className: "tdAcordeon", innerHTML:
                    //         //"<label class='LabelTd'>" + element[prop].length + " Elementos: </label>" +
                    //         `${element[prop].map(object => {
                    //             const FObject = Model[prop].Dataset?.find(i => WArrayF.compareObj(object, i));
                    //             const label = FObject?.Descripcion ?? FObject?.descripcion ?? FObject?.Correo_institucional ?? FObject;
                    //             return `<label class="SelectedItemsContainer">${label}</label>`;
                    //         }).join('')}`
                    // }));
                    break;
                case "COLOR":
                    if (modelProperty.IsEditableInGrid) {
                        td.append(await ModelPropertyFormBuilder.CreateInput(modelProperty, element, prop, (ev) => { this.OnChangeAction(ev, element, prop, Model) }));
                        td.classList.add("inputContainer")
                    } else {
                        td.append(WRender.Create({
                            style: {
                                background: (value == "" ? "#000" : value), width: "30px", height: "30px",
                                borderRadius: "50%", boxShadow: "0 0 3px 0 #888", margin: "auto"
                            }
                        }))
                    }
                    tr.append(td);
                    break;
                case "MODEL": case "WSELECT":
                    tr.append(WRender.Create({
                        tagName: "td", className: "cardTable", children: [
                            new WCard(WArrayF.replacer(element[prop]), Model[prop].ModelObject, this.Config)
                        ]
                    }));
                    break;
                case "CALENDAR":
                    const label = `${element[prop]?.map((/** @type {{ Fecha_Inicio: { toDateFormatEs: () => string; }; Fecha_Final: { toDateFormatEs: () => string; }; }} */ object) => {
                        const label = object?.Fecha_Inicio.toDateFormatEs() + " al " + object?.Fecha_Final.toDateFormatEs();
                        return `<label class="SelectedItemsContainer">${label}</label>`;
                    }).join('')}`
                    tr.append(WRender.Create({
                        tagName: "td", className: "tdAcordeon", innerHTML: label == "undefined" ? "" : label
                    }));
                    break;
                case "MASTERDETAIL":
                    break;
                case "DATETIME":
                    if (modelProperty.IsEditableInGrid) {
                        td.append(await ModelPropertyFormBuilder.CreateInput(modelProperty, element, prop, (ev) => { this.OnChangeAction(ev, element, prop, Model) }));
                        td.classList.add("inputContainer")

                    } else {
                        td.append(value ? new DateTime(value).formatDateTimeToDDMMYYHHMM(value) : "");
                    }
                    tr.append(td);
                    break;
                case "DATE": case "FECHA":
                    if (modelProperty.IsEditableInGrid) {
                        td.append(await ModelPropertyFormBuilder.CreateInput(modelProperty, element, prop, (ev) => { this.OnChangeAction(ev, element, prop, Model) }));
                        td.classList.add("inputContainer")
                    } else {
                        //td.append(value?.toString()?.toDateFormatEs());
                        td.append(value ? new DateTime(value).formatDateToDDMMYY(value) : "")
                    }
                    tr.append(td);
                    break;
                case "OPERATION":
                    td.append(Model[prop].action(element));
                    tr.append(td);
                    break;
                case "MONEY":
                    if (modelProperty.IsEditableInGrid) {
                        td.append(await ModelPropertyFormBuilder.CreateInput(modelProperty, element, prop, (ev) => { this.OnChangeAction(ev, element, prop, Model) }));
                        td.classList.add("inputContainer")
                    } else {
                        td.append(WRender.Create({
                            tagName: "label", htmlFor: "select" + index,
                            style: this.Options?.Select ? "cursor: pointer" : "",
                            innerHTML: value == "" ? "-" : `${this.GetMoney()} ${((value != undefined) && (value != null) ? ConvertToMoneyString(value) : 0)}`
                        }));
                    }
                    tr.append(td);
                    break;
                case "NUMBER":
                    if (modelProperty.IsEditableInGrid) {
                        td.append(await ModelPropertyFormBuilder.CreateInput(modelProperty, element, prop, (ev) => { this.OnChangeAction(ev, element, prop, Model) }));
                        td.classList.add("inputContainer")
                    } else {
                        td.append(WRender.Create({
                            tagName: "label", htmlFor: "select" + index,
                            style: this.Options?.Select ? "cursor: pointer" : "",
                            //innerHTML: value == "" ? "-" : `${((value != undefined) && (value != null) ? parseFloat(value.toString()) : 0)}`
                            innerHTML: value == "" ? "-" : `${((value != undefined) && (value != null) ? value.toString() : 0)}`
                        }));
                    }
                    tr.append(td);
                    break;
                default:
                    if (modelProperty.IsEditableInGrid) {
                        td.append(await ModelPropertyFormBuilder.CreateInput(modelProperty, element, prop, (ev) => { this.OnChangeAction(ev, element, prop, Model) }));
                        td.classList.add("inputContainer")
                    } else {
                        td.append(WRender.Create({
                            tagName: "p", htmlFor: "select" + index,
                            style: this.Options?.Select ? "cursor: pointer" : "",
                            innerHTML: value == "" ? "-" : WOrtograficValidation.es(value)
                        }));
                    }
                    tr.append(td);
                    break;
            }
        } else {
            td.innerHTML = value;
            tr.append(td)
        }
    }
    OnChangeAction = async (/** @type {Event} */ ev, /** @type {{ [x: string]: any; }} */ ObjectF, /** @type {string} */ prop, /** @type {{ [x: string]: any; }} */ Model) => {
        //console.log(ev);
        /**
         * @type {HTMLInputElement}
         */
        const targetControl = ev?.target
        /**
        * @type {HTMLInputElement}
        */
        const currentTarget = ev?.currentTarget

        await ModelPropertyFormBuilder.OnChange(targetControl, currentTarget, ObjectF, prop, Model);
        this.SaveAction(undefined, ObjectF)
    }

    DeleteBTN = async (/** @type {HTMLElement} */ Options, /** @type {{ [x: string]: any; } | undefined} */ element, /** @type {any} */ tr) => {
        if (this.Options?.Delete != undefined
            && this.Options.Delete == true && element.isRemovable != false) {
            Options.append(WRender.Create({
                tagName: "button",
                children: [{ tagName: 'img', class: "icon", src: WIcons["delete"] }],
                class: "BtnTableA",
                type: "button",
                onclick: async () => {
                    const { ModalVericateAction } = await import("./ModalVericateAction.js");
                    this.shadowRoot?.append(ModalVericateAction(() => {
                        const index = this.Dataset.indexOf(element);
                        if (WArrayF.FindInArray(element, this.Dataset) == true) {
                            this.Dataset.splice(index, 1);
                            //console.log(this.Dataset);
                            //tr.parentNode.removeChild(tr);                                                  
                            if (this.Options?.DeleteAction) {
                                this.Options?.DeleteAction(element, this)
                            }
                            if (this.Options?.UrlDelete) {
                                WAjaxTools.PostRequest(this.Options?.UrlDelete, element);
                            } else if (element.Delete && this.Config.AutoSave) {
                                element.Delete();
                            }
                            this.DrawTable();
                        } else { console.log("No Object"); }
                    }, "¿Esta seguro de eliminar este elemento?"));
                }
            }));
        }
    }

    GetMoney() {
        if (!this.TypeMoney) {
            return "";
        }
        return Money[this.TypeMoney];
    }

    /**
     * @param {HTMLElement} Options
     * @param {{ isEditable: boolean; }} element
     * @param {any} tr
     */
    EditBTN(Options, element, tr) {
        if (this.Options?.Edit != undefined
            && this.Options.Edit == true && element.isEditable != false) {
            Options.append(WRender.Create({
                tagName: "button",
                children: [{ tagName: 'img', class: "icon", src: WIcons["edit"] }],
                class: "BtnTableS",
                type: "button",
                onclick: async () => { this.ModalCRUD(element, tr); }
            }));
        }
    }

    /**
     * @param {HTMLElement} Options
     * @param {any} element
     */
    ShowBTN(Options, element) {
        if (this.Options?.Show != undefined && this.Options.Show == true) {
            Options.append(WRender.Create({
                tagName: "button",
                children: [{ tagName: 'img', class: "icon", src: WIcons["show2"] }],
                class: "BtnTable",
                type: "button",
                onclick: async () => {
                    const { WModalForm } = await import("./WModalForm.js");
                    const { WDetailObject } = await import("./WDetailObject.js");
                    this.shadowRoot?.append(new WModalForm({
                        icon: this.Config.icon,
                        ImageUrlPath: this.Config.ImageUrlPath,
                        title: "Detalle",
                        ObjectModal: new WDetailObject({ ObjectDetail: element, ModelObject: this.ModelObject }),
                    }));
                }
            }));
        }
    }

    /**
     * @param {any} element
     * @param {HTMLElement} Options
     * @param {string} index
     * @param {{ querySelectorAll: (arg0: string) => any[]; }} tr
     */
    SelectBTN(element, Options, index, tr) {
        if ((this.Options?.Select != undefined && this.Options.Select == true)
            || (this.Options?.MultiSelect != undefined && this.Options.MultiSelect == true)) {
            let Checked = WArrayF.FindInArray(element, this.selectedItems);
            const input = WRender.Create({
                tagName: "input",
                class: "Btn",
                id: "select" + index,
                type: this.Options.MultiSelect ? "checkbox" : "radio",
                innerText: "Select",
                name: "selectGrup",
                checked: Checked,
                onchange: async () => {
                    /**@type {HTMLInputElement} */
                    // @ts-ignore
                    const control = input;
                    const index = this.selectedItems.indexOf(element);
                    if (index == -1 && control.checked == true) {
                        if (WArrayF.FindInArray(element, this.selectedItems) == false) {
                            if (control.type == "radio") {
                                this.selectedItems = [];
                            }
                            this.selectedItems.push(element);
                            if (!this.Dataset.includes(element)) {
                                this.Dataset.push(element);
                            }
                        } else {
                            console.log("Item Existente");
                        }
                    } else {
                        this.selectedItems.splice(index, 1);
                    }
                    if (this.Options?.SelectAction != undefined) {
                        this.Options.SelectAction(element, this);
                    }
                    this.DrawLabel();
                }
            })
            tr.querySelectorAll("label").forEach(label => {
                label.htmlFor = "select" + index;
            });
            Options.append(input);
        }
    }
    /**
     * @param {undefined} [element]
     * @param {undefined} [tr]
     */
    async ModalCRUD(element, tr) {
        const { WModalForm } = await import("./WModalForm.js");
        this.shadowRoot?.append(
            new WModalForm({
                ModelObject: this.ModelObject,
                EntityModel: this.Config.EntityModel,
                AutoSave: this.Config.UseEntityMethods ?? this.Config.AutoSave ?? false,
                ParentModel: this.Config.ParentModel,
                ParentEntity: this.Config.ParentEntity,
                WSelectAddObject: this.Config.WSelectAddObject,
                EditObject: element,
                icon: this.Config.icon,
                ImageUrlPath: this.Config.ImageUrlPath,
                title: element ? "Editar" : "Nuevo",
                ValidateFunction: this.Config.ValidateFunction,
                ObjectOptions: {
                    Url: element ? this.Options?.UrlUpdate : this.Options?.UrlAdd,
                    AddObject: element ? false : true,
                    SaveFunction: (/** @type {any} */ NewObject) => { this.SaveAction(NewObject, element) }
                }
            }));
    }
    SaveAction = async (/** @type {undefined} */ NewObject, /** @type {undefined} */ element) => {
        if (NewObject != undefined && element == undefined) {
            this.Dataset.push(NewObject);
            if (this.Options?.AddAction != undefined) {
                const bool = this.Options.AddAction(NewObject, this);
                if (bool == false) {
                    this.Dataset.splice(this.Dataset.indexOf(NewObject), 1);
                }
            }
            this.DrawTable();
        } else {
            //this.DrawTRow(tr, element);
            if (this.Options?.EditAction != undefined) {
                this.Options.EditAction(element, this);
            }
            this.DrawTable();
        }
    }
    SearchFunction = async (/** @type {{ target: { value: string | number; }; }} */ ev) => {
        if (this.SearchItemsFromApi != undefined) {
            if (this.SearchItemsFromApi.action != undefined) {
                const Dataset = await this.SearchItemsFromApi.action(ev.target.value);
                this.DrawTable(Dataset);
            } else {
                const Dataset = await WAjaxTools.PostRequest(
                    // @ts-ignore
                    this.SearchItemsFromApi.ApiUrl, { Param: ev.target.value }
                );
                this.DrawTable(Dataset.data);
            }
        } else if (this.EntityModel?.Get != undefined || this.ModelObject?.Get != undefined) {
            /**
            * @type {Array<FilterData>}
            */
            const filterData = []
            for (const prop in this.ModelObject) {
                if ((this.ModelObject[prop]?.type?.toUpperCase() == "TEXT")
                    && ev.target.value.replaceAll(" ", "") != "") {
                    // @ts-ignore
                    filterData.push({ PropName: prop, FilterType: "like", Values: [ev.target.value] })
                } else if ((this.ModelObject[prop]?.type?.toUpperCase() == "NUMBER" && !isNaN(ev.target.value))
                    && ev.target.value.replaceAll(" ", "") != "") {
                    // @ts-ignore
                    filterData.push({ PropName: prop, FilterType: "=", Values: [ev.target.value] })
                }
            }
            if (this.EntityModel?.Get != undefined) {
                // @ts-ignore
                const responseDataset = await new this.EntityModel.constructor({ FilterData: [{ FilterType: "or", Filters: filterData }] }).Get();
                this.DrawTable(responseDataset);
            } else {
                // @ts-ignore
                const responseDataset = await new this.ModelObject.constructor({ FilterData: [{ FilterType: "or", Filters: filterData }] }).Get();
                this.DrawTable(responseDataset);
            }


        } else {
            const Dataset = await WArrayF.FilterInArrayByValue(this.Dataset, ev.target.value)
            if (Dataset.length == 0 && this.Options?.UrlSearch != undefined) {
                const DataUrlSearch = await WAjaxTools.PostRequest(
                    this.Options.UrlSearch, { Param: ev.target.value }
                );
                this.DrawTable(DataUrlSearch);
                return;
            }
            this.DrawTable(Dataset);
        }
    }
    TrueOptions() {

        return this.Options?.MultiSelect == true ||
            this.Options?.Select == true ||
            this.Options?.Show == true ||
            this.Options?.Edit == true ||
            this.Options?.Delete == true ||
            // @ts-ignore
            (this.Options?.UserActions?.__proto__ == Array.prototype
                && this.Options?.UserActions?.length > 0);
    }

    /**
     * @param {{ [x: string]: { __proto__: { constructor: { name: string; }; }; }; }} element
     * @param {string} prop
     */
    isSorteable(element, prop) {
        if (this.Config?.isActiveSorts == false) {
            return false;
        }
        if ((this.ModelObject[prop]?.type == undefined
            || this.ModelObject[prop]?.type.toUpperCase() == "MASTERDETAIL"
            || this.ModelObject[prop]?.type.toUpperCase() == "MULTISELECT"
            || this.ModelObject[prop]?.type.toUpperCase() == "MODEL"
            || this.ModelObject[prop]?.type.toUpperCase() == "IMG"
            || this.ModelObject[prop]?.type.toUpperCase() == "IMAGE"
            || this.ModelObject[prop]?.hiddenInTable == true)
            || element[prop]?.__proto__ == Function.prototype
            || element[prop]?.__proto__.constructor.name == "AsyncFunction") {
            return false;
        }
        return true;
    }

    /**
     * 
     * @param {Array<any>} Dataset 
     * @returns {Array<HTMLElement>}
     */
    DrawTFooter(Dataset) {
        this.numPage = (Dataset.length / this.maxElementByPage) >= 1 ? Math.round(Dataset.length / this.maxElementByPage) : 1;
        let tfooter = [];
        /**
         * @type {HTMLElement[]}
         */
        const buttons = [];
        const SelectPage = async (/** @type {number} */ index) => {
            this.ActualPage = index;
            buttons.forEach((button, indexBtn) => {
                if (indexBtn + 1 == index) {
                    button.className = "paginateBTN paginateBTNActive";
                } else if (index > 8 && indexBtn < (index - 7)) {
                    button.className = "paginateBTN paginateBTNHidden";
                } else {
                    button.className = "paginateBTN";
                }
            });
            this.Table?.querySelector("tbody")?.remove();
            const tbody = await this.DrawTBody(Dataset);
            this.Table.append(tbody);
        }
        tfooter.push(WRender.Create({
            tagName: "label", innerText: "<<",
            class: "pagBTN",
            onclick: () => {
                this.ActualPage = 1;
                SelectPage(this.ActualPage);
            }
        }));
        tfooter.push(WRender.Create({
            tagName: "label", innerText: "<",
            class: "pagBTN",
            onclick: () => {
                this.ActualPage = this.ActualPage - 1;
                if (this.ActualPage <= 0) {
                    this.ActualPage = this.numPage;
                }
                SelectPage(this.ActualPage);
            }
        }));
        const tfooterNumbers = WRender.Create({ class: 'tfooterNumbers' })
        for (let index = 0; index < this.numPage; index++) {
            let btnClass = "paginateBTN";
            if (index == 0) {
                btnClass = "paginateBTN paginateBTNActive";
            } else if ((index) > 20) {
                btnClass = "paginateBTN paginateBTNHidden";
            } else {
                btnClass = "paginateBTN";
            }
            const button = WRender.Create({
                type: "a", id: "footBtn" + (index + 1),
                innerText: (index + 1).toString(), class: btnClass,
                onclick: () => SelectPage(index + 1)
            })
            tfooterNumbers.append(button);
            buttons.push(button);
        }
        tfooter.push(tfooterNumbers);
        tfooter.push(WRender.Create({
            tagName: "label", innerText: ">", class: "pagBTN",
            onclick: () => {
                this.ActualPage = this.ActualPage + 1;
                if (this.ActualPage > this.numPage) {
                    this.ActualPage = 1;
                }
                SelectPage(this.ActualPage);
            }
        }));
        tfooter.push(WRender.Create({
            tagName: "label", innerText: ">>", class: "pagBTN",
            onclick: () => {
                this.ActualPage = this.numPage;
                SelectPage(this.ActualPage);
            }
        }));
        return tfooter;
    }
    //#endregion fin tabla basica
    //#region ESTILOS-------------------------------------------------------------------------------------------
    MediaStyleResponsive() {
        const ClassList = [];
        let index = 1;
        for (const prop in this.ModelObject) {
            const flag = WArrayF.checkDisplay([], prop);
            if (flag) {
                if (!prop.includes("Photo") &&
                    !prop.includes("img") &&
                    !prop.includes("image") &&
                    !prop.includes("Image") &&
                    !prop.includes("Pict") &&
                    !prop.includes("_hidden")) {
                    ClassList.push(new WCssClass(`td:nth-of-type(${index}):before`, {
                        content: `"${prop}:"`,
                        "margin-right": "10px"
                    }))
                }
                index++;
            }
        }
        return new WStyledRender({
            MediaQuery: [{
                condicion: "(max-width: 600px)",
                ClassList: ClassList
            }]
        })
    }
    DrawLabel = () => {
        // @ts-ignore
        this.SelectedItemsContainer.querySelector(".selecteds").innerHTML = "";
        // @ts-ignore
        let sum = 0;
        let add = 0;
        let labelsWidth = 0;
        this.selectedItems.forEach((element, index) => {
            if (!this.Options?.Select == true) {
                // @ts-ignore
                this.SelectedItemsContainer.querySelector(".selecteds").innerHTML = "";
            }
            const LabelM = new WCard(element, this.ModelObject, this.Config);
            console.log(LabelM);
            const selectedsContainer = this.SelectedItemsContainer.querySelector(".selecteds");
            if (sum == 0) {
                selectedsContainer?.append(LabelM);
                labelsWidth = labelsWidth + LabelM.offsetWidth;
                add++;
            }
            //console.log(labelsWidth + 100);
            // @ts-ignore
            if (selectedsContainer?.offsetWidth <= labelsWidth + 100) {
                selectedsContainer?.append(LabelM);
                labelsWidth = labelsWidth + LabelM.offsetWidth;
                sum++;
            }
            //console.log(selectedsContainer.offsetWidth, labelsWidth);

        });
        if (this.selectedItems.length - add > 0) {
            this.SelectedItemsContainer.querySelector(".selecteds")?.append(WRender.Create({
                tagName: "label",
                innerText: "+" + (this.selectedItems.length - add).toString()
            }))
        }
        //console.log(this.SelectedItemsContainer, this.selectedItems);

    }


    //#endregion FIN ESTILOS-----------------------------------------------------------------------------------
}
const WIcons = {
    UpRow: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgMjU2IDI1NiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjU2IDI1NjsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8Zz4KCTxnPgoJCTxwb2x5Z29uIHBvaW50cz0iMTI4LDQ4LjkwNyAwLDE3Ni45MDcgMzAuMTg3LDIwNy4wOTMgMTI4LDEwOS4yOCAyMjUuODEzLDIwNy4wOTMgMjU2LDE3Ni45MDcgCQkiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K",
    DownRow: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgMjU2IDI1NiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjU2IDI1NjsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8Zz4KCTxnPgoJCTxwb2x5Z29uIHBvaW50cz0iMjI1LjgxMyw0OC45MDcgMTI4LDE0Ni43MiAzMC4xODcsNDguOTA3IDAsNzkuMDkzIDEyOCwyMDcuMDkzIDI1Niw3OS4wOTMgCQkiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K",
    show2: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgNDg4Ljg1IDQ4OC44NSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDg4Ljg1IDQ4OC44NTsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8Zz4KCTxwYXRoIGQ9Ik0yNDQuNDI1LDk4LjcyNWMtOTMuNCwwLTE3OC4xLDUxLjEtMjQwLjYsMTM0LjFjLTUuMSw2LjgtNS4xLDE2LjMsMCwyMy4xYzYyLjUsODMuMSwxNDcuMiwxMzQuMiwyNDAuNiwxMzQuMgoJCXMxNzguMS01MS4xLDI0MC42LTEzNC4xYzUuMS02LjgsNS4xLTE2LjMsMC0yMy4xQzQyMi41MjUsMTQ5LjgyNSwzMzcuODI1LDk4LjcyNSwyNDQuNDI1LDk4LjcyNXogTTI1MS4xMjUsMzQ3LjAyNQoJCWMtNjIsMy45LTExMy4yLTQ3LjItMTA5LjMtMTA5LjNjMy4yLTUxLjIsNDQuNy05Mi43LDk1LjktOTUuOWM2Mi0zLjksMTEzLjIsNDcuMiwxMDkuMywxMDkuMwoJCUMzNDMuNzI1LDMwMi4yMjUsMzAyLjIyNSwzNDMuNzI1LDI1MS4xMjUsMzQ3LjAyNXogTTI0OC4wMjUsMjk5LjYyNWMtMzMuNCwyLjEtNjEtMjUuNC01OC44LTU4LjhjMS43LTI3LjYsMjQuMS00OS45LDUxLjctNTEuNwoJCWMzMy40LTIuMSw2MSwyNS40LDU4LjgsNTguOEMyOTcuOTI1LDI3NS42MjUsMjc1LjUyNSwyOTcuOTI1LDI0OC4wMjUsMjk5LjYyNXoiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K",
    delete: "data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgNTEyIDUxMiIgaGVpZ2h0PSI1MTIiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiB3aWR0aD0iNTEyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxnPjxwYXRoIGQ9Im00MjQgNjRoLTg4di0xNmMwLTI2LjQ2Ny0yMS41MzMtNDgtNDgtNDhoLTY0Yy0yNi40NjcgMC00OCAyMS41MzMtNDggNDh2MTZoLTg4Yy0yMi4wNTYgMC00MCAxNy45NDQtNDAgNDB2NTZjMCA4LjgzNiA3LjE2NCAxNiAxNiAxNmg4Ljc0NGwxMy44MjMgMjkwLjI4M2MxLjIyMSAyNS42MzYgMjIuMjgxIDQ1LjcxNyA0Ny45NDUgNDUuNzE3aDI0Mi45NzZjMjUuNjY1IDAgNDYuNzI1LTIwLjA4MSA0Ny45NDUtNDUuNzE3bDEzLjgyMy0yOTAuMjgzaDguNzQ0YzguODM2IDAgMTYtNy4xNjQgMTYtMTZ2LTU2YzAtMjIuMDU2LTE3Ljk0NC00MC00MC00MHptLTIxNi0xNmMwLTguODIyIDcuMTc4LTE2IDE2LTE2aDY0YzguODIyIDAgMTYgNy4xNzggMTYgMTZ2MTZoLTk2em0tMTI4IDU2YzAtNC40MTEgMy41ODktOCA4LThoMzM2YzQuNDExIDAgOCAzLjU4OSA4IDh2NDBjLTQuOTMxIDAtMzMxLjU2NyAwLTM1MiAwem0zMTMuNDY5IDM2MC43NjFjLS40MDcgOC41NDUtNy40MjcgMTUuMjM5LTE1Ljk4MSAxNS4yMzloLTI0Mi45NzZjLTguNTU1IDAtMTUuNTc1LTYuNjk0LTE1Ljk4MS0xNS4yMzlsLTEzLjc1MS0yODguNzYxaDMwMi40NHoiLz48cGF0aCBkPSJtMjU2IDQ0OGM4LjgzNiAwIDE2LTcuMTY0IDE2LTE2di0yMDhjMC04LjgzNi03LjE2NC0xNi0xNi0xNnMtMTYgNy4xNjQtMTYgMTZ2MjA4YzAgOC44MzYgNy4xNjMgMTYgMTYgMTZ6Ii8+PHBhdGggZD0ibTMzNiA0NDhjOC44MzYgMCAxNi03LjE2NCAxNi0xNnYtMjA4YzAtOC44MzYtNy4xNjQtMTYtMTYtMTZzLTE2IDcuMTY0LTE2IDE2djIwOGMwIDguODM2IDcuMTYzIDE2IDE2IDE2eiIvPjxwYXRoIGQ9Im0xNzYgNDQ4YzguODM2IDAgMTYtNy4xNjQgMTYtMTZ2LTIwOGMwLTguODM2LTcuMTY0LTE2LTE2LTE2cy0xNiA3LjE2NC0xNiAxNnYyMDhjMCA4LjgzNiA3LjE2MyAxNiAxNiAxNnoiLz48L2c+PC9zdmc+",
    edit: "data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjUxMnB0IiB2aWV3Qm94PSIwIDAgNTEyIDUxMSIgd2lkdGg9IjUxMnB0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Im00MDUuMzMyMDMxIDI1Ni40ODQzNzVjLTExLjc5Njg3NSAwLTIxLjMzMjAzMSA5LjU1ODU5NC0yMS4zMzIwMzEgMjEuMzMyMDMxdjE3MC42Njc5NjljMCAxMS43NTM5MDYtOS41NTg1OTQgMjEuMzMyMDMxLTIxLjMzMjAzMSAyMS4zMzIwMzFoLTI5OC42Njc5NjljLTExLjc3NzM0NCAwLTIxLjMzMjAzMS05LjU3ODEyNS0yMS4zMzIwMzEtMjEuMzMyMDMxdi0yOTguNjY3OTY5YzAtMTEuNzUzOTA2IDkuNTU0Njg3LTIxLjMzMjAzMSAyMS4zMzIwMzEtMjEuMzMyMDMxaDE3MC42Njc5NjljMTEuNzk2ODc1IDAgMjEuMzMyMDMxLTkuNTU4NTk0IDIxLjMzMjAzMS0yMS4zMzIwMzEgMC0xMS43NzczNDQtOS41MzUxNTYtMjEuMzM1OTM4LTIxLjMzMjAzMS0yMS4zMzU5MzhoLTE3MC42Njc5NjljLTM1LjI4NTE1NiAwLTY0IDI4LjcxNDg0NC02NCA2NHYyOTguNjY3OTY5YzAgMzUuMjg1MTU2IDI4LjcxNDg0NCA2NCA2NCA2NGgyOTguNjY3OTY5YzM1LjI4NTE1NiAwIDY0LTI4LjcxNDg0NCA2NC02NHYtMTcwLjY2Nzk2OWMwLTExLjc5Njg3NS05LjUzOTA2My0yMS4zMzIwMzEtMjEuMzM1OTM4LTIxLjMzMjAzMXptMCAwIi8+PHBhdGggZD0ibTIwMC4wMTk1MzEgMjM3LjA1MDc4MWMtMS40OTIxODcgMS40OTIxODgtMi40OTYwOTMgMy4zOTA2MjUtMi45MjE4NzUgNS40Mzc1bC0xNS4wODIwMzEgNzUuNDM3NWMtLjcwMzEyNSAzLjQ5NjA5NC40MDYyNSA3LjEwMTU2MyAyLjkyMTg3NSA5LjY0MDYyNSAyLjAyNzM0NCAyLjAyNzM0NCA0Ljc1NzgxMiAzLjExMzI4MiA3LjU1NDY4OCAzLjExMzI4Mi42Nzk2ODcgMCAxLjM4NjcxOC0uMDYyNSAyLjA4OTg0My0uMjEwOTM4bDc1LjQxNDA2My0xNS4wODIwMzFjMi4wODk4NDQtLjQyOTY4OCAzLjk4ODI4MS0xLjQyOTY4OCA1LjQ2MDkzNy0yLjkyNTc4MWwxNjguNzg5MDYzLTE2OC43ODkwNjMtNzUuNDE0MDYzLTc1LjQxMDE1NnptMCAwIi8+PHBhdGggZD0ibTQ5Ni4zODI4MTIgMTYuMTAxNTYyYy0yMC43OTY4NzQtMjAuODAwNzgxLTU0LjYzMjgxMi0yMC44MDA3ODEtNzUuNDE0MDYyIDBsLTI5LjUyMzQzOCAyOS41MjM0MzggNzUuNDE0MDYzIDc1LjQxNDA2MiAyOS41MjM0MzctMjkuNTI3MzQzYzEwLjA3MDMxMy0xMC4wNDY4NzUgMTUuNjE3MTg4LTIzLjQ0NTMxMyAxNS42MTcxODgtMzcuNjk1MzEzcy01LjU0Njg3NS0yNy42NDg0MzctMTUuNjE3MTg4LTM3LjcxNDg0NHptMCAwIi8+PC9zdmc+"
}
const Money = { Euro: "€", Dollar: "$", Cordoba: "C$" }
customElements.define("w-table-basic", WTableComponent);
export { WTableComponent };
