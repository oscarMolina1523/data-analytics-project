Create database BDDestino;
go
CREATE TABLE BDDestino.dbo.CategoryDIM (
	Id_Categoria int,
	Nombre nvarchar(250) COLLATE Latin1_General_CI_AI NULL,
	CONSTRAINT NewTable_PK PRIMARY KEY (Id_Categoria)
);



-- COMMENT nueva dimension

CREATE TABLE BDDestino.dbo.TimeDIM (
	FechaKey INT PRIMARY KEY,           -- formato YYYYMMDD
    Fecha DATE NOT NULL,
    Anio INT NOT NULL,
    Mes INT NOT NULL,
    NombreMes NVARCHAR(20),
    Trimestre INT,
    NombreTrimestre NVARCHAR(20),
    Bimestre INT,
    NombreBimestre NVARCHAR(20),
    Cuatrimestre INT,
    NombreCuatrimestre NVARCHAR(20),
    SemanaAnio INT,
    NombreDia NVARCHAR(20),
    DiaMes INT,
    DiaAnio INT,
    EsFinDeSemana BIT
);