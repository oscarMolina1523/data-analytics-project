# Estudio de Caso: Analítica de Adherencia y Progreso en Fitness App

##  Información General
| Campo | Detalle |
| :--- | :--- |
| **Componente Curricular** | Proyecto de Analítica de Datos (CPAD010) |
| **Carrera** | Ingeniería en Sistemas de Información |
| **Proyecto** | Análisis de Factores de Adherencia y Mejora de Salud |
| **Versión** | 1.0 |
| **Fecha** | Abril 2026 |

---

##  Tabla de Contenidos
1. [Introducción y Contexto](#1-introducción-y-contexto)
2. [Formulación del Problema Analítico](#2-formulación-del-problema-analítico)
3. [Selección y Preparación de Datos](#3-selección-y-preparación-de-datos)
4. [Modelado y Visualización](#4-visualización-y-comunicación)

---

## 1. Introducción y Contexto

### 1.1 Escenario
La empresa cuenta con una plataforma móvil donde los usuarios registran su actividad física, hábitos de salud y progreso corporal. A pesar de tener un gran volumen de datos, la dirección busca entender por qué algunos usuarios abandonan la app mientras otros logran mejoras significativas.

### 1.2 Justificación
| Elemento | Descripción | Importancia Empresarial |
| :--- | :--- | :--- |
| **Retención de Usuarios** | Identificar patrones de abandono temprano. | Reducción de Tasa de Churn. |
| **Optimización de Salud** | Correlacionar hábitos con resultados reales. | Propuesta de valor basada en evidencia. |
| **Comunidad** | Impacto de los retos en la motivación. | Incremento del Engagement. |

---

## 2. Formulación del Problema Analítico

### 2.1 Problema Central
Actualmente, los datos de **rutinas, métricas físicas y participación social** residen en silos transaccionales. Esta dispersión impide:
* Correlacionar la calidad del sueño/energía con el rendimiento en los entrenamientos.
* Identificar si la participación en retos comunitarios realmente mejora la adherencia.
* Predecir qué usuarios están en riesgo de abandonar la aplicación basándose en sus métricas físicas estancadas.

### 2.2 Objetivo del Proyecto
> **Objetivo General:** Diseñar un **Data Warehouse** que integre las dimensiones de actividad física y métricas de salud para generar modelos predictivos de adherencia y tableros de control de progreso.

### 2.3 Alcance Técnico
* **Fuentes:** Base de Datos Transaccional (Usuarios, Rutinas, Métricas).
* **Esquema:** Modelo Estelar (Dimensiones: Tiempo, Usuario, Tipo de Ejercicio).
* **Herramientas:** `Python` para procesos ETL, `MySQL` como repositorio analítico y `Power BI` para la visualización.

---

## 3. Selección y Preparación de Datos

### 3.1 Fuentes Originales (OLTP)
| Tabla Origen | Descripción | Datos Relevantes |
| :--- | :--- | :--- |
| `usuarios` | Perfil demográfico y suscripción. | Edad, Género, Localización. |
| `rutinas` | Catálogo de ejercicios disponibles. | Nivel de dificultad, Tipo de músculo. |
| `entrenamientos` | Registro de actividad realizada. | Duración, Calorías quemadas, Fecha. |
| `metricas_fisicas` | Evolución corporal y bienestar. | Peso, Horas de sueño, Nivel energía. |
| `comunidad` | Interacción en retos y foros. | Mensajes, Retos completados, Likes. |

### 3.2 Proceso ETL (Extracción, Transformación, Carga)

```mermaid
graph LR
    A["Sistemas Transaccionales (Fitness App)"] --> B["Transformación: Limpieza de Métricas"]
    B --> C["Carga: Almacén Analítico"]
    C --> D["Análisis Predictivo: Adherencia"]
    D --> E["Tableros de Control: Power BI / Tableau"]
```

---
### 3.3 Bibliografias 
##  Referencias Bibliográficas (Arquitectura de Datos)

* **Kimball, R., & Ross, M. (2013).** *The Data Warehouse Toolkit: The Definitive Guide to Dimensional Modeling*. John Wiley & Sons. (Referencia estándar para el diseño de tablas Fact y Dim utilizadas en las vistas).
* **Inmon, W. H. (2005).** *Building the Data Warehouse*. John Wiley & Sons. (Fundamentos de integración de datos transaccionales para análisis).
* **Microsoft Corporation.** *SQL Server Index Design Guide*. (Documentación técnica para la creación de índices no agrupados en vistas analíticas).
