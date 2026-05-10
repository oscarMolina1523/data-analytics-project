import { WRender, ComponentsManager } from '../../WDevCore/WModules/WComponentsTools.js';
import { WCssClass, WStyledRender } from '../../WDevCore/WModules/WStyledRender.js';
import { WCardCarousel, WCard } from '../../WDevCore/WComponents/WCardCarousel.js';
import { StylesControlsV2 } from "../../WDevCore/StyleModules/WStyleComponents.js";
import "../../WDevCore/WComponents/WTableComponent.js";
import { ChargeInvestigacion } from '../Home.js';
import {WArrayF} from "../WModules/WArrayF.js";
import {WAjaxTools} from "../WModules/WAjaxTools.js";

class WProfileInvestigador extends HTMLElement {
    constructor(response, Options = {}) {
        super();
        this.attachShadow({ mode: 'open' });
        this.id = "ProfileInvestigador";
        const Card = new WCard({
            titulo: `${response.Nombres} ${response.Apellidos}`,
            picture: response.Foto,
            subtitulo: "",
            descripcion: response.NombreInstitucion,
            Id_Perfil: response.Id_Perfil
        }, 2);
        this.Options = Options;
        this.response = response;
        this.ProfileContainer = WRender.createElement({ type: 'div', props: { class: 'ProfileContainer' } });
        this.ProfileContainer.append(Card);
        this.ProfileContainer.append(new ProfileCard(response));
        this.TabContainer = WRender.createElement({ type: 'div', props: { class: "content-container", id: "TabContainer" } });
        this.TabManager = new ComponentsManager({ MainContainer: this.TabContainer });
        this.shadowRoot.appendChild(WRender.createElement(StylesControlsV2));
        this.append(new WStyledRender({
            ClassList: [
                new WCssClass(`w-view-profile`, {
                    "background-color": '#fff',
                    margin: 10,
                    display: "block",
                    "box-shadow": "0 0 4px 0 rgb(0,0,0,40%)",
                    "border-radius": "0.3cm"
                }), new WCssClass(`.ResumenContainer`, {
                    //"background-color": '#fff',
                    "border-radius": "0.2cm",
                    padding: 20,
                    //"box-shadow": "0 0 4px 0 rgb(0,0,0,40%)",
                    display: "flex",
                    "flex-direction": "column"
                }), new WCssClass(`.ResumenContainer label`, {
                    "background-color": '#eee',
                    padding: 10,
                    margin: 5,
                    "border-radius": "0.3cm"
                })]
        }))
        this.ComponentTab = WRender.createElement({
            type: "w-app-navigator",
            props: {
                NavStyle: "tab",
                id: "GuidesNav",
                title: "Menu",
                Inicialize: true,
                Elements: this.TabElements()
            }
        });
        const BtnReturn = WRender.Create({
            className: "GroupOptions", children: [{
                tagName: 'input', type: 'button', className: 'BtnSuccess BtnReturn', value: 'Regresar', onclick: async () => {
                    this.Options.DOMManager.Back();
                }
            }]
        })
        this.shadowRoot.append(BtnReturn, WRender.createElement(this.styleComponent), this.ProfileContainer, this.ComponentTab, this.TabContainer);
    }
    connectedCallback() {
    }
    DrawComponent = async () => {
    }
    TabElements = () => {
        const tabElements = [
            {
                name: "Investigaciones", url: "#",
                action: async (ev) => {
                    this.TabManager.NavigateFunction("Tab-Investigaciones", new ProfileTab(
                        this.response.Investigaciones,
                        ["Titulo", "Fecha_ejecucion", "Estado"], "Investigaciones",
                        this.Options.DOMManager
                    ), "TabContainer");
                }
            }, {
                name: "Colaboraciones", url: "#",
                action: async (ev) => {
                    this.TabManager.NavigateFunction("Tab-Colaboraciones", new ProfileTab(
                        this.response.Tbl_Colaboradores?.map(c => {
                            return {
                                Titulo: c.Tbl_Investigaciones?.Titulo,
                                TipoColaboracion: c.Cat_Tipo_Colaborador?.Descripcion,
                                Fecha_ejecucion: c.Tbl_Investigaciones?.Fecha_ejecucion
                            }
                        }),
                        ["Titulo", "TipoColaboracion", "Fecha_ejecucion"], "Colaboraciones",
                        this.Options.DOMManager
                    ), "TabContainer");
                }
            }, {
                name: "Proyectos", url: "#",
                action: async (ev) => {
                    this.TabManager.NavigateFunction("Tab-Proyectos", new ProfileTab(
                        this.response.Tbl_Servicios?.map(c => {
                            return {
                                Nombre_Proyecto: c.Proyecto.Nombre_Proyecto,
                                Cargo: c.Cargo.Descripcion,
                                Estado: c.Proyecto.Estado
                            }
                        }),
                        ["Nombre_Proyecto", "Cargo", "Estado"], "Proyectos",
                        this.Options.DOMManager
                    ), "TabContainer");
                }
            }
        ];
        if (this.Options.DatosLaborales) {
            tabElements.unshift({
                name: "Datos Laborales", url: "#",
                action: async (ev) => {
                    this.TabManager.NavigateFunction("Tab-DatosLaborales", new ProfileTab(
                        this.response.DatosLaborales,
                        ["Unidad", "Institucion", "Fecha_Inicio", "Fecha_Finalizacion"], "none"
                    ), "TabContainer");
                }
            });
        }
        if (this.Options.FormacionAcademica) {
            tabElements.unshift({
                name: "Formación Académica", url: "#",
                action: async (ev) => {
                    this.TabManager.NavigateFunction("Tab-Formacion", new ProfileTab(
                        this.response.FormacionAcademica,
                        ["Disciplina", "Id_Cargo", "Fecha_Inicio", "Fecha_Finalizacion"], "none",
                        this.Options.DOMManager
                    ), "TabContainer");
                }
            });
        }
        return tabElements;
    }
    styleComponent = {
        type: 'w-style', props: {
            ClassList: [
                new WCssClass(`.ProfileContainer`, {
                    display: 'grid',
                    "grid-template-columns": "270px auto",
                    "border-bottom": "solid 2px #bbbec1",
                    "padding-bottom": 10,
                    "margin-bottom": 20,
                }), new WCssClass(`.DataContainer`, {
                    display: 'flex',
                    "flex-direction": "column",
                    padding: "20px"
                }), new WCssClass(` h3`, {
                    margin: "5px 10px",
                    color: "#09315f"
                }), new WCssClass(`.DataContainer label`, {
                    margin: "5px 10px",
                }), new WCssClass(`.divIdiomas`, {
                    display: 'flex',
                    "flex-wrap": "wrap"
                }), new WCssClass(`.divIdiomas label`, {
                    padding: 8,
                    margin: "5px 2px",
                    "background-color": "#5964a7",
                    color: "#fff",
                    "font-weight": "bold",
                    "border-radius": "0.4cm",
                    "font-size": 12
                }), new WCssClass(`.divRedes img`, {
                    height: 35,
                    width: 35,
                    "margin-right": 10
                }), new WCssClass(`.divRedes div`, {
                    display: "flex",
                    "align-items": "center",
                    "justify-content": "left",
                    margin: 5
                }), new WCssClass(`.divRedes a`, {
                    "text-decoration": "none",
                    "font-weight": "bold",
                    color: "#09f"
                })
            ], MediaQuery: [{
                condicion: "(max-width: 800px)",
                ClassList: [
                    new WCssClass(`.ProfileContainer`, {
                        display: 'grid',
                        "grid-template-columns": "100%"
                    })
                ]
            }]
        }
    };
}
class ProfileTab extends HTMLElement {
    constructor(Dataset = [], DisplayData = [], name, DOMManager) { 
        super();
        let urlAction;
        let idAction;
        let action = true;
        switch (name) {
            case "Investigaciones":
                idAction = "Id_Investigacion";
                break;
            case "Proyectos":
                idAction = "Id_Servicio";
                break;
            case "Colaboraciones":
                idAction = "Id_Investigacion";
                break;
            default:
                action = false;
                break;
        }
        this.append(WRender.createElement(this.Style));
        if (Dataset.length != 0) {
            var TableConfigG = {
                Dataset: Dataset,
                Colors: ["#ff6699", "#ffbb99", "#adebad"],
                DisplayData: DisplayData,
                Options: {
                    Search: true,
                    UserActions: []
                }
            };
            if (action) {
                TableConfigG.Options.UserActions.push({
                    name: "Leer..", action: (element) => {                        
                        switch (idAction) {
                            case "Id_Investigacion":
                                ChargeInvestigacion(element, DOMManager)
                                break;
                            case "Id_Servicio":
                                break;
                        }                       
                    }
                });
            } else {
                TableConfigG.Options = {}
            }
            const WTableReport = WRender.createElement({
                type: "w-table",
                props: {
                    id: "TableId",
                    TableConfig: TableConfigG
                }
            });
            this.append(WTableReport);
        } else {
            this.append("No Data!");
        }      
    }
    Style = {
        type: "w-style",
        props: {
            ClassList: [
                new WCssClass(".TabContainer", {
                    padding: 10,
                })
            ], MediaQuery: [{
                condicion: '(max-width: 1200px)',
                ClassList: [
                    new WCssClass(".GuidesContainer", {
                        "grid-template-columns": "50% 50%"
                    }),
                ]
            }]
        }
    };
}
class ProfileCard extends HTMLElement {
    constructor(response) {
        super();
        this.container = WRender.Create({ className: "cont" });
        this.DraProfileCard(response);
        this.append(this.container);
    }
    connectedCallback() { }
    DraProfileCard = async (response) => {
        this.container.innerHTML = "";
        const divIdiomas = WRender.createElement({ type: 'div', props: { id: '', class: 'divIdiomas' } });
        response.Tbl_IdiomasInv?.forEach(element => {
            divIdiomas.append(WRender.createElement(element.Idioma?.Descripcion ?? element.Descripcion));
        });
        this.container.append(WRender.Create({
            tagName: 'div', class: 'DataContainer', children: [
                WRender.CreateStringNode("<h3>Datos Generales</h3>"),
                "Estado: " + response.Estado,
                "Sexo: " + response.Sexo,
                "Correo: " + response.Correo_institucional,
                WRender.CreateStringNode("<h3>Idiomas</h3>"),
                divIdiomas
            ]
        }));
    }
}
customElements.define('w-profile-tab', ProfileTab);
customElements.define('w-profile-card', ProfileCard);
customElements.define('w-view-profile', WProfileInvestigador);
export { WProfileInvestigador, ProfileTab, ProfileCard }