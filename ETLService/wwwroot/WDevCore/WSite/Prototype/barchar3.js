//@ts-check
import { WArrayF } from "../../WModules/WArrayF.js";
import { html, WRender } from "../../WModules/WComponentsTools.js";
import { css } from "../../WModules/WStyledRender.js";

/**
 * @typedef {Object} BarChartData
 * @property {Object.<string, any>} groupedData - Datos agrupados jerárquicamente
 * @property {Object.<string, Object.<string, {sum?: number, count?: number, avg?: number}>>} metricLevels - Resúmenes por nivel
 */



/**
 * @typedef {Object} MetricSummary
 * @property {number} [sum]
 * @property {number} [count]
 * @property {number} [avg]
 */

/**
 * @typedef {Object} GroupedDataResult
 * @property {Object.<string, any>} groupedData
 * @property {Object.<string, Object.<string, MetricSummary>>} metricLevels
 */

/**
 * @typedef {Object} WBarChartConfig
 * @property {GroupedDataResult} [data]
 * @property {string} [metric='Total']
 * @property {number} [maxLevels=4]
 * @property {number} [maxBars=12]
 * @property {string} [title='Gráfico de Barras']
 * @property {'horizontal'|'vertical'} [orientation='vertical']
 * @property {Function} [onNavigate]
 */

class WBarChart extends HTMLElement {
    /**
     * @param {WBarChartConfig} [Config]
     */
    constructor(Config = {}) {
        super();
        this.attachShadow({ mode: 'open' });
        
        this._data = Config.data ?? null;
        this._selectedMetric = Config.metric ?? 'Total';
        this._maxLevels = Math.min(Config.maxLevels ?? 4, 4);
        this._maxBars = Config.maxBars ?? 12;
        this._title = Config.title ?? 'Gráfico de Barras';
        this._orientation = Config.orientation ?? 'vertical';
        this._currentPath = [];
        this._onNavigate = Config.onNavigate;
        
        this._renderStyles();
        this._renderContent();
    }

    connectedCallback() {}

    /**
     * @param {GroupedDataResult} data 
     * @param {string} [metric]
     */
    setData(data, metric) {
        this._data = data;
        if (metric) this._selectedMetric = metric;
        this._currentPath = [];
        this._renderContent();
    }

    /**
     * @param {string|string[]} path 
     */
    navigateTo(path) {
        const newPath = Array.isArray(path) ? path : [path];
        if (newPath.length <= this._maxLevels) {
            this._currentPath = newPath;
            this._renderContent();
            if (this._onNavigate) this._onNavigate(this._currentPath);
        }
    }

    goBack() {
        if (this._currentPath.length > 0) {
            this._currentPath.pop();
            this._renderContent();
            if (this._onNavigate) this._onNavigate(this._currentPath);
        }
    }

    reset() {
        this._currentPath = [];
        this._renderContent();
        if (this._onNavigate) this._onNavigate(this._currentPath);
    }

    /**
     * @private
     */
    _renderStyles() {
        const styles = css`
            :host {
                display: block;
                font-family: system-ui, -apple-system, sans-serif;
                --chart-primary: #3b82f6;
                --chart-secondary: #64748b;
                --chart-bg: #ffffff;
                --chart-border: #e2e8f0;
                --chart-text: #1e293b;
                --chart-text-muted: #64748b;
                --chart-grid: #f1f5f9;
                --chart-hover: #2563eb;
                --chart-bar-gap: 4px;
            }
            
            .chart-wrapper {
                background: var(--chart-bg);
                border: 1px solid var(--chart-border);
                border-radius: 8px;
                padding: 1rem;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .chart-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-bottom: 0.75rem;
                border-bottom: 1px solid var(--chart-border);
                margin-bottom: 1rem;
                flex-wrap: wrap;
                gap: 0.5rem;
            }
            
            .chart-title {
                font-size: 1.125rem;
                font-weight: 600;
                color: var(--chart-text);
                margin: 0;
            }
            
            .controls {
                display: flex;
                gap: 0.5rem;
                align-items: center;
                flex-wrap: wrap;
            }
            
            .btn {
                padding: 0.375rem 0.75rem;
                font-size: 0.875rem;
                border: 1px solid var(--chart-border);
                border-radius: 4px;
                background: #f8fafc;
                color: var(--chart-text);
                cursor: pointer;
                transition: all 0.15s ease;
            }
            
            .btn:hover:not(:disabled) {
                background: #e2e8f0;
                border-color: #cbd5e1;
            }
            
            .btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .metric-select {
                padding: 0.375rem 0.5rem;
                font-size: 0.875rem;
                border: 1px solid var(--chart-border);
                border-radius: 4px;
                background: white;
                color: var(--chart-text);
                min-width: 100px;
            }
            
            .breadcrumb {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                font-size: 0.875rem;
                color: var(--chart-text-muted);
                padding: 0 0 0.75rem;
                border-bottom: 1px solid var(--chart-border);
                margin-bottom: 0.75rem;
                flex-wrap: wrap;
            }
            
            .breadcrumb-item {
                color: var(--chart-primary);
                cursor: pointer;
            }
            
            .breadcrumb-item:hover {
                text-decoration: underline;
            }
            
            .breadcrumb-separator {
                color: var(--chart-border);
            }
            
            .chart-container {
                position: relative;
                min-height: 250px;
                max-height: 400px;
            }
            
            /* Vertical Bar Chart */
            .chart-vertical {
                display: flex;
                align-items: flex-end;
                justify-content: space-around;
                height: 100%;
                gap: var(--chart-bar-gap);
                padding: 1rem 0.5rem 0;
                border-left: 1px solid var(--chart-grid);
                border-bottom: 1px solid var(--chart-grid);
            }
            
            .bar-group-vertical {
                display: flex;
                flex-direction: column;
                align-items: center;
                flex: 1;
                min-width: 0;
                max-width: 80px;
            }
            
            .bar-vertical {
                width: 100%;
                background: var(--chart-primary);
                border-radius: 4px 4px 0 0;
                transition: background 0.15s ease, transform 0.1s ease;
                cursor: pointer;
                position: relative;
                min-height: 4px;
            }
            
            .bar-vertical:hover {
                background: var(--chart-hover);
                transform: scaleY(1.02);
            }
            
            .bar-vertical.has-children::after {
                content: '';
                position: absolute;
                top: 4px;
                right: 4px;
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-bottom: 6px solid white;
                opacity: 0.8;
            }
            
            .bar-label-vertical {
                font-size: 0.75rem;
                color: var(--chart-text);
                text-align: center;
                margin-top: 0.5rem;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                width: 100%;
                cursor: pointer;
                padding: 2px 4px;
                border-radius: 3px;
            }
            
            .bar-label-vertical:hover {
                background: rgba(59, 130, 246, 0.1);
                color: var(--chart-primary);
            }
            
            .bar-value-vertical {
                font-size: 0.7rem;
                color: var(--chart-text-muted);
                text-align: center;
                margin-top: 2px;
                white-space: nowrap;
            }
            
            /* Horizontal Bar Chart */
            .chart-horizontal {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                height: 100%;
                padding: 0.5rem 0 0.5rem 2rem;
                border-left: 1px solid var(--chart-grid);
            }
            
            .bar-group-horizontal {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            
            .bar-label-horizontal {
                width: 120px;
                min-width: 120px;
                font-size: 0.875rem;
                color: var(--chart-text);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                cursor: pointer;
                padding: 2px 4px;
                border-radius: 3px;
            }
            
            .bar-label-horizontal:hover {
                background: rgba(59, 130, 246, 0.1);
                color: var(--chart-primary);
            }
            
            .bar-track-horizontal {
                flex: 1;
                height: 24px;
                background: var(--chart-grid);
                border-radius: 4px;
                overflow: hidden;
                position: relative;
            }
            
            .bar-horizontal {
                height: 100%;
                background: var(--chart-primary);
                border-radius: 4px;
                transition: background 0.15s ease, width 0.2s ease;
                cursor: pointer;
                position: relative;
                min-width: 4px;
            }
            
            .bar-horizontal:hover {
                background: var(--chart-hover);
            }
            
            .bar-horizontal.has-children::after {
                content: '';
                position: absolute;
                top: 4px;
                right: 4px;
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-bottom: 6px solid white;
                opacity: 0.8;
            }
            
            .bar-value-horizontal {
                min-width: 60px;
                text-align: right;
                font-size: 0.875rem;
                color: var(--chart-text);
                font-weight: 500;
            }
            
            /* Y-Axis Labels for Vertical Chart */
            .y-axis {
                position: absolute;
                left: 0;
                top: 1rem;
                bottom: 0;
                width: 2rem;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                font-size: 0.7rem;
                color: var(--chart-text-muted);
                padding-right: 0.25rem;
                text-align: right;
            }
            
            /* Empty State */
            .empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 200px;
                color: var(--chart-text-muted);
                text-align: center;
            }
            
            /* Tooltip */
            .tooltip {
                position: absolute;
                background: var(--chart-text);
                color: white;
                padding: 0.375rem 0.5rem;
                border-radius: 4px;
                font-size: 0.75rem;
                white-space: nowrap;
                pointer-events: none;
                z-index: 100;
                opacity: 0;
                transition: opacity 0.15s ease;
            }
            
            .tooltip.visible {
                opacity: 1;
            }
            
            /* Level indicator */
            .level-info {
                font-size: 0.75rem;
                color: var(--chart-text-muted);
                padding: 0.25rem 0 0.5rem;
                font-style: italic;
            }
            
            @media (max-width: 768px) {
                .bar-label-vertical {
                    font-size: 0.7rem;
                    transform: rotate(-45deg);
                    transform-origin: top left;
                    width: 80px;
                    text-align: left;
                    margin-left: -20px;
                }
                .bar-label-horizontal {
                    width: 90px;
                    min-width: 90px;
                    font-size: 0.75rem;
                }
                .chart-header {
                    flex-direction: column;
                    align-items: flex-start;
                }
            }
        `;
        this.shadowRoot.appendChild(styles.cloneNode(true));
    }

    /**
     * @private
     */
    _renderContent() {
        const container = WRender.Create({
            tagName: 'div',
            className: 'chart-wrapper',
            children: [
                this._renderHeader(),
                this._renderBreadcrumb(),
                this._renderLevelInfo(),
                this._renderChart()
            ]
        });
        
        this.shadowRoot.querySelectorAll('.chart-wrapper').forEach(el => el.remove());
        this.shadowRoot.appendChild(container);
    }

    /**
     * @private
     * @returns {HTMLElement}
     */
    _renderHeader() {
        const canGoBack = this._currentPath.length > 0;
        const metrics = this._getAvailableMetrics();
        
        return WRender.Create({
            tagName: 'div',
            className: 'chart-header',
            children: [
                WRender.Create({
                    tagName: 'h3',
                    className: 'chart-title',
                    children: [this._title]
                }),
                WRender.Create({
                    tagName: 'div',
                    className: 'controls',
                    children: [
                        canGoBack ? WRender.Create({
                            tagName: 'button',
                            className: 'btn',
                            innerText: '← Anterior',
                            onclick: () => this.goBack()
                        }) : null,
                        this._currentPath.length > 0 ? WRender.Create({
                            tagName: 'button',
                            className: 'btn',
                            innerText: '🏠 Inicio',
                            onclick: () => this.reset()
                        }) : null,
                        WRender.Create({
                            tagName: 'select',
                            className: 'metric-select',
                            onchange: (e) => {
                                this._selectedMetric = e.target.value;
                                this._renderContent();
                            },
                            children: metrics.map(metric => 
                                WRender.Create({
                                    tagName: 'option',
                                    value: metric,
                                    innerText: metric,
                                    selected: metric === this._selectedMetric
                                })
                            )
                        })
                    ].filter(Boolean)
                })
            ]
        });
    }

    /**
     * @private
     * @returns {HTMLElement|null}
     */
    _renderBreadcrumb() {
        if (this._currentPath.length === 0) return null;
        
        const items = [
            WRender.Create({
                tagName: 'span',
                className: 'breadcrumb-item',
                innerText: 'Inicio',
                onclick: () => this.reset()
            })
        ];
        
        this._currentPath.forEach((segment, index) => {
            const path = this._currentPath.slice(0, index + 1);
            items.push(
                WRender.Create({ tagName: 'span', className: 'breadcrumb-separator', innerText: '›' }),
                WRender.Create({
                    tagName: 'span',
                    className: 'breadcrumb-item',
                    innerText: segment,
                    onclick: () => this.navigateTo(path)
                })
            );
        });
        
        return WRender.Create({
            tagName: 'nav',
            className: 'breadcrumb',
            children: items
        });
    }

    /**
     * @private
     * @returns {HTMLElement}
     */
    _renderLevelInfo() {
        const currentLevel = this._currentPath.length + 1;
        const canDrill = currentLevel < this._maxLevels;
        
        return WRender.Create({
            tagName: 'span',
            className: 'level-info',
            innerText: `Nivel ${currentLevel}/${this._maxLevels} • ${canDrill ? 'Click en barra para profundizar' : 'Nivel máximo'}`
        });
    }

    /**
     * @private
     * @returns {HTMLElement}
     */
    _renderChart() {
        const bars = this._getBarsForCurrentLevel();
        
        if (bars.length === 0) {
            return WRender.Create({
                tagName: 'div',
                className: 'chart-container',
                children: [
                    WRender.Create({
                        tagName: 'div',
                        className: 'empty-state',
                        children: [
                            WRender.Create({ innerText: '📊' }),
                            WRender.Create({ tagName: 'p', innerText: 'Sin datos para mostrar' })
                        ]
                    })
                ]
            });
        }
        
        if (this._orientation === 'vertical') {
            return this._renderVerticalChart(bars);
        }
        return this._renderHorizontalChart(bars);
    }

    /**
     * @private
     * @param {Array} bars 
     * @returns {HTMLElement}
     */
    _renderVerticalChart(bars) {
        const maxValue = Math.max(...bars.map(b => b.value));
        const steps = 4;
        const stepValue = maxValue / steps;
        
        const yAxisLabels = [];
        for (let i = 0; i <= steps; i++) {
            const value = stepValue * i;
            yAxisLabels.push(WRender.Create({
                tagName: 'span',
                innerText: this._formatValue(value)
            }));
        }
        
        return WRender.Create({
            tagName: 'div',
            className: 'chart-container',
            children: [
                WRender.Create({
                    tagName: 'div',
                    className: 'y-axis',
                    children: yAxisLabels.reverse()
                }),
                WRender.Create({
                    tagName: 'div',
                    className: 'chart-vertical',
                    children: bars.map(bar => {
                        const heightPercent = maxValue > 0 ? (bar.value / maxValue) * 100 : 0;
                        const formattedValue = this._formatValue(bar.value);
                        const canDrill = bar.hasChildren && this._currentPath.length < this._maxLevels;
                        
                        return WRender.Create({
                            tagName: 'div',
                            className: 'bar-group-vertical',
                            children: [
                                WRender.Create({
                                    tagName: 'div',
                                    className: `bar-vertical ${canDrill ? 'has-children' : ''}`,
                                    style: { height: `${Math.max(heightPercent, 2)}%`, backgroundColor: bar.color },
                                    title: `${bar.label}: ${formattedValue}`,
                                    onclick: () => canDrill && this._handleBarClick(bar.key),
                                    onmouseenter: (e) => this._showTooltip(e, `${bar.label}: ${formattedValue}`),
                                    onmouseleave: () => this._hideTooltip()
                                }),
                                WRender.Create({
                                    tagName: 'span',
                                    className: 'bar-label-vertical',
                                    innerText: bar.label,
                                    title: bar.label,
                                    onclick: () => canDrill && this._handleBarClick(bar.key)
                                }),
                                WRender.Create({
                                    tagName: 'span',
                                    className: 'bar-value-vertical',
                                    innerText: formattedValue
                                })
                            ]
                        });
                    })
                }),
                WRender.Create({ tagName: 'div', className: 'tooltip', id: 'chart-tooltip' })
            ]
        });
    }

    /**
     * @private
     * @param {Array} bars 
     * @returns {HTMLElement}
     */
    _renderHorizontalChart(bars) {
        const maxValue = Math.max(...bars.map(b => b.value));
        
        return WRender.Create({
            tagName: 'div',
            className: 'chart-container',
            children: [
                WRender.Create({
                    tagName: 'div',
                    className: 'chart-horizontal',
                    children: bars.map(bar => {
                        const widthPercent = maxValue > 0 ? (bar.value / maxValue) * 100 : 0;
                        const formattedValue = this._formatValue(bar.value);
                        const canDrill = bar.hasChildren && this._currentPath.length < this._maxLevels;
                        
                        return WRender.Create({
                            tagName: 'div',
                            className: 'bar-group-horizontal',
                            children: [
                                WRender.Create({
                                    tagName: 'span',
                                    className: 'bar-label-horizontal',
                                    innerText: bar.label,
                                    title: bar.label,
                                    onclick: () => canDrill && this._handleBarClick(bar.key)
                                }),
                                WRender.Create({
                                    tagName: 'div',
                                    className: 'bar-track-horizontal',
                                    children: [
                                        WRender.Create({
                                            tagName: 'div',
                                            className: `bar-horizontal ${canDrill ? 'has-children' : ''}`,
                                            style: { width: `${Math.max(widthPercent, 2)}%`, backgroundColor: bar.color },
                                            title: `${bar.label}: ${formattedValue}`,
                                            onclick: () => canDrill && this._handleBarClick(bar.key),
                                            onmouseenter: (e) => this._showTooltip(e, `${bar.label}: ${formattedValue}`),
                                            onmouseleave: () => this._hideTooltip()
                                        })
                                    ]
                                }),
                                WRender.Create({
                                    tagName: 'span',
                                    className: 'bar-value-horizontal',
                                    innerText: formattedValue
                                })
                            ]
                        });
                    })
                }),
                WRender.Create({ tagName: 'div', className: 'tooltip', id: 'chart-tooltip' })
            ]
        });
    }

    /**
     * @private
     * @returns {Array<{label: string, value: number, key: string, color: string, hasChildren: boolean}>}
     */
    _getBarsForCurrentLevel() {
        if (!this._data?.metricLevels) return [];
        
        let currentData = this._data.groupedData;
        
        for (const segment of this._currentPath) {
            if (currentData?.[segment]) {
                currentData = currentData[segment];
            } else {
                return [];
            }
        }
        
        const bars = [];
        
        if (Array.isArray(currentData)) {
            const groups = new Map();
            const groupKey = Object.keys(currentData[0] || {}).find(k => 
                !['SubTotal', 'Descuento', 'Iva', 'Total', 'Fecha'].includes(k)
            );
            
            if (groupKey) {
                currentData.forEach(item => {
                    const key = item[groupKey] ?? 'Sin clasificar';
                    if (!groups.has(key)) groups.set(key, []);
                    groups.get(key).push(item);
                });
            }
            
            for (const [key, items] of groups) {
                const value = items.reduce((sum, item) => sum + (item[this._selectedMetric] ?? 0), 0);
                if (value > 0) {
                    bars.push({
                        label: key,
                        value,
                        key,
                        color: this._generateColor(key),
                        hasChildren: false
                    });
                }
            }
        }
        else if (typeof currentData === 'object' && currentData !== null) {
            for (const [key, value] of Object.entries(currentData)) {
                const metricKey = this._currentPath.length > 0 
                    ? [...this._currentPath, key].join(' > ')
                    : key;
                    
                const metric = this._data.metricLevels?.[metricKey]?.[this._selectedMetric];
                const metricValue = metric?.sum ?? metric?.count ?? 0;
                
                if (metricValue > 0) {
                    bars.push({
                        label: key,
                        value: metricValue,
                        key,
                        color: this._generateColor(key),
                        hasChildren: !Array.isArray(value)
                    });
                }
            }
        }
        
        return bars
            .sort((a, b) => b.value - a.value)
            .slice(0, this._maxBars);
    }

    /**
     * @private
     * @returns {string[]}
     */
    _getAvailableMetrics() {
        const sample = this._data?.metricLevels?.['General Summary'] || {};
        return Object.keys(sample).filter(key => 
            ['SubTotal', 'Descuento', 'Iva', 'Total'].includes(key)
        );
    }

    /**
     * @private
     * @param {string} seed 
     * @returns {string}
     */
    _generateColor(seed) {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 65%, 52%)`;
    }

    /**
     * @private
     * @param {number} value 
     * @returns {string}
     */
    _formatValue(value) {
        if (typeof value !== 'number') return String(value);
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
        return `$${value.toFixed(0)}`;
    }

    /**
     * @private
     * @param {string} key 
     */
    _handleBarClick(key) {
        if (this._currentPath.length >= this._maxLevels) return;
        this.navigateTo([...this._currentPath, key]);
    }

    /**
     * @private
     * @param {Event} e 
     * @param {string} content 
     */
    _showTooltip(e, content) {
        const tooltip = this.shadowRoot.getElementById('chart-tooltip');
        if (tooltip) {
            tooltip.innerText = content;
            tooltip.classList.add('visible');
            const rect = e.currentTarget.getBoundingClientRect();
            const containerRect = this.shadowRoot.querySelector('.chart-container').getBoundingClientRect();
            tooltip.style.left = `${rect.left - containerRect.left + rect.width / 2}px`;
            tooltip.style.top = `${rect.top - containerRect.top - 30}px`;
        }
    }

    /**
     * @private
     */
    _hideTooltip() {
        const tooltip = this.shadowRoot.getElementById('chart-tooltip');
        if (tooltip) tooltip.classList.remove('visible');
    }
}

if (!customElements.get('w-bar-chart')) {
    customElements.define('w-bar-chart', WBarChart);
}

export { WBarChart };



// 1. Preparar datos de ejemplo
const transactions = [
    { Producto: "Laptop", Sucursal: "Sucursal A", SubTotal: 1200, Total: 1104 },
    { Producto: "Tablet", Sucursal: "Sucursal A", SubTotal: 500, Total: 468 },
    { Producto: "Laptop", Sucursal: "Sucursal B", SubTotal: 1250, Total: 1150 }
];

// 2. Definir modelo para validación de tipos
const ModelObject = {
    SubTotal: { type: "MONEY" },
    Total: { type: "MONEY" }
};

// 3. Agrupar datos con WArrayF (máximo 4 niveles)
const groupedResult = WArrayF.GroupData(
    transactions,
    ['Sucursal', 'Producto'],  // Parámetros de agrupación
    ['SubTotal', 'Total'],      // Métricas a evaluar
    ModelObject,
    'Ventas'
);

// 4. Crear instancia del componente con configuración
const chart = new WBarChart({
    data: groupedResult,
    metric: 'Total',
    maxLevels: 4,
    maxBars: 8,
    title: '📊 Ventas por Sucursal',
    onNavigate: (path) => console.log('Navegando a:', path)
});

// 5. Insertar en el DOM
document.body.appendChild(chart);

// 6. (Opcional) Métodos de control programático
// chart.setData(newData, 'SubTotal');  // Actualizar datos
// chart.navigateTo(['Sucursal A']);     // Navegar a nivel específico
// chart.goBack();                       // Retroceder
// chart.reset();                        // Reiniciar vista