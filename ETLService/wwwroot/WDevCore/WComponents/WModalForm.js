import { WRender, ComponentsManager, html } from "../WModules/WComponentsTools.js";
import { WCssClass } from "../WModules/WStyledRender.js";
import { StyleScrolls, StylesControlsV2 } from "../StyleModules/WStyleComponents.js";
import { ModalConfig } from "../WModules/CommonModel.js";
import { WModalStyle } from "./ComponentsStyles/WModalStyle.mjs";
import { WArrayF } from "../WModules/WArrayF.js";


class WModalForm extends HTMLElement {
    /**
     * 
     * @param {ModalConfig} Config 
     */
    constructor(Config) {
        super();
        this.ShadowRoot = true;
        this.DataRequire = true;
        this.Config = Config;
        //console.log(this.Config);
        for (const p in Config) {
            this[p] = Config[p];
        }
        this.DivColumns = this.Config.DivColumns;
        this.StyleForm = this.Config.DivColumns == "FullScreen" ? this.WidthContainer = "90%" : this.WidthContainer = "60%"
        /*if (this.StyleForm == "columnX1") {
            this.WidthContainer = "40%";
            this.Config.DivColumns = "calc(100%)";
        } else if (this.StyleForm == "columnX3") {
            this.WidthContainer = "70%";
            this.Config.DivColumns = "calc(30%) calc(30%) calc(30%)";
        } else if (this.StyleForm == "FullScreen") {
            this.WidthContainer = "95%";
            this.Config.DivColumns = "calc(30%) calc(30%) calc(30%)";
        } else {
            this.WidthContainer = "70%";
            this.Config.DivColumns = "calc(50% - 10px) calc(50% - 10px)";
        }*/
    }
    attributeChangedCallBack() {
        this.DrawSlide();
    }
    connectedCallback() {
        if (this.innerHTML != "") {
            return;
        } //NO MODAL
        if (this.ShadowRoot) {
            this.attachShadow({ mode: "open" });
            this.shadowRoot.append(StyleScrolls.cloneNode(true));
            this.shadowRoot.append(StylesControlsV2.cloneNode(true));
            this.shadowRoot.append(WRender.createElement(this.FormStyle()));
        } else {
            this.append(WRender.createElement(this.FormStyle()));
        }
        if (this.Config.CustomStyle) {
			this.shadowRoot?.append(this.Config.CustomStyle);
		}
        //NO MODAL
        this.append(StyleScrolls.cloneNode(true));
        this.append(WRender.createElement({
            type: "w-style",
            props: {
                ClassList: [
                    new WCssClass(".ModalContentWModal", {
                        "opacity": "0",
                        "background-color": "rgba(0, 0, 0, 0.5) !important",
                        "width": "100%",
                        "position": "fixed !important",
                        "top": "0px !important",
                        "left": "0px !important",
                        "bottom": "0px !important",
                        "transition": "all 0.3s",
                        "box-shadow": "0 0px 1px 0px #000",
                        "z-index": "20000 !important",
                        "overflow-y": "auto",
                        "padding-bottom": this.StyleForm == "FullScreen" ? 0 : 50
                    })
                ], MediaQuery: [{
                    condicion: "(max-width: 800px)",
                    ClassList: [
                        new WCssClass(".ModalContentWModal", {
                            "padding-bottom": "0px",
                        }),
                    ]
                }]
            }
        }))
        this.DrawComponent();
    }
    checkDisplay(prop) {
        let flag = true
        if (this.DisplayData != undefined &&
            this.DisplayData.__proto__ == Array.prototype) {
            const findProp = this.DisplayData.find(x => x == prop);
            if (!findProp) {
                flag = false;
            }
        }
        return flag;
    }
    DrawComponent = async () => {
        this.DarkMode = this.DarkMode ?? false;
        if (this.id == undefined || this.id == "") {
            this.id = "TempModal";
        }
        this.className = "ModalContentWModal";
        this.Modal = {
            class: "ContainerFormWModal",
            style: {
                gridTemplateColumns: this.DivColumns,
                width: this.WidthContainer,
                textAling: "center"
            },
            children: []
        };
        this.Modal.children.push(this.DrawModalHead());
        if (this.ObjectModal) { //AGREGA UN OBJETO AL MODAL ENVIDO DESDE LA CONFIGURACION
            const modalOb = this.ObjectModal.tagName ? WRender.Create(this.ObjectModal) : WRender.createElement(this.ObjectModal)
            this.Modal.children.push({ class: "ObjectModalContainer", children: [modalOb] });
        } else if (this.ObjectDetail || this.ModelObject || this.EditObject) { // MUESTRA EL DETALLE DE UN OBJETO EN UNA LISTA
            const { WForm } = await import("./WForm.js");
            const config = WArrayF.CloneObject(this.Config);
            config.SaveFunction = (ObjectF, response) => {
                if (this.ObjectOptions != undefined) {  /**TODO REVISAR */
                    if (this.ObjectOptions.SaveFunction != undefined) {
                        this.ObjectOptions.SaveFunction(ObjectF, response);
                    }
                }
                this.close(false);
            }
            this.Form = new WForm(config);
            this.Modal.children.push({ class: "ModalContent", children: [this.Form] });
        }
        if (this.ShadowRoot) {
            this.shadowRoot.append(WRender.Create(this.Modal));
        } else {
            this.append(WRender.Create(this.Modal));
        }
        ComponentsManager.modalFunction(this)
    }
    DrawModalHead() {
        return html`<div class="ModalHeader">
            <label>${this.title}</label>
            ${this.CloseOption == false
                ? "" : html`<button class="BtnClose" type="button" 
                onclick="${() => this.close(this)}">x</button>`}
       </div>`;
    }
    close = (RollBack = true) => {
        if (this.Form && RollBack) {
            this.Form.RollBack();
        }
        ComponentsManager.modalFunction(this);
        setTimeout(() => {
            this.parentNode.removeChild(this);
        }, 500);
    }
    //STYLES----------------------------------------------------------------->
    FormStyle = () => {
        const Style = WModalStyle.cloneNode(true)
        return Style;
    }
}

customElements.define("w-modal-form", WModalForm);
export { WModalForm }


