# Módulos de Componentes y Estilos: `WComponentsTools.js` y `WStyledRender.js`

Estos dos archivos son fundamentales en el proyecto frontend para la creación y estilización de componentes web. Proporcionan utilidades para la manipulación del DOM, la gestión de estilos y la creación de una experiencia de usuario dinámica.

## `WComponentsTools.js`

Este módulo contiene una colección de herramientas para la creación programática de elementos HTML, la gestión de componentes y la adición de funcionalidades diversas.

### 1. `html` (Tagged Template Literal para la Creación de UI)

Es una de las herramientas más utilizadas para definir la estructura de los componentes de forma declarativa. Permite incrustar variables, otros elementos HTML, arreglos de elementos y funciones de evento directamente en las plantillas de cadena.

**Uso:**

```javascript
import { html } from "./WComponentsTools.js";

// Ejemplo básico de un componente simple
const myComponent = html`<div class="container">
    <h1>Hola, Mundo!</h1>
    <p>Este es un párrafo de ejemplo.</p>
</div>`;

// Ejemplo con variables y eventos
let count = 0;
const increment = () => {
    count++;
    console.log("Count: ", count);
    // Aquí normalmente se re-renderizaría el componente
};

const interactiveComponent = html`
    <div class="card">
        <button onclick="${increment}">Incrementar</button>
        <p>El contador es: ${count}</p>
    </div>
`;

// Ejemplo con elementos anidados
const nestedComponent = html`
    <div>
        <h2>Componente Anidado</h2>
        ${myComponent}
    </div>
`;

// Ejemplo con un arreglo de elementos
const items = [
    html`<li>Item 1</li>`,
    html`<li>Item 2</li>`,
    html`<li>Item 3</li>`,
];

const listComponent = html`
    <ul>
        ${items}
    </ul>
`;

// Añadir al DOM (ejemplo, en un custom element)
// this.shadowRoot.append(myComponent);
```

### 2. `WRender` (Clase para la Creación Programática de Nodos)

La clase `WRender` ofrece métodos estáticos para crear elementos HTML y gestionar estilos de forma programática. Es útil cuando se necesita un control más granular sobre la creación del DOM o cuando se trabaja con estructuras de datos para generar HTML.

**Uso:**

```javascript
import { WRender } from "./WComponentsTools.js";

// Crear un elemento simple
const divElement = WRender.Create({
    tagName: "div",
    className: "my-div",
    children: ["Contenido del div"]
});

// Crear un elemento con estilos y atributos
const styledParagraph = WRender.Create({
    tagName: "p",
    id: "myParagraph",
    style: {
        color: "blue",
        fontSize: "16px"
    },
    children: ["Párrafo con estilos programáticos"]
});

// Crear un elemento con hijos anidados
const container = WRender.Create({
    tagName: "section",
    children: [
        WRender.Create({ tagName: "h2", children: ["Título de Sección"] }),
        WRender.Create({
            tagName: "ul",
            children: [
                WRender.Create({ tagName: "li", children: ["Elemento de lista 1"] }),
                WRender.Create({ tagName: "li", children: ["Elemento de lista 2"] })
            ]
        })
    ]
});

// Usando SetStyle
const myElement = document.createElement("div");
WRender.SetStyle(myElement, { backgroundColor: "red", padding: "10px" });

// Añadir al DOM (ejemplo)
// document.body.appendChild(divElement);
```

### 3. `ComponentsManager` (Gestión de Componentes y Navegación SPA)

Esta clase es esencial para aplicaciones de una sola página (SPA) y para la gestión de modales, permitiendo la navegación dinámica entre componentes y el control del estado de la interfaz.

**Uso:**

```javascript
import { ComponentsManager, WRender } from "./WComponentsTools.js";

class MyHomeComponent {
    constructor() {
        this.type = "div";
        this.children = ["Este es el componente de Inicio"];
    }
}

class MyAboutComponent {
    constructor() {
        this.type = "div";
        this.children = ["Este es el componente Acerca de"];
    }
}

const mainContainer = WRender.Create({ tagName: "div", id: "app-container" });
document.body.appendChild(mainContainer);

const appManager = new ComponentsManager({
    MainContainer: mainContainer,
    SPAManage: true // Habilita la gestión de SPA a través del hash de URL
});

// Navegar a un componente
appManager.NavigateFunction("home", new MyHomeComponent());

// Ejemplo de modal
const myModalContent = WRender.Create({
    tagName: "div",
    children: ["Contenido del modal"]
});
// Asumimos que hay un elemento modal en el DOM con ID 'my-modal'
// ComponentsManager.modalFunction(document.getElementById("my-modal"));
```

### 4. Utilidades Adicionales

`WComponentsTools.js` también exporta varias funciones de utilidad:

*   **`loadExternalResources(resources)`**: Carga scripts y hojas de estilo de forma asíncrona y gestionando duplicados.
*   **`GenerateColor()`**: Genera un color hexadecimal aleatorio.
*   **`ConvertToMoneyString(number, currency)`**: Formatea un número a una cadena de moneda (ej: "C$ 1,234.56").
*   **`generateGUID()`**: Genera un Identificador Único Global (GUID).
*   **Extensiones de `Date.prototype` y `String.prototype`**: Métodos para manipular y formatear fechas y cadenas.

## `WStyledRender.js`

Este módulo se enfoca en la creación de estilos personalizados y dinámicos para los componentes web, utilizando el concepto de *styled components* con un sistema de clases CSS.

### 1. `css` (Tagged Template Literal para Estilos)

Al igual que `html`, `css` es un *tagged template literal* que permite definir bloques de estilos CSS de manera concisa. Es ideal para asociar estilos directamente a componentes o para crear estilos globales.

**Uso:**

```javascript
import { css } from "./WStyledRender.js";

const buttonStyles = css`
    .my-button {
        background-color: #007bff;
        color: white;
        padding: 10px 15px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
    }
    .my-button:hover {
        background-color: #0056b3;
    }
`;

const responsiveStyles = css`
    @media (max-width: 768px) {
        .container {
            flex-direction: column;
        }
    }
`;

// En un Custom Element (ejemplo)
// this.shadowRoot.append(buttonStyles);
```


Estos módulos en `WDevCore/WModules` son la columna vertebral para construir interfaces de usuario dinámicas y bien estructuradas en el proyecto, ofreciendo tanto una forma declarativa (`html`, `css`) como programática (`WRender`, `WStyledRender`) de trabajar con el DOM y los estilos. Los ejemplos de uso se encuentran principalmente en el directorio `WComponents`, donde se consumen estas herramientas para construir los distintos componentes de la interfaz de usuario. 