//@ts-check
/**
 * Helper estático para procesamiento de datos de gráficos
 */
export class ChartDataHelper {
    static EVAL_METRICS = ["count","sum", "avg",  "pct"];

    /**
     * @param {any} groupedData
     * @param {any} metricLevels
     * @param {string} selectedMetric
     * @param {string[] | undefined} colors
     * @param {string} evalMetric
     * @param {number} [maxLevels]
     * @returns {{mainGroups: any[], colorMap: Map<string, string>}}
     */
    static processTreeData(groupedData, metricLevels, selectedMetric, evalMetric, colors,  maxLevels = Infinity) {
        const colorMap = new Map();
        const palette = colors ?? this.getColorPalette();
        let colorIndex = 0;

        const getColor = (/** @type {string} */ key) => {
            if (!colorMap.has(key)) colorMap.set(key, palette[colorIndex++ % palette.length]);
            return colorMap.get(key);
        };

        /**@type {Function} */
        const processNode = (/** @type {{ [s: string]: any; } | ArrayLike<any>} */ node,
            /** @type {Array<string>} */ path = [], currentLevel = 0) => {
            if (!node || typeof node !== 'object' || Array.isArray(node) || currentLevel >= maxLevels) return null;
            const children = [];

            for (const [key, value] of Object.entries(node)) {
                const newPath = [...path, key];
                if (Array.isArray(value)) {
                    const metricKey = newPath.join(' > ');
                    const metric = metricLevels?.[metricKey]?.[selectedMetric];
                    const metricValue = metric != null ? metric[evalMetric] : 0;
                    if (metricValue > 0) {
                        children.push({ type: 'leaf', label: key, key, path: newPath, value: metricValue, color: getColor(key) });
                    }
                } else if (typeof value === 'object' && value !== null) {
                    const childNode = processNode(value, newPath, currentLevel + 1);
                    if (childNode?.children?.length > 0) {
                        children.push({ type: 'branch', label: key, key, path: newPath, children: childNode.children });
                    }
                }
            }
            return children.length > 0 ? { children } : null;
        };

        const result = processNode(groupedData);
        return { mainGroups: result?.children ?? [], colorMap };
    }

    /** @param {any[]} nodes @returns {number} */
    static findMaxValue(nodes) {
        let max = 0;
        for (const node of nodes) {
            if (node.type === 'leaf') max = Math.max(max, node.value);
            else if (node.type === 'branch' && node.children) max = Math.max(max, this.findMaxValue(node.children));
        }
        return max || 1;
    }

    /** @param {any} groupedData 
     * @param {string[]} palette 
     * @returns {{label:string, key:string, color:string}[]}
     *  */
    static extractLegendData(groupedData, palette) {
        const leafItems = new Set();
        /**
         * @type {{ label: any; key: any; color: string; }[]}
         */
        const legend = [];
        let idx = 0;

        const _colorMap = new Set();
        const extract = (/** @type {ArrayLike<any> | { [s: string]: any; } | null} */ obj,
            /** @type {Array<string>} */ path = []) => {
            if (Array.isArray(obj)) {
                const itemKey = path.join(' > ');
                if (!leafItems.has(itemKey)) {
                    leafItems.add(itemKey);
                    const lastKey = path[path.length - 1];
                    if (!_colorMap.has(lastKey)) {
                        _colorMap.add(lastKey);

                        legend.push({ label: lastKey, key: lastKey, color: palette[idx++ % palette.length] });
                    }
                }
            } else if (typeof obj === 'object' && obj !== null) {
                for (const [k, v] of Object.entries(obj)) extract(v, [...path, k]);
            }
        };
        extract(groupedData);
        return legend;
    }

    /** @param {any} metricLevels @returns {string[]} */
    static getAvailableMetrics(metricLevels) {
        const sample = metricLevels?.['General Summary'] || {};
        return Object.keys(sample).filter(k => ['SubTotal', 'Descuento', 'Iva', 'Total'].includes(k));
    }

    static getColorPalette() {
        return ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#e11d48', '#854d0e', '#059669', '#7c3aed'];
    }

    /** @param {number} value @param {string} metric @returns {string} */
    static formatValue(value, metric) {
        var prefix = "";
        var posfix = "";
        if (metric == "avg") {
            posfix = "%"
        }
        if (typeof value !== 'number') return String(value);
        if (value >= 1000000) return `${prefix}${(value / 1000000).toFixed(1)}M ${posfix}`;
        if (value >= 1000) return `${prefix}${(value / 1000).toFixed(2)}K ${posfix}`;
        return `${prefix}${value.toFixed(1)} ${posfix}`;
    }
}