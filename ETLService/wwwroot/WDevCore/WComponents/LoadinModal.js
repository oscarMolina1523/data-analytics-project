import { WRender, ComponentsManager, html } from "../WModules/WComponentsTools.js";
import { css } from "../WModules/WStyledRender.js";

class LoadinModal extends HTMLElement {
    constructor() {
        super();
        this.append(this.modalStyle);
        this.attachShadow({ mode: 'open' });
        this.Modal = WRender.Create({ class: "ContainerFormWModal" });
        this.shadowRoot.append(this.Modal);
        this.shadowRoot.append(this.FormStyle());
        this.DrawLoadinModal();
    }
    connectedCallback() { }
    DrawLoadinModal = async () => {
        this.Modal.append(this.loadingBody);
        ComponentsManager.modalFunction(this);
    };
    loadingBody = html`<div>
    <style>
        .loading {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 20001;
            transition: 0.2s all;
            opacity: 0;
        }
        .loading.show {
            opacity: 1;
        }
        .loading .spin {
            border: 3px solid hsla(185, 100%, 62%, 0.2);
            border-top-color: #3cefff;
            border-radius: 50%;
            width: 3em;
            height: 3em;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
    </style>
    <div class="loading show">
        <div class="spin"></div>
    </div>
    </div>`;
    modalStyle = css`
        w-loading-modal{
            position: fixed;
            background-color: rgba(255, 255, 255, 0.25);
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            background-color: rgba(0, 0, 0, .5);
            z-index: 20000;
            opacity: 0;
            transition: all 0.3s;
        }
    `;
    close = () => {
        ComponentsManager.modalFunction(this);
        setTimeout(() => {
            //this.remove();
            if (this.parentNode != undefined) {
                this.parentNode.removeChild(this);
            }            
        }, 200);
    };
    FormStyle = () => {
        return css`
            :root {
                --color-primary: rgb(53, 128, 226);
                --color-secundary: rgb(255, 25, 133);
                --color-terciario: rgb(52, 12, 56);
            }
            .ContainerFormWModal {
                display: flex;
                flex-direction: column;
                top: 80px;
                margin: auto;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 5px 0 #999;
                width: 100px;
                height: 100px;
                position: absolute;
                left: 50%;
                bottom: 50%;
                transform: translate(-50%, 50%);
                background: white;
                overflow: hidden;
                border-radius: 0.5cm;
                padding: 20px;
                text-align: center;
            }
        `;
    };
}
customElements.define('w-loading-modal', LoadinModal);
export { LoadinModal };
