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
using NpgsqlTypes;

namespace APPCORE.PostgresImplementations
{
	public class PostgreQueryBuilder : BDQueryBuilderAbstract
	{

		/*Este método BuildSelectQuery se utiliza para construir consultas SELECT basadas en un objeto de clase de entidad, condiciones SQL adicionales y 
		opciones de filtrado. Este método es crucial para construir consultas SELECT complejas basadas en el estado actual del objeto EntityClass, sus 
		propiedades y filtros adicionales proporcionados. Permite una construcción dinámica de consultas que pueden adaptarse a una variedad de escenarios
		de recuperación de datos.*/
		public override (string queryResults, string queryCount, List<IDbDataParameter>? parameters) BuildSelectQuery(EntityClass Inst, string CondSQL,
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
				// Si la propiedad pertenece a la entidad
				if (EntityProp != null)
				{
					IncludeExistingPropiertyInQuery(Inst, ref CondicionString, ref Columns, parameters, oProperty, AtributeName, EntityProp, jsonProp);
				}
				// Si la propiedad es una relación "ManyToOne" y se requiere la entidad completa
				else if (manyToOne != null && recursionDepth < 3)
				{
					Columns = IncludeManyToOneObjectInQuery(Inst, Columns, tableAlias, oProperty, AtributeName, manyToOne, recursionDepth); // Pasar recursionDepth
				}
				// Si la propiedad es una relación "OneToOne" y se requiere la entidad completa
				else if (oneToOne != null && recursionDepth < 3)
				{
					Columns = IncludeOneToOneObjectInQuery(Inst, Columns, lst, tableAlias, oProperty, AtributeName, oneToOne, recursionDepth);
				}
				// Si la propiedad es una relación "OneToMany" y se requiere la entidad completa
				else if (oneToMany != null && recursionDepth < 3)
				{
					Columns = IncludeOneToManyObjectInQuery(Inst, Columns, tableAlias, oProperty, AtributeName, oneToMany, recursionDepth);
				}
			}
			//colocar filttros al query
			CondicionString = SetFilterData(Inst, CondicionString, lst, entityProps, parameters);

			// Eliminar caracteres innecesarios del final de la cadena de condiciones
			DeleteInnecesaryCharacters(CondSQL, ref CondicionString, ref Columns);

			// Obtener la propiedad de límite de filtro
			FilterData? filterLimit = Inst.filterData?.Find(f =>
					f.FilterType?.ToLower().Contains("limit") == true);


			// Construir la consulta SELECT principal
			string queryString = $"SELECT {Columns} FROM {entityProps[0].TABLE_SCHEMA}.{Inst?.GetType().Name} as {tableAlias} " +
								$" {CondicionString} {CondSQL} {(filterLimit != null ? $" limit {filterLimit?.Values?[0]}" : "")}";

			// Obtener la propiedad de clave principal
			PropertyInfo? primaryKeyPropierty = Inst?.GetType()?.GetProperties()?.ToList()?.Where(p => Attribute.GetCustomAttribute(p, typeof(PrimaryKey)) != null).FirstOrDefault();

			// Obtener las órdenes de filtro
			queryString = SetOrderByData(Inst, primaryKeyPropierty, queryString);

			// Construir la consulta COUNT para obtener el total de registros
			string queryStringCount = $" SELECT count(*) FROM {entityProps[0].TABLE_SCHEMA}.{Inst?.GetType().Name} as {tableAlias} {CondicionString} {CondSQL};";

			// Devolver la consulta principal y la consulta COUNT
			return (queryString, queryStringCount, parameters);
		}

		private string IncludeOneToManyObjectInQuery(EntityClass Inst,
			string Columns, string tableAlias,
			PropertyInfo oProperty, string AtributeName,
			OneToMany? oneToMany, int recursionDepth) // Agregado recursionDepth
		{
			// Construir subconsulta para la relación "OneToMany"
			var oneToManyInstance = (EntityClass?)Activator.CreateInstance(oProperty.PropertyType.GetGenericArguments()[0]);
			if (oneToManyInstance != null)
			{
				//oneToManyInstance.SetConnection(Inst.GetConnection());
			}
			string condition = " " + oneToMany?.ForeignKeyColumn + " = " + tableAlias + "." + oneToMany?.KeyColumn;
			(string subquery, _, _) = BuildSelectQuery(oneToManyInstance,
				condition, oneToMany?.TableName == Inst.GetType().Name ? 3 : (recursionDepth + 1));
			Columns = Columns +
				 $" (SELECT json_agg(to_jsonb(t)) FROM ({subquery}) t) as {AtributeName},";
			return Columns;
		}

		private string IncludeOneToOneObjectInQuery(EntityClass Inst,
			string Columns, PropertyInfo[] lst,
			string tableAlias,
			PropertyInfo oProperty,
			string AtributeName,
			OneToOne? oneToOne,
			int recursionDepth)
		{
			// Construir subconsulta JSON para la relación "OneToOne"
			var oneToOneInstance = (EntityClass?)Activator.CreateInstance(oProperty.PropertyType);
			if (oneToOneInstance != null)
			{
				//oneToOneInstance.SetConnection(Inst.GetConnection());
			}
			List<PropertyInfo> primaryKeyProperties = lst.Where(p => Attribute.GetCustomAttribute(p, typeof(PrimaryKey)) != null).ToList();
			PrimaryKey? pkInfo = (PrimaryKey?)Attribute.GetCustomAttribute(primaryKeyProperties[0], typeof(PrimaryKey));
			if (pkInfo != null)
			{
				string condition = " " + oneToOne?.KeyColumn + " = " + tableAlias + "." + oneToOne?.ForeignKeyColumn;
				(string subquery, _, _) = BuildSelectQuery(oneToOneInstance, condition, recursionDepth: recursionDepth + 1);
				Columns = Columns + $" to_jsonb(({subquery})) as {AtributeName},";
			}

			return Columns;
		}

		private string IncludeManyToOneObjectInQuery(EntityClass Inst,
			string Columns, string tableAlias,
			PropertyInfo oProperty, string AtributeName,
			ManyToOne? manyToOne, int recursionDepth) // Agregado recursionDepth
		{
			// Construir subconsulta JSON para la relación "ManyToOne"
			var manyToOneInstance = (EntityClass?)Activator.CreateInstance(oProperty.PropertyType);
			if (manyToOneInstance != null)
			{
				//manyToOneInstance.SetConnection(Inst.GetConnection());
			}
			string condition = " " + manyToOne?.KeyColumn + " = " + tableAlias + "." + manyToOne?.ForeignKeyColumn;
			(string subquery, _, _) = BuildSelectQuery(manyToOneInstance, condition, recursionDepth: recursionDepth + 1); // Incrementar recursionDepth
			Columns = Columns + $" to_jsonb(({subquery})) as {AtributeName},";
			return Columns;
		}

		private void IncludeExistingPropiertyInQuery(EntityClass Inst, ref string CondicionString, ref string Columns, List<IDbDataParameter> parameters, PropertyInfo oProperty, string AtributeName, EntityProps? EntityProp, JsonProp? jsonProp)
		{
			if (jsonProp != null)
			{
				//JsonColumns += $" CROSS APPLY OPENJSON({AtributeName} ) AS {AtributeName} ";
				Columns += $" to_jsonb(({AtributeName})) as {AtributeName},";
			}
			else
			{
				// Agregar el nombre de la columna a las columnas seleccionadas
				Columns = Columns + AtributeName + ",";
			}
			// Construir condiciones de consulta basadas en el valor de la propiedad
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
		/*Este método CreateParameter es la implementaciion de su abstracto en sql server y crear un parámetro IDbDataParameter para su uso en consultas
		SQL con SQL Server.
		
		este método toma un nombre, un valor, un tipo de datos y una propiedad de una entidad, y crea un parámetro NpgsqlParameter configurado correctamente 
		para su uso en consultas SQL parametrizadas con SQL Server. Si la propiedad tiene un atributo JsonProp, el valor se trata como JSON; de lo contrario,
		se asigna directamente al parámetro.*/
		public override IDbDataParameter CreateParameter(string name, object value, string dataType, PropertyInfo oProperty, bool isJsonFilter = false)
		{
			// Determinar el tipo de datos SQL correspondiente al tipo de datos proporcionado
			NpgsqlDbType sqlDbType;
			switch (dataType)
			{
				case "varchar":
					sqlDbType = NpgsqlDbType.Varchar;
					break;
				case "text":
					sqlDbType = NpgsqlDbType.Text;
					break;
				case "char":
					sqlDbType = NpgsqlDbType.Char;
					break;
				case "int":
					sqlDbType = NpgsqlDbType.Integer;
					break;
				case "float":
					sqlDbType = NpgsqlDbType.Double;
					break;
				case "decimal":
					sqlDbType = NpgsqlDbType.Numeric;
					break;
				case "bigint":
					sqlDbType = NpgsqlDbType.Bigint;
					break;
				case "money":
					sqlDbType = NpgsqlDbType.Money;
					break;
				case "smallint":
					sqlDbType = NpgsqlDbType.Smallint;
					break;
				case "bit":
					sqlDbType = NpgsqlDbType.Boolean;
					break;
				case "datetime":
					sqlDbType = NpgsqlDbType.Timestamp;
					break;
				case "date":
					sqlDbType = NpgsqlDbType.Date;
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
				string jsonValue = System.Text.Json.JsonSerializer.Serialize(value);// JsonConvert.SerializeObject(value);
				return new NpgsqlParameter(name, sqlDbType) { Value = JValue.Parse(jsonValue).ToString(Formatting.Indented) };
			}
			else
			{
				// Crear un parámetro normal si la propiedad no tiene el atributo JsonProp
				return new NpgsqlParameter(name, sqlDbType) { Value = value };
			}
		}

		protected override SqlEnumType GetSqlType()
		{
			return SqlEnumType.POSTGRES_SQL;
		}
	}
}