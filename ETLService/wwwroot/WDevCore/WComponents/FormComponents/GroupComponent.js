//@ts-check

import { html } from "../../WModules/WComponentsTools.js";
import { WOrtograficValidation } from "../../WModules/WOrtograficValidation.js";
import { css } from "../../WModules/WStyledRender.js";

export class GroupComponent extends HTMLElement {
	/**
	 * @typedef {Object.<string, any>} GroupConfig
	 * @property {string} [Name]
	 * @property {boolean} [WithAcordeon]
	 * @property {string} [className]
	 */

	/**
	 * @param {GroupConfig} Config
	 */
	constructor(Config) {
		super();
		/** @type {GroupConfig} */
		this.Config = Config;
		this.classList.add(Config.className ?? "div");
		this.classList.add(Config.Name?.replaceAll(" ", "") ?? "formulario");
		this.Content = html`<div class="group-content divForm"></div>`;
		this.nodesList = [];
	}

	connectedCallback() {
		this.Render();
	}

	Render(group = this.Config) {
		const groupContainer = html`<div class="group-container"></div>`;
		// Agregar el título si existe
		if (group.Name) {
			const title = html`<h2 class="group-title">${WOrtograficValidation.es(group.Name)}</h2>`;
			groupContainer.appendChild(title);
		}
		// Agregar la funcionalidad de acordeón si WithAcordeon es true
		if (group.WithAcordeon) {
			// Ocultar el contenedor de propiedades inicialmente
			this.Content.style.display = 'none';

			// Crear un contenedor para el ícono de toggle
			const toggleIcon = html`<div class="toggle-icon">
					<svg class="icon" viewBox="0 0 24 24" width="24" height="24">
						<path d="M7 10l5 5 5-5z" />
					</svg>
				</div>`;

			// Agregar un evento al ícono para mostrar/ocultar las propiedades
			toggleIcon.addEventListener('click', () => {
				if (this.Content.style.display === 'none') {
					this.Content.style.display = 'block';
					toggleIcon.classList.add('open');
				} else {
					this.Content.style.display = 'none';
					toggleIcon.classList.remove('open');
				}
			});

			// Agregar el ícono y el contenedor de propiedades al grupo
			groupContainer.appendChild(toggleIcon);
		}

		// Agregar el contenedor de propiedades al grupo
		groupContainer.appendChild(this.Content);
		this.innerHTML = '';
		this.append(this.CustomStyles);
		this.appendChild(groupContainer);
	}

	ClearGroup() {
		this.Content.innerHTML = "";
	}

	Add(node) {
		this.nodesList.push(node)
		this.Content.append(node);
	}

	AddAll(nodeList = []) {
		nodeList.forEach(node => {
			this.Content.append(node);
		});
	}

	CustomStyles = css`
		.group-container {
			border-radius: 8px;
			margin: 10px 0;
			padding: 10px;
			position: relative;
			background-color: var(--primary-color);
		}

		.group-title {
			margin: 0;
			padding: 5px;			
			font-size: 1.2em;
			color: var(--font-primary-color);
			border-bottom: 1px solid var(--fifty-color);
			text-transform: capitalize;
		}

		.toggle-icon {
			position: absolute;
			top: 10px;
			right: 10px;
			cursor: pointer;
			width: 24px;
			height: 24px;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: transform 0.3s ease;
		}

		.toggle-icon .icon {
			fill: #007bff;
			transition: fill 0.3s ease;
		}

		.toggle-icon:hover .icon {
			fill: #0056b3;
		}

		.toggle-icon.open {
			transform: rotate(180deg);
		}

		.properties-container {
			padding: 10px;
			background-color: #fff;
			border-radius: 4px;
			margin-top: 10px;
		}

		.property {
			padding: 8px;
			border-bottom: 1px solid #e0e0e0;
		}

		.property:last-child {
			border-bottom: none;
		}
	`;
}

// Definir el nuevo elemento personalizado
customElements.define('group-component', GroupComponent);