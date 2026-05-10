declare @tableName varchar(200)
declare @columnName varchar(200)
declare @nullable varchar(50)
declare @datatype varchar(50)
declare @maxlen int
declare @pos int

declare @Stype varchar(50)
declare @isnullable varchar(1)
declare @Sproperty varchar(200)

DECLARE table_cursor CURSOR FOR
SELECT TABLE_NAME
FROM [INFORMATION_SCHEMA].[TABLES]

OPEN table_cursor

FETCH NEXT FROM table_cursor
INTO @tableName

WHILE @@FETCH_STATUS = 0
BEGIN

PRINT 'class ' + @tableName + ' {'
PRINT '	constructor(props) {'
PRINT '		Object.assign(this, props);'
PRINT '			this[prop] = props[prop];'
PRINT '		}'
PRINT '	}'
DECLARE column_cursor CURSOR FOR 
SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE, isnull(CHARACTER_MAXIMUM_LENGTH,'-1'), ORDINAL_POSITION
	, CASE WHEN (IS_NULLABLE = 'NO') THEN '' 
	ELSE 
		CASE WHEN (DATA_TYPE IN ('char','nchar','varchar','nvarchar')) THEN '' ELSE '?' END
	END

from [INFORMATION_SCHEMA].[COLUMNS] 
WHERE [TABLE_NAME] = @tableName
order by [ORDINAL_POSITION]

OPEN column_cursor
FETCH NEXT FROM column_cursor INTO @columnName, @nullable, @datatype, @maxlen, @pos, @isNullable

WHILE @@FETCH_STATUS = 0
BEGIN

-- datatype
select @sType = case @datatype
	when 'int' then 'number'
	when 'smallint' then 'number'
	when 'bigint' then 'number'
	when 'decimal' then 'number'
	when 'money' then 'number'
	when 'char' then 'text'
	when 'nchar' then 'text'
	when 'smallint' then 'text'
	when 'varchar' then 'text'
	when 'nvarchar' then 'text'
	when 'uniqueidentifier' then 'text'
	when 'datetime' then 'date'
	when 'date' then 'date'
	when 'bit' then 'checkbox'
else 'string'
END
declare @Primary varchar(200) = ''
	If (@pos = 1)
		set @Primary = ', primary: true '
		--PRINT '	[Key]'
	--If (@nullable = 'NO' AND @pos > 1)
		--PRINT '	[Required]'
	--if (@sType = 'string' and @maxLen <> '-1')
		--PRINT '	[MaxLength(' +  convert(varchar(4),@maxLen) + ')]'
	--if (@sType = 'datetime')
		--PRINT '	[Column(TypeName = "datetime")]'
	
	IF @columnName = 'Estado' BEGIN
		SELECT @sProperty = '	' + @columnName + ' = { type: "Select", Dataset: ["Activo","Inactivo"] };'
		PRINT @sProperty
	END
	ELSE BEGIN
		SELECT @sProperty = '	' + @columnName + ' = { type: "'+ @sType +'" '+@Primary+' };'
		PRINT @sProperty
	END

	--print ''
	FETCH NEXT FROM column_cursor INTO @columnName, @nullable, @datatype, @maxlen, @pos, @isNullable
END
CLOSE column_cursor
DEALLOCATE column_cursor

print '}'
print 'export{'+@tableName+'}'
FETCH NEXT FROM table_cursor 
INTO @tableName
END
CLOSE table_cursor
DEALLOCATE table_cursor