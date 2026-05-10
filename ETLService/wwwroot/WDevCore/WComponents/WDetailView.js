//@ts-check  
import { WRender } from '../WModules/WComponentsTools.js';
import { WOrtograficValidation } from '../WModules/WOrtograficValidation.js';
import { css } from '../WModules/WStyledRender.js';
/**
   * @typedef {Object} DetailViewConfig
   * @property {Object} Entity - instancia con los datos reales
   * @property {Object} ModelObject - instancia del modelo (con propiedades tipo ModelProperty)
   * @property {Array<{Name: string, Propertys: string[]}>} [Groups]
   * @property {string} [Title]
   * @property {string} [ImageUrlPath]
   */

class WDetailView extends HTMLElement {
    /**
     * @param {DetailViewConfig} [config]
     */
    constructor(config) {
        super();
        this.config = config;
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    connectedCallback() {
        if (!this.shadowRoot?.hasChildNodes()) this.render();
    }

    render() {
        const { Entity, ModelObject, Groups, Title, ImageUrlPath = '' } = this.config;

        if (!ModelObject || !Entity) {
            this.shadowRoot.innerHTML = `<div style="color:red;padding:20px;">⚠️ WDetailView: ModelObject y Entity son requeridos.</div>`;
            return;
        }

        // --- Estilo
        this.shadowRoot.innerHTML = '';
        this.shadowRoot?.appendChild(this.WDetailViewStyle.cloneNode(true));

        // --- Contenedor principal
        const container = WRender.Create({ class: 'w-detail-container' });
        if (Title) {
            container.appendChild(WRender.Create({ class: 'w-detail-title', textContent: Title }));
        }

        // --- Agrupar propiedades
        const allProps = Object.keys(ModelObject).filter(prop => !this.isNotDrawable(ModelObject, prop));
        const groupedProps = this.groupProperties(allProps, Groups);

        // --- Renderizar cada grupo
        for (const [groupName, props] of Object.entries(groupedProps)) {
            const groupDiv = WRender.Create({ class: 'w-group-container' });
            if (groupName !== 'default') {
                const titleEl = WRender.Create({ class: 'w-group-title', textContent: groupName });
                groupDiv.appendChild(titleEl);
            }

            const rows = this.createRows(props, ModelObject, Entity, ImageUrlPath);
            groupDiv.append(...rows);
            container.appendChild(groupDiv);
        }

        this.shadowRoot.appendChild(container);
    }

    /**
     * @param {string[]} allProps
     * @param {Array<{Name: string, Propertys: string[]}> | undefined} Groups
     * @returns {Record<string, string[]>}
     */
    groupProperties(allProps, Groups) {
        const grouped = { default: /** @type {string[]} */([]) };
        const assigned = new Set();

        if (Groups && Groups.length) {
            Groups.forEach(group => {
                grouped[group.Name] = (group.Propertys || []).filter(p => allProps.includes(p));
                grouped[group.Name].forEach(p => assigned.add(p));
            });
        }

        // No asignados → grupo "default"
        allProps.forEach(p => {
            if (!assigned.has(p)) {
                grouped.default.push(p);
            }
        });

        // Eliminar grupo vacío 'default' si no tiene props
        if (grouped.default.length === 0) delete grouped.default;

        return grouped;
    }

    /**
     * @param {string[]} props
     * @param {Object} ModelObject
     * @param {Object} Entity
     * @param {string} ImageUrlPath
     * @returns {HTMLElement[]}
     */
    createRows(props, ModelObject, Entity, ImageUrlPath) {
        const rows = [];
        let currentRow = WRender.Create({ class: 'w-row' });

        props.forEach((prop, idx) => {
            const modelProp = ModelObject[prop];
            if (!modelProp || !modelProp.type) return;

            // Evaluar visibilidad/deshabilitado (como en WForm)
            const { isHidden } = this.EvalHiddenDisabled(modelProp, Entity);
            if (isHidden || modelProp.primary) return;

            const fieldEl = this.renderField(prop, modelProp, Entity[prop], Entity, ImageUrlPath);
            currentRow.appendChild(fieldEl);

            // Un campo por fila si es largo (img, richtext, masterdetail)
            const isFullWidth = ['IMG', 'IMAGES', 'FILE', 'FILES', 'RICHTEXT', 'MASTERDETAIL', 'MODEL'].includes(modelProp.type.toUpperCase());
            if (isFullWidth || (idx + 1) % 2 === 0 || idx === props.length - 1) {
                rows.push(currentRow);
                currentRow = WRender.Create({ class: 'w-row' });
            }
        });

        if (currentRow.children.length > 0) {
            rows.push(currentRow);
        }

        return rows;
    }

    /**
     * @param {string} propName
     * @param {import('../WModules/CommonModel.js').ModelProperty} modelProp
     * @param {any} value
     * @param {Object} Entity
     * @param {string} ImageUrlPath
     * @returns {HTMLElement}
     */
    renderField(propName, modelProp, value, Entity, ImageUrlPath) {
        const label = modelProp.label ?? WOrtograficValidation.es(propName);
        const field = WRender.Create({ class: 'w-field' });
        const labelEl = WRender.Create({ class: 'w-label', textContent: label });
        const valueEl = WRender.Create({ class: 'w-value' });

        let displayValue = this.formatValue(modelProp, value, Entity, ImageUrlPath);
        if (displayValue == null || displayValue === '') {
            valueEl.classList.add('empty');
            valueEl.textContent = '—';
        } else if (typeof displayValue === 'string') {
            valueEl.textContent = displayValue;
        } else {
            valueEl.appendChild(displayValue);
        }

        field.append(labelEl, valueEl);
        return field;
    }

    /**
     * @param {import('../WModules/CommonModel.js').ModelProperty} modelProp
     * @param {any} value
     * @param {Object} Entity
     * @param {string} ImageUrlPath
     * @returns {string | HTMLElement}
     */
    formatValue(modelProp, value, Entity, ImageUrlPath) {
        const type = modelProp.type.toUpperCase();

        if (type === 'IMG' || type === 'IMAGE') {
            if (!value) return '';
            let src = value;
            if (typeof value === 'string' && !value.startsWith('data:') && !value.startsWith('http')) {
                src = ImageUrlPath + value;
            }
            const img = WRender.Create({ tagName: 'img', src });
            return img;
        }

        if (type === 'DATE' || type === 'DATETIME') {
            if (!value) return '';
            const date = new Date(value);
            return isNaN(date.getTime())
                ? String(value)
                : date.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    ...(type === 'DATETIME' && { hour: '2-digit', minute: '2-digit' })
                });
        }

        if (type === 'SELECT' || type === 'RADIO') {
            if (Array.isArray(modelProp.Dataset)) {
                return modelProp.Dataset[value] ?? value ?? '';
            }
            if (typeof modelProp.Dataset === 'function') {
                const dataset = modelProp.Dataset(Entity);
                return dataset[value] ?? value ?? '';
            }
            return value ?? '';
        }

        if (type === 'MASTERDETAIL') {
            if (!Array.isArray(value) || value.length === 0) return '—';
            if (!modelProp.ModelObject) return JSON.stringify(value, null, 2);

            // Renderizar como tabla pequeña
            try {
                const subModel =  modelProp.ModelObject.__proto__ == Function.prototype 
                ?  modelProp.ModelObject() : modelProp.ModelObject;
                const keys = Object.keys(subModel).filter(k => !this.isNotDrawable(subModel, k));
                const visibleKeys = keys.filter(k => {
                    const mp = subModel[k];
                    const { isHidden } = this.EvalHiddenDisabled(mp, {});
                    return !isHidden && mp.type && !mp.primary;
                }).slice(0, 3); // máximo 3 columnas

                const table = WRender.Create({ tagName: 'table', class: 'w-nested-table' });
                const thead = WRender.Create({ tagName: 'thead' });
                const headerRow = WRender.Create({ tagName: 'tr' });
                visibleKeys.forEach(k => {
                    const th = WRender.Create({ tagName: 'th', textContent: subModel[k].label ?? WOrtograficValidation.es(k) });
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);
                table.appendChild(thead);

                const tbody = WRender.Create({ tagName: 'tbody' });
                value.slice(0, 5).forEach(item => {
                    const row = WRender.Create({ tagName: 'tr' });
                    visibleKeys.forEach(k => {
                        const td = WRender.Create({ tagName: 'td' });
                        const cellModel = /** @type {import('../WModules/CommonModel.js').ModelProperty} */ (subModel[k]);
                        const cellValue = this.formatValue(cellModel, item[k], item, '');
                        if (typeof cellValue === 'string') {
                            td.textContent = cellValue;
                        } else {
                            td.appendChild(cellValue);
                        }
                        row.appendChild(td);
                    });
                    tbody.appendChild(row);
                });
                table.appendChild(tbody);

                if (value.length > 5) {
                    const moreRow = WRender.Create({ tagName: 'tr' });
                    const moreCell = WRender.Create({ tagName: 'td', colSpan: visibleKeys.length, style: 'text-align:center;font-style:italic;' });
                    moreCell.textContent = `+ ${value.length - 5} más…`;
                    moreRow.appendChild(moreCell);
                    tbody.appendChild(moreRow);
                }

                return table;
            } catch (e) {
                console.warn('Error rendering masterdetail', e);
                return `<${value.length} registros>`;
            }
        }

        if (type === 'RICHTEXT') {
            if (!value) return '';
            const pre = WRender.Create({ tagName: 'pre' });
            pre.textContent = value;
            return pre;
        }

        if (type === 'OPERATION') {
            if (typeof modelProp.action === 'function') {
                try {
                    const result = modelProp.action(Entity, this);
                    const span = WRender.Create({ class: 'w-operation-value' });
                    span.textContent = String(result);
                    return span;
                } catch (e) {
                    return `[ERROR: ${e.message}]`;
                }
            }
            return String(value);
        }

        if (type === 'MODEL') {
            if (!value || typeof value !== 'object') return value ?? '';
            if (!modelProp.ModelObject) return JSON.stringify(value, null, 2);

            try {
                const subModel = modelProp.ModelObject();
                const subView = new WDetailView({
                    Entity: value,
                    ModelObject: subModel,
                    Groups: [], // sin grupos anidados (solo campos planos)
                });
                return subView;
            } catch (e) {
                return JSON.stringify(value, null, 2);
            }
        }

        // Default: texto plano
        if (value == null) return '';
        if (typeof value === 'object') return JSON.stringify(value, null, 2);
        return String(value);
    }

    /**
     * Copia de la lógica de WForm para evaluar hidden/disabled (sin side effects)
     */
    EvalHiddenDisabled(modelProperty, target) {
        let isHidden = false;
        if (typeof modelProperty.hidden === "function") {
            isHidden = Boolean(modelProperty.hidden(target, this));
        } else {
            isHidden = Boolean(modelProperty.hidden);
        }
        let isDisabled = false;
        if (typeof modelProperty.disabled === "function") {
            isDisabled = Boolean(modelProperty.disabled(target, this));
        } else {
            isDisabled = Boolean(modelProperty.disabled);
        }
        return { isHidden, isDisabled };
    }

    /**
     * @param {Object} Model
     * @param {string} prop
     */
    isNotDrawable(Model, prop) {
        if (Model[prop] == null) return true;
        return (Model[prop]?.__proto__ == Object.prototype &&
            (!Model[prop]?.type))
            || Model[prop]?.__proto__ == Function.prototype
            || Model[prop]?.constructor?.name === "AsyncFunction"
            || prop === "FilterData" || prop === "OrderData";
    }

    WDetailViewStyle = css`.w-detail-container {
    font-family: Arial, sans-serif;
    max-width: 900px;
    margin: 0 auto;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }
  .w-detail-title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 24px;
    color: #333;
    text-align: center;
  }
  .w-group-container {
    margin-bottom: 32px;
    border-bottom: 1px solid #eee;
    padding-bottom: 16px;
  }
  .w-group-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 16px 0 12px;
    color: #444;
    padding-left: 4px;
    border-left: 4px solid #1e88e5;
  }
  .w-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
    margin-bottom: 12px;
  }
  .w-field {
    display: flex;
    flex-direction: column;
  }
  .w-label {
    font-weight: 600;
    font-size: 0.875rem;
    color: #555;
    margin-bottom: 4px;
  }
  .w-value {
    font-size: 1rem;
    color: #333;
    word-break: break-word;
    min-height: 1.5em;
  }
  .w-value.empty { color: #999; font-style: italic; }
  .w-value img {
    max-width: 120px;
    max-height: 120px;
    object-fit: cover;
    border-radius: 6px;
    margin-top: 6px;
    display: block;
  }
  .w-value pre {
    background: #f9f9f9;
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
    white-space: pre-wrap;
    font-family: monospace;
    font-size: 0.9rem;
  }
  .w-nested-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
    font-size: 0.9rem;
  }
  .w-nested-table th {
    background: #f5f5f5;
    text-align: left;
    padding: 6px 10px;
    font-weight: 600;
    border-bottom: 2px solid #ddd;
  }
  .w-nested-table td {
    padding: 6px 10px;
    border-bottom: 1px solid #eee;
  }
  .w-nested-table tr:last-child td {
    border-bottom: none;
  }
  .w-operation-value {
    background: #e3f2fd;
    padding: 6px 10px;
    border-radius: 4px;
    font-weight: 500;
  }`
}

customElements.define('w-detail-view', WDetailView);

// --- Export for module usage
export { WDetailView };