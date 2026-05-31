//TABLAS DIMENSIONES

CREATE TABLE Dim_Usuario (
    Id_Usuario INT IDENTITY(1,1) PRIMARY KEY,
    Codigo_Usuario VARCHAR(50) NOT NULL,
    Genero VARCHAR(20),
    Edad INT,
    Nivel_Fitness_Inicial VARCHAR(50),
    Objetivo_Salud VARCHAR(50),
    Tipo_Suscripcion VARCHAR(20),
    Antiguedad_Meses INT,
    Fecha_Registro DATETIME,
    Activo BIT
);

CREATE TABLE Dim_Tiempo (
    Id_Tiempo INT PRIMARY KEY,
    Fecha DATE,
    Dia INT,
    Mes INT,
    Nombre_Mes VARCHAR(20),
    Trimestre INT,
    Anio INT,
    Semana_Anio INT
);

//por ejemplo cardio, fuerza, yoga, correr
//muy necesario para la Hipotesis H1
CREATE TABLE Dim_Actividad (
    Id_Actividad INT IDENTITY(1,1) PRIMARY KEY,
    Tipo_Actividad VARCHAR(50),
    Categoria VARCHAR(50)
);

//muy necesaria para la Hipotesis H2
CREATE TABLE Dim_Reto (
    Id_Reto INT IDENTITY(1,1) PRIMARY KEY,
    Nombre_Reto VARCHAR(100),
    Dificultad VARCHAR(30),
    Puntos_Maximos INT
);

//TABLAS DE FACTURACION
//necesaria para la Hipotesis H1
CREATE TABLE Fact_Metricas_Fisicas (
    Id_Registro_Metrica BIGINT IDENTITY(1,1) PRIMARY KEY,

    Id_Usuario INT,
    Id_Tiempo INT,
    Id_Actividad INT,

    Frecuencia_Semanal_Real INT,

    Peso_Inicial DECIMAL(6,2),
    Peso_Actual DECIMAL(6,2),

    IMC_Inicial DECIMAL(6,2),
    IMC_Actual DECIMAL(6,2),

    Masa_Muscular_Inicial DECIMAL(6,2),
    Masa_Muscular_Actual DECIMAL(6,2),

    FOREIGN KEY (Id_Usuario)
        REFERENCES Dim_Usuario(Id_Usuario),

    FOREIGN KEY (Id_Tiempo)
        REFERENCES Dim_Tiempo(Id_Tiempo),

    FOREIGN KEY (Id_Actividad)
        REFERENCES Dim_Actividad(Id_Actividad)
);

//necesaria para la Hipotesis H2
CREATE TABLE Fact_Gamificacion_Usuario (
    Id_Gamificacion BIGINT IDENTITY(1,1) PRIMARY KEY,

    Id_Usuario INT,
    Id_Tiempo INT,

    Score_Gamificacion_Mensual INT,

    Retos_Completados INT,
    Retos_Totales_Asignados INT,

    Puntos_Ganados INT,

    Flag_Renovacion_Suscripcion BIT,

    FOREIGN KEY (Id_Usuario)
        REFERENCES Dim_Usuario(Id_Usuario),

    FOREIGN KEY (Id_Tiempo)
        REFERENCES Dim_Tiempo(Id_Tiempo)
);

//necesaria para la Hipotesis H3
CREATE TABLE Fact_Adherencia_Usuario (
    Id_Adherencia BIGINT IDENTITY(1,1) PRIMARY KEY,

    Id_Usuario INT,
    Id_Tiempo INT,

    Dias_Inactividad_Consecutiva INT,

    Flag_Abandono_Confirmado BIT,

    Lag_Periodo INT,

    FOREIGN KEY (Id_Usuario)
        REFERENCES Dim_Usuario(Id_Usuario),

    FOREIGN KEY (Id_Tiempo)
        REFERENCES Dim_Tiempo(Id_Tiempo)
);

//necesaria para la Hipotesis H4
CREATE TABLE Fact_Consistencia_Rutina (
    Id_Consistencia BIGINT IDENTITY(1,1) PRIMARY KEY,

    Id_Usuario INT,
    Id_Tiempo INT,

    Sesiones_Programadas INT,
    Sesiones_Completadas INT,

    Cumplimiento_Pct DECIMAL(5,2),

    Variacion_Metrica_Semanal DECIMAL(8,2),

    FOREIGN KEY (Id_Usuario)
        REFERENCES Dim_Usuario(Id_Usuario),

    FOREIGN KEY (Id_Tiempo)
        REFERENCES Dim_Tiempo(Id_Tiempo)
);

//necesaria para la Hipotesis H5
CREATE TABLE Fact_Moderacion_Social (
    Id_Social_Factor BIGINT IDENTITY(1,1) PRIMARY KEY,

    Id_Usuario INT,
    Id_Tiempo INT,

    Likes_Recibidos INT,
    Comentarios_Recibidos INT,

    Densidad_Interaccion_Recibida DECIMAL(10,2),

    Volumen_Carga_Semanal DECIMAL(12,2),

    Score_Percepcion_Esfuerzo_Borg INT,

    FOREIGN KEY (Id_Usuario)
        REFERENCES Dim_Usuario(Id_Usuario),

    FOREIGN KEY (Id_Tiempo)
        REFERENCES Dim_Tiempo(Id_Tiempo)
);

//VISTAS


//Hipotesis H1
//Frecuencia vs Evolucion Fisica
CREATE OR ALTER VIEW v_Analisis_H1_Frecuencia_Evolucion
AS
SELECT

    f.Id_Registro_Metrica,

    u.Id_Usuario,
    f.Id_Actividad,

    u.Genero,
    u.Nivel_Fitness_Inicial,
    u.Tipo_Suscripcion,

    f.Frecuencia_Semanal_Real,

    f.Peso_Inicial,
    f.Peso_Actual,

    f.IMC_Inicial,
    f.IMC_Actual,

    f.Masa_Muscular_Inicial,
    f.Masa_Muscular_Actual,

    (
        ((f.Peso_Inicial - f.Peso_Actual)
        / NULLIF(f.Peso_Inicial,0))
        *100
    ) AS Mejora_Peso_Pct,

    (
        ((f.IMC_Inicial - f.IMC_Actual)
        / NULLIF(f.IMC_Inicial,0))
        *100
    ) AS Mejora_IMC_Pct,

    (
        ((f.Masa_Muscular_Actual -
          f.Masa_Muscular_Inicial)
        / NULLIF(f.Masa_Muscular_Inicial,0))
        *100
    ) AS Mejora_Masa_Muscular_Pct,

    a.Tipo_Actividad,

    CASE
        WHEN f.Frecuencia_Semanal_Real <= 2 THEN 'Baja'
        WHEN f.Frecuencia_Semanal_Real <= 4 THEN 'Media'
        ELSE 'Alta'
    END AS Rango_Frecuencia,

    t.Fecha,
    t.Dia,
    t.Mes,
    t.Nombre_Mes,
    t.Trimestre,
    t.Anio,
    t.Semana_Anio

FROM Fact_Metricas_Fisicas f
INNER JOIN Dim_Usuario u
ON u.Id_Usuario = f.Id_Usuario

INNER JOIN Dim_Actividad a
ON a.Id_Actividad = f.Id_Actividad

INNER JOIN Dim_Tiempo t
ON t.Id_Tiempo = f.Id_Tiempo;

//Hipotesis H2
//Gamificacion y Renovacion
CREATE OR ALTER VIEW v_Analisis_H2_Gamificacion_Renovacion
AS
SELECT

    g.Id_Gamificacion,

    u.Id_Usuario,

    u.Tipo_Suscripcion,
    u.Antiguedad_Meses,

    g.Score_Gamificacion_Mensual,

    g.Retos_Completados,
    g.Retos_Totales_Asignados,

    g.Puntos_Ganados,

    (
        CAST(g.Retos_Completados AS FLOAT)
        / NULLIF(g.Retos_Totales_Asignados, 0)
    ) * 100 AS Pct_Cumplimiento_Retos,

    g.Flag_Renovacion_Suscripcion,

    CASE
        WHEN (
            CAST(g.Retos_Completados AS FLOAT)
            / NULLIF(g.Retos_Totales_Asignados, 0)
        ) * 100 < 40
        THEN 'Baja'

        WHEN (
            CAST(g.Retos_Completados AS FLOAT)
            / NULLIF(g.Retos_Totales_Asignados, 0)
        ) * 100 < 70
        THEN 'Media'

        ELSE 'Alta'
    END AS Nivel_Gamificacion,

    t.Fecha,
    t.Dia,
    t.Mes,
    t.Nombre_Mes,
    t.Trimestre,
    t.Anio,
    t.Semana_Anio

FROM Fact_Gamificacion_Usuario g
INNER JOIN Dim_Usuario u
    ON u.Id_Usuario = g.Id_Usuario
INNER JOIN Dim_Tiempo t
    ON t.Id_Tiempo = g.Id_Tiempo;


//Hipotesis H3
//Churn Predictor 
CREATE OR ALTER VIEW v_Analisis_H3_Churn
AS
SELECT

    a.Id_Adherencia,

    u.Id_Usuario,

    u.Tipo_Suscripcion,

    a.Dias_Inactividad_Consecutiva,

    a.Flag_Abandono_Confirmado,

    a.Lag_Periodo,

    CASE
        WHEN a.Dias_Inactividad_Consecutiva <= 5
            THEN 'Bajo'

        WHEN a.Dias_Inactividad_Consecutiva <= 14
            THEN 'Medio'

        ELSE 'Alto'
    END AS Nivel_Riesgo,

    CASE
        WHEN a.Dias_Inactividad_Consecutiva <= 5
            THEN 0.15

        WHEN a.Dias_Inactividad_Consecutiva <= 14
            THEN 0.50

        ELSE 0.85
    END AS Probabilidad_Churn,

    t.Fecha,
    t.Dia,
    t.Mes,
    t.Nombre_Mes,
    t.Trimestre,
    t.Anio,
    t.Semana_Anio

FROM Fact_Adherencia_Usuario a

INNER JOIN Dim_Usuario u
    ON u.Id_Usuario = a.Id_Usuario

INNER JOIN Dim_Tiempo t
    ON t.Id_Tiempo = a.Id_Tiempo;

//Hipotesis H4
//Premium vs Consistencia

CREATE OR ALTER VIEW v_Analisis_H4_Consistencia
AS
SELECT

    c.Id_Consistencia,

    u.Id_Usuario,

    u.Tipo_Suscripcion,
    u.Objetivo_Salud,

    c.Sesiones_Programadas,
    c.Sesiones_Completadas,

    c.Cumplimiento_Pct,
    c.Variacion_Metrica_Semanal,

    CASE
        WHEN c.Cumplimiento_Pct >= 90 THEN 'Alta'
        WHEN c.Cumplimiento_Pct >= 70 THEN 'Media'
        ELSE 'Baja'
    END AS Nivel_Consistencia,

    t.Fecha,
    t.Dia,
    t.Mes,
    t.Nombre_Mes,
    t.Trimestre,
    t.Anio,
    t.Semana_Anio

FROM Fact_Consistencia_Rutina c

INNER JOIN Dim_Usuario u
    ON u.Id_Usuario = c.Id_Usuario

INNER JOIN Dim_Tiempo t
    ON t.Id_Tiempo = c.Id_Tiempo;

//Hipotesis H5
//Factor Protector Social

CREATE OR ALTER VIEW v_Analisis_H5_Social
AS
SELECT

    m.Id_Social_Factor,

    u.Id_Usuario,
    u.Genero,

    m.Volumen_Carga_Semanal,
    m.Densidad_Interaccion_Recibida,

    m.Likes_Recibidos,
    m.Comentarios_Recibidos,

    m.Score_Percepcion_Esfuerzo_Borg,

    (
        m.Likes_Recibidos +
        m.Comentarios_Recibidos
    ) AS Total_Interacciones,

    CASE
        WHEN (
            m.Likes_Recibidos +
            m.Comentarios_Recibidos
        ) >= 100 THEN 'Alta'

        WHEN (
            m.Likes_Recibidos +
            m.Comentarios_Recibidos
        ) >= 50 THEN 'Media'

        ELSE 'Baja'
    END AS Nivel_Interaccion,

    t.Fecha,
    t.Dia,
    t.Mes,
    t.Nombre_Mes,
    t.Trimestre,
    t.Anio,
    t.Semana_Anio

FROM Fact_Moderacion_Social m

INNER JOIN Dim_Usuario u
    ON u.Id_Usuario = m.Id_Usuario

INNER JOIN Dim_Tiempo t
    ON t.Id_Tiempo = m.Id_Tiempo;

//Tabla de etls cambios
CREATE TABLE Etl_Config
(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Update_At DATETIME,
    BeginDate DATETIME,
    EndDate DATETIME
);

-- para eliminar todos los registros de la base de datos
-- DELETE FROM Fact_Metricas_Fisicas;
-- DELETE FROM Fact_Gamificacion_Usuario;
-- DELETE FROM Fact_Adherencia_Usuario;
-- DELETE FROM Fact_Consistencia_Rutina;
-- DELETE FROM Fact_Moderacion_Social;

-- DELETE FROM Dim_Usuario;
-- DELETE FROM Dim_Actividad;
-- DELETE FROM Dim_Tiempo;
-- DELETE FROM Etl_Config;

