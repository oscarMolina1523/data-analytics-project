//@ts-check
import { StylesControlsV2 } from "../StyleModules/WStyleComponents.js";
import { html, WRender } from "../WModules/WComponentsTools.js";
import { WSecurity } from "../Security/WSecurity.js";
import { css, WCssClass } from "../WModules/WStyledRender.js";
import { WAlertMessage } from "../WComponents/WAlertMessage.js";

const OnLoad = async () => {

    //WAlertMessage.Info("TEST")
    //WAlertMessage.Warning("ALERT")
    //WAlertMessage.Success("ALERT")
    //WAlertMessage.Danger("ALERT")
    const UserData = {
        mail: "",
        password: ""
    }
    // @ts-ignore
    await App.append(html`<link rel="stylesheet" href="/WDevCore/Security/Styles/style.css" />`);
    setTimeout(() => {
        const LoginForm = GetLoginLayout(WRender.Create({
            className: "sign-in-form", children: [
                //WRender.Create({ tagName: "style", innerHTML: '@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700;800&display=swap");' }),
                //StylesControlsV2.cloneNode(true),
                MasterStyle,
                //{ tagName: 'img', src: "/Media/img/logo.png", class: 'className' },
                { tagName: 'h3', innerText: "Inicio de sesión", class: 'title' },
                {
                    class: "input-field", children: [
                        html`<img src="/WDevCore/Security/Styles/img/user.png" class="image-field" alt="" />`, {
                            tagName: 'input', type: 'text', placeholder: 'Correo', onchange: (ev) => {
                                UserData.mail = ev.target.value;
                            }
                        }]
                }, {
                    class: "input-field", children: [
                        html`<img src="/WDevCore/Security/Styles/img/key.png" class="image-field" alt="" />`, {
                            tagName: 'input', type: 'password', placeholder: 'Contraseña', onchange: (ev) => {
                                UserData.password = ev.target.value;
                            }
                        }]
                }, {

                    tagName: 'input', type: 'button', className: 'btn solid', value: 'Ok',
                    onclick: async () => WSecurity.Login(UserData)

                }, {
                    children: [{
                        tagName: 'a', innerText: 'Recuperar contraseña', href: "/Security/RecoveryPassword"
                    }]
                }
            ]
        }), html`<form></form>`)
        // @ts-ignore
        App.appendChild(LoginForm);
    }, 300);


}
/**
* @param {HTMLElement} loginForm 
* @param {HTMLElement} registerForm 
* @returns {HTMLElement}
*/
const GetLoginLayout = (loginForm, registerForm) => {
    const loginLayout = html`<div class="container">        
        <div class="forms-container">
            <div class="signin-signup" id="container">                
                    <!--<div action="#"  class="sign-in-form"> <h2 class="title">Sign in</h2><div class="input-field">
                    <i class="fas fa-user"></i>
                    <input type="text" placeholder="Username" />
                    </div>
                    <div class="input-field">
                    <i class="fas fa-lock"></i>
                    <input type="password" placeholder="Password" />
                    </div>
                    <input type="submit" value="Login" class="btn solid" />
                    <p class="social-text">Or Sign in with social platforms</p>
                    <div class="social-media">
                    <a href="#" class="social-icon">
                    <i class="fab fa-facebook-f"></i>
                    </a>
                    <a href="#" class="social-icon">
                    <i class="fab fa-twitter"></i>
                    </a>
                    <a href="#" class="social-icon">
                    <i class="fab fa-google"></i>
                    </a>
                    <a href="#" class="social-icon">
                    <i class="fab fa-linkedin-in"></i>
                    </a>
                    </div> </div></h2> 
                
                <form action="#" class="sign-up-form">
                    <h2 class="title">Sign up</h2>
                    <div class="input-field">
                        <i class="fas fa-user"></i>
                        <input type="text" placeholder="Username" />
                    </div>
                    <div class="input-field">
                        <i class="fas fa-envelope"></i>
                        <input type="email" placeholder="Email" />
                    </div>
                    <div class="input-field">
                        <i class="fas fa-lock"></i>
                        <input type="password" placeholder="Password" />
                    </div>
                    <input type="submit" class="btn" value="Sign up" />
                    <p class="social-text">Or Sign up with social platforms</p>
                    <div class="social-media">
                        <a href="#" class="social-icon">
                            <i class="fab fa-facebook-f"></i>
                        </a>
                        <a href="#" class="social-icon">
                            <i class="fab fa-twitter"></i>
                        </a>
                        <a href="#" class="social-icon">
                            <i class="fab fa-google"></i>
                        </a>
                        <a href="#" class="social-icon">
                            <i class="fab fa-linkedin-in"></i>
                        </a>
                    </div>
                </form>-->
            </div>
        </div>

        <div class="panels-container">
            <div class="panel left-panel">
                <div class="content">
                    <img class="logo" src="/Media/img/logo.png"/>
                    <h3>${localStorage.getItem("TITULO")}</h3>
                    <p>
                        ${localStorage.getItem("SUB_TITULO")}
                    </p>
                    <!-- <button class="btn transparent" id="sign-up-btn">
                        Sign up
                    </button> -->
                </div>
                <img src="/WDevCore/Security/Styles/img/log.svg" class="image" alt="" />
            </div>
            <div class="panel right-panel">
                <div class="content">
                    <h3>One of us ?</h3>
                    <p>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
                        laboriosam ad deleniti.
                    </p>
                    <button class="btn transparent" id="sign-in-btn">
                        Sign in
                    </button>
                </div>
                <img src="/WDevCore/Security/Styles/img/register.svg" class="image" alt="" />
            </div>
        </div>
    </div>`;
    loginLayout.querySelector("#container")?.append(loginForm);
    return loginLayout;

}
const Icons = {
    SNI: "data:image/png;base64,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",
}
const MasterStyle = css`
       /* body {
            font-family: "Poppins", sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 90vh;
        }

        .LoginForm {
            width: 450px;
            overflow: hidden;
            padding: 30px;
            box-shadow: 0 0 2px rgba(0, 0, 0, 0.4);
            border-radius: 30px;
            display: flex;
            justify-content: center;
            flex-direction: column;
            align-items: center;
        }

        .LoginForm div {
            width: 100%;
            text-align: center;
            margin-bottom: 10px;
            margin-top: 10px;
        }

        img {
            display: block;
            width: 50%;
        }

        @media (max-width: 800px) {
            .LoginForm {
                box-shadow: none;
            }
        }*/
        `;
window.onload = OnLoad;