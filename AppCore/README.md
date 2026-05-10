# AppCore

`AppCore` es una biblioteca fundamental que proporciona una capa de abstracción para la interacción con la base de datos, servicios de utilidad, seguridad y configuración del sistema. Está diseñada para facilitar el desarrollo de aplicaciones .NET Core, ofreciendo un conjunto de herramientas para el mapeo objeto-relacional (ORM), manejo de transacciones, y gestión de entidades.

## Estructura del Proyecto

El proyecto `AppCore` se organiza en los siguientes módulos principales:

*   **`Data_Access`**: Contiene la lógica para la conexión a la base de datos, el ORM (`DataMapper`), la definición de la estructura de las entidades (`EntityClass`, `EntityAttributes`) y las implementaciones específicas para diferentes tipos de bases de datos (MySQL, PostgreSQL, SQL Server).
*   **`Security`**: Proporciona servicios para autenticación, encriptación y modelos de seguridad.
*   **`Services`**: Incluye una variedad de servicios de utilidad como manejo de fechas, cadenas, números, archivos (PDF, SSH), correo electrónico, y servicios de sesión. También contiene servicios para la ejecución de tareas en segundo plano (JobsServices).
*   **`SystemConfig`**: Gestiona la configuración del sistema y de la base de datos.
*   **`LoggerServices`**: Servicio para el registro de errores y mensajes.

## Funciones Principales de AppCore

### 1. Acceso a Datos (Data_Access)

Este módulo es el corazón de la interacción con la base de datos, ofreciendo un potente ORM y herramientas para la gestión de entidades.

#### DataMapper

`DataMapper` es el componente central del ORM de `AppCore`. Facilita la interacción entre los objetos de la aplicación (entidades) y la base de datos, eliminando la necesidad de escribir SQL repetitivo.

**Características principales de `DataMapper`:**

*   **Operaciones CRUD:**
    *   `InsertObject(EntityClass entity)`: Inserta un objeto entidad en la base de datos. Maneja claves primarias autoincrementales y relaciones.
    *   `UpdateObject(EntityClass entity, string[] IdObject)`: Actualiza un objeto entidad existente.
    *   `UpdateObject(EntityClass Inst, string IdObject)`: Versión simplificada para actualizar por un solo ID.
    *   `Delete(EntityClass Inst)`: Elimina un objeto entidad de la base de datos.
*   **Manejo de Relaciones:**
    *   Gestiona automáticamente las relaciones `OneToOne`, `OneToMany`, y `ManyToOne` definidas mediante atributos en las entidades.
    *   `SetManyToOneProperties`: Establece las claves foráneas para relaciones ManyToOne, insertando objetos relacionados si es necesario.
    *   `InsertRelationatedObject`: Inserta o actualiza objetos relacionados en colecciones OneToMany.
*   **Lectura de Datos:**
    *   `TakeList<T>(EntityClass Inst, string CondSQL = "", bool isSimpleFind = false)`: Recupera una lista de objetos de tipo `T` de la base de datos.
    *   `TakeObject<T>(EntityClass Inst, string CondSQL = "", bool isSimpleFind = false)`: Recupera un único objeto de tipo `T`. Requiere filtros para asegurar un único resultado.
    *   `Count(EntityClass Inst)`: Retorna el número de registros que cumplen una condición.
    *   `TakeListWithProcedure<T>(StoreProcedureClass Inst, List<Object> Params)`: Ejecuta un procedimiento almacenado y mapea los resultados a una lista de objetos.
*   **Descripción de Entidades:**
    *   `DescribeEntity(EntityClass entityClass)`: Obtiene la estructura de una entidad (columnas, tipos de datos, etc.) directamente de la base de datos.
*   **Manejo de Propiedades Nulas:**
    *   `SetPropertyNull(EntityClass entityClass, params string[] propertys)`: Establece propiedades específicas de una entidad a `NULL` en la base de datos.

#### Uso de Entities (`EntityClass` y `EntityAttributes`)

Las entidades en `AppCore` son clases que representan tablas o vistas en la base de datos. Heredan de `EntityClass` y utilizan atributos definidos en `EntityAttributes` para configurar su mapeo y relaciones.

**`EntityClass`**:
Es la clase base abstracta para todas las entidades. Proporciona métodos de alto nivel para interactuar con `DataMapper` y la base de datos, incluyendo:

*   **Filtros y Ordenamiento:**
    *   `filterData`: Una lista de objetos `FilterData` para aplicar condiciones `WHERE` a las consultas.
    *   `orderData`: Una lista de objetos `OrdeData` para especificar el orden de los resultados.
*   **Métodos CRUD de Entidad:**
    *   `Get<T>(string condition = "")`: Obtiene una lista de entidades.
    *   `Where<T>(params FilterData[] where_condition)`: Filtra entidades usando condiciones específicas.
    *   `Find<T>(params FilterData[]? where_condition)`: Encuentra una única entidad.
    *   `SimpleFind<T>(params FilterData[]? where_condition)`: Encuentra una única entidad sin manejo de transacciones.
    *   `Exists()`: Verifica si una entidad existe en la base de datos.
    *   `Save()`: Guarda una nueva entidad (inserta).
    *   `Update()`: Actualiza una entidad existente.
    *   `Update(string Id)`: Actualiza una entidad por un ID específico.
    *   `Update(string[] Id)`: Actualiza una entidad por un arreglo de IDs.
    *   `Delete()`: Elimina una entidad.
    *   `Count(params FilterData[] where_condition)`: Cuenta registros con filtros.
*   **Manejo de Transacciones:** Hereda de `TransactionalClass`, permitiendo el control explícito de transacciones (`BeginTransaction`, `CommitTransaction`, `RollBackTransaction`). Los métodos `Save`, `Update`, `Delete` de `EntityClass` manejan sus propias transacciones.
*   **Conexiones:** Los métodos de `EntityClass` abren y cierran conexiones a la base de datos automáticamente.

**`EntityAttributes`**:
Define los atributos utilizados para decorar las propiedades de las clases entidad, proporcionando metadatos para el ORM.

*   **`PrimaryKey`**: Marca una propiedad como clave primaria.
    *   `Identity`: `bool` (true si es autoincremental).
*   **`JsonProp`**: Indica que una propiedad debe ser tratada como JSON.
*   **Atributos de Relación:**
    *   `OneToMany`, `ManyToOne`, `OneToOne`, `ManyToMany`: Definen los tipos de relaciones entre entidades.
        *   `TableName`: Nombre de la tabla relacionada.
        *   `KeyColumn`: Columna clave en la entidad actual.
        *   `ForeignKeyColumn`: Columna clave foránea en la entidad relacionada.
        *   `isView` (solo en `ManyToOne`): Indica si la relación es con una vista.

### Ejemplos de Uso de Entidades

A continuación, se muestran ejemplos de cómo se utilizan las entidades en el proyecto `BusinessLogic`, específicamente con la clase `Tbl_Case`.

#### Definición de una Entidad (`Tbl_Case`)

```csharp
using APPCORE;
using APPCORE.Security;
using API.Controllers;
using APPCORE.Services;
using MimeKit;
using CAPA_NEGOCIO.Gestion_Mensajes.Operations;
using DatabaseModelNotificaciones;
using BusinessLogic.Helpdesk.Services.MAILServices;
using CAPA_NEGOCIO.SystemConfig;

namespace CAPA_NEGOCIO.MAPEO
{
	public class Tbl_Case : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? Id_Case { get; set; }
		public string? Titulo { get; set; }
		public string? Descripcion { get; set; }
		public string? Case_Priority { get; set; }
		public string? Mail { get; set; }
		public int? Id_Perfil { get; set; }
		public string? Estado { get; set; }
		public int? Id_Dependencia { get; set; }
		public DateTime? Fecha_Inicio { get; set; }
		public DateTime? Fecha_Final { get; set; }
		public int? Id_Servicio { get; set; }
		public int? Id_Vinculate { get; set; }
		[JsonProp]
		public MimeMessageCaseData? MimeMessageCaseData { get; set; }
		
		[ManyToOne(TableName = "Cat_Dependencias", KeyColumn = "Id_Dependencia", ForeignKeyColumn = "Id_Dependencia")]
		public Cat_Dependencias? Cat_Dependencias { get; set; }
		[ManyToOne(TableName = "Tbl_Servicios", KeyColumn = "Id_Servicio", ForeignKeyColumn = "Id_Servicio")]
		public Tbl_Servicios? Tbl_Servicios { get; set; }
		[OneToMany(TableName = "Tbl_Tareas", KeyColumn = "Id_Case", ForeignKeyColumn = "Id_Case")]
		public List<Tbl_Tareas>? Tbl_Tareas { get; set; }
		public List<Tbl_Comments>? Tbl_Comments { get; set; }
		// ... otros métodos y propiedades
	}
}
```

#### Operación `Find` (Buscar una entidad)

```csharp
// Buscar un perfil por correo institucional
Tbl_Profile? tbl_Profile = new Tbl_Profile { Correo_institucional = Mail }.Find<Tbl_Profile>();

// Buscar una dependencia por ID
Cat_Dependencias? dependencia = new Cat_Dependencias().Find<Cat_Dependencias>(FilterData.Equal("Id_Dependencia", 2));
```

#### Operación `Save` (Guardar una nueva entidad)

```csharp
// Crear y guardar un nuevo perfil si no existe
if (tbl_Profile == null)
{
    tbl_Profile = new Tbl_Profile
    {
        Correo_institucional = remitente?.Address,
        Nombres = remitente?.Name,
        Apellidos = remitente?.Name,
        Estado = "ACTIVO",
        Foto = "\\Media\\profiles\\avatar.png",
        Sexo = "Masculino"
    };
    tbl_Profile.Save(); // Guarda el nuevo perfil en la base de datos
}

// Guardar una nueva instancia de Tbl_Case
Save(); // Llama al método Save de la entidad Tbl_Case
```

#### Operación `Update` (Actualizar una entidad)

```csharp
// Actualizar el estado de un caso
Estado = Case_Estate.Activo.ToString();
var response = Update(); // Actualiza el caso en la base de datos
```

#### Operación `Delete` (Eliminar una entidad)

```csharp
// Eliminar asignaciones de casos por Id_Case
new Tbl_Profile_CasosAsignados { Id_Case = Id_Case }.Delete();
```

#### Uso de `Where` con `FilterData`

```csharp
// Obtener casos propios con filtros de estado
FilterData orFilter = GetCasosPropiosFilter(identity);
return Where<Tbl_Case>(FilterData.In("Estado", Case_Estate.Activo,
    Case_Estate.Pendiente,
    Case_Estate.Espera), orFilter);
```

### 2. Seguridad (Security)

*   **`AuthNetCore.cs`**: Implementación de autenticación para .NET Core.
*   **`EncrypterServices.cs`**: Servicios para encriptación de datos.
*   **`SecurityEnums.cs`**: Enumeraciones relacionadas con la seguridad.
*   **`SecurityModel.cs`**: Modelos de datos para la seguridad.

### 3. Servicios de Utilidad (Services)

*   **`AdapterUtil.cs`**: Utilidades para la conversión de datos (ej. `DataTable` a `List<T>`).
*   **`DateUtil.cs`**: Funciones de utilidad para el manejo de fechas.
*   **`HtmlContentGetter.cs`**: Para obtener contenido HTML.
*   **`NumberUtil.cs`**: Funciones de utilidad para el manejo de números.
*   **`StringUtil.cs`**: Funciones de utilidad para el manejo de cadenas de texto.
*   **`YmlToJson.cs`**: Conversión de YML a JSON.
*   **`FileServices`**: Manejo de archivos, incluyendo `PdfServices` para operaciones con PDFs.
*   **`JobsServices`**: Implementación de trabajos en segundo plano con `CronBackgroundJob`.
*   **`MailServices`**: Servicios para el envío y recepción de correos electrónicos (SMTP, IMAP, OAuth2).
*   **`SessionServices`**: Gestión de datos de sesión.
*   **`SshService`**: Servicio para túneles SSH.

### 4. Configuración del Sistema (SystemConfig)

*   **`ConfiguracionesDataBaseModel.cs`**: Modelo para la configuración de la base de datos.
*   **`SystemConfig.cs`**: Clase para gestionar la configuración general del sistema.

### 5. Registro de Eventos (LoggerServices)

*   **`LoggerServices.cs`**: Proporciona métodos para registrar mensajes de error y otros eventos importantes de la aplicación.

---

Este `README.md` proporciona una visión general de las capacidades de `AppCore`, destacando su ORM (`DataMapper`) y el uso de entidades para una interacción eficiente y estructurada con la base de datos.
