//@ts-check
import { FilterData, OrderData } from "../WModules/CommonModel.js";
import { WAjaxTools } from "../WModules/WAjaxTools.js";
import { generateGUID, html, WRender } from "../WModules/WComponentsTools.js";
import { css } from "../WModules/WStyledRender.js";
import { WChatStyle } from "./ComponentsStyles/WChatStyle.js";
import { WRichText } from "./FormComponents/WRichText.js";
import { WForm } from "./WForm.js";
import { WModalForm } from "./WModalForm.js";

class WebApiResponse {
	/**@type {Boolean?} */ WithAgentResponse = null;
	/**@type {String?} */ Reply = null;
	/**@type {Number?} */ Id_Case = null;
	/**@type {Number?} */ Id_Comment = null;
	/**@type {Array< Object.<string, any>> ?} */ Attach_Files = null;
}
class WChatComponent extends HTMLElement {
	/**
	 * @param {{ 
		*Url?: String,
		*UrlGetConfigData?:String,
		*UrlSearch?:String,
		*UrlAdd?:String,
		*UserIdProp?:String,
		*CommentsIdentify?:String,
		*CommentsIdentifyName?:String,
		*AddObject?:Boolean,
		*Header?:HTMLElement
	* }} Config
	 * 
	 */
	constructor(Config) {
		super();
		//this.attachShadow({ mode: 'open' });
		this.Container = html`<div class="container"></div>`
		WRender.SetStyle(this, {
			display: "block"
		});
		this.append(css`
			body {
				overflow: hidden;
			}			
		`)
		let themeColor = localStorage.getItem("themeColor");
		if (!themeColor) {
			localStorage.setItem("themeColor", "light_mode");
			document.body.classList.toggle("light-mode", themeColor === "light_mode");
			themeColor = "light_mode";

		}
		if (themeColor == "light_mode") {
			document.body.classList.add("light_mode");
		}

		this.append(html`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200">`)
		if (Config.Header) {
			this.appendChild(Config.Header);
		} else {
			this.appendChild(html`<div class="header">
				<h2>${localStorage.getItem("TITULO") ?? "CHATBOT"}</h2>
			</div>`);
		}
		this.RitchInput = new WRichText({
			activeAttached: true
		});

		// @ts-ignore
		this.append(WChatStyle.cloneNode(true), this.Container, this.RitchInput?.AddInputFileSection);
		this.Config = Config;
		this.identity = {
			Tipo: undefined,
			Value: localStorage.getItem("identity"),
			Session: sessionStorage.getItem("Session") ?? generateGUID()
		};
		this.chatContainer = html`<div class="chat-container"></div>`;
		this.WithAgent = sessionStorage.getItem("WithAgent") == "true" ? true : false;
		// @ts-ignore
		this.Id_Case = sessionStorage.getItem("Id_Case") ? parseInt(sessionStorage.getItem("Id_Case")) : undefined;

		this.ActiveInterval();
		this.Draw();

	}
	connectedCallback() {
		this.chatContainer.scrollTo({
			top: this.chatContainer.scrollHeight,
			behavior: 'instant' // Desplazamiento suave instant/smooth
		});
	}
	Draw = async () => {
		if (!this.identity.Value) {
			const header = html`<h1>Ingrese su identificación</h1>`
			const form = new WForm({
				ModelObject: {
					Tipo: {
						type: "radio", Dataset: ["Correo electrónico", "No Teléfono"],
						DefaultValue: "Correo electrónico",
						action: (/** @type {{ Tipo: string; }} */ editingObject, /**@type {WForm} */ form) => {
							if (editingObject.Tipo == "No Teléfono") {
								form.ModelObject.Telefono.hidden = false
								form.ModelObject.Correo.hidden = true
							} else {
								form.ModelObject.Telefono.hidden = true
								form.ModelObject.Correo.hidden = false
							}
							form.DrawComponent();
						}
					},
					Telefono: { type: "tel", hidden: true },
					Correo: { type: "email" },
				},
				// @ts-ignore
				SaveFunction: (editingObject) => {
					if (editingObject.Tipo == "No Teléfono") {
						this.identity.Tipo = editingObject.Tipo
						this.identity.Value = editingObject.Telefono
					} else {
						this.identity.Tipo = editingObject.Tipo
						this.identity.Value = editingObject.Correo
					}
					// @ts-ignore
					localStorage.setItem("identity", this.identity.Value)
					form.remove();
					//header.remove();
					this.chatContainer.querySelector(".default-text")?.remove();
					this.Draw();
					this.update()
				}
			})
			this.append(html`<div class="default-text">				
				${form}
			</div>`);
			return;
		}
		/**@type {HTMLInputElement} */
		// @ts-ignore
		const chatInput = html`<textarea id="chat-input" spellcheck="false"  required></textarea>`
		const sendButton = html`<span id="send-btn" class="material-symbols-rounded">send</span>`

		const themeButton = html`<span id="theme-btn" class="material-symbols-rounded" style="display: none">light_mode</span>`;
		const deleteButton = html`<span id="delete-btn" class="material-symbols-rounded">delete</span>`;

		this.Container.appendChild(this.chatContainer);
		this.Container.appendChild(html`<div class="typing-container">
			<div class="typing-content">
				<div class="typing-textarea">
					${chatInput}
					${sendButton}					
				</div>
				<div class="typing-controls">
					${themeButton}
					${deleteButton}
				</div>				
			</div>
		</div>`)
		let userText = null;
		userText = this.InicialiceComponent(themeButton, userText, chatInput, deleteButton, sendButton);


	}

	/**
	 * @param {HTMLInputElement | HTMLElement | HTMLSelectElement} themeButton
	 * @param {null} userText
	 * @param {HTMLInputElement} chatInput
	 * @param {HTMLInputElement | HTMLElement | HTMLSelectElement} deleteButton
	 * @param {HTMLInputElement | HTMLElement | HTMLSelectElement} sendButton
	 */
	InicialiceComponent(themeButton, userText, chatInput, deleteButton, sendButton) {
		const loadDataFromLocalstorage = () => {
			// Load saved chats and theme from local storage and apply/add on the page
			const themeColor = localStorage.getItem("themeColor");

			document.body.classList.toggle("light-mode", themeColor === "light_mode");
			themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";



			this.chatContainer.innerHTML = localStorage.getItem("all-chats") ?? "";
			if (this.chatContainer.querySelector(".default-text")) {
				this.chatContainer.querySelector(".default-text")?.remove();
			}
			this.chatContainer?.scrollTo(0, this.chatContainer.scrollHeight); // Scroll to bottom of the chat container
		};
		const createChatElement = (/** @type {HTMLElement} */ content, /** @type {string} */ className) => {
			return html`<div class="chat ${className}">${content}</div>`;
		};

		const getChatResponse = async (/** @type {HTMLElement | HTMLInputElement | HTMLSelectElement} */ incomingChatDiv,
			 /** @type {HTMLElement | HTMLInputElement | HTMLSelectElement} */ sendChatContent) => {
			const pElement = document.createElement("div");
			pElement.className = "pElement";
			// Send POST request to API, get response and set the reponse as paragraph element text
			try {
				const model = {
					SessionId: this.identity.Session,
					Text: userText,
					Source: "webapi",
					Id: "1",
					UserId: this.identity.Value,
					Attach: this.RitchInput.Files.length > 0 ?  this.RitchInput.Files[0] : undefined,
					Timestamp: new Date()
				};
				/**@type {WebApiResponse} */
				const response = await this.SendMessage(model);
				// @ts-ignore
				sendChatContent.parentElement.id = "Comment" + response.Id_Comment;

				const raw = response.Reply ?? "";

				const attachs = this.RenderFiles(response);
				this.RitchInput.FunctionClear();

				// 2️⃣ Convierte las URLs en <a>
				const urlRegex =
					/((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9\-._~:/?#@!$&'()*+,;=%]+\.[a-z]{2,})(?![^<]*>)/gi;

				const processed = raw.replace(urlRegex, (match) => {
					// Asegura que la URL tenga http/https para que el enlace funcione bien
					const href = /^https?:\/\//i.test(match) ? match : `https://${match}`;
					return `<a href="${href}" target="_blank" rel="noopener noreferrer">${match}</a>`;
				});

				// 3️⃣ Escribe el contenido resultante en el párrafo
				pElement.innerHTML = processed;
				if (this.WithAgent != true) {
					// Remove the typing animation, append the paragraph element and save the chats to local storage                 
					
					if (attachs.children.length > 0) {
						pElement.append(attachs)
					}
				} else {
					//incomingChatDiv.remove();
					//localStorage.removeItem("all-chats");
				}
				incomingChatDiv.querySelector(".chat-details")?.appendChild(pElement);
				const oldWithAgent = this.WithAgent;
				const condition = oldWithAgent != response.WithAgentResponse;
				this.WithAgent = response.WithAgentResponse ?? false;
				sessionStorage.setItem("WithAgent", this.WithAgent == true ? "true" : "false");
				// @ts-ignore
				this.Id_Case = response.Id_Case;
				// @ts-ignore
				sessionStorage.setItem("Id_Case", this.Id_Case?.toString());
				if (condition) {
					//this.chatContainer.innerHTML = "";
					this.update();
				}
				this.ActiveInterval();
			} catch (error) { // Add error class to the paragraph element and set error text
				console.log(error);
				pElement.classList.add("error");
				pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
			}
			incomingChatDiv.querySelector(".typing-animation")?.remove();
			localStorage.setItem("all-chats", this.chatContainer.innerHTML);
			this.chatContainer.scrollTo(0, this.chatContainer.scrollHeight);
		};

		const showTypingAnimation = (/** @type {HTMLElement | HTMLInputElement | HTMLSelectElement} */ sendChatContent) => {
			// Display the typing animation and call the getChatResponse function
			const chatContent = html`<div class="chat-content">
					<div class="chat-details">			
						<img class="bot" src="/WDevCore/Media/Icons/robot.gif"/>		
						<div class="typing-animation">
							<div class="typing-dot" style="--delay: 0.2s"></div>
							<div class="typing-dot" style="--delay: 0.3s"></div>
							<div class="typing-dot" style="--delay: 0.4s"></div>
						</div>
					</div>					
				</div>`;
			// Create an incoming chat div with typing animation and append it to chat container
			const incomingChatDiv = createChatElement(chatContent, "incoming");
			this.chatContainer.appendChild(incomingChatDiv);
			this.chatContainer.scrollTo(0, this.chatContainer.scrollHeight);
			getChatResponse(incomingChatDiv, sendChatContent);
		};

		const handleOutgoingChat = () => {
			// @ts-ignore
			userText = chatInput.value.trim(); // Get chatInput value and remove extra spaces
			if (!userText) return; // If chatInput is empty return from here


			// Clear the input field and reset its height
			chatInput.value = "";
			chatInput.style.height = `${initialInputHeight}px`;

			const attachs = this.RenderFiles({ Attach_Files: this.RitchInput.Files });
			const chatContent = html`<div class="chat-content">
					<div class="chat-details">
						<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="12" cy="6" r="4" fill="#77cef3"></circle> <path opacity="0.5" d="M20 17.5C20 19.9853 20 22 12 22C4 22 4 19.9853 4 17.5C4 15.0147 7.58172 13 12 13C16.4183 13 20 15.0147 20 17.5Z" fill="#77cef3"></path> </g></svg>
						<div class="pElement">
							${userText}
							${attachs.children.length > 0 ? attachs : ""}
						</div>
					</div>
				</div>`;
			// Create an outgoing chat div with user's message and append it to chat container
			const outgoingChatDiv = createChatElement(chatContent, "outgoing");
			this.chatContainer.querySelector(".default-text")?.remove();
			this.chatContainer.appendChild(outgoingChatDiv);
			this.chatContainer.scrollTo(0, this.chatContainer.scrollHeight);
			setTimeout(()=> showTypingAnimation(chatContent), 500);
		};

		deleteButton.addEventListener("click", () => {
			// Remove the chats from local storage and call loadDataFromLocalstorage function
			if (confirm("Are you sure you want to delete all the chats?")) {
				localStorage.removeItem("all-chats");
				loadDataFromLocalstorage();
			}
		});

		themeButton.addEventListener("click", () => {
			// Toggle body's class for the theme mode and save the updated theme to the local storage 
			document.body.classList.toggle("light-mode");
			localStorage.setItem("themeColor", themeButton.innerText);
			themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
		});

		const initialInputHeight = chatInput.scrollHeight;

		chatInput.addEventListener("input", () => {
			// Adjust the height of the input field dynamically based on its content
			chatInput.style.height = `${initialInputHeight}px`;
			chatInput.style.height = `${chatInput.scrollHeight}px`;
		});

		chatInput.addEventListener("keydown", (/** @type {{ key: string; shiftKey: any; preventDefault: () => void; }} */ e) => {
			// If the Enter key is pressed without Shift and the window width is larger 
			// than 800 pixels, handle the outgoing chat
			if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
				e.preventDefault();
				handleOutgoingChat();
			}
		});


		loadDataFromLocalstorage();
		sendButton.addEventListener("click", handleOutgoingChat);
		return userText;
	}

	ActiveInterval() {
		if (this.WithAgent == true) {
			this.Interval = setInterval(async () => {
				if (this.updating == true) {
					console.log(this.updating, " - block updating...");
					return;
				}
				this.updating = true;
				await this.update();
				this.updating = false;
			}, 15000);
		}
	}

	/**
	 * @param {{ [x: string]: any; } | undefined} model
	 */
	async SendMessage(model) {
		return await WAjaxTools.PostRequest(this.Config.Url ?? "", model, {
			headers: [{ name: "X-Platform", value: "webapi" }],
			WithoutLoading: true
		});
	}

	async update() {
		this.Id_ComentarioCargados = this.Id_ComentarioCargados ?? ["-1"]
		if (this.WithAgent == true) {
			const Message = {}
			Message["Id_Case"] = this.Id_Case
			this.maxMessage = 30;
			this.actualPage = this.actualPage ?? 1;
			//Message.FilterData = [{ FilterType: "limit", Values: ["30"] }]
			Message.FilterData = [FilterData.NotIn("Id_Comentario", ...this.Id_ComentarioCargados)]
			Message.OrderData = [OrderData.Asc("Fecha")]


			// @ts-ignore
			const response = await WAjaxTools.PostRequest(this.Config.UrlSearch, Message, { WithoutLoading: true });
			//console.log(response);
			//this.Dataset = response;         
			this.chatContainer.querySelector(".default-text")?.remove();

			response.sort((/** @type {{ Id_Comentario: number; }} */ a, /** @type {{ Id_Comentario: number; }} */ b) => a.Id_Comentario - b.Id_Comentario)
				.forEach((/**@type {Object.<string, any>} */ comment) => {
					this.Id_ComentarioCargados.push(comment.Id_Comentario.toString())
					if (this.chatContainer.querySelector("#Comment" + comment.Id_Comentario)) {
						return;
					}

					//TODO MEJORAR ESTO Y HACERLO MAS ESPECIFICO
					const val = Array.from(document.querySelectorAll(`.chat.outgoing`))
						// @ts-ignore
						.find(el => el.innerText === (comment.Body ?? comment.mensaje));
					if (val) {
						return;
					}
					const classN = comment.NickName == this.identity.Value ? "outgoing" : "incoming";
					// Create an incoming chat div with typing animation and append it to chat container

					const attachs = this.RenderFiles(comment);
					const incomingChatDiv = html`<div class="chat ${classN}" id="Comment${comment.Id_Comentario}">
					<div class="chat-content">						
						<div class="chat-details">
							<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="12" cy="6" r="4" fill="#77cef3"></circle> <path opacity="0.5" d="M20 17.5C20 19.9853 20 22 12 22C4 22 4 19.9853 4 17.5C4 15.0147 7.58172 13 12 13C16.4183 13 20 15.0147 20 17.5Z" fill="#77cef3"></path> </g></svg>
							
							<img class="bot" src="/WDevCore/Media/Icons/robot.gif"/>
							<div class="typing-animation">
								<img class="bot" src="/WDevCore/Media/Icons/robot.gif"/>
								<div class="typing-dot" style="--delay: 0.2s"></div>
								<div class="typing-dot" style="--delay: 0.3s"></div>
								<div class="typing-dot" style="--delay: 0.4s"></div>
							</div>
						</div>
					</div>
				</div>`;
					this.chatContainer.appendChild(incomingChatDiv);
					const pElement = document.createElement("div");
					pElement.className = "pElement";
					// Send POST request to API, get response and set the reponse as paragraph element text
					try {

						// 1️⃣ Obtén el texto original
						const raw = comment.Body ?? comment.mensaje ?? "";

						// 2️⃣ Convierte las URLs en <a>
						const urlRegex =
							/((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9\-._~:/?#@!$&'()*+,;=%]+\.[a-z]{2,})(?![^<]*>)/gi;

						const processed = raw.replace(urlRegex, (/** @type {string} */ match) => {
							// Asegura que la URL tenga http/https para que el enlace funcione bien
							const href = /^https?:\/\//i.test(match) ? match : `https://${match}`;
							return `<a href="${href}" target="_blank" rel="noopener noreferrer">${match}</a>`;
						});

						// 3️⃣ Escribe el contenido resultante en el párrafo
						pElement.innerHTML = processed;

						incomingChatDiv.querySelector(".chat-details")?.appendChild(pElement);
					} catch (error) { // Add error class to the paragraph element and set error text
						pElement.classList.add("error");
						pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
					}
					incomingChatDiv.querySelector(".typing-animation")?.remove();
					if (attachs.children.length > 0) {
						pElement.append(attachs)
					}
					localStorage.setItem("all-chats", this.chatContainer.innerHTML);
					this.chatContainer.scrollTo(0, this.chatContainer.scrollHeight);
				});
		}
	}
	/**
	 * @param {{ Attach_Files?: any; }} comment
	 */
	RenderFiles(comment) {
		const attachs = WRender.Create({ className: "attachs" });
		comment.Attach_Files?.filter((/**@type {Object.<string, any>} */ attach) => attach != null && attach != undefined)
			?.forEach((/**@type {Object.<string, any>} */ attach) => {
				if (attach != null && attach != undefined && attach?.Type?.toUpperCase()?.includes("JPG")
					|| attach?.Type?.toUpperCase()?.includes("JPEG")
					|| attach?.Type?.toUpperCase()?.includes("PNG")
					|| attach?.Value?.toUpperCase()?.includes(".JPEG")
                    || attach?.Value?.toUpperCase()?.includes(".PNG")) {
					attachs.append(WRender.Create({
						tagName: "img", src: this.GetFileNameFromPath(attach.Value.replace("wwwroot", "")), onclick: () => {
							document.body.append(new WModalForm({
								ObjectModal: WRender.Create({
									tagName: "img", src: this.GetFileNameFromPath(attach.Value.replace("wwwroot", "")), style: {
										width: "auto",
										objectFit: "cover",
										height: "calc(100% - 20px)",
										maxWidth: "100%",
										overflow: "hidden",
										borderRadius: "20px"
									}
								})
							}));
						}
					}));
				} else if (attach?.Type?.toUpperCase()?.includes("PDF") || attach?.Value?.toUpperCase()?.includes(".PDF")) {
					attachs.append(WRender.Create({
						tagName: "a", innerText: attach.Name, onclick: () => {
							this.shadowRoot?.append(new WModalForm({
								ObjectModal: WRender.Create({
									tagName: "iframe", src: this.GetFileNameFromPath(attach.Value.replace("wwwroot", "")), style: {
										height: "600px",
										width: "100%"
									}
								})
							}));
						}
					}));
				}

			});
		return attachs;
	}

	/**
	 * @param {string} path
	 */
	GetFileNameFromPath(path, isImg = true) {
		if (!path) return "";

		// Detecta si es un base64 puro (sin encabezado)
		const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;

		// Detecta si es un DataURL tipo data:image/png;base64,...
		const dataUrlRegex = /^data:(.*);base64,/;

		// ¿Es un dataURL completo?
		if (dataUrlRegex.test(path)) {
			return isImg ? path : ""; // ya es válido, no necesita normalizarse
		}

		// ¿Es un base64 puro?
		if (base64Regex.test(path)) {
			return isImg
				? `data:image/png;base64,${path}`
				: path;
		}

		// --- Si no es base64, procesar como ruta de archivo normal ---
		const normalizedPath = path.replace(/\\/g, "/");
		const parts = normalizedPath.split("/");

		return "/" + parts[parts.length - 1];
	}

}
customElements.define('w-chat-component', WChatComponent);
export { WChatComponent }