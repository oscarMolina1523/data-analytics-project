//@ts-check

import { html } from "../../WModules/WComponentsTools.js";
import { css } from "../../WModules/WStyledRender.js";
/**
* @typedef {Object.<string, any>} ZoomControlConfig
* @property {HTMLElement[]} Nodes
*/

export class ZoomControl extends HTMLElement {

	/**
	 * @param {ZoomControlConfig} Config
	 */
	constructor(Config) {
		super();
		this.zoom = 1;
		/** @type {number} */
		this.minZoom = 0.5;
		/** @type {number} */
		this.maxZoom = 3;
		/** @type {number} */
		this.stepZoom = 0.1;
		/** @type {HTMLElement[]} */
		this.Nodes = Config.Nodes;
		this.attachShadow({ mode: 'open' });
		this.zoomSpam = html`<span>${(this.zoom * 100).toFixed(0)}%</span>`;
		this.shadowRoot?.append(this.CustomStyle);
	}

	connectedCallback() {
		this.render();
		this.addEventListener("wheel", this.handleWheel);
	}

	disconnectedCallback() {
		this.removeEventListener("wheel", this.handleWheel);
	}

	handleWheel = (event) => {
		event.preventDefault();
		this.zoom += event.deltaY > 0 ? -this.stepZoom : this.stepZoom;
		this.applyZoom();
	};

	zoomIn = () => {
		this.zoom = Math.min(this.zoom + this.stepZoom, this.maxZoom);
		this.applyZoom();
	}

	zoomOut = () => {
		this.zoom = Math.max(this.zoom - this.stepZoom, this.minZoom);
		this.applyZoom();
	}

	applyZoom = () => {
		this.zoomSpam.innerHTML = `${(this.zoom * 100).toFixed(0)}%`;
		this.Nodes.forEach(node => {
			node.style.zoom = `${this.zoom}`;
		});
	}

	render = () => {
		this.shadowRoot?.append(html`<div class="controls">
			<button onclick="${this.zoomOut}">-</button>
			${this.zoomSpam}
			<button onclick="${this.zoomIn}">+</button>
			<button onclick="${this.resetZoom}">
				<svg fill="#000000" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">					
					<g id="SVGRepo_iconCarrier">
						<path d="M0 16q0-2.784 1.088-5.312t2.912-4.384 4.384-2.912 5.344-1.088q2.784 0 5.312 1.088t4.384 2.912 2.912 4.384 1.088 5.312h2.304q0.736 0 1.28 0.416t0.8 1.024 0.16 1.28-0.64 1.184l-4.576 4.576q-0.672 0.672-1.6 0.672t-1.632-0.672l-4.576-4.576q-0.512-0.512-0.608-1.184t0.128-1.28 0.8-1.024 1.312-0.416h2.272q0-2.464-1.216-4.576t-3.328-3.328-4.576-1.216-4.608 1.216-3.328 3.328-1.216 4.576 1.216 4.608 3.328 3.328 4.608 1.216q1.728 0 3.36-0.64l3.424 3.392q-3.136 1.824-6.784 1.824-2.816 0-5.344-1.088t-4.384-2.912-2.912-4.384-1.088-5.344z">
						</path>
					</g>
				</svg>
			</button>			
		</div>`);
	}
	resetZoom = () => {
		this.zoom = 1; // 🔄 Restablece el zoom a 100%
		this.applyZoom();
	}
	CustomStyle = css`
		:host {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 10px;
		}
		.zoom-container {
			overflow: auto;
			border: 1px solid #ccc;
			padding: 10px;
			display: inline-block;
			transform-origin: center;
		}
		.controls {
			display: flex;
			gap: 5px;
			align-items: center;
			button {
				padding: 5px;
				border: none;
				background-color: unset;
				color: #000;
				cursor: pointer;
				border-radius: 5px;
				font-weight: bold;
				font-size: 20px;
				svg {
					height: 15px;
					width: 15px;
				}
			}
		}
		`;
}

customElements.define("zoom-control", ZoomControl);
