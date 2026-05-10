import { css } from "../../WModules/WStyledRender.js";

export const WFormStyle = css`
.ContainerFormWModal {
	font-family: 'Montserrat-Medium', sans-serif !important;
}
.divForm {
	display: grid;
	grid-template-rows: auto;
	height: calc(100% - 70px);
	column-gap: 10px;
	row-gap: 5px;
}
.divComplexForm {
	display: grid;
	grid-template-columns: calc(50% - 10px) calc(50% - 10px);
	gap: 15px;
	margin-top: 20px;
}
.divForm .imageGridForm {
	grid-row: span 3;
}
.divForm .imageGridForm,
.divForm .tableContainer {
	grid-row: span 4;               
}
.divComplexForm .tableContainer {
   flex: 1;
   width: 100%;
}
.divForm .textAreaContainer {
	grid-row: span 2;
}
.TITLE {
	grid-column: span 2 !important;
	& h3 {
		font-size: 24px;
		margin: 10px 0px; 
	}
}

input:-internal-autofill-selected {
	appearance: menulist-button;
	background-color: none !important;
	background-image: none !important;
	color: -internal-light-dark(black, white) !important;
}
.DivSaveOptions {
	margin-top: 10px;
	margin-bottom: 10px;
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
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
	padding: 5px;
	max-width: 250px;
	margin: auto;
	cursor: pointer;
	background-color: #4894aa;
	border-radius: 0.2cm;
	display: block;
	color: #fff;
	text-align: center;
}

.LabelFile  svg  {	
	filter: invert(1)
}

.inputTitle, .password-container label {
	padding: 2px;
	display: block;
	text-align: left;
	margin: 10px 0 10px 0;
	font-size: 12px;
	color: var(--font-secundary-color)
}
.password-container { 
	display: grid;
	gap: 20px;
	grid-template-columns: calc(50% - 10px) calc(50% - 10px);
	grid-column: span 2;
}

.inputTitle::first-letter, .password-container label {
	text-transform: capitalize;
}

.formHeader{
	color: var(--font-secundary-color);
	text-transform: uppercase;
	margin-top: 15px;
}

.radioCheckedControl{
	display: flex;
	align-items: center;
	justify-content: flex-end;
	flex-direction: row-reverse;
}

input[type=checkbox] {
	appearance: none;
	background-color: var(--secundary-color);
	margin: 0;
	font: inherit;
	color: currentColor;
	width: 1.15em;
	height: 1.15em;
	padding: 13px;
	border: 0.15em solid #999;
	border-radius: 0.15em;
	display: grid;
	place-content: center;
}

input[type=checkbox]::before {
	content: "";
	width: 1em;
	height: 1em;
	transform: scale(0);
	box-shadow: inset 1em 1em var(--form-control-color);
	transform-origin: bottom left;
	clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
}

input[type=checkbox]:checked::before {
	content: " ";
	background-color: cornflowerblue;
	transform: scale(1);
}

.radioCheckedLabel{
	cursor: pointer;
	margin: 0px;
	padding: 0px 10px;
}

.ToolTip {
	position: absolute;
	padding: 5px 15px;
	border-radius: 0.3cm;
	left: 5px;
	bottom: -17px;
	font-size: 12px;
	font-weight: 500;
	color: rgb(227, 0, 0);
}
.ToolTip::first-letter{
	text-transform: capitalize;
}
.ToolInfo {
	color: #12b823;
}
.draw-canvas {
	border: 2px dotted #CCCCCC;
	border-radius: 5px;
	cursor: crosshair;
}
.ModalElement {
	padding: 0px;
	border-radius: 5px;
	position: relative;
}

.ModalDetailElement {
	background-color: #4da6ff;
	padding: 10px;
	border-radius: 5px;
	overflow: hidden;
	overflow-y: auto; overflow-y: overlay;
	max-height: 300px;
	margin: 5px;
}

.BtnClose {
	font-size: 18pt;
	color: #b9b2b3;
	cursor: pointer;
	width: 30px;
	border-radius: 10px;
	display: flex;
	justify-content: center;
	align-items: center;
	border: none;
	background-color: rgba(0, 0, 0, 0.2);                
}            

.HeaderIcon {
	height: 50px;
	width: 50px;
	position: relative;
	left: -10px;                
}

.ObjectModalContainer {
	overflow: hidden;
	overflow-y: auto; overflow-y: overlay;
	max-height: calc(100vh - 120px);
	margin: 10px;
}

.listImage label {
	font-size: 12px;
	padding: 5px;
	width: 100%;
	overflow: hidden;
	display: block;
}
.contentLabelFile {
	display: flex;
	width: 100%;
	justify-content: flex-start;
	align-items: center;
}
.contentLabelFile .LabelFile{
	margin: 0 20px 0 0;
	padding: 10px;
	display: flex;
	justify-content: flex-start;
	align-items: center;
}
.labelIcon{
	height: 16px;
	width: 16px;
	filter: invert(1);
	margin-left: 10px;
}

.radio-group-container {
	display: flex;
	justify-content: flex-start;
	align-items: center;
	flex-wrap: wrap;
}


.radio-group-container label {
	cursor: pointer;
	font-size: 0.8rem;
	color: var(--font-primary-color)
}

.radio-element {
	display: flex;
	flex-direction: row-reverse;
	margin: 5px;
	align-items: center;
}
.radio-element input {
	margin: 0px;
	margin-right: 10px;
}

input[type=radio] {
	cursor: pointer;
	appearance: none;
	background-color: var(--secundary-color);
	border-radius: 50%;
	font: inherit;
	color: currentColor;
	width: 0.8em;
	padding: 10px;
	height: 0.8em;
	border: 0.15em solid #999;
	display: grid;
	place-content: center;
}

input[type=radio]::before {
	content: "";
	width: 0.8em;
	height: 0.8em;
	transform: scale(0);
	box-shadow: inset 0.8em 0.8em var(--form-control-color);
	transform-origin: bottom left;
	clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
}
w-rich-text {
	display: block;
}

input[type=radio]:checked::before {
	content: " ";
	background-color: cornflowerblue;
	transform: scale(1);
}
.titleContainer {
	height: 30px;
}
.ELEMENT_DYSPLAY {
	display: block;
}
@media (max-width: 800px) {
	.divForm {
		display: grid;
		grid-gap: 1rem;
		grid-template-columns: calc(100% - 0px) !important;
		grid-template-rows: auto;
		justify-content: center;
	}
	.IMG,
	.IMAGES,
	.IMAGE,
	.FILE,
	.FILES,
	.MASTERDETAIL,	
	.RICHTEXT,
	.DRAW,
	.CALENDAR,
	.TEXTAREA, .PASSWORD, .MODEL {
		grid-column: span 1 !important;
	}

	.ContainerFormWModal {
		margin-top: 0px;
		border-radius: 0cm;
		padding-bottom: 0px;
	}

	.ObjectModalContainer {
		max-height: calc(100% - 80px);
	}
	.divComplexForm {
		grid-template-columns: calc(100% - 0px);
	}
   
}`;