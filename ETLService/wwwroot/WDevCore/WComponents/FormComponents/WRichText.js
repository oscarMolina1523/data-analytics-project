//@ts-check
import { html, WRender } from "../../WModules/WComponentsTools.js"
import { css } from "../../WModules/WStyledRender.js"
import { WModalForm } from "../WModalForm.js";
import { BtnVideoComponent } from "./BtnVideoComponent.js";
import { WImageCapture } from "./WImageCapture.js";
class ModelFiles {
    /**
     * @param {string} name
     * @param {string} value
     * @param {string} type
     */
    constructor(name, value, type) {
        this.Name = name;
        this.Type = type;
        this.Value = value;
    }
    Name = "";
    Value = "";
    Type = "";
}
/**
 * @typedef {Object.<string, any>} Config 
    * @property {String} [value]
    * @property {Function} [action]
    * @property {Boolean} [activeAttached]
**/
class WRichText extends HTMLElement {

    /**
    * @param {Config} [Config] 
    */
    constructor(Config = { value: "", action: (/** @type {any} */ value) => { } }) {
        super();
        this.value = Config?.value ?? "";
        /**
         * @type {Array<ModelFiles>}
         */
        this.Files = [];
        this.style.backgroundColor = "#fff";
        //this.style.padding = "5px";
        this.style.borderRadius = "10px";
        this.style.border = "1px solid var(--fifty-color)";
        this.Config = Config;
        this.DrawComponent();
        this.MaxColumns = 10;
    }
    connectedCallback() {
    }
    DrawComponent = async () => {
        this.innerHTML != "";
        this.append(WRichTextStyle.cloneNode(true))
        this.DrawOptions();
        this.Divinput = WRender.Create({
            // @ts-ignore
            contentEditable: true,
            class: "WREditor",
            innerHTML: this.value,
            oninput: () => {
                // @ts-ignore
                this.clearInnerHtml(this.Divinput.innerText);
                // @ts-ignore
                this.value = this.Divinput.innerHTML;
                if (this.Config?.action) {
                    this.Config?.action(this.value);
                }

            }
        })
        this.clearInnerHtml(this.Divinput.innerText);
        this.append(this.Divinput);
        this.DrawAttached();
        this.DrawHtmlEditor();
    }
    /**
     * @param {string} contenido
     */
    clearInnerHtml(contenido) {
        // @ts-ignore
        //let contenido = this.querySelector(".WREditor")?.innerText;
        // Expresión regular para detectar caracteres invisibles de HTML
        let regex = /^[\u200B-\u200D\uFEFF\n]*$/;
        // Verificar si la cadena contiene <br> o caracteres invisibles
        if (regex.test(contenido)) {
            // @ts-ignore
            this.Divinput.innerHTML = "";
            this.value = "";
        }
    }

    DrawOptions() {
        const OptionsSection = WRender.Create({
            tagName: "section", class: "WOptionsSection"
        })
        this.Commands.forEach(command => {
            let CommandBtn = WRender.Create({
                tagName: "button",
                className: "ROption tooltip tooltipBtn " + command.class,
                type: command.type,
                id: "ROption" + command.commandName,
                // @ts-ignore
                title: command.commandName,
                innerText: command.label
            });
            if (command.class == "list") {
                CommandBtn.appendChild(html`<svg viewBox="0 -5 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 1H1V3H3V1Z" fill="#000000"></path> <path d="M3 5H1V7H3V5Z" fill="#000000"></path> <path d="M1 9H3V11H1V9Z" fill="#000000"></path> <path d="M3 13H1V15H3V13Z" fill="#000000"></path> <path d="M15 1H5V3H15V1Z" fill="#000000"></path> <path d="M15 5H5V7H15V5Z" fill="#000000"></path> <path d="M5 9H15V11H5V9Z" fill="#000000"></path> <path d="M15 13H5V15H15V13Z" fill="#000000"></path> </g></svg>`)
            } else if (command.class == "left") {
                CommandBtn.appendChild(html`<svg viewBox="0 -5 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M11 1H1V3H11V1Z" fill="#000000"></path> <path d="M1 5H15V7H1V5Z" fill="#000000"></path> <path d="M11 9H1V11H11V9Z" fill="#000000"></path> <path d="M15 13H1V15H15V13Z" fill="#000000"></path> </g></svg>`)
            } else if (command.class == "center") {
                CommandBtn.appendChild(html`<svg viewBox="0 -5 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M13 1H3V3H13V1Z" fill="#000000"></path> <path d="M1 5H15V7H1V5Z" fill="#000000"></path> <path d="M13 9H3V11H13V9Z" fill="#000000"></path> <path d="M15 13H1V15H15V13Z" fill="#000000"></path> </g></svg>`)
            } else if (command.class == "right") {
                CommandBtn.appendChild(html`<svg viewBox="0 -5 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15 1H5V3H15V1Z" fill="#000000"></path> <path d="M1 5H15V7H1V5Z" fill="#000000"></path> <path d="M15 9H5V11H15V9Z" fill="#000000"></path> <path d="M15 13H1V15H15V13Z" fill="#000000"></path> </g></svg>`)
            }
            // @ts-ignore
            CommandBtn[command.event] = () => {
                const ROption = this.querySelector("#ROption" + command.commandName);
                //console.log( ROption.value );   
                // @ts-ignore
                document.execCommand(command.commandName, false, ROption.value);
            }
            OptionsSection.append(WRender.Create({
                class: "tooltip",
                children: [CommandBtn, { tagName: "span", class: "tooltiptext", children: [command.commandName] }]
            }))
        });
        OptionsSection.append(html`<button onclick="${() => this.DisplayTableBuilder()}" class="tableBtn ROption tooltip tooltipBtn">${this.tableBuilder}
            <svg class="" viewBox="0 0 20 20"><path d="M3 6v3h4V6H3zm0 4v3h4v-3H3zm0 4v3h4v-3H3zm5 3h4v-3H8v3zm5 0h4v-3h-4v3zm4-4v-3h-4v3h4zm0-4V6h-4v3h4zm1.5 8a1.5 1.5 0 0 1-1.5 1.5H3A1.5 1.5 0 0 1 1.5 17V4c.222-.863 1.068-1.5 2-1.5h13c.932 0 1.778.637 2 1.5v13zM12 13v-3H8v3h4zm0-4V6H8v3h4z"></path></svg>
            <svg class="ck ck-icon ck-reset_all-excluded ck-icon_inherit-color ck-dropdown__arrow" viewBox="0 0 10 10"><path d="M.941 4.523a.75.75 0 1 1 1.06-1.06l3.006 3.005 3.005-3.005a.75.75 0 1 1 1.06 1.06l-3.549 3.55a.75.75 0 0 1-1.168-.136L.941 4.523z"></path></svg></button>`)
        OptionsSection.append(html`<button onclick="${() => this.ToggleHtmlEditor()}" class="htmlBtn ROption tooltip tooltipBtn">
            <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect x="0" fill="none" width="20" height="20"></rect> <g> <path d="M4 16v-2H2v2H1v-5h1v2h2v-2h1v5H4zM7 16v-4H5.6v-1h3.7v1H8v4H7zM10 16v-5h1l1.4 3.4h.1L14 11h1v5h-1v-3.1h-.1l-1.1 2.5h-.6l-1.1-2.5H11V16h-1zM19 16h-3v-5h1v4h2v1zM9.4 4.2L7.1 6.5l2.3 2.3-.6 1.2-3.5-3.5L8.8 3l.6 1.2zm1.2 4.6l2.3-2.3-2.3-2.3.6-1.2 3.5 3.5-3.5 3.5-.6-1.2z"></path> </g> </g></svg>
        </button>`);

        // --- NUEVAS OPCIONES: TAMAÑO DE FUENTE ---
        //{ 1: "8px", 2: "10px", 3: "12px", 4: "14px", 5: "18px", 6: "24px", 7: "32px" };
        OptionsSection.append(WRender.Create({
            class: "tooltip",
            children: [
                WRender.Create({
                    tagName: "select",
                    className: "ROption font-select",
                    onchange: (/** @type {{ target: { value: number; }; }} */ ev) => this.changeFontSize(ev.target.value),
                    children: [
                        { tagName: "option", value: 3, innerText: "A" },
                        { tagName: "option", value: 1, innerText: "8 px" },
                        { tagName: "option", value: 2, innerText: "10 px" },
                        { tagName: "option", value: 3, innerText: "12 px" },
                        { tagName: "option", value: 4, innerText: "14 px" },
                        { tagName: "option", value: 5, innerText: "18 px" },
                        { tagName: "option", value: 6, innerText: "24 px" },
                        { tagName: "option", value: 7, innerText: "32 px" },
                    ]
                })
            ]
        }));

        OptionsSection.append(WRender.Create({
            class: "tooltip",
            children: [
                WRender.Create({
                    tagName: "input",
                    className: "ROption font-select",
                    type: "color",
                    onchange: (/** @type {{ target: { value: String; }; }} */ ev) => this.changeFontColor(ev.target.value),
                })
            ]
        }));

        // --- NUEVA OPCIÓN: INSERTAR IMAGEN (URL) ---
        const ImageContainer = html`<div class="ToolWithInputContainer tooltip">            
                <button class="ROption tooltipBtn insert-image-btn" title="Insertar Imagen (URL)" 
                    onclick="${(/** @type {{ preventDefault: () => void; }} */ e) => {
                e.preventDefault();
                const input = this.querySelector(".image-url-input");
                // @ts-ignore
                const isHidden = input.style.display !== "inline-block";
                // @ts-ignore
                input.style.display = !isHidden ? "none" : "inline-block";
                if (isHidden) {
                    // @ts-ignore
                    input.focus();
                }
            }}"> 
            <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M1 1H15V15H1V1ZM6 9L8 11L13 6V13H3V12L6 9ZM6.5 7C7.32843 7 8 6.32843 8 5.5C8 4.67157 7.32843 4 6.5 4C5.67157 4 5 4.67157 5 5.5C5 6.32843 5.67157 7 6.5 7Z" fill="#000000"></path> </g></svg>          
            </button>
            <input type= "url" placeholder= "Image URL" class="ROption tool-input image-url-input"  onkeypress="${(/** @type {{ key: string; preventDefault: () => void; target: { value: string; style: { display: string; }; }; }} */ e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    // @ts-ignore
                    this.insertImage(e.target.value);
                    // @ts-ignore
                    e.target.value = "";
                    // @ts-ignore
                    e.target.style.display = "none";
                }
            }}">
        </div>`

        const ParamContainer = html`<div class="ToolWithInputContainer tooltip">
                <button class="ROption  tooltipBtn bold" title="Insertar el nombre del parámetro" onclick="${(/** @type {{ preventDefault: () => void; }} */ e) => {
                e.preventDefault();
                const input = this.querySelector(".param-input");
                // @ts-ignore
                const isHidden = input.style.display !== "inline-block";
                // @ts-ignore
                input.style.display = !isHidden ? "none" : "inline-block";
                if (isHidden) {
                    // @ts-ignore
                    input.focus();
                }
            }}">P</button>
            <input type= "text" placeholder= "Nombre del parámetro" class="ROption tool-input param-input" onkeypress="${(/** @type {{ key: string; preventDefault: () => void; target: { value: string; style: { display: string; }; }; }} */ e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const paramValue = e.target.value.trim();
                    // 1. Ocultar y limpiar el input
                    e.target.value = "";
                    e.target.style.display = "none";
                    if (paramValue) {
                        // 3. Devolver el foco al editor (necesario para execCommand)
                        this.Divinput.focus();
                        // 4. Insertar el texto en la posición restaurada
                        const formattedText = `{{ ${paramValue} }}`;
                        document.execCommand("insertText", false, formattedText);
                        this.Divinput.dispatchEvent(new Event('input'));
                    } else {
                        // Si no hay valor, solo asegura el foco
                        this.Divinput.focus();
                    }
                }
            }}">
        </div>`

        OptionsSection.append(ImageContainer, ParamContainer);
        this.append(OptionsSection);

    }
    DisplayTableBuilder() {
        if (this.tableBuilder.className.includes("active")) {
            this.tableBuilder.classList.remove("active")
        } else {
            this.tableBuilder.classList.add("active")
        }
    }

    DrawAttached() {
        if (this.Config.activeAttached != true) {
            return;
        }
        this.AttachedSection = WRender.Create({
            tagName: "section", class: "InputFileSection", children: []
        })
        this.AddInputFileSection = WRender.Create({
            tagName: "section", class: "AddInputFileSection", children: [               
                InputFileStyle.cloneNode(true),
                this.AttachedSection,
                 //new WImageCapture(),
                 new BtnVideoComponent({
                action: async (/** @type {any} */ imageB64) => {
                    this.CreateFileObject("capture" + Date.now().toString(), imageB64, "data:image/png;base64,");
                }}),
                WRender.Create({
                    tagName: "label", htmlFor: "attachInput", class: "button", innerHTML: ""
                }),
            ]
        })
        this.AddInputFileSection.append(WRender.Create({
            tagName: "input", id: "attachInput", type: "file", class: "inputfile",
            onchange: (/** @type {{ target: any; }} */ ev) => {
                const targetControl = ev.target
                let base64Type = "";
                let fileB64;
                const file = targetControl?.files[0];
                if (targetControl?.files != null) {
                    switch (targetControl?.files[0]?.type.toUpperCase()) {
                        case "IMAGE/PNG": case "IMAGE/JPG": case "IMAGE/JPEG":
                            base64Type = "data:image/png;base64,";
                            break;
                        case "APPLICATION/PDF":
                            base64Type = "data:application/pdf;base64,";
                        default:
                            base64Type = "data:" + targetControl?.files[0]?.type + ";base64,";
                            break;
                    }
                }
                var reader = new FileReader();
                reader.onloadend = (e) => {
                    //@ts-ignore
                    fileB64 = e.target?.result?.split("base64,")[1];
                    this.CreateFileObject(file.name, fileB64, base64Type);

                };
                reader.readAsDataURL(file);
            }, onclick: (/** @type {{ target: { value: string; }; }} */ ev) => {
                let file = '';
                if (ev.target?.value) {
                    file = ev.target?.value;
                    const search = "C:\\fakepath\\";
                    const files = file.replace(search, "");
                    this.Files.filter(obj => obj.Name !== files);
                    ev.target.value = "";
                }
            },
        }))
        this.append(this.AddInputFileSection);
    }

    /**
     * @param {string} fileName
     * @param {string} fileB64
     * @param {string} base64Type
     */
    CreateFileObject(fileName, fileB64, base64Type) {
        const fileClass = new ModelFiles(fileName, fileB64, base64Type);
        this.Files.push(fileClass);
        //@ts-ignore
        this.AttachedSection.innerHTML = "";
        this.Files.forEach(file => {
            const AttachBtn = WRender.Create({
                className: "AttachBtn", innerHTML: "X", onclick: () => {
                    this.Files.splice(this.Files.indexOf(file), 1);
                    AttachBtn.parentNode?.parentNode?.removeChild(AttachBtn.parentNode);
                }
            });
            //@ts-ignore
            this.AttachedSection.append(WRender.Create({ class: "AttachItem", children: [file.Name, AttachBtn] }));
        });
    }

    FunctionClear() {
        // @ts-ignore
        this.value = this.Divinput.innerHTML = "";
        this.htmlEditor.value = "";
        if (this.AttachedSection) {
            this.AttachedSection.innerHTML = "";
        }
        this.Files = [];
    }
    tableBuilder = html`<div class="tableBuilder" tabindex="-1">
        <div class="ck">
            <div class="btn-container">
                ${this.BuildBtnTableMap(10)}    
            </div>
        </div>        
        <style>
            .tableBuilder {
                position: absolute;
                display: none;
                flex-direction: column;
                top: 40px;
                left: 50%;
                transform: translateX(-50%);
                background-color: var(--primary-color);
                box-shadow: #c5c5c5 0 0 5px 0;
                padding: 10px 10px 20px 10px;
            }
            .tableBuilder.active {
                display: flex;
            }
            .tableBuilder .btn-container{
                display: grid;
                grid-template-columns: repeat(10, 15px);
                grid-template-rows: repeat(10, 15px);
                gap: 2px;
            }
            .tableBuilder .btn-container button{
                overflow: hidden;
                border:none;
            }
            .tableBuilder .btn-container button span{
                display: none;
                position: absolute;
            }
            .tableBuilder .btn-container button:hover{
                background-color: #92c5e6;
            }
            .tableBuilder .btn-container button:hover > span{
                display: block;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
            }
        </style>
    </div>`
    /**
     * @param {any} ev
     */
    CreateTable(ev) {
        this.Divinput.append(this.CreateHtmlTable(ev));
        this.value = this.Divinput.innerHTML;
    }
    /**
     * @param {{ target: any; }} event
     */
    CreateHtmlTable(event) {
        const button = event.target;
        const sizeString = button.querySelector('span').textContent;
        const [rows, cols] = sizeString.split(' × ').map(Number);
        const table = html`<table class="my-table"> <style>
             .my-table  {      
                font-family: Verdana, Geneva, Tahoma, sans-serif;  
                width: 100%;
                border-collapse: collapse;
            }
            .my-table th,  .my-table td  {
                border: solid 1px var(--fifty-color);)
                padding: 5px;
                line-height: 15px;
                font-size: 15px;
                min-height: 25px;
                margin: 0px;
                word-wrap: break-word; 
                word-break: break-all; 
                white-space: normal;  
            }
            .my-table th  {
                font-weight: bold;
            }   
            .my-table th label::first-letter {
                text-transform: uppercase;
            }
            .my-table tr:nth-child(odd) {
                background-color: rgba(0, 0, 0, 0.05);
            }
        </style></table>`;
        for (let i = 0; i < rows; i++) {
            const row = WRender.Create({ tagName: "tr" });
            for (let j = 0; j < cols; j++) {
                if (i == 0) {
                    row.append(WRender.Create({ tagName: "th", innerHTML: "&nbsp;" }));
                } else {
                    row.append(WRender.Create({ tagName: "td", innerHTML: "&nbsp;" }));
                }
            }
            table.appendChild(row);
        }
        return table;
    }
    /**
     * @param {number} num
     */
    BuildBtnTableMap(num) {
        const BtnArray = [];
        for (let indexCol = 1; indexCol <= num; indexCol++) {
            for (let indexRow = 1; indexRow <= num; indexRow++) {
                BtnArray.push(html`<button onclick="${(/** @type {any} */ ev) => { this.CreateTable(ev) }}"><span>${indexCol} × ${indexRow}</span></button>`);
            }
        }
        return BtnArray
    }
    ToggleHtmlEditor() {
        if (this.htmlEditor.style.display === "none") {
            this.htmlEditor.style.display = "block";
            this.Divinput.style.display = "none";
            this.htmlEditor.value = this.value;
        } else {
            this.htmlEditor.style.display = "none";
            this.Divinput.style.display = "block";
            this.value = this.htmlEditor.value;
            this.Divinput.innerHTML = this.value;
        }
    }
    DrawHtmlEditor() {
        this.htmlEditor = WRender.Create({
            tagName: "textarea",
            class: "HtmlEditor",
            style: "display: none; width: 100%; height: 170px;",
            oninput: () => {
                this.value = this.htmlEditor.value;
                // @ts-ignore
                this.Config?.action(this.value);
            }
        });
        this.append(this.htmlEditor);
    }
    /**
     * Inserta una imagen en el editor en la posición actual del cursor/selección.
     * @param {string} url - La URL de la imagen a insertar.
     */
    insertImage = (url) => {
        if (url && url.trim() !== "") {
            this.Divinput.append(html`<img class="content-image" src="${url.trim()}">`);
        }
        this.Divinput.focus();
    }
    /**
     * @param {number} step
     */
    changeFontSize(step) {
        // 1–7 son los tamaños válidos en execCommand
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        /**@type {number} */
        const newSize = Math.min(7, Math.max(1, step));
        document.execCommand("fontSize", false, newSize.toString());
    }

    /**
     * @param {string} color
     */
    changeFontColor(color) {
        // 1–7 son los tamaños válidos en execCommand
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        document.execCommand("foreColor", false, color);
    }

    Commands = [
        //{ commandName: "backColor", icon: "", type: "color", commandOptions: null, state: 1, event: "onchange" },
        { commandName: "bold", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick", class: "bold", label: "B" },
        { commandName: "italic", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick", class: "italic", label: "I" },
        { commandName: "underline", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick", class: "underline", label: "U" },
        { commandName: "insertUnorderedList", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick", class: "list", label: "" },
        //{ commandName: "createLink", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick", class: "link", label: "" },
        //{ commandName: "uppercase", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick", class: "bold", label: "A" },
        //{ commandName: "insertOrderedList", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick", class: "list", label: "" },
        //{ commandName: "copy", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "cut", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "defaultParagraphSeparator", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "delete", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "fontName", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "foreColor", icon: "", type: "color", commandOptions: null, state: 1, event: "onchange" },
        //{ commandName: "formatBlock", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "forwardDelete", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "insertHorizontalRule", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "insertHTML", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "insertImage", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "insertLineBreak", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "insertParagraph", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "insertText", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        { commandName: "justifyLeft", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick", class: "left", label: "" },
        { commandName: "justifyCenter", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick", class: "center", label: "" },
        { commandName: "justifyRight", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick", class: "right", label: "" },
        //{ commandName: "justifyFull", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "outdent", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "paste", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "redo", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "selectAll", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "strikethrough", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "styleWithCss", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "subscript", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "superscript", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "undo", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "unlink", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
    ];
}


const WRichTextStyle = css` 
    w-rich-text .WREditor {
        height: 170px;
        display: block;
        margin: 0px;
        padding: 20px;
        overflow-y: auto;
        color: #444;
    }
    .WREditor:focus-visible  {
        outline-color : #b1d7f0;
    }   

    w-rich-text .WOptionsSection {
        margin: 0px;
        border-radius: 4px;
        padding: 10px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        flex-wrap: wrap;
        background-color: var(--fifty-color);
        position: relative;
        gap: 10px;
    }  
    w-rich-text .SendSection {
        border: none;
        margin: 10px;    
        border-radius: 4px;
        padding: 5px;
        display: flex;
        justify-content: center;
    }

    w-rich-text .ROption {
        border: none;
        padding: 3px;
        margin: 0px;
        display: grid;
        background-color: transparent;
        color: var(--font-primary-color);
        cursor  : pointer;
        transition: all 0.3s;
    }
    .ROption.font-select {
        width: 65px;
        border: 1px solid #999;
        border-radius: 5px;
        padding: 5px;
    }
    .content-image {
        max-width: 100%;
    }    
    w-rich-text .ROption:hover {
        color: var(--font-secundary-color);
    }
    w-rich-text .ROption:hover > svg {
        fill: var(--font-secundary-color);
    }
    w-rich-text .ROption svg {
        fill: var(--font-primary-color);
        height: 20px;
        width: 20px;
    }
    w-rich-text .ROption svg path {
        fill: var(--font-primary-color);
    }
    w-rich-text .ROption:hover > svg path {
        fill: var(--font-secundary-color);
    }

    .tooltip {
        position: relative;
        display: inline-block;
        padding: 0px;
    }

    .tooltiptext {
        visibility: hidden;
        min-width: 120px;
        background-color: var(--primary-color);
        color: var(--font-primary-color);
        text-align: center;
        border-radius: 6px;
        padding: 5px;
        position: absolute;
        z-index: 1;
        bottom: 150%;
        left: 50%;
        margin-left: -60px;
        box-shadow: 0 0 2px 0 #999;
    }

    .tooltip:hover .tooltiptext {
        visibility: visible;
    } 

    .tooltipBtn {
        cursor: pointer;
        width: 20px;
        height: 20px;
        padding: 10px 20px;
        border: none;
        background-color: #f5f5f5;
        color: #000;
        border-radius: 4px;
        transition: background-color 0.3s ease;
    }
    .list {
        border: none;
        background-repeat: no-repeat;
        background-position: center;
        background-size: 18px;
    }

    .link {
        border: none;
        background-repeat: no-repeat;
        background-position: center;
        background-size: 18px;
        background-image: url("/WDevCore/Icons/globe.png");
    }

    .tableBtn {
        display: flex !important;
        gap: 5px;
        width: 50px;
        align-items: center;
        position: relative;
    }

    .tableBtn svg{
        height: 20px;
        width: 20px;
    }
    .tableBtn svg:last-child(){
        height: 10px;
        width: 10px;
    }

    .center {
        border: none;
        background-repeat: no-repeat;
        background-position: center;
        background-size: 18px;
    }

    .right {
        border: none;
        background-repeat: no-repeat;
        background-position: center;
        background-size: 18px;
    }

    .left {
        border: none;
        background-repeat: no-repeat;
        background-position: center;
        background-size: 18px;
    }

    .bold {
        border: none;
        font-family: "Times New Roman";
        font-weight: bold;
        font-size: 18px;
    }
    .italic {
        border: none;
        font-family: "Times New Roman";
        font-weight: bold;
        font-style: italic;
        font-size: 18px;
    }
    .underline {
        border: none;
        font-family: "Times New Roman";
        font-weight: bold;
        text-decoration: underline;
        font-size: 18px;
    }
    .HtmlEditor {
        font-family: monospace;
        padding: 10px;
        border: 1px solid var(--fifty-color);
        border-radius: 4px;
        resize: none;
    }
    .htmlBtn {
        border: none;
        background-repeat: no-repeat;
        background-position: center;
        background-size: 18px;
        background-image: url("/WDevCore/Icons/code.png");
    }
    .ToolWithInputContainer {
        display: flex;
        align-items: center;
        text-align: left;
    }
    w-rich-text .tool-input {
        width: 150px; padding: 5px; margin-left: 5px; display: none; border-radius: 5px; border: 1px solid var(--fifty-color);
    }
`


const InputFileStyle = css`
    .InputFileSection {
        margin: 0px;
        border-radius: 4px;
        padding: 5px;
        border: solid 1px var(--fifty-color);
        display: grid;
        grid-template-columns: auto auto auto;
        justify-content: left;
        min-width: calc(100% - 150px);
    }

    .AddInputFileSection {
        border: none;
        display: flex;
        margin: 0px;
        border-radius: 4px;
        padding: 5px;
        text-align: right;
    }
    .button {
        font-family: "Times New Roman";
        display: block;
        cursor: pointer;
        min-width: 35px;
        min-height: 35px;
        max-height: 35px;
        padding: 10px 0px;
        border-radius: 5px;
        transition: transform .2s ease-out;
        background-color: unset;
        color: #000;
        border-radius: 5px;
        font-size: 12px;
        font-weight: bold;
        background: url('data:image/png;base64,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');
        background-size: 25px 25px;
        background-position: 50%;
        background-repeat: no-repeat;
        background-color: #fff;
    }
    .AddInputFileSection {
        & .AttachBtn {
            padding: 5px;
            cursor: pointer;
            color: var(--font-primary-color);
            background-color: #994914;
            border-radius: 5px;
            display: flex;
            text-align: center;
            align-items: center;
        }
        & .AttachItem {
            font-size: 12px;
            padding: 5px;
            border-radius: 5px;
            display: flex;
            gap: 5px;
            align-items: center;
            justify-content: space-between;
        }
        & input[type="file"]::file-selector-button {
            border-radius: 4px;
            padding: 0 18px;
            height: 40px;
            cursor: pointer;
            background-color: white;
            border: 1px solid rgba(0, 0, 0, 0.16);
            box-shadow: 0px 1px 0px rgba(0, 0, 0, 0.05);
            margin-right: 18px;
            transition: background-color 200ms;
        }
        
        & input[type="file"]::file-selector-button:hover {
            background-color: #f3f4f6;
        }
        
        & input[type="file"]::file-selector-button:active {
            background-color: #e5e7eb;
        } 
        
        & .inputfile {
            cursor: pointer;
            display: none;
            width: 400px;
            padding: 10px 20px;
            border: none;
            background-color: #f5f5f5;
            color: #000;
            border-radius: 4px;
            transition: background-color 0.3s ease;
        }
    }

`

customElements.define("w-rich-text", WRichText);
export { WRichText }