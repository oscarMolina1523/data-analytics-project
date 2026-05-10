import { css } from "../../WModules/WStyledRender.js";

export class DrawComponent extends HTMLElement {
	/**
	 * @typedef {Object.<string, any>} Config 
	 * @property {String} [value]
	 * @property {Function} [action]
	 * @property {String} [color]
	 * @property {Number} [lineWidth]
	 * @property {Boolean} [smooth]
	 **/
	/**
	 * @param {Partial<Config>} Config 
	 */
	constructor(Config = { Agenda: [{ BlockId: 1, Date }], action: (AgendaRegistrada) => { } }) {
		super();
		this.Config = Config;
		this.Config.color = "rgb(11, 89, 153)";
		this.Config.lineWidth = 3;
		this.Config.smooth = true;
		this.append(this.CustomStyle);
	}

	connectedCallback() {
		this.Render();
	}

	Render() {
		// Create a canvas element
		this.canvas = document.createElement('canvas');
		this.canvas.className = "canvas";
		this.canvas.width = 400;
		this.canvas.height = 200;

		// Create controls
		this.controls = document.createElement('div');
		this.controls.className = 'controls';

		// Clear button
		this.clearButton = document.createElement('button');
		this.clearButton.textContent = 'Limpiar';
		this.clearButton.addEventListener('click', () => this.clearCanvas());

		// Color picker
		this.colorPicker = document.createElement('input');
		this.colorPicker.type = 'color';
		this.colorPicker.value = this.Config.color;
		this.colorPicker.addEventListener('input', (e) => this.setStrokeColor(e.target.value));

		// Line width spinner
		this.lineWidthSpinner = document.createElement('input');
		this.lineWidthSpinner.type = 'number';
		this.lineWidthSpinner.value = this.Config.lineWidth;
		this.lineWidthSpinner.min = 1;
		this.lineWidthSpinner.max = 50;
		this.lineWidthSpinner.addEventListener('input', (e) => this.setLineWidth(parseInt(e.target.value)));

		// Increase size button
		this.increaseSizeButton = document.createElement('button');
		this.increaseSizeButton.textContent = '+';
		this.increaseSizeButton.addEventListener('click', () => this.resizeCanvas(1.2)); // Aumentar en 20%

		// Decrease size button
		this.decreaseSizeButton = document.createElement('button');
		this.decreaseSizeButton.textContent = '-';
		this.decreaseSizeButton.addEventListener('click', () => this.resizeCanvas(0.8)); // Disminuir en 20%

		// Append controls
		this.controls.appendChild(this.clearButton);
		this.controls.appendChild(this.colorPicker);
		this.controls.appendChild(this.lineWidthSpinner);
		this.controls.appendChild(this.increaseSizeButton);
		this.controls.appendChild(this.decreaseSizeButton);

		// Append the canvas and controls to the shadow root
		this.appendChild(this.canvas);
		this.appendChild(this.controls);

		// Get the 2D context
		this.ctx = this.canvas.getContext('2d');

		// Initialize drawing state
		this.isDrawing = false;

		// Set initial styles
		this.ctx.strokeStyle = this.Config.color;
		this.ctx.lineWidth = this.Config.lineWidth;
		this.ctx.lineJoin = this.Config.smooth ? 'round' : 'miter';
		this.ctx.lineCap = this.Config.smooth ? 'round' : 'butt';

		// Set up event listeners
		this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
		this.canvas.addEventListener('mousemove', this.draw.bind(this));
		this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
		this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));

		// If a base64 value is provided, draw it on the canvas
		if (this.Config.value) {
			this.loadImageFromBase64(this.Config.value);
		}
	}

	startDrawing(event) {
		this.isDrawing = true;
		this.ctx.beginPath();
		this.ctx.moveTo(event.offsetX, event.offsetY);
	}

	draw(event) {
		if (!this.isDrawing) return;
		this.ctx.lineTo(event.offsetX, event.offsetY);
		this.ctx.stroke();
		this.triggerAction();
	}

	stopDrawing() {
		this.isDrawing = false;
		this.ctx.closePath();
	}

	triggerAction() {
		const base64 = this.canvas.toDataURL();
		this.Config.action(base64);
	}

	loadImageFromBase64(base64) {
		const img = new Image();
		img.src = base64;
		img.onload = () => {
			this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
		};
	}

	// Public method to clear the canvas
	clearCanvas() {
		// Limpiar el contenido visual del canvas
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Restablecer el valor base64 a una cadena vacía
		const base64 = ""; // O puedes usar null si prefieres
		this.Config.action(base64); // Notificar la acción con el nuevo valor base64
	}

	// Public method to change the stroke color
	setStrokeColor(color) {
		this.ctx.strokeStyle = color;
	}

	// Public method to change the line width
	setLineWidth(width) {
		this.ctx.lineWidth = width;
	}

	// Public method to enable/disable smooth drawing
	setSmooth(smooth) {
		this.ctx.lineJoin = smooth ? 'round' : 'miter';
		this.ctx.lineCap = smooth ? 'round' : 'butt';
	}

	// Public method to resize the canvas
	resizeCanvas(scaleFactor) {
		// Calcular el nuevo tamaño del canvas
		const newWidth = this.canvas.width * scaleFactor;
		const newHeight = this.canvas.height * scaleFactor;
	
		// Definir el tamaño mínimo permitido
		const minWidth = 200; // Ancho mínimo de 200px
		const minHeight = 150; // Alto mínimo de 150px
	
		// Ajustar el nuevo tamaño si es menor que el mínimo permitido
		const adjustedWidth = Math.max(newWidth, minWidth);
		const adjustedHeight = Math.max(newHeight, minHeight);
	
		// Crear un canvas temporal para guardar el contenido actual
		const tempCanvas = document.createElement('canvas');
		const tempCtx = tempCanvas.getContext('2d');
		tempCanvas.width = this.canvas.width;
		tempCanvas.height = this.canvas.height;
		tempCtx.drawImage(this.canvas, 0, 0);
	
		// Cambiar el tamaño del canvas principal
		this.canvas.width = adjustedWidth;
		this.canvas.height = adjustedHeight;
	
		// Redibujar el contenido en el nuevo tamaño
		this.ctx.drawImage(
			tempCanvas,
			0, 0, tempCanvas.width, tempCanvas.height, // Coordenadas y tamaño del canvas temporal
			0, 0, this.canvas.width, this.canvas.height // Coordenadas y tamaño del canvas principal
		);
	
		// Notificar el cambio
		this.triggerAction();
	}

	CustomStyle = css`
		canvas-draw {
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
		}
		.controls {
			margin-top: 10px;
			display: flex;
			gap: 10px;
			align-items: center;
		}

		.controls button,
		.controls input {
			padding: 8px 12px;
			border: 1px solid #ccc;
			border-radius: 4px;
			font-size: 14px;
			cursor: pointer;
			height: 100%;
			border: none;
		}

		.controls button {
			background-color: #007BFF;
			color: white;
			border: none;
			transition: background-color 0.3s ease;
		}

		.controls button:hover {
			background-color: #0056b3;
		}

		.controls input[type="color"] {
			padding: 2px;
			height: 36px;
			width: 50px;
			cursor: pointer;
		}

		.controls input[type="number"] {
			width: 60px;
			padding: 8px;
		}

		.canvas {
			border: 1px solid #ccc;
			border-radius: 4px;
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
			background-color: #FFF;
			min-width: 200px;
			min-height: 150px;
		}
	`;
}

// Define the custom element
customElements.define('canvas-draw', DrawComponent);