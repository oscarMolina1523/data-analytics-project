import { WRender, html } from "../WModules/WComponentsTools.js";
import { WArrayF } from "../WModules/WArrayF.js";

class ControlBuilder {
  static BuildImage(value = "", urlPath) {
    let cadenaB64 = "";
    var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    if (base64regex.test(WArrayF.replacer("data:image/png;base64,", ""))) {
      cadenaB64 = !value.includes("data:image/png;base64,") ? "data:image/png;base64," : "";
    } else if (urlPath != undefined && urlPath != "") {
      cadenaB64 = urlPath + "/";
    }
    const image = WRender.createElement({
      type: "img",
      props: {
        src: cadenaB64 + value,
        class: "imgPhoto",
        height: 50,
        width: 50
      }
    });
    return image;
  }
  static BuildProgressBar(value = 0, total = 100, barColor = "#b7b7b7cc", progressColor = "#3576bb") {
    return new ProgessBar(value, total, barColor, progressColor);
  }
  /**
 * @param {{ action: () => void, Dataset: []}} action
 */
  static BuildSearchInput(config) {
    if (config.action == null && config.Dataset != null) {

    }
    return html`<div class="search-box" >
         <input type="text" class="form-control rounded border" onchange="${(ev) => { config.action(ev.target.value) }}" placeholder="Buscar...">
         <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24">
             <g data-name="Layer 2"><g data-name="search">
                 <rect width="24" height="24" opacity="0"></rect>
                 <path d="M20.71 19.29l-3.4-3.39A7.92 7.92 0 0 0 19 11a8 8 0 1 0-8 8 7.92 7.92 0 0 0 4.9-1.69l3.39 3.4a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42zM5 11a6 6 0 1 1 6 6 6 6 0 0 1-6-6z"></path>
             </g></g>
         </svg>
         <style>     
            .search-box {
              height: 35px;
              position: relative;
              display: flex;
              & input {
                height: 32px;
                width: 100%;
                border-radius: 20px;
                border: solid 1px #c5c1c1;
              }
              & input:active, & input:focus  {
                outline: none;
                box-shadow: 0 0 2px 0 #06a3ec;
              }
            }
            .search-box input{              
              padding-left: 40px !important;
            }
            .search-box svg{
              position: absolute;
              top: 5px;
              left: 5px;
              fill: #858585;
            }
         </style>
     </div>`
  }
}
export { ControlBuilder }

class ProgessBar extends HTMLElement {
  constructor(value = 0, total = 100, barColor = "#b7b7b7cc", progressColor = "#3551bb") {
    super();
    this.attachShadow({ mode: 'open' });
    //this.shadowRoot?.append(this.CustomStyle);
    this.Draw(value, total, barColor, progressColor);
  }
  connectedCallback() { }

  update() {
    this.Draw();
  }
  Draw(value = 0, total = 100, barColor = "#b7b7b7cc", progressColor = "#3551bb") {
    this.shadowRoot.append(html`<div class="progressDivContainer">
        <div class="progressDiv">        
          <div class="progress" style="">
            <h3>${(value / (total > 0 ? total : 1) * 100).toFixed(2)}%</h3>     
          </div>
        </div>       
        <style>        
          .progressDivContainer{
            position: relative; width: 100%;  height: auto;  margin: 0px 0px; display: flex;
          }          
          .progressDivContainer > .progressDiv{
            width: 100%;  height: 20px;  background: ${barColor}; overflow: hidden; border-radius: 15px;
          }          
          .progressDivContainer > .progressDiv > .progress{
            height: 20px;  background: ${progressColor}; border-radius: 15px; text-align: center; animation: progress 1s forwards; width: 0px
          }          
          .progress  h3{
            margin: 4px 10px; font-size: 12px; font-family: sans-serif; color: #fff; position: absolute; top: 0
          }
          @keyframes progress {
            to {
              width:${(value / (total > 0 ? total : 1) * 100).toFixed(2)}%;
            }
          }
        </style>
      </div>`);
  }
}

customElements.define('w-progress-bar', ProgessBar);

export { ProgessBar }