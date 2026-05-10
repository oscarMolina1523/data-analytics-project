# Documentación de la Implementación de DashboardVentas.js

La implementación del `DashboardVentas.js` en la aplicación sigue el siguiente flujo:

**1. Agregación y Uso de Servicios en `Program.cs`:**
El archivo `ETLService/Program.cs` es el punto de entrada de la aplicación ASP.NET Core y se encarga de configurar los servicios y el pipeline de solicitudes HTTP.

**Agregación de Servicios (`builder.Services.Add...`)**:
Aquí se registran los servicios que la aplicación utilizará.

```csharp
var builder = WebApplication.CreateBuilder(args);

// Agrega servicios al contenedor.
builder.Services.AddEndpointsApiExplorer(); // Habilita la exploración de endpoints para APIs.
builder.Services.AddControllers();           // Agrega soporte para controladores MVC (APIs).
builder.Services.AddSwaggerGen();            // Genera documentación Swagger/OpenAPI para las APIs.
builder.Services.AddRazorPages();            // Agrega soporte para Razor Pages, que es el tipo de página que usa index.cshtml.

// Configurar CORS (Cross-Origin Resource Sharing)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()  // Permite solicitudes desde cualquier origen.
              .AllowAnyHeader()  // Permite cualquier encabezado en las solicitudes.
              .AllowAnyMethod(); // Permite cualquier método HTTP (GET, POST, PUT, DELETE, etc.).
    });
});
```
*   `builder.Services.AddEndpointsApiExplorer()`: Habilita la exploración de endpoints para APIs, útil para herramientas como Swagger.
*   `builder.Services.AddControllers()`: Registra los servicios necesarios para usar controladores en la aplicación, que son componentes que manejan las solicitudes HTTP y devuelven respuestas.
*   `builder.Services.AddSwaggerGen()`: Configura la generación de documentación Swagger/OpenAPI para las APIs, facilitando la prueba y el consumo de las mismas.
*   `builder.Services.AddRazorPages()`: Registra los servicios para Razor Pages, un modelo de programación para construir aplicaciones web con ASP.NET Core que permite tener la lógica de la interfaz de usuario y el código C# en el mismo archivo (`.cshtml`). `index.cshtml` es un ejemplo de esto.
*   `builder.Services.AddCors(...)`: Configura el servicio de Cross-Origin Resource Sharing (CORS). Esto es crucial para permitir que scripts del lado del cliente (como `DashboardVentas.js`) que se ejecutan en un origen diferente (aunque en este caso es el mismo servidor, podría ser un puerto diferente o un dominio distinto en un entorno de producción) puedan realizar solicitudes a la API de la aplicación. La política "AllowAll" es permisiva y se usa a menudo en desarrollo.

**Uso de Servicios (`app.Use...`)**:
Aquí se define el pipeline de solicitudes HTTP, es decir, el orden en que los middlewares procesarán cada solicitud.

```csharp
var app = builder.Build();
await new StartServices().StartServicesApp(); // Inicia servicios personalizados de la aplicación.

// Configura el pipeline de solicitudes HTTP.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();     // Habilita el middleware de Swagger.
    app.UseSwaggerUI();   // Habilita la interfaz de usuario de Swagger.
}

app.UseCors(policy => policy // Usa el middleware de CORS.
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader()
);

app.MapControllers();         // Mapea las rutas de los controladores.
app.UseHttpsRedirection();    // Redirige las solicitudes HTTP a HTTPS.
app.UseStaticFiles();         // Habilita el servicio de archivos estáticos.
app.MapRazorPages();          // Mapea las rutas de las Razor Pages.

app.Run();
```
*   `await new StartServices().StartServicesApp();`: Este es un llamado a un método que inicia servicios personalizados definidos en el proyecto `Operations`. Esto podría incluir la inicialización de bases de datos, la configuración de tareas en segundo plano o cualquier otra lógica de inicio de la aplicación.
*   `app.UseSwagger()` y `app.UseSwaggerUI()`: Estos middlewares habilitan la interfaz de usuario de Swagger para explorar y probar las APIs, generalmente solo en entornos de desarrollo.
*   `app.UseCors(...)`: Este middleware aplica la política CORS configurada previamente. Es fundamental que se ejecute antes de `UseAuthorization` y `UseRouting` si se utilizan, para que las cabeceras CORS se manejen correctamente.
*   `app.MapControllers()`: Agrega los endpoints de los controladores al pipeline de enrutamiento.
*   `app.UseHttpsRedirection()`: Fuerza a los clientes a usar HTTPS.
*   `app.UseStaticFiles()`: Habilita el middleware para servir archivos estáticos (HTML, CSS, JavaScript, imágenes, etc.) desde el directorio `wwwroot`. Esto es crucial para que `DashboardVentas.js` y `data.json` sean accesibles por el navegador.
*   `app.MapRazorPages()`: Agrega los endpoints de las Razor Pages al pipeline de enrutamiento, permitiendo que `index.cshtml` sea servida.

**2. Inclusión y Llamada del Componente en `index.cshtml`:**
El archivo `ETLService/Pages/index.cshtml` es una página Razor que sirve como el punto de entrada para el dashboard. Es una página HTML básica que incluye el script de JavaScript y un contenedor para el dashboard.

```html
@page
@{
    ViewData["Title"] = "index";
}
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <!-- Inclusión del script DashboardVentas.js como un módulo -->
    <script type="module" src="~/Views/DashboardVentas.js"></script>
</head>

<body>
    <!-- Contenedor donde se renderizará el dashboard -->
    <main id="app"></main>
</body>

</html>
```
*   `@page`: Directiva de Razor Pages que indica que este archivo es una página Razor.
*   `<script type="module" src="~/Views/DashboardVentas.js"></script>`: Esta línea es fundamental. Incluye el archivo `DashboardVentas.js` en la página. El atributo `type="module"` es importante porque `DashboardVentas.js` utiliza `import` para otros módulos JavaScript (`WTableDynamicComp`, `ModelProperty`). El `~` indica la raíz de la aplicación web, y `Views/DashboardVentas.js` se resuelve a `wwwroot/Views/DashboardVentas.js` debido a `app.UseStaticFiles()` en `Program.cs`.
*   `<main id="app"></main>`: Este elemento HTML actúa como el contenedor principal. El script `DashboardVentas.js` buscará este elemento por su `id` y adjuntará el componente del dashboard dentro de él.

**3. Funcionalidad de `DashboardVentas.js`:**
El script `ETLService/wwwroot/Views/DashboardVentas.js` es el corazón del dashboard del lado del cliente. Se ejecuta una vez que la página HTML y todos sus recursos han sido cargados.

```javascript
// Importaciones de módulos necesarios
import { WTableDynamicComp } from "../WDevCore/WComponents/WTableDynamic.js";
import { ModelProperty } from "../WDevCore/WModules/CommonModel.js";

// El código se ejecuta cuando la ventana se ha cargado completamente
window.onload = async () => {
    // 1. Carga de Datos:
    // Realiza una petición asíncrona para obtener datos desde un archivo JSON local.
    const dataPromise = await fetch("../Resource/data.json");
    const data = await dataPromise.json();
    console.log(data); // Muestra los datos en la consola del navegador

    // 2. Definición del Modelo de Datos:
    // Define la estructura de los datos y cómo deben ser presentados en la tabla dinámica.
    class ModelObject {
        /**@type {ModelProperty}*/ product = { type: 'draw' };
        /**@type {ModelProperty}*/ category = {
            type: 'wselect',
            ModelObject:
                { category: { type: "text", primary: true }, desc: { type: "text" } },
            Dataset: data.map(d => ({ category: d.category, desc: d.category }))
        };
        /**@type {ModelProperty}*/ year = { type: 'select' };
        /**@type {ModelProperty}*/ mes = { type: 'select' };
        /**@type {ModelProperty}*/ quarter = { type: 'text' };
        /**@type {ModelProperty}*/ units_sold = { type: 'number', hiddenInTable: true };
        /**@type {ModelProperty}*/ unit_price = { type: 'money', hiddenInTable: true };
        /**@type {ModelProperty}*/ total_sale = { type: 'money', hiddenInTable: true };
    }

    // 3. Configuración y Creación del Componente de Tabla Dinámica:
    // Se define la configuración para el componente WTableDynamicComp.
    const TableConfigG = {
        Dataset: data,          // Los datos a mostrar en la tabla.
        EvalValue: "total_sale",// El campo a evaluar o sumar.
        AttNameEval: "category",// El atributo por el cual se agrupará la evaluación.
        groupParams: ["year"],  // Parámetros para agrupar los datos (ej. por año).
        AddChart: true,         // Indica si se debe añadir un gráfico.
        ModelObject: new ModelObject() // El modelo de datos definido anteriormente.
    };
    const WTableReport = new WTableDynamicComp(TableConfigG);

    // 4. Renderizado del Componente:
    // El componente de tabla dinámica se añade al elemento HTML con id="app".
    // Este elemento se encuentra en index.cshtml.
    app.append(WTableReport);
}
```
*   **Importaciones**: Al inicio, se importan `WTableDynamicComp` y `ModelProperty` de la librería `WDevCore`. Esto demuestra que `DashboardVentas.js` es parte de un ecosistema de componentes reutilizables.
*   `window.onload = async () => { ... }`: Este es el punto de entrada del script. Asegura que el código se ejecute solo después de que todo el DOM y los recursos de la página se hayan cargado, evitando errores al intentar manipular elementos que aún no existen.
*   `fetch("../Resource/data.json")`: Realiza una solicitud HTTP GET para obtener el archivo `data.json`. Este archivo contiene los datos brutos que se visualizarán en el dashboard. La ruta `../Resource/data.json` es relativa a la ubicación de `DashboardVentas.js` (`wwwroot/Views/`).
*   `class ModelObject { ... }`: Define un esquema para los datos. Cada propiedad (ej. `product`, `category`) tiene un `ModelProperty` asociado que especifica su tipo de control (`draw`, `wselect`, `select`, `text`, `number`, `money`), si es una clave primaria, o si debe estar oculto en la tabla. Esto es crucial para la renderización dinámica y la interacción del usuario con la tabla.
*   `const WTableReport = new WTableDynamicComp(TableConfigG);`: Crea una nueva instancia del componente `WTableDynamicComp`. `TableConfigG` es un objeto de configuración que le dice al componente cómo debe comportarse, qué datos usar, cómo agruparlos, qué valores evaluar y si debe incluir un gráfico.
*   `app.append(WTableReport);`: Finalmente, el componente `WTableReport` se inserta en el elemento HTML con `id="app"`. Este es el paso que hace visible el dashboard en la página web.

En resumen, `Program.cs` establece la infraestructura del servidor y habilita el servicio de archivos estáticos. `index.cshtml` actúa como el host HTML, incluyendo el script `DashboardVentas.js` y proporcionando un contenedor. `DashboardVentas.js` es el script del lado del cliente que se encarga de cargar los datos, construir y renderizar el dashboard dinámico en el navegador, utilizando componentes de `WDevCore`.
