using System.Collections;
using System.Data;
using System.Reflection;
using APPCORE.BDCore.Abstracts;

namespace APPCORE;
// Clase abstracta base para todas las entidades del sistema
//TODO CRUZAR LA APRTURA Y CIERRE DE TRANSACCIONES Y CONEXIONES A DTAMAPER 
public abstract class EntityClass : TransactionalClass
{
	private List<FilterData>? filters;
	// Lista de filtros de datos que pueden aplicarse a las consultas de la entidad
	public List<FilterData>? filterData
	{
		get
		{
			if (filters == null)
			{
				filters = [];
			}
			return filters;
		}
		set
		{
			filters = value;
		}
	}

	public List<OrdeData>? orderData { get; set; }

	// Método para obtener una lista de entidades que cumplen cierta condición
	public List<T> Get<T>(string condition = "")
	{
		using (var conn = MDataMapper?.GDatos.CrearConexion(MDataMapper?.GDatos?.ConexionString ?? ""))
		{
			conn?.Open();
			this.SetSqlConnection(conn);
			// Llama al método TakeList de MDataMapper para obtener datos
			var Data = MDataMapper?.TakeList<T>(this, condition);
			// Retorna los datos obtenidos o una lista vacía si es nulo
			return Data?.ToList() ?? new List<T>();
		}
	}


	// Método para filtrar una lista de entidades según una o más condiciones
	public List<T> Where<T>(params FilterData[] where_condition)
	{
		// Verifica si alguna condición de filtro tiene valores nulos o vacíos
		if (IsValidFilter(where_condition))
		{
			// Retorna una lista vacía si alguna condición no está definida correctamente
			return new List<T>();
		}

		// Si no hay problemas con las condiciones, se agregan al filtro de datos de la entidad
		if (filterData == null)
			filterData = new List<FilterData>();

		filterData.AddRange(where_condition.ToList());
		using (var conn = MDataMapper?.GDatos.CrearConexion(MDataMapper?.GDatos?.ConexionString ?? ""))
		{
			conn?.Open();
			this.SetSqlConnection(conn);

			// Se obtienen los datos utilizando el filtro actualizado
			var Data = MDataMapper?.TakeList<T>(this);
			// Retorna los datos obtenidos o una lista vacía si es nulo
			return Data ?? new List<T>();
		}
	}
	// Método para encontrar una entidad que cumpla ciertas condiciones
	public T? Find<T>(params FilterData[]? where_condition)
	{
		using (var conn = MDataMapper?.GDatos.CrearConexion(MDataMapper?.GDatos?.ConexionString ?? ""))
		{
			conn?.Open();
			this.SetSqlConnection(conn);
			// Establece los filtros de datos de la entidad
			if (filterData!.Count == 0)
			{
				filterData = where_condition?.ToList();
			}
			else
			{
				filterData.AddRange(where_condition?.ToList() ?? []);
			}
			// Intenta obtener la entidad utilizando los filtros establecidos
			var Data = MDataMapper != null ? MDataMapper.TakeObject<T>(this) : default(T);
			// Retorna la entidad encontrada o null si no se encuentra
			return Data;
		}
	}
	// Método para encontrar una entidad que cumpla ciertas condiciones
	public T? SimpleFind<T>(params FilterData[]? where_condition)
	{
		using (var conn = MDataMapper?.GDatos.CrearConexion(MDataMapper?.GDatos?.ConexionString ?? ""))
		{
			conn?.Open();
			//var transaction = conn.BeginTransaction();
			this.SetSqlConnection(conn);
			//this.SetTransaction(transaction);
			// Establece los filtros de datos de la entidad
			filterData = where_condition?.ToList();
			// Intenta obtener la entidad utilizando los filtros establecidos
			var Data = MDataMapper != null ? MDataMapper.TakeObject<T>(this, "", true) : default(T);
			// Retorna la entidad encontrada o null si no se encuentra
			return Data;
		}
	}

	public Boolean Exists()
	{
		using (var conn = MDataMapper?.GDatos.CrearConexion(MDataMapper?.GDatos?.ConexionString ?? ""))
		{
			conn?.Open();
			//var transaction = conn.BeginTransaction();
			this.SetSqlConnection(conn);
			//this.SetTransaction(transaction);

			Type entityType = this.GetType();
			PropertyInfo[] lst = this.GetType().GetProperties();
			// Filtra las propiedades que son claves primarias y tienen valores no nulos
			var pkProperties = lst.Where(p => (PrimaryKey?)Attribute.GetCustomAttribute(p, typeof(PrimaryKey)) != null).ToList();
			var values = pkProperties.Where(p => p.GetValue(this) != null).ToList();
			// Si el número de propiedades de clave primaria coincide con las que tienen valores, realiza la actualización
			if (pkProperties.Count == values.Count)
			{				
				// Obtener el método TakeList y llamarlo con la nueva instancia
				var method = typeof(WDataMapper).GetMethod("TakeList")?.MakeGenericMethod(entityType);
				var data = method?.Invoke(MDataMapper, [this, "", true]) as IList;
				// Retornar verdadero si se encuentran datos, falso si no se encuentran
				return data?.Count > 0;
			}
			return false;
			// Retorna true si se encuentran datos, false si no se encuentran
			//return Data?.Count > 0;
		}
	}

	// Método para obtener una lista de entidades sin aplicar transacción
	public List<T> SimpleGet<T>()
	{
		using (var conn = MDataMapper?.GDatos.CrearConexion(MDataMapper?.GDatos?.ConexionString ?? ""))
		{
			conn?.Open();
			//var transaction = conn.BeginTransaction();
			this.SetSqlConnection(conn);
			//this.SetTransaction(transaction);
			// Obtiene los datos sin aplicar transacción
			var Data = MDataMapper?.TakeList<T>(this, "", true);
			// Retorna los datos obtenidos o una lista vacía si es nulo
			return Data ?? new List<T>();
		}
	}

	// Método para guardar una entidad en la base de datos
	public object? Save(bool fullInsert = true)
	{
		using (var conn = MDataMapper?.GDatos.CrearConexion(MDataMapper?.GDatos?.ConexionString ?? ""))
		{
			conn?.Open();
			var transaction = conn?.BeginTransaction();
			SetSqlConnection(conn);
			SetTransaction(transaction);
			try
			{
				var result = MDataMapper?.InsertObject(this, fullInsert);
				transaction?.Commit();
				return result;
			}
			catch (Exception e)
			{
				transaction?.Rollback();
				conn?.Dispose();
				LoggerServices.AddMessageError("ERROR: Save entity", e);
				throw;
			}
		}

	}
	

	// Método para actualizar una entidad en la base de datos
	public ResponseService Update()
	{
		using (var conn = MDataMapper?.GDatos.CrearConexion(MDataMapper?.GDatos?.ConexionString ?? ""))
		{
			conn?.Open();
			var transaction = conn?.BeginTransaction();
			this.SetSqlConnection(conn);
			this.SetTransaction(transaction);
			try
			{
				// Obtiene todas las propiedades de la entidad
				PropertyInfo[] lst = this.GetType().GetProperties();
				// Filtra las propiedades que son claves primarias y tienen valores no nulos
				var pkPropiertys = lst.Where(p => (PrimaryKey?)Attribute.GetCustomAttribute(p, typeof(PrimaryKey)) != null).ToList();
				var values = pkPropiertys.Where(p => p.GetValue(this) != null).ToList();
				// Si el número de propiedades de clave primaria coincide con las que tienen valores, realiza la actualización
				if (pkPropiertys.Count == values.Count)
				{
					// Llama al método Update sobrecarg ado con los nombres de las propiedades de clave primaria
					this.Update(pkPropiertys.Select(p => p.Name).ToArray());
					transaction?.Commit();
					// Retorna un mensaje de éxito						
					return new ResponseService() { status = 200, message = this.GetType().Name + " actualizado correctamente" };
				}
				// Si no se encuentran todas las propiedades de clave primaria con valores, retorna un mensaje de error
				else
					return new ResponseService() { status = 500, message = "Error al actualizar: no se encuentra el registro " + this.GetType().Name };
			}
			catch (Exception e)
			{
				transaction?.Rollback();
				// Registra cualquier error que ocurra durante la actualización
				LoggerServices.AddMessageError("ERROR: Update entity", e);
				conn?.Dispose();
				return new ResponseService()
				{
					status = 500,
					message = "Error al actualizar: " + e.Message
				};
			}
		}
	}
	// Método para actualizar una entidad en la base de datos utilizando el identificador proporcionado
	public bool Update(string Id)
	{
		using (var conn = MDataMapper?.GDatos.CrearConexion(MDataMapper?.GDatos?.ConexionString ?? ""))
		{
			conn?.Open();
			var transaction = conn?.BeginTransaction();
			this.SetSqlConnection(conn);
			this.SetTransaction(transaction);
			try
			{
				// Actualiza la entidad en la base de datos utilizando el identificador proporcionado
				MDataMapper?.UpdateObject(this, Id);
				transaction?.Commit();
				// Retorna verdadero para indicar que la operación fue exitosa
				return true;
			}
			catch (Exception e)
			{
				transaction?.Rollback();
				// Registra cualquier error que ocurra durante la actualización
				LoggerServices.AddMessageError("ERROR: Update entity", e);
				conn?.Dispose();
				return false;
			}
		}

	}

	// Método para actualizar una entidad en la base de datos utilizando un arreglo de identificadores proporcionado
	public bool Update(string[] Id)
	{
		try
		{
			// Inicia una transacción
			//MDataMapper?.GDatos.BeginTransaction();
			// Actualiza la entidad en la base de datos utilizando el arreglo de identificadores proporcionado
			MDataMapper?.UpdateObject(this, Id);
			// Confirma la transacción
			//MDataMapper?.GDatos.CommitTransaction();
			// Retorna verdadero para indicar que la operación fue exitosa
			return true;
		}
		catch (Exception e)
		{
			// Revierte la transacción en caso de error y registra el error
			//MDataMapper?.GDatos.RollBackTransaction();
			LoggerServices.AddMessageError("ERROR: Update entity []ID", e);
			throw;
		}
	}

	// Método para eliminar una entidad de la base de datos
	public bool Delete()
	{
		using var conn = MDataMapper?.GDatos.CrearConexion(MDataMapper?.GDatos?.ConexionString ?? "");
		conn?.Open();
		var transaction = conn?.BeginTransaction();
		this.SetSqlConnection(conn);
		this.SetTransaction(transaction);
		try
		{
			// Elimina la entidad de la base de datos
			MDataMapper?.Delete(this);
			// Confirma la transacción
			transaction?.Commit();
			// Retorna verdadero para indicar que la operación fue exitosa
			return true;
		}
		catch (Exception e)
		{
			transaction?.Rollback();
			LoggerServices.AddMessageError("ERROR: Update entity Delete", e);
			throw;
		}
	}

	public int Count(params FilterData[] where_condition)
	{
		// Verifica si alguna condición de filtro tiene valores nulos o vacíos
		if (IsValidFilter(where_condition))
		{
			// Retorna una lista vacía si alguna condición no está definida correctamente
			return 0;
		}

		// Si no hay problemas con las condiciones, se agregan al filtro de datos de la entidad
		if (filterData == null)
			filterData = new List<FilterData>();

		filterData.AddRange(where_condition.ToList());
		using var conn = MDataMapper?.GDatos.CrearConexion(MDataMapper?.GDatos?.ConexionString ?? "");
		conn?.Open();
		this.SetSqlConnection(conn);
		// Se obtienen los datos utilizando el filtro actualizado
		var Count = MDataMapper?.Count(this);
		// Retorna los datos obtenidos o una lista vacía si es nulo
		return Count ?? 0;
	}

	private static bool IsValidFilter(FilterData[] where_condition)
	{
		return where_condition.Where(c => c.FilterType != "or"
				&& c.FilterType != "and"
				&& c.FilterType != "Not Null"
				&& c.FilterType != "NotNull"
				&& c.FilterType != "IsNull"
				&& c.FilterType != "Is Null"
				&& (c.Values == null || c.Values?.Count == 0)).ToList().Count > 0;
	}

	// Método para describir la estructura de la entidad utilizando un tipo de enumeración de SQL 
	public List<EntityProps> DescribeEntity(SqlEnumType sqlEnumType)
	{
		// Determina la consulta de descripción de entidad según el tipo de SQL
		List<EntityProps>? entityProps = MDataMapper?.DescribeEntity(this);
		// Si no se encuentra ninguna descripción, lanza una excepción
		if (entityProps?.Count == 0)
		{
			throw new Exception("La entidad buscada no existe: " + this.GetType().Name);
		}
		// Retorna la lista de propiedades de entidad obtenidas
		return entityProps ?? [];
	}

	public ResponseService SetPropertyNull(params string[] properties)
	{
		using var conn = MDataMapper?.GDatos.CrearConexion(MDataMapper?.GDatos?.ConexionString ?? "");
		conn?.Open();
		var transaction = conn?.BeginTransaction();
		this.SetSqlConnection(conn);
		this.SetTransaction(transaction);
		try
		{
			// Obtiene todas las propiedades de la entidad
			PropertyInfo[] lst = this.GetType().GetProperties();
			// Filtra las propiedades que son claves primarias y tienen valores no nulos
			var pkPropiertys = lst.Where(p => (PrimaryKey?)Attribute.GetCustomAttribute(p, typeof(PrimaryKey)) != null).ToList();
			var values = pkPropiertys.Where(p => p.GetValue(this) != null).ToList();
			// Si el número de propiedades de clave primaria coincide con las que tienen valores, realiza la actualización
			if (pkPropiertys.Count == values.Count)
			{
				// Llama al método Update sobrecarg ado con los nombres de las propiedades de clave primaria
				MDataMapper?.SetPropertyNull(this, properties);
				transaction?.Commit();
				// Retorna un mensaje de éxito						
				return new ResponseService() { status = 200, message = this.GetType().Name + " actualizado correctamente" };
			}
			// Si no se encuentran todas las propiedades de clave primaria con valores, retorna un mensaje de error
			else
				return new ResponseService() { status = 500, message = "Error al actualizar: no se encuentra el registro " + this.GetType().Name };
		}
		catch (Exception e)
		{
			transaction?.Rollback();
			// Registra cualquier error que ocurra durante la actualización
			LoggerServices.AddMessageError("ERROR: Update entity", e);
			return new ResponseService()
			{
				status = 500,
				message = "Error al actualizar: " + e.Message
			};
		}
	}

}
