using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace APPCORE.BDCore.MySqlImplementations
{
    public class MySqlEntityQuerys
    {
         public static string DescribeEntityQuery = @"
            SELECT COLUMN_NAME AS 'COLUMN_NAME', IS_NULLABLE as 'IS_NULLABLE', 
            DATA_TYPE as 'DATA_TYPE', TABLE_SCHEMA as 'TABLE_SCHEMA', TABLE_NAME as 'TABLE_NAME'
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE  TABLE_SCHEMA = 'entityDatabase' 
            ORDER BY ORDINAL_POSITION;
        ";
    }
}

