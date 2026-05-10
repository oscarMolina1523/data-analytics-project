//@ts-check
import { StylesControlsV2 } from "../StyleModules/WStyleComponents.js";
import { ComponentsManager, html, WRender } from "../WModules/WComponentsTools.js";
import { css } from "../WModules/WStyledRender.js";


/**
 * @typedef {Object} NavConfig 
 *  * @property {Boolean} [Inicialize] 
	* @property {String} [NavTitle] flex-end
	* @property {String} [alignItems] flex-end
	* @property {String} [DisplayMode] right
	* @property {Array<Object<string, any>>} [Elements]
	* @property {Boolean} [DarkMode]
	* @property {Boolean} [isMediaQuery]
	* @property {String} [Direction] row | column
	* @property {String} [NavStyle] nav | tab
	* @property {HTMLStyleElement|Node} [CustomStyle]
	* @property {HTMLElement} [TabContainer]
**/
class WAppNavigator extends HTMLElement {
	/**
	 * 
	 * @param {NavConfig} Config 
	 */
	constructor(Config) {
		super();
		this.Config = Config;
		this.Inicialize = Config.Inicialize;
		this.alignItems = Config.alignItems;
		this.DisplayMode = Config.DisplayMode;
		this.Elements = Config.Elements ?? [];
		this.DarkMode = Config.DarkMode;
		this.Direction = Config.Direction;
		this.NavStyle = Config.NavStyle ?? "nav";
		this.NavTitle = Config.NavTitle;
		this.TabContainer = Config.TabContainer;
		if (this.NavStyle == "tab") {
			WRender.SetStyle(this, {
				display: "block"
			})
		}
		/**
		 * @type {any[]}
		 */
		this.ElementNavControls = [];
		this.DrawAppNavigator();
		this.Elements = this.Elements ?? [];
		if (this.Config.CustomStyle) {
			this.append(this.Config.CustomStyle);
		};

	}
	attributeChangedCallBack() {
		this.DrawAppNavigator();
	}
	connectedCallback() {
		if (this.Inicialize == true && this.InitialNav != undefined) {
			//console.log(true);
			this.InitialNav();
		}
	}
	ActiveMenu = (/** @type {{ className: string; }} */ ev) => {
		var navs = this.parentNode?.querySelectorAll("w-app-navigator");
		navs?.forEach(nav => {
			nav.querySelectorAll(".elementNavActive").forEach(elementNavActive => {
				elementNavActive.className = "elementNav";
			});
		});
		if (ev) {
			ev.className = "elementNavActive";
			if (this.NavStyle != "tab") {
				// @ts-ignore
				this.querySelector("#MainNav").className = this.NavStyle + " navInactive";
			}
		}
	}
	async DrawAppNavigator() {
		// @ts-ignore
		this.innerHTML = "";
		if (this.id == undefined) {
			const Rand = Math.random();
			this.id = "Menu" + Rand;
		}

		this.DarkMode = this.DarkMode ?? false;
		this.DisplayMode = this.DisplayMode ?? "left";
		this.append(WRender.createElement(this.Style()));
		if (this.NavStyle == undefined) {
			this.NavStyle = "nav";
		}
		this.Nav = WRender.Create({ tagName: "nav", id: "MainNav", className: this.NavStyle });
		this.append(this.Nav);
		this.append(StylesControlsV2.cloneNode(true));
		if (this.Config.isMediaQuery == true) {
			this.append(this.MediaStyle());
		}

		if (this.NavStyle == "nav") {
			const header = html`<header onclick="${() => {
				const nav = this.querySelector("#MainNav");
				// @ts-ignore
				nav.className = nav?.className == "navActive" ? this.NavStyle + " navInactive" : nav.className = this.NavStyle + " navActive";
			}}">
				<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g clip-path="url(#clip0_429_11066)"> <path d="M3 6.00092H21M3 12.0009H21M3 18.0009H21" stroke="#292929" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path> </g> <defs> <clipPath id="clip0_429_11066"> <rect width="24" height="24" fill="white" transform="translate(0 0.000915527)"></rect> </clipPath> </defs> </g></svg>
				${this.NavTitle ? html`<label class="NavTitle">${this.NavTitle}</label>` : ""}
			</header>`
			//this.appendChild(header);
		} else {
			this.CreateTabControllers();
		}
		let activeIndex = 0
		this.Elements.forEach((element, Index) => {
			if (element.Disabled == false || element.rendered == false) {
				return;
			}
			const elementNav = WRender.createElement({
				type: "a",
				props: {
					id: "element" + (element.id ?? element.name.toString().replace(" ", "")),
					class: "elementNav",
					innerHTML: element.name.toString()
				}
			});

			//elementNav.append(element.name)
			if (element.icon) {
				elementNav.append(WRender.createElement({
					type: 'img', props: {
						src: element.icon, class: 'IconNav'
					}
				}));
			}
			if (element.url != undefined && element.url != "#") {
				elementNav.href = element.url
			}
			this.Nav?.appendChild(elementNav);
			if (element.SubNav != undefined) {
				this.AddSubNav(Index, element, elementNav, this.Nav);
			} else {
				if (elementNav.url == undefined) {
					elementNav.url = "#" + this.id;
				}
				elementNav.onclick = async (ev) => {
					this.ActiveMenu(elementNav);
					if (this.NavStyle == "tab") {
						if (this.Manager?.Exists("element" + Index) == true) {
							this.Manager?.NavigateFunction("element" + Index);
							return;
						}
						const object = await element.action();
						const objectWrapper = html`<div class="ObjectWrapper">
							<div class="header">
								<!-- <h4 class="title">${element.name}</h4> -->
								<button class="zoomBtn"
								 onclick="${() => { this.ZoomInOrOut(objectWrapper); }}">
									<svg class="btnZoomIn" viewBox="0 0 24.00 24.00" xmlns="http://www.w3.org/2000/svg" fill="#074cbb" stroke="#074cbb" stroke-width="0.8879999999999999"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.144"></g><g id="SVGRepo_iconCarrier"><path d="M9.354 15.354L3.7 21H8v1H2v-6h1v4.285l5.646-5.639zM22 2h-6v1h4.3l-5.654 5.646.707.708L21 3.715V8h1zm-6 20h6v-6h-1v4.285l-5.646-5.639-.707.708L20.3 21H16zM8 2H2v6h1V3.715l5.646 5.639.707-.708L3.7 3H8z"></path><path fill="none" d="M0 0h24v24H0z"></path></g></svg>
									<svg class="btnZoomOut" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#165ebb" stroke="#165ebb" stroke-width="1.104"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M22.154 2.554L16.707 8H21v1h-6V3h1v4.293l5.446-5.447zm-19.6 19.6L8 16.707V21h1v-6H3v1h4.293l-5.447 5.446zm19.6-.707L16.707 16H21v-1h-6v6h1v-4.293l5.446 5.446zM1.846 2.554L7.293 8H3v1h6V3H8v4.293L2.554 1.846z"></path><path fill="none" d="M0 0h24v24H0z"></path></g></svg>
								</button>
							</div>
							<div class="container">
								${object}   
							</div>
						</div>`;
						if (object) {
							this.Manager?.NavigateFunction("element" + Index, objectWrapper);
						}
					} else {
						if (element.action != undefined) {
							element.action();
						}
					}
				}
				this.ElementNavControls.push(elementNav);

			}
			if (activeIndex == 0 && element.SubNav == undefined) {
				this.InitialNav = () => {
					elementNav.onclick();
				}
			}
			activeIndex ++;
		});
	}
	CreateTabControllers = () => {
		this.TabContainer = this.TabContainer ?? WRender.Create({ className: "TabContainer", id: "content-container" });
		this.Manager = new ComponentsManager({ MainContainer: this.TabContainer, SPAManage: false });
		if (!this.Config.TabContainer) {
			this.append(this.TabContainer);
		}		
	}
	/**
	 * @param {HTMLElement | HTMLInputElement | HTMLSelectElement} objectWrapper
	 */
	ZoomInOrOut(objectWrapper) {
		if (objectWrapper.className.includes("activeZoom")) {
			objectWrapper.className = objectWrapper.className.replace("activeZoom", "");
		} else {
			objectWrapper.className += " activeZoom";
		}
	}

	AddSubNav(Index, element, elementNav, Nav) {
		const SubMenuId = "SubMenu" + Index + this.id;
		const SubNav = WRender.Create({
			tagName: "section",
			id: SubMenuId, href: element.url, className: "UnDisplayMenu"
		});
		if (element.SubNav.Elements != undefined) {
			element.SubNav.Elements.forEach(SubElement => {
				SubNav.append(WRender.Create({
					tagName: "a",
					innerText: SubElement.name,
					onclick: async (ev) => {
						if (SubElement.action != undefined) {
							SubElement.action(ev);
						}
					}

				}));
			});
			elementNav.onclick = (ev) => {
				this.ActiveMenu(ev);
				const MenuSelected = this.querySelector("#" + SubMenuId);
				if (MenuSelected?.className.includes("UnDisplayMenu")) {
					//console.log(this.NavStyle == "tab", this.NavStyle == "tab" ? "DisplayMenu tabSubMenu" : "DisplayMenu");
					MenuSelected.className = this.Direction != "column" ? "DisplayMenu AbsoluteDisplay" : "DisplayMenu";
				} else {
					// @ts-ignore
					MenuSelected.className = this.Direction != "column" ? "UnDisplayMenu AbsoluteDisplay" : "UnDisplayMenu";
				}
			};
			Nav.appendChild(SubNav);
		}
	}

	Style() {
		const style = this.querySelector("#NavStyle" + this.id);
		if (style) {
			style?.parentNode?.removeChild(style);
		}
		let navDirection = "row";
		if (this.Direction == "column") {
			navDirection = "column";
		}
		return css`
			.nav,
			.navInactive,
			.navActive {
				display: flex;
				font-family: Verdana, Geneva, Tahoma, sans-serif;
				flex-direction: ${navDirection};
				padding: 0px 10px;
				transition: all 1s;
				justify-content: ${this.alignItems};
				flex-wrap: wrap;
				position: relative;
			}
			header svg {
				height: 24px;
				width: 24px;
				cursor: pointer;
			
			}
		
			.tab {
				display: flex;
				flex-direction: ${navDirection};
				transition: all ease 1s;
				justify-content: flex-start;
				gap: 5px;
			}
		
			.tab .elementNavActive {
				border-top: solid 1px rgba(0, 0, 0, 0);
				border-left: solid 1px rgba(0, 0, 0, 0);
				border-right: solid 1px rgba(0, 0, 0, 0);
				border-radius: 0.3cm;
				color: ${this.DarkMode ? "#4da6ff" : "#ffffff"};
				background-color: #1f58c7;
			}
		
			a {
				text-decoration: none;
				cursor: pointer;
			}
		
			.elementNav {
				text-decoration: none;
				color: var(--font-primary-color);
				padding: 8px;
				border: solid 1px rgb(0, 0, 0, 0);
				transition: all 0.1s;
				display: flex;
				align-items: center;
				cursor: pointer;
				font-size: 0.925rem;
				font-family: "IBM Plex Sans", sans-serif;
				position: relative;
				border-radius: 0.3cm;
			}
		
			.elementNavActive {
				text-decoration: none;
				color: var(--font-primary-color);
				padding: 8px;
				font-size: 0.925rem;
				font-family: "IBM Plex Sans", sans-serif;
				border: solid 1px rgb(0, 0, 0, 0);
				transition: all 0.6s;
				display: flex;
				align-items: center;
			}
			.nav .elementNavActive {
				border-top: solid 1px rgba(0, 0, 0, 0);
				border-left: solid 1px rgba(0, 0, 0, 0);
				border-right: solid 1px rgba(0, 0, 0, 0);
				border-radius: 0.3cm;
				color: ${this.DarkMode ? "#4da6ff" : "#ffffff"};
				background-color: #1f58c7;
			}
		
			h4.elementNavActive {
				display: none;
			}
			.TabContainer {
				padding: 20px 0px 10px 0px;
				margin-top: 10px;
				height: calc(100% - 100px);
			}
		
			.elementNav:hover {
			  /*   background-color:#dcdcdc; */
				color:var(--font-secundary-color);
			}
		
			header {
				display: flex;
				align-items: center;
				justify-content: ${this.alignItems};
				box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.3);
			}
		
			.IconNav {
				height: 20px;
				width: 20px;
				margin: 5px;
			}
		
			.tab .elementNavActive,
			.tab .elementNav {
				display: flex;
				flex-direction: column;
				min-width: 100px;
			}
		
			.tab .IconNav {
				height: 40px;
				width: 40px;
			}
		
			.NavTitle {
				font-size: 1.1rem;
				padding: 10px;
				color: #888888;
				cursor: pointer;
			}
		
			.DisplayMenu {
				overflow: hidden;
				padding-left: 10px;
				max-height: 1000px;
				display: flex;
				flex-direction: column;
				margin: 10px 0px;
			}
		
			.AbsoluteDisplay {
				position: absolute;
				top: +40px;
				left: 0px;
				background-color: var(--secundary-color);
				padding: 0.925rem;
				box-shadow: 0 0 5px 0 #888;
				border-radius: 15px;
			}
		
			.UnDisplayMenu {
				overflow: hidden;
				max-height: 0px;
				padding: 0px;
				box-shadow: none;
			}
		
			.DisplayMenu a {
				text-decoration: none;
				color: ${this.DarkMode ? "var(--fifty-color)" : "#444444"};
				padding: 10px;
				font-size: 0.925rem;
				font-family: "IBM Plex Sans", sans-serif;
				margin-bottom: 10px;
				border-radius: 5px;
				background-color: ${this.DarkMode ? "rgb(0,0,0,50%)" : "rgb(0,0,0,10%)"};
			}
		
			.DisplayBtn {
				margin: 10px;
				display: none;
				height: 15px;
				width: 15px;
				cursor: pointer;
				filter: ${this.DarkMode ? "invert(90%)" : "invert(0%)"};
			}
		
			.navActive {
				overflow: hidden;
				max-height: 5000px;
			}
			.ObjectWrapper {
				display: flex;
				flex-direction: column;
				height: 100%;
				box-sizing: border-box;
				& .container {
					flex-grow: 1;
				}
				& .header {
					position: relative;
					display: flex;
					align-items: center;
					justify-content: space-between; 
					transition: all 0.6s;
					/*border-bottom: solid 1px rgba(0, 0, 0, 0.2);*/
					margin-bottom: 0px;
					min-height:10px;
					color: var(--font-secundary-color);
					& button {
						display: flex;
						align-items: center;    
						border: none;
						background-color: transparent; 
						cursor: pointer;                       
					}
					& .zoomBtn svg {
						height: 18px;
						width: 18px;
						position: absolute;
						right: 10px;
						top: 5px;
						transform: translateY(-100%);
					} 
					& .zoomBtn .btnZoomOut{
						display: none;
					}
					& .zoomBtn .btnZoomIn{
						display: block;
					}
				}  
			}
			.ObjectWrapper.activeZoom {
				position: fixed;
				top: 0px;
				left: 0px;
				width: 100%;
				box-sizing: border-box;
				height: 100vh;
				background-color: rgba(0, 0, 0, 0.5);
				z-index: 9999;
				padding: 50px;
				background-color: var(--secundary-color);
				overflow-y: auto;
				.header {
					& .zoomBtn .btnZoomOut{
						display: block
					}
					& .zoomBtn .btnZoomIn{
						display: none;
					}                    
				}   
			}
			`;
	}
	MediaStyle() {
		const style = this.querySelector("#NavMediaStyle" + this.id);
		if (style) {
			style?.parentNode?.removeChild(style);
		}
		let navDirection = "row";
		if (this.Direction == "column") {
			navDirection = "column";
		}
		return css` @media (max-width: 1200px) {}
		
			@media (max-width: 800px) {
				.DisplayBtn {
					display: initial;
					height: 25px;
					width: 25px;
				}
		
				.nav {
					flex-direction: column;
					overflow: hidden;
					max-height: 0px;
				}
		
				.navActive,
				.navInactive,
				.nav {
					overflow: hidden;
					max-height: 5000px;
					transition: all 0.6s;
					position: fixed;
					z-index: 999;
					background-color: var(--secundary-color);
					color: #fff;
					width: 80%;
					height: 100vh;
					top: 0px;
					box-shadow: 0 5px 5px 3px rgba(0, 0, 0, 0.3);
					flex-direction: column;
					justify-content: initial;
					padding-top: 20px;
					right: inherit;
				}
		
				.navInactive,
				.nav {
					opacity: 0;
					pointer-events: none;
					transform: translateX(-100%);
				}
		
				header {
					display: flex;
					align-items: center;
					justify-content:  ${this.alignItems};
					box-shadow: none;
				}
		}`;
	}
	ActiveTab(tabName) {
		// @ts-ignore
		this.Nav?.querySelector(`#element${tabName.replace(" ", "")}`)?.onclick();
	}
}
customElements.define("w-app-navigator", WAppNavigator);
export { WAppNavigator };
