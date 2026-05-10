//@ts-check
import { WAlertMessage } from "./WAlertMessage.js";

window.addEventListener('load', async () => {
	console.log(localStorage.getItem("reloadWAlertMessage"));

	if (localStorage.getItem("reloadWAlertMessage") != null) {
		const message = localStorage.getItem("reloadWAlertMessage");		
		document.body.append(ModalMessage(message));
		localStorage.removeItem("reloadWAlertMessage");
	}
})
export const ModalMessage = (message, detail = "", reload = false) => {
	if (reload == true) {
		localStorage.setItem("reloadWAlertMessage", message);
		window.location.reload();
	}
	WAlertMessage.Info(message, true);
	return new WAlertMessage({ Message: message, Temporal: true });
	/*const ModalCheck = new WSimpleModal({
		title: message,
		CloseOption: false,
		ObjectModal: [WRender.Create({ tagName: 'p', class: "modalP", innerText: detail }), WRender.Create({
			style: { textAlign: "center" },
			children: [WRender.Create({
				tagName: 'input', type: 'button', className: 'Btn', value: 'ACEPTAR', onclick: async () => {
					ModalCheck.close();
					if (reload == true) {
						window.location.reload();
					}
				}
			}), css`
				.modalP{
					text-align: center;
				}
			`]
		})]
	});
	return ModalCheck;*/
}
