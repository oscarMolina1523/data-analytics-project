//@ts-check
import { ControlBuilder } from "../ComponentsBuilders/WControlBuilder.js";
import { ConvertToMoneyString, WRender } from "../WModules/WComponentsTools.js";
import { WOrtograficValidation } from "../WModules/WOrtograficValidation.js";
import { css } from "../WModules/WStyledRender.js";

class WCard extends HTMLElement {
    constructor(Element, Model, Config = {}) {
        super();
        if (Model?.__proto__ == Function.prototype) {
            Model = Model();
        }
        this.Element = Element;
        this.Model = Model ?? this.Element;
        this.Config = Config;
        this.CardTableContainer = WRender.Create({ className: "CardTableContainer" });
        this.append(this.CardTableContainer, this.CardStyle);
        this.HeaderProp = this.GetHeaderName(this.Model) ?? ""
        this.DrawWCard();
    }
    connectedCallback() { }
    DrawWCard = async () => {
        this.CardTableContainer.append(WRender.Create({
            tagName: "h3",
            innerHTML: WOrtograficValidation.es(!this.Element[this.HeaderProp]  ? "" : this.Element[this.HeaderProp])
        }));
        for (const prop in this.Model) {
            if (prop != this.HeaderProp) {
                this.EvalModelPrototype(prop, this.Model);
            }

        }
    }
    EvalModelPrototype(prop, Model) {
        let value = "";
        if (this.Element != null && this.Element[prop] != null) {
            value = this.Element[prop];
        }
        if (this.IsDrawableProp(this.Element, prop)) {
            switch (Model[prop]?.type?.toUpperCase()) {
                case "IMAGE": case "IMAGES": case "IMG": case "IMAGECAPTURE":
                    this.CardTableContainer.style.gridTemplateColumns = "auto auto";
                    this.CardTableContainer.append(ControlBuilder.BuildImage(value, this.Config.ImageUrlPath));
                    break;
                case "DATE": case "FECHA":
                    this.CardTableContainer.append(
                        WRender.Create({
                            // @ts-ignore
                            tagName: "label", innerText: WOrtograficValidation.es(prop) + ": " + value?.toString()?.toDateFormatEs()
                        }))
                case "SELECT": case "WSELECT":
                    break;
                case "MULTISELECT":
                    break;
                case "COLOR":
                    break;
                case "MODEL":
                    break;
                case "MASTERDETAIL":
                    break;
                case "MONEY":
                    this.CardTableContainer.append(WRender.Create({
                        tagName: "label",
                        innerText: (Model[prop]?.label ?? WOrtograficValidation.es(prop)) + ": " + (value != undefined && value != null && value != "" ? `${ConvertToMoneyString(parseFloat(value))}` : "-")
                    }));
                    break;
                default:
                    this.CardTableContainer.append(WRender.Create({
                        tagName: "label",
                        innerHTML: (Model[prop]?.label ?? WOrtograficValidation.es(prop)) + ": " + WOrtograficValidation.es(value == null ? "" : value)
                    }));
                    break;
            }
        }
    }

    CardStyle = css`
        .CardTableContainer{
            display: grid;
            grid-template-columns: min-content 1fr;
            grid-template-rows: auto;
            gap: 5px;
            overflow: hidden;
            grid-auto-flow: column;
        }
        .CardTableContainer img {
            grid-column: 1/2;
            margin-bottom: 5px;
            grid-row: span 4;
        }
        .CardTableContainer label,  .CardTableContainer h3{
            min-width: 180px;
            grid-column: 2/3;
            padding: 0 !important;
            margin: 0 !important;
        }

        .CardTableContainer label::first-letter, .CardTableContainer h3::first-letter {
            text-transform: uppercase;
        }
        .imgPhoto {
            width: 50px;
            border-radius: 50%;
            height: 50px;
            size: 100%;
            display: block;
            margin: auto;
            object-fit: cover;
            box-shadow: 0 2px 5px 0 rgb(0 0 0 / 30%);
        }
    `
    IsDrawableProp(element, prop) {
        if (this.Model == undefined && (typeof element[prop] == "number" || typeof element[prop] == "string")) {
            return true;
        }
        else if (
            prop == this.HeaderProp ||
            (this.Model[prop]?.type == undefined
                || this.Model[prop]?.type.toUpperCase() == "MASTERDETAIL"
                || this.Model[prop]?.primary == true
                || this.Model[prop]?.hidden == true
                || this.Model[prop]?.hiddenInTable == true)
            || element == null
            || element[prop] == null || element[prop] == undefined
            || element[prop]?.__proto__ == Function.prototype
            || element[prop]?.__proto__.constructor.name == "AsyncFunction") {
            return false;
        }
        return true;
    }

    GetHeaderName(element) {
        if (typeof element === "string") {
            return element;
        }
        const keys = [
            "TIPO", "TITLE", "TITULO",
            "DESCRIPCION", "DESC",
            "NAME", "NOMBRE", "NOMBRES",
            "TEXT", "TEXTO",
            "DESCRIPCION_SERVICIO", "DETALLES"
        ];
        const foundKey = Object.keys(element).find(
            key => keys.includes(key.toUpperCase())
        );
        return foundKey;
    }
}
customElements.define('w-card', WCard);
export { WCard };

