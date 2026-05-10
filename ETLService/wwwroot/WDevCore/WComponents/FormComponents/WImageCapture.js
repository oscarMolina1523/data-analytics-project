//@ts-check
import { WRender } from "../../WModules/WComponentsTools.js";
import { css } from "../../WModules/WStyledRender.js";
import { WModalForm } from "../WModalForm.js";



class WImageCapture extends HTMLElement {
    /**
     * @typedef {Object} Config 
        * @property {Function} [action]
        * @property {String} [value]
    **/
    /**
    * @param {Config} [Config] 
    */
    constructor(Config = {}) {
        super();
        this.Config = Config;
        this.attachShadow({ mode: 'open' });
        WRender.SetStyle(this, {
            display: "block",
            width: "-webkit-fill-available",
            overflow: "hidden"
        });
        this.shadowRoot?.append(this.CustomStyle);
        // @ts-ignore
        this.videoElement = WRender.Create({ tagName: 'video', className: 'videoElement', autoplay: true });
        /**@type {HTMLCanvasElement} */
        // @ts-ignore
        this.canvas = WRender.Create({ tagName: 'canvas', className: 'canvas' });
        /**@type {HTMLCanvasElement} */
        // @ts-ignore
        this.croppedCanvas = WRender.Create({ tagName: 'canvas', className: 'croppedCanvas' });
        // context
        /**@type {CanvasRenderingContext2D} */
        // @ts-ignore
        this.ctx = this.canvas.getContext('2d');
        /**@type {CanvasRenderingContext2D} */
        // @ts-ignore
        this.croppedCtx = this.croppedCanvas.getContext('2d');
        this.img = new Image();
        this.startX;
        this.startY;
        this.endX;
        this.endY;
        this.isDragging = false;
        this.isResizing = false;
        this.activeHandle = null;
        this.croppedImageBase64 = '';
        this.handles = [];
        this.originalWidth;
        this.originalHeight; // Dimensiones originales de la imagen
        this.Draw();
    }
    connectedCallback() { }
    Draw = async () => {

        if (this.Config.value) {
            this.img.src = this.Config.value
            this.img.onload = () => {
                this.originalWidth = this.img.width;
                this.originalHeight = this.img.height;
                this.canvas.width = this.originalWidth;
                this.canvas.height = this.originalHeight;
                this.ctx.drawImage(this.img, 0, 0);
                //this.drawImageWithObjectFit('fill');
                this.initializeHandles();
            };
        }
        this.ControlContainer = WRender.Create({
            class: "capture-container", children: []
        });
        const InputControl = WRender.Create({
            tagName: "input", id: "imageInput", className: "LabelFile", onchange: () => { }, type: "file", style: {
                display: "none"
            }
        });
        const label = WRender.Create({
            tagName: "label",
            class: "LabelFile",
            innerText: "Seleccionar archivo",
            htmlFor: "imageInput"
        });

        // @ts-ignore
        InputControl.accept = ".jpg, .jpeg, .png";

        const cameraButton = WRender.Create({
            tagName: 'button', className: 'LabelFile', innerText: 'Use Camera', onclick: async () => {
                //code.....
            }
        });
        const captureButton = WRender.Create({
            tagName: 'button', className: 'captureButton', innerText: '', onclick: async () => {
                //code.....
            }
        });

        this.setEvents(InputControl, this.canvas, this.ctx, cameraButton, this.videoElement, captureButton);

        this.ControlContainer.append(InputControl, this.canvas, label, cameraButton);
        this.shadowRoot?.append(this.ControlContainer);
    }
    setEvents(InputControl, canvas, ctx, cameraButton, videoElement, captureButton) {
        InputControl.addEventListener('change', (event) => {
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
                this.img.src = URL.createObjectURL(file);
                this.img.onload = () => {
                    this.originalWidth = this.img.width;
                    this.originalHeight = this.img.height;
                    canvas.width = this.originalWidth;
                    canvas.height = this.originalHeight;
                    this.ctx.drawImage(this.img, 0, 0);
                    this.initializeHandles();
                };
                event.target.value = '';
            }
        });
        let modal = new WModalForm({});
        cameraButton.addEventListener('click', () => {
            modal = new WModalForm({
                ObjectModal: WRender.Create({
                    className: "camera-container", children: [
                        videoElement, captureButton, css`
                    .camera-container {
                        position: relative;
                        width: -webkit-fill-available;
                        height: -webkit-fill-available;
                    }
                    .videoElement {
                        width: -webkit-fill-available;
                        background-color: #000;
                        height: calc(100% - 10px);
                    }  
                    .ObjectModalContainer {
                        width: -webkit-fill-available;
                        padding: 0;
                        margin-bottom: 0px;
                        max-height: calc(100%)
                    }
                    .ContainerFormWModal{
                        grid-template-rows: 50px calc(100% - 50px);
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
                `
                    ]
                })
            })
            this.shadowRoot?.append(modal);

            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    videoElement.srcObject = stream;
                })
                .catch(error => {
                    console.error('Error accessing the camera', error);
                });
        });

        captureButton.addEventListener('click', () => {
            const videoWidth = videoElement.videoWidth;
            const videoHeight = videoElement.videoHeight;
            this.originalWidth = videoWidth;
            this.originalHeight = videoHeight;
            canvas.width = videoWidth;
            canvas.height = videoHeight;
            this.ctx.drawImage(videoElement, 0, 0, videoWidth, videoHeight);
            this.img.src = canvas.toDataURL('image/png');
            if (this.Config.action) {
                this.Config.action(this.img.src);
            }
            this.img.onload = () => {
                this.ctx.drawImage(this.img, 0, 0);
                this.initializeHandles();
            };

            modal.close();
            const stream = videoElement.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
        });

        const getRelativeCoordinates = (clientX, clientY) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = this.originalWidth / rect.width;
            const scaleY = this.originalHeight / rect.height;
            const x = (clientX - rect.left) * scaleX;
            const y = (clientY - rect.top) * scaleY;
            return { x, y };
        };

        const startDragging = (x, y) => {
            const handle = this.getHandleUnderCursor(x, y);
            if (handle) {
                this.isResizing = true;
                this.activeHandle = handle;
            } else {
                this.startX = x;
                this.startY = y;
                this.isDragging = true;
            }
        };

        const continueDragging = (x, y) => {
            if (this.isDragging) {
                this.endX = x;
                this.endY = y;
                this.ctx.clearRect(0, 0, canvas.width, canvas.height);
                this.ctx.drawImage(this.img, 0, 0);
                this.drawSelectionRect(this.startX, this.startY, this.endX, this.endY);
            } else if (this.isResizing) {
                this.resizeSelectionRect(x, y);
            }
        };

        const stopDragging = () => {
            if (this.isDragging || this.isResizing) {
                this.isDragging = false;
                this.isResizing = false;
                this.activeHandle = null;
                this.updateHandles();
                this.cropImage();
            }
        };

        canvas.addEventListener('mousedown', (event) => {
            const { x, y } = getRelativeCoordinates(event.clientX, event.clientY);
            startDragging(x, y);
        });

        canvas.addEventListener('mousemove', (event) => {
            const { x, y } = getRelativeCoordinates(event.clientX, event.clientY);
            continueDragging(x, y);
        });

        document.addEventListener('mouseup', stopDragging);

        canvas.addEventListener('touchstart', (event) => {
            const touch = event.touches[0];
            const { x, y } = getRelativeCoordinates(touch.clientX, touch.clientY);
            startDragging(x, y);
        });

        canvas.addEventListener('touchmove', (event) => {
            const touch = event.touches[0];
            const { x, y } = getRelativeCoordinates(touch.clientX, touch.clientY);
            continueDragging(x, y);
        });

        document.addEventListener('touchend', stopDragging);
    }
    drawImageWithObjectFit(fitStyle) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Limpia el this.canvas

        let x = 0, y = 0, width = this.canvas.width, height = this.canvas.height;

        if (fitStyle === 'contain' || fitStyle === 'scale-down') {
            const scale = Math.min(this.canvas.width / this.img.width, this.canvas.height / this.img.height);
            width = this.img.width * scale;
            height = this.img.height * scale;
            x = (this.canvas.width - width) / 2;
            y = (this.canvas.height - height) / 2;
        } else if (fitStyle === 'cover') {
            const scale = Math.max(this.canvas.width / this.img.width, this.canvas.height / this.img.height);
            width = this.img.width * scale;
            height = this.img.height * scale;
            x = (this.canvas.width - width) / 2;
            y = (this.canvas.height - height) / 2;
        } else if (fitStyle === 'none') {
            width = this.img.width;
            height = this.img.height;
        }

        this.ctx.drawImage(this.img, x, y, width, height);
    }

    update() {
        this.Draw();
    }

    drawSelectionRect(startX, startY, endX, endY) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Limpiar el canvas
        this.ctx.drawImage(this.img, 0, 0); // Redibujar la imagen original

        // Dibujar el rectángulo de selección
        this.ctx.beginPath();
        this.ctx.rect(startX, startY, endX - startX, endY - startY);
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Dibujar los círculos en las esquinas del rectángulo
        const handleRadius = 5; // Radio de los círculos
        const handlePositions = [
            { x: startX, y: startY },
            { x: endX, y: startY },
            { x: startX, y: endY },
            { x: endX, y: endY }
        ];

        this.ctx.fillStyle = 'red';
        handlePositions.forEach(pos => {
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, handleRadius, 0, 2 * Math.PI);
            this.ctx.fill();
        });

        // Actualizar las posiciones de los manejadores
        this.updateHandles(handlePositions);
    }

    cropImage() {
        const cropWidth = Math.abs(this.endX - this.startX);
        const cropHeight = Math.abs(this.endY - this.startY);
        const cropX = Math.min(this.startX, this.endX);
        const cropY = Math.min(this.startY, this.endY);

        this.croppedCanvas.width = cropWidth;
        this.croppedCanvas.height = cropHeight;

        this.croppedCtx.drawImage(this.img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
        this.croppedImageBase64 = this.croppedCanvas.toDataURL('image/png');
        //console.log(this.croppedImageBase64);
        if (this.Config.action) {
            this.Config.action(this.croppedImageBase64);
        }
        //const imgt = WRender.Create({tagName: "img", src: this.croppedImageBase64})
        //this.shadowRoot.append(new WModalForm({ ObjectModal: imgt}))
    }

    initializeHandles() {
        this.handles = []
        this.handleSize = 10;
        for (let i = 0; i < 4; i++) {
            const handle = document.createElement('div');
            handle.className = 'handle';
            handle.style.width = `${this.handleSize}px`;
            handle.style.height = `${this.handleSize}px`;
            handle.style.display = 'none';
            handle.style.position = 'absolute';
            this.shadowRoot?.appendChild(handle);
            this.handles.push(handle);
        }
    }

    updateHandles(handlePositions) {
        this.handles?.forEach((handle, index) => {
            if (handlePositions == undefined || handlePositions[index].x == undefined || handle.style.left == undefined) {
                return
            }
            handle.style.left = `${handlePositions[index].x - 5}px`;
            handle.style.top = `${handlePositions[index].y - 5}px`;
            handle.style.display = 'block';
        });
    }

    getHandleUnderCursor(x, y) {
        return this.handles?.find(handle => {
            const rect = handle.getBoundingClientRect();
            return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        });
    }

    resizeSelectionRect(x, y) {
        const handleIndex = this.handles?.indexOf(this.activeHandle);
        switch (handleIndex) {
            case 0:
                this.startX = x;
                this.startY = y;
                break;
            case 1:
                this.endX = x;
                this.startY = y;
                break;
            case 2:
                this.startX = x;
                this.endY = y;
                break;
            case 3:
                this.endX = x;
                this.endY = y;
                break;
        }

        // @ts-ignore
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.ctx.drawImage(this.img, 0, 0);
        this.drawSelectionRect(this.startX, this.startY, this.endX, this.endY);
    }
    //TODO VER EL REZIGSING A POSTERIORI
    CustomStyle = css`
        .capture-container{
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
         .WImageCapture{
            display: block;
         }  
         canvas {
            border: 1px solid #d7d7d7;
            position: relative;
            overflow: hidden;
            border-radius: 10px;
            width: 100%;
        }
        .handle {
            position: fixed;
            width: 10px;
            height: 10px;
            background-color: red;
            cursor: pointer;
            opacity: 0;
            display: none !important;
        }
        .canvas-container {
            position: relative;
        }
           
        .imgPhoto {
            grid-row-start: 1 !important;
        }
        .DrawControlContainer{
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .imgPhotoWModal {
            max-height: 250px;
            max-width: 250px;
            min-height: 250px;
            display: block;
            margin: auto;
            width: 100%;
            object-fit: cover;
            box-shadow: 0 0px 2px 0px #000;
            object-position: top;
            border-radius: .5cm;
        }
        .LabelFile {
            padding: 5px 10px;
            max-width: 250px;
            margin: auto;
            cursor: pointer;
            background-color: #4894aa;
            border-radius: 0.2cm;
            display: block;
            color: #fff;
            text-align: center;
            border: none;
            font-size: 12px;
        }  
        *::-webkit-scrollbar-track {
            display: none;
        }

        *::-webkit-scrollbar-thumb {
            display: none;
        }

        *::-webkit-scrollbar-thumb:hover {
            display: none;
        }  
         
     `
}
customElements.define('w-image-capture', WImageCapture);
export { WImageCapture }
