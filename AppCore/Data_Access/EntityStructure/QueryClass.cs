namespace APPCORE;

public abstract class QueryClass : TransactionalClass
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
	public abstract string GetQuery();
	//public abstract List<T> Get<T>();
	public T? Find<T>()
	{
		var result = Get<T>();
		return result.Count > 0 ? result[0] : default;
	}

	public List<T> Get<T>()
	{
		var dt = this.MDataMapper?.GDatos.TraerDatosSQL(GetQuery());
		if (dt != null && dt.Rows.Count > 0)
		{
			return AdapterUtil.ConvertDataTable<T>(dt, this);
		}
		else
		{
			return [];
		}
	}
}
