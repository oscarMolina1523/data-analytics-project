//@ts-check

import { html } from "../../../WModules/WComponentsTools.js";
import { css } from "../../../WModules/WStyledRender.js";

export class ChartLayoutBuilder {
    /**
     * @param {string} title
     * @param {string[]} metrics
     * @param {string} selectedMetric
     * @param {string[]} evalMetrics
     * @param {string} selectedEval
     * @param {(e: Object.<string, any>)=> void} onMetricChange
     * @param {(e: Object.<string, any>)=> void} onEvalChange
     */
    static renderHeader(title, metrics, selectedMetric, evalMetrics, selectedEval, onMetricChange, onEvalChange) {
        return html`<div class="chart-header">
      <h3 class="chart-title">${title}</h3>
      <div class="option">
        <select class="metric-select" onchange="${onMetricChange}">
          ${metrics.map(m => html`<option value="${m}" ${this.isSelected(selectedMetric, m)}>${m}</option>`)}
        </select>
        <select class="metric-select" onchange="${onEvalChange}">
          ${evalMetrics.map(m => html`<option value="${m}" ${this.isSelected(selectedEval, m)}>${m}</option>`)}
        </select>
      </div>
    </div>`;
    }

    /**
     * @param {any} selected
     * @param {any} val
     * @returns {any}
     */
    static isSelected (selected, val) {
        return val === selected ? "selected" : "";
    }

    /**
     * @param {{label:string, key:string, color:string}[]} legendData
     * @param {Set<string>} activeItems
     * @param {Function} onToggle
     */
    static renderLegend(legendData, activeItems, onToggle) {
        if (!legendData.length) return '';
        return html`<div class="legend">
            ${legendData.map(item => html`<div class="legend-item" onclick="${() => onToggle(item.key)}">
                <div class="legend-color" style="background-color: ${item.color}"></div>
                <span class="legend-label">${item.label}</span>
            </div>`)}
        </div>`;
    }

    /** @returns {HTMLElement} */
    static renderTooltip() {
        return html`<div class="tooltip" id="chart-tooltip"></div>`;
    }

    /**
     * @param {HTMLElement} header
     * @param {HTMLElement|string} legend
     * @param {HTMLElement} chartArea
     */
    static renderWrapper(header, legend, chartArea) {
        return html`<div class="chart-wrapper">${header}${legend}${chartArea}</div>`;
    }

    static getCommonStyles = () => css`
        :host {
            display: block;
            font-family: system-ui, -apple-system, sans-serif;
            --chart-bg: #ffffff;
            --chart-border: #e2e8f0;
            --chart-text: #1e293b;
            --chart-text-muted: #64748b;
            --chart-grid: #f1f5f9;
        }

        .chart-wrapper {
            background: var(--chart-bg);
            border: 1px solid var(--chart-border);
            border-radius: 8px;
            min-height: 500px;
        }

        .chart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border-bottom: 2px solid var(--chart-border);
            flex-wrap: wrap;
            gap: 1rem;
        }

        .chart-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--chart-text);
            margin: 0;
        }

        .metric-select {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            border: 1px solid var(--chart-border);
            border-radius: 6px;
            background: white;
            color: var(--chart-text);
        }

        .legend {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            justify-content: center;
            padding: 1rem;
            border-bottom: 1px solid var(--chart-border);
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            background: white;
            border: 1px solid var(--chart-border);
            transition: all 0.2s;
        }

        .legend-item:hover {
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .legend-color {
            width: 16px;
            height: 16px;
            border-radius: 4px;
            border: 2px solid white;
            box-shadow: 0 0 0 1px var(--chart-border);
        }

        .chart-scroll-container {
            overflow-x: auto;
            overflow-y: hidden;
            position: relative;
        }

        .chart-area {
            display: flex;
            align-items: flex-end;
            min-width: min-content;
            padding: 2rem 1rem 3rem;
            position: relative;
            height: 400px;
            gap: 0;
        }

        .y-axis {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: calc(100% - 102px);
            padding-right: 1rem;
            min-width: 30px;
            margin-bottom: 64px;
            position: relative;
        }

        .y-axis-label {
            font-size: 0.8125rem;
            color: var(--chart-text-muted);
            text-align: right;
            font-weight: 600;
        }

        .grid-lines {
            position: absolute;
            top: 38px;
            left: 20px;
            right: 0;
            bottom: 0;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            pointer-events: none;
            height: calc(100% - 102px);
        }

        .grid-line {
            width: 100%;
            height: 1px;
            background: var(--chart-grid);
        }

        .chart-groups-root {
            display: flex;
            align-items: flex-end;
            height: 100%;
            gap: 0;
            margin: 0 1rem 0 0;
            flex: 1;
            position: relative;
            border: 1px solid var(--chart-border);
        }

        .chart-group-root,
        .chart-group-nested {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            height: 100%;
            min-width: min-content;
            flex: 1;
        }

        .chart-group-nested {
            display: flex;
            flex-direction: column-reverse;
            align-items: stretch;
            border-left: 1px solid var(--chart-border);
        }

        .chart-group-label {
            text-align: start;
            font-weight: 600;
            color: var(--chart-text);
            padding: 0.5rem 0.25rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .chart-group-children {
            display: flex;
            align-items: flex-end;
            gap: 0.25rem;
            flex: 1;
            justify-content: center;
            border-bottom: 1px solid var(--chart-border);
        }

        .tooltip {
            position: absolute;
            background: var(--chart-text);
            color: white;
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            font-size: 0.8125rem;
            white-space: nowrap;
            pointer-events: none;
            z-index: 100;
            opacity: 0;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .tooltip.visible {
            opacity: 1;
        }

        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 300px;
            color: var(--chart-text-muted);
            font-size: 1.125rem;
        }

        .chart-group-label.level-0 {
            font-size: 1rem;
            border-bottom: 1px solid var(--chart-border);
            border-left: 1px solid var(--chart-border);
        }
        .chart-group-label.level-1 {
            font-size: 0.75rem;
            color: var(--chart-text-muted);
            max-height: 80px;
        }
        .chart-group-label.level-2 {
            font-size: 0.75rem;
            max-height: 80px;
            opacity: 0.9;
        }
    `;

}