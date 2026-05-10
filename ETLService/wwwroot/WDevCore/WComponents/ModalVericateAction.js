//@ts-check

import { WRender } from "../WModules/WComponentsTools.js";
import { WSimpleModal } from "./WSimpleModal.js";

export const ModalVericateAction = (Action, title, withClose = true) => {
	const ModalCheck = new WSimpleModal({
		title: "AVISO",
		CloseOption: false,
		ObjectModal: [
			WRender.Create({ tagName: "h3", innerText: title ?? "¿Esta seguro que desea guardar este registro?" }),
			WRender.Create({
				style: { justifyContent: "center", display: "flex" },
				children: [
					WRender.Create({
						tagName: 'input', type: 'button', className: 'Btn', value: 'ACEPTAR', onclick: async (ev) => {
							await Action(ev);
							ModalCheck.close();
						}
					}), withClose ? WRender.Create({
						tagName: 'input', type: 'button', className: 'Btn', value: 'CANCELAR', onclick: async () => {
							ModalCheck.close();
						}
					}) : ""
				]
			})
		]
	});
	return ModalCheck;
}