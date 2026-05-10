//@ts-check

import { html, loadExternalResources, WRender } from "../../WModules/WComponentsTools.js";
import { css } from "../../WModules/WStyledRender.js";
import { markdownDeps } from "./Dependencys.js";

const pathRoute = window.location.origin + "/UI/wwwroot/WDevCore/WSite/";
class Layout extends HTMLElement {
    /**
     * @typedef {Object} ComponentsConfig 
        * @property {Function} [action] objeto
    **/
    /**
    * @param {ComponentsConfig} Config 
    */
    constructor(Config) {
        super();
        this.Config = Config;
        this.asideContent = html`<main id="asideContent" class="Main-asideContent"></main>`
        this.content = html`<main id="content" class="Main-content"></main>`
    }
    async connectedCallback() {
        // @ts-ignore
        this.items = Array.from(this.children).map(child => child);
        // @ts-ignore
        this.content.append(...this.items);
        await this.Draw();

        // Carga idempotente y concurrente
        // @ts-ignore
        await loadExternalResources(markdownDeps);

        if (this.Config?.action) {
            this.Config.action();
        }

        window.addEventListener('scroll', this.handleScroll);
    }
    disconnectedCallback() {
        window.removeEventListener('scroll', this.handleScroll);
    }
    handleScroll = () => {
        const header = this.querySelector('.site-header');
        if (!header) return;

        const scrollY = window.scrollY;
        const isScrolled = scrollY > 80; // puedes ajustar el umbral

        header.classList.toggle('scrolled', isScrolled);
    };
    Draw = async () => {
        const elements = html`<header class="site-header background-section">
            <link rel="stylesheet" href="${pathRoute}/css/site.css">
            ${this.CustomStyle}
            <nav class="main-nav">
                <a href="${pathRoute}/index.html">Inicio</a>
                <a href="${pathRoute}/index.html#services">Servicios</a>
                <a href="${pathRoute}/index.html#proyects">Proyectos</a>
                <a href="${pathRoute}/index.html#footer">Contactos</a>
            </nav>
            <div class="banner-header">
                <img src="${pathRoute}/Media/devcoreLogo2025-04.png" alt="" class="logo" />
                <div id="comp-kk2ojdm5">
                    <h1 class="font_0 wixui-rich-text__text" style="font-size:50px; line-height:1.2em;">
                        <span style="letter-spacing:normal;">
                            <span style="font-size:50px;">El nuevo estándar</span>
                        </span>
                    </h1>
                    <p style="line-height:normal; font-size:30px;">
                        <span style="letter-spacing:normal;">Usa
                            los datos para una
                            visión de 360 grados de
                            tu negocio</span>
                    </p>
                    <div><a>Más información</a></div>
                </div>
            </div>
        </header>
        ${this.asideContent}
        ${this.content}
        <footer class="main-footer" id="footer">
            ${this.footer()}
            <div class="footer-data">
                <label for="">wexpdev@outlook.com</label>
                <label for="">+505 8807 8386</label>
            </div>
        </footer>`;
        this.asideContent.append(html`<h1>Componentes</h1>`);

        this.asideContent.append(html`<h2>Introducción</h2>`);
        buildLinks("WDevCoreSite/Examples/", ["RenderizadoDinamico"],
            this.asideContent);

        this.asideContent.append(html`<h2>Form Components</h2>`);
        buildLinks("WDevCoreSite/Examples/", ["WForm",
            "Basic_Table",
            "DocumentViewer",
            "ReportComponent", "WRichText"],
            this.asideContent);


        this.asideContent.append(html`<h2>Componentes Analiticos</h2>`);
        buildLinks("WDevCoreSite/Examples/AnaliticComponents/", ["Bar_Charts", "Dinamic_Table", "Radial_Charts"],
            this.asideContent);

        // @ts-ignore
        this.append(...elements)
    }
    footer = () => {
        return html`<div class="social-media-links">
            <ul>
                <li>
                    <!-- twitter -->
                    <a href="#">
                        <svg class="glow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
                    <path class="st0"
                        d="M9.5 27.1c11.2 0 17.4-9.3 17.4-17.4 0-0.3 0-0.5 0-0.8 1.2-0.9 2.2-1.9 3-3.2 -1.1 0.5-2.3 0.8-3.5 1 1.3-0.8 2.2-2 2.7-3.4 -1.2 0.7-2.5 1.2-3.9 1.5 -1.1-1.2-2.7-1.9-4.5-1.9 -3.4 0-6.1 2.7-6.1 6.1 0 0.5 0.1 0.9 0.2 1.4C9.7 10.1 5.2 7.7 2.2 4 1.7 4.9 1.4 6 1.4 7.1c0 2.1 1.1 4 2.7 5.1 -1 0-1.9-0.3-2.8-0.8 0 0 0 0.1 0 0.1 0 3 2.1 5.4 4.9 6 -0.5 0.1-1.1 0.2-1.6 0.2 -0.4 0-0.8 0-1.1-0.1 0.8 2.4 3 4.2 5.7 4.2 -2.1 1.6-4.7 2.6-7.6 2.6 -0.5 0-1 0-1.5-0.1C2.8 26.1 6 27.1 9.5 27.1" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
                    <path class="st0"
                        d="M9.5 27.1c11.2 0 17.4-9.3 17.4-17.4 0-0.3 0-0.5 0-0.8 1.2-0.9 2.2-1.9 3-3.2 -1.1 0.5-2.3 0.8-3.5 1 1.3-0.8 2.2-2 2.7-3.4 -1.2 0.7-2.5 1.2-3.9 1.5 -1.1-1.2-2.7-1.9-4.5-1.9 -3.4 0-6.1 2.7-6.1 6.1 0 0.5 0.1 0.9 0.2 1.4C9.7 10.1 5.2 7.7 2.2 4 1.7 4.9 1.4 6 1.4 7.1c0 2.1 1.1 4 2.7 5.1 -1 0-1.9-0.3-2.8-0.8 0 0 0 0.1 0 0.1 0 3 2.1 5.4 4.9 6 -0.5 0.1-1.1 0.2-1.6 0.2 -0.4 0-0.8 0-1.1-0.1 0.8 2.4 3 4.2 5.7 4.2 -2.1 1.6-4.7 2.6-7.6 2.6 -0.5 0-1 0-1.5-0.1C2.8 26.1 6 27.1 9.5 27.1" />
                        </svg>
                    </a>
                </li>
                <li>
                    <!-- facebook -->
                    <a href="#">
                        <svg class="glow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
                    <path class="st0"
                        d="M28.3 0.1H1.7c-0.9 0-1.6 0.7-1.6 1.6v26.5c0 0.9 0.7 1.6 1.6 1.6H16V18.4h-3.9v-4.5H16v-3.3c0-3.9 2.4-5.9 5.8-5.9 1.6 0 3.1 0.1 3.5 0.2v4l-2.4 0c-1.9 0-2.2 0.9-2.2 2.2v2.9h4.5l-0.6 4.5h-3.9v11.5h7.6c0.9 0 1.6-0.7 1.6-1.6V1.7C29.9 0.8 29.2 0.1 28.3 0.1z" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
                    <path class="st0"
                        d="M28.3 0.1H1.7c-0.9 0-1.6 0.7-1.6 1.6v26.5c0 0.9 0.7 1.6 1.6 1.6H16V18.4h-3.9v-4.5H16v-3.3c0-3.9 2.4-5.9 5.8-5.9 1.6 0 3.1 0.1 3.5 0.2v4l-2.4 0c-1.9 0-2.2 0.9-2.2 2.2v2.9h4.5l-0.6 4.5h-3.9v11.5h7.6c0.9 0 1.6-0.7 1.6-1.6V1.7C29.9 0.8 29.2 0.1 28.3 0.1z" />
                        </svg>
                    </a>
                </li>
                <li>
                    <!-- youtube -->
                    <a href="#">
                        <svg class="glow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
                    <path class="st0"
                        d="M29.7 9c0 0-0.3-2.1-1.2-3 -1.1-1.2-2.4-1.2-3-1.3C21.3 4.5 15 4.5 15 4.5h0c0 0-6.3 0-10.5 0.3C3.9 4.8 2.6 4.8 1.5 6 0.6 6.9 0.3 9 0.3 9S0 11.4 0 13.9v2.3C0 18.6 0.3 21 0.3 21s0.3 2.1 1.2 3c1.1 1.2 2.6 1.2 3.3 1.3C7.2 25.5 15 25.6 15 25.6s6.3 0 10.5-0.3c0.6-0.1 1.9-0.1 3-1.3 0.9-0.9 1.2-3 1.2-3s0.3-2.4 0.3-4.9v-2.3C30 11.4 29.7 9 29.7 9zM11.9 18.9l0-8.4 8.1 4.2L11.9 18.9z" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
                    <path class="st0"
                        d="M29.7 9c0 0-0.3-2.1-1.2-3 -1.1-1.2-2.4-1.2-3-1.3C21.3 4.5 15 4.5 15 4.5h0c0 0-6.3 0-10.5 0.3C3.9 4.8 2.6 4.8 1.5 6 0.6 6.9 0.3 9 0.3 9S0 11.4 0 13.9v2.3C0 18.6 0.3 21 0.3 21s0.3 2.1 1.2 3c1.1 1.2 2.6 1.2 3.3 1.3C7.2 25.5 15 25.6 15 25.6s6.3 0 10.5-0.3c0.6-0.1 1.9-0.1 3-1.3 0.9-0.9 1.2-3 1.2-3s0.3-2.4 0.3-4.9v-2.3C30 11.4 29.7 9 29.7 9zM11.9 18.9l0-8.4 8.1 4.2L11.9 18.9z" />
                        </svg>
                    </a>
                </li>
                <li>
                    <!-- instagram -->
                    <a href="#">
                        <svg class="glow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
                    <path class="st0"
                        d="M15 2.8c4 0 4.4 0 6 0.1 1.4 0.1 2.2 0.3 2.8 0.5 0.7 0.3 1.2 0.6 1.7 1.1 0.5 0.5 0.8 1 1.1 1.7C26.8 6.8 27 7.6 27.1 9c0.1 1.6 0.1 2 0.1 6s0 4.4-0.1 6c-0.1 1.4-0.3 2.2-0.5 2.8 -0.3 0.7-0.6 1.2-1.1 1.7 -0.5 0.5-1 0.8-1.7 1.1 -0.5 0.2-1.3 0.4-2.8 0.5 -1.6 0.1-2 0.1-6 0.1s-4.4 0-6-0.1c-1.4-0.1-2.2-0.3-2.8-0.5 -0.7-0.3-1.2-0.6-1.7-1.1 -0.5-0.5-0.8-1-1.1-1.7C3.2 23.2 3 22.4 2.9 21c-0.1-1.6-0.1-2-0.1-6s0-4.4 0.1-6C3 7.6 3.2 6.8 3.4 6.2 3.7 5.5 4 5.1 4.5 4.5c0.5-0.5 1-0.8 1.7-1.1C6.8 3.2 7.6 3 9 2.9 10.6 2.8 11 2.8 15 2.8M15 0.2c-4 0-4.5 0-6.1 0.1C7.3 0.3 6.2 0.6 5.3 0.9c-1 0.4-1.8 0.9-2.6 1.7C1.8 3.5 1.3 4.3 0.9 5.3c-0.4 0.9-0.6 2-0.7 3.6C0.2 10.5 0.1 11 0.1 15c0 4 0 4.5 0.1 6.1 0.1 1.6 0.3 2.7 0.7 3.6 0.4 1 0.9 1.8 1.7 2.6 0.8 0.8 1.7 1.3 2.6 1.7 0.9 0.4 2 0.6 3.6 0.7 1.6 0.1 2.1 0.1 6.1 0.1s4.5 0 6.1-0.1c1.6-0.1 2.7-0.3 3.6-0.7 1-0.4 1.8-0.9 2.6-1.7 0.8-0.8 1.3-1.7 1.7-2.6 0.4-0.9 0.6-2 0.7-3.6 0.1-1.6 0.1-2.1 0.1-6.1s0-4.5-0.1-6.1c-0.1-1.6-0.3-2.7-0.7-3.6 -0.4-1-0.9-1.8-1.7-2.6 -0.8-0.8-1.7-1.3-2.6-1.7 -0.9-0.4-2-0.6-3.6-0.7C19.5 0.2 19 0.2 15 0.2L15 0.2z" />
                    <path class="st0"
                        d="M15 7.4c-4.2 0-7.6 3.4-7.6 7.6s3.4 7.6 7.6 7.6 7.6-3.4 7.6-7.6S19.2 7.4 15 7.4zM15 20c-2.7 0-5-2.2-5-5s2.2-5 5-5c2.7 0 5 2.2 5 5S17.7 20 15 20z" />
                    <circle class="st0" cx="22.9" cy="7.1" r="1.8" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
                    <path class="st0"
                        d="M15 2.8c4 0 4.4 0 6 0.1 1.4 0.1 2.2 0.3 2.8 0.5 0.7 0.3 1.2 0.6 1.7 1.1 0.5 0.5 0.8 1 1.1 1.7C26.8 6.8 27 7.6 27.1 9c0.1 1.6 0.1 2 0.1 6s0 4.4-0.1 6c-0.1 1.4-0.3 2.2-0.5 2.8 -0.3 0.7-0.6 1.2-1.1 1.7 -0.5 0.5-1 0.8-1.7 1.1 -0.5 0.2-1.3 0.4-2.8 0.5 -1.6 0.1-2 0.1-6 0.1s-4.4 0-6-0.1c-1.4-0.1-2.2-0.3-2.8-0.5 -0.7-0.3-1.2-0.6-1.7-1.1 -0.5-0.5-0.8-1-1.1-1.7C3.2 23.2 3 22.4 2.9 21c-0.1-1.6-0.1-2-0.1-6s0-4.4 0.1-6C3 7.6 3.2 6.8 3.4 6.2 3.7 5.5 4 5.1 4.5 4.5c0.5-0.5 1-0.8 1.7-1.1C6.8 3.2 7.6 3 9 2.9 10.6 2.8 11 2.8 15 2.8M15 0.2c-4 0-4.5 0-6.1 0.1C7.3 0.3 6.2 0.6 5.3 0.9c-1 0.4-1.8 0.9-2.6 1.7C1.8 3.5 1.3 4.3 0.9 5.3c-0.4 0.9-0.6 2-0.7 3.6C0.2 10.5 0.1 11 0.1 15c0 4 0 4.5 0.1 6.1 0.1 1.6 0.3 2.7 0.7 3.6 0.4 1 0.9 1.8 1.7 2.6 0.8 0.8 1.7 1.3 2.6 1.7 0.9 0.4 2 0.6 3.6 0.7 1.6 0.1 2.1 0.1 6.1 0.1s4.5 0 6.1-0.1c1.6-0.1 2.7-0.3 3.6-0.7 1-0.4 1.8-0.9 2.6-1.7 0.8-0.8 1.3-1.7 1.7-2.6 0.4-0.9 0.6-2 0.7-3.6 0.1-1.6 0.1-2.1 0.1-6.1s0-4.5-0.1-6.1c-0.1-1.6-0.3-2.7-0.7-3.6 -0.4-1-0.9-1.8-1.7-2.6 -0.8-0.8-1.7-1.3-2.6-1.7 -0.9-0.4-2-0.6-3.6-0.7C19.5 0.2 19 0.2 15 0.2L15 0.2z" />
                    <path class="st0"
                        d="M15 7.4c-4.2 0-7.6 3.4-7.6 7.6s3.4 7.6 7.6 7.6 7.6-3.4 7.6-7.6S19.2 7.4 15 7.4zM15 20c-2.7 0-5-2.2-5-5s2.2-5 5-5c2.7 0 5 2.2 5 5S17.7 20 15 20z" />
                    <circle class="st0" cx="22.9" cy="7.1" r="1.8" />
                        </svg>
                    </a>
                </li>
            </ul>
        </div>`
    }
    update() {
        alert("updated")
        this.Draw();
    }
    CustomStyle = css`
        w-layout{
            display: block;
            .Main-content {
                padding: 40px;
                max-width: 1500px;                
                margin: auto auto auto 300px; 
                min-height: calc(100vh - 100px);
                h1, h2, h3 {
                    margin: 20px 0;
                    color: #00418b;
                }
                p, li, ul, pre {
                    font-size: 1.2rem;
                    text-align: justify;
                }
                
                .language-javascript, .language-json {
                    background: #090808;
                }
                code[class*="language-"], pre[class*="language-"], .token.property, .token.tag, .token.boolean, .token.number, .token.constant, .token.symbol, .token.deleted { 
                    color: #97c9f3;
                    text-shadow: unset;
                }
                .token.operator, .token.entity, .token.url, .language-css .token.string, .style .token.string {
                    color: #9a6e3a;
                    background: unset;
                }
                @media (max-width: 1500px) {
                    margin: auto auto auto 300px; 
                }
            }
            .Main-asideContent {
                position: fixed;
                width: 300px;
                top: 400px;
                height: calc(100vh - 400px);
                left: 0;
                background: #eee;
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding: 20px;
                box-sizing: border-box;    
                transition: height 0.3s ease, background-color 0.3s ease;
            }
        } 
       .site-header {
            height: 400px;
            transition: height 0.3s ease, background-color 0.3s ease;
            padding-left: 50px;
            padding-right: 50px;
            position: relative;
            .banner-header {
                display: flex;
                width: 100%;
                gap: 30px;
                justify-content: center;
                .logo {
                    width: 200px;
                    min-width: 200px !important;
                    height: 200px;
                    left: 300px 
                }
            }
            .main-nav {
                display: flex;
                gap: 20px;
                padding: 10px 0;
                top: 0;
                z-index: 100;
                transition: all 0.3s ease;
            }
            &.scrolled {
                top:0px;
                height: 80px;
                position: fixed;
                z-index: 1;
                .main-nav {
                    padding: 10px 0;
                    a {
                        color: white;
                    }
                }
                .banner-header {
                    display: none; /* oculta el banner al hacer scroll */
                }
            }
            .banner-header {
                display: flex;
                width: 100%;
                gap: 30px;
                justify-content: center;
                .logo {
                    width: 200px;
                    min-width: 200px;
                    height: 200px;
                }
            }
        }

        /* Ajuste del aside al hacer scroll */
        .Main-asideContent {
            top: 400px;
            transition: top 0.3s ease;
        }

        .site-header.scrolled ~ .Main-content {
            //position: sticky;
            margin-top: 160px;
            //height: calc(100vh - 80px);
           // overflow-y: auto;
           // overflow-x: hidden;

        }
        .site-header.scrolled + .Main-asideContent {
            height: calc(100vh - 80px);
            top: 80px;
        }
        .main-footer {
            position: sticky;
        }
     `
}
customElements.define('w-layout', Layout);
export { Layout }

/**
 * @param {string} path
 * @param {string[]} pathList
 * @param {HTMLElement} content
 */
export function buildLinks(path, pathList = [], content) {
    const route = pathRoute + path;
    console.log(route);

    pathList.forEach(name => {
        content.append(css`
            .site-header .${name} {                
                height: 400px;
                width: 700px;
                transform: translateX(100%)
            }
            .site-header .${name} img {
                height: 400px;
                width: 700px;
                object-fit: cover
            }
            .site-header .a${name}:hover ~ .${name} {
                opacity: 1;
                z-index :1;
                transform: translateX(0%)
            }
        `)
        content.append(WRender.Create({
            tagName: 'a', className: 'a' + name, innerText: name.replace("_", " "), href: route + name + ".html"
        }));
        //content.append(html`<div class="preview ${name}" style='color: #000'><img src="../Media/ImageComponents/${name}.png" /></div>`)
    });
}