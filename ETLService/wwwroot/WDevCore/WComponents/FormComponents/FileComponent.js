//@ts-check

import { ModelFiles } from "../../WModules/CommonModel.js";
import { html } from "../../WModules/WComponentsTools.js";
import { css } from "../../WModules/WStyledRender.js";

export class FileComponent extends HTMLElement {

	/**
	 * @param {{ 
	 * Multiple?: boolean;
	 * Types?: string[];
	 * action?: (file)=> {}; 
	 * Files?: string[];
	 * require?: Boolean;
	 * disabled?: Boolean;
	 * }} Config
	 */
	constructor(Config) {
		super();
		this.Config = Config;
		/**@type {Array<{ name: string, type: string, data: string }>} */
		this._files = []; // Almacena los archivos en Base64
		this._multiple = Config.Multiple ?? false; // Permite múltiples archivos
		this._types = Config.Types ?? []; // Tipos de archivos permitidos
		this.require = Config.require ?? true;
		this.preview = html`<div id="file-preview"></div>`;
		// @ts-ignore
		this.preview.className = this._multiple ? "multiple" : "single"
		// @ts-ignore
		this.attachShadow({ mode: 'open' }); // Crea el Shadow DOM
	}


	connectedCallback() {
		this.render();
	}

	// Renderiza el componente
	async render() {
		// @ts-ignore
		this.shadowRoot.innerHTML = "";
		await this.mapConfigFilesToInternalFormat();
		/**@type {HTMLInputElement} */
		// @ts-ignore
		const inputControl = html`<input type="file" id="file-input" style="display:none">`
		const inputControlWrapper = html`<label for="file-input" class="custom-file-label">Seleccionar archivo</label>`;
		//console.log( this.getAcceptTypes());
		
		inputControl.accept = this.getAcceptTypes();
		inputControl.disabled = this.Config.disabled ?? false;
		inputControl.multiple = this._multiple ?? false;
		this.shadowRoot?.append(html`<div class="file-uploader">
			${this.styles()}
			${inputControl}
			${inputControlWrapper}
			${this.preview}
		</div>`);

		// Escucha el evento de cambio en el input de archivos
		const fileInput = this.shadowRoot?.getElementById('file-input');
		fileInput?.addEventListener('change', (e) => this.handleFileUpload(e));
		this._files.forEach(fileInArray => {
			// @ts-ignore
			this.renderFile({ name: fileInArray.name, type: fileInArray.type, data: fileInArray.data });
		});
	}

	// Maneja la subida de archivos
	handleFileUpload(event) {
		const files = event.target.files;
		if (!files.length) return;
		this._files.length = 0;

		for (const file of files) {
			if (!this.isFileTypeAllowed(file.type)) {
				alert(`Tipo de archivo no permitido: ${file.type}`);
				continue;
			}
			const reader = new FileReader();
			reader.onload = (e) => {
				if (this._multiple) {
					// @ts-ignore
					this._files.push({ name: file.name, type: file.type, data: e.target.result });
				} else {
					// @ts-ignore
					this._files = [{ name: file.name, type: file.type, data: e.target.result }]
				}

				if (this.Config.action) {
					this.Config.action(this._multiple ? this._files : this._files[0]);
				}
				this.preview.innerHTML = "";
				this._files.forEach(fileInArray => {
					// @ts-ignore
					this.renderFile({ name: fileInArray.name, type: fileInArray.type, data: fileInArray.data });
				});
				
			};
			reader.readAsDataURL(file); // Convierte el archivo a Base64
		}
	}

	// Renderiza el archivo según su tipo
	renderFile(file) {	
		
		let fileElement;
		if (file.type.startsWith('image/')) {
			fileElement = html`<div class="file-item">
				<img src="${file.data}" alt="${file.name}" class="file-image">
				<span>${file.name}</span>
			</div>`;
		} else if (file.type === 'application/pdf') {
			fileElement = html`<div class="file-item">
				<iframe src="${file.data}" class="file-pdf"></iframe>
				<span>${file.name}</span>
			</div>`;
		} else {
			fileElement = html`<div class="file-item">
				<span>${file.name} (Tipo no soportado)</span>
			</div>`;
		}

		this.preview?.appendChild(fileElement);
	}

	// Verifica si el tipo de archivo está permitido
	isFileTypeAllowed(fileType) {
		if (this._types.length === 0) return true; // Si no hay restricciones, permite cualquier tipo

		const allowedTypes = this._types.map(type => {
			if (type === 'img' || type === 'image/*') return 'image/';
			if (type === 'pdf') return 'application/pdf';
			return type;
		});

		return allowedTypes.some(allowedType => fileType.startsWith(allowedType));
	}

	// Obtiene los tipos de archivo permitidos para el atributo "accept"
	getAcceptTypes() {
		return this._types.map(type => {
			if (type === 'img') return 'image/*';
			if (type === 'pdf') return 'application/pdf';
			return type;
		}).join(', ');
	}
	/**
	 * Mapea los archivos en formato Base64 o URLs (Config.Files) al formato de this._files.
	 * Inferimos el tipo MIME a partir del prefijo del string Base64 o de la extensión de la URL.
	 */
	async mapConfigFilesToInternalFormat() {
		if (!this.Config.Files || !Array.isArray(this.Config.Files)) return;

		for (const file of this.Config.Files) {
			let mimeType, fileBase64;

			if (file.startsWith('http://') || file.startsWith('https://') || file.startsWith('/') || file.startsWith('\\')) {
				// Es una URL: convertirla a Base64
				const response = await fetch(file);
				const blob = await response.blob();
				fileBase64 = await this.blobToBase64(blob);
				mimeType = blob.type; // Obtener el tipo MIME del blob
			} else if (file.startsWith('data:')) {
				// Es un string Base64: extraer el tipo MIME
				fileBase64 = file;
				mimeType = this.getMimeTypeFromBase64(file);
			} else {
				console.warn(`Formato no soportado: ${file}`);
				continue;
			}

			// Verifica si el tipo de archivo está permitido
			if (this.isFileTypeAllowed(mimeType)) {
				// Genera un nombre de archivo único (puedes personalizarlo)
				const fileName = `file_${Date.now()}.${mimeType.split('/')[1]}`;

				// Agrega el archivo a this._files
				this._files.push({
					name: fileName,
					type: mimeType,
					data: fileBase64,
				});
			} else {
				console.warn(`Tipo de archivo no permitido: ${mimeType}`);
			}
		}
	}

	/**
	 * Convierte un Blob a Base64.
	 * @param {Blob} blob - El Blob a convertir.
	 * @returns {Promise<string>} - El string Base64.
	 */
	blobToBase64(blob) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			// @ts-ignore
			reader.onloadend = () => resolve(reader.result);
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	}

	/**
	 * Extrae el tipo MIME de un string Base64.
	 * @param {string} base64 - El string Base64.
	 * @returns {string} - El tipo MIME (por ejemplo, "image/png").
	 */
	getMimeTypeFromBase64(base64) {
		const mimeType = base64.match(/^data:(.*);base64,/);
		return mimeType ? mimeType[1] : 'application/octet-stream'; // Tipo por defecto si no se encuentra
	}
	GetModelValue() {
		const modelFiles = this._files.map(file => new ModelFiles(file.name, file.data, file.type))
		if (this._multiple) {
			return modelFiles;
		} else {
			return [modelFiles[0]];
		}
	}
	GetValue() {
		if (this._multiple) {
			return this._files.map(f => f.data);
		} else {
			return this._files[0].data;
		}
	}
	GetFullValue() {
		if (this._multiple) {
			return this._files;
		} else {
			return this._files[0]
		}
	}


	// Estilos del componente
	styles() {
		return css`
			.file-uploader {
				border: 2px dashed #ccc;
				padding: 20px;
				text-align: center;
				background-color: #f9f9f9;
				border-radius: 10px;
			}
			
			#file-preview {
				display: flex;
				flex-wrap: wrap;
				justify-content: center;
				
				
			}
			.file-item {
				margin: 10px 0;
				padding: 10px;
				border: 1px solid #ddd;
				background-color: #fff;
				max-height: 200px;
				display: flex;
				flex-direction: column;
				max-width: 200px;
				& img {
					height: 82%;
					object-fit: contain;
				}
			}
			.multiple .file-item { 
				height: 100px;
			}
			
			.file-image {
				max-width: 100%;
				height: auto;
				display: block;
				margin-bottom: 10px;
				max-width: 400px;
			}
			.file-pdf {
				width: 100%;
				height: 300px;
				border: none;
			}
			.file-item span {
				max-width: 200px !important;
				overflow: hidden;
				display: block;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
			#file-input {
				display: none;
			}

			.custom-file-label {
				background-color: #6200ee;
				color: white;
				padding: 8px;
				border-radius: 5px;
				cursor: pointer;
				display: inline-block;
				font-size: 14px;
			}

			.custom-file-label:hover {
				background-color: #3700b3;
			}
			@media (max-width: 768px) {
				.file-item {
					min-height: 200px;
					& img {
						height: auto;
						width: 100%;
					}
				}
			}
		`;
	}
}

// Define el componente personalizado
customElements.define('file-uploader', FileComponent);