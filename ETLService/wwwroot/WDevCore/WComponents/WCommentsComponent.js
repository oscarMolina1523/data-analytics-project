//@ts-check
import { StylesControlsV2, StyleScrolls } from "../StyleModules/WStyleComponents.js";
import { html, WRender } from "../WModules/WComponentsTools.js";
import { css } from "../WModules/WStyledRender.js";
import { WRichText } from "./FormComponents/WRichText.js";
import { WModalForm } from "./WModalForm.js";
import { MultiSelect } from "./WMultiSelect.js";
import { WArrayF } from "../WModules/WArrayF.js";
import { WAjaxTools } from "../WModules/WAjaxTools.js";
import { WSocketServices } from "../WModules/WSocketServices.js";

class WCommentsComponent extends HTMLElement {

    /**
     * @param {{ 
        * Dataset: any[]; 
        * ModelObject: Object;
        * User: any; 
        * UserIdProp?: string;
        * CommentsIdentify: Number; 
        * CommentsIdentifyName: string; 
        * UrlSearch: string; 
        * UrlAdd: string; 
        * AddObject?: boolean;
        * UseDestinatarios?: boolean; 
        * UseAttach?: boolean;
        * UseOnlyFileName?: boolean;
        * isRichTextActive?: boolean;
        * IsWithSocket?: boolean;
        * CustomStyle?: HTMLStyleElement
     * }} props
     */
    constructor(props) {
        super();
        this.Dataset = props.Dataset ?? [];
        this.attachShadow({ mode: 'open' });
        //CONFIGURACIONES
        this.ModelObject = props.ModelObject;
        this.AddObject = props.AddObject ?? false;
        this.UrlSearch = props.UrlSearch;
        this.UrlAdd = props.UrlAdd;
        this.UseDestinatarios = props.UseDestinatarios ?? true;
        this.UseAttach = props.UseAttach ?? true;
        this.User = props.User;
        this.UseOnlyFileName = props.UseOnlyFileName ?? false;
        this.CommentsIdentify = props.CommentsIdentify;
        this.CommentsIdentifyName = props.CommentsIdentifyName;        
        this.hubStarted = false;
        this.autoScroll = true;
        this.updating = false;
        this.isRichTextActive = props.isRichTextActive ?? true;
        
        //UI ELEMENTS
        this.append(css`
            w-coment-component {
                display: flex;
                flex-direction: column;
            }    
        `)
        this.CommentsContainer = WRender.Create({ className: "CommentsContainer" });  

        this.MessageInput = WRender.Create({
            tagName: 'textarea', onkeydown: async (e) => {
                // Verificar si es Enter (keyCode 13)
                if (e.key === 'Enter' || e.keyCode === 13) {
                    // Si está presionando Alt, entonces saltar línea
                    if (e.altKey) {
                        // Agregar salto de línea manualmente (opcional)
                        const textarea = e.target;
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        textarea.setRangeText('\n', start, end, 'end');
                        e.preventDefault(); // Evitar comportamiento por defecto
                    } else {
                        // No está con Alt: ejecutar saveComment()
                        this.saveComment();
                        e.preventDefault(); // Opcional: evitar submit default
                    }
                }
            }
        });
        this.OptionContainer = WRender.Create({
            className: "OptionContainer", children: [
                this.MessageInput,
                {
                    tagName: 'input', type: "button", className: 'Btn-Mini',
                    value: 'Enviar', onclick: async () => {
                        this.saveComment();
                    }
                }
            ]
        });
        this.RitchInput = new WRichText({
            activeAttached: this.UseAttach
        });
        this.RitchOptionContainer = WRender.Create({
            className: "RichOptionContainer", style: { display: "none" }, children: [
                this.RitchInput,
                {
                    tagName: 'input', type: "button", className: 'Btn-Mini',
                    value: 'Enviar', onclick: async () => {
                        this.saveRitchComment();
                    }
                }
            ]
        });
        this.TypeTextContainer = WRender.Create({
            className: "textContainer", children: [
                {
                    tagName: 'label',
                    innerText: 'Texto normal', onclick: async () => {
                        this.CommentsContainer.style.height = "calc(100% - 150px)";
                        this.RitchOptionContainer.style.display = "none";
                        this.OptionContainer.style.display = "grid";
                    }
                }, this.isRichTextActive ? {
                    tagName: 'label',
                    innerText: 'Texto enriquecido', onclick: async () => {
                        this.CommentsContainer.style.height = "calc(100% - 600px)";
                        this.RitchOptionContainer.style.display = "flex";
                        this.OptionContainer.style.display = "none";

                    }
                } : ""
            ]
        });

        this.Mails = WArrayF.GroupBy(this.Dataset, "Mail").map(comment => comment.EvalProperty);
        this.SelectedMails = WArrayF.GroupBy(this.Dataset, "Mail").map(comment => comment.EvalProperty);
        this.shadowRoot?.append(
            StyleScrolls.cloneNode(true),
            StylesControlsV2.cloneNode(true),
            this.CustomStyle,
            this.CommentsContainer,
            this.TypeTextContainer)
        if (props.CustomStyle) {
            this.shadowRoot?.append(props.CustomStyle.cloneNode(true))
        }
        if (this.UseDestinatarios == true) {
            this.MailsSelect = new MultiSelect({
                Dataset: this.Mails,
                selectedItems: this.SelectedMails,
                AddObject: this.AddObject,
                AddPatern: "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"//patron de correo
            });
            this.shadowRoot?.append(this.MailsSelect)
        }
        this.shadowRoot?.append(this.OptionContainer)
        if (this.isRichTextActive) {
            this.shadowRoot?.append(this.RitchOptionContainer)
        } else if (this.UseAttach && this.RitchInput?.AddInputFileSection) {
            this.shadowRoot?.append(this.RitchInput?.AddInputFileSection)
        };
         //CONFIGURACIONES
        this.isInSaveTransaction = false;
        this.IsWithSocket = props.IsWithSocket;
    }

    // --- Inicializar SignalR ---
    async initSignalR() {
        if (!this.IsWithSocket) {
            return;
        }
        WSocketServices.InitSignalR(this, async (/** @type {{ [x: string]: number; }} */ mensaje) => {
            // Solo agregar si es de la conversación actual
            if (mensaje[this.CommentsIdentifyName] == this.CommentsIdentify) {
                //this.Dataset = [...this.Dataset, mensaje];
                await this.update();
                this.DrawWCommentsComponent();
                this.scrollToBottom();
            }
        })
    }
    saveComment = async () => {
        if (!this.isInSaveTransaction) {
            // @ts-ignore
            if (this.MessageInput.value.toString().trim().length == 0 && this.RitchInput.Files?.length == 0) {
                return;
            }
            this.isInSaveTransaction = true;
            this.ClearEvents();
            const Message = {
                // @ts-ignore
                Body: this.MessageInput.value,
                Id_User: this.User.UserId,
                Attach_Files: this.RitchInput.Files,
                Mails: this.UseDestinatarios == true ? this.MailsSelect?.selectedItems : undefined
            }
            // @ts-ignore
            Message[this.CommentsIdentifyName] = this.CommentsIdentify
            // @ts-ignore
            const response = await WAjaxTools.PostRequest(this.UrlAdd, Message, { WithoutLoading: true });
            // @ts-ignore
            this.MessageInput.value = "";
            this.RitchInput.FunctionClear();
            this.InicializarActualizacion();
            this.isInSaveTransaction = false;
        }
    }
    saveRitchComment = async () => {
        if (!this.isInSaveTransaction) {
            // @ts-ignore
            if (this.MessageInput.value.toString().trim().length == 0 && this.RitchInput.Files?.length == 0) {
                return;
            }
            this.isInSaveTransaction = true;
            this.ClearEvents();
            const Message = {
                // @ts-ignore
                Body: this.RitchInput.value,
                Attach_Files: this.RitchInput.Files,
                Id_User: this.User.UserI
            }
            Message[this.CommentsIdentifyName] = this.CommentsIdentify
            // @ts-ignore
            const response = await WAjaxTools.PostRequest(this.UrlAdd, Message, { WithoutLoading: true });
            // @ts-ignore
            this.MessageInput.value = "";
            this.RitchInput.FunctionClear();
            this.InicializarActualizacion();
            this.isInSaveTransaction = false;
        }
    }

    connectedCallback() {
        this.InicializarActualizacion();
        this.initSignalR();
    }
    scrollToBottom = () => {
        if (this.autoScroll) {
            this.CommentsContainer.scrollTo({
                top: this.CommentsContainer.scrollHeight,
                behavior: 'instant' // Desplazamiento suave instant/smooth
            });
        }
    }
    async InicializarActualizacion() {
        // Guardar referencia al intervalo para poder limpiarlo luego
        if (!this.IsWithSocket) {
            this.Interval = setInterval(async () => {
                if (this.updating) {
                    return;
                }
                this.updating = true;
                await this.update();
                this.scrollToBottom();
                this.updating = false;
            }, 5000);
        }
        let isLoading = false;

        // Definir la función de manejo de scroll por separado
        this.scrollHandler = this.debounce(async () => {
            if (isLoading) {
                return;
            }

            const { scrollTop, clientHeight, scrollHeight } = this.CommentsContainer;
            const isAtBottom = scrollTop + clientHeight >= scrollHeight;

            this.autoScroll = isAtBottom;

            if (scrollTop === 0) {
                isLoading = true;
                this.actualPage++;
                await this.update(false, true);
                isLoading = false;
            }
        }, 1000); // Ajusta el tiempo de debounce según sea necesario

        // Agregar evento de scroll
        this.CommentsContainer.addEventListener('scroll', this.scrollHandler);

        await this.update();
        this.CommentsContainer.scrollTo({
            top: this.CommentsContainer.scrollHeight,
            behavior: 'instant' // Desplazamiento suave instant/smooth
        });
    }
    debounce(func, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    disconnectedCallback() {
        //this.connection?.stop();
        this.hubStarted = false;
        WSocketServices.StopSignalR(this);
        //this.ClearEvents()
    }
    ClearEvents() {
        if (this.Interval) {
            clearInterval(this.Interval);
            this.Interval = null;
        }

        if (this.CommentsContainer && this.scrollHandler) {
            this.CommentsContainer.removeEventListener('scroll', this.scrollHandler);
            this.scrollHandler = null;
        }

        console.log("Eventos e intervalos limpiados.");
    }
    GetDestinatarios() {
        // return this.Destinatarios;
    }
    DrawWCommentsComponent = async () => {
        // Variable para evitar múltiples solicitudes        
        //console.log(this.Dataset);
        this.Dataset.forEach(comment => {
            const idMessage = comment.Id_mensaje ?? comment.Id_Comentario;
            const date = new Date(comment.Created_at ?? comment.Fecha);
            if (this.CommentsContainer.querySelector(`#MessageId${idMessage}`)) {
                return;
            }
            const attachs = WRender.Create({ className: "attachs" });
            comment.Attach_Files?.filter(attach => attach != null && attach != undefined)?.forEach(attach => {
                if (attach != null && attach != undefined && attach?.Type?.toUpperCase()?.includes("JPG")
                    || attach?.Type?.toUpperCase()?.includes("JPEG")
                    || attach?.Type?.toUpperCase()?.includes("PNG")
                    || attach?.Value?.toUpperCase()?.includes(".JPEG")
                    || attach?.Value?.toUpperCase()?.includes(".PNG")) {

                    attachs.append(WRender.Create({
                        tagName: "img", src: this.GetFileNameFromPath(attach.Value.replace("wwwroot", "")), onclick: () => {
                            this.shadowRoot?.append(new WModalForm({
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
                            }))
                        }
                    }));
                } else if (attach?.Type?.toUpperCase()?.includes("PDF")
                || attach?.Value?.toUpperCase()?.includes(".PDF") ) {
                    attachs.append(WRender.Create({
                        tagName: "a", innerText: attach.Name, onclick: () => {
                            this.shadowRoot?.append(new WModalForm({
                                ObjectModal: WRender.Create({
                                    tagName: "iframe", src: this.GetFileNameFromPath(attach.Value.replace("wwwroot", "")), style: {
                                        height: "600px",
                                        width: "100%"
                                    }
                                })
                            }))
                        }
                    }));
                }

            });
            const commentIdUser = comment.Id_User ?? comment.Usuario_id;
            const message = WRender.Create({
                tagName: "div",
                className: (commentIdUser == this.User.UserId ? "commentSelf" : "comment")
                    + (comment.Leido == true ? "leido" : ""),
                children: [
                    { tagName: "label", className: "nickname", innerHTML: comment.NickName ?? comment.Remitente },
                    { tagName: "p", innerHTML: comment.Body ?? comment.mensaje ?? "" }, attachs,
                    { tagName: "label", className: "date", innerHTML: comment.Fecha?.toDateTimeFormatEs() ?? comment.Created_at?.toDateTimeFormatEs() }
                ]
            });
            const newCommentWrapper = html`<div id="MessageId${idMessage}"  class="message-wrapper ${commentIdUser == this.User.UserId ? "wraperSelf" : "wrapper"}">
               <img class="message-avatar" src="${comment.Foto ?? "/media/img/avatar.png"}"/> ${message} 
            </div>`;
            // @ts-ignore
            newCommentWrapper.comment = comment;

            /*const commentsWrappers = this.CommentsContainer.querySelectorAll(".message-wrapper");
            commentsWrappers.forEach((mensaje, index) => {
                // @ts-ignore
                const messageDate = new Date(mensaje.comment.Created_at ?? mensaje.comment.Fecha)
                const beforeMessage = commentsWrappers[index - 1];
                const afterMessage = commentsWrappers[index + 1];
            })**/
            // Asumiendo que newCommentWrapper es el nuevo comentario a insertar

            const commentsWrappers = Array.from(this.CommentsContainer.querySelectorAll(".message-wrapper")); // Convertir NodeList a Array para manipularlo fácilmente

            // Obtener la fecha del nuevo comentario
            // @ts-ignore
            const newCommentDate = new Date(newCommentWrapper.comment.Created_at ?? newCommentWrapper.comment.Fecha);

            // Encontrar la posición correcta donde insertar el nuevo comentario
            let insertBeforeIndex = commentsWrappers.findIndex((mensaje) => {
                // Obtener la fecha del comentario actual
                // @ts-ignore
                const messageDate = new Date(mensaje.comment.Created_at ?? mensaje.comment.Fecha);

                // Comparar las fechas: si el nuevo comentario es más reciente, detener aquí
                return newCommentDate < messageDate;
            });

            // Si no encuentra una posición (es el más reciente), se agrega al final
            if (insertBeforeIndex === -1) {
                this.CommentsContainer.appendChild(newCommentWrapper);  // Insertar al final
            } else {
                // Insertar el nuevo comentario en la posición correcta
                this.CommentsContainer.insertBefore(newCommentWrapper, commentsWrappers[insertBeforeIndex]);
            }
        });
    }
    update = async (inicialize = false, isUpScrolling = false) => {
        const Message = {}
        Message[this.CommentsIdentifyName] = this.CommentsIdentify
        this.maxMessage = 30;
        this.actualPage = this.actualPage ?? 1;
        if (isUpScrolling) {
            Message.FilterData = [{
                FilterType: "PAGINATED",
                Values: [this.actualPage.toString(), this.maxMessage.toString()]
            }]
        } else {
            Message.FilterData = [{ FilterType: "PAGINATED", Values: ["1", "30"] }]
        }
        try {
            // @ts-ignore
            const response = await WAjaxTools.PostRequest(this.UrlSearch, Message, { WithoutLoading: true });
            //console.log(response);
            this.Dataset = response;
            if (!inicialize) {
                await this.DrawWCommentsComponent();
            }
        } catch (err) {
            console.error("Error al cargar mensajes:", err);
        }
    }

    GetFileNameFromPath(path) {
        if (!this.UseOnlyFileName) {
            return path;
        }
        if (!path) return '';

        // Reemplaza las barras invertidas por barras normales para evitar problemas
        const normalizedPath = path.replace(/\\/g, '/');

        // Divide la ruta por '/' y obtiene el último elemento
        const parts = normalizedPath.split('/');
        return "/" + parts[parts.length - 1];
    }
    CustomStyle = css`    
        .CommentsContainer{
            display: flex;
            flex-direction: column;
            overflow: hidden;
            overflow-y: auto;  
            min-height: 280px;
            background-color: var(--primary-color);     
            height: calc(100%  - 150px);
            border-radius: 10px;
            padding: 10px;
            display: block;
            max-height: 70vh;
        }
        .textContainer {
            display: flex;
        }
        .textContainer label{
            padding: 5px;
            cursor: pointer;
            margin-right: 10px;
            font-weight: bold;
            font-size: 12px;
        }
        .OptionContainer {     
            margin: 10px 0px;       
            display: grid;
            grid-template-columns: calc(100% - 120px) 100px;
            gap: 20px;
            min-width: 400px;
        }
        .RichOptionContainer {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            justify-content: flex-end;
            gap: 10px;
        }        
        p {
            margin: 5px 0px;
        }
        label.nickname {
            font-weight: bold;
            text-align: left;
        }
        .attachs {
            overflow: hidden;   
            display: flex;
            gap: 5px;
            flex-wrap: wrap;       
        }
        .attachs img {
            width: 100px;
            height: 100px;
            overflow: hidden;
            cursor: pointer;
            border-radius: 10px;
            object-fit: cover;
        }
        .attachs a {
            cursor: pointer;
            width: 100%;
            margin: 10px 0px;
            display: block;
            font-weight: bold;
            text-decoration: underline;
            color: #020c1f;
        }
        .message-wrapper {
            display: flex;
            gap: 10px;
        }
        .wraperSelf{
            flex-direction: row-reverse;
            justify-content: flex-start;
        }
        .wrapper{
            color: #000;
        }
        .message-avatar {
            height: 40px;
            width: 40px;
            overflow: hidden;
            border-radius: 50%;
        }
        .comment, .commentSelf {
            padding: 10px;
            margin: 5px;
            width: calc(100% - 80px);
            border-radius: 10px;
            font-size: 12px;
            height: fit-content;
            text-align: left;
        }
        .comment { 
            background-color: #f2f5f8;
        }
        .commentSelf {
            background-color: #e3ecf3;
            color: #000000;
        }        
        .comment label, .commentSelf label, .comment p, .commentSelf p {
            display: block;
            text-align: left;
        }
        .commentSelf p, .comment p {
            white-space: pre-wrap;
            font-size: 14px;
        }
        .commentSelf p::first-letter, .comment p::first-letter {
            text-transform: uppercase;
        }
        label.date {
            font-size: 12px;
            text-align: end;
        }
        .Btn-Mini {
            width: 100px;
            justify-self: right;
        }
        w-rich-text {
            margin-top: 10px;
            width: calc(100% - 12px);
        }
        @media only screen and (max-width: 700px) {
            .OptionContainer {
                grid-template-columns: 1fr;
                min-width: unset;
                width: 100%;
            }
            .RichOptionContainer {
                align-items: center;
                justify-content: center;
            }
        }
       
    `

}
customElements.define('w-coment-component', WCommentsComponent);
export { WCommentsComponent }

class Destinatario {
    /**@type {Number} */
    Id_User;
    /**@type {String} */
    Correo;
    /**@type {String} */
    Nombre;
    /**@type {Boolean} */
    Enviado;
    /**@type {Boolean} */
    Leido;
}