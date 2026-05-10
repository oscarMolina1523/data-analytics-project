//@ts-check
import { html, WRender } from '../WModules/WComponentsTools.js';
import { css } from '../WModules/WStyledRender.js';
import { ZoomControl } from './FormComponents/ZoomControl.js';
import { WPrintExportToolBar } from './WPrintExportToolBar.mjs';

export const PageType = {
	A4: "A4",
	A4_HORIZONTAL: "A4-horizontal",
	CARTA: "carta",
	CARTA_HORIZONTAL: "carta-horizontal",
	OFICIO: "oficio",
	OFICIO_HORIZONTAL: "oficio-horizontal"
};

class WDocumentViewer extends HTMLElement {
	/**
	 * @typedef {Object} WDocumentViewerConfig
	 * @property {boolean} [exportPdf]
	 * @property {boolean} [exportPdfApi]
	 * @property {boolean} [exportXls]
	 * @property {any[]} [Dataset]
	 * @property {boolean} [print]
	 * @property {Function} [exportXlsAction]
	 * @property {string} [PageType]
	 * @property {HTMLElement} [Header]
	 * @property {Node} [CustomStyle]
	 */

	/**
	 * @param {WDocumentViewerConfig} Config
	 */
	constructor(Config) {
		super();
		/** @type {WDocumentViewerConfig} */
		this.Config = Config ?? {};
		this.attachShadow({ mode: 'open' });

		this.shadowRoot?.append(this.CompStyle);
		if (this.Config.CustomStyle) {
			this.shadowRoot?.append(this.Config.CustomStyle.cloneNode(true));
		}

		/** @type {HTMLElement} */
		this.ComponentContainer = WRender.Create({ id: "ComponentContainer" });
		/** @type {HTMLElement} */
		this.TopOptions = WRender.Create({ className: "TopOptions" });
		/** @type {HTMLElement} */
		this.FooterOptions = WRender.Create({ className: "FooterOptions" });

		/** @type {HTMLElement} */
		this.DocumentContainer = WRender.Create({
			className: "document-container"
		});
		this.ComponentContainer.append(this.TopOptions, this.DocumentContainer, this.FooterOptions);

		/**
		 * @type {HTMLElement[]}
		 */
		this.Pages = [];

		this.shadowRoot?.append(this.ComponentContainer);

	}

	connectedCallback() {
		this.Update();
	}

	/**
	 * Dibuja el visor de documentos.
	 */
	DrawWDocumentViewer = async () => {
		//this.ApplyPageStyle();
		this.RenderPages();
	};

	Update() {
		this.Header = this.Config.Header;
		this.Dataset = this.Dataset ?? this.Config.Dataset ?? [];
		this.exportXls = this.Config.exportXls;
		this.exportXlsAction = this.Config.exportXlsAction;
		this.Pages = [];
		this.FooterOptions.innerHTML = "";
		this.FooterOptions.append(new ZoomControl({ Nodes: this.Pages }));
		this.DocumentContainer.innerHTML = "";
		this.TopOptions.innerHTML = "";
		this.InicializeToolBar();
		this.DrawWDocumentViewer();
	}

	/**
	 * Renderiza las páginas asegurando que los elementos se distribuyan correctamente.
	 */
	RenderPages() {
		let currentPage = this.CreateNewPage();
		//let availableSpace = currentPage.offsetHeight - 40; // Margen de seguridad
		this.Dataset?.forEach((/** @type {string | HTMLElement} */ element) => {
			// @ts-ignore
			const elementClone = typeof element !== "string"  ? element.cloneNode(true) : element;
			// @ts-ignore
			const elementFitsInPage = this.elementFitsInPage(currentPage, elementClone)
			let isSplited = false;
			if (!elementFitsInPage) {
				// @ts-ignore
				isSplited = this.SplitElementIntoPages(elementClone, currentPage);
				if (!isSplited) {
					//currentPage = this.CreateNewPage();
				}
				if (isSplited) {
					// Obtener la última página creada por SplitElementIntoPages()
					// @ts-ignore
					currentPage = this.GetLastPage();
				} else {
					// Si no se dividió, crear una nueva página
					currentPage = this.CreateNewPage();
				}
				//availableSpace = currentPage.offsetHeight - 40;
				//currentPage.append(elementClone)
			}
			if (!isSplited) {
				// @ts-ignore
				if (element?.className?.includes("wrapper")) {
					currentPage.append(element);
				} else {
					currentPage.append(elementClone);
				}				
			}
		});
	}

	/**
	 * @param {HTMLElement} page 
	 * @param {HTMLElement} element 
	 * @returns {Boolean}
	 */
	elementFitsInPage(page, element) {
		page.append(element);
		const computedStyle = getComputedStyle(page);

		// Convertir valores de padding a número (si están vacíos, se asigna 0)
		const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
		const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;

		// Altura realmente disponible sin incluir padding
		const availableHeight = page.clientHeight - paddingTop - paddingBottom;
		// Altura real con contenido
		//const contentHeight = page.scrollHeight - paddingTop - paddingBottom;
		const contentNodeHeight = Array.from(page.children)
			.map(node => {
				const computedNode = getComputedStyle(node);
				// @ts-ignore
				return node.offsetHeight
					+ parseFloat(computedNode.marginTop ?? "0")
					+ parseFloat(computedNode.marginBottom ?? "0");
			})
			.reduce((a, b) => a + b, 0);
		const fits = contentNodeHeight <= availableHeight;
		// @ts-ignore
		//const nodeHeight = element.offsetHeight + parseFloat(element.marginTop ?? "0")
		// @ts-ignore
		//+ parseFloat(element.marginBottom ?? "0")
		//console.log("node height", nodeHeight, element);
		//console.log("contentheigh:", contentNodeHeight, "availableHeight heigh:", availableHeight);
		if (!fits) {
			//console.log("FALLO content heigh:", contentNodeHeight, "availableHeight heigh:", availableHeight);
		}

		page.removeChild(element);
		return fits;
	}
	GetLastPage() {
		return this.DocumentContainer.querySelector(".page:last-child"); // O ajusta según cómo se crean las páginas
	}

	/**
	 * Crea una nueva página vacía.
	 * @returns {HTMLElement}
	 */
	CreateNewPage() {
		const page = WRender.Create({ className: `page ${this.Config.PageType}` });
		if (typeof this.Header === "string") {
			page.append(this.Header);
		} else if (this.Header) {
			page.append(this.Header.cloneNode(true));
		}
		this.DocumentContainer.append(page);
		this.Pages.push(page);
		return page;
	}

	/**
	 * Divide un elemento en varias páginas si es demasiado grande.
	 * @param {HTMLElement} element
	 * @param {HTMLElement} currentPage
	 */
	SplitElementIntoPages(element, currentPage) {
		if (element.tagName === "TABLE") {
			// @ts-ignore
			this.SplitTable(element, currentPage);
			return true;
		} else if (typeof element === "string" || element.nodeType === Node.TEXT_NODE) {
			// @ts-ignore
			this.SplitText(element.nodeType === Node.TEXT_NODE ? element.data : element, currentPage);
			return true;
		}
		return false;
	}

	/**
	 * Divide una tabla en varias páginas si es demasiado alta.
	 * @param {HTMLTableElement} table
	 * @param {HTMLElement} currentPage
	 */
	SplitTable(table, currentPage) {
		const rows = Array.from(table.rows);
		let newTable = table.cloneNode(false);

		//let availableSpace = currentPage.offsetHeight - 40;
		//currentPage.append(newTable)
		rows.forEach((row) => {
			// @ts-ignore
			if (!this.elementFitsInPage(currentPage, newTable)) {
				//if (row.offsetHeight > availableSpace) {
				currentPage.append(newTable)
				currentPage = this.CreateNewPage();
				newTable = table.cloneNode(false);
				//availableSpace = currentPage.offsetHeight - 40;
			}
			newTable.appendChild(row.cloneNode(true));
			//availableSpace -= row.offsetHeight;
		});


		currentPage.append(newTable);
	}
	/**
	 * Divide un texto largo en varias páginas.
	 * @param {string} text
	 * @param {HTMLElement} currentPage
	 */
	SplitText(text, currentPage) {
		let words = text.split(" ");
		//console.log(words);

		let chunk = "";
		let paragraph = document.createElement("p");
		//paragraph.className = "test-text";
		//this.shadowRoot?.append(paragraph);

		words.forEach((word) => {
			let tempParagraph = document.createElement("p");
			tempParagraph.innerHTML += chunk + " " + word;
			if (!this.elementFitsInPage(currentPage, tempParagraph)) {
				//console.log("se creara uno nuevo", paragraph);

				currentPage.append(paragraph);
				paragraph = document.createElement("p");
				chunk = word;
				currentPage = this.CreateNewPage();
			} else {
				chunk += " " + word;
				paragraph.innerHTML = chunk + " " + word;
			}
		});
		//console.log("el primero creara uno nuevo", paragraph);
		currentPage.append(paragraph);

		/*let newElement = element.cloneNode(false);
		newElement.innerText = chunk;
		currentPage.append(newElement);
		this.shadowRoot.removeChild(testElement);*/
	}

	ApplyPageStyle() {
		const pageType = this.Config.PageType ?? PageType.A4;
		//const pageStyle = this.GetPageStyle(pageType);
		//this.DocumentContainer.append(pageStyle);
	}


	GetPageStyle = (/** @type {string | number} */ pageType) => {
		const styles = {
			[PageType.A4]: css`
					.page {
						width: 210mm;
						height: 267mm;
					}
				`,
			[PageType.A4_HORIZONTAL]: css`
					.page {
						width: 297mm;
						height: 180mm;
					}
				`,
			[PageType.CARTA]: css`
					.page {
						width: 216mm;
						height: 249mm;
					}
				`,
			[PageType.CARTA_HORIZONTAL]: css`
					.page {
						width: 279mm;
						height: 186mm;						
					}
				`,
			[PageType.OFICIO]: css`
					.page {
						width: 216mm;
						height: 300mm;
					}
				`,
			[PageType.OFICIO_HORIZONTAL]: css`
					.page {
						width: 330mm;
						height: 186mm;
					}
				`
		};

		return styles[pageType] || styles[PageType.A4];
	}

	InicializeToolBar() {
		if (this.Config.exportPdf || this.Config.print || this.Config.exportPdfApi) {
			this.TopOptions.append(new WPrintExportToolBar({
				PrintAction: this.Config.print ? (/** @type {{ Print: (arg0: HTMLElement | HTMLInputElement | HTMLSelectElement) => void; }} */ tool) => {
					const body = this.GetExportBody();
					tool.Print(body);
				} : undefined,
				ExportPdfAction: this.Config.exportPdf ? async (/** @type {{ ExportPdf: (arg0: HTMLElement | HTMLInputElement | HTMLSelectElement, arg1: string | undefined, arg2: boolean) => void; }} */ tool) => {
					const body = this.GetExportBody();
					tool.ExportPdf(body, this.Config.PageType, this.Config.exportPdfApi ?? false);
				} : undefined, 
				ExportXlsAction: this.Config.exportXls ? async (/**@type {WPrintExportToolBar} */ tool) => {
					// @ts-ignore
					this.Config.exportXlsAction(tool)
				}: undefined
			}));
		}
	}

	CompStyle = css`
		#ComponentContainer {
			border: 1px solid #dfdfdf;
			height: 100%;
			box-sizing: border-box;
			display: grid;
		}
		.document-container {
			align-items: center;
			padding: 20px;
			background-color: #dfdfdf;
			box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
			max-height: 600px;
			overflow: auto;
		}
		.content-container {
			width: 100%;
			max-width: 800px;
			margin: 0 auto;
		}
		.page {
			color: #000;
			padding: 30px 30px;
			background: #fff;
			box-shadow: 0 2px 5px 0px #858585;
			width: 210mm;
			height: 297mm;
			border: 1px solid #cacaca;
			box-sizing: border-box;
			margin: 5mm auto;
			overflow: hidden;
			position: relative;
			page-break-after: always;
		}
		.A4-horizontal {
			width: 297mm;
			height: 210mm;
		}
		/* Tamaño carta (8.5in x 11in) */
		.carta {
			width: 8.5in;
			height: 11in;
		}

		/* Tamaño oficio (8.5in x 14in) */
		.oficio {
			width: 8.5in;
			height: 14in;
		}

		/* Tamaño carta horizontal (11in x 8.5in) */
		.carta-horizontal {
			width: 11in;
			height: 8.5in;
		}

		/* Tamaño oficio vertical (14in x 8.5in) */
		.oficio-horizontal {           
			width: 340mm; /* 14 pulgadas en mm */
			height: 200mm; /* 8.5 pulgadas en mm */
		}
		.test-text {
			position: absolute;
			visibility: hidden;
			white-space: nowrap;
		}
		.TopOptions {
			display: flex;
			justify-content: flex-end;
			gap: 10px;
			border-bottom: 1px solid #dfdfdf;
		}
		.FooterOptions {
			display: flex;
			justify-content: flex-end;
			padding: 10px;
			border-top: 1px solid #dfdfdf;
		}
		
		@media print {
			.document-container {
				overflow: visible;
				max-height: unset;
			}
			.page, .document-container {
				zoom: 1 !important;
				height: 100% !important;
				width: 100% !important;
				margin: 0mm !important;
				padding: 0mm !important;
				box-shadow: unset !important;
				border: none !important;
			}
		}
	`;

	GetExportBody() {
		return html`<div>	
			${this.DocumentContainer.cloneNode(true)}
			${this.Config.CustomStyle ? this.Config.CustomStyle.cloneNode(true) : ""}				
		</div>`;
	}
}

customElements.define('w-document-viewer', WDocumentViewer);
export { WDocumentViewer };