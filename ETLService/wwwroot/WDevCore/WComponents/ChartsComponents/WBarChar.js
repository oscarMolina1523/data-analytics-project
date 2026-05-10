//@ts-check
import { html } from "../../WModules/WComponentsTools.js";
import { css } from "../../WModules/WStyledRender.js";
import { ChartDataHelper } from "./ChartModules/ChartDataHelper.js";
import { WChartBase } from "./ChartModules/WChartBase.js";


class WBarChart extends WChartBase {

    getSpecificStyles() {
        return css`
            .bar-leaf { width: 16px; min-width: 16px; border-radius: 3px 3px 0 0; transition: all 0.2s ease; cursor: pointer; position: relative; min-height: 4px; }
            .bar-leaf:hover { filter: brightness(1.15); transform: scaleY(1.02); z-index: 10; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
            .chart-group-nested[data-level="2"] .bar-leaf { width: 12px; min-width: 12px; }
            .chart-group-nested[data-level="3"] .bar-leaf { width: 10px; min-width: 10px; }
            .chart-group-nested[data-level="4"] .bar-leaf { width: 8px; min-width: 8px; }
            .bar-value { position: absolute; top: -22px; left: 50%; transform: translateX(-50%); font-size: 0.625rem; font-weight: 700; color: var(--chart-text); white-space: nowrap; opacity: 0; transition: opacity 0.2s; }
            .bar-leaf:hover .bar-value { opacity: 1; }
        `;
    }
    /** @protected */
    /**
       * 
       * @param {{ value: number; key: any; color: any; path: any[]; }} leafNode
       * @param {number} maxValue
       * @returns {any}
       */
    renderLeafNode(leafNode, maxValue) {
        const heightPercent = leafNode.value > 0 ? (leafNode.value / maxValue) * 100 : 0;
        const isActive = this._activeLegendItems.size === 0 || this._activeLegendItems.has(leafNode.key);
        const barValue = this._showValues ? html`<span class="bar-value">${
            ChartDataHelper.formatValue(leafNode.value, this.EvalMetric)}</span>` : '';

        return html`<div class="bar-leaf" 
                style="height: ${Math.max(heightPercent, isActive ? 4 : 0)}%; background-color: ${leafNode.color}; opacity: ${isActive ? 1 : 0.3}" 
                title="${leafNode.path.join(' > ')}: ${
                    ChartDataHelper.formatValue(leafNode.value, this.EvalMetric)}"
                onmouseenter="${(/** @type {{ currentTarget: { getBoundingClientRect: () => any; }; }} */ e) => this._showTooltip(e, `${leafNode.path.join(' > ')}: ${
                    ChartDataHelper.formatValue(leafNode.value, this.EvalMetric)}`)}"
                onmouseleave="${() => this._hideTooltip()}">
                ${barValue}
            </div>`;
    }

    renderChartSpecifics() { }
}

if (!customElements.get('w-bar-chart')) customElements.define('w-bar-chart', WBarChart);
export { WBarChart };