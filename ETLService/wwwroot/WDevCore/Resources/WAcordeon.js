//@ts-check
import { html } from "../WModules/WComponentsTools.js";
import { WOrtograficValidation } from "../WModules/WOrtograficValidation.js";
import { css } from "../WModules/WStyledRender.js";
/**
 * @typedef {Object.<string, any>} Config 
    * @property {Object.<string, any>} [ModelObject]
    * @property {Function} [action]
    * @property {Array<Object>} [Dataset]
**/
class WAcorden extends HTMLElement {

    /**
    * @param {Config} Config 
    */
    constructor(Config) {
        super();
        this.Config = Config;
        this.attachShadow({ mode: 'open' });

        this.Acordeon = html`<div class="accordion"></div>`;
        this.shadowRoot?.append(this.CustomStyle, this.Acordeon);
        this.Draw();

    }
    connectedCallback() { }
    Draw = async () => {
        // ${Object.keys(element).map(key => this.BuildPropiertyDetail(element, key))}
        this.Config.Dataset?.forEach(element => {
            const content = html`<div class="element-content" id="${element.Descripcion?.toString().replaceAll(" ", "")}">
                ${Object.keys(element).map(key => this.BuildPropiertyDetail(element, key))}
            </div>`;
            this.Acordeon?.append(html`<div class="element-container">
                <div class="accordion-button" onclick="${(ev) => {
                    ev.target.className = content.className.includes("active")
                        ? "accordion-button" : "accordion-button active-btn";
                    content.className = content.className.includes("active")
                        ? "element-content" : "element-content active";
                }}">${element.Descripcion}</div>
                ${content}
            </div>`)
        });
    }
    BuildPropiertyDetail(ObjectF, prop) {
        switch (this.Config.ModelObject[prop]?.type.toUpperCase()) {
            case "MASTERDETAIL":
                const modelClass = this.Config.ModelObject[prop].ModelObject.__proto__ == Function.prototype ? this.Config.ModelObject[prop].ModelObject() : this.Config.ModelObject[prop].ModelObject;
                //console.log(this.Config.ModelObject, prop, this.Config.ModelObject[prop], this.Config.ModelObject[prop].ModelObject, ObjectF[prop]);
                const maxDetails = ObjectF[prop].reduce((max, detail) => {
                    const DetailsLength = new modelClass.constructor(detail).Details
                        ? new modelClass.constructor(detail).Details.length : 0;
                    return Math.max(max, DetailsLength);
                }, 0);
                return html`<div class="detail-content">${ObjectF[prop].map(element => {
                    const instance = new modelClass.constructor(element);
                    const index = ObjectF[prop].indexOf(element)
                    return html`<div class="container">
                        <div class="element-description">
                            ${index == 0 ? html`<span class="header">Descripción</span>` : ""} 
                            <span class="value">${instance.Descripcion}</span>
                        </div>
                        <div class="element-details" style=" grid-template-columns: repeat(${maxDetails}, ${100 / maxDetails}%);">
                            ${instance.Details.map((detail, indexDetail) => {
                            return this.buildDetail(detail, indexDetail);
                    })}</div>
                </div>`
                })}</div>`;
            default:
                return html`<div class="prop">${WOrtograficValidation.es(prop)}: ${ObjectF[prop]}</div>`;
        }
    }

    buildDetail(detail, index) {    
        return html`<div class="element-detail" >
            <span class="header ${index == 0 ? "" : "hidden"}">${detail.Evaluacion}</span>
            <span class="value">${detail.Resultado}</span>
        </div>`;
    }

    update() {
        this.Draw();
    }
    CustomStyle = css`@import url(/css/variables.css);
        *{ font-family:  Montserrat, sans-serif;}
        
        .accordion {
            border: 1px solid #d2d2d2;
            border-radius: 20px;
            overflow: hidden;
        }
        .accordion .accordion-button{
            border-bottom: 1px solid #d2d2d2;
        }
        .prop {
            padding: 10px 0px;
            text-transform: capitalize;
            font-size: 1rem;
        }
        
        .element-content {
            overflow: hidden;
            max-height: 0px;
            padding: 0px 20px;
            transition: all 1s;
        }
        .element-content.active {           
            max-height: unset;
            padding: 20px 20px;
        }
        .detail-content { 
            display: flex;
            flex-direction: column;
            border-color: rgb(239, 240, 242);
            border-style: solid;
            border-width: 0.8px;
            overflow: hidden;
            border-radius: 0.3cm;
        }
        .detail-content .container {
            display: flex;
            flex: 1;
            & .element-description {
                flex: 1;
                display: grid;
                grid-template-rows: 50% 50%;
            }
            & .element-details {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(min-content, 1fr));
                flex: 3;
                & .element-detail {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                }
            }   
        }        
        .header {
            flex: 1;
            padding: 5px;
            border-bottom: 1px solid #999;
            font-weight: 700;
            text-transform: uppercase;
            padding: 10px;
            background-color: var(--secundary-color);
        }
        .value {
            flex: 1;
            padding: 10px;
        }
        .hidden {
            display: none;
        }
        .container:nth-of-type(even) {
            background-color: #f8f8f8;
        }
        @media (max-width: 800px) {
            .detail-content .container, .detail-content .element-details {
                flex-direction: column;
            }
            .hidden {
                display: block;
            }
            .element-detail {
                flex-direction: row;
            }
        }
     `
}
customElements.define('w-acordeon', WAcorden);
export { WAcorden }