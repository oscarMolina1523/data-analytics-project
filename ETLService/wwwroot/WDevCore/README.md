# WDevCoreJs

![WDevCoreJs Logo](../Media/logos/devexpBanner.png)

## ¡Bienvenido a WDevCoreJs!

WDevCoreJs es una librería de JavaScript de código abierto, ligera, diseñada para la construcción de interfaces de usuario dinámicas. Inspirada en la simplicidad y eficiencia de Lit y la expresividad de JSX, WDevCoreJs te permite crear componentes web reutilizables y de alto rendimiento utilizando Vanilla JavaScript puro.

Nuestro objetivo es proporcionar a los desarrolladores una herramienta flexible y fácil de usar para construir aplicaciones web modernas, sin la complejidad de frameworks más grandes, pero con la capacidad de manejar estados y renderizado de manera eficiente.

## Características Principales

*   **Vanilla JavaScript:** No se requieren frameworks adicionales. Escribe código limpio y estándar.
*   **Componentes Reactivos:** Crea componentes que reaccionan a los cambios de estado de forma eficiente.
*   **Inspiración en Lit y JSX:** Disfruta de un modelo de programación familiar si vienes de estas tecnologías.
*   **Ligera y Rápida:** Optimizada para un rendimiento excelente en el navegador.
*   **Fácil de Aprender:** Diseñada con una curva de aprendizaje suave para desarrolladores de todos los niveles.

## Instalación

Para incluir WDevCoreJs en tu proyecto, puedes copiar los archivos directamente o agregar un git submodule en tu app (actualmente no disponible por gestion de paquetes).

una vez incluido puedes invocar cualquier funcion, componente o modulo que desees directamente en cualquier sitio de tu app ya sea con 

## Uso Básico

WDevCoreJs se centra en la creación de componentes. Aquí tienes un ejemplo básico de cómo podrías definir y usar un componente:

```javascript
import { WComponent, WRender } from './WDevCoreJs.js';

class MyGreetingComponent extends WComponent {
    constructor() {
        super();
        this.state = { name: 'Mundo' };
    }

    // Define las propiedades observadas para que el componente se re-renderice cuando cambien
    static get observedAttributes() { return ['name']; }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'name') {
            this.setState({ name: newValue });
        }
    }

    render() {
        return WRender.createElement('h1', {}, `¡Hola, ${this.state.name}!`);
    }
}

// Registra tu componente como un Custom Element
customElements.define('my-greeting', MyGreetingComponent);

// Uso en HTML
// <my-greeting name="WDevCoreJs"></my-greeting>
```

## Módulos y Componentes Clave (Descripción General)

WDevCoreJs está estructurado en varios módulos y componentes que trabajan juntos para facilitar el desarrollo de UI:

*   **`WComponent`**: La clase base para todos los componentes de WDevCoreJs. Proporciona la lógica para la gestión del estado, el ciclo de vida del componente y la integración con Custom Elements.
*   **`WRender`**: Un módulo esencial para el renderizado eficiente de elementos en el DOM. Permite la creación de elementos virtuales y su posterior actualización, optimizando el rendimiento. Inspirado en la forma en que JSX se compila a llamadas a funciones para crear elementos.
*   **`WArrayF`**: Utilidades para la manipulación reactiva de arrays, permitiendo que los cambios en los datos se reflejen automáticamente en la UI.
*   **`WStyle`**: Herramientas para la gestión de estilos CSS dentro de los componentes, facilitando la creación de estilos encapsulados y dinámicos.
*   **`WDom`**: Funciones de utilidad para la manipulación directa del DOM de una manera más abstracta y segura.
*   **`WForm`**: Componentes y utilidades para la creación y gestión de formularios, incluyendo validación y enlace de datos.
*   **`WTable`**: Componentes para la visualización de datos en tablas, con funcionalidades como paginación, ordenamiento y filtrado.
*   **`WModal`**: Componentes para la creación de ventanas modales y diálogos.
*   **`WInput`**: Componentes de entrada de datos predefinidos y personalizables.
*   **`WChart`**: Integración o componentes para la visualización de gráficos.
*   **`WDate`**: Utilidades para el manejo y formato de fechas.
*   **`WHttp`**: Un cliente HTTP ligero para realizar solicitudes a APIs.
*   **`WValidate`**: Funciones de utilidad para la validación de datos.

Esta es una descripción general. Para detalles específicos y ejemplos de uso, por favor consulta la documentación completa de cada módulo.

## Contribución

WDevCoreJs es un proyecto de código abierto y agradecemos cualquier contribución. Si deseas mejorar la librería, reportar un error o sugerir una nueva característica, por favor, consulta nuestras [guías de contribución](CONTRIBUTING.md) (si existen) o abre un issue en nuestro repositorio de GitHub.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

```
MIT License

Copyright (c) 2025 Wilber

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
