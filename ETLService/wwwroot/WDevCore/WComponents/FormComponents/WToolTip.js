//@ts-check

import { html, WRender } from "../../WModules/WComponentsTools.js";
import { css } from "../../WModules/WStyledRender.js";


export class WToolTip extends HTMLElement {
	constructor(Element, withCloseOption = true) {
		super();
		this.append(html`<div class="tool-container">
			${withCloseOption == true ? html`<span class="close-button" onclick="${()=> this.remove()}">X</span>`: ""}
			${Element}
		</div>`)
		this.append(css`
			w-tooltip{
				position: absolute;
				width:  100%;
				z-index: 1;
				transition: all .1s;
				max-height: 0px;
				background-color: var(--secundary-color);
				overflow: hidden;  
				left: 0;      
				top: 0;       
			}
			w-tooltip.tool-active {
				max-height: 400px;
				overflow: auto;
			}
			.tool-container {
				position: relative;
			}
			.close-button {
				position: absolute;
				top: 5px;
				right: 15px;
				background: none;
				border: none;
				font-size: 1.2em;
				cursor: pointer;
				color: var(--font-primary-color);
				z-index: 1;
			}
		`)
	}
	connectedCallback() {
		this.Display()
	}
	disconnectedCallback() {
		this.className = this.className.replace("tool-active", "");
	}
	Display = async () => {
		setTimeout(() => {
			if (this.className.includes("tool-active")) {
				this.className = this.className.replace("tool-active", "");
			} else {
				this.className += " tool-active"
			}
		}, 100);
	}
	DisplayOptions = (node) => {
		if (!node.querySelector("w-tooltip") || (node.shadowRoot && node.shadowRoot.querySelector("w-tooltip") == null)) {
			if (node.shadowRoot) {
				node.shadowRoot.append(this)
				const tooltipRect = this.getBoundingClientRect();
				//console.log(tooltipRect, this.offsetHeight, window.innerHeight);
				const viewportHeight = window.innerHeight;
				if (tooltipRect.bottom + 400 > viewportHeight) {
					// @ts-ignore
					//this.style = 'top: auto !important ; bottom : 100%';
				} else {
					//this.style.top = '100%';
					//this.style.bottom = 'auto';
				}
			} else {
				node.append(this)
			}
		}
		else {
			this.remove();
		}
	}

}
customElements.define('w-tooltip', WToolTip);
