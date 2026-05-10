import { css } from "../../WModules/WStyledRender.js";

export const WChatStyle = css`
 * {
	 margin: 0;
	 box-sizing: border-box;
	 font-family: "Poppins", sans-serif;
 }

 :root {
	 --text-color: #FFFFFF;
	 --icon-color: #ACACBE;
	 --icon-hover-bg: #5b5e71;
	 --placeholder-color: #dcdcdc;
	 --outgoing-chat-bg: #343541;
	 --incoming-chat-bg: #444654;
	 --outgoing-chat-border: #343541;
	 --incoming-chat-border: #444654;
	 
	 
	 --text-color: #343541;
	 --icon-color: #a9a9bc;
	 --icon-hover-bg: #f1f1f3;
	 --placeholder-color: #6c6c6c;
	 --outgoing-chat-bg: #FFFFFF;
	 --incoming-chat-bg: #F7F7F8;
	 --outgoing-chat-border: #FFFFFF;
	 --incoming-chat-border: #D9D9E3;
 }

 .light-mode {
	 --text-color: #343541;
	 --icon-color: #a9a9bc;
	 --icon-hover-bg: #f1f1f3;
	 --placeholder-color: #6c6c6c;
	 --outgoing-chat-bg: #FFFFFF;
	 --incoming-chat-bg: #F7F7F8;
	 --outgoing-chat-border: #FFFFFF;
	 --incoming-chat-border: #D9D9E3;
 }

 body {
	background: var(--outgoing-chat-bg);
 }

 .header {
	padding: 20px;
	border-bottom: #0693d4 solid 2px;
	& * {
		color: var(--text-color)
	}
 }

 /* Chats container styling */
 .chat-container {
	overflow-y: auto;
	max-height: calc(100vh - 230px);
	margin-bottom: 130px !important;
 }

 :where(.chat-container, textarea)::-webkit-scrollbar {
	 width: 6px;
 }

 :where(.chat-container, textarea)::-webkit-scrollbar-track {
	 background: var(--incoming-chat-bg);
	 border-radius: 25px;
 }

 :where(.chat-container, textarea)::-webkit-scrollbar-thumb {
	 background: var(--icon-color);
	 border-radius: 25px;
 }

 .default-text {
	 display: flex;
	 align-items: center;
	 justify-content: center;
	 flex-direction: column;
	 height: 70vh;
	 padding: 0 10px;
	 text-align: center;
	 color: var(--text-color);
 }

 .default-text h1 {
	 font-size: 1.5em !important;
 }

 .default-text .pElement {
	 margin-top: 10px;
	 font-size: 1.1rem;
 }

 .chat-container .chat {
	 padding: 25px 20px;
	 display: flex;
	 justify-content: center;
	 color: var(--text-color);
	 max-width: 1200px;
	 margin: auto;
	 border-radius: 0.3cm;
	 margin-bottom: 5px;
 }

 .chat-container .chat.outgoing {
	 background: var(--outgoing-chat-bg);
	 border: 1px solid var(--outgoing-chat-border);
	 & .chat-content  {
		justify-content: flex-end;
		& .chat-details {
			flex-direction: row-reverse;
		}
		
	 }
 }
 .chat-container .chat.incoming svg{
    display: none;
}
.chat-container .chat.outgoing img.bot{
    display: none;
}

.chat-container .chat.incoming {
	background: var(--incoming-chat-bg);
	border: 1px solid var(--incoming-chat-border);
}
#ControlValueCorreo {
	border: solid #eee 1px !important;
}

 .chat .chat-content {
	 display: flex;
	 max-width: 1200px;
	 width: 100%;
	 align-items: flex-start;
	 justify-content: space-between;
 }

 span.material-symbols-rounded {
	 user-select: none;
	 cursor: pointer;
 }

 .chat .chat-content span {
	 cursor: pointer;
	 font-size: 1.3rem;
	 color: var(--icon-color);
	 visibility: hidden;
 }

 .chat:hover .chat-content:not(:has(.typing-animation), :has(.error)) span {
	 visibility: visible;
 }

 .chat .chat-details {
	 display: flex;
	 align-items: center;
 }

 .chat .chat-details svg {
	 width: 40px;
	 height: 40px;
	 min-width: 40px;
	 align-self: flex-start;
	 object-fit: cover;
	 border-radius: 2px;
 }

#send-btn {
	color: #1571db;
}
#delete-btn {
	color: #db6030;
	width: 30px;
}


 .chat .chat-details .pElement {
	 white-space: pre-wrap;
	 font-size: 12px !important;
	 padding: 0 50px 0 25px;
	 color: var(--text-color);
	 word-break: break-word;
 }

 .chat .chat-details .pElement.error {
	 color: #e55865;
 }

 .chat .typing-animation {
	 padding-left: 25px;
	 display: inline-flex;
 }
 .chat-container {
	padding: 10px;
 }
 
 .bot {
	align-self: baseline;
 }

 .typing-animation .typing-dot {
	 height: 7px;
	 width: 7px;
	 border-radius: 50%;
	 margin: 0 3px;
	 opacity: 0.7;
	 background: var(--text-color);
	 animation: animateDots 1.5s var(--delay) ease-in-out infinite;
 }

 .typing-animation .typing-dot:first-child {
	 margin-left: 0;
 }

 @keyframes animateDots {

	 0%,
	 44% {
		 transform: translateY(0px);
	 }

	 28% {
		 opacity: 0.4;
		 transform: translateY(-6px);
	 }

	 44% {
		 opacity: 0.2;
	 }
 }

 /* Typing container styling */
 .typing-container {
	 position: fixed;
	 bottom: 60px;
	 width: 100%;
	 display: flex;
	 padding: 20px 10px 10px;
	 justify-content: center;
	 background: var(--outgoing-chat-bg);
	 border-top: 1px solid var(--incoming-chat-border);
 }

 .typing-container .typing-content {
	 display: flex;
	 max-width: 950px;
	 width: 100%;
	 align-items: flex-end;
 }
 .AddInputFileSection {
	position: fixed;
	bottom: 0;
	display: grid !important;
	grid-template-columns: auto 80px 50px;
	align-items: center;
	width: 100%;
 }

 .typing-container .typing-textarea {
	 width: 100%;
	 display: flex;
	 position: relative;
 }

 .typing-textarea textarea {
	 resize: none;
	 min-height: 45px;
	 font-size: 14px !important;
	 height: 45px;
	 width: 100%;
	 border: none;
	 padding: 15px 45px 15px 20px;
	 color: var(--text-color);
	 border-radius: 4px;
	 max-height: 250px;
	 overflow-y: auto;
	 background: var(--incoming-chat-bg);
	 outline: 1px solid var(--incoming-chat-border);
 }

 .typing-textarea textarea::placeholder {
	 color: var(--placeholder-color);
 }

 .typing-content span {
	 width: 55px;
	 height: 55px;
	 display: flex;
	 border-radius: 4px;
	 font-size: 1.35rem;
	 align-items: center;
	 justify-content: center;
	 color: var(--icon-color);
 }

 .typing-textarea span {
	 position: absolute;
	 right: 0;
	 bottom: 0;
	 visibility: hidden;
 }

 .typing-textarea textarea:valid~span {
	 visibility: visible;
 }

 .typing-controls {
	 display: flex;
 }

 .typing-controls span {
	 margin-left: 7px;
	 font-size: 1.4rem;
	 background: var(--incoming-chat-bg);
	 outline: 1px solid var(--incoming-chat-border);
 }

 .typing-controls span:hover {
	 background: var(--icon-hover-bg);
 }

 w-form {
 }
 .material-symbols-rounded{
	max-width: 50px;
	overflow: hidden;
 }

 .attachs {
            overflow: hidden;   
            display: flex;
            gap: 5px;
            flex-wrap: wrap;       
        }
        .attachs img {
            width: 500px;
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
.chat.outgoing .pElement {
	text-align: end;
}
 /* Reponsive Media Query */


 @media screen and (max-width: 800px) {
	 :where(.default-text .pElement, textarea, .chat .pElement) {
		 font-size: 0.95rem !important;
	 }

	 .chat-container .chat {
		 padding: 20px 10px;
	 }

	 .chat-container .chat img {
		 height: 25px;
		 width: 25px;
	 }

	 .chat-container .chat .pElement {
		 padding: 0 20px;
	 }	

	 .chat .chat-content:not(:has(.typing-animation), :has(.error)) span {
		 visibility: visible;
	 }

	 .typing-container {
		 padding: 15px 10px;
	 }

	 .typing-textarea textarea {
		 height: 45px;
		 padding: 10px 40px 10px 10px;
	 }

	 .typing-content span {
		 height: 45px;
		 width: 45px;
		 margin-left: 5px;
	 }

	 span.material-symbols-rounded {
		 font-size: 1.25rem !important;
	 }
	 
	 .chat .chat-details .pElement {
		padding: 0 10px 0 10px;
	 }
 }

`