class DateTime extends Date {

    /**
    * @param {String|Date} [dateTime] 
    */
    constructor(dateTime) {
        if (dateTime == undefined) {
            super(new Date().getTime());
            this.Date = new Date();
        } else if (dateTime instanceof Date) {
            super(dateTime.getTime());
            this.Date = dateTime;
        } else {
            super(dateTime.replace("T", " "));
            this.Date = new Date(dateTime.replace("T", " "));
        }
    }

    /**
     * @returns {String} ISO 8601 date string (YYYY-MM-DD)
     */
    toISO() {
        return this.Date.toISO();
    }
    /**
     * Formatea una fecha a formato DD/MM/AA HH:mm
     * @param {String|Date} date 
     * @returns {String}
     */
    toISODateTime(date = this) {
        const d = new Date(date);
        const day = pad(d.getDate());
        const month = pad(d.getMonth() + 1);
        const year = d.getFullYear();
        const hours = pad(d.getHours());
        const minutes = pad(d.getMinutes());
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    /**
    * @returns {String} ISO 8601 date string (YYYY-MM-DD)
    */
    toDDMMYYYY() {
        let date = this.Date;
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();

        if (month < 10) {
            return `${day}-0${month}-${year}`;
        } else {
            return `${day}-${month}-${year}`;
        }
    }
    /**
     * Formatea una fecha a formato DD/MM/AA
     * @param {String|Date} date 
     * @returns {String}
     */
    formatDateToDDMMYY(date) {
        const d = new Date(date);
        const day = pad(d.getDate());
        const month = pad(d.getMonth() + 1);
        const year = d.getFullYear().toString().slice(-2); // Últimos 2 dígitos
        return `${day}/${month}/${year}`;
    }


    /**
     * Formatea una fecha a formato DD/MM/AA HH:mm
     * @param {String|Date} date 
     * @returns {String}
     */
    formatDateTimeToDDMMYYHHMM(date = this) {
        const d = new Date(date);
        const day = pad(d.getDate());
        const month = pad(d.getMonth() + 1);
        const year = d.getFullYear().toString().slice(-2); // Últimos 2 dígitos
        const hours = pad(d.getHours());
        const minutes = pad(d.getMinutes());
        return `${day}-${month}-${year} ${hours}:${minutes}`;
    }
    /**
         * Formatea una fecha a formato YYYY/MM/DD HH:mm
         * @param {String|Date} date 
         * @returns {String}
         */
    formatDateTimeToYYYYMMDDHHMM(date = this) {
        const d = new Date(date);
        const day = pad(d.getDate());
        const month = pad(d.getMonth() + 1);
        const year = d.getFullYear().toString(); // Últimos 2 dígitos
        const hours = pad(d.getHours());
        const minutes = pad(d.getMinutes());
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    /**
     * @returns {String} Formatted date string (dd de mes de a o)
     */
    toDateFormatEs() {
        return this.Date.toString().toDateFormatEs();
    }

    /**
     * @returns {String} Formatted date string: fechaInicioSemana al fechaFinSemana
     */
    getDateWeakRange() {
        // 1. Crear una copia para no mutar la fecha original
        const date = new Date(this.Date);

        // 2. Obtener el día de la semana (0 es domingo, 1 es lunes, ..., 6 es sábado)
        const day = date.getDay();

        // 3. Ajustar para que el Lunes sea el día 0 y el Domingo el día 6
        // (Si es domingo (0), lo tratamos como el séptimo día para retroceder al lunes previo)
        const diffToMonday = date.getDate() - day + (day === 0 ? -6 : 1);

        const monday = new Date(date.setDate(diffToMonday));
        const sunday = new Date(date.setDate(monday.getDate() + 6));

        // 4. Formatear a String (puedes usar toLocaleDateString o ISO)
        const opciones = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const inicio = monday.toLocaleDateString('es-ES', opciones);
        const fin = sunday.toLocaleDateString('es-ES', opciones);

        return `${inicio} al ${fin}`;
    }

    /**
     * @returns {String} Formatted date and time string (d de mes de a o, h:i a)
     */
    toDateTimeFormatEs() {
        return this.Date.toString().toDateTimeFormatEs();
    }

    /**
     * @returns {Date} A new Date object representing the start of the day
     * (i.e. the date at 00:00:00)
     */
    toStartDate() {
        return this.Date.toStartDate();
    }

    /**
     * Adds the given number of days to the date
     * @param {Integer} days The number of days to add
     * @returns {DateTime} The modified DateTime object
     */
    addDays(days) {
        this.Date.addDays(days);
        return this;
    }

    /**
     * Subtracts the given number of days from the date
     * @param {Integer} days The number of days to subtract
     * @returns {DateTime} The modified DateTime object
     */
    subtractDays(days) {
        this.Date.subtractDays(days);
        return this;
    }

    /**
     * Modifies the month of the date by the given number of months
     * @param {Number} Meses The number of months to add (positive) or subtract (negative)
     * @returns {DateTime} The modified DateTime object
     */
    modifyMonth(Meses) {
        this.Date.modifyMonth(Meses);
        return this;
    }

    /**
     * @returns {String} Month as a string (e.g. 'enero', 'febrero', etc.)
     */
    getMonthFormatEs() {
        if (this.Date == null || this.Date == undefined || this.Date == "") return "";
        const fecha = new Date(this.Date);
        return DateTime.Meses[fecha.getMonth()];
    }

    /**
     * @returns {String} Day of the week as a string (e.g. 'lunes', 'martes', etc.)
     */
    getDayFormatEs() {
        return DateTime.Dias[this.Date?.getDay()];
    }

    /**
 * @returns {String} Day of the week + day of the month (e.g. 'lunes 5', 'martes 23', etc.)
 */
    getDayFormatWithDateEs() {
        const dayName = this.constructor.Dias[this.Date?.getDay()];
        const dayNumber = this.Date?.getDate();
        return `${dayName} ${dayNumber}`;
    }

    GetFullHour() {
        return pad(this.Date.getHours()) + ':' + pad(this.Date.getMinutes()) + ':' + pad(this.Date.getSeconds());
    }
    static Meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    static MesesIngles = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    static Dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    static DiasIngles = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

}

export { DateTime };

//Date UTILITYS
function pad(number) {
    if (number < 10) {
        return '0' + number;
    }
    return number;
}

/**
 * @class Date
 * @memberof Date.prototype
 * @function
 * @name toISO
 * @returns 
**/
Date.prototype.toISO = function () {
    const year = this.getFullYear();
    const month = pad(this.getMonth() + 1);
    const day = pad(this.getDate());
    return `${year}-${month}-${day}`;
};

String.prototype.toISO = function () {
    const date = new Date(this).toISO();
    return date;
};

Date.prototype.toStartDate = function () {
    return new Date(this.getUTCFullYear() +
        '-' + pad(this.getUTCMonth() + 1) +
        '-' + pad(this.getUTCDate()));
};

/**
 * 
 * @param {Integer} days 
 * @returns {Date}
 */
Date.prototype.addDays = function (days) {
    this.setDate(this.getDate() + days);
    return this;
};

/**
 * 
 * @param {Integer} days 
 * @returns {Date}
 */
Date.prototype.subtractDays = function (days) {
    this.setDate(this.getDate() - days);
    return this;
};

/**
 * 
 * @param {Integer} month 
 * @returns {Date}
 */
Date.prototype.modifyMonth = function (Meses) {
    const fecha = new Date(this.toString()); //¡se hace esto para no modificar la fecha original!
    const mes = fecha.getMonth();
    fecha.setMonth(fecha.getMonth() + Meses);
    while (fecha.getMonth() === mes) {
        fecha.setDate(fecha.getDate() - 1);
    }
    return fecha;
};

String.prototype.toDateFormatEs = function () {
    if (this == null || this == undefined || this == "") return "";
    const fecha = new Date(this);
    return DateTime.Dias[fecha.getDay()]
        + ', ' + fecha.getDate()
        + ' de ' + DateTime.Meses[fecha.getMonth()]
        + ' de ' + fecha.getUTCFullYear();
};

String.prototype.toDateTimeFormatEs = function () {
    if (this == null || this == undefined || this == "") return "";
    const fecha = new Date(this);
    return DateTime.Dias[fecha.getDay()]
        + ', ' + fecha.getDate()
        + ' de ' + DateTime.Meses[fecha.getMonth()]
        + ' de ' + fecha.getUTCFullYear()
        + ' ' + pad(fecha.getHours()) + ':' + pad(fecha.getMinutes());
};

String.prototype.getMonthFormatEs = function () {
    if (this == null || this == undefined || this == "") return "";
    const fecha = new Date(this);
    return DateTime.Meses[fecha.getMonth()];
};

String.prototype.toDateFormatEn = function () {
    if (this == null || this == undefined || this == "") return "";
    const fecha = new Date(this);
    return DateTime.DiasIngles[fecha.getDay()]
        + ', ' + fecha.getDate()
        + ' ' + DateTime.MesesIngles[fecha.getMonth()]
        + ' ' + fecha.getUTCFullYear();
};

String.prototype.toDateTimeFormatEn = function () {
    if (this == null || this == undefined || this == "") return "";
    const fecha = new Date(this);
    return DateTime.DiasIngles[fecha.getDay()]
        + ', ' + fecha.getDate()
        + ' ' + DateTime.MesesIngles[fecha.getMonth()]
        + ' ' + fecha.getUTCFullYear()
        + ' ' + pad(fecha.getHours()) + ':' + pad(fecha.getMinutes());
};

String.prototype.getMonthFormatEn = function () {
    if (this == null || this == undefined || this == "") return "";
    const fecha = new Date(this);
    return DateTime.MesesIngles[fecha.getMonth()];
};
