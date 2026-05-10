//@ts-check
import { html, WRender } from "../../WModules/WComponentsTools.js";
import { css } from "../../WModules/WStyledRender.js";
import { ChartDataHelper } from "./ChartModules/ChartDataHelper.js";
import { WChartBase } from "./ChartModules/WChartBase.js";

class WLineChart extends WChartBase {
    /** @protected */
    getSpecificStyles() {
        return css`
        .bar-leaf { width: 0px; min-width: 16px; border-radius: 3px 3px 0 0; transition: all 0.2s ease; cursor: pointer; position: relative; min-height: 4px; }
        .chart-group-nested[data-level="2"] .bar-leaf, .chart-group-nested[data-level="3"] .bar-leaf, .chart-group-nested[data-level="4"] .bar-leaf { width: 0px; min-width: 0px; }
        .bar-value { position: absolute; top: -22px; left: 50%; transform: translateX(-50%); font-size: 0.625rem; font-weight: 700; color: var(--chart-text); white-space: nowrap; opacity: 0; transition: opacity 0.2s; }
        .PathLine { pointer-events: stroke; }
        .point-group { cursor: pointer; }
        .chart-group-children {
            justify-content: flex-start; gap: 0;
        }
    `;
    }

    /**
     * 
     * @param {{ value: number; key: any; color: any; path: any[]; }} leafNode
     * @param {number} maxValue
     * @returns {any}
     */
    renderLeafNode(leafNode, maxValue) {
        const heightPercent = leafNode.value > 0 ? (leafNode.value / maxValue) * 100 : 0;
        const isActive = this._activeLegendItems.size === 0 || this._activeLegendItems.has(leafNode.key);

        return WRender.Create({
            class: "bar-leaf",
            name: leafNode.key, // Necesario para mapear series en el SVG
            style: `height: ${Math.max(heightPercent, isActive ? 4 : 0)}%; background-color: ${leafNode.color}; opacity: ${isActive ? 1 : 0.3}`,
            title: `${leafNode.path.join(' > ')}: ${ChartDataHelper.formatValue(leafNode.value, this.EvalMetric)}`,
            onmouseenter: (/** @type {{ currentTarget: { getBoundingClientRect: () => any; }; }} */ e) => 
                this._showTooltip(e, `${leafNode.path.join(' > ')}: ${ChartDataHelper.formatValue(leafNode.value, this.EvalMetric)}`),
            onmouseleave: () => this._hideTooltip()
        });
    }

    /**
     * 
     * @param {HTMLElement | HTMLInputElement | HTMLSelectElement} container
     * @param {any[]} nodes
     * @param {number} maxValue
     */
    renderChartSpecifics(container, nodes, maxValue) {
        if (!container) return;
        const chartGroup = container.querySelector('.chart-groups-root');
        if (!chartGroup) return;

        chartGroup.querySelector("svg")?.remove();
        window.addEventListener("resize", () => {
            this._drawLineChart(chartGroup);
        });
        this._drawLineChart(chartGroup);
    }

    /**
     * 
     * @param {Element} chartGroup
     */
    _drawLineChart(chartGroup) {
        chartGroup.querySelector("svg")?.remove();
        const svg = WRender.createElementNS({
            type: "svg", props: {
                style: "position:absolute; top: 0; width:100%; height: 100%; pointer-events: none; ",
                overflow: "visible"
            }
        });
        const barContainers = chartGroup.querySelectorAll(`.bar-leaf`);
        const seriesMap = new Map();

        barContainers.forEach(b => {
            // @ts-ignore
            const serie = b.name;
            const isActive = this._activeLegendItems.size === 0 || this._activeLegendItems.has(serie);

            if (!seriesMap.has(serie)) {
                seriesMap.set(serie, {
                    // @ts-ignore
                    color: b.style.backgroundColor,
                    opacity: isActive ? 1 : 0.2,
                    bars: []
                });
            }
            seriesMap.get(serie).bars.push(b);
        });

        seriesMap.forEach(({ color, opacity, bars }, serie) => {
            if (!bars.length) return;

            // @ts-ignore
            const containerWid = chartGroup.offsetWidth + 2000;
            const Path = WRender.createElementNS({
                type: "path",
                props: {
                    id: "path_" + serie,
                    name: serie,
                    class: "PathLine",
                    stroke: color,
                    "fill-opacity": 0,
                    "stroke-width": 3,
                    "stroke-dasharray": containerWid.toString(),
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round"
                },
                children: []
            });
            Path.style.opacity = opacity;
            svg.append(Path);

            setTimeout(() => {
                let d = `M ${bars[0].offsetLeft} ${bars[0].offsetTop + 2}`;
                for (let i = 0; i < bars.length - 1; i++) {
                    const [x1, y1] = [bars[i].offsetLeft, bars[i].offsetTop + 2];
                    const [x2, y2] = [bars[i + 1].offsetLeft, bars[i + 1].offsetTop + 2];
                    d += ` C ${x1 + (x2 - x1) / 3} ${y1}, ${x1 + 2 * (x2 - x1) / 3} ${y2}, ${x2} ${y2}`;
                }
                const pathEl = svg.querySelector(`path[name="${serie}"]`);
                if (pathEl) {
                    pathEl.setAttribute("d", d);
                    pathEl.appendChild(WRender.createElementNS({
                        type: "animate", props: {
                            attributeName: "stroke-dashoffset",
                            from: containerWid,
                            to: "0",
                            dur: "2s",
                            fill: "freeze"
                        }
                    }));
                }

                bars.forEach((/** @type {{ offsetLeft: any; offsetTop: number; title: string; }} */ bar) => {
                    const x = bar.offsetLeft, y = bar.offsetTop + 2;
                    const group = WRender.createElementNS({ type: "g", props: { class: "point-group", style: "pointer-events: all; cursor: pointer;" } });
                    group.style.opacity = opacity;
                    group.append(
                        WRender.createElementNS({ type: "circle", props: { cx: x, cy: y, r: 10, fill: "none", stroke: color, "stroke-width": 2, opacity: 0.4 } }),
                        WRender.createElementNS({ type: "circle", props: { cx: x, cy: y, r: 7, fill: "white", stroke: color, "stroke-width": 2 } }),
                        WRender.createElementNS({ type: "circle", props: { cx: x, cy: y, r: 4, fill: color, stroke: "white", "stroke-width": 1.5 } })
                    );
                    // @ts-ignore
                    group.onmouseenter = (e) => this._showTooltip(e, bar.title);
                    group.onmouseleave = () => this._hideTooltip();
                    svg.append(group);
                });
            }, 10);
        });
        chartGroup.append(svg);
    }
}

if (!customElements.get('w-line-chart')) customElements.define('w-line-chart', WLineChart);
export { WLineChart };