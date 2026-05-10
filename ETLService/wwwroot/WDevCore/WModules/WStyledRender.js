//@ts-check
import { WRender } from "./WComponentsTools.js";
class WCssClass {
    /**
     * 
     * @param {String} ClassName 
     * @param {any} PropsList 
     */
    constructor(ClassName, PropsList) {
        this.Name = ClassName;
        this.CSSProps = PropsList;
    }
}
/**
 * @typedef {Object.<string, any>} MediaQuery 
 * @property {String} condicion
 * @property {Array<WCssClass>} ClassList
 * **/
/**
 * @typedef {Object.<string, any>} KeyFrame 
 * @property {String} animate
 * @property {Array<WCssClass>} ClassList
 * **/

/**
 * @typedef {Object.<string, any>} StyleConfig
 * @property {Array<WCssClass>} ClassList
 * @property {Array<MediaQuery>} [action]
 * **/

class WStyledRender extends HTMLElement {
    constructor(Config) {
        super();
        for (const p in Config) {
            this[p] = Config[p];
        }
    }
    /**@type {Array} */
    ClassList = new Array();
    /**@type {Array<MediaQuery>} */
    MediaQuery = [];
    /**@type {Array<KeyFrame>} */
    KeyFrame = [];
    attributeChangedCallBack() {
        this.DrawStyle();
    }
    connectedCallback() {
        if (this.innerHTML != "") {
            return;
        }
        this.DrawStyle();
        this.style.display = "none";
    }
    DrawStyle() {
        let styleFrag = {
            type: "style",
            props: {
                innerHTML: "",
            }
        }
        styleFrag.props.innerHTML = styleFrag.props.innerHTML + " " + this.DrawClassList(this.ClassList);

        this.MediaQuery.forEach(MediaQ => {
            let MediaQuery = `@media ${MediaQ.condicion}{
                    ${this.DrawClassList(MediaQ.ClassList)}
                }`;
            styleFrag.props.innerHTML = styleFrag.props.innerHTML + " " + MediaQuery;
        });
        this.KeyFrame.forEach(KeyF => {
            let KeyFrame = `@keyframes ${KeyF.animate} {
                    ${this.DrawClassList(KeyF.ClassList)}
                }`;
            styleFrag.props.innerHTML = styleFrag.props.innerHTML + " " + KeyFrame;
        });

        this.append(WRender.createElement(styleFrag));
    }
    DrawClassList(ClassList) {
        let bodyStyle = "";
        ClassList.forEach(Class => {
            let bodyClass = "";
            if (Class.__proto__ == WCssClass.prototype) {
                for (const prop in Class.CSSProps) {
                    let PropValue = Class.CSSProps[prop];
                    if (typeof PropValue === "number") {
                        PropValue = PropValue + "px"
                    }
                    bodyClass = bodyClass + `${prop}: ${PropValue};`;
                }
                bodyClass = `${Class.Name} {${bodyClass}}`;
                bodyStyle = bodyStyle + bodyClass;
            }
        });
        return bodyStyle;
    }
}
/** 
 * @returns {HTMLStyleElement}
 * @param {any} strings
 * @param {any[]} values
 */
function css(strings, ...values) {
    // Unir las partes de la plantilla de cadena
    const result = strings.reduce((accumulator, currentString, index) => {
        // Añadir la cadena actual
        accumulator += currentString;
        // Si hay un valor correspondiente, añadirlo
        if (index < values.length) {
            accumulator += values[index];
        }
        return accumulator;
    }, '');
    // Crear un nuevo estilo HTML
    const styleElement = document.createElement('style');
    styleElement.textContent = result;

    return styleElement;
};

customElements.define("w-style", WStyledRender);
export { WCssClass, WStyledRender, css };