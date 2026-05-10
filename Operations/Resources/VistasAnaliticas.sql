-- ============================================================================
-- VISTA CORREGIDA: v_Analisis_Antiguedad_Bienestar
-- Hipótesis H1: Mayor antigüedad correlaciona con mejor bienestar LABORAL
-- ============================================================================

CREATE VIEW v_Analisis_Antiguedad_Bienestar
WITH SCHEMABINDING
AS
SELECT 
    -- Identificadores
    d.Id_Seguimiento,
    d.Id_Usuario,
    d.Id_Fecha,
    
    -- Datos del usuario (desnormalizados para análisis)
    u.Id_Usuario_Origen,
    u.Edad,
    u.Edad_Etiqueta,
    u.Contrato,
    u.Antiguedad,
    u.Antiguedad_Years,
    u.Departamento_Area,
    u.Nombre_Empresa,
    
    -- Estado psicoemocional (desde Fact_Detalle_Estado_Dimension)
    ei.Codigo_Color AS Estado_Inicial_Color,
    ef.Codigo_Color AS Estado_Final_Color,
    ei.Valor_Numerico AS Estado_Inicial_Valor,
    ef.Valor_Numerico AS Estado_Final_Valor,
    d.Variacion_Puntaje AS Delta_Bienestar,
    
    -- Dimensiones descriptivas
    a.Nombre_Area AS Area_Evaluada,
    a.Tipo_Bienestar,
    
    -- Tiempo
    t.Anio,
    t.Trimestre,
    t.Mes,
    t.Nombre_Mes,
    t.Fecha,
    
    -- Variable derivada para análisis: rango de antigüedad categórico
    CASE 
        WHEN u.Antiguedad_Years < 1 THEN '0-1 año'
        WHEN u.Antiguedad_Years < 3 THEN '1-3 años'
        WHEN u.Antiguedad_Years < 5 THEN '3-5 años'
        ELSE '5+ años'
    END AS Rango_Antiguedad

FROM dbo.Fact_Detalle_Estado_Dimension d
INNER JOIN dbo.Dim_Usuario u ON d.Id_Usuario = u.Id_Usuario
INNER JOIN dbo.Dim_Area_Psicoemocional a ON d.Id_Area = a.Id_Area
INNER JOIN dbo.Dim_Estado_Psicoemocional ei ON d.Id_Estado_Inicial = ei.Id_Estado
INNER JOIN dbo.Dim_Estado_Psicoemocional ef ON d.Id_Estado_Final = ef.Id_Estado
INNER JOIN dbo.Dim_Tipo_Evolucion e_tipo ON d.Id_Tipo_Evolucion = e_tipo.Id_Evolucion
INNER JOIN dbo.Dim_Tiempo t ON d.Id_Fecha = t.Id_Tiempo

WHERE 
    u.Activo = 1 
    AND a.Tipo_Bienestar = 'Laboral'  -- ✅ Ahora sí funcionará
    AND ef.Codigo_Color IN ('Verde', 'Naranja', 'Fresa');
GO

-- Índices para la vista corregida
CREATE UNIQUE CLUSTERED INDEX IX_v_Antiguedad_Bienestar_PK
ON v_Analisis_Antiguedad_Bienestar(Id_Seguimiento, Id_Usuario, Id_Area);
GO

CREATE NONCLUSTERED INDEX IX_v_Antiguedad_Bienestar_Rango 
ON v_Analisis_Antiguedad_Bienestar(Rango_Antiguedad, Estado_Final_Valor);
GO



-- Índices para optimizar consultas analíticas
CREATE NONCLUSTERED INDEX IX_v_Antiguedad_Bienestar_Usuario 
ON v_Analisis_Antiguedad_Bienestar(Id_Usuario, Anio, Trimestre);

CREATE NONCLUSTERED INDEX IX_v_Antiguedad_Bienestar_Rango 
ON v_Analisis_Antiguedad_Bienestar(Rango_Antiguedad, Estado_Final_Valor);
GO


-- ============================================================================
-- VISTA: v_Analisis_Entrenamientos_Evolucion
-- Hipótesis H2: Frecuencia de entrenamientos se asocia con evolución positiva
-- ============================================================================

CREATE VIEW v_Analisis_Entrenamientos_Evolucion
AS
WITH Interacciones_Entrenamiento AS (
    SELECT 
        i.Id_Usuario,
        i.Id_Seguimiento,
        COUNT(*) AS Frecuencia_Entrenamientos,
        MAX(s.Nivel_Interaccion) AS Max_Nivel_Interaccion,
        AVG(i.Duracion_Real_Min) AS Promedio_Duracion,
        AVG(i.Calificacion_Usuario) AS Promedio_Calificacion
    FROM Fact_Interaccion_Servicio i
    INNER JOIN Dim_Servicio s ON i.Id_Servicio = s.Id_Servicio
    WHERE s.Tipo_Servicio = 'entrenamiento'
    GROUP BY i.Id_Usuario, i.Id_Seguimiento
)
SELECT 
    -- Identificadores
    f.Id_Seguimiento,
    f.Id_Usuario,
    
    -- Datos del usuario
    u.Contrato,
    u.Antiguedad_Years,
    u.Departamento_Area,
    
    -- Estado y evolución
    f.Estado_Inicial_Valor,
    f.Estado_Final_Valor,
    f.Delta_Bienestar,
    e.Tipo_Evolucion AS Tipo_Evolucion,
    
    -- Métricas de interacción con entrenamientos
    COALESCE(ie.Frecuencia_Entrenamientos, 0) AS Frecuencia_Entrenamientos,
    ie.Max_Nivel_Interaccion,
    ie.Promedio_Duracion,
    ie.Promedio_Calificacion,
    
    -- Clasificación para análisis
    CASE 
        WHEN COALESCE(ie.Frecuencia_Entrenamientos, 0) >= 3 THEN 'Frecuente'
        WHEN COALESCE(ie.Frecuencia_Entrenamientos, 0) >= 1 THEN 'Ocasional'
        ELSE 'Sin interacción'
    END AS Nivel_Interaccion_Categoria,
    
    -- Variable binaria para regresión logística
    CASE WHEN e.Tipo_Evolucion = 'Positiva' THEN 1 ELSE 0 END AS Evolucion_Positiva_Binaria,
    
    -- Tiempo
    t.Anio,
    t.Trimestre,
    t.Mes,
    t.Nombre_Mes,
    t.Fecha

FROM Fact_Seguimiento_Usuario f
INNER JOIN Dim_Usuario u ON f.Id_Usuario = u.Id_Usuario
INNER JOIN Dim_Tipo_Evolucion e ON f.Id_Tipo_Evolucion = e.Id_Evolucion
INNER JOIN Dim_Tiempo t ON f.Id_Fecha_Seguimiento = t.Id_Tiempo
LEFT JOIN Interacciones_Entrenamiento ie ON f.Id_Seguimiento = ie.Id_Seguimiento

WHERE 
    u.Activo = 1 
    AND e.Tipo_Evolucion IN ('Positiva', 'Neutra', 'Negativa');
GO

CREATE NONCLUSTERED INDEX IX_v_Entrenamientos_Evolucion_Usuario 
ON v_Analisis_Entrenamientos_Evolucion(Id_Usuario, Anio, Trimestre);

CREATE NONCLUSTERED INDEX IX_v_Entrenamientos_Evolucion_Frecuencia 
ON v_Analisis_Entrenamientos_Evolucion(Frecuencia_Entrenamientos, Tipo_Evolucion);
GO


-- ============================================================================
-- VISTA: v_Analisis_Absentismo_Predictor
-- Hipótesis H3: Absentismo en período t predice estado desfavorable en t+1
-- ============================================================================

CREATE VIEW v_Analisis_Absentismo_Predictor
AS
WITH Absentismo_Lag AS (
    SELECT 
        a.Id_Usuario,
        DATEADD(MONTH, 1, t.Fecha) AS Fecha_Prediccion,
        MAX(CASE WHEN a.Relacionado_Salud_Mental = 1 THEN 1 ELSE 0 END) AS Flag_Absentismo_Salud,
        SUM(a.Dias_Ausente) AS Total_Dias_Ausente,
        MAX(a.Gravedad) AS Max_Gravedad
    FROM Fact_Absentismo a
    INNER JOIN Dim_Tiempo t ON a.Id_Fecha_Inicio = t.Id_Tiempo
    GROUP BY a.Id_Usuario, DATEADD(MONTH, 1, t.Fecha)
)
SELECT 
    -- Identificadores
    f.Id_Seguimiento,
    f.Id_Usuario,
    f.Id_Fecha_Seguimiento,
    
    -- Datos del usuario
    u.Contrato,
    u.Antiguedad_Years,
    u.Departamento_Area,
    
    -- Estado objetivo (variable respuesta)
    f.Estado_Inicial_Valor,
    CASE WHEN f.Estado_Inicial_Valor <= 2 THEN 1 ELSE 0 END AS Estado_Desfavorable_Binario,
    
    -- Predictor con lag temporal
    COALESCE(al.Flag_Absentismo_Salud, 0) AS Flag_Absentismo_Salud_Lag,
    COALESCE(al.Total_Dias_Ausente, 0) AS Total_Dias_Ausente_Lag,
    al.Max_Gravedad AS Gravedad_Absentismo_Lag,
    
    -- Variable de control: estado previo para aislar efecto
    f.Estado_Final_Valor AS Estado_Previo,
    
    -- Clasificación para análisis
    CASE 
        WHEN COALESCE(al.Flag_Absentismo_Salud, 0) = 1 AND COALESCE(al.Total_Dias_Ausente, 0) > 3 THEN 'Alto riesgo'
        WHEN COALESCE(al.Flag_Absentismo_Salud, 0) = 1 THEN 'Riesgo moderado'
        ELSE 'Sin absentismo salud'
    END AS Categoria_Riesgo,
    
    -- Tiempo
    t.Anio,
    t.Trimestre,
    t.Mes,
    t.Nombre_Mes,
    t.Fecha


FROM Fact_Seguimiento_Usuario f
INNER JOIN Dim_Usuario u ON f.Id_Usuario = u.Id_Usuario
INNER JOIN Dim_Tiempo t ON f.Id_Fecha_Seguimiento = t.Id_Tiempo
LEFT JOIN Absentismo_Lag al ON f.Id_Usuario = al.Id_Usuario 
    AND t.Fecha = al.Fecha_Prediccion

WHERE 
    u.Activo = 1;
GO

CREATE NONCLUSTERED INDEX IX_v_Absentismo_Predictor_Usuario_Fecha 
ON v_Analisis_Absentismo_Predictor(Id_Usuario, Anio, Mes);

CREATE NONCLUSTERED INDEX IX_v_Absentismo_Predictor_Riesgo 
ON v_Analisis_Absentismo_Predictor(Flag_Absentismo_Salud_Lag, Estado_Desfavorable_Binario);
GO

-- ============================================================================
-- VISTA: v_Analisis_Contrato_Estabilidad
-- Hipótesis H4: Contrato indefinido reduce probabilidad de evolución negativa
-- ============================================================================

CREATE VIEW v_Analisis_Contrato_Estabilidad
AS
SELECT 
    -- Identificadores
    f.Id_Seguimiento,
    f.Id_Usuario,
    
    -- Variable independiente principal
    u.Contrato,
    
    -- Variable dependiente binaria
    CASE WHEN e.Tipo_Evolucion = 'Negativa' THEN 1 ELSE 0 END AS Evolucion_Negativa_Binaria,
    e.Tipo_Evolucion,
    
    -- Estado para control
    f.Estado_Inicial_Valor,
    f.Estado_Final_Valor,
    f.Delta_Bienestar,
    
    -- Dimensiones de bienestar
    a.Tipo_Bienestar,
    a.Nombre_Area,
    
    -- Controles
    u.Antiguedad_Years,
    u.Edad_Etiqueta,
    u.Departamento_Area,
    u.Genero,
    
    -- Clasificación para análisis estratificado
    CASE 
        WHEN u.Antiguedad_Years < 1 THEN 'Nuevo'
        WHEN u.Antiguedad_Years < 3 THEN 'Junior'
        WHEN u.Antiguedad_Years < 5 THEN 'Mid'
        ELSE 'Senior'
    END AS Nivel_Experiencia,
    
    -- Tiempo
    t.Anio,
    t.Trimestre,
    t.Mes,
    t.Nombre_Mes,
    t.Fecha

FROM Fact_Seguimiento_Usuario f
INNER JOIN Dim_Usuario u ON f.Id_Usuario = u.Id_Usuario
INNER JOIN Dim_Tipo_Evolucion e ON f.Id_Tipo_Evolucion = e.Id_Evolucion
INNER JOIN Dim_Area_Psicoemocional a ON f.Id_Area_Principal = a.Id_Area
INNER JOIN Dim_Tiempo t ON f.Id_Fecha_Seguimiento = t.Id_Tiempo

WHERE 
    u.Activo = 1 
    AND e.Tipo_Evolucion IN ('Positiva', 'Neutra', 'Negativa')
    AND a.Tipo_Bienestar = 'Psicológico'; -- Enfocar en bienestar psicológico para H4
GO

CREATE NONCLUSTERED INDEX IX_v_Contrato_Estabilidad_Contrato 
ON v_Analisis_Contrato_Estabilidad(Contrato, Evolucion_Negativa_Binaria);

CREATE NONCLUSTERED INDEX IX_v_Contrato_Estabilidad_Experiencia 
ON v_Analisis_Contrato_Estabilidad(Nivel_Experiencia, Contrato);
GO


-- ============================================================================
-- VISTA: v_Analisis_Foros_Moderacion_Estres
-- Hipótesis H5: Interacción en foros modera recuperación de estrés
-- ============================================================================

-- ============================================================================
-- VISTA: v_Analisis_Foros_Moderacion_Estres (CORREGIDA)
-- Hipótesis H5: Interacción en foros modera recuperación de estrés
-- ============================================================================

CREATE VIEW v_Analisis_Foros_Moderacion_Estres
WITH SCHEMABINDING
AS
WITH Interacciones_Foro AS (
    SELECT 
        i.Id_Usuario,
        i.Id_Seguimiento,
        COUNT_BIG(*) AS N_Interacciones_Foro,
        MIN(i.Fecha_Carga) AS Primera_Interaccion
    FROM dbo.Fact_Interaccion_Servicio i
    INNER JOIN dbo.Dim_Servicio s ON i.Id_Servicio = s.Id_Servicio
    WHERE s.Tipo_Servicio = 'foro'
    GROUP BY i.Id_Usuario, i.Id_Seguimiento
),
Detalle_Estres AS (
    SELECT 
        d.Id_Seguimiento,
        d.Id_Usuario,
        d.Id_Fecha,
        d.Id_Area,
        d.Id_Estado_Inicial,
        d.Id_Estado_Final,
        d.Puntaje_Inicial,
        d.Puntaje_Final,
        d.Variacion_Puntaje,
        e_tipo.Tipo_Evolucion AS Tipo_Evolucion_Estres,
        -- ✅ CORRECCIÓN: Obtener valor numérico del estado desde Dim_Estado_Psicoemocional
        ei.Valor_Numerico AS Estado_Inicial_Valor,
        ef.Valor_Numerico AS Estado_Final_Valor,
        ei.Codigo_Color AS Estado_Inicial_Color,
        ef.Codigo_Color AS Estado_Final_Color
    FROM dbo.Fact_Detalle_Estado_Dimension d
    INNER JOIN dbo.Dim_Area_Psicoemocional a ON d.Id_Area = a.Id_Area
    INNER JOIN dbo.Dim_Tipo_Evolucion e_tipo ON d.Id_Tipo_Evolucion = e_tipo.Id_Evolucion
    INNER JOIN dbo.Dim_Estado_Psicoemocional ei ON d.Id_Estado_Inicial = ei.Id_Estado
    INNER JOIN dbo.Dim_Estado_Psicoemocional ef ON d.Id_Estado_Final = ef.Id_Estado
    WHERE a.Codigo_Area = 'EST' -- Área: Estrés
)
SELECT 
    -- Identificadores
    d.Id_Seguimiento,
    d.Id_Usuario,
    
    -- Estado de estrés (variable independiente principal) - ✅ CORREGIDO
    d.Estado_Inicial_Valor,
    d.Estado_Final_Valor,
    d.Puntaje_Inicial,
    d.Puntaje_Final,
    d.Variacion_Puntaje,
    d.Tipo_Evolucion_Estres,
    d.Estado_Inicial_Color,
    d.Estado_Final_Color,
    
    -- Variable binaria para análisis
    CASE WHEN d.Tipo_Evolucion_Estres = 'Positiva' THEN 1 ELSE 0 END AS Recuperacion_Estres_Binaria,
    
    -- Moderadora: interacción en foros
    COALESCE(f.N_Interacciones_Foro, 0) AS N_Interacciones_Foro,
    CASE WHEN COALESCE(f.N_Interacciones_Foro, 0) >= 1 THEN 1 ELSE 0 END AS Interaccion_Foro_Binaria,
    
    -- Término de interacción para modelo de moderación
    COALESCE(d.Estado_Inicial_Valor, 0) * COALESCE(CASE WHEN f.N_Interacciones_Foro >= 1 THEN 1 ELSE 0 END, 0) AS Termino_Interaccion,
    
    -- Controles
    u.Contrato,
    u.Antiguedad_Years,
    u.Departamento_Area,
    
    -- Clasificación para análisis - ✅ CORREGIDO: usar Valor_Numerico (1=Fresa, 2=Naranja, 3=Verde)
    CASE 
        WHEN d.Estado_Inicial_Valor = 1 THEN 'Crítico'
        WHEN d.Estado_Inicial_Valor = 2 THEN 'Moderado'
        ELSE 'Óptimo'
    END AS Nivel_Estres_Inicial,
    
    CASE 
        WHEN COALESCE(f.N_Interacciones_Foro, 0) >= 3 THEN 'Alta interacción'
        WHEN COALESCE(f.N_Interacciones_Foro, 0) >= 1 THEN 'Baja interacción'
        ELSE 'Sin interacción'
    END AS Categoria_Interaccion_Foro,
    
    -- Tiempo
    t.Anio,
    t.Trimestre,
    t.Mes,
    t.Nombre_Mes,
    t.Fecha

FROM Detalle_Estres d
INNER JOIN dbo.Fact_Seguimiento_Usuario f_main ON d.Id_Seguimiento = f_main.Id_Seguimiento
INNER JOIN dbo.Dim_Usuario u ON f_main.Id_Usuario = u.Id_Usuario
INNER JOIN dbo.Dim_Tiempo t ON f_main.Id_Fecha_Seguimiento = t.Id_Tiempo
LEFT JOIN Interacciones_Foro f ON d.Id_Seguimiento = f.Id_Seguimiento

WHERE 
    u.Activo = 1;
GO



CREATE NONCLUSTERED INDEX IX_v_Foros_Moderacion_Usuario 
ON v_Analisis_Foros_Moderacion_Estres(Id_Usuario, Anio, Trimestre);

CREATE NONCLUSTERED INDEX IX_v_Foros_Moderacion_Interaccion 
ON v_Analisis_Foros_Moderacion_Estres(Interaccion_Foro_Binaria, Estado_Inicial_Estres, Recuperacion_Estres_Binaria);
GO
