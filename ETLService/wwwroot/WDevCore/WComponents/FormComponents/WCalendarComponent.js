//@ts-check
import { DateTime } from "../../WModules/Types/DateTime.js";
import { html, WRender } from "../../WModules/WComponentsTools.js";
import { css } from "../../WModules/WStyledRender.js";

class Agenda {
	constructor(props) {
		Object.assign(this, props);
	}
	/**@type {Number}*/ IdAgenda;
	/**@type {String}*/ Dia;
	/**@type {String}*/ Hora_Inicial;
	/**@type {String}*/ Hora_Final;
	/**@type {Date}*/ Fecha_Caducidad;
}

class Tbl_Calendario {
	constructor(props) {
		Object.assign(this, props);
	}
	/**@type {Number}*/ IdCalendario;
	/**@type {String}*/ Estado;
	/**@type {Date}*/ Fecha_Inicio;
	/**@type {Date}*/ Fecha_Final;
}

const agenda = [
	/*new Agenda({ Dia: "Lunes", Hora_Inicial: "09:00", Hora_Final: "11:00" }),
	new Agenda({ Dia: "Lunes", Hora_Inicial: "13:00", Hora_Final: "18:00" }),
	new Agenda({ Dia: "Martes", Hora_Inicial: "10:00", Hora_Final: "18:00" }),
	new Agenda({ Dia: "Miércoles", Hora_Inicial: "08:00", Hora_Final: "18:00" }),
	new Agenda({ Dia: "Jueves", Hora_Inicial: "09:00", Hora_Final: "18:00" }),
	new Agenda({ Dia: "Viernes", Hora_Inicial: "09:00", Hora_Final: "18:00" })*/
];

const calendarioOcupados = [
	//new Tbl_Calendario({ Fecha_Inicio: new Date("2025-02-12T10:00:00"), Fecha_Final: new Date("2025-02-12T12:00:00") }),
];
const calendarioSeleccionados = [
	//new Tbl_Calendario({ Fecha_Inicio: new Date("2025-02-13T10:00:00"), Fecha_Final: new Date("2025-02-13T10:30:00") }),
];

/**
 * @typedef {Object.<string, any>} Config 
 * @property {Function} [action]
 * @property {()=>  {Agenda: Agenda[], Calendario: Tbl_Calendario[]}} [CalendarFunction] debe retornar un objeto que sobreescribe la Agenda y Calendario_Ocupados
 * @property {Array<Agenda>} [Agenda] agenda disponible para marcar
 * @property {Array<Tbl_Calendario>} [SelectedBlocks] calendariosSeleccionados
 * @property {Array<Tbl_Calendario>} [Calendario_Ocupados] calendarios marcados como ocupados
 * @property {Boolean} [withDescription] calendarios marcados como ocupados
 * @property {Boolean} [allowDeselectOcupados] permite deseleccionar los calendarios ocupados iniciales
 **/
export class WCalendarComponent extends HTMLElement {
	/**
	 * @param {Partial<Config>} Config - Configuración del componente
	 */
	constructor(Config) {
		super();
		this.attachShadow({ mode: 'open' }); // Crea el Shadow DOM
		this.Config = Config;
		this.currentDate = new Date(); // Fecha actual	
		WRender.SetStyle(this, {
			position: "relative"
		})

	}
	BuildHorarioHabil() {
		if (this.agenda?.length === 0) {
			// Si no hay agenda, usar el horario hábil por defecto
			return { start: "08:00", end: "17:00" };
		}

		// Inicializar con valores extremos
		let minHora = "23:59"; // Hora más temprana
		let maxHora = "00:00"; // Hora más tardía

		// Recorrer la agenda para encontrar la hora más temprana y la más tardía
		this.agenda?.forEach(agendaItem => {
			if (agendaItem.Hora_Inicial < minHora) {
				minHora = agendaItem.Hora_Inicial;
			}
			if (agendaItem.Hora_Final > maxHora) {
				maxHora = agendaItem.Hora_Final;
			}
		});
		// Asignar el horario hábil
		return { start: minHora, end: maxHora };
	}

	/**
	 * @param {Partial<Config>} Config - Configuración del componente
	 */
	async setConfig(Config) {		
		if (Config.CalendarFunction) {
			try {
				const response = await Config.CalendarFunction();
				Config.Calendario_Ocupados = response.Calendario;
				Config.Agenda = response.Agenda;
			} catch (error) {
				console.error(error);
			}
		}


		//current.toTimeString().substring(0, 5)
		this.selectedCalendarioOcupados = Config.SelectedBlocks ?? calendarioSeleccionados; // Calendarios ocupados seleccionados

		this.agenda = Config.Agenda ?? agenda;
		this.calendarioOcupados = Config.Calendario_Ocupados ?? calendarioOcupados;
		this.allowDeselectOcupados = Config.allowDeselectOcupados ?? false;

		this.action = Config.action ?? ((selectedCalendarioOcupados) => {
			console.log(selectedCalendarioOcupados);
		});
		

		// Horario hábil por defecto (6:00 AM - 8:00 PM)
		this.horarioHabil = this.BuildHorarioHabil();
		this.Config = Config;
		this.render();
	}

	connectedCallback() {
		this.setConfig(this.Config);
	}

	// Renderiza el componente
	render() {
		// @ts-ignore
		this.shadowRoot.innerHTML = "";
		this.shadowRoot?.append(html`<div class="calendar">
			${this.styles()}
			<div class="header">
				<button class="nav-button" onclick="${() => this.prevWeek()}">◀</button>
				<h2>${this.getWeekRange()}</h2>
				<button class="nav-button" onclick="${() => this.nextWeek()}">▶</button>
			</div>
			<div class="week">
				${this.getDaysOfWeek().map(day => this.renderDay(day))}
			</div>
		</div>`);
	}

	// Obtiene los días de la semana actual
	getDaysOfWeek() {
		const startOfWeek = new Date(this.currentDate);
		startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay()); // Domingo de la semana
		const days = Array.from({ length: 7 }).map((_, i) => {
			const day = new Date(startOfWeek);
			day.setDate(startOfWeek.getDate() + i);
			return day;
		});
		return days;
	}

getDaysOfWeek2() {
	const startOfWeek = new Date(this.currentDate);
	startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay()); // Domingo
	const days = Array.from({ length: 7 }).map((_, i) => {
		const day = new Date(startOfWeek);
		day.setDate(startOfWeek.getDate() + i);
		// Devolvemos string local, sin UTC
		const year = day.getFullYear();
		const month = String(day.getMonth() + 1).padStart(2, '0');
		const date = String(day.getDate()).padStart(2, '0');
		return `${year}-${month}-${date}`; // Ej: "2025-10-04"
	});
	return days;
}

	// Renderiza un día de la semana
	renderDay(day) {
		const dayAgenda = this.agenda?.filter(a => a.Dia.toUpperCase() === this.getDayName(day).toUpperCase());
		const ocupados = this.calendarioOcupados?.filter(c => this.isSameDay(new Date(c.Fecha_Inicio), day));

		return html`<div class="day">
			<div class="day-header">
				<h2> ${new DateTime(day).getDate()}</h2>
				<label> ${this.getDayName(day)}</label>				
			</div>			
			${this.renderTimeSlots(dayAgenda, ocupados, day)}
		</div>`;
	}

	// Renderiza las horas disponibles para un día
	renderTimeSlots(agendas, ocupados, day) {
		const slots = this.generateTimeSlots(this.horarioHabil?.start, this.horarioHabil?.end);
		return slots.map(slot => {
			const isSelected = this.selectedCalendarioOcupados.some(o => this.isTimeInRange(slot, o.Fecha_Inicio, o.Fecha_Final, day));
			const isOcupado = ocupados.some(o => this.isTimeInRange(slot, o.Fecha_Inicio, o.Fecha_Final, day)) && !isSelected;


			// Determinar si el slot es seleccionable
			let isSelectable = false;

			if (this.agenda?.length === 0) {
				// Si no hay agenda definida, todos los slots son seleccionables
				isSelectable = true;
			} else if (agendas.length !== 0) {
				agendas.forEach(agenda => {
					if (isSelectable) {
						return;
					}
					// Si hay agenda definida para este día, verificar si el slot está dentro del rango de la agenda
					const slotTime = new Date(`1970-01-01T${slot}:00`).getTime();
					const agendaStart = new Date(`1970-01-01T${agenda.Hora_Inicial}:00`).getTime();
					const agendaEnd = new Date(`1970-01-01T${agenda.Hora_Final}:00`).getTime();
					isSelectable = slotTime >= agendaStart && slotTime <= agendaEnd;
				});

			}


			const action = async () => {
				if (!isSelectable || (isOcupado && !this.allowDeselectOcupados)) return;
				if (this.Config.withDescription) {
					const { WForm } = await import("../WForm.js");
					const { WToolTip } = await import("./WToolTip.js");
					const form = new WForm({
						Title: "Nuevo Calendario",
						ModelObject: { Descripcion: { type: "Richtext" } },
						SaveFunction: (EditingObject) => {
							this.selectTimeSlot(slot, day, isOcupado, isSelectable, EditingObject.Descripcion)
						}
					});
					const toolTip = new WToolTip(form);
					toolTip.DisplayOptions(this);
				} else {
					this.selectTimeSlot(slot, day, isOcupado, isSelectable)
				}
			}
			return html`<div class="time-slot ${!isSelectable ? 'noSelecteable' : ''} ${isOcupado && !isSelected ? 'ocupado' : ''} ${isSelected ? 'selected' : ''}"
				onclick="${() => action()}">
				${slot}
			</div>`;
		});
	}
	// Genera las horas disponibles entre Hora_Inicial y Hora_Final
	generateTimeSlots(start, end) {
		const slots = [];
		let current = new Date(`1970-01-01T${start}:00`);
		const endTime = new Date(`1970-01-01T${end}:00`);

		while (current <= endTime) {
			slots.push(current.toTimeString().substring(0, 5)); // Formato HH:MM
			current.setMinutes(current.getMinutes() + 30); // Intervalos de 30 minutos
		}

		return slots;
	}

	// Verifica si una hora está dentro de un rango ocupado
	isTimeInRange(time, start, end, day) {

		// Convertir la hora (time) a una fecha completa usando el día proporcionado
		const slotDateTime = new Date(start); // Usamos la fecha de inicio como base
		const [hours, minutes] = time.split(':');
		slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0); // Ajustar la hora y minutos

		// Convertir las fechas de inicio y fin a objetos Date
		const startDateTime = new Date(start);
		const endDateTime = new Date(end);

		// Verificar si el slot está dentro del rango
		return (
			new DateTime(day).toISO() == new DateTime(startDateTime).toISO() &&
			slotDateTime.getTime() >= startDateTime.getTime() &&
			slotDateTime.getTime() < endDateTime.getTime() // Usamos "<" en lugar de "<=" para evitar solapamiento
		);
	}
	// Selecciona una hora disponible
	// Selecciona una hora disponible
	selectTimeSlot(slot, day, isOcupado, isSelectable, Descripcion) {
		if (!isSelectable || (isOcupado && !this.allowDeselectOcupados)) return;

		const index = this.selectedCalendarioOcupados.findIndex(o => this.isTimeInRange(slot, o.Fecha_Inicio, o.Fecha_Final, day));


		if (index !== -1) {
			// Eliminar solo el slot específico del calendario ocupado seleccionado
			const [hours, minutes] = slot.split(':');
			this.selectedCalendarioOcupados = this.selectedCalendarioOcupados.filter(c => {
				const cFechaInicio = new DateTime(c.Fecha_Inicio);
				cFechaInicio.setSeconds(0, 0); // Establecer segundos y milisegundos a 0

				return !(
					this.isSameDay(cFechaInicio, day) &&
					cFechaInicio.getHours() === parseInt(hours) &&
					cFechaInicio.getMinutes() === parseInt(minutes)
				);
			});
		} else {
			// Seleccionar
			// Agregar al calendario ocupado seleccionado
			const fechaInicio = new DateTime(day);
			const [hours, minutes] = slot.split(':');
			fechaInicio.setHours(parseInt(hours), parseInt(minutes), 0, 0); // Establecer segundos y milisegundos a 0

			const fechaFinal = new DateTime(fechaInicio);
			fechaFinal.setMinutes(fechaFinal.getMinutes() + 30);

			this.selectedCalendarioOcupados.push({
				Fecha_Inicio: fechaInicio.toISODateTime(),
				Fecha_Final: fechaFinal.toISODateTime(),
				Descripcion: Descripcion
			});
		}
		//console.log(this.selectedCalendarioOcupados);
		// @ts-ignore
		this.action(this.selectedCalendarioOcupados); // Notificar la selección
		this.render();
	}

	// Navega a la semana anterior
	prevWeek() {
		this.currentDate.setDate(this.currentDate.getDate() - 7);
		this.render();
	}

	// Navega a la semana siguiente
	nextWeek() {
		this.currentDate.setDate(this.currentDate.getDate() + 7);
		this.render();
	}

	// Obtiene el rango de fechas de la semana actual
	getWeekRange() {
		const startOfWeek = new Date(this.currentDate);
		startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay());
		const endOfWeek = new Date(startOfWeek);
		endOfWeek.setDate(startOfWeek.getDate() + 6);

		return `${this.formatDate(startOfWeek)} - ${this.formatDate(endOfWeek)}`;
	}

	// Formatea una fecha como "DD/MM/YYYY"
	formatDate(date) {
		return date.toLocaleDateString('es-ES');
	}

	// Obtiene el nombre del día (Lunes, Martes, etc.)
	getDayName(date) {
		const day = date.toLocaleDateString('es-ES', { weekday: 'long' });
		return day;
	}

	// Verifica si dos fechas son el mismo día
	isSameDay(date1, date2) {
		return date1.getFullYear() === date2.getFullYear() &&
			date1.getMonth() === date2.getMonth() &&
			date1.getDate() === date2.getDate();
	}

	// Estilos del componente
	styles() {
		return css`
			.calendar {
				position: relative;
				font-family: Arial, sans-serif;
				border: 1px solid #ccc;
				padding: 10px;
				border-radius: 5px;
				background-color: #f9f9f9;
			}
			.header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 10px;
				& h2 {
					margin: 0px;
				}
			}
			.nav-button {
				background: none;
				border: none;
				font-size: 1.5em;
				cursor: pointer;
				color: #3c93c5;
			}
			.week {
				display: grid;
				grid-template-columns: repeat(7, 1fr);
				gap: 0px;				
				padding-top: 0px;
				overflow-y: auto;
				& h3 {
					top: 0px;					
				} & label {
					text-transform: capitalize;
				}				
			}
			.day {
				border-left: 1px solid #ddd;				
				background-color: #fff;
			}
			.day-header {
				padding: 10px;
				display: flex;
				flex-direction: column;
				gap: 10px;
				& h2 {
					padding: 0;
					margin: 0;
				}				
			}
			.time-slot {
				padding: 5px;
				border-bottom: 1px solid #ddd;
				cursor: pointer;
				text-align: center;
				background-color: #ffffff;
				font-size: 12px;
				color: #052c4b;
			}
			.time-slot.ocupado {
				background-color: rgba(15, 108, 189, 0.3);
				border-left: 5px solid rgb(15, 108, 189);
				cursor: not-allowed;
			}
			.time-slot.selected {
				background-color: rgba(54, 138, 5, 0.3);
				border-left: 5px solid rgb(54, 138, 5, 189);
			}
			.noSelecteable {
				background-color: #eee;
			}
			
			w-tooltip {
				position: absolute;
				max-width: 450px;
				min-height: 500px;
				overflow: hidden;
				border-radius: 15px;
				top: 50% !important;
				left: 50% !important;
				transform: translate(-50%, -50%);
			}
		`;
	}
}

// Define el componente personalizado
customElements.define('w-calendar', WCalendarComponent);