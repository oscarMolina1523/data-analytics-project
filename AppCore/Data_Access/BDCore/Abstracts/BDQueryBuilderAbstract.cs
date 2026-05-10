using System.Data;
using System.Reflection;
using System.Text;


namespace APPCORE.BDCore.Abstracts
{
	public abstract class BDQueryBuilderAbstract
	{
		public abstract (string queryResults, string queryCount, List<IDbDataParameter>? parameters) BuildSelectQuery(
			EntityClass Inst,
			string CondSQL,
			int recursionDepth = 0);

		public abstract (string queryResults, string queryCount, List<IDbDataParameter>? parameters) BuildSelectQueryPaginated(EntityClass Inst, string CondSQL,
			int pageNum, int pageSize, string orderBy, string orderDir, bool fullEntity = true, bool isFind = true);

		#region  QUERYBUILDER IMPLEMANTATIONS     
		/*Este método abstracto CreateParameter se utiliza para crear un parámetro IDbDataParameter, que representa un parámetro 
		para una consulta SQL parametrizada. 
		
		Este método debe ser implementado en una clase concreta que herede de la clase que contiene este método abstracto. 
		La implementación específica puede variar dependiendo del proveedor de base de datos utilizado (por ejemplo, SQL Server, MySQL, etc.).
		Aquí está una breve descripción de los parámetros:

			name: El nombre del parámetro.
			value: El valor del parámetro.
			dataType: El tipo de datos de la columna correspondiente en la base de datos.
			oProperty: La propiedad de la entidad que corresponde al parámetro.
		
		La implementación de este método debe crear y retornar un objeto IDbDataParameter configurado adecuadamente con los valores proporcionados.
		Esto generalmente implica crear un objeto del tipo específico de parámetro para el proveedor de base de datos que estás utilizando, 
		establecer su nombre, valor y otros atributos según sea necesario, y luego devolverlo.

		Por ejemplo, si estás trabajando con SQL Server, la implementación de este método podría crear un SqlParameter y configurarlo con el nombre,
		valor y tipo de datos proporcionados. Si estás trabajando con MySQL, la implementación podría crear un MySqlParameter de manera similar.*/
		public abstract IDbDataParameter CreateParameter(string name, object value, string dataType, PropertyInfo oProperty, bool isJsonFilter = false);
		/*Este método BuildUpdateQueryByObject construye una consulta de actualización SQL basada en un objeto de clase 
		de entidad y un conjunto de propiedades de "donde" (condiciones de actualización). este método recorre las propiedades 
		del objeto de la clase de entidad y construye una consulta de actualización SQL basada en las propiedades proporcionadas
		y las condiciones de actualización. Luego, devuelve la consulta de actualización junto con los parámetros 
		IDbDataParameter necesarios para la ejecución de la consulta.*/
		public (string?, List<IDbDataParameter>?) BuildUpdateQueryByObject(EntityClass Inst, string[] WhereProps)
		{
			// Nombre de la tabla basado en el tipo de clase de entidad
			string TableName = Inst.GetType().Name.ToLower();

			// Cadena para almacenar los valores a actualizar
			string Values = "";

			// Cadena para almacenar las condiciones de actualización
			string Conditions = "";

			// Obtener el tipo y las propiedades del objeto de clase de entidad
			Type _type = Inst.GetType();
			PropertyInfo[] lst = _type.GetProperties();

			// Describir las propiedades de la entidad
			List<EntityProps> entityProps = Inst.DescribeEntity(GetSqlType());
			// Lista para almacenar parámetros IDbDataParameter
			List<IDbDataParameter> parameters = new List<IDbDataParameter>();

			foreach (PropertyInfo oProperty in lst)
			{
				string AtributeName = oProperty.Name;
				var AtributeValue = oProperty.GetValue(Inst);

				// Buscar la propiedad correspondiente en las propiedades de la entidad
				var EntityProp = entityProps.Find(e => e.COLUMN_NAME.ToLower() == AtributeName.ToLower());

				if (AtributeValue != null && EntityProp != null)
				{
					// Si la propiedad no está en el conjunto de propiedades de "donde",
					// se agrega a los valores a actualizar y se crea un parámetro
					// IDbDataParameter correspondiente
					if ((from O in WhereProps where O == AtributeName select O).ToList().Count == 0)
					{
						string paramName = "@" + AtributeName + AliasGenerator();
						Values = Values + $"{AtributeName} = {paramName},";
						IDbDataParameter parameter = CreateParameter(paramName, AtributeValue, EntityProp.DATA_TYPE, oProperty);
						parameters.Add(parameter);
					}
					else
					{
						// Si la propiedad está en el conjunto de propiedades de "donde",
						// se construyen las condiciones de actualización
						WhereConstruction(ref Conditions, AtributeName, AtributeValue, parameters, EntityProp, oProperty);
					}
				}
				else continue;
			}

			// Eliminar la coma final en los valores
			Values = Values.TrimEnd(',');

			// Si no hay valores para actualizar, retorna null
			if (Values == "")
			{
				return (null, null);
			}

			// Construir la consulta de actualización
			string strQuery = "UPDATE  " + entityProps[0].TABLE_SCHEMA + "." + TableName.ToLower() + " SET " + Values + Conditions;
			//LoggerServices.AddMessageInfo(strQuery);

			return (strQuery, parameters);
		}

		public (string?, List<IDbDataParameter>?) BuildUpdateQueryByObject(EntityClass Inst, string IdObject)
		{
			return BuildUpdateQueryByObject(Inst, new string[] { IdObject });
		}
		/*Este método BuildInsertQueryByObjectParameters es similar al anterior, pero en lugar de construir la consulta de inserción directamente,
		crea parámetros SQL para ser utilizados con comandos parametrizados.
		
		Este método es esencial para generar consultas de inserción seguras y eficientes, utilizando parámetros SQL para prevenir ataques de inyección SQL.
		Cada propiedad del objeto se mapea a un parámetro SQL correspondiente, lo que garantiza una inserción segura de datos en la base de datos.
		*/
		public (string?, List<IDbDataParameter>?) BuildInsertQueryByObjectParameters(EntityClass Inst)
		{
			// Variables para almacenar los nombres de columnas y los valores correspondientes en la consulta INSERT
			string ColumnNames = "";
			string Values = "";

			// Lista para almacenar los parámetros SQL
			List<IDbDataParameter> parameters = new List<IDbDataParameter>();

			// Obtiene el tipo de la instancia del objeto
			Type _type = Inst.GetType();

			// Obtiene todas las propiedades del objeto
			PropertyInfo[] lst = _type.GetProperties();

			// Describe las propiedades de la entidad utilizando el nombre del tipo del objeto
			List<EntityProps> entityProps = Inst.DescribeEntity(GetSqlType());

			// Itera sobre todas las propiedades del objeto
			foreach (PropertyInfo oProperty in lst)
			{
				string AtributeName = oProperty.Name;
				var AtributeValue = oProperty.GetValue(Inst);

				// Busca la propiedad en la descripción de la entidad
				var EntityProp = entityProps.Find(e => e.COLUMN_NAME.ToLower() == AtributeName.ToLower());

				// Verifica si la propiedad y su valor no son nulos y existen en la descripción de la entidad
				if (AtributeValue != null && EntityProp != null)
				{
					string paramName = "@" + AtributeName + AliasGenerator();
					ColumnNames += AtributeName + ",";
					Values += paramName + ",";

					// Crea un parámetro SQL correspondiente a la propiedad
					IDbDataParameter parameter = CreateParameter(paramName, AtributeValue, EntityProp.DATA_TYPE, oProperty);
					parameters.Add(parameter);
				}
				else
				{
					// Si la propiedad o su valor son nulos o no existen en la descripción de la entidad, continúa con la siguiente iteración
					continue;
				}
			}

			// Elimina la coma adicional al final de las listas de nombres de columnas y valores
			ColumnNames = ColumnNames.TrimEnd(',');
			Values = Values.TrimEnd(',');

			// Si no hay valores para insertar, retorna null
			if (Values == "")
			{
				return (null, null);
			}

			// Construye la consulta INSERT completa, incluyendo la obtención del identificador insertado (SCOPE_IDENTITY)
			string QUERY = $"INSERT INTO {entityProps[0].TABLE_SCHEMA}.{Inst.GetType().Name.ToLower()} ({ColumnNames}) VALUES({Values}) SELECT SCOPE_IDENTITY()";

			// Registra un mensaje de información con la consulta construida
			//LoggerServices.AddMessageInfo(QUERY);

			// Retorna la consulta INSERT y los parámetros SQL creados
			return (QUERY, parameters);
		}
		public (string?, List<IDbDataParameter>?) BuildDeleteQuery(EntityClass Inst)
		{
			//TODO VALIDAR BIEN, validar filterdata y OrderData!!
			string TableName = Inst.GetType().Name.ToLower();
			string CondicionString = "";
			Type _type = Inst.GetType();
			PropertyInfo[] lst = _type.GetProperties();
			List<EntityProps> entityProps = Inst.DescribeEntity(GetSqlType());
			// Lista para almacenar parámetros IDbDataParameter
			List<IDbDataParameter> parameters = new List<IDbDataParameter>();
			foreach (PropertyInfo oProperty in lst)
			{
				string AtributeName = oProperty.Name;
				var AtributeValue = oProperty.GetValue(Inst);
				// Buscar la propiedad correspondiente en las propiedades de la entidad
				var EntityProp = entityProps.Find(e => e.COLUMN_NAME.ToLower() == AtributeName.ToLower());
				if (AtributeValue != null && EntityProp != null)
				{
					WhereConstruction(ref CondicionString, AtributeName, AtributeValue, parameters, EntityProp, oProperty);
				}

			}
			CondicionString = CondicionString.TrimEnd(new char[] { '0', 'R' });
			string strQuery = "DELETE FROM  " + entityProps[0].TABLE_SCHEMA + "." + TableName.ToLower() + CondicionString;
			//LoggerServices.AddMessageInfo(strQuery);
			return (strQuery, parameters);
		}


		protected abstract SqlEnumType GetSqlType();

		protected string AliasGenerator()
		{
			char ta = (char)(((int)'A') + new Random().Next(26));
			char ta2 = (char)(((int)'A') + new Random().Next(26));
			char ta3 = (char)(((int)'A') + new Random().Next(26));
			char ta4 = (char)(((int)'A') + new Random().Next(26));
			char ta5 = (char)(((int)'A') + new Random().Next(26));
			char ta6 = (char)(((int)'A') + new Random().Next(26));
			return ta.ToString() + ta2 + ta3 + "_" + ta4 + "_" + ta5 + "_" + ta6;
		}
		/*Este método WhereConstruction se encarga de construir dinámicamente las condiciones de una cláusula
		WHERE en una consulta SQL, basándose en el nombre y el valor de una propiedad del objeto EntityClass.
		este método es responsable de construir las condiciones de una cláusula WHERE de una consulta SQL, teniendo en 
		cuenta el tipo de valor de la propiedad y agregándolas a la cadena de condiciones CondicionString.*/
		protected void WhereConstruction(ref string CondicionString, string AtributeName, object AtributeValue,
			List<IDbDataParameter> parameters, EntityProps entityProp, PropertyInfo propertyInfo)
		{
			if (AtributeValue != null)
			{
				WhereOrAnd(ref CondicionString);
				string paramName = "@" + AtributeName + AliasGenerator();
				CondicionString = CondicionString + $"{AtributeName} = {paramName} ";
				//TODO WILBER
				IDbDataParameter parameter = CreateParameter(paramName, AtributeValue, entityProp.DATA_TYPE, propertyInfo);
				parameters.Add(parameter);
			}
		}
		/*Este método construye una condición SQL basada en el filtro proporcionado y el tipo de datos de la propiedad.
		Los comentarios explican cada sección del código y su propósito.*/
		protected string SetFilterValueCondition(PropertyInfo[] props, FilterData filter,
		List<IDbDataParameter> parameters, List<EntityProps> entityProps)
		{
			string CondicionString = ""; // String donde se construirá la condición SQL
			PropertyInfo? prop = props.ToList().Find(p => p.Name.ToLower().Equals(filter?.PropName?.ToLower())); // Obtiene la propiedad correspondiente al nombre proporcionado en el filtro
			string? atributeType = ""; // Tipo de datos de la propiedad
			string AtributeName = ""; // Nombre de la propiedad
			var EntityProp = entityProps.Find(e => e.COLUMN_NAME.ToLower().ToLower() == filter?.PropName?.ToLower());

			// Si el filtro es LIKE y el campo es un JSON
			JsonProp? jsonPropAttribute = null;

			// Verifica si la propiedad existe
			if (prop != null)
			{
				AtributeName = prop.Name; // Obtiene el nombre de la propiedad
				var propertyType = Nullable.GetUnderlyingType(prop?.PropertyType) ?? prop?.PropertyType; // Obtiene el tipo de datos de la propiedad
				atributeType = propertyType?.Name; // Obtiene el nombre del tipo de datos
			}

			// Evalúa el tipo de filtro
			switch (filter.FilterType?.ToUpper())
			{
				case "AND":
				case "OR":
					// Si el filtro es AND u OR y tiene subfiltros, construye una condición compuesta recursivamente
					if (filter.Filters != null && filter.Filters.Count != 0)
					{
						int index = 0;
						filter.Filters.ForEach(f =>
						{
							string condition = SetFilterValueCondition(props, f, parameters, entityProps);
							if (condition.Length > 0)
							{
								CondicionString += $" {(index == 0 ? "(" : filter.FilterType)} {condition}";
							}
							index++;
						});
						CondicionString += ") ";
					}
					break;
				case "BETWEEN":
					// Si el filtro es BETWEEN, construye una condición para un rango de valores
					if (filter?.Values?.Count > 0 && EntityProp != null)
					{
						string paramName1 = $"@{AtributeName}_{parameters.Count + 1}_1";
						if (filter.Values[0] != null)
						{
							IDbDataParameter parameter1 = CreateParameter(paramName1, filter.Values[0], EntityProp?.DATA_TYPE, prop);
							parameters.Add(parameter1);
						}
						if (filter?.Values?.Count > 1 && filter.Values[0] == null)
						{
							string paramName2 = $"@{AtributeName}_{parameters.Count + 1}_2";
							IDbDataParameter parameter2 = CreateParameter(paramName2, filter.Values[1], EntityProp?.DATA_TYPE, prop);
							parameters.Add(parameter2);
							CondicionString += $" {AtributeName}  <= {paramName2} ";
						}
						else if (filter?.Values?.Count > 1)
						{
							string paramName2 = $"@{AtributeName}_{parameters.Count + 1}_2";
							IDbDataParameter parameter2 = CreateParameter(paramName2, filter.Values[1], EntityProp?.DATA_TYPE, prop);
							parameters.Add(parameter2);
							CondicionString += $" {AtributeName}  >= {paramName1} AND {AtributeName}  <= {paramName2} ";
						}
						else
						{
							CondicionString += $" {AtributeName}  >= {paramName1}";
						}
					}
					break;
				case "IN":
				case "NOT IN":
					// Si el filtro es IN o NOT IN, construye una condición para comparar con una lista de valores
					if (filter?.Values?.Count > 0 && EntityProp != null)
					{
						CondicionString = CondicionString + AtributeName + $" {filter?.FilterType} (" + BuildArrayIN(filter?.Values, atributeType) + ") ";
					}
					break;
				case "LIKE":
					// Si el filtro es LIKE, construye una condición para buscar coincidencias parciales
					if (filter?.Values?.Count > 0 && EntityProp != null)
					{
						string paramName = $"@{AtributeName}_{parameters.Count + 1}";
						IDbDataParameter parameter1 = CreateParameter(paramName, filter.Values[0], EntityProp?.DATA_TYPE, prop);
						parameters.Add(parameter1);
						CondicionString += $" {AtributeName}  LIKE  '%' + {paramName} + '%' ";
					}
					break;
				case "NOTNULL":
				case "NOT NULL":
					if (EntityProp != null)
					{
						CondicionString += $" {AtributeName} IS NOT NULL ";
					}
					break;
				case "ISNULL":
				case "IS NULL":
					if (EntityProp != null)
					{
						CondicionString += $" {AtributeName}  IS NULL ";
					}
					break;
				case "JSONPROP_EQUAL":
					//PropertyInfo? propJSON = props.ToList().Find(p => p.Name.ToLower().Equals(filter?.ObjectName?.ToLower())); // Obtiene la propiedad correspondiente al nombre proporcionado en el filtro
					if (prop != null)
					{
						AtributeName = prop.Name;
						jsonPropAttribute = (JsonProp?)Attribute.GetCustomAttribute(prop, typeof(JsonProp));
						if (filter?.Values?.Count > 0 && jsonPropAttribute != null)
						{
							string paramName = $"@{AtributeName}_{parameters.Count + 1}";
							IDbDataParameter parameter1 = CreateParameter(paramName, filter.Values[0], filter.PropSQLType, prop, true);
							parameters.Add(parameter1);
							// Construimos la condición con JSON_VALUE
							CondicionString += $" JSON_VALUE({AtributeName}, '$.{filter.JsonPropName}') = {paramName} ";
						}
						else
						{
							throw new Exception($"el valor no puede ser null y debe existir en la entidad con el atributo JsonProp {filter?.JsonPropName}");
						}
					}
					break;
				default:
					// Para otros tipos de filtro, construye una condición de comparación simple
					if (filter?.Values?.Count > 0 && EntityProp != null)
					{
						string paramName = $"@{AtributeName}_{parameters.Count + 1}";
						IDbDataParameter parameter1 = CreateParameter(paramName, filter.Values[0], EntityProp?.DATA_TYPE, prop);
						parameters.Add(parameter1);
						CondicionString += $" {AtributeName}  {filter.FilterType}  {paramName} ";
					}/*else{
						throw new Exception($"El filtro no se puede implementar porque la propiedad {filter?.PropName} no existe en :  (todo mostrar nombre de tabla)");//todo incluir el nombre de la tabla
					}*/
					break;
			}
			if (CondicionString == "")
			{
				//throw new Exception("filtros no establecidos correctamente");
			}
			return CondicionString; // Devuelve la condición construida
		}

		protected void WhereOrAnd(ref string CondicionString)
		{
			if (!CondicionString.Contains("WHERE"))
				CondicionString = " WHERE ";
			else
				CondicionString += " AND ";
		}
		/*Este método recorre una lista de valores y los agrega a una cadena separados por comas. Si los valores son numéricos, no se agregan comillas
		 alrededor de ellos; de lo contrario, se agregan comillas simples. La función luego elimina la coma final antes de devolver la cadena construida.*/
		public static string BuildArrayIN(List<string?> conditions, string atributeType = "string")
		{
			string CondicionString = ""; // Cadena donde se construirán los valores para la cláusula IN
			foreach (string? Value in conditions)
			{
				// Verifica el tipo de datos de la propiedad para formatear adecuadamente los valores
				if (atributeType == "int" || atributeType == "Double" || atributeType == "Decimal" || atributeType == "Int32" || atributeType == "Int16")
					CondicionString = CondicionString + Value?.ToString() + ","; // Agrega el valor a la cadena
				else
					CondicionString = CondicionString + "'" + Value + "',"; // Agrega el valor entre comillas simples a la cadena
			}
			CondicionString = CondicionString.TrimEnd(','); // Elimina la última coma de la cadena
			return CondicionString; // Devuelve la cadena de valores
		}

		public string SetFilterData(EntityClass Inst, string CondicionString, PropertyInfo[] lst, List<EntityProps> entityProps, List<IDbDataParameter> parameters)
		{
			// Construir condiciones de consulta basadas en el filtro de datos
			if (Inst.filterData != null && Inst.filterData.Count != 0)
			{
				foreach (FilterData filter in Inst.filterData)
				{
					// Construir condiciones de consulta basadas en el filtro de datos
					string filterCond = SetFilterValueCondition(lst, filter, parameters, entityProps);
					if (filterCond.Length != 0)
					{
						WhereOrAnd(ref CondicionString);
						CondicionString += filterCond;
					}
				}
			}

			return CondicionString;
		}

		public void DeleteInnecesaryCharacters(string CondSQL, ref string CondicionString, ref string Columns)
		{

			// Eliminar caracteres innecesarios del final de la cadena de condiciones
			CondicionString = CondicionString.TrimEnd(new char[] { '0', 'R' });

			// Ajustar la cadena de condiciones según lo especificado
			if (CondicionString == "" && CondSQL != "")
			{
				CondicionString = " WHERE ";
			}
			else if (CondicionString != "" && CondSQL != "")
			{
				CondicionString = CondicionString + " AND ";
			}

			// Eliminar la coma final de la lista de columnas
			Columns = Columns.TrimEnd(',');
		}
		public string SetOrderByData(EntityClass Inst, PropertyInfo? primaryKeyPropierty, string queryString)
		{
			// Obtener las órdenes de filtro			
			var filterOrders = Inst?.orderData?.Where(f => f.PropName != null &&
					(f.OrderType?.ToLower().Contains("asc") == true || f.OrderType?.ToLower().Contains("desc") == true)).ToList();
			// Construir la cláusula ORDER BY según sea necesario
			if (filterOrders != null && filterOrders.Count != 0)
			{
				queryString = queryString + $" Order by {String.Join(", ", filterOrders.Select(o => $" {o.PropName} {o.OrderType} "))}";
			}
			else if (primaryKeyPropierty != null)
			{
				queryString = queryString + " ORDER BY " + primaryKeyPropierty.Name + " DESC";
			}

			return queryString;
		}

		internal string? BuildUpdateNullsPropertys(EntityClass entityClass, string[] properties)
		{
			if (entityClass == null || properties == null || properties.Length == 0)
				return null;
				
			List<EntityProps> entityProps = entityClass.DescribeEntity(GetSqlType());

			Type entityType = entityClass.GetType();
			string tableName = entityType.Name; // Se asume que el nombre de la clase es el nombre de la tabla

			// Buscar la propiedad marcada como PrimaryKey
			PropertyInfo? primaryKeyProperty = entityType.GetProperties()
				.FirstOrDefault(prop => prop.GetCustomAttribute<PrimaryKey>() != null);

			if (primaryKeyProperty == null)
				throw new InvalidOperationException("No se encontró una clave primaria en la entidad.");

			string primaryKeyColumn = primaryKeyProperty.Name;
			object? primaryKeyValue = primaryKeyProperty.GetValue(entityClass);

			if (primaryKeyValue == null)
				throw new InvalidOperationException("El valor de la clave primaria no puede ser nulo.");

			// Construcción de la consulta SQL
			StringBuilder sqlQuery = new StringBuilder();
			sqlQuery.Append($"UPDATE {entityProps[0].TABLE_SCHEMA + "." + tableName} SET ");
			
			sqlQuery.Append(string.Join(", ", properties.Select(p =>   $"{p} = NULL")));

			sqlQuery.Append($" WHERE {primaryKeyColumn} = {FormatValue(primaryKeyValue)};");

			return sqlQuery.ToString();
		}
		private string FormatValue(object value)
		{
			return value is string || value is DateTime ? $"'{value}'" : value.ToString();
		}

		//DATA SQUEMA
		#endregion

	}
}