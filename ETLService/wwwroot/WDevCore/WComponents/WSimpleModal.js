import { WRender, ComponentsManager } from "../WModules/WComponentsTools.js";
import { css } from "../WModules/WStyledRender.js";
import { StyleScrolls, StylesControlsV2 } from "../StyleModules/WStyleComponents.js";

class WSimpleModal extends HTMLElement {
    /**
     *
     * @param {ModalConfig} Config
     */
    constructor(Config) {
        super();
        this.attachShadow({ mode: "open" });
        this.append(this.modalStyle);
        this.shadowRoot.append(StyleScrolls.cloneNode(true));
        this.shadowRoot.append(StylesControlsV2.cloneNode(true));
        this.shadowRoot.append(this.FormStyle());
        this.Modal = WRender.Create({ class: "ContainerFormWModal" });
        this.shadowRoot.append(this.Modal);
        for (const p in Config) {
            this[p] = Config[p];
        }
        this.DrawComponent();

    }
    connectedCallback() { }
    DrawComponent = async () => {
        this.Modal.append(this.DrawModalHead());
        if (this.ObjectModal) { //AGREGA UN OBJETO AL MODAL ENVIDO DESDE LA CONFIGURACION
            this.Modal.append(WRender.Create({ class: "ObjectModalContainer", children: [this.ObjectModal] }));
        } else {
            this.Modal.append("definir contenido");
        }
        ComponentsManager.modalFunction(this);
    };
    DrawModalHead() {
        const InputClose = WRender.Create({
            tagName: 'button',
            class: 'BtnClose',
            onclick: this.close
        });
        const Section = WRender.Create({
            className: "ModalHeader",
            innerHTML: this.title
        });
        if (this.CloseOption != false) {
            Section.append(InputClose);
        }
        return Section;
    }
    close = () => {
        ComponentsManager.modalFunction(this);
        setTimeout(() => {
            this.parentNode.removeChild(this);
        }, 1000);
    };
    //STYLES----------------------------------------------------------------->
    modalStyle = css`
        w-simple-modal{
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            background-color: rgba(0, 0, 0, .5);
            z-index: 20000 !important;
            opacity: 0;
            transition: all 0.3s;
        }
   `;
    FormStyle = () => {
        return css`
            .ContainerFormWModal {
                display: flex;
                flex-direction: column;
                top: 80px;
                margin: auto;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 5px 0 #999;
                width: 500px;
                position: absolute;
                left: 50%;
                transform: translate(-50%, 0%);
                padding: 2em;
                background-color: var(--secundary-color);;
                border-radius: 20px;
                max-width: 100%;
                box-sizing: border-box;
            }

            .BtnClose{
                right: 50px;
                text-align: center;
                top: 10px;
            }

            .ModalHeader {
                display: flex;
                justify-content: center;
                align-items: center;
                text-transform: uppercase;
                font-weight: 500;
                color: var(--font-secundary-color);
                font-size: 20px;
                text-align: center;
                margin-bottom: 10px;
            }
        `;
    };
}
customElements.define("w-simple-modal", WSimpleModal);
export { WSimpleModal };
