
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