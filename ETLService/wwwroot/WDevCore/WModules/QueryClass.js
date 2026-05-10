//@ts-check
import { EntityClass } from './EntityClass.js';

/**
 * @class QueryClass
 * @extends EntityClass
 * @description Clase base para modelos de solo lectura, hereda de EntityClass pero deshabilita las operaciones de escritura.
 */
class QueryClass extends EntityClass {
    /**
     * @param {Partial<QueryClass>} [props]
     * @param {string} [Namespace]
     */
    constructor(props, Namespace) {
        super(props, Namespace);
    }

    /**
     * @override
     * @returns {Promise<any>}
     * @throws {Error} Las operaciones de escritura no están permitidas en QueryClass.
     */
    Save = async () => {
        return Promise.reject(new Error("Las operaciones de escritura no están permitidas en QueryClass."));
    }

    /**
     * @override
     * @returns {Promise<any>}
     * @throws {Error} Las operaciones de escritura no están permitidas en QueryClass.
     */
    Update = async () => {
        return Promise.reject(new Error("Las operaciones de escritura no están permitidas en QueryClass."));
    }

    /**
     * @override
     * @param {Object} Object
     * @param {boolean} [Edit=false]
     * @returns {Promise<any>}
     * @throws {Error} Las operaciones de escritura no están permitidas en QueryClass.
     */
    SaveWithModel = async (Object, Edit = false) => {
        return Promise.reject(new Error("Las operaciones de escritura no están permitidas en QueryClass."));
    }

    /**
     * @override
     * @param {string} Path
     * @param {Object} Data
     * @returns {Promise<any>}
     * @throws {Error} Las operaciones de escritura no están permitidas en QueryClass.
     */
    SaveData = async (Path, Data) => {
        return Promise.reject(new Error("Las operaciones de escritura no están permitidas en QueryClass."));
    }
}

export { QueryClass };
