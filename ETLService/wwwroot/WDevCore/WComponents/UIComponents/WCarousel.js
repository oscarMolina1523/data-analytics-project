//@ts-check
import { html } from "../../WModules/WComponentsTools.js";
import { css } from "../../WModules/WStyledRender.js";

class WCarousel extends HTMLElement {
    constructor(items = []) {
        super();
        this.items = Array.isArray(items) ? [...items] : [];
        this.currentIndex = 0;
        this.isMoving = false; // Bloqueo para evitar spam de clics
        this.append(this.CustomStyle);
    }

    connectedCallback() {
        if (this.items.length === 0) {
            this.items = Array.from(this.children);
            this.innerHTML = "";
        }
        this.Draw();
    }

    Draw = () => {
        // Envolvemos los items originales en sus contenedores de slide
        const slides = this.items.map(item => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            item.classList.add('carousel-child');
            slide.appendChild(item);
            return slide;
        });

        const content = html`<div class="carousel-container">
                <button class="nav-btn prev" onclick="${this.prev}"><</button>
                <div class="carousel-track">
                    ${slides}
                </div>
                <button class="nav-btn next" onclick="${this.next}">></button>
            </div>`;

        this.append(content);
        this.track = this.querySelector('.carousel-track');
    };

    next = () => {
        if (this.isMoving) return;
        this.isMoving = true;

        const track = this.track;
        track.style.transition = "transform 0.5s ease-in-out";
        track.style.transform = `translateX(-100%)`;

        track.addEventListener('transitionend', () => {
            track.style.transition = "none";
            // Movemos el primer hijo al final físicamente
            track.appendChild(track.firstElementChild);
            track.style.transform = `translateX(0)`;
            this.isMoving = false;
        }, { once: true });
    };

    prev = () => {
        if (this.isMoving) return;
        this.isMoving = true;

        const track = this.track;
        // 1. Movemos el último al inicio instantáneamente (sin que se vea)
        track.style.transition = "none";
        track.prepend(track.lastElementChild);
        // 2. Compensamos la posición para que no se note el salto
        track.style.transform = `translateX(-100%)`;

        // 3. Forzamos un reflow para que el navegador registre el cambio de posición
        track.offsetHeight; 

        // 4. Animamos hacia la posición 0
        track.style.transition = "transform 0.5s ease-in-out";
        track.style.transform = `translateX(0)`;

        track.addEventListener('transitionend', () => {
            this.isMoving = false;
        }, { once: true });
    };

    CustomStyle = css`
        w-carousel {
            display: block;
            width: 100%;
            height: 100%;
            overflow: hidden;
            position: relative;
        }
        .carousel-container {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        .carousel-track {
            display: flex;
            width: 100%;
            height: 100%;
            /* No definimos transition aquí de forma fija */
        }
        .carousel-slide {
            min-width: 100%;
            width: 100%;
            height: 100%;
            flex-shrink: 0;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .carousel-child {
            width: 100% !important;
            height: 100% !important;
            object-fit: contain;
        }
        .nav-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0, 0, 0, 0.5);
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            cursor: pointer;
            border-radius: 50%;
            z-index: 10;
        }
        .prev { left: 10px; }
        .next { right: 10px; }
    `;
}

customElements.define('w-carousel', WCarousel);
export { WCarousel };