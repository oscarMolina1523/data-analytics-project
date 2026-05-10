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

PRINT 'class ' + @tableName + ' extends  EntityClass {'
PRINT '	function __construct($params) {'
PRINT '		foreach ($params as $key => $value) {'
PRINT '			$this->$key = $value;'
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
	SELECT @sProperty = '	public $' + @columnName + ';'
	PRINT @sProperty

	--print ''
	FETCH NEXT FROM column_cursor INTO @columnName, @nullable, @datatype, @maxlen, @pos, @isNullable
END
CLOSE column_cursor
DEALLOCATE column_cursor

print '}'
print ''
FETCH NEXT FROM table_cursor 
INTO @tableName
END
CLOSE table_cursor
DEALLOCATE table_cursor