
//@ts-check
import { PerfilManagerComponent } from './PerfilManagerComponent.js';
import { Tbl_Profile } from './Tbl_Profile.js';

const OnLoad = async () => {
    const Dataset = await new Tbl_Profile().Get();
    const ProfilesComp = new PerfilManagerComponent(Dataset);
    // @ts-ignore
    Main.appendChild(ProfilesComp);
}
window.onload = OnLoad;