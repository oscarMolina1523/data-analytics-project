import { WRender, html } from "../WModules/WComponentsTools.js";
import { css, WCssClass } from "../WModules/WStyledRender.js";
import { WArrayF } from "../WModules/WArrayF.js";

class ChartConfig {
    // TypeChart = 0;
    // Dataset = [];
    // Colors = [];
    // percentCalc = true
    // AttNameEval = "series";
    // EvalValue = "value";
    // groupParams = [];
}
/**
 * @typedef {Object.<string, any>} ChartInstance
 * * @property {String} [TypeChart] staked, Line, bar
 * * @property {Array} [Dataset]
 * * @property {Array} [Colors]
 * * @property {Boolean} [percentCalc]
 * * @property {String} [AttNameEval]
 * * @property {String} [EvalValue]
 * * @property {String} [Title]
 * * @property {Number} [MaxVal]
 * * @property {Array} [groupParams] 
 */
const ColorsList = [
  "#044fa2", "#0088ce", "#f6931e", "#eb1c24", "#01c0f4",
  "#065e76", "#e63da4", "#6a549f", "#06b31d",

  // Nuevos colores agregados:
  "#0277bd", // azul medio
  "#00acc1", // cian medio
  "#ffa000", // naranja fuerte
  "#d32f2f", // rojo intenso
  "#26c6da", // celeste claro
  "#00796b", // verde azulado oscuro
  "#c2185b", // rosa fuerte
  "#8e24aa", // púrpura intenso
  "#2e7d32", // verde bosque
  "#ff7043"  // naranja coral
];

class ColumChart extends HTMLElement {
    /**
     * @param {ChartInstance} ChartInstance 
     */
    constructor(ChartInstance = (new ChartConfig())) {
        super();
        this.ChartInstance = ChartInstance;
        this.ChartInstance.Colors = this.ChartInstance.Colors ?? ColorsList
        this.GroupsData = [];
        this.ProcessData = [];
        this.IconsGroupColores = ["#ffc700", "#01a503", "#285a76", "#4640a3", "#8640a3"]
        this.MainChart = { type: "section", props: { class: "SectionBars" }, children: [] };
        this.GroupsProcessData = [];
        this.ChartTable = html`<table>
            <thead><th>${this.ChartInstance.Title}</th></thead>   
        </table>`
        this.ChartJson = {
            title: this.ChartInstance.Title,
            data: []
        }
        this.attachShadow({ mode: "open" });
    }
    attributeChangedCallBack() {
        //this.DrawChart();
    }
    connectedCallback() {
        //console.log("conected");
        console.trace()
        console.log(this.ChartInstance.Dataset)
        if (this.ChartInstance.Dataset == null || this.ChartInstance.Dataset == undefined || this.ChartInstance.Dataset.length == 0) {
            this.shadowRoot.innerHTML = "No hay datos que mostar";
            return;
        }
        this.shadowRoot.innerHTML = "";
        this.MainChart.children = [];
        this.GroupsData = [];
        this.groupParams = this.ChartInstance.groupParams ?? [];
        this.EvalValue = this.ChartInstance.EvalValue ?? null;
        this.AttNameEval = this.ChartInstance.AttNameEval ?? null;
        this.Dataset = this.ChartInstance.Dataset ?? [];
        this.InitializeDataset();
        this.ChartInstance.Colors = this.ChartInstance.Colors ?? ColorsList;
        if (this.ChartInstance.TypeChart?.toUpperCase() == "STACKED") {// bar or stacked
            this.ChartInstance.DirectionChart = "row";
        } else if (this.ChartInstance.TypeChart?.toUpperCase() == "LINE") {// line
            this.ChartInstance.DirectionChart = "row";
        } else {
            this.ChartInstance.DirectionChart = "row";
        }
        this.DrawChart();
        //console.log(this.ChartTable);
        //console.log(this.ChartInstance.Title);
        //console.table(this.ChartJson.data);
    }
    InitializeDataset() {
        if (this.EvalValue == null && this.Dataset.length != 0) {
            //this.Dataset = WArrayF.GroupByObject(this.Dataset, this.Dataset[0]);
            this.EvalValue = "count";
        }
    }
    DrawChart() {
        this.shadowRoot.append(WRender.createElement(WChartStyle(this.ChartInstance)));
        const object = {};
        if (this.ChartInstance.DirectionChart == "row") {
            object[this.AttNameEval] = "";
        }
        this.groupParams.forEach(element => {
            object[element] = "";
        });
        this.Totals = WArrayF.GroupByObject(this.ChartInstance.Dataset, object, this.EvalValue);


        this.MaxVal = this.ChartInstance.MaxVal ?? WArrayF.MaxValue(this.Totals, this.EvalValue);
        this.MinVal = WArrayF.MinValue(this.Totals, this.EvalValue);
        this.EvalArray = WArrayF.GroupBy(this.ChartInstance.Dataset, this.AttNameEval);
        if (this.ChartInstance.TypeChart?.toUpperCase() == "STACKED") {
            this.EvalArray.forEach(Eval => {
                const stackedValue = WArrayF.SumValAtt(this.Totals.filter(t => t[this.AttNameEval] == Eval[this.AttNameEval]), this.EvalValue);
                if (this.MaxVal < stackedValue) {
                    this.MaxVal = stackedValue
                }
            });
        }
        let ChartFragment = WRender.createElement({ type: 'div', props: { id: '', class: 'WChartContainer' } });
        if (this.ChartInstance.Title) {
            ChartFragment.append(WRender.Create({ tagName: "h3", innerText: this.ChartInstance.Title }))
        }
        ChartFragment.append(this.DrawSeries(this.EvalArray, this.ChartInstance.Colors));
        const SectionBars = WRender.createElement(this._AddSectionBars());
        ChartFragment.append(SectionBars);
        ChartFragment.append(this.DrawGroups());
        this.shadowRoot.append(ChartFragment);
        if (this.ChartInstance.TypeChart == "Line") {
            window.addEventListener("resize", () => {
                SectionBars.querySelector("svg").remove();
                SectionBars.append(this.DrawLineChart(this.EvalArray, this.ChartInstance.Colors, ChartFragment));
            });
            SectionBars.append(this.DrawLineChart(this.EvalArray, this.ChartInstance.Colors, ChartFragment));
        }
    }
    _AddSectionBars(Dataset = this.Dataset) {
        this.groupParams.forEach(groupParam => {
            let object = {};
            object[groupParam] = "";
            this.GroupsData.push(WArrayF.GroupByObject(Dataset, object))
        });
        this.GroupsProcessData = this.ChargeBy(Dataset);
        return this.DrawGroupBars(this.ChargeGroup(this.GroupsData));
    }
    ChargeGroup = (Groups, inicio = 0) => {
        if (!Groups[inicio]) {
            return null;
        }
        let ObjGroup = {
            data: Groups[inicio],
            groupParam: this.groupParams[inicio],
            children: this.ChargeGroup(Groups, inicio + 1),
            //maxVal: WArrayF.MaxValue(Groups[0], this.EvalValue),
            //minVal: WArrayF.MinValue(Groups[0], this.EvalValue),
            //sumValue: WArrayF.SumValue(WArrayF.GroupBy(Groups[0], this.EvalValue) , "count"),
        }
        return ObjGroup;
    }
    ChargeBy = (data, properties = this.groupParams) => {
        //let ObjGroup = Object.groupBy(Groups, (groupData) => groupData[this.groupParams[inicio]]);

        //return ObjGroup;
        if (properties.length === 0) {
            return data;
        }

        const [firstProperty, ...remainingProperties] = properties;

        const groupedData = data.reduce((acc, item) => {
            const key = item[firstProperty];
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(item);
            return acc;
        }, {});

        for (const key in groupedData) {
            groupedData[key] = this.ChargeBy(groupedData[key], remainingProperties);
        }

        return groupedData;
    }
    DrawGroupBars = (Groups, div = this.MainChart, arrayP = {}, GroupIndex = 0) => {
        if (Groups == null) {
            return "";
        }
        Groups.data.forEach((Group) => {
            let trGroup = { type: "GroupSection", props: { class: "GroupSection" }, children: [WArrayF.Capitalize(Group[Groups.groupParam])] };
            let groupBar = {
                type: "containerbar", props: {
                    style: `width: ${100 / (Groups.children?.length ?? 1)}%`, class: "ContainerBars"
                }, children: []
            };
           // let groupBar = html`<div class="groupBar"></div>`
            if (GroupIndex == 0) {
                trGroup.children.push(this.DrawBackgroundLine());
                trGroup.children.push(this.DrawIconsGroups());
            }
            GroupIndex++;
            arrayP[Groups.groupParam] = Group[Groups.groupParam];
            if (Groups.children != null) {
                if (Groups.children.children == null) {
                    trGroup.props.class = "GroupSection";
                }
                this.DrawGroupBars(Groups.children, groupBar, arrayP, GroupIndex);
            } else {
                trGroup.type = "groupbar";
                trGroup.props.class = "groupBars";
                groupBar.props.style = "height: 180px";
                if (this.ChartInstance.TypeChart?.toUpperCase() == "STACKED") {
                    groupBar.props.style = "height: 180px; flex-direction: column;"
                }
                groupBar.children.push(this.DrawBackgroundLine(false));
                if (this.EvalArray != null) {
                    let index = 0;
                    this.EvalArray.forEach(Eval => {
                        arrayP[this.AttNameEval] = Eval[this.AttNameEval];
                        const stackedValue = WArrayF.SumValAtt(this.Totals.filter(t => t[this.AttNameEval]
                            == arrayP[this.AttNameEval]),
                            this.EvalValue);
                        if (this.ChartInstance.TypeChart?.toUpperCase() == "STACKED") {
                            //console.log(stackedValue);
                        }
                        const Data = this.FindData(arrayP);
                        if (Data != "n/a") {
                            groupBar.children.push(this.DrawBar(
                                Data,
                                index,
                                arrayP[this.AttNameEval],
                                // this.ChartInstance.percentCalc == true ? Group.count :
                                this.MaxVal,
                                Group[Groups.groupParam]
                            ));
                        }
                        index++;
                    });
                }
            }
            const gBars = WRender.Create(groupBar);
            if (gBars.querySelectorAll(".Bars").length > 0) {
                trGroup.children.push(groupBar);
                div.children.push(trGroup);
            }

        });
        return div;
    }
    DrawSeries(GroupLabelsData, Colors) {
        var SectionLabels = document.createElement('section');
        var index = 0
        var style = "";
        if (GroupLabelsData.length > 7) {
            style = "font-size:8px;"
        }
        SectionLabels.className = "SectionLabels"
        GroupLabelsData.forEach(element => {
            var color = Colors[index];
            if (!color) {
                Colors.push(GenerateColor());
            }
            if (this.AttNameEval) {
                SectionLabels.appendChild(WRender.CreateStringNode(
                    `<label style="${style}"><span style="background:${Colors[index]}">
                </span>${element[this.AttNameEval]}</label>`
                ));
            }

            index++;
        })
        return SectionLabels;
    }
    DrawBar(DataValue, index, SerieName = "", MaxVal, GroupName = "") {

        var Size = this.ChartInstance.ContainerSize;
        var Size = 180;
        var BarSize = DataValue == "n/a" ? 0 : DataValue / MaxVal;
        var labelCol = DataValue;
        if (this.ChartInstance.percentCalc == true) {
            //dibujar el valor en porcentaje
            var multiplier = Math.pow(10, 1 || 0);
            var number = DataValue / (MaxVal > 0 ? MaxVal : 1) * 100
            number = Math.round(number * multiplier) / multiplier
            labelCol = number + '%';
        }
        const Bars = html`<Bars class="Bars bar${index} ${SerieName.toString().replaceAll(" ", "_")}_${GroupName}"
                name="${SerieName.toString().replaceAll(" ", "_")}"
                style="height:${Size * BarSize}px;background:${this.ChartInstance.Colors[index]}">
                <label>
                    ${labelCol}
                </label>                
            </Bars>`;
        this.ChartTable.appendChild(WRender.Create({
            tagName: "tr", children: [
                { tagName: "td", innerHTML: GroupName },
                { tagName: "td", innerHTML: labelCol }
            ]
        }));
        this.ChartJson.data.push({
            descripcion: GroupName,
            valor: DataValue,
            porcentaje: labelCol
        })

        if (this.ChartInstance.TypeChart == "Line") {
            WRender.SetStyle(Bars, {
                margin: "0px 10px",
                opacity: 0,
                margin: 0,
                padding: 0
            });
        } else {
            Bars.append(css`.bar${index}{  animation: Animatebar${index} 1s forwards;}
                @keyframes Animatebar${index} {
                    0% {  height: 0; }
                    100% { height: ${Size * BarSize}; }
                }`);
        }
        return Bars;
    }
    DrawBackgroundLine(label = true) {
        var countLine = 8;
        var val = parseFloat(this.MaxVal / countLine)
        if (this.ChartInstance.percentCalc == true) {
            countLine = 10
            val = 10;
        }
        var ContainerLine = document.createElement('section');
        ContainerLine.className = "BackGrounLineX";
        var valueLabel = 0;
        for (let index = 0; index < countLine; index++) {
            if (label) {
                ContainerLine.className = "BackGrounLineX BackGrounLineXNumber";
                if (this.ChartInstance.percentCalc == true) {
                    valueLabel = valueLabel + val;
                    ContainerLine.appendChild(WRender.CreateStringNode(
                        `<path class="CharLineXNumber"><label>${valueLabel}%</label></path>`
                    ));
                } else {
                    valueLabel = valueLabel + val;
                    ContainerLine.appendChild(WRender.CreateStringNode(
                        `<path class="CharLineXNumber"><label>${valueLabel.toFixed(1)}</label></path>`
                    ));
                }
            } else {
                if (this.ChartInstance.percentCalc == true) {
                    valueLabel = valueLabel + val;
                    ContainerLine.appendChild(WRender.CreateStringNode(
                        `<path class="CharLineX"></path>`
                    ));
                } else {
                    valueLabel = valueLabel + val;
                    ContainerLine.appendChild(WRender.CreateStringNode(
                        `<path class="CharLineX"></path>`
                    ));
                }
            }

        }
        return ContainerLine;
    }
    DrawIconsGroups = () => {
        const IconsGroup = WRender.createElement({ type: 'div', props: { id: '', class: 'IconsGroup' } })
        this.groupParams.forEach((element, index) => {
            IconsGroup.append(WRender.CreateStringNode(`<div class='IconG' 
            style='background: ${this.IconsGroupColores[index]}'>
            <div/>`));
        });
        return IconsGroup;
    }
    DrawGroups() {
        var SectionLabelGroup = document.createElement('section');
        SectionLabelGroup.className = "SectionLabelGroup";
        this.groupParams.forEach((element, index) => {
            SectionLabelGroup.appendChild(WRender.CreateStringNode(
                `<label><span class="IconG" style="background:${this.IconsGroupColores[index]}"></span>${element}</label>`
            ));
        });
        return SectionLabelGroup;
    }
    FindData(arrayP) {
        let nodes = this.Totals.find(Data => WArrayF.compareObj(arrayP, Data));
        if (nodes) {
            return nodes[this.EvalValue];
        } else {
            return "n/a";
        }
    }
    DrawLineChart = (GroupLabelsData, Colors, ChartFragment) => {
        //this.MainChart.querySelector
        const LineChart = WRender.createElementNS({
            type: "svg",
            props: {
                style: "position:absolute; top: 0; width:100%; height: 100%",
                overflow: "visible"
            }
        });
        var index = 0
        var style = "";
        const BarContainers = ChartFragment.querySelectorAll(`groupbar`);
        BarContainers.forEach(groupBar => {
            //console.log(groupBar);
            //console.log((groupBar.parentNode.offsetWidth - 50) / BarContainers.length);
            //console.log(groupBar.style);
            //groupBar.style.width = ((groupBar.parentNode.offsetWidth - 50) / BarContainers.length) + "px";
            WRender.SetStyle(groupBar.querySelector("containerbar"), {
                justifyContent: "center",
            });
        });
        const containerWid = ChartFragment.offsetWidth + 2000
        GroupLabelsData.forEach(element => {
            var color = Colors[index];
            if (!color) {
                Colors.push(GenerateColor());
            }
            const serie = element[this.AttNameEval].replaceAll(" ", "_");
            const groupName = this.groupParams[this.groupParams.length - 1];
            const groupValue = element[groupName]
            const bars = ChartFragment.querySelectorAll(`bars[name=${serie}]`);
            //const bars = ChartFragment.querySelectorAll(`.${serie}_${groupValue}`); 
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
                }, children: []
            });

            LineChart.append(Path);
            setTimeout(() => {
                LineChart.querySelectorAll(`path[name=${serie}]`).forEach(path => {
                    let M00 = "";
                    let DPropiety = "";
                    let ABar = null;

                    bars.forEach((bar, IndexBars) => {
                        //console.log(serie, bar.dataset);
                        let Cx = 0;
                        if (IndexBars == 0) {
                            M00 = `M ${bar.offsetLeft - 40} ${bar.offsetTop + 2} `
                            DPropiety = DPropiety + ` l 0 0`;
                            Cx = bar.offsetLeft - 40;
                        } else {
                            Cx = bar.offsetLeft - 40;
                            DPropiety = DPropiety + ` l ${bar.offsetLeft - ABar.offsetLeft
                                } ${bar.offsetTop - ABar.offsetTop} `;
                        }
                        ABar = bar;
                        let Circle = WRender.createElementNS({
                            type: "circle",
                            props: {
                                class: "circleLineChart",
                                cx: Cx,
                                cy: bar.offsetTop + 2,
                                r: 5,
                                "stroke-width": 10,
                                fill: color
                            },
                        });
                        LineChart.append(Circle);
                    });
                    path.setAttribute("d", `${M00} ${DPropiety}  m 0 0 z`)
                    path.appendChild(WRender.createElementNS({
                        type: "animate",
                        props: {
                            attributeName: "stroke-dashoffset",
                            from: containerWid,
                            to: "0",
                            dur: "2s",
                            fill: "freeze",
                        }
                    }))
                });
            }, 10);
            index++;
        });
        return LineChart;
    }

}
class RadialChart extends HTMLElement {
    /**
     * 
     * @param {ChartInstance} ChartInstance 
     */
    constructor(ChartInstance = (new ChartConfig())) {
        super();
        this.attachShadow({ mode: "open" });
        this.ChartInstance = ChartInstance;
        // this.Dataset = this.ChartInstance.Dataset ?? [];
        this.EvalValue = this.ChartInstance.EvalValue ?? null;
        this.AttNameEval = this.ChartInstance.AttNameEval ?? null;
        this.ChartInstance.Colors = this.ChartInstance.Colors ?? ColorsList
    }
    attributeChangedCallBack() {
        this.DrawChart();
    }
    connectedCallback() {
        if (this.shadowRoot.innerHTML != "") {
            return;
        }
        this.InitializeDataset();
        this.shadowRoot.append(WRender.createElement(WChartStyle(this.ChartInstance)));
        this.DrawChart();
    }
    InitializeDataset() {
        if (this.EvalValue == null && this.ChartInstance.Dataset?.length != 0) {
            //this.Dataset = WArrayF.GroupByObject(this.Dataset, this.Dataset[0]);
            this.EvalValue = "count";
        }
        this.Dataset = WArrayF.GroupBy(this.ChartInstance.Dataset,
            this.AttNameEval, this.EvalValue);


    }
    DrawChart = async () => {
        if (!this.ChartInstance) {
            this.ChartInstance = new ChartConfig(this.data);
        }
        let ChartFragment = document.createElement("div");
        ChartFragment.className = "WChartContainer WChartContainerRadial";
        if (this.ChartInstance.Title) {
            ChartFragment.append(this._AddSectionTitle(this.ChartInstance.Title));
        }

        ChartFragment.append(this._AddSectionData(this.ChartInstance, WRender.createElementNS));
        ChartFragment.append(
            this.DrawSeries(
                this.Dataset,
                this.ChartInstance.Colors
            )
        );
        this.shadowRoot.append(ChartFragment);
    }
    _AddSectionTitle(Title) {
        var SectionTitle = WRender.CreateStringNode(
            `<h3 style="font-size:18px; margin:0px">${Title}</h3>`
        );
        return SectionTitle;
    }
    DrawSeries(GroupLabelsData, Colors) {
        var SectionLabels = document.createElement('section');
        var index = 0
        var style = "";
        if (GroupLabelsData.length > 7) {
            style = "font-size:8px;"
        }
        SectionLabels.className = "SectionLabels"
        GroupLabelsData.forEach(element => {
            var color = Colors[index];
            if (!color) {
                Colors.push(GenerateColor());
            }
            SectionLabels.appendChild(WRender.CreateStringNode(
                `<label style="${style}"><span style="background:${Colors[index]}">
                </span>${element[this.ChartInstance.AttNameEval]}</label>`
            ));
            index++;
        })
        return SectionLabels;
    }
    _AddSectionData() {
        let SectionChart = document.createElement("section");
        SectionChart.className = "SectionRadialChart";
        const Chart = WRender.createElementNS({
            type: "svg",
            props: {
                viewBox: "0 0 120 120",
            }
        });
        Chart.setAttribute("class", "RadialChart");
        const total = WArrayF.SumValue(this.Dataset, this.EvalValue);
        let index = 0;
        let porcentajeF = 0;
        this.Dataset.forEach((element) => {
            let porcentaje = (element[this.EvalValue] / total) * 100;
            //console.log(porcentaje, this.EvalValue, element[this.EvalValue], total);
            let color = element.color;
            if (this.ChartInstance.Colors) {
                color = this.ChartInstance.Colors[index];
            }
            let Circle = WRender.createElementNS({
                type: "circle",
                props: {
                    class: "circle",
                    cx: 60,
                    cy: 60,
                    r: 54,
                    "stroke-width": "50",
                    stroke: color,
                    //"stroke-linecap": "round"
                },
            });

            //texto
            let degs = (360 * porcentajeF) / 100;
            let degs2 = (((360 * porcentaje) / 100) / 2) - 12;
            //console.log(`translate(0,0),rotate(-${degs + (degs2)})`, element, this.EvalValue);
            let TextSVG = WRender.createElementNS({
                type: "text",
                class: "circleText",
                props: {
                    x: 0,
                    y: 0,
                    fill: "#fff",
                    "dominant-baseline": "middle",
                    "text-anchor": "middle",
                    "font-size": "4",
                    transform: `translate(0,0),rotate(-${degs + (degs2)})`,
                }
            })

            if (this.ChartInstance.percentCalc == true) {
                TextSVG.append(document.createTextNode(porcentaje.toFixed(1) + "%"));
            } else {
                TextSVG.append(document.createTextNode(element[this.EvalValue]?.toFixed(1)));
            }
            let g = WRender.createElementNS({
                type: "g",
                props: {
                    transform: `translate(100, 70), rotate(${degs + (degs2)})`,
                    "transform-origin": "-40px -10px"
                }
            });
            g.append(TextSVG);
            Circle.style.transform = "rotate(" + (360 * porcentajeF) / 100 + "deg)";
            porcentajeF = porcentajeF + porcentaje;
            if (index == this.Dataset.length - 1) {
                this.progressInitial(porcentaje, Circle, 4);
            } else {
                this.progressInitial(porcentaje, Circle);
            }
            if (this.ChartInstance.ChartFunction) {
                Circle.onclick = () => {
                    this.ChartInstance.ChartFunction(element)
                }
            }
            Chart.append(Circle);
            Chart.append(g)
            index++;
        });
        SectionChart.append(Chart);
        index = 0;
        return SectionChart;
    }
    progressInitial2(value, circle, val = 0) {
        let RADIUS = 54;
        let Perimetro = 2 * Math.PI * RADIUS;
        circle.style.strokeDasharray = Perimetro;
        let progress = value / 100;
        let dashoffset = (Perimetro * (1 - progress)) - val;
        circle.style.strokeDashoffset = Perimetro;//dado que es animado este parametro lo define el to 
        circle.appendChild(WRender.createElementNS({
            type: "animate",
            props: {
                attributeName: "stroke-dashoffset",
                //attributeName: "stroke-dasharray",
                from: `${circle.style.strokeDasharray}`,
                to: `${dashoffset < 0 ? 0 : dashoffset -6}`,
                dur: "1s",
                fill: "freeze",
            }
        }))
    }
    progressInitial(value, circle, val = 0) {
    const RADIUS = 54;
    const PERIMETER = 2 * Math.PI * RADIUS;

    // Establecer la longitud total del trazo
    circle.style.strokeDasharray = PERIMETER;

    // Calcular el progreso (proporción del perímetro a cubrir)
    const progress = value / 100;
    const dashoffset = PERIMETER * (1 - progress) - val;

    // Forzar el estado inicial del dashoffset (totalmente oculto)
    circle.style.strokeDashoffset = PERIMETER;

    // Agregar la animación de forma precisa
    circle.appendChild(WRender.createElementNS({
        type: "animate",
        props: {
            attributeName: "stroke-dashoffset",
            from: PERIMETER,
            to: dashoffset < 0 ? 0 : dashoffset,
            dur: "1s",
            fill: "freeze",
        }
    }));
}

}
const GenerateColor = () => {
    var hexadecimal = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
    var color_aleatorio = "#FF";
    for (let index = 0; index < 4; index++) {
        const random = Math.floor(Math.random() * hexadecimal.length);
        color_aleatorio += hexadecimal[random]
    }
    return color_aleatorio
}
const WChartStyle = (ChartInstance) => {
    //console.log(ChartInstance);
    return css`
        .WChartContainer {
            font-size: 12px;
            border: var(--fifty-color) solid 1px;
            padding: 20px 10px;
            overflow: hidden;
            height: calc(100% - 40px);
            display: flex;
            justify-content: center;
            flex-direction: column;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-height: 450px;
            position: relative;
            font-family: Verdana, Geneva, Tahoma, sans-serif;
            box-sizing: border-box;
        }
        .WChartContainerRadial {
            display: grid;
            grid-template-columns: 60% 40%;
            gap: 0px;
        }
        .WChartContainerRadial h3 {
            grid-column: span 2;
        }
        .WChartContainerRadial .SectionLabels {
            flex-direction: column;
            display: flex;
            align-items: flex-start;
            gap: 5px;
            max-width: 300px;
        }

        .WChartContainer h3 {
            color: var(--font-fourth-color);
            font-size: 18px;
            padding-bottom: 10px;
            display: flex;
            margin: 0px;
            justify-content: center;
        }

        .SectionLabels,
        .SectionLabelGroup {
            display: flex;
            justify-content: center;
            align-items: center;
            padding-top: 5px;
            padding-bottom: 5px;
            flex-wrap: wrap;
        }

        .SectionLabels label,
        .SectionLabelGroup label {
            display: flex;
            height: 20px;
            justify-content: center;
            align-items: center;
            font-size: 9px;
            color: var(--font-primary-color);
        }

        .SectionLabels label span,
        .SectionLabelGroup label span {
            min-height: 20px;
            width: 20px;
            content: " ";
            border-radius: 50%;
            display: inline-flex;
            margin: 5px;
        }

        .SectionBars {
            display: flex;
            align-items: flex-end;
            position: relative;
            overflow-x: auto;
            padding-top: 5px;
            padding-left: 40px;
            min-height: 150px;
            border-bottom: solid 1px var(--fifty-color);
        }

        .SectionBars label {
            padding: 5px;
            min-height: 12px;
            max-width: 120px;
            box-sizing: border-box;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;

        }

        .GroupSection {
            display: flex;
            align-items: center;
            height: 100%;
            flex-direction: column-reverse;
            flex-grow: 1;
            border-bottom: solid 1px var(--fifty-color);
            border-top: solid 1px var(--fifty-color);
        }

        .groupBars {
            width: 100%;
            display: flex;
            flex-direction: column-reverse;
            border-left: solid 1px var(--fifty-color);
            align-items: center;
            position: ${ChartInstance.TypeChart == "Line" ? "initial" : "relative"};
        }

        .groupBars:last-child {
            border-right: solid 1px var(--fifty-color);
        }

        .ContainerBars {
            display: flex;
            width: 100%;
            flex-direction: ${ChartInstance.DirectionChart};
            align-items: flex-end;
            justify-content: center;
            overflow: hidden;
            border-bottom: 1px solid var(--fifty-color);
            padding: 0px 10px;
        }

        .ContainerBars .Bars {
            height: 0px;
            transition:all 1s;
            display: block;
            margin-top: 0px;
            min-height: 10px;
            z-index: 1;
            width: ${ChartInstance.TypeChart == "Line" ? "1px" : "50px"};
            background: linear-gradient(0deg, rgba(177, 177, 177, 1) 0%, rgba(209, 209, 209, 1) 53%);           
        }
        

        .Bars label {
            width: 100%;
            text-align: center;
            display: block;
            font-size: 8px;
            margin-top: 1px;
            overflow: hidden;
            color: #fff;
            padding: 0px;
            max-width: unset;
        }

        .BackGrounLineX {
            display: flex;
            position: absolute;
            flex-direction: column-reverse;
            width: 100%;
            height: 180px;
            left: 0px;
            top: 0px;
            right: 0px;
        }

        .groupBars .BackGrounLineXNumber {
            left: ${ChartInstance.TypeChart == "Line" ? 0 : "-40px"};
        }

        .groupBars .IconsGroup {
            left: -25px;
        }

        .CharLineX {
            position: relative;
            border-top: var(--fifty-color) solid 1px;
            height: 100%;
            display: flex;
            align-items: flex-start;
            padding-left: 5PX;
        }

        .CharLineXNumber {
            position: relative;
            border-top: rgba(190, 190, 190, 0) solid 1px;
            height: 100%;
            align-items: flex-start;
            display: flex;
            font-size: 9px;
        }

        .CharLineXNumber label {
            padding: 0px;
            padding-top: 5px;
            width: 35px;
            display: block;
            text-align: right;
            padding-right: 5px;
        }

        .IconsGroup {
            display: flex;
            position: absolute;
            flex-direction: column-reverse;
            width: 100px;
            height: 100%;
            left: 15px;
            border-bottom: 0px;
            right: 0px;
        }

        .IconG {
            height: 16px;
            width: 16px;
            margin: 4px;
            border-radius: 4px !important;
        }

        .circleLineChart {
            cursor: pointer;
        }

        .SectionRadialChart {
            position: relative;
            text-align: center;
            display: block;
            width: 100%;
            max-height: 300px;
        }

        .RadialDataBackground {
            transform: rotate(-90deg);
        }

        .RadialDataBackground:first-child {
            margin-bottom: 20px;
        }

        .RadialData {
            height: 200px;
            width: 200px;
            border-radius: 50%;
            display: block;
            position: absolute;
            top: 0;
            left: calc(50% - 100px);
            margin: auto;
        }

        .RadialData::before {
            content: " ";
            color: #fff;
            height: 200px;
            width: 200px;
            border-radius: 50%;
            display: block;
            position: absolute;
            top: 0;
            left: calc(50% - 100px);
            margin: auto;
            background: linear-gradient(90deg, rgb(12, 109, 148) 50%, rgba(255, 255, 55, 0) 50%);
        }

        .RadialData::after {
            content: " ";
            color: #fff;
            height: 200px;
            width: 200px;
            border-radius: 50%;
            display: block;
            position: absolute;
            top: 0;
            left: calc(50% - 100px);
            margin: auto;
            background: linear-gradient(180deg, rgb(12, 109, 148) 50%, rgba(255, 255, 55, 0) 50%);
        }

        .RadialChart {
            height: 100%;
            max-width: 100%;
        }

        .circle {
            transition: all 0.5s;
            transform-origin: 50% 50%;
            fill: none;
            cursor: pointer;
            clip-path: circle(33% at 50% 50%);
        }

        .circleText {
            transition: all 0.5s;
            height: 100%;
            width: 100%;
            transform-origin: 50% 50%;
        }

        .circle:hover {
            background-color: #999999;
            background-blend-mode: screen;
            z-index: 5;
            clip-path: circle(35% at 50% 50%);
        }

        .progress__meter,
        .progress__value {
            fill: none;
        }

        .progress__meter {
            stroke: #e6e6e6;
        }

        @keyframes dash {
            from {
                stroke-dashoffset: 1000;
            }

            to {
                stroke-dashoffset: 0;
            }
        }`;


}

class GanttChart extends HTMLElement {
    constructor(Config = {}) {
        super();
        this.attachShadow({ mode: 'open' });
        this.Config = Config;
        this.Dataset = Config.Dataset;
        this.groupParams = this.Config.groupParams ?? [];
        this.EvalValue = this.Config.EvalValue ?? null;
        this.AttNameEval = this.Config.AttNameEval ?? null;
        this.Task = WRender.Create({ className: "Task" });
        this.TimeLine = WRender.Create({ className: "TimeLine" });
        this.TaskContainer = WRender.Create({ className: "TaskContainer" });
        this.ChartContainer = WRender.Create({ className: "ChartContainer", children: [this.TimeLine, this.Task, this.TaskContainer] });
        this.shadowRoot.append(this.CustomStyle, this.ChartContainer);
        WRender.SetStyle(this, {
            overflowX: "auto",
            overflowY: "auto",
            width: "100%",
        })
        this.listOfAllDaysSpanish_mini = [
            'DOM', 'LUN', 'MAR', 'MI', 'JUE', 'VIE', 'SAB'
        ];
        this.DrawComponent();

    }
    connectedCallback() {
        this.Animate();
    }
    DrawComponent = async () => {
        this.Task.innerHTML = "";
        this.TaskContainer.innerHTML = "";
        this.TimeLine.innerHTML = "";
        if (this.Dataset == undefined || this.Dataset == null || this.Dataset.length == 0) {
            this.TimeLine.innerHTML = "NO DATA";
            return;
        }
        const min = WArrayF.MinDateValue(this.Dataset, "Fecha_Inicio");
        const max = WArrayF.MaxDateValue(this.Dataset, "Fecha_Finalizacion");
        //console.log(min, max);

        const UN_DIA_EN_MILISEGUNDOS = 1000 * 60 * 60 * 24;
        const INTERVALO = UN_DIA_EN_MILISEGUNDOS //* 7; // Cada semana
        const formateadorFecha = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', });
        const inicio = new Date(min);
        const fin = new Date(max.getTime() + INTERVALO);

        for (let i = inicio; i <= fin; i = new Date(i.getTime() + INTERVALO)) {
            // console.log(formateadorFecha.format(i));
            this.TimeLine.append(WRender.Create({
                id: i.toLocaleDateString(),
                class: "TimeLineBlock",
                children: [i.toISO(), this.listOfAllDaysSpanish_mini[i.getDay()]] //formateadorFecha.format(i)
            }))
        }
        this.TaskContainer.innerHTML = "";
        this.Dataset.forEach(task => {
            const taskDetail = WRender.Create({
                className: "taskDetail",
                innerText: "#" + task.Id_Tarea + " " + task.Titulo
            })
            this.Task.append(taskDetail)
            // console.log(task);
            // console.log(task.Fecha_Inicio, task.Fecha_Finalizacion);
            const taskDiv = WRender.Create({
                className: "taskBlock",
                name: new Date(task.Fecha_Inicio).toLocaleDateString()
                    + "-" + new Date(task.Fecha_Finalizacion).toLocaleDateString(),
                innerText: task.Estado
            })
            this.TaskContainer.append(taskDiv)
        });

    }
    Animate = () => {
        const days = this.TimeLine.querySelectorAll(".TimeLineBlock");
        const task = this.TaskContainer.querySelectorAll(".taskBlock");
        const daysArray = [...days];
        //console.log(daysArray);
        task.forEach(el => {
            //const duration = el.dataset.duration.split("-");
            const duration = el.name.split("-");
            const startDay = duration[0];
            const endDay = duration[1];
            // console.log(el,duration, startDay, endDay);
            let left = 0,
                width = 0;

            if (startDay.endsWith("½")) {
                const filteredArray = daysArray.filter(day => day.id == startDay.slice(0, -1));
                left = filteredArray[0].offsetLeft + filteredArray[0].offsetWidth / 2;
            } else {
                const filteredArray = daysArray.filter(day => day.id == startDay);
                //console.log(filteredArray);
                // console.log(daysArray,filteredArray);
                left = filteredArray[0].offsetLeft;
            }

            if (endDay.endsWith("½")) {
                const filteredArray = daysArray.filter(day => day.id == endDay.slice(0, -1));
                width = filteredArray[0].offsetLeft + filteredArray[0].offsetWidth / 2 - left;
            } else {
                const filteredArray = daysArray.filter(day => day.id == endDay);
                //console.log(daysArray,filteredArray);
                width = filteredArray[0].offsetLeft + filteredArray[0].offsetWidth - left;
            }

            // apply css
            el.style.left = `${left}px`;
            el.style.width = `${width}px`;
            //if (e.type == "load") {
            el.style.backgroundColor = el.innerHTML.includes("Finalizado") ? "#28a745" : "#2c3e50";
            el.style.opacity = 1;
            //}
        });
    }
    CustomStyle = css`
        :root {
            --white: #fff;
            --divider: lightgrey;
            --body: #f5f7f8;
        }

        * {
            padding: 0;
            margin: 0;
            box-sizing: border-box;
        }

        ul {
            list-style: none;
        }

        a {
            text-decoration: none;
            color: inherit;
        }

        body {
            background: var(--body);
            font-size: 16px;
            font-family: sans-serif;
            padding-top: 40px;
        }

        .chart-wrapper {
            max-width: 1150px;
            padding: 0 10px;
            margin: 0 auto;
        }
        .Task , .TaskContainer {
            display: flex;
            flex-direction: column-reverse;
            justify-content: flex-end;
        }
        .taskDetail {
            position: relative;
            color: #fff;
            background-color: #028abc;
            margin-bottom: 10px;
            font-size: 16px;
            border-radius: 5px;
            overflow: hidden;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-transform: lowercase;
            padding: 5px 20px;
            transition: all 0.65s linear 0.2s;
        }
        .taskDetail::first-letter {
            text-transform: uppercase;
         }        

        /* CHART-VALUES
        –––––––––––––––––––––––––––––––––––––––––––––––––– */
        .ChartContainer {
            width: 100%;
            overflow: auto;
            display: grid;
            grid-template-columns: 180px calc(100% - 200px);
            grid-template-rows: 50px auto;
            gap: 10px;
            min-height: 500px;
            height: 100%;
        }
        .TimeLine {
            grid-column: 2/3;
            position: relative;
            display: flex;
            margin-bottom: 20px;
            font-weight: bold;
            font-size: 12px;
        }
        

        .TimeLineBlock {
            display: flex;
            flex: 1;
            grid-column: 2/3;
            min-width: 80px;
            font-size: 12px;
            text-align: center;
            flex-direction: column;
        }

        .TimeLineBlock:not(:last-child) {
            position: relative;
        }

        .TimeLineBlock:not(:last-child)::before {
            content: '';
            position: absolute;
            right: 0;
            height: 510px;
            border-right: 1px solid lightgrey;
            width: 1px;
        }


        /* CHART-BARS
        –––––––––––––––––––––––––––––––––––––––––––––––––– */
        
        .taskBlock {
            position: relative;
            color: #fff;
            margin-bottom: 10px;
            font-size: 16px;
            border-radius: 5px;
            padding: 5px 20px;
            width: 0;
            opacity: 0;
            transition: all 0.65s linear 0.2s;
        }

        @media screen and (max-width: 600px) {
            .taskBlock {
                padding: 10px;
            }
        }


        /* FOOTER
        –––––––––––––––––––––––––––––––––––––––––––––––––– */
        .page-footer {
            font-size: 0.85rem;
            padding: 10px;
            text-align: right;
            color: var(--black);
        }

        .page-footer span {
            color: #47008a;
        }
    `
}
customElements.define("w-radial-chart", RadialChart);
customElements.define("w-colum-chart", ColumChart);
customElements.define("w-gantt-chart", GanttChart);
export { RadialChart, ColumChart, GanttChart }