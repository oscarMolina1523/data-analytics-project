namespace APPCORE
{
	public class FilterData
	{
		public string? JsonPropName { get; set; }//nombre de la propiedaD DEL objeto o identidad, actalmente solo es util para json querys
		public string? PropName { get; set; }
		public string? PropSQLType { get; set; }//tipo de la propiedad del objeto o identidad, actalmente solo es util para json querys

		public string? FilterType { get; set; }
		public List<FilterData>? Filters { get; set; }
		public List<String?>? Values { get; set; }

		public static FilterData In<T>(string? propName, params T[] values)
		{
			return new FilterData
			{
				PropName = propName,
				FilterType = "in",
				Values = values.Select(v => v?.ToString()).ToList()
			};
		}
		public static FilterData In(string? propName, params object?[] values)
		{
			return new FilterData { PropName = propName, FilterType = "in", Values = values.Select(v => v?.ToString()).ToList() };
		}
		public static FilterData In(string? propName, params int[] values)
		{
			return new FilterData { PropName = propName, FilterType = "in", Values = values.Select(v => v.ToString()).ToList() };
		}
		public static FilterData In(string? propName, params int?[] values)
		{
			return new FilterData { PropName = propName, FilterType = "in", Values = values.Select(v => v.GetValueOrDefault().ToString()).ToList() };
		}
		public static FilterData NotIn(string? propName, params object?[] values)
		{
			return new FilterData { PropName = propName, FilterType = "not in", Values = values.Select(v => v?.ToString()).ToList() };
		}
		public static FilterData NotIn(string? propName, params int?[] values)
		{
			return new FilterData { PropName = propName, FilterType = "not in", Values = values.Select(v => v.GetValueOrDefault().ToString()).ToList() };
		}
		/*EQUALS*/
		public static FilterData Equal(string? propName, String? value)
		{
			return new FilterData { PropName = propName, FilterType = "=", Values = new List<string?> { value } };
		}
		public static FilterData Equal(string? propName, int? value)
		{
			if (value == null)
			{
				throw new Exception($"el valor no puede ser null {propName}");
			}
			return new FilterData { PropName = propName, FilterType = "=", Values = new List<string?> { value.ToString() } };
		}
		public static FilterData Equal(string? propName, object? value)
		{
			return new FilterData { PropName = propName, FilterType = "=", Values = new List<string?> { value?.ToString() } };
		}
		/*GREATER*/
		public static FilterData Greater(string? propName, DateTime? value)
		{
			return new FilterData { PropName = propName, FilterType = ">", Values = new List<string?> { value.ToString() } };
		}
		public static FilterData Greater(string? propName, int? value)
		{
			return new FilterData { PropName = propName, FilterType = ">", Values = new List<string?> { value.ToString() } };
		}
		public static FilterData Greater(string? propName, object? value)
		{
			return new FilterData { PropName = propName, FilterType = ">", Values = new List<string?> { value?.ToString() } };
		}
		/*GREATER EQUAL*/
		public static FilterData GreaterEqual(string? propName, DateTime? value)
		{
			return new FilterData { PropName = propName, FilterType = ">=", Values = new List<string?> { value.ToString() } };
		}
		public static FilterData GreaterEqual(string? propName, int? value)
		{
			return new FilterData { PropName = propName, FilterType = ">=", Values = new List<string?> { value.ToString() } };
		}
		public static FilterData GreaterEqual(string? propName, object? value)
		{
			return new FilterData { PropName = propName, FilterType = ">=", Values = new List<string?> { value?.ToString() } };
		}
		/*LESS*/
		public static FilterData Less(string? propName, DateTime? value)
		{
			return new FilterData { PropName = propName, FilterType = "<", Values = new List<string?> { value.ToString() } };
		}
		public static FilterData Less(string? propName, int? value)
		{
			return new FilterData { PropName = propName, FilterType = "<", Values = new List<string?> { value.ToString() } };
		}
		public static FilterData Less(string? propName, object? value)
		{
			return new FilterData { PropName = propName, FilterType = "<", Values = new List<string?> { value?.ToString() } };
		}
		/*LESS EQUAL*/
		public static FilterData LessEqual(string? propName, DateTime? value)
		{
			return new FilterData { PropName = propName, FilterType = "<=", Values = new List<string?> { value.ToString() } };
		}
		public static FilterData LessEqual(string? propName, int? value)
		{
			return new FilterData { PropName = propName, FilterType = "<=", Values = new List<string?> { value.ToString() } };
		}
		public static FilterData LessEqual(string? propName, object? value)
		{
			return new FilterData { PropName = propName, FilterType = "<=", Values = new List<string?> { value?.ToString() } };
		}
		/*DISTINCS*/
		public static FilterData Distinc(string? propName, String? value)
		{
			return new FilterData { PropName = propName, FilterType = "!=", Values = new List<string?> { value } };
		}
		public static FilterData Distinc(string? propName, int? value)
		{
			return new FilterData { PropName = propName, FilterType = "!=", Values = new List<string?> { value.ToString() } };
		}
		public static FilterData Distinc(string? propName, object? value)
		{
			return new FilterData { PropName = propName, FilterType = "!=", Values = new List<string?> { value?.ToString() } };
		}
		/*LIKE*/
		public static FilterData Like(string? propName, String? value)
		{
			return new FilterData { PropName = propName, FilterType = "like", Values = new List<string?> { value } };
		}

		/*Between*/
		public static FilterData Between(string? propName, DateTime value, DateTime value2)
		{
			return new FilterData { PropName = propName, FilterType = "BETWEEN", Values = new List<string?> { value.ToString("yyyy/MM/dd hh:mm:ss"), value2.ToString("yyyy/MM/dd hh:mm:ss") } };
		}
		public static FilterData Between(string? propName, int value, int value2)
		{
			return new FilterData { PropName = propName, FilterType = "BETWEEN", Values = new List<string?> { value.ToString(), value2.ToString() } };
		}
		public static FilterData Between(string? propName, double value, double value2)
		{
			return new FilterData { PropName = propName, FilterType = "BETWEEN", Values = new List<string?> { value.ToString(), value2.ToString() } };
		}
		public static FilterData ISNull(string propName)
		{
			return new FilterData { PropName = propName, FilterType = "IsNull" };
		}

		public static FilterData NotNull(string propName)
		{
			return new FilterData { PropName = propName, FilterType = "NotNull" };
		}
		/*Concatenaciones*/
		public static FilterData Or(params FilterData[] where_condition)
		{
			return new FilterData { FilterType = "or", Filters = where_condition.ToList() };
		}
		public static FilterData And(params FilterData[] where_condition)
		{
			return new FilterData { FilterType = "and", Filters = where_condition.ToList() };
		}
		/*ORDERS*/
		public static FilterData OrderByAsc(string? propName)
		{
			return new FilterData { PropName = propName, FilterType = "asc" };
		}
		public static FilterData OrderByDesc(string? propName)
		{
			return new FilterData { PropName = propName, FilterType = "desc" };
		}
		/*ORDERS*/
		public static FilterData Paginate(int value, int value2)
		{
			return new FilterData { FilterType = "paginate", Values = new List<string?> { value.ToString(), value2.ToString() } };
		}
		public static FilterData Limit(int value)
		{
			return new FilterData { FilterType = "limit", Values = new List<string?> { value.ToString() } };
		}
		/// <summary>
		/// Crea una instancia de <see cref="FilterData"/> para aplicar un filtro de tipo igualdad 
		/// entre una propiedad del modelo y una propiedad en un JSON almacenado en base de datos.
		/// </summary>
		/// <param name="propName">Nombre de la propiedad en la entidad o clase del modelo.</param>
		/// <param name="jsonPropName">Nombre de la propiedad dentro del objeto JSON que se desea comparar.</param>
		/// <param name="value">Valor a comparar contra la propiedad del JSON.</param>
		/// <param name="type">Tipo SQL de la propiedad (por ejemplo: "INT", "VARCHAR", "DATE").</param>
		/// <returns>
		/// Una nueva instancia de <see cref="FilterData"/> configurada para realizar un filtro de igualdad 
		/// basado en una propiedad contenida en un campo JSON.
		/// </returns>
		public static FilterData JsonPropEqual(string? propName, string? jsonPropName, object? value, string? type = null)
		{
			// Si no viene tipo, intentamos inferirlo del objeto
			if (type == null && value != null)
			{
				type = value switch
				{
					int or long => "INT",
					double or float or decimal => "DECIMAL",
					bool => "BIT",
					DateTime => "DATETIME",
					_ => "NVARCHAR" // Default si no se reconoce el tipo
				};
			}
			return new FilterData
			{
				PropName = propName,
				JsonPropName = jsonPropName,
				FilterType = "JSONPROP_EQUAL",
				PropSQLType = type,
				Values = [value?.ToString()]
			};
		}
	}
	public class OrdeData
	{
		public string? PropName { get; set; }
		public string? OrderType { get; set; }
		public OrdeData() { }
		public static OrdeData Asc(string? propName)
		{
			return new OrdeData { PropName = propName, OrderType = "ASC" };
		}
		public static OrdeData Desc(string? propName)
		{
			return new OrdeData { PropName = propName, OrderType = "DESC" };
		}

	}
}