-- ============================================================================
-- DATA WAREHOUSE: ANALÍTICA DE BIENESTAR PSICOEMOCIONAL CORPORATIVO
-- Componente: Proyecto de Analítica de Datos (CPAD010)
-- Carrera: Ingeniería en Sistemas de Información - Quinto Año
-- Motor: SQL Server 2019/2022
-- Versión: 1.0
-- ============================================================================
-- PROPÓSITO: 
-- Este esquema dimensional (Star Schema) está diseñado para soportar análisis 
-- de bienestar laboral y psicoemocional de colaboradores. Permite validar 
-- hipótesis analíticas sobre absentismo, evolución de estados emocionales, 
-- impacto de entrenamientos y otros KPIs de recursos humanos.
--
-- HIPÓTESIS SOPORTADAS (Según Programa CPAD010):
-- H1: Antigüedad vs Bienestar laboral (Tema 4: Modelado de datos)
-- H2: Entrenamientos vs Evolución positiva (Tema 4: Modelado predictivo)
-- H3: Absentismo como predictor de estado desfavorable (Tema 2: Estrategias)
-- H4: Tipo de contrato vs Variabilidad negativa (Tema 4: Modelado)
-- H5: Interacción en foros vs Recuperación de estrés (Tema 5: Visualización)
--
-- MIGRACIÓN: MySQL → SQL Server para mayor eficiencia en entornos empresariales
-- ============================================================================

-- ============================================================================
-- BASE DE DATOS
-- ============================================================================

-- Crear base de datos con configuración optimizada para SQL Server

    
CREATE DATABASE DW_Bienestar_Psicoemocional
GO

USE DW_Bienestar_Psicoemocional;
GO

-- ============================================================================
-- DIMENSIONES (DIM TABLES)
-- Las dimensiones contienen los atributos descriptivos para segmentar y filtrar
-- los datos en los análisis. Siguen principios de normalización dimensional.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- DIMENSIÓN: TIEMPO
-- Propósito: Permitir análisis temporales (tendencias, comparativas trimestrales,
-- estacionalidad). Es la dimensión más crítica para series de tiempo.
-- Hipótesis relacionadas: H3 (predictor temporal)
-- Tema CPAD010: Tema 4 (Modelado de datos)
-- ----------------------------------------------------------------------------
CREATE TABLE dim_tiempo
(
    id_tiempo INT IDENTITY(1,1) PRIMARY KEY,
    fecha DATE NOT NULL UNIQUE,
    dia_mes INT NOT NULL,
    dia_semana INT NOT NULL,
    nombre_dia NVARCHAR(15) NOT NULL,
    mes INT NOT NULL,
    nombre_mes NVARCHAR(15) NOT NULL,
    trimestre INT NOT NULL,
    semestre INT NOT NULL,
    anio SMALLINT NOT NULL,
    semana_anio INT NOT NULL,
    es_fin_semana BIT NOT NULL DEFAULT 0,
    es_festivo BIT NOT NULL DEFAULT 0,
    es_inicio_mes BIT NOT NULL DEFAULT 0,
    es_fin_mes BIT NOT NULL DEFAULT 0,
    fecha_carga DATETIME DEFAULT GETDATE(),
    
    -- Columna calculada para etiqueta legible del trimestre
    nombre_trimestre AS (CONCAT('T', trimestre, '-', anio)) PERSISTED
);
GO

-- Índices optimizados para SQL Server
CREATE NONCLUSTERED INDEX IX_dim_tiempo_anio ON dim_tiempo(anio);
CREATE NONCLUSTERED INDEX IX_dim_tiempo_mes ON dim_tiempo(anio, mes);
CREATE NONCLUSTERED INDEX IX_dim_tiempo_trimestre ON dim_tiempo(anio, trimestre);
CREATE NONCLUSTERED INDEX IX_dim_tiempo_semana ON dim_tiempo(semana_anio);
GO

-- Comentario extendido (equivalente a COMMENT en MySQL)
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Dimensión tiempo para análisis temporales y tendencias. Soporta hipótesis H3.', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'dim_tiempo';
GO

-- ----------------------------------------------------------------------------
-- DIMENSIÓN: USUARIO (COLABORADOR)
-- Propósito: Contener atributos demográficos, laborales y organizacionales
-- de los colaboradores. Permite segmentación por departamento, contrato, etc.
-- Hipótesis relacionadas: H1 (antigüedad), H4 (tipo contrato)
-- NOTA ÉTICA: Los datos sensibles deben estar anonimizados en producción
-- Valores: Compromiso Social, Ética Profesional, Responsabilidad Social (CPAD010)
-- ----------------------------------------------------------------------------
CREATE TABLE dim_usuario
(
    id_usuario INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario_origen NVARCHAR(50) NOT NULL UNIQUE,
    edad INT NOT NULL,
    edad_etiqueta NVARCHAR(20) NOT NULL,
    id_genero INT NOT NULL,
    genero NVARCHAR(15) NOT NULL,
    cargo NVARCHAR(80) NOT NULL,
    contrato NVARCHAR(30) NOT NULL,
    antiguedad NVARCHAR(20) NOT NULL,
    antiguedad_years DECIMAL(4,2) NOT NULL,
    turno NVARCHAR(15) NOT NULL,
    id_empresa INT NOT NULL,
    nombre_empresa NVARCHAR(100) NOT NULL,
    id_sector INT NOT NULL,
    sector NVARCHAR(50) NOT NULL,
    id_departamento INT NOT NULL,
    departamento_area NVARCHAR(80) NOT NULL,
    centro NVARCHAR(50) NOT NULL,
    id_comunidad INT NULL,
    id_provincia INT NULL,
    id_empresa_padre INT NULL,
    empresa_padre NVARCHAR(100) NULL,
    activo BIT NOT NULL DEFAULT 1,
    fecha_carga DATETIME DEFAULT GETDATE(),
    fecha_actualizacion DATETIME DEFAULT GETDATE()
);
GO

-- Índices optimizados para consultas analíticas
CREATE NONCLUSTERED INDEX IX_dim_usuario_departamento ON dim_usuario(id_departamento, departamento_area);
CREATE NONCLUSTERED INDEX IX_dim_usuario_contrato ON dim_usuario(contrato);
CREATE NONCLUSTERED INDEX IX_dim_usuario_antiguedad ON dim_usuario(antiguedad_years);
CREATE NONCLUSTERED INDEX IX_dim_usuario_empresa ON dim_usuario(id_empresa);
CREATE NONCLUSTERED INDEX IX_dim_usuario_activo ON dim_usuario(activo) INCLUDE (id_usuario, departamento_area);
GO

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Dimensión usuario con atributos demográficos y laborales. Soporta H1 y H4. Cumple con ética de privacidad.', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'dim_usuario';
GO

-- ----------------------------------------------------------------------------
-- DIMENSIÓN: ESTADO PSICOEMOCIONAL
-- Propósito: Estandarizar la escala de evaluación psicoemocional.
-- Permite análisis consistente de estados (Verde/Naranja/Fresa).
-- Hipótesis relacionadas: Todas (H1-H5)
-- ----------------------------------------------------------------------------
CREATE TABLE dim_estado_psicoemocional
(
    id_estado INT IDENTITY(1,1) PRIMARY KEY,
    codigo_color NVARCHAR(10) NOT NULL UNIQUE,
    etiqueta NVARCHAR(20) NOT NULL,
    valor_numerico INT NOT NULL,
    descripcion NVARCHAR(200) NOT NULL,
    nivel_bienestar INT NOT NULL,
    es_optimo BIT NOT NULL DEFAULT 0,
    requiere_intervencion BIT NOT NULL DEFAULT 0,
    orden_visualizacion INT NOT NULL,
    fecha_carga DATETIME DEFAULT GETDATE(),
    
    -- Restricción CHECK para reemplazar ENUM de MySQL
    CONSTRAINT CHK_estado_color CHECK (codigo_color IN ('Verde', 'Naranja', 'Fresa'))
);
GO

CREATE NONCLUSTERED INDEX IX_dim_estado_color ON dim_estado_psicoemocional(codigo_color);
CREATE NONCLUSTERED INDEX IX_dim_estado_nivel ON dim_estado_psicoemocional(nivel_bienestar);
GO

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Dimensión de estados psicoemocionales (escala de evaluación). Crítica para todas las hipótesis.', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'dim_estado_psicoemocional';
GO

-- ----------------------------------------------------------------------------
-- DIMENSIÓN: ÁREA PSICOEMOCIONAL
-- Propósito: Categorizar las diferentes dimensiones de bienestar evaluadas.
-- Permite drill-down por área específica (Estrés, Bienestar Laboral, etc.)
-- Hipótesis relacionadas: H2, H5
-- Tema CPAD010: Tema 5 (Visualización y comunicación)
-- ----------------------------------------------------------------------------
CREATE TABLE dim_area_psicoemocional
(
    id_area INT IDENTITY(1,1) PRIMARY KEY,
    codigo_area NVARCHAR(20) NOT NULL UNIQUE,
    nombre_area NVARCHAR(80) NOT NULL,
    descripcion NVARCHAR(MAX) NULL,
    tipo_bienestar NVARCHAR(20) NOT NULL,
    grupo_principal NVARCHAR(50) NOT NULL,
    orden_visualizacion INT NOT NULL,
    es_dimension_secundaria BIT NOT NULL DEFAULT 0,
    escala_evaluacion NVARCHAR(30) DEFAULT 'Color',
    valores_posibles NVARCHAR(50) DEFAULT 'Verde, Naranja, Fresa',
    activo BIT NOT NULL DEFAULT 1,
    fecha_carga DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT CHK_area_tipo_bienestar CHECK (tipo_bienestar IN ('Psicológico', 'Laboral', 'General'))
);
GO

CREATE NONCLUSTERED INDEX IX_dim_area_tipo ON dim_area_psicoemocional(tipo_bienestar);
CREATE NONCLUSTERED INDEX IX_dim_area_grupo ON dim_area_psicoemocional(grupo_principal);
CREATE NONCLUSTERED INDEX IX_dim_area_activo ON dim_area_psicoemocional(activo);
GO

-- ----------------------------------------------------------------------------
-- DIMENSIÓN: SERVICIO
-- Propósito: Catálogo de servicios de bienestar disponibles (tests, entrenamientos, etc.)
-- Permite analizar impacto de cada tipo de intervención.
-- Hipótesis relacionadas: H2 (entrenamientos), H5 (foros)
-- ----------------------------------------------------------------------------
CREATE TABLE dim_servicio
(
    id_servicio INT IDENTITY(1,1) PRIMARY KEY,
    tipo_servicio NVARCHAR(20) NOT NULL,
    categoria NVARCHAR(50) NOT NULL,
    subcategoria NVARCHAR(80) NULL,
    nombre_servicio NVARCHAR(100) NOT NULL,
    descripcion NVARCHAR(MAX) NULL,
    duracion_estimada_min INT NULL,
    modalidad NVARCHAR(20) DEFAULT 'virtual',
    nivel_interaccion NVARCHAR(10) DEFAULT 'medio',
    requiere_psicologo BIT NOT NULL DEFAULT 0,
    es_evaluativo BIT NOT NULL DEFAULT 0,
    costo_asociado DECIMAL(10,2) DEFAULT 0.00,
    activo BIT NOT NULL DEFAULT 1,
    fecha_carga DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT CHK_servicio_tipo CHECK (tipo_servicio IN ('test', 'entrenamiento', 'foro', 'llamada', 'chat', 'taller')),
    CONSTRAINT CHK_servicio_modalidad CHECK (modalidad IN ('presencial', 'virtual', 'hibrido')),
    CONSTRAINT CHK_servicio_interaccion CHECK (nivel_interaccion IN ('bajo', 'medio', 'alto'))
);
GO

CREATE NONCLUSTERED INDEX IX_dim_servicio_tipo ON dim_servicio(tipo_servicio);
CREATE NONCLUSTERED INDEX IX_dim_servicio_categoria ON dim_servicio(categoria);
CREATE NONCLUSTERED INDEX IX_dim_servicio_modalidad ON dim_servicio(modalidad);
CREATE NONCLUSTERED INDEX IX_dim_servicio_activo ON dim_servicio(activo);
GO

-- ----------------------------------------------------------------------------
-- DIMENSIÓN: TIPO DE EVOLUCIÓN
-- Propósito: Clasificar el tipo de cambio entre estados (Positiva, Negativa, Neutra)
-- Esencial para medir efectividad de intervenciones.
-- Hipótesis relacionadas: H2, H4, H5
-- ----------------------------------------------------------------------------
CREATE TABLE dim_tipo_evolucion
(
    id_evolucion INT IDENTITY(1,1) PRIMARY KEY,
    tipo_evolucion NVARCHAR(20) NOT NULL UNIQUE,
    descripcion NVARCHAR(100) NOT NULL,
    valor_impacto DECIMAL(3,2) DEFAULT 0.00,
    color_asociado NVARCHAR(10) NULL,
    orden_visualizacion INT NOT NULL,
    fecha_carga DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT CHK_evolucion_tipo CHECK (tipo_evolucion IN ('Positiva', 'Neutra', 'Negativa', '-'))
);
GO

CREATE NONCLUSTERED INDEX IX_dim_evolucion_tipo ON dim_tipo_evolucion(tipo_evolucion);
GO

-- ============================================================================
-- TABLAS DE HECHOS (FACT TABLES)
-- Las tablas de hechos contienen las métricas y mediciones del negocio.
-- Cada registro representa un evento medible con referencias a dimensiones.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- HECHO: SEGUIMIENTO DE USUARIO
-- Propósito: Tabla de hechos principal. Registra el estado psicoemocional
-- de cada usuario por período de seguimiento. Granularidad: 1 registro por 
-- usuario por período de evaluación.
-- Hipótesis relacionadas: H1, H3, H4
-- Tema CPAD010: Tema 4 (Modelado de datos)
-- ----------------------------------------------------------------------------
CREATE TABLE fact_seguimiento_usuario
(
    id_seguimiento BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_fecha_seguimiento INT NOT NULL,
    id_estado_inicial INT NOT NULL,
    id_estado_final INT NOT NULL,
    id_area_principal INT NOT NULL,
    id_tipo_evolucion INT NOT NULL,
    
    -- Métricas derivadas (desnormalizadas para performance)
    estado_inicial_valor INT NOT NULL,
    estado_final_valor INT NOT NULL,
    delta_bienestar INT NOT NULL,
    dias_desde_ultimo_seguimiento INT NULL,
    
    -- Flags analíticos
    es_primera_evaluacion BIT NOT NULL DEFAULT 0,
    es_recuperacion BIT NOT NULL DEFAULT 0,
    flag_alerta BIT NOT NULL DEFAULT 0,
    
    -- Metadatos
    fecha_carga DATETIME DEFAULT GETDATE(),
    version_registro INT DEFAULT 1,
    
    -- Restricciones de clave foránea
    CONSTRAINT FK_seguimiento_usuario FOREIGN KEY (id_usuario) REFERENCES dim_usuario(id_usuario),
    CONSTRAINT FK_seguimiento_fecha FOREIGN KEY (id_fecha_seguimiento) REFERENCES dim_tiempo(id_tiempo),
    CONSTRAINT FK_seguimiento_estado_ini FOREIGN KEY (id_estado_inicial) REFERENCES dim_estado_psicoemocional(id_estado),
    CONSTRAINT FK_seguimiento_estado_fin FOREIGN KEY (id_estado_final) REFERENCES dim_estado_psicoemocional(id_estado),
    CONSTRAINT FK_seguimiento_area FOREIGN KEY (id_area_principal) REFERENCES dim_area_psicoemocional(id_area),
    CONSTRAINT FK_seguimiento_evolucion FOREIGN KEY (id_tipo_evolucion) REFERENCES dim_tipo_evolucion(id_evolucion)
);
GO

-- Índices columnstore para consultas analíticas de gran volumen (SQL Server Feature)
CREATE NONCLUSTERED COLUMNSTORE INDEX CSI_fact_seguimiento_analitica 
ON fact_seguimiento_usuario(id_usuario, id_fecha_seguimiento, id_estado_final, id_tipo_evolucion, flag_alerta);
GO

CREATE NONCLUSTERED INDEX IX_fact_seguimiento_usuario_fecha ON fact_seguimiento_usuario(id_usuario, id_fecha_seguimiento);
CREATE NONCLUSTERED INDEX IX_fact_seguimiento_estado_final ON fact_seguimiento_usuario(id_estado_final);
CREATE NONCLUSTERED INDEX IX_fact_seguimiento_evolucion ON fact_seguimiento_usuario(id_tipo_evolucion);
CREATE NONCLUSTERED INDEX IX_fact_seguimiento_alerta ON fact_seguimiento_usuario(flag_alerta, id_fecha_seguimiento);
CREATE NONCLUSTERED INDEX IX_fact_seguimiento_area ON fact_seguimiento_usuario(id_area_principal);
CREATE NONCLUSTERED INDEX IX_fact_seguimiento_fecha ON fact_seguimiento_usuario(id_fecha_seguimiento);
GO

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Tabla de hechos principal: seguimiento de estado psicoemocional por usuario. Soporta H1, H3, H4.', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'fact_seguimiento_usuario';
GO

-- ----------------------------------------------------------------------------
-- HECHO: DETALLE DE ESTADO POR DIMENSIÓN
-- Propósito: Granularidad fina del estado psicoemocional por cada área evaluada.
-- Permite análisis detallado por dimensión específica (Estrés, Autoaceptación, etc.)
-- Hipótesis relacionadas: H2, H5
-- ----------------------------------------------------------------------------
CREATE TABLE fact_detalle_estado_dimension
(
    id_detalle BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_seguimiento BIGINT NOT NULL,
    id_usuario INT NOT NULL,
    id_fecha INT NOT NULL,
    id_area INT NOT NULL,
    id_estado_inicial INT NOT NULL,
    id_estado_final INT NOT NULL,
    id_tipo_evolucion INT NOT NULL,
    
    -- Métricas de puntaje
    puntaje_inicial DECIMAL(4,2) NULL,
    puntaje_final DECIMAL(4,2) NULL,
    variacion_puntaje DECIMAL(4,2) NULL,
    peso_relativo DECIMAL(3,2) DEFAULT 1.00,
    
    -- Indicadores
    es_dimension_critica BIT NOT NULL DEFAULT 0,
    requiere_atencion BIT NOT NULL DEFAULT 0,
    
    -- Metadatos
    fecha_carga DATETIME DEFAULT GETDATE(),
    
    -- Restricciones de clave foránea
    CONSTRAINT FK_detalle_seguimiento FOREIGN KEY (id_seguimiento) REFERENCES fact_seguimiento_usuario(id_seguimiento),
    CONSTRAINT FK_detalle_usuario FOREIGN KEY (id_usuario) REFERENCES dim_usuario(id_usuario),
    CONSTRAINT FK_detalle_fecha FOREIGN KEY (id_fecha) REFERENCES dim_tiempo(id_tiempo),
    CONSTRAINT FK_detalle_area FOREIGN KEY (id_area) REFERENCES dim_area_psicoemocional(id_area),
    CONSTRAINT FK_detalle_estado_ini FOREIGN KEY (id_estado_inicial) REFERENCES dim_estado_psicoemocional(id_estado),
    CONSTRAINT FK_detalle_estado_fin FOREIGN KEY (id_estado_final) REFERENCES dim_estado_psicoemocional(id_estado),
    CONSTRAINT FK_detalle_evolucion FOREIGN KEY (id_tipo_evolucion) REFERENCES dim_tipo_evolucion(id_evolucion)
);
GO

CREATE NONCLUSTERED INDEX IX_fact_detalle_seguimiento ON fact_detalle_estado_dimension(id_seguimiento);
CREATE NONCLUSTERED INDEX IX_fact_detalle_usuario_fecha ON fact_detalle_estado_dimension(id_usuario, id_fecha);
CREATE NONCLUSTERED INDEX IX_fact_detalle_area ON fact_detalle_estado_dimension(id_area);
CREATE NONCLUSTERED INDEX IX_fact_detalle_critica ON fact_detalle_estado_dimension(es_dimension_critica);
GO

-- ----------------------------------------------------------------------------
-- HECHO: INTERACCIÓN CON SERVICIOS
-- Propósito: Registrar cada interacción del usuario con servicios de bienestar.
-- Permite medir frecuencia, duración y efectividad de cada intervención.
-- Hipótesis relacionadas: H2 (entrenamientos), H5 (foros)
-- Tema CPAD010: Tema 5 (Visualización)
-- ----------------------------------------------------------------------------
CREATE TABLE fact_interaccion_servicio
(
    id_interaccion BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_seguimiento BIGINT NULL,
    id_usuario INT NOT NULL,
    id_fecha INT NOT NULL,
    id_servicio INT NOT NULL,
    
    -- Métricas de uso
    duracion_real_min INT NULL,
    frecuencia_acceso INT DEFAULT 1,
    calificacion_usuario DECIMAL(3,2) NULL,
    completitud DECIMAL(3,2) DEFAULT 100.00,
    
    -- Contexto
    dispositivo NVARCHAR(30) NULL,
    canal_acceso NVARCHAR(20) NULL,
    es_recomendado BIT NOT NULL DEFAULT 0,
    id_psicologo_asignado INT NULL,
    
    -- Metadatos
    fecha_carga DATETIME DEFAULT GETDATE(),
    
    -- Restricciones de clave foránea
    CONSTRAINT FK_interaccion_seguimiento FOREIGN KEY (id_seguimiento) REFERENCES fact_seguimiento_usuario(id_seguimiento),
    CONSTRAINT FK_interaccion_usuario FOREIGN KEY (id_usuario) REFERENCES dim_usuario(id_usuario),
    CONSTRAINT FK_interaccion_fecha FOREIGN KEY (id_fecha) REFERENCES dim_tiempo(id_tiempo),
    CONSTRAINT FK_interaccion_servicio FOREIGN KEY (id_servicio) REFERENCES dim_servicio(id_servicio)
);
GO

CREATE NONCLUSTERED INDEX IX_fact_interaccion_usuario_fecha ON fact_interaccion_servicio(id_usuario, id_fecha);
CREATE NONCLUSTERED INDEX IX_fact_interaccion_servicio ON fact_interaccion_servicio(id_servicio);
CREATE NONCLUSTERED INDEX IX_fact_interaccion_seguimiento ON fact_interaccion_servicio(id_seguimiento);
CREATE NONCLUSTERED INDEX IX_fact_interaccion_recomendado ON fact_interaccion_servicio(es_recomendado);
CREATE NONCLUSTERED INDEX IX_fact_interaccion_fecha ON fact_interaccion_servicio(id_fecha);
GO

-- ----------------------------------------------------------------------------
-- HECHO: ABSENTISMO LABORAL
-- Propósito: Registrar eventos de absentismo y su relación con el bienestar.
-- Permite correlacionar ausencias con estados psicoemocionales.
-- Hipótesis relacionadas: H3 (predictor de estado desfavorable)
-- ----------------------------------------------------------------------------
CREATE TABLE fact_absentismo
(
    id_registro_absentismo BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_seguimiento BIGINT NULL,
    id_usuario INT NOT NULL,
    id_fecha_inicio INT NOT NULL,
    id_fecha_final INT NULL,
    
    -- Métricas
    dias_ausente INT NOT NULL,
    justificado BIT NOT NULL DEFAULT 0,
    relacionado_salud_mental BIT NOT NULL DEFAULT 0,
    
    -- Clasificación
    tipo_absentismo NVARCHAR(30) DEFAULT 'General',
    gravedad NVARCHAR(10) DEFAULT 'Leve',
    comentario NVARCHAR(MAX) NULL,
    
    -- Metadatos
    fecha_carga DATETIME DEFAULT GETDATE(),
    
    -- Restricciones de clave foránea
    CONSTRAINT FK_absentismo_seguimiento FOREIGN KEY (id_seguimiento) REFERENCES fact_seguimiento_usuario(id_seguimiento),
    CONSTRAINT FK_absentismo_usuario FOREIGN KEY (id_usuario) REFERENCES dim_usuario(id_usuario),
    CONSTRAINT FK_absentismo_fecha_ini FOREIGN KEY (id_fecha_inicio) REFERENCES dim_tiempo(id_tiempo),
    CONSTRAINT FK_absentismo_fecha_fin FOREIGN KEY (id_fecha_final) REFERENCES dim_tiempo(id_tiempo),
    
    CONSTRAINT CHK_absentismo_gravedad CHECK (gravedad IN ('Leve', 'Moderado', 'Grave'))
);
GO

CREATE NONCLUSTERED INDEX IX_fact_absentismo_usuario_fecha ON fact_absentismo(id_usuario, id_fecha_inicio);
CREATE NONCLUSTERED INDEX IX_fact_absentismo_salud_mental ON fact_absentismo(relacionado_salud_mental);
CREATE NONCLUSTERED INDEX IX_fact_absentismo_gravedad ON fact_absentismo(gravedad);
CREATE NONCLUSTERED INDEX IX_fact_absentismo_seguimiento ON fact_absentismo(id_seguimiento);
GO

-- ----------------------------------------------------------------------------
-- HECHO: SOLICITUD DE PSICÓLOGO
-- Propósito: Registrar solicitudes de apoyo psicológico profesional.
-- Permite medir demanda de servicios y efectividad del tratamiento.
-- Hipótesis relacionadas: H3, H5
-- ----------------------------------------------------------------------------
CREATE TABLE fact_solicitud_psicologo
(
    id_solicitud BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_seguimiento BIGINT NULL,
    id_usuario INT NOT NULL,
    id_fecha_solicitud INT NOT NULL,
    id_fecha_prevista INT NULL,
    id_fecha_atencion INT NULL,
    
    -- Estado del proceso
    solicita NVARCHAR(2) NOT NULL DEFAULT 'NO',
    tiene_psicologo_asignado NVARCHAR(2) NOT NULL DEFAULT 'NO',
    usuario_asiste NVARCHAR(2) NOT NULL DEFAULT 'NO',
    solicitud_empresa NVARCHAR(3) NOT NULL DEFAULT 'N/A',
    
    -- Métricas
    n_solicitudes_acumuladas INT DEFAULT 1,
    sesiones_consumidas INT DEFAULT 0,
    sesiones_pendientes INT DEFAULT 0,
    tiempo_espera_dias INT DEFAULT 0,
    
    -- Clasificación
    tipo_usuario NVARCHAR(15) DEFAULT 'Alta',
    prioridad NVARCHAR(10) DEFAULT 'Media',
    estado_tratamiento NVARCHAR(15) DEFAULT 'Pendiente',
    
    -- Metadatos
    fecha_carga DATETIME DEFAULT GETDATE(),
    
    -- Restricciones de clave foránea
    CONSTRAINT FK_solicitud_seguimiento FOREIGN KEY (id_seguimiento) REFERENCES fact_seguimiento_usuario(id_seguimiento),
    CONSTRAINT FK_solicitud_usuario FOREIGN KEY (id_usuario) REFERENCES dim_usuario(id_usuario),
    CONSTRAINT FK_solicitud_fecha_sol FOREIGN KEY (id_fecha_solicitud) REFERENCES dim_tiempo(id_tiempo),
    CONSTRAINT FK_solicitud_fecha_prev FOREIGN KEY (id_fecha_prevista) REFERENCES dim_tiempo(id_tiempo),
    CONSTRAINT FK_solicitud_fecha_aten FOREIGN KEY (id_fecha_atencion) REFERENCES dim_tiempo(id_tiempo),
    
    CONSTRAINT CHK_solicitud_solicita CHECK (solicita IN ('SI', 'NO')),
    CONSTRAINT CHK_solicitud_prioridad CHECK (prioridad IN ('Baja', 'Media', 'Alta', 'Urgente')),
    CONSTRAINT CHK_solicitud_estado CHECK (estado_tratamiento IN ('Activo', 'Completado', 'Abandonado', 'Pendiente'))
);
GO

CREATE NONCLUSTERED INDEX IX_fact_solicitud_usuario_fecha ON fact_solicitud_psicologo(id_usuario, id_fecha_solicitud);
CREATE NONCLUSTERED INDEX IX_fact_solicitud_asiste ON fact_solicitud_psicologo(usuario_asiste);
CREATE NONCLUSTERED INDEX IX_fact_solicitud_prioridad ON fact_solicitud_psicologo(prioridad);
CREATE NONCLUSTERED INDEX IX_fact_solicitud_estado ON fact_solicitud_psicologo(estado_tratamiento);
CREATE NONCLUSTERED INDEX IX_fact_solicitud_seguimiento ON fact_solicitud_psicologo(id_seguimiento);
GO

-- ============================================================================
-- VISTAS ANALÍTICAS PREDEFINIDAS
-- Vistas indexadas para optimizar consultas frecuentes (SQL Server Feature)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- VISTA: Resumen de evolución por departamento
-- Propósito: Consulta rápida para dashboards ejecutivos
-- Tema CPAD010: Tema 5 (Visualización y comunicación de resultados)
-- ----------------------------------------------------------------------------
CREATE VIEW v_resumen_evolucion_departamento
WITH SCHEMABINDING
AS
SELECT 
    u.departamento_area,
    u.nombre_empresa,
    t.anio,
    t.trimestre,
    e.tipo_evolucion,
    COUNT_BIG(*) as cantidad_usuarios,
    AVG(CAST(f.delta_bienestar AS DECIMAL(4,2))) as promedio_mejora,
    SUM(CASE WHEN f.flag_alerta = 1 THEN 1 ELSE 0 END) as total_alertas
FROM dbo.fact_seguimiento_usuario f
JOIN dbo.dim_usuario u ON f.id_usuario = u.id_usuario
JOIN dbo.dim_tiempo t ON f.id_fecha_seguimiento = t.id_tiempo
JOIN dbo.dim_tipo_evolucion e ON f.id_tipo_evolucion = e.id_evolucion
WHERE u.activo = 1
GROUP BY u.departamento_area, u.nombre_empresa, t.anio, t.trimestre, e.tipo_evolucion;
GO

-- Crear índice único clustered en la vista (Indexed View - SQL Server Feature)
CREATE UNIQUE CLUSTERED INDEX IX_v_resumen_evolucion_departamento 
ON v_resumen_evolucion_departamento(departamento_area, nombre_empresa, anio, trimestre, tipo_evolucion);
GO

-- ----------------------------------------------------------------------------
-- VISTA: Impacto de servicios en evolución
-- Propósito: Medir efectividad de intervenciones (Hipótesis H2, H5)
-- ----------------------------------------------------------------------------
CREATE VIEW v_impacto_servicios_evolucion
WITH SCHEMABINDING
AS
SELECT 
    s.tipo_servicio,
    s.categoria,
    e.tipo_evolucion,
    COUNT_BIG(DISTINCT i.id_usuario) as usuarios_atendidos,
    COUNT_BIG(*) as total_interacciones,
    AVG(CAST(i.duracion_real_min AS DECIMAL(5,2))) as duracion_promedio,
    AVG(CAST(i.calificacion_usuario AS DECIMAL(3,2))) as calificacion_promedio
FROM dbo.fact_interaccion_servicio i
JOIN dbo.dim_servicio s ON i.id_servicio = s.id_servicio
JOIN dbo.fact_seguimiento_usuario f ON i.id_seguimiento = f.id_seguimiento
JOIN dbo.dim_tipo_evolucion e ON f.id_tipo_evolucion = e.id_evolucion
WHERE s.activo = 1
GROUP BY s.tipo_servicio, s.categoria, e.tipo_evolucion;
GO

CREATE UNIQUE CLUSTERED INDEX IX_v_impacto_servicios_evolucion 
ON v_impacto_servicios_evolucion(tipo_servicio, categoria, tipo_evolucion);
GO

-- ----------------------------------------------------------------------------
-- VISTA: Absentismo y estado psicoemocional
-- Propósito: Correlacionar absentismo con estados (Hipótesis H3)
-- ----------------------------------------------------------------------------
CREATE VIEW v_absentismo_estado_correlacion
WITH SCHEMABINDING
AS
SELECT 
    t.anio,
    t.mes,
    u.contrato,
    u.departamento_area,
    COUNT_BIG(DISTINCT a.id_registro_absentismo) as total_ausencias,
    SUM(CAST(a.dias_ausente AS BIGINT)) as total_dias_ausente,
    SUM(CASE WHEN a.relacionado_salud_mental = 1 THEN 1 ELSE 0 END) as ausencias_salud_mental,
    AVG(CAST(f.estado_final_valor AS DECIMAL(3,2))) as promedio_bienestar
FROM dbo.fact_absentismo a
JOIN dbo.dim_usuario u ON a.id_usuario = u.id_usuario
JOIN dbo.dim_tiempo t ON a.id_fecha_inicio = t.id_tiempo
LEFT JOIN dbo.fact_seguimiento_usuario f ON a.id_seguimiento = f.id_seguimiento
GROUP BY t.anio, t.mes, u.contrato, u.departamento_area;
GO

CREATE UNIQUE CLUSTERED INDEX IX_v_absentismo_estado_correlacion 
ON v_absentismo_estado_correlacion(anio, mes, contrato, departamento_area);
GO

-- ============================================================================
-- DATOS INICIALES (SEED DATA)
-- Población inicial de dimensiones críticas
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Poblar dimensión de estados psicoemocionales
-- ----------------------------------------------------------------------------
INSERT INTO dim_estado_psicoemocional (codigo_color, etiqueta, valor_numerico, descripcion, nivel_bienestar, es_optimo, requiere_intervencion, orden_visualizacion) VALUES
('Verde', N'Óptimo', 3, N'Estado psicoemocional favorable, sin indicadores de riesgo', 3, 1, 0, 1),
('Naranja', N'Precaución', 2, N'Estado psicoemocional con indicadores moderados de riesgo', 2, 0, 0, 2),
('Fresa', N'Crítico', 1, N'Estado psicoemocional desfavorable, requiere intervención', 1, 0, 1, 3);
GO

-- ----------------------------------------------------------------------------
-- Poblar dimensión de tipos de evolución
-- ----------------------------------------------------------------------------
INSERT INTO dim_tipo_evolucion (tipo_evolucion, descripcion, valor_impacto, color_asociado, orden_visualizacion) VALUES
('Positiva', N'Mejora significativa del estado psicoemocional', 1.00, '#4CAF50', 1),
('Neutra', N'Sin cambio significativo en el estado', 0.00, '#9E9E9E', 2),
('Negativa', N'Deterioro del estado psicoemocional', -1.00, '#F44336', 3),
('-', N'Sin información suficiente para evaluar', 0.00, '#CCCCCC', 4);
GO

-- ----------------------------------------------------------------------------
-- Poblar dimensión de áreas psicoemocionales principales
-- ----------------------------------------------------------------------------
INSERT INTO dim_area_psicoemocional (codigo_area, nombre_area, descripcion, tipo_bienestar, grupo_principal, orden_visualizacion, es_dimension_secundaria) VALUES
('BG', N'Bienestar General', N'Evaluación integral del bienestar del colaborador', 'General', 'Principal', 1, 0),
('BP', N'Bienestar Psicológico', N'Dimensiones de bienestar psicológico según modelo Ryff', 'Psicológico', 'Psicológico', 2, 0),
('BL', N'Bienestar Laboral', N'Dimensiones de satisfacción y bienestar laboral', 'Laboral', 'Laboral', 3, 0),
('EST', N'Estrés', N'Nivel de estrés percibido en el entorno laboral', 'Psicológico', 'Psicológico', 4, 1),
('ANS', N'Ansiedad', N'Nivel de ansiedad reportado', 'Psicológico', 'Psicológico', 5, 1),
('AUT', N'Autoconfianza', N'Nivel de autoconfianza y autoestima', 'Psicológico', 'Psicológico', 6, 1);
GO

-- ----------------------------------------------------------------------------
-- Poblar dimensión de servicios básicos
-- ----------------------------------------------------------------------------
INSERT INTO dim_servicio (tipo_servicio, categoria, subcategoria, nombre_servicio, descripcion, duracion_estimada_min, modalidad, nivel_interaccion, requiere_psicologo, es_evaluativo) VALUES
('test', N'Evaluación', N'Psicoemocional', N'Test de Bienestar General', N'Evaluación inicial del estado psicoemocional', 15, 'virtual', 'bajo', 0, 1),
('entrenamiento', N'Desarrollo', N'Habilidades', N'Entrenamiento en Manejo de Estrés', N'Programa de desarrollo de habilidades de afrontamiento', 60, 'virtual', 'alto', 0, 0),
('foro', N'Comunidad', N'Soporte', N'Foro de Apoyo entre Pares', N'Espacio de discusión y apoyo mutuo', NULL, 'virtual', 'medio', 0, 0),
('llamada', N'Atención', N'Crisis', N'Llamada de Crisis', N'Atención telefónica en situaciones de crisis', 30, 'virtual', 'alto', 1, 0),
('chat', N'Atención', N'Seguimiento', N'Chat de Seguimiento', N'Seguimiento vía mensajería con profesional', 20, 'virtual', 'medio', 1, 0),
('taller', N'Desarrollo', N'Grupal', N'Taller de Bienestar Laboral', N'Taller grupal presencial o virtual', 120, 'hibrido', 'alto', 0, 0);
GO

-- ============================================================================
-- PROCEDIMIENTOS ALMACENADOS PARA ETL
-- Optimizados para SQL Server (T-SQL)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- SP: Validar consistencia de datos post-ETL
-- Propósito: Ejecutar checks de calidad de datos según Tema 3 (Selección y preparación)
-- ----------------------------------------------------------------------------
CREATE PROCEDURE sp_validar_consistencia_datos
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @total_usuarios INT, @usuarios_activos INT;
    DECLARE @total_seguimientos INT, @seguimientos_con_alerta INT;
    DECLARE @distribucion_estados TABLE (estado NVARCHAR(10), cantidad INT);
    
    -- Validar usuarios
    SELECT @total_usuarios = COUNT(*) FROM dim_usuario;
    SELECT @usuarios_activos = COUNT(*) FROM dim_usuario WHERE activo = 1;
    
    -- Validar seguimientos
    SELECT @total_seguimientos = COUNT(*) FROM fact_seguimiento_usuario;
    SELECT @seguimientos_con_alerta = COUNT(*) FROM fact_seguimiento_usuario WHERE flag_alerta = 1;
    
    -- Validar distribución de estados
    INSERT INTO @distribucion_estados
    SELECT e.codigo_color, COUNT(*) 
    FROM fact_seguimiento_usuario f
    JOIN dim_estado_psicoemocional e ON f.id_estado_final = e.id_estado
    GROUP BY e.codigo_color;
    
    -- Resultados de validación
    SELECT 
        'Usuarios' as tabla,
        @total_usuarios as total,
        @usuarios_activos as activos,
        CAST(@usuarios_activos AS DECIMAL(5,2)) / @total_usuarios * 100 as porcentaje_activos
    UNION ALL
    SELECT 
        'Seguimientos',
        @total_seguimientos,
        @seguimientos_con_alerta,
        CAST(@seguimientos_con_alerta AS DECIMAL(5,2)) / @total_seguimientos * 100;
    
    SELECT * FROM @distribucion_estados;
END
GO

-- ----------------------------------------------------------------------------
-- SP: Generar reporte ejecutivo de bienestar
-- Propósito: Dashboard para gerencia (Tema 5: Visualización)
-- ----------------------------------------------------------------------------
CREATE PROCEDURE sp_reporte_ejecutivo_bienestar
    @anio INT,
    @trimestre INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        u.departamento_area,
        COUNT(DISTINCT f.id_usuario) as total_usuarios,
        AVG(CAST(f.estado_final_valor AS DECIMAL(3,2))) as bienestar_promedio,
        SUM(CASE WHEN f.flag_alerta = 1 THEN 1 ELSE 0 END) as alertas_activas,
        SUM(CASE WHEN e.tipo_evolucion = 'Positiva' THEN 1 ELSE 0 END) as evoluciones_positivas,
        SUM(CASE WHEN e.tipo_evolucion = 'Negativa' THEN 1 ELSE 0 END) as evoluciones_negativas
    FROM fact_seguimiento_usuario f
    JOIN dim_usuario u ON f.id_usuario = u.id_usuario
    JOIN dim_tiempo t ON f.id_fecha_seguimiento = t.id_tiempo
    JOIN dim_tipo_evolucion e ON f.id_tipo_evolucion = e.id_evolucion
    WHERE t.anio = @anio
        AND (@trimestre IS NULL OR t.trimestre = @trimestre)
        AND u.activo = 1
    GROUP BY u.departamento_area
    ORDER BY bienestar_promedio DESC;
END
GO

CREATE TABLE etl_config (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    BeginDate DATETIME NOT NULL,
    EndDate DATETIME NOT NULL,
    Update_At DATETIME DEFAULT GETDATE(),
    
    -- Restricciones para garantizar integridad
    CONSTRAINT CHK_Fechas_Validas CHECK (BeginDate <= EndDate),
    CONSTRAINT UQ_Rango_Fechas UNIQUE (BeginDate, EndDate)
);
GO


CREATE TABLE dbo.Log (
	Id_Log int IDENTITY(1,1) NOT NULL,
	LogType nvarchar(MAX) COLLATE Modern_Spanish_CI_AS NULL,
	Fecha datetime NULL,
	message varchar(MAX) COLLATE Modern_Spanish_CI_AS NULL,
	body nvarchar(MAX) COLLATE Modern_Spanish_CI_AS NULL,
	CONSTRAINT PK_CaseTable_Agendas PRIMARY KEY (Id_Log)
);


-- ============================================================================
-- CORRECCIÓN DE PRECISIÓN DECIMAL EN TABLAS EXISTENTES
-- ============================================================================

-- 1. Fact_Detalle_Estado_Dimension - Ajustar Variacion_Puntaje para negativos
ALTER TABLE Fact_Detalle_Estado_Dimension 
ALTER COLUMN Variacion_Puntaje DECIMAL(5,2);
GO

-- 2. Fact_Interaccion_Servicio - Ajustar Completitud para permitir 100.00
ALTER TABLE Fact_Interaccion_Servicio 
ALTER COLUMN Completitud DECIMAL(5,2);
GO

-- 3. Fact_Interaccion_Servicio - Ajustar Calificacion_Usuario si es necesario
ALTER TABLE Fact_Interaccion_Servicio 
ALTER COLUMN Calificacion_Usuario DECIMAL(3,2);
GO


GO


-- ============================================================================
-- COMENTARIOS FINALES Y RECOMENDACIONES DE USO
-- ============================================================================

-- ----------------------------------------------------------------------------
-- VENTAJAS DE SQL SERVER SOBRE MYSQL PARA ESTE CASO:
-- 1. Columnstore indexes para consultas analíticas de gran volumen (hasta 10x más rápido)
-- 2. Indexed Views para precalcular agregaciones complejas
-- 3. T-SQL avanzado para ETL complejo (stored procedures, CTEs, window functions)
-- 4. SQL Server Integration Services (SSIS) para pipelines ETL empresariales
-- 5. Mejor gestión de memoria y parallelism para consultas analíticas
-- 6. Herramientas de BI nativas (Power BI integration, Reporting Services)
--
-- RECOMENDACIONES PARA EL ETL (Tema 3: Selección y preparación de datos):
-- 1. Usar SQL Server Integration Services (SSIS) para cargas programadas
-- 2. Implementar transacciones explícitas (BEGIN TRAN / COMMIT)
-- 3. Usar TABLOCK para cargas masivas de alto volumen
-- 4. Configurar modelo de recuperación SIMPLE para DW (mejor performance)
-- 5. Implementar particionamiento por año en tablas de hechos grandes
--
-- RECOMENDACIONES PARA CONSULTAS ANALÍTICAS (Tema 4: Modelado):
-- 1. Usar las vistas indexadas (v_*) para dashboards comunes
-- 2. Aprovechar Columnstore indexes para agregaciones
-- 3. Usar WINDOW FUNCTIONS para análisis de tendencias
-- 4. Considerar Query Store para optimización de consultas
--
-- CONSIDERACIONES ÉTICAS (CPAD010 - Valores Fundamentales):
-- 1. Anonimizar id_usuario_origen en entornos de producción
-- 2. No exponer datos individuales en dashboards ejecutivos
-- 3. Cumplir con normativa de protección de datos personales
-- 4. Documentar origen y transformación de todos los datos
-- 5. Aplicar normativas APA para citas en informes académicos
--
-- ALINEACIÓN CON PROGRAMA CPAD010:
-- - Tema 1: Contexto empresarial (caso de uso real)
-- - Tema 2: Estrategias analíticas (hipótesis H1-H5)
-- - Tema 3: Preparación de datos (ETL con validación)
-- - Tema 4: Modelado (esquema dimensional optimizado)
-- - Tema 5: Visualización (vistas para dashboards)
-- - Valores: Ética, Privacidad, Responsabilidad Social
-- ============================================================================