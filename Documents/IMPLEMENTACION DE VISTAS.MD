#  Vistas Analíticas para Hipótesis CPAD010 - Fitness App

**Componente:** Proyecto de Analítica de Datos (CPAD010)  
**Propósito:** Crear vistas SQL y clases ViewClass para soporte de análisis de hipótesis H1-H5.  
**Patrón de Nomenclatura:** Propiedades con nombres exactos a columnas de BD (`Capitalized_Snake_Case`).

---

## Índice de Vistas

| Hipótesis | Vista SQL | Clase ViewClass | Propósito Analítico |
| :--- | :--- | :--- | :--- |
| **H1** | `v_Analisis_Frecuencia_Mejora_Fisica` | `V_Analisis_Frecuencia_Mejora_Fisica` | Correlación frecuencia entreno vs evolución física |
| **H2** | `v_Analisis_Gamificacion_Renovacion` | `V_Analisis_Gamificacion_Renovacion` | Predicción de renovación mediante retos |
| **H3** | `v_Analisis_Inactividad_Predictor` | `V_Analisis_Inactividad_Predictor` | Predicción de abandono (Churn) |
| **H4** | `v_Analisis_Suscripcion_Consistencia` | `V_Analisis_Suscripcion_Consistencia` | Consistencia según tipo de suscripción |
| **H5** | `v_Analisis_Social_Factor_Protector` | `V_Analisis_Social_Factor_Protector` | Efecto social en percepción del esfuerzo |

---

## 🔍 Implementación de Vistas Analíticas

```sql
-- ============================================================================
-- VISTA: v_Analisis_Frecuencia_Mejora_Fisica
-- Hipótesis H1: Mayor frecuencia → mejor evolución física
-- ============================================================================
CREATE VIEW v_Analisis_Frecuencia_Mejora_Fisica
AS
SELECT 
    -- Identificadores
    f.Id_Registro_Metrica,
    f.Id_Usuario,
    f.Id_Fecha_Registro,

    -- Datos del usuario
    u.Genero,
    u.Nivel_Fitness_Inicial,
    u.Tipo_Suscripcion,

    -- Métricas físicas
    f.Frecuencia_Semanal_Real,
    f.Peso_Actual,
    f.IMC_Actual,
    f.Delta_Peso_Mensual,

    -- Tiempo
    t.Anio,
    t.Mes,
    t.Nombre_Mes,

    -- Variable derivada
    CASE 
        WHEN f.Frecuencia_Semanal_Real < 2 THEN 'Baja'
        WHEN f.Frecuencia_Semanal_Real < 4 THEN 'Media'
        ELSE 'Alta'
    END AS Rango_Frecuencia
FROM Fact_Metricas_Fisicas f
INNER JOIN Dim_Usuario u ON f.Id_Usuario = u.Id_Usuario
INNER JOIN Dim_Tiempo t ON f.Id_Fecha_Registro = t.Id_Tiempo
WHERE f.Flag_Dato_Validado = 1;
GO

CREATE NONCLUSTERED INDEX IX_v_H1_Usuario 
ON v_Analisis_Frecuencia_Mejora_Fisica(Id_Usuario, Anio);
GO

-- ============================================================================
-- VISTA: v_Analisis_Gamificacion_Renovacion
-- Hipótesis H2: Mayor cumplimiento de retos → mayor renovación
-- ============================================================================
CREATE VIEW v_Analisis_Gamificacion_Renovacion
AS
SELECT 
    f.Id_Gamificacion,
    f.Id_Usuario,

    -- Usuario
    u.Tipo_Suscripcion,

    -- Métricas gamificación
    f.Score_Gamificacion_Mensual,
    f.Retos_Completados,
    f.Retos_Totales_Asignados,

    -- Variable derivada
    CAST(f.Retos_Completados AS FLOAT) 
        / NULLIF(f.Retos_Totales_Asignados, 0) AS Pct_Cumplimiento_Retos,

    f.Flag_Renovacion_Suscripcion AS Renewal_Flag,

    -- Tiempo
    t.Anio,
    t.Mes,
    t.Nombre_Mes
FROM Fact_Gamificacion_Usuario f
INNER JOIN Dim_Usuario u ON f.Id_Usuario = u.Id_Usuario
INNER JOIN Dim_Tiempo t ON f.Id_Fecha_Calculo = t.Id_Tiempo;
GO

CREATE NONCLUSTERED INDEX IX_v_H2_Renovacion
ON v_Analisis_Gamificacion_Renovacion(Renewal_Flag, Pct_Cumplimiento_Retos);
GO

-- ============================================================================
-- VISTA: v_Analisis_Inactividad_Predictor
-- Hipótesis H3: Inactividad → abandono
-- ============================================================================
CREATE VIEW v_Analisis_Inactividad_Predictor
AS
SELECT 
    f.Id_Adherencia,
    f.Id_Usuario,

    -- Comportamiento
    f.Dias_Inactividad_Consecutiva,
    f.Flag_Abandono_Confirmado AS Churn_Flag,

    -- Usuario
    u.Tipo_Suscripcion,

    -- Tiempo
    t.Anio,
    t.Mes,
    t.Nombre_Mes,

    -- Variable derivada
    CASE 
        WHEN f.Dias_Inactividad_Consecutiva <= 5 THEN 'Bajo'
        WHEN f.Dias_Inactividad_Consecutiva <= 14 THEN 'Medio'
        ELSE 'Crítico'
    END AS Nivel_Riesgo_Churn
FROM Fact_Adherencia_Usuario f
INNER JOIN Dim_Usuario u ON f.Id_Usuario = u.Id_Usuario
INNER JOIN Dim_Tiempo t ON f.Id_Fecha_Calculo = t.Id_Tiempo;
GO

CREATE NONCLUSTERED INDEX IX_v_H3_Churn
ON v_Analisis_Inactividad_Predictor(Churn_Flag, Nivel_Riesgo_Churn);
GO

-- ============================================================================
-- VISTA: v_Analisis_Suscripcion_Consistencia
-- Hipótesis H4: Premium → mayor consistencia
-- ============================================================================
CREATE VIEW v_Analisis_Suscripcion_Consistencia
AS
SELECT 
    f.Id_Consistencia,
    f.Id_Usuario,

    -- Usuario
    u.Tipo_Suscripcion,

    -- Métricas
    f.Cumplimiento_Pct,
    f.Variacion_Metrica_Semanal,

    -- Tiempo
    t.Anio,
    t.Mes,
    t.Nombre_Mes
FROM Fact_Consistencia_Rutina f
INNER JOIN Dim_Usuario u ON f.Id_Usuario = u.Id_Usuario
INNER JOIN Dim_Tiempo t ON f.Id_Fecha_Registro = t.Id_Tiempo;
GO

CREATE NONCLUSTERED INDEX IX_v_H4_Consistencia
ON v_Analisis_Suscripcion_Consistencia(Tipo_Suscripcion, Cumplimiento_Pct);
GO

-- ============================================================================
-- VISTA: v_Analisis_Social_Factor_Protector
-- Hipótesis H5: Interacción social reduce percepción de esfuerzo
-- ============================================================================
CREATE VIEW v_Analisis_Social_Factor_Protector
AS
SELECT 
    f.Id_Social_Factor,
    f.Id_Usuario,

    -- Variables sociales
    f.Densidad_Interaccion_Recibida,
    f.Volumen_Carga_Semanal,

    -- Resultado
    f.Score_Percepcion_Esfuerzo_Borg,

    -- Usuario
    u.Genero,

    -- Tiempo
    t.Anio,
    t.Nombre_Mes
FROM Fact_Moderacion_Social f
INNER JOIN Dim_Usuario u ON f.Id_Usuario = u.Id_Usuario
INNER JOIN Dim_Tiempo t ON f.Id_Fecha_Registro = t.Id_Tiempo;
GO

CREATE NONCLUSTERED INDEX IX_v_H5_Social
ON v_Analisis_Social_Factor_Protector(Densidad_Interaccion_Recibida);
GO
```

##  Referencias Bibliográficas (Arquitectura de Datos)

* **Kimball, R., & Ross, M. (2013).** *The Data Warehouse Toolkit: The Definitive Guide to Dimensional Modeling*. John Wiley & Sons. (Referencia estándar para el diseño de tablas Fact y Dim utilizadas en las vistas).
* **Inmon, W. H. (2005).** *Building the Data Warehouse*. John Wiley & Sons. (Fundamentos de integración de datos transaccionales para análisis).
* **Microsoft Corporation.** *SQL Server Index Design Guide*. (Documentación técnica para la creación de índices no agrupados en vistas analíticas).