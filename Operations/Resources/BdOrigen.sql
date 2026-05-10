Create database BDOrigen;
go
DROP TABLE BDOrigen.dbo.CategoryEntity
CREATE TABLE BDOrigen.dbo.CategoryEntity (
	Id_Categoria int IDENTITY(0,1) NOT NULL,
	Nombre nvarchar(250) COLLATE Latin1_General_CI_AI NULL,
    UpdateAt Datetime, 
    CreatedAt Datetime, 
	CONSTRAINT NewTable_PK PRIMARY KEY (Id_Categoria)
);