namespace APPCORE;

public abstract class ViewClass : TransactionalClass
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
}
