using System;
using System.Data;
using System.Linq;
using System.Reflection;
using Newtonsoft.Json;

namespace APPCORE
{
	public class AdapterUtil
	{
		public static object? GetValue(object defaultValue, Type type)
		{
			if (defaultValue == null) return null;
			if (type.IsInstanceOfType(defaultValue)) return defaultValue;

			var underlyingType = Nullable.GetUnderlyingType(type) ?? type;
			if (underlyingType.IsEnum) return Enum.Parse(underlyingType, defaultValue.ToString()!, true);

			try { return Convert.ChangeType(defaultValue, underlyingType); }
			catch { return defaultValue; } // Maneja conversiones inválidas devolviendo el valor por defecto
		}


		public static object? GetJsonValue(object defaultValue, Type type)
		{
			if (defaultValue is string literal && !string.IsNullOrEmpty(literal))
			{
				try { return JsonConvert.DeserializeObject(literal, type); }
				catch (Exception ex) {
					Console.WriteLine(defaultValue);
					Console.WriteLine(ex.Message);	
				}
			}
			return null;
		}


		public static bool JsonCompare(object obj, object another)
		{
			if (ReferenceEquals(obj, another)) return true;
			if (obj == null || another == null) return false;

			var objJson = JsonConvert.SerializeObject(obj, Formatting.None, new JsonSerializerSettings
			{
				ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
				NullValueHandling = NullValueHandling.Ignore,
			});

			var anotherJson = JsonConvert.SerializeObject(another, Formatting.None, new JsonSerializerSettings
			{
				ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
				NullValueHandling = NullValueHandling.Ignore,
			});

			return objJson == anotherJson;
		}

		public static List<T> ConvertDataTable<T>(DataTable dt, object Inst)
		{
			return dt.AsEnumerable()
					 .Select(row => ConvertRow<T>(Inst, row))
					 .ToList();
		}

		public static T ConvertRow<T>(object Inst, DataRow dr)
		{

			var obj = Activator.CreateInstance<T>();
			var instanceType = Inst.GetType();
			var properties = instanceType.GetProperties(BindingFlags.Public | BindingFlags.Instance);

			foreach (var column in dr.Table.Columns.Cast<DataColumn>())
			{
				string columnName = column.ColumnName.ToLower();
				object? columnValue = dr[column.ColumnName];

				if (string.IsNullOrEmpty(columnValue?.ToString()))
					continue;

				var property = properties.FirstOrDefault(p => p.Name.Equals(columnName, StringComparison.OrdinalIgnoreCase));

				if (property == null)
					continue;

				var jsonProp = property.GetCustomAttribute<JsonProp>();
				var oneToOne = property.GetCustomAttribute<OneToOne>();
				var manyToOne = property.GetCustomAttribute<ManyToOne>();
				var oneToMany = property.GetCustomAttribute<OneToMany>();
				object? value = (jsonProp != null || oneToOne != null || manyToOne != null || oneToMany != null)
						? GetJsonValue(columnValue, property.PropertyType)
						: GetValue(columnValue, property.PropertyType);
				try
				{
					property.SetValue(obj, value);
				}
				catch (System.Exception ex)
				{
					throw;
				}
			}

			return obj;
		}
		/// <summary>
		/// Copia los valores de las propiedades con el mismo nombre y tipo en dos objetos.
		/// </summary>
		/// <param name="source">El objeto que contiene los valores a copiar.</param>
		/// <param name="target">El objeto que recibira los valores copiados.</param>
		/// <remarks>
		/// Las propiedades se buscan por nombre y tipo, por lo que la copia es case-insensitive.
		/// Solo se copian las propiedades que tengan un setter y getter publicos.
		/// </remarks>
		public static void SetMatchingProperties(object source, object target)
		{
			if (source == null) throw new ArgumentNullException(nameof(source));
			if (target == null) throw new ArgumentNullException(nameof(target));

			// Obtenemos las propiedades del objeto fuente y del objeto destino
			var sourceProperties = source.GetType().GetProperties();
			var targetProperties = target.GetType().GetProperties();

			foreach (var targetProp in targetProperties)
			{
				// Buscamos si hay una propiedad en "source" con el mismo nombre y tipo que la propiedad de "target"
				var matchingProp = Array.Find(sourceProperties, p =>
					p.Name == targetProp.Name && p.PropertyType == targetProp.PropertyType);

				// Si encontramos una propiedad coincidente y es asignable, copiamos el valor
				if (matchingProp != null && matchingProp.CanRead && targetProp.CanWrite)
				{
					var value = matchingProp.GetValue(source);
					targetProp.SetValue(target, value);
				}
			}
		}
	}
}
