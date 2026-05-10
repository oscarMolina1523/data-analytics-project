using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace APPCORE.BDCore.SQLServerImplementations
{
	public class SQLServerEntityQuerys
	{
		public static string DescribeEntitys = @"
            SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE, TABLE_SCHEMA, TABLE_NAME
            FROM [INFORMATION_SCHEMA].[COLUMNS]
        ";
		public static string DescribeEntityQuery = @"
			SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE, TABLE_SCHEMA, TABLE_NAME
			FROM [INFORMATION_SCHEMA].[COLUMNS] 
			WHERE [TABLE_NAME] = 'entityName' order by [ORDINAL_POSITION]
		";
	}
}