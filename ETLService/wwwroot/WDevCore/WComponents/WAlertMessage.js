//@ts-check
import { html } from "../WModules/WComponentsTools.js";
import { css } from "../WModules/WStyledRender.js";

export class WAlertMessage extends HTMLElement {
    /**
    * @param {{ Message: String, CloseOption?: Boolean, Direction?: String , Temporal?: Boolean, Type?: String }} Config 
    */
    constructor(Config) {
        super();
        this.attachShadow({ mode: 'open' });
        this.visible = true;
        this.Message = Config.Message;
        this.CloseOption = Config.CloseOption ?? true;
        this.Direction = Config.Direction ?? 'top';
        this.Temporal = Config.Temporal ?? false;
        this.Type = Config.Type ?? 'info';
        this.style.zIndex = "20001";
        this.style.transition = "all .5s";
    }

    connectedCallback() {
        this.Draw();
        if (this.Temporal) {
            setTimeout(() => this.Close(), 5000);
        }
    }

    Close() {
        this.style.transition = "all .5s";
        this.style.opacity = "0";
        this.style.transform = "scale(0.9)";
        setTimeout(() => {
           this.remove();
        }, 700);
        
    }

    Draw() {
        if (!this.visible || !this.Message) {
            // @ts-ignore
            this.shadowRoot.innerHTML = '';
            return;
        }
        const template = html`<div class="alerta ${this.Type}">
            ${this.CustomStyles}
            <span> 
                <svg id="svgInfo" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="Warning / Info"> <path id="Vector" d="M12 11V16M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21ZM12.0498 8V8.1L11.9502 8.1002V8H12.0498Z"  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                <svg id="svgWarning" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="17" r="1" fill=""></circle> <path d="M12 10L12 14" stroke="" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M3.44722 18.1056L10.2111 4.57771C10.9482 3.10361 13.0518 3.10362 13.7889 4.57771L20.5528 18.1056C21.2177 19.4354 20.2507 21 18.7639 21H5.23607C3.7493 21 2.78231 19.4354 3.44722 18.1056Z" stroke="" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                <svg id="svgDanger" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="17" r="1" fill=""></circle> <path d="M12 10L12 14" stroke="" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M3.44722 18.1056L10.2111 4.57771C10.9482 3.10361 13.0518 3.10362 13.7889 4.57771L20.5528 18.1056C21.2177 19.4354 20.2507 21 18.7639 21H5.23607C3.7493 21 2.78231 19.4354 3.44722 18.1056Z" stroke="" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                <svg id="svgSuccess" width="24" height="24" fill="" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12,2 C17.5228475,2 22,6.4771525 22,12 C22,17.5228475 17.5228475,22 12,22 C6.4771525,22 2,17.5228475 2,12 C2,6.4771525 6.4771525,2 12,2 Z M12,4 C7.581722,4 4,7.581722 4,12 C4,16.418278 7.581722,20 12,20 C16.418278,20 20,16.418278 20,12 C20,7.581722 16.418278,4 12,4 Z M15.2928932,8.29289322 L10,13.5857864 L8.70710678,12.2928932 C8.31658249,11.9023689 7.68341751,11.9023689 7.29289322,12.2928932 C6.90236893,12.6834175 6.90236893,13.3165825 7.29289322,13.7071068 L9.29289322,15.7071068 C9.68341751,16.0976311 10.3165825,16.0976311 10.7071068,15.7071068 L16.7071068,9.70710678 C17.0976311,9.31658249 17.0976311,8.68341751 16.7071068,8.29289322 C16.3165825,7.90236893 15.6834175,7.90236893 15.2928932,8.29289322 Z"></path></svg>
                ${this.Message}
            </span>
            ${this.CloseOption ? html`<button onclick="${() => this.Close()}">&times;</button>` : ''}
        </div>`;
        this.shadowRoot?.append(template);
    }

    /**
     * @param {{ Message: String, CloseOption?: Boolean, Direction?: String , Temporal?: Boolean, Type?: String }} Config 
     */
    static Connect(Config) {
        const direction = Config.Direction ?? 'top';
        let container = document.body.querySelector(`.w-alert-container.${direction}`);

        if (!container) {
            container = document.createElement('div');
            container.className = `w-alert-container ${direction}`;
            // Estilos del contenedor para apilar
            // @ts-ignore
            Object.assign(container.style, {
                position: 'fixed',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: '20001',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                width: 'auto',
                minWidth: '300px',
                pointerEvents: 'none', // Permite clicks a través de los huecos
                top: direction === 'top' ? '1rem' : 'auto',
                bottom: direction === 'bottom' ? '1rem' : 'auto'
            });
            document.body.appendChild(container);
        }

        const alert = new WAlertMessage(Config);
        alert.style.pointerEvents = 'auto'; // Reactiva clicks para la alerta

        // Si es 'bottom', las nuevas aparecen arriba (estilo chat) o simplemente append
        container.appendChild(alert);

        if (Config.Temporal == true) {
            setTimeout(() => alert.Close(), 3000);
        }
    }   
    /**
    * conecta un nuevo alert en el document body
    * @param { import("../WModules/CommonModel.js").ResponseServices? } Response 
    */
    static ResponseMessage(Response) {
        /**@type {{ Message: String, CloseOption?:  Boolean, Direction?: String , Temporal?: Boolean, Type?: String }} */
        const Config = {
            Type : "info",
            CloseOption: true,
            Direction: "top",
            Temporal: true,
            Message: Response?.message ?? "..."
        }
        if (Response?.status) {
            switch (Response.status.toString()) {
                case "200":
                    Config.Type = "success"
                    break;
                case "500":
                    Config.Type = "danger"
                    break;
                default:
                    Config.Type = "warning"
                    break;
            }
        }
        const alert = new WAlertMessage(Config);
        document.body.appendChild(alert);
    }

    // ... Métodos Static Warning, Info, Success, Danger se mantienen igual ...
    /**
     * @param {string} Message
     * @param {boolean} Temporal
     * @param {string} [Direction]
     */
    static Warning(Message, Temporal, Direction) { this.Connect({ Message, Temporal, Direction, Type: 'warning' }); }
    /**
     * @param {string} Message
     * @param {boolean} Temporal
     * @param {string} [Direction]
     */
    static Info(Message, Temporal, Direction) { this.Connect({ Message, Temporal, Direction, Type: 'info' }); }
    /**
     * @param {string} Message
     * @param {boolean} Temporal
     * @param {string} [Direction]
     */
    static Success(Message, Temporal, Direction) { this.Connect({ Message, Temporal, Direction, Type: 'success' }); }
    /**
     * @param {string} Message
     * @param {boolean} Temporal
     * @param {string} [Direction]
     */
    static Danger(Message, Temporal, Direction) { this.Connect({ Message, Temporal, Direction, Type: 'danger' }); }

    CustomStyles = css`
     :host{
        position:absolute;
         display: block;
        margin-bottom: 10px;
     }
     .alerta {
        position: fixed;
        left: 50%;
        transform: translateX(-50%);
     }
    .alerta {
        padding: 10px 10px 10px 20px;
        border-radius: 10px;
        box-shadow: 0 0.25rem 0.5rem rgba(0,0,0,0.1);
        max-width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        animation: fadeIn 0.3s ease-out;
        font-family: sans-serif;
        position: relative;
        box-sizing: border-box;
        transition: all 0.6s;
        & svg {
            position: absolute;
            height: 25px;
            width: 25px;
            left: -31px;            
            top: 50%;
            transform: translateY(-50%);
            display: none;
            fill: none;
            stroke: #f8eaea;
        }
    }   

    .top {
        top: 1rem;
    }

    .bottom {
        bottom: 1rem;
    }

    .alerta.danger {
        background-color: #f8bbbb;
        color: #5f2222;       
        border-left: 40px solid #ed5555;
        & svg#svgDanger { display: block; }
    }

    .alerta.success {
        background-color: #a9e2c1;
        color: #104928;        
        border-left: 40px solid #104928;
        & svg#svgSuccess { fill: #f8eaea; display: block; stroke: none; }
    }

    .alerta.warning {
        background-color: #fdf3d7;
        color: #624e16;       
        border-left: 40px solid #f4c238;
        & svg#svgWarning { display: block; }
    }

    .alerta.info {
        background-color: #dcf4fb;
        color: #214f5e;        
        border-left: 40px solid #0aa4d3;
        & svg#svgInfo { display: block; }
    }

    button {
        background: none; border: none; font-size: 1.2rem;
        color: inherit; cursor: pointer; margin-left: 1rem;
    }
    

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    `;

    static Clear(node = document) {
        node.querySelectorAll("w-alert-mensaje").forEach(a => a.remove());
        document.querySelectorAll(".w-alert-container").forEach(c => c.innerHTML = "");
    }
}

customElements.define('w-alert-mensaje', WAlertMessage);