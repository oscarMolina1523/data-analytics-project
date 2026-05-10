//@ts-check
import { StylesControlsV2 } from "../StyleModules/WStyleComponents.js";
import { ModalVericateAction } from "./ModalVericateAction.js";
import { PageType, WDocumentViewer } from "./WDocumentViewer.js";
import { WModalForm } from "./WModalForm.js";
// @ts-ignore
import { ModelProperty } from "../WModules/CommonModel.js";
import { EntityClass } from "../WModules/EntityClass.js";
import { html } from "../WModules/WComponentsTools.js";
import { css } from "../WModules/WStyledRender.js";
import { WAlertMessage } from "./WAlertMessage.js";

//#region DEFINICION DE TIPOS
export class TemplateData extends EntityClass {
    /** @param {Partial<TemplateData>} [props] */
    constructor(props) {
        super(props, 'DocumentsData');
        // @ts-ignore
        Object.assign(this, props);
    }
    /**@type {Number?} */ Id_Template = null;
    /**@type {String?} */ Description = null;
    /**@type {Array<Section>} */ Sections = [];
}

export class Section {
    /** @param {Partial<Section>} [props] */
    constructor(props) {
        // @ts-ignore
        Object.assign(this, props);
    }
    /**@type {string?} */ Id_Section = null;
    /**@type {Object?} */ Data = null;
    /**@type {any} */ Body;
}

export class TemplateData_ModelComponent extends EntityClass {
    /** @param {Partial<TemplateData_ModelComponent>} [props] */
    constructor(props) {
        super(props, 'DocumentsData');
        // @ts-ignore
        Object.assign(this, props);
    }
    /**@type {ModelProperty} */ Id_Template = { type: "NUMBER", primary: true };
    /**@type {ModelProperty} */ Descripcion = { type: "TEXT" };
    //**@type {ModelProperty} */ Sections =  { type: "NUMBER", primary: true};
}

export class Section_ModelComponent {
    /**@type {ModelProperty} */ Body = { type: "RICHTEXT" }
}
//#endregion
class WTemplateBuilder extends HTMLElement {
    /**
     * @param {{ Data: TemplateData; PageType: string?  }} Config
     */
    constructor(Config) {
        super();
        this.Config = Config ?? {};
        this.TemplateData = this.Config.Data ?? new TemplateData(); // Solo si viene del constructor
        this.attachShadow({ mode: 'open' });
        this.shadowRoot?.append(this.CustomStyle);
        this.OptionsContainer = html`<div class="options-container"></div>`;
        this.DocumentViewer = new WDocumentViewer({
            PageType: this.Config.PageType ?? PageType.A4,
            CustomStyle: this.CustomStyle.cloneNode(true),
            Dataset: this.TemplateData.Sections
                .map(section => this.BuildSectionWrapper(section))
        });
        this.Container = html`<div class="template-builder-container">
            ${this.OptionsContainer}
            ${this.DocumentViewer}
        </div>`
        this.shadowRoot?.append(this.Container, this.CustomStyle, StylesControlsV2.cloneNode(true))

    }
    // Propiedades para gestionar el arrastre
    draggedItem = null;
    dragOverTarget = null;
    connectedCallback() {
        this.Draw();
        if (this.children.length > 0) {
            this.TemplateData.Sections.push(...(Array.from(this.children).map(child => new Section({
                Body: child.outerHTML,
            }))));
            this.DocumentViewer.Dataset.push(...this.TemplateData.Sections
                .map(section => this.BuildSectionWrapper(section)));
            this.DocumentViewer.Update();
        }
    }
    Draw = async () => {
        this.OptionsContainer.append(html`<button class="Btn-Mini"
            onclick="${() => this.AddSection()}">Agregar sección</button>`);
        this.OptionsContainer.append(html`<button class="Btn-Mini"
            onclick="${() => {
                this.shadowRoot?.append(ModalVericateAction(async ()=> {
                    await this.GetTemplateData().Update();
                    WAlertMessage.Success("Cambios guardados", true);
                }, "¿Desea guardar los cambios?"))                
            }}">Guardar</button>`);
    }
    AddSection() {
        this.shadowRoot?.append(new WModalForm({
            ModelObject: new Section_ModelComponent(),
            title: "Nueva",
            ObjectOptions: {
                SaveFunction: (/**@type {Section} */ editingObject) => {
                    const sectionWrapper = this.BuildSectionWrapper(editingObject);
                    // @ts-ignore
                    //newContent.forEach(item => sectionWrapper.append(item));
                    this.DocumentViewer.Dataset?.push(sectionWrapper);
                    this.DocumentViewer.Update();
                }
            }
        }));
    }
    /**
     * @param { Section } editingObject
     */
    BuildSectionWrapper(editingObject) {
        const sectionWrapper = html`<div class="section-wrapper"></div>`;
        // @ts-ignore
        sectionWrapper.sectionWrapper = editingObject;
        const newContent = this.BuildWrappercontent(editingObject, sectionWrapper);
        sectionWrapper.append(...newContent);
        return sectionWrapper;
    }

    /**
     * @param {any} editingO
     * @param {HTMLElement} sectionWrapper
     */
    EditSection(editingO, sectionWrapper) {
        this.shadowRoot?.append(new WModalForm({
            ModelObject: new Section_ModelComponent(),
            EditObject: editingO,
            title: "Editar",
            ObjectOptions: {
                SaveFunction: (/**@type {Section} */ editingObject) => {
                    sectionWrapper.innerHTML = "";
                    // @ts-ignore
                    sectionWrapper.append(...this.BuildWrappercontent(editingObject, sectionWrapper));
                    this.DocumentViewer.Update();
                }
            }
        }));
    }
    /**
     * @param {any} editingObject
     * @param {HTMLElement} sectionWrapper
     * @returns {Array<Node>}
     */
    BuildWrappercontent(editingObject, sectionWrapper) {
        // 1. Habilitar arrastre y adjuntar manejadores de eventos
        sectionWrapper.setAttribute("draggable", "true");
        sectionWrapper.addEventListener("dragstart", this.dragStart);
        sectionWrapper.addEventListener("dragover", this.dragOver);
        sectionWrapper.addEventListener("drop", this.drop);
        sectionWrapper.addEventListener("dragend", this.dragEnd); // Limpieza al finalizar
        // @ts-ignore
        return html`<div class="section-wrapper-option">
            <button onclick="${() => this.EditSection(editingObject, sectionWrapper)}">Edit</button>
            <button onclick="${() => this.DeleteSection(editingObject, sectionWrapper)}">Delete</button>
        </div>
        <div class="section-wrapper-content">${editingObject.Body}</div>`;
    }
    /**
     * @param {any} editingObject
     * @param {HTMLElement} sectionWrapper
     */
    DeleteSection(editingObject, sectionWrapper) {
        this.shadowRoot?.append(ModalVericateAction(() => {
            sectionWrapper.remove();
            this.DocumentViewer.Dataset?.splice(this.DocumentViewer.Dataset?.indexOf(editingObject), 1);
        }, "¿Esta seguro que desea eliminar esta sección?"))
    }

    Update() {
        this.Draw();
    }

    GetTemplateData() {
        this.TemplateData.Sections = this.DocumentViewer
            .Dataset.map((/**@type {HTMLElement} */ node) =>
                new Section({ Body: node?.querySelector(".section-wrapper-content")?.innerHTML }));
        return this.TemplateData;
    }

    // --- MÉTODOS DE DRAG AND DROP ---
    //#region EVENTOS DRAG AN DROP

    /** @param {DragEvent} e */
    dragStart = (e) => {
        // @ts-ignore
        const target = e.target?.closest(".section-wrapper");
        if (target) {
            this.draggedItem = target;
            // @ts-ignore
            e.dataTransfer.effectAllowed = 'move';
            // @ts-ignore
            e.dataTransfer.setData('text/html', ''); // Dato ficticio, necesario para algunos navegadores

            // Efecto visual para el elemento que se está arrastrando
            setTimeout(() => {
                target.style.opacity = '0.4';
            }, 0);
        }
    }

    /** @param {DragEvent} e */
    dragOver = (e) => {
        // @ts-ignore
        const target = e.target.closest(".section-wrapper");
        // La condición clave: asegurar que el destino es una sección, no es el elemento que se arrastra, 
        // y está dentro del DocumentViewer (el contenedor permitido).
        if (target && target !== this.draggedItem && target.parentNode.contains(target)) {
            e.preventDefault(); // Permite que el evento 'drop' se dispare
            // @ts-ignore           
            e.dataTransfer.dropEffect = 'move';
            // Limpiar borde del target anterior
            if (this.dragOverTarget && this.dragOverTarget !== target) {
                // @ts-ignore
                this.dragOverTarget.style.borderTop = '';
                // @ts-ignore
                this.dragOverTarget.style.borderBottom = '';
            }

            const rect = target.getBoundingClientRect();
            const y = e.clientY - rect.top;

            // Determinar si insertar antes (mitad superior) o después (mitad inferior)
            if (y < rect.height / 2) {
                target.style.borderTop = 'dashed 3px var(--success-color, #4CAF50)';
                target.style.borderBottom = '';
            } else {
                target.style.borderTop = '';
                target.style.borderBottom = 'dashed 3px var(--success-color, #4CAF50)';
            }
            this.dragOverTarget = target;
        } else {
            // Limpiar borde si el arrastre no está sobre un target válido
            if (this.dragOverTarget) {
                // @ts-ignore
                this.dragOverTarget.style.borderTop = '';
                // @ts-ignore
                this.dragOverTarget.style.borderBottom = '';
                this.dragOverTarget = null;
            }
        }
    }

    /** @param {DragEvent} e */
    drop = (e) => {
        e.preventDefault();
        if (!this.draggedItem || !this.dragOverTarget) return;
        // @ts-ignore
        this.draggedItem.style.opacity = ''; // Restablecer opacidad
        const source = this.draggedItem;
        const target = this.dragOverTarget;
        // @ts-ignore
        const isInsertBefore = target.style.borderTop;

        // Limpiar bordes
        // @ts-ignore
        target.style.borderTop = '';
        // @ts-ignore
        target.style.borderBottom = '';
        this.dragOverTarget = null;

        // Mover el elemento en el DOM
        if (isInsertBefore) {
            // @ts-ignore
            target.parentNode.insertBefore(source, target);
        } else {
            // Insertar después del elemento target
            // @ts-ignore
            target.parentNode.insertBefore(source, target.nextSibling);
        }

        // Restablecer estado de arrastre
        this.draggedItem = null;

        // Sincronizar el Dataset interno
        this.updateDatasetOrder();
    }

    /** @param {DragEvent} e */
    // @ts-ignore
    dragEnd = (e) => {
        // Limpieza final si se cancela o finaliza el arrastre
        if (this.draggedItem) {
            // @ts-ignore
            this.draggedItem.style.opacity = '';
        }
        if (this.dragOverTarget) {
            // @ts-ignore
            this.dragOverTarget.style.borderTop = '';
            // @ts-ignore
            this.dragOverTarget.style.borderBottom = '';
        }
        this.draggedItem = null;
        this.dragOverTarget = null;
    }
    //#endregion

    /**
     * Sincroniza el Dataset interno del DocumentViewer con el orden actual del DOM.
     */
    updateDatasetOrder = () => {
        /**
         * @type {Element[]}
         */
        const newDataset = [];
        // Seleccionamos todas las secciones dentro del DocumentViewer
        const sectionsInDOM = this.DocumentViewer.shadowRoot?.querySelectorAll(".section-wrapper");
        sectionsInDOM?.forEach(section => {
            newDataset.push(section);
        });
        // Reemplazar el Dataset con el nuevo orden
        this.DocumentViewer.Dataset = newDataset;
    }

    CustomStyle = css`
        .options-container {
            padding: 10px;
        }
        .template-builder-container{
            display: flex;
            flex-direction: column;
            height: 100%;
            box-sizing: border-box;
        }
        w-document-viewer {
            height: calc(100% - 50px);
            box-sizing: border-box;
            display: block;
        }
        .section-wrapper{
            /* Agregamos cursor: grab para indicar que es arrastrable */
            cursor: grab;
        }
        /* ... (rest of the CustomStyle is unchanged) ... */
        .section-wrapper {
            width: 100%;
            display: block;
            border-bottom: dashed 2px #cac9c9;
            padding: 10px 0;
            position: relative;
            padding-top: 20px;
            cursor: grab; /* Indica que es arrastrable */
            .section-wrapper-option {
                position: absolute;
                right: 10px;
                top:5px;
                button {
                    height: 20px;
                    font-size: 10px;
                    background-color: #0873a5;
                    cursor: pointer;
                    border: none;
                    border-radius: 5px;
                    color: #fff;
                }
            }

        } 
     `
}
customElements.define('w-template-builder', WTemplateBuilder);
export { WTemplateBuilder }