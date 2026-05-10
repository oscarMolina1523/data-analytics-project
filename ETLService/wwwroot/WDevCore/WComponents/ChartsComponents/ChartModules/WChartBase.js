//@ts-check

import { html } from "../../../WModules/WComponentsTools.js";
import { css } from "../../../WModules/WStyledRender.js";
import { ChartDataHelper } from "./ChartDataHelper.js";
import { ChartLayoutBuilder } from "./ChartLayoutBuilder.js";

/**
 * @typedef {Object} WChartConfig
 * @property {any} data
 * @property {string} [metric]
 * @property {string} [title]
 * @property {boolean} [showLegend]
 * @property {boolean} [showValues]
 * @property {string[]} [GroupParams]
 * @property {string[]} [EvalParams]
 * @property {string[]} [Colors]
 */
export class WChartBase extends HTMLElement {
    /** @param {WChartConfig} [Config] */
    constructor(Config = {
        data: undefined
    }) {
        super();
        this.attachShadow({ mode: 'open' });

        this._data = Config.data ?? [];

        this.Colors = Config.Colors;
        
        this._title = Config.title ?? 'Gráfico';
        this._showLegend = Config.showLegend !== false;
        this._showValues = Config.showValues !== false;
        this.GroupParams = Config.GroupParams ?? [];
        this.EvalParams = Config.EvalParams ?? [];
        this._selectedMetric = Config.metric ?? this.EvalParams[this.EvalParams?.length - 1] ?? "count";

        this._activeLegendItems = new Set();
        this._colorMap = new Map();
        this.EvalMetrics = ChartDataHelper.EVAL_METRICS;
        this.EvalMetric = this.EvalMetrics[0];

        this.shadowRoot?.appendChild(ChartLayoutBuilder.getCommonStyles().cloneNode(true));
        this.shadowRoot?.appendChild(this.getSpecificStyles());

        this._renderContent();
    }

    connectedCallback() { }

    /** @param {any} data @param {string} [metric] */
    setData(data, metric) {
        this._data = data;
        if (metric) this._selectedMetric = metric;
        this._activeLegendItems.clear();
        this._colorMap.clear();
        this._renderContent();
    }

    /** Métodos abstractos (deben ser implementados por hijos) */
    /** @protected */ getSpecificStyles() { return css``; }
    /**
     * 
     * @abstract
     * @param {any} leafNode
     * @param {number} maxValue
     */
    renderLeafNode(leafNode, maxValue) { return ''; }
    /**
    * 
    * @abstract
    * @param {HTMLElement | HTMLInputElement | HTMLSelectElement} container
    * @param {any} nodes
    * @param {number} maxValue
    */
    renderChartSpecifics(container, nodes, maxValue) { }
    /** @private */
    _renderContent() {
        const { mainGroups, colorMap } = ChartDataHelper.processTreeData(
            this._data.groupedData, this._data.metricLevels, this._selectedMetric,  this.EvalMetric, this.Colors
        );
        this._colorMap = colorMap;

        const header = this._renderHeader();
        const legend = this._showLegend ? ChartLayoutBuilder.renderLegend(
            ChartDataHelper.extractLegendData(this._data.groupedData, this.Colors ?? ChartDataHelper.getColorPalette()),
            this._activeLegendItems, (/** @type {any} */ k) => this._toggleLegendItem(k)
        ) : '';
        const chartArea = this._renderChartArea(mainGroups);
        const tooltip = ChartLayoutBuilder.renderTooltip();
        chartArea.append(tooltip)

        this.shadowRoot?.querySelectorAll('.chart-wrapper').forEach(el => el.remove());
        this.shadowRoot?.appendChild(ChartLayoutBuilder.renderWrapper(header, legend, chartArea));
    }

    /** @private */
    _renderHeader() {
        return ChartLayoutBuilder.renderHeader(
            this._title,
            ChartDataHelper.getAvailableMetrics(this._data.metricLevels),
            this._selectedMetric,
            this.EvalMetrics,
            this.EvalMetric,
            ( /** @type {Object.<string, any>} */ e) => { this._selectedMetric = e.target.value; this._renderContent(); },
            ( /** @type {Object.<string, any>} */ e) => { this.EvalMetric = e.target.value; this._renderContent(); }
        );
    }

    /**
     * 
     * @param {any[]} nodes
     */
    _renderChartArea(nodes) {
        if (!nodes.length) {
            return html`<div class="chart-area"><div class="empty-state">📊 Sin datos para mostrar</div></div>`;
        }
        const maxValue = ChartDataHelper.findMaxValue(nodes);
        const steps = 5;
        const stepValue = maxValue / steps;
        const yAxisLabels = Array.from({ length: steps + 1 },
            (_, i) =>
                html`<span class="y-axis-label">${ChartDataHelper.formatValue(stepValue * (steps - i), this.EvalMetric)}</span>`);
                const gridLines = Array.from({ length: steps + 1 },
            () =>
                html`<div class="grid-line"></div>`);

        const container = html`<div class="chart-scroll-container">
            <div class="chart-area">
                <div class="y-axis">${yAxisLabels}</div>
                <div class="chart-groups-root">
                <div class="grid-lines">${gridLines}</div>
                ${this._renderNodes(nodes, 0, maxValue)}
                </div>
            </div>
        </div>`;

        this.renderChartSpecifics(container, nodes, maxValue);
        return container;
    }

    /**
     * 
     * @param {any[]} nodes
     * @param {number} level
     * @param {number} maxValue
     * @returns {any}
     */
    _renderNodes(nodes, level, maxValue) {
        return nodes.map(node => node.type === 'leaf' ? this.renderLeafNode(node, maxValue) : this._renderBranchNode(node, level, maxValue));
    }
    /**
    * @private
    * @param {Array<Object.<string, any>>} nodes 
    * @returns {number}
    */
    _FindMaxValue(nodes) {
        let max = 0;
        for (const node of nodes) {
            if (node.type === 'leaf') {
                max = Math.max(max, node.value);
            } else if (node.type === 'branch' && node.children) {
                max = Math.max(max, this._FindMaxValue(node.children));
            }
        }
        return max || 1;
    }


    /**
     * 
     * @param {{ path: any[]; label: any; children: any[]; }} node
     * @param {number} level
     * @param {number} maxValue
     */
    _renderBranchNode(node, level, maxValue) {
        const isRoot = level === 0;
        return html`<div class="${isRoot ? 'chart-group-root' : 'chart-group-nested'}" data-level="${level}">
            <div class="chart-group-label level-${level}" title="${node.path.join(' > ')}">${node.label}</div>
            <div class="chart-group-children">${this._renderNodes(node.children, level + 1, maxValue)}</div>
        </div>`;
    }

    /**
     * 
     * @param {any} key
     */
    _toggleLegendItem(key) {
        this._activeLegendItems.has(key) ? this._activeLegendItems.delete(key) : this._activeLegendItems.add(key);
        this._renderContent();
    }

    /**
     * 
     * @param {{ currentTarget: { getBoundingClientRect: () => any; }; }} e
     * @param {string} content
     */
    _showTooltip(e, content) {
        const tooltip = this.shadowRoot?.getElementById('chart-tooltip');
        if (!tooltip) return;
        tooltip.innerText = content;
        tooltip.classList.add('visible');
        const rect = e.currentTarget?.getBoundingClientRect();
        const containerRect = this.shadowRoot?.querySelector('.chart-scroll-container')?.getBoundingClientRect();
        tooltip.style.left = `${rect.left - (containerRect?.left || 0) - tooltip.offsetWidth / 2}px`;
        tooltip.style.top = `${rect.top - (containerRect?.top || 0) - 40}px`;
    }

    _hideTooltip() {
        this.shadowRoot?.getElementById('chart-tooltip')?.classList.remove('visible');
    }
}