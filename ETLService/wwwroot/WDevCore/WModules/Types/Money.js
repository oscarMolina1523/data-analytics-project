export class Money extends Number {
    /**
     * @param {number} amount - The numeric value.
     * @param {string} currency - Currency code (e.g., 'USD', 'EUR', 'MXN').
     */
    constructor(amount, currency = 'USD') {
        super(amount);
        this.currency = currency;
    }

    /**
     * Returns the currency code.
     */
    GetCurrency() {
        return this.currency;
    }

    // ---- REGISTRO DE MONEDAS ----
    static #CurrencyRegistry = new Map([
        ['USD', 'en-US'],   // dólar EE. UU.
        ['NIO', 'es-NI'],    // córdoba nicaragüense
        ['EUR', 'es-ES']    // córdoba nicaragüense
    ]);

    /**
     * Registra o sobre-escribe el locale por defecto de una moneda.
     * Ej: Money.registerCurrency('EUR', 'es-ES')
     */
    static registerCurrency(code, locale) {
        Money.#CurrencyRegistry.set(code.toUpperCase(), locale);
    }

    /**
     * Formatea el número como moneda.
     * @param {Object.<string, any>} [opts]
     * @param {string} [opts.locale]   Locale a usar (si no, se toma el del registro o 'en-US')
     * @param {Object.<string, any>} [opts.formatOptions]  Cualquier otra opción válida de Intl.NumberFormat
     * @returns {string}
     */
    Format(opts = {}) {
        const { locale, formatOptions = {} } = opts;

        // Locale por prioridad → 1) argumento, 2) registro, 3) 'en-US'
        const chosenLocale = locale
            ?? Money.#CurrencyRegistry.get(this.currency)
            ?? 'en-US';

        return new Intl.NumberFormat(
            chosenLocale,
            {
                style: 'currency',
                currency: this.currency,
                ...formatOptions
            }
        );
    }
    /**
     * Overriding toString for better display.
     */
    toString() {
        const parts = this.Format().formatToParts(this.valueOf());
        return parts.map((p, i) => {
            if (p.type === 'currency') {
                // si el siguiente fragmento es numérico y no contiene espacio, añade uno
                const next = parts[i + 1];
                const needSpace = next && !/^\s/.test(next.value);
                return needSpace ? p.value + '\u00A0' : p.value; // NBSP evita saltos de línea
            }
            if (p.type === 'integer') {
                const next = parts[i + 1];
                const needSpace =
                    next && next.type === 'currency' && !/^\s/.test(next.value);
                return needSpace ? p.value + '\u00A0' : p.value;
            }
            return p.value;
        }).join('');
    }

    /**
     * Creates a copy with a different currency.
     */
    ConvertTo(currency, rate = 1) {
        return new Money(this.valueOf() * rate, currency);
    }
    /**
       * Registra o sobre-escribe el locale por defecto de una moneda.
       * Ej: Money.registerCurrency('EUR', 'es-ES')
       */
    static registerCurrency(code, locale) {
        Money.#CurrencyRegistry.set(code.toUpperCase(), locale);
    }
}
