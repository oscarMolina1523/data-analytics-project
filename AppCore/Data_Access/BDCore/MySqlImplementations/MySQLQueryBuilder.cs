using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Reflection;
using System.Text.Json;
using System.Threading.Tasks;
using APPCORE.BDCore.Abstracts;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Npgsql;
using MySql.Data.MySqlClient;
using System;

namespace APPCORE.BDCore.MySqlImplementations
{
	public class MySQLQueryBuilder : BDQueryBuilderAbstract
	{

		/*Este método BuildSelectQuery se utiliza para construir consultas SELECT basadas en un objeto de clase de entidad, condiciones SQL adicionales y 
		opciones de filtrado. Este método es crucial para construir consultas SELECT complejas basadas en el estado actual del objeto EntityClass, sus 
		propiedades y filtros adicionales proporcionados. Permite una construcción dinámica de consultas que pueden adaptarse a una variedad de escenarios
		de recuperación de datos.*/
		public override (string queryResults, string queryCount, List<IDbDataParameter>? parameters) BuildSelectQuery(
			EntityClass Inst, string CondSQL,
		  int recursionDepth = 0) // Agregado recursionDepth
		{
			// Inicialización de variables para la construcción de la consulta
			string CondicionString = "";
			string Columns = "";

			// Obtener el tipo y las propiedades del objeto de clase de entidad
			Type _type = Inst.GetType();
			PropertyInfo[] lst = _type.GetProperties();

			// Describir las propiedades de la entidad
			List<EntityProps> entityProps = Inst.DescribeEntity(GetSqlType());
			// Generar un alias para la tabla
			string tableAlias = AliasGenerator();
			// Lista para almacenar parámetros IDbDataParameter
			List<IDbDataParameter> parameters = new List<IDbDataParameter>();

			// Iterar sobre las propiedades del objeto de clase de entidad
			foreach (PropertyInfo oProperty in lst)
			{
				string AtributeName = oProperty.Name;
				var EntityProp = entityProps.Find(e => e.COLUMN_NAME.ToLower().ToLower() == AtributeName.ToLower().ToLower());

				// Obtener atributos específicos de relación entre entidades
				var oneToOne = (OneToOne?)Attribute.GetCustomAttribute(oProperty, typeof(OneToOne));
				var manyToOne = (ManyToOne?)Attribute.GetCustomAttribute(oProperty, typeof(ManyToOne));
				var oneToMany = (OneToMany?)Attribute.GetCustomAttribute(oProperty, typeof(OneToMany));
				var jsonProp = (JsonProp?)Attribute.GetCustomAttribute(oProperty, typeof(JsonProp));

				// Si la propiedad pertenece a la entidad
				if (EntityProp != null)
				{
					IncludeExistingPropiertyInQuery(Inst, ref CondicionString, ref Columns, parameters, oProperty, AtributeName, EntityProp, jsonProp);
				}
				/* // Si la propiedad es una relación "ManyToOne" y se requiere la entidad completa
				else if (manyToOne != null && fullEntity)
				{
					//TODO REIMPLEMENTAR
					//Columns = IncludeManyToOneObjectInQuery(Inst, Columns, tableAlias, oProperty, AtributeName, manyToOne);
				}
				// Si la propiedad es una relación "OneToOne" y se requiere la entidad completa
				else if (oneToOne != null && fullEntity)
				{
					//TODO REIMPLEMENTAR
					//Columns = IncludeOneToOneObjectInQuery(Inst, Columns, lst, tableAlias, oProperty, AtributeName, oneToOne);
				}
				// Si la propiedad es una relación "OneToMany" y se requiere la entidad completa
				else if (oneToMany != null && fullEntity)
				{
					//TODO REIMPLEMENTAR
					//Columns = IncludeOneToManyObjectInQuery(Inst, Columns, tableAlias, oProperty, AtributeName, oneToMany);
				} */
			}
			//colocar filttros al query
			CondicionString = SetFilterData(Inst, CondicionString, lst, entityProps, parameters);

			// Eliminar caracteres innecesarios del final de la cadena de condiciones
			DeleteInnecesaryCharacters(CondSQL, ref CondicionString, ref Columns);

			// Obtener la propiedad de límite de filtro
			FilterData? filterLimit = Inst.filterData?.Find(f =>
					f.FilterType?.ToLower().Contains("limit") == true);
			// Obtener la propiedad de límite de filtro
			FilterData? filterPaginated = Inst.filterData?.Find(f =>
					f.FilterType?.ToLower().Contains("paginated") == true);


			// Construir la consulta SELECT principal
			string queryString = $"SELECT {Columns} FROM {entityProps[0].TABLE_SCHEMA}.{Inst?.GetType().Name.ToLower()} as {tableAlias} " +
								$" {CondicionString} {CondSQL} ";
			//{(filterLimit != null ? $" limit {filterLimit?.Values?[0]}" : "")} {(filterPaginated != null ? $" OFFSET {filterPaginated?.Values?[0]}" : "")}
			// Obtener la propiedad de clave principal
			PropertyInfo? primaryKeyPropierty = Inst?.GetType()?.GetProperties()?.ToList()?.Where(p => Attribute.GetCustomAttribute(p, typeof(PrimaryKey)) != null).FirstOrDefault();

			// Obtener las órdenes de filtro
			queryString = SetOrderByData(Inst, primaryKeyPropierty, queryString);
			queryString += $" {(filterLimit != null ? $" limit {filterLimit?.Values?[0]}" : "")} {(filterPaginated != null ? $" OFFSET {filterPaginated?.Values?[0]}" : "")}";
			// Construir la consulta COUNT para obtener el total de registros
			string queryStringCount = $" SELECT count(*) FROM {entityProps[0].TABLE_SCHEMA}.{Inst?.GetType().Name.ToLower()} as {tableAlias} {CondicionString} {CondSQL};";

			// Devolver la consulta principal y la consulta COUNT
			return (queryString, queryStringCount, parameters);
		}

		private string IncludeOneToManyObjectInQuery(EntityClass Inst, string Columns, string tableAlias, PropertyInfo oProperty, string AtributeName, OneToMany? oneToMany)
		{
			// Construir subconsulta para la relación "OneToMany"
			var oneToManyInstance = (EntityClass?)Activator.CreateInstance(oProperty.PropertyType.GetGenericArguments()[0]);
			if (oneToManyInstance != null)
			{
				oneToManyInstance.SetConnection(Inst.GetConnection());
			}
			string condition = " " + oneToMany?.ForeignKeyColumn + " = " + tableAlias + "." + oneToMany?.KeyColumn;
			(string subquery, _, _) = BuildSelectQuery(oneToManyInstance, condition);

			// Construir la subconsulta para agregar los resultados como JSON
			Columns = Columns +
					  $" (SELECT JSON_ARRAYAGG(JSON_OBJECT({subquery})) FROM ({subquery}) AS t) AS {AtributeName},";
			return Columns;
		}


		private string IncludeOneToOneObjectInQuery(EntityClass Inst, string Columns, PropertyInfo[] lst, string tableAlias, PropertyInfo oProperty, string AtributeName, OneToOne? oneToOne)
		{
			var oneToOneInstance = (EntityClass?)Activator.CreateInstance(oProperty.PropertyType);
			if (oneToOneInstance != null)
			{
				oneToOneInstance.SetConnection(Inst.GetConnection());
			}
			List<PropertyInfo> primaryKeyProperties = lst.Where(p => Attribute.GetCustomAttribute(p, typeof(PrimaryKey)) != null).ToList();
			PrimaryKey? pkInfo = (PrimaryKey?)Attribute.GetCustomAttribute(primaryKeyProperties[0], typeof(PrimaryKey));
			if (pkInfo != null)
			{
				string condition = " " + oneToOne?.KeyColumn + " = " + tableAlias + "." + oneToOne?.ForeignKeyColumn;
				(string subquery, _, _) = BuildSelectQuery(oneToOneInstance, condition);
				Columns = Columns + $" JSON_OBJECT(({subquery})) as {AtributeName},";
			}

			return Columns;
		}

		private string IncludeManyToOneObjectInQuery(EntityClass Inst, string Columns, string tableAlias, PropertyInfo oProperty, string AtributeName, ManyToOne? manyToOne)
		{
			var manyToOneInstance = (EntityClass?)Activator.CreateInstance(oProperty.PropertyType);
			if (manyToOneInstance != null)
			{
				manyToOneInstance.SetConnection(Inst.GetConnection());
			}
			string condition = " " + manyToOne?.KeyColumn + " = " + tableAlias + "." + manyToOne?.ForeignKeyColumn;
			(string subquery, _, _) = BuildSelectQuery(manyToOneInstance, condition);
			Columns = Columns + $" JSON_ARRAYAGG(({subquery})) as {AtributeName},";
			return Columns;
		}


		private void IncludeExistingPropiertyInQuery(EntityClass Inst, ref string CondicionString, ref string Columns, List<IDbDataParameter> parameters, PropertyInfo oProperty, string AtributeName, EntityProps? EntityProp, JsonProp? jsonProp)
		{
			if (jsonProp != null)
			{
				Columns += $" JSON_OBJECT(({AtributeName})) as {AtributeName},";
			}
			else
			{
				if (EntityProp?.DATA_TYPE.ToLower() == "date")
				{
					Columns = Columns + $"CASE WHEN {AtributeName} < '1753-01-01' THEN CAST('1990-01-01 00:00:00' AS DATETIME) ELSE CAST(CONCAT({AtributeName}, ' 00:00:00') AS DATETIME) END AS {AtributeName},";
				}
				else if (EntityProp?.DATA_TYPE.ToLower() == "bit")
				{
					Columns = Columns + $"CASE WHEN {AtributeName} = '1' THEN 'true' ELSE 'false' END AS {AtributeName},";
				}
				else
				{
					Columns = Columns + AtributeName + ",";
				}


			}
			var AtributeValue = oProperty.GetValue(Inst);
			if (AtributeValue != null && jsonProp == null)
			{
				WhereConstruction(ref CondicionString, AtributeName, AtributeValue, parameters, EntityProp, oProperty);
			}
		}


		public override (string queryResults, string queryCount, List<IDbDataParameter>? parameters) BuildSelectQueryPaginated(EntityClass Inst,
		 string CondSQL, int pageNum, int pageSize, string orderBy, string orderDir, bool fullEntity = true, bool isFind = false)
		{
			//TODO REMOVER LIMIT FILTER EN INST FILTERDATA
			(string queryString, string queryCount, List<IDbDataParameter>? parameters) = BuildSelectQuery(Inst, CondSQL);
			// paginación
			if (queryString.ToUpper().Contains(" LIMIT "))
			{
				queryString = queryString + $" OFFSET {(pageNum - 1) * pageSize}";
			}
			else
			{
				queryString = queryString + $" LIMIT {pageSize} OFFSET {(pageNum - 1) * pageSize}";
			}

			return (queryString, queryCount, parameters);
		}


		public override IDbDataParameter CreateParameter(string name, object value, string dataType, PropertyInfo oProperty, bool isJsonFilter = false)
		{
			// Determinar el tipo de datos SQL correspondiente al tipo de datos proporcionado
			MySqlDbType sqlDbType;
			switch (dataType)
			{
				case "varchar":
					sqlDbType = MySqlDbType.VarChar;
					break;
				case "text":
					sqlDbType = MySqlDbType.Text;
					break;
				case "char":
					sqlDbType = MySqlDbType.String;
					break;
				case "int":
					sqlDbType = MySqlDbType.Int32;
					break;
				case "float":
					sqlDbType = MySqlDbType.Float;
					break;
				case "decimal":
					sqlDbType = MySqlDbType.Decimal;
					break;
				case "bigint":
					sqlDbType = MySqlDbType.Int64;
					break;
				case "money":
					sqlDbType = MySqlDbType.Decimal;
					break;
				case "smallint":
					sqlDbType = MySqlDbType.Int16;
					break;
				case "bit":
					sqlDbType = MySqlDbType.Bit;
					break;
				case "datetime":
					sqlDbType = MySqlDbType.DateTime;
					break;
				case "date":
					sqlDbType = MySqlDbType.Date;
					break;
				case "tinyint":					
					sqlDbType = value is byte ? MySqlDbType.UByte : MySqlDbType.Byte;
					break;
				default:
					// Lanzar una excepción si el tipo de datos no es compatible
					throw new ArgumentException($"Tipo de datos no soportado: {dataType}");
			}

			// Verificar si la propiedad tiene el atributo JsonProp
			JsonProp? jsonPropAttribute = (JsonProp?)Attribute.GetCustomAttribute(oProperty, typeof(JsonProp));
			if (jsonPropAttribute != null)
			{
				// Tratar el valor como JSON si la propiedad tiene el atributo JsonProp
				string jsonValue = System.Text.Json.JsonSerializer.Serialize(value);
				//return new MySqlParameter(name, MySqlDbType.Text) { Value = jsonValue };
				return new MySqlParameter(name, MySqlDbType.JSON) { Value = jsonValue };
			}
			else
			{
				if (dataType.ToUpper() == "DATE" || dataType.ToUpper() == "DATETIME")
				{
					return new MySqlParameter(name, sqlDbType) {Value =  Convert.ToDateTime(value.ToString()).ToString("yyyy-MM-dd")};
				} 
				// Crear un parámetro normal si la propiedad no tiene el atributo JsonProp
				return new MySqlParameter(name, sqlDbType) { Value = value };
			}
		}



		protected override SqlEnumType GetSqlType()
		{
			return SqlEnumType.MYSQL;
		}
	}
}