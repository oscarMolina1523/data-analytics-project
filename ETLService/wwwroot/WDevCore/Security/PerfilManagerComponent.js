
//@ts-check
import { StylesControlsV2, StylesControlsV3 } from "../StyleModules/WStyleComponents.js";
import { ModalMessage } from "../WComponents/ModalMessage.js";
import { ModalVericateAction } from "../WComponents/ModalVericateAction.js";
import { WFilterOptions } from '../WComponents/WFilterControls.js';
import { WModalForm } from "../WComponents/WModalForm.js";
import { WTableComponent } from "../WComponents/WTableComponent.js";
import { ComponentsManager, WRender } from '../WModules/WComponentsTools.js';
import { Tbl_Profile } from './Tbl_Profile.js';

const OnLoad = async () => {
    // @ts-ignore
    Aside.append(WRender.Create({ tagName: "h3", innerText: "Administración de perfiles" }));
    const AdminPerfil = new PerfilManagerComponent();
    // @ts-ignore
    Aside.append(AdminPerfil.MainNav);
    // @ts-ignore
    Main.appendChild(AdminPerfil);
}
window.onload = OnLoad;
class PerfilManagerComponent extends HTMLElement {
    /**
    * @param {Array<Tbl_Profile>} [Dataset] 
    */
    constructor(Dataset) {
        super();
        this.updateDataset(Dataset);
        this.Dataset = Dataset;
        this.attachShadow({ mode: 'open' });
        this.shadowRoot?.append(StylesControlsV2.cloneNode(true), StylesControlsV3.cloneNode(true));
        this.TabContainer = WRender.createElement({ type: 'div', props: { class: "content-container", id: "TabContainer" } });
        this.TabManager = new ComponentsManager({ MainContainer: this.TabContainer });
        this.OptionContainer = WRender.Create({ className: "OptionContainer" });
        this.OptionContainer2 = WRender.Create({ className: "OptionContainer" });
        this.ModelObject = new Tbl_Profile({});
        this.Draw();
    }
    updateDataset(Dataset) {
        Dataset?.forEach(d => {
            d.Tbl_Dependencias_Usuarios = d.Tbl_Dependencias_Usuarios?.map(dp => ({
                Id_Dependencia: dp.Cat_Dependencias.Id_Dependencia,
                Descripcion: dp.Cat_Dependencias.Descripcion
            }));
            d.Tbl_Servicios_Profile = d.Tbl_Servicios_Profile?.map(dp => dp.Tbl_Servicios);
        });
    }
    connectedCallback() { }
    Draw = async () => {
        this.OptionContainer.append(WRender.Create({ tagName: 'input', type: 'button', className: 'Block-Alert', value: 'Gestión de perfiles', onclick: this.perfilManagerComponent }))
        this.UserActions.forEach(element => {
            this.OptionContainer2.append(WRender.Create({
                tagName: 'input', type: 'button', className: 'Btn',
                value: element.name, onclick: element.action
            }))

        });
        this.shadowRoot?.append(this.OptionContainer, this.TabContainer);
        this.perfilManagerComponent();
    }

    perfilManagerComponent = async () => {
        this.mainTable = new WTableComponent({
            Dataset: this.Dataset,
            AddItemsFromApi: true,
            AutoSave: true,
            ModelObject: this.ModelObject, CustomStyle: StylesControlsV2,
            Options: {
                MultiSelect: true,
                Show: true,
                Edit: true,
                Filter: true,
            }
        });
        /*this.FilterOptions = new WFilterOptions({
            // @ts-ignore
            Dataset: this.Dataset,
            AutoSetDate: true,
            ModelObject: this.ModelObject,
            FilterFunction: (DFilt) => {
                this.mainTable?.DrawTable(DFilt);
            }
        });*/
        this.TabManager.NavigateFunction("Tab-perfil-Manager",
            WRender.Create({
                className: "perfilView", children:
                    [this.OptionContainer2, this.mainTable]
            }));
    }
    update = async () => {
        const Dataset = await new Tbl_Profile().Get();
        this.updateDataset(Dataset);
        this.Dataset = Dataset;
        // @ts-ignore
        this.mainTable.selectedItems = [];
        this.mainTable?.DrawTable(this.Dataset);
    }
    UserActions = [{
        name: "Asignar a dependencia", action: async () => {
            // @ts-ignore
            if (this.mainTable.selectedItems.length <= 0) {
                this.shadowRoot?.append(ModalMessage("Seleccione perfiles"));
                return;
            }
            //const dependencias = await new Cat_Dependencias().Get();
            const modal = new WModalForm({
                ModelObject: new Tbl_Profile({
                    Nombres: { type: "text", hidden: true },
                    Apellidos: { type: "text", hidden: true },
                    FechaNac: { type: "text", hidden: true },
                    Sexo: { type: "text", hidden: true },
                    Foto: { type: "text", hidden: true },
                    DNI: { type: "text", hidden: true },
                    Correo_institucional: { type: "text", hidden: true },
                    Estado: { type: "text", hidden: true },                  
                }), ObjectOptions: {
                    SaveFunction: async (profile) => {
                        this.shadowRoot?.append(ModalVericateAction(async () => {
                            const response =
                                // @ts-ignore
                                await new Tbl_Profile().AsignarDependencias(this.mainTable?.selectedItems,
                                    profile.Tbl_Dependencias_Usuarios);
                            if (response.status == 200) {
                                this.shadowRoot?.append(ModalMessage("Asignación Correcta"));
                                this.update();
                            } else {
                                this.shadowRoot?.append(ModalMessage("Error"));
                            }
                            modal.close();
                        }, "Esta seguro que desea asignar a esta dependencia"))
                    }
                }
            });
            this.shadowRoot?.append(modal);
        }
    }
    ]

    mapCaseToPaginatorElement(Dataset) {
        return Dataset.map(actividad => {
            actividad.Dependencia = actividad.Cat_Dependencias.Descripcion;
            //actividad.Progreso = actividad.Tbl_Tareas?.filter(tarea => tarea.Estado?.includes("Finalizado")).length;
            //return this.perfilElement(actividad);
        });
    }
}

customElements.define('w-perfil-manager-component', PerfilManagerComponent);
export { PerfilManagerComponent };


