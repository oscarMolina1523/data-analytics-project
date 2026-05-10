//@ts-check

import { html, WRender } from "../../WModules/WComponentsTools.js";
import { css } from "../../WModules/WStyledRender.js";
import { WModalForm } from "../WModalForm.js";

class BtnVideoComponent extends HTMLElement {
    /**
     * @param {{ action: (imageB64: any) => Promise<void>; }} Config
     */
    constructor(Config) {
        super();
        this.Config = Config
        this.append(this.CustomStyle);
        /**@type {String?} */
        this.imageB64 = null;
        /**@type {HTMLVideoElement} */
        // @ts-ignore
        this.videoElement = WRender.Create({ tagName: 'video', className: 'videoElement', autoplay: true });
        /**@type {HTMLCanvasElement} */
        // @ts-ignore
        this.canvas = WRender.Create({ tagName: 'canvas', className: 'canvas' });
        this.Draw();
    }
    connectedCallback() { }
    Draw = async () => {



        /**@type {CanvasRenderingContext2D} */
        // @ts-ignore
        this.ctx = this.canvas.getContext('2d');

        const cameraButton = html`<div class="camera-btn">
            <svg fill="#0976dc" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke="#0976dc"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>photo</title> <path d="M0 28v-20q0-0.832 0.576-1.408t1.44-0.576h4q0.8 0 1.408-0.576t0.576-1.44 0.576-1.408 1.44-0.576h12q0.8 0 1.408 0.576t0.576 1.408 0.576 1.44 1.44 0.576h4q0.8 0 1.408 0.576t0.576 1.408v20q0 0.832-0.576 1.44t-1.408 0.576h-28q-0.832 0-1.44-0.576t-0.576-1.44zM6.016 16q0 2.048 0.768 3.904t2.144 3.168 3.2 2.144 3.872 0.8q2.72 0 5.024-1.344t3.648-3.648 1.344-5.024-1.344-4.992-3.648-3.648-5.024-1.344q-2.016 0-3.872 0.8t-3.2 2.112-2.144 3.2-0.768 3.872zM10.016 16q0-2.464 1.728-4.224t4.256-1.76 4.256 1.76 1.76 4.224-1.76 4.256-4.256 1.76-4.256-1.76-1.728-4.256z"></path> </g></svg>
        </div>`

        const InputControl = WRender.Create({
            tagName: "input", id: "imageInput", className: "LabelFile", onchange: () => { }, type: "file", style: {
                display: "none"
            }
        });
        const label = WRender.Create({
            tagName: "label",
            class: "LabelFile",
            htmlFor: "imageInput",
            children: [
                html`<div class='upload-btn'>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#1f6a98"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M17 17H17.01M15.6 14H18C18.9319 14 19.3978 14 19.7654 14.1522C20.2554 14.3552 20.6448 14.7446 20.8478 15.2346C21 15.6022 21 16.0681 21 17C21 17.9319 21 18.3978 20.8478 18.7654C20.6448 19.2554 20.2554 19.6448 19.7654 19.8478C19.3978 20 18.9319 20 18 20H6C5.06812 20 4.60218 20 4.23463 19.8478C3.74458 19.6448 3.35523 19.2554 3.15224 18.7654C3 18.3978 3 17.9319 3 17C3 16.0681 3 15.6022 3.15224 15.2346C3.35523 14.7446 3.74458 14.3552 4.23463 14.1522C4.60218 14 5.06812 14 6 14H8.4M12 15V4M12 4L15 7M12 4L9 7" stroke="#0a8fd1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                </div>`]
        });

        // @ts-ignore
        InputControl.accept = ".jpg, .jpeg, .png";
        const captureButton = WRender.Create({
            tagName: 'button', className: 'captureButton', innerText: '', onclick: async () => {
                //code.....
            }
        });
        let modal = new WModalForm({});
        captureButton.addEventListener('click', () => {
            const videoWidth = this.videoElement.videoWidth;
            const videoHeight = this.videoElement.videoHeight;
            this.originalWidth = videoWidth;
            this.originalHeight = videoHeight;
            this.canvas.width = videoWidth;
            this.canvas.height = videoHeight;
            this.ctx?.drawImage(this.videoElement, 0, 0, videoWidth, videoHeight);
            this.imageB64 = this.canvas.toDataURL('image/png');
            if (this.Config.action) {
                console.log(this.imageB64);
                this.Config.action(this.imageB64.replace("data:image/png;base64,", ""));
            }
            modal.close();
            const stream = this.videoElement.srcObject;
            // @ts-ignore
            const tracks = stream.getTracks();
            tracks.forEach((/** @type {{ stop: () => any; }} */ track) => track.stop());
        });
        cameraButton.addEventListener('click', () => {
            modal = new WModalForm({
                ObjectModal: WRender.Create({
                    className: "camera-container", children: [
                        this.videoElement,
                        captureButton,
                        css`
                    .camera-container {
                        position: relative;
                        width: -webkit-fill-available;
                        height: -webkit-fill-available;
                    }
                    .videoElement {
                        width: -webkit-fill-available;
                        background-color: #000;
                        height: -webkit-fill-available;
                    }  
                    .ObjectModalContainer {
                        width: -webkit-fill-available;
                        padding: 0;
                        margin-bottom: 0px;
                        max-height: calc(100%)
                    }
                    .ContainerFormWModal{
                        grid-template-rows: 100%;
                        margin: 0px;
                        top: 0;
                        right: 0;
                        left: 0;
                        width: 100% !important;
                        height: -webkit-fill-available;
                        position: relative;
                        padding: 0px;
                    }
                    .ModalHeader {
                        position: absolute;
                        z-index: 1;
                        left: 0;
                        right: 0;
                    }
                    .captureButton {
                        height: 40px;
                        width: 40px;
                        background-color: red;
                        border-radius: 50%;
                        border: none;
                        position: absolute;
                        bottom: 20px;
                        display: block;
                        margin: auto;
                        left: 50%;
                        transform: translateX(-50%);
                        cursor: pointer;
                    } 
                `]
                })
            })
            this.append(modal);

            navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                    width: { ideal: 3840 },
                    height: { ideal: 2160 },
                }
            }).then(stream => {
                //TODO QUE ES TRACK
                this.videoElement.srcObject = stream;
                // @ts-ignore
                const capabilities = track?.getCapabilities();
                if (capabilities.focusMode) {
                    // @ts-ignore
                    track.applyConstraints({
                        advanced: [{ focusMode: 'continuous' }]
                    });
                }
            })
                .catch(error => {
                    console.error('Error accessing the camera', error);
                });
        });
        InputControl.addEventListener('change', (event) => {
            // @ts-ignore
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const base64String = ev.target?.result;
                    if (this.Config.action) {
                        this.Config.action(base64String);
                    }
                };
                // Leer el archivo como base64
                reader.readAsDataURL(file);
                // @ts-ignore
                event.target.value = '';
            }
        });
        this.append(cameraButton,
            InputControl,
            label);
    }
    update() {
        this.Draw();
    }
    CustomStyle = css`
        w-btncapturevideo {
            display: flex;
            width: 70px;
            align-items: center;
            gap: 10px;
            padding: 10px;

        }
         .component{
            display: block;
         }    
         w-modal-form {            
            padding-bottom: 0px !important;
         }
         .camera-btn, .LabelFile {
            width: 50px;
            height: 100%;
            cursor: pointer;
         }     
         w-btncapturevideo svg {
            width: 30px;
            height: 30px;
         } 
     `
}
customElements.define('w-btncapturevideo', BtnVideoComponent);
export { BtnVideoComponent }