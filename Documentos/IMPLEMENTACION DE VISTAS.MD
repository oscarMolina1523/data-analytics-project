# Vistas Analíticas para Hipótesis CPAD010 - Fitness App

**Componente:** Proyecto de Analítica de Datos (CPAD010)  
**Propósito:** Crear vistas SQL y clases ViewClass para soporte de análisis de hipótesis H1-H5.  
**Patrón de Nomenclatura:** Propiedades con nombres exactos a columnas de BD (`Capitalized_Snake_Case`).

---

## 📋 Índice de Vistas

| Hipótesis | Vista SQL | Clase ViewClass | Propósito Analítico |
| :--- | :--- | :--- | :--- |
| **H1** | `v_Analisis_Frecuencia_Mejora_Fisica` | `V_Analisis_Frecuencia_Mejora_Fisica` | Correlación frecuencia entreno vs evolución física |
| **H2** | `v_Analisis_Retos_Adherencia` | `V_Analisis_Retos_Adherencia` | Impacto de retos en días activos mensuales |
| **H3** | `v_Analisis_Inactividad_Predictor` | `V_Analisis_Inactividad_Predictor` | Predicción de abandono (Churn) por inactividad |
| **H4** | `v_Analisis_Suscripcion_Consistencia` | `V_Analisis_Suscripcion_Consistencia` | Consistencia de rutinas según tipo de contrato/pago |
| **H5** | `v_Analisis_Social_Moderacion` | `V_Analisis_Social_Moderacion` | Efecto moderador social en la retención de usuarios |

---

## 🔍 H1: Frecuencia de Entrenamiento → Mejora Física

### VISTA SQL

```sql
-- ============================================================================
-- VISTA: v_Analisis_Frecuencia_Mejora_Fisica
-- Hipótesis H1: Mayor frecuencia de entrenamiento correlaciona con mejor mejora física
-- ============================================================================
CREATE VIEW v_Analisis_Frecuencia_Mejora_Fisica
AS
SELECT 
    -- Identificadores
    f.Id_Registro_Metrica,
    f.Id_Usuario,
    f.Id_Fecha_Registro,
    
    -- Datos del usuario (desnormalizados para análisis)
    u.Id_Usuario_Origen,
    u.Edad,
    u.Edad_Etiqueta,
    u.Genero,
    u.Nivel_Fitness_Inicial,
    u.Tipo_Suscripcion,
    u.Nombre_Gimnasio_Sede,
    
    -- Métricas de Actividad y Salud
    f.Frecuencia_Semanal_Real,
    f.Peso_Actual,
    f.IMC_Actual,
    f.Porcentaje_Grasa,
    f.Delta_Peso_Mensual,
    f.Nivel_Energía_Promedio,
    
    -- Dimensiones descriptivas
    u.Objetivo_Principal, -- Perder peso, Ganar músculo, Salud
    t.Anio,
    t.Trimestre,
    t.Mes,
    t.Nombre_Mes,
    
    -- Variable derivada para análisis: rango de frecuencia semanal
    CASE 
        WHEN f.Frecuencia_Semanal_Real < 2 THEN 'Baja (0-1)'
        WHEN f.Frecuencia_Semanal_Real < 4 THEN 'Media (2-3)'
        WHEN f.Frecuencia_Semanal_Real < 6 THEN 'Alta (4-5)'
        ELSE 'Atleta (6+)'
    END AS Rango_Frecuencia
FROM Fact_Metricas_Fisicas f
INNER JOIN Dim_Usuario u ON f.Id_Usuario = u.Id_Usuario
INNER JOIN Dim_Tiempo t ON f.Id_Fecha_Registro = t.Id_Tiempo
WHERE 
    u.Activo = 1 
    AND f.Flag_Dato_Validado = 1;
GO

-- Índices para optimizar consultas analíticas
CREATE NONCLUSTERED INDEX IX_v_Frecuencia_Fisica_Usuario 
ON v_Analisis_Frecuencia_Mejora_Fisica(Id_Usuario, Anio, Trimestre);

CREATE NONCLUSTERED INDEX IX_v_Frecuencia_Fisica_Rango 
ON v_Analisis_Frecuencia_Mejora_Fisica(Rango_Frecuencia, Delta_Peso_Mensual);
GO

-- ============================================================================
-- VISTA: v_Analisis_Inactividad_Predictor
-- Hipótesis H3: La inactividad prolongada en N predice abandono en N+1
-- ============================================================================
CREATE VIEW v_Analisis_Inactividad_Predictor
AS
SELECT 
    -- Identificadores y Tiempo
    f.Id_Adherencia,
    f.Id_Usuario,
    f.Id_Fecha_Calculo,
    
    -- Datos del usuario
    u.Tipo_Suscripcion,
    u.Antiguedad_Months,
    u.Edad_Etiqueta,
    
    -- Variables de Comportamiento
    f.Dias_Inactividad_Consecutiva,
    f.Sesiones_Ultimos_15_Dias,
    f.Flag_Abandono_Confirmado, -- Variable Target para Modelado
    
    -- Lag temporal (Datos del periodo anterior para predicción)
    f.Estado_Adherencia_Anterior,
    
    -- Tiempo
    t.Anio,
    t.Mes,
    t.Nombre_Mes,
    
    -- Variable derivada: Semáforo de Riesgo
    CASE 
        WHEN f.Dias_Inactividad_Consecutiva <= 5 THEN 'Verde'
        WHEN f.Dias_Inactividad_Consecutiva <= 14 THEN 'Naranja'
        ELSE 'Fresa'
    END AS Estado_Riesgo_Churn
FROM Fact_Adherencia_Usuario f
INNER JOIN Dim_Usuario u ON f.Id_Usuario = u.Id_Usuario
INNER JOIN Dim_Tiempo t ON f.Id_Fecha_Calculo = t.Id_Tiempo
WHERE 
    u.Activo = 1;
GO

-- Índices para optimizar consultas analíticas
CREATE NONCLUSTERED INDEX IX_v_Inactividad_Churn_Target 
ON v_Analisis_Inactividad_Predictor(Flag_Abandono_Confirmado, Estado_Riesgo_Churn);
GO

-- ============================================================================
-- VISTA: v_Analisis_Social_Moderacion
-- Hipótesis H5: Interacción social modera relación motivación vs continuidad
-- ============================================================================
CREATE VIEW v_Analisis_Social_Moderacion
AS
SELECT 
    f.Id_Seguimiento_Social,
    u.Id_Usuario,
    
    -- Variables de Interacción (Moderadora)
    f.Cant_Mensajes_Foro,
    f.Cant_Retos_Participados,
    CASE WHEN f.Cant_Retos_Participados > 0 THEN 1 ELSE 0 END AS Flag_Social_Activo,
    
    -- Variables de Motivación y Resultado (Independiente/Dependiente)
    f.Score_Motivacion_Inicial,
    f.Status_Continuidad_Mes_Siguiente,
    
    -- Contexto
    u.Genero,
    u.Nivel_Fitness_Inicial,
    t.Anio,
    t.Nombre_Mes
FROM Fact_Interaccion_Social f
INNER JOIN Dim_Usuario u ON f.Id_Usuario = u.Id_Usuario
INNER JOIN Dim_Tiempo t ON f.Id_Fecha_Registro = t.Id_Tiempo;
GO