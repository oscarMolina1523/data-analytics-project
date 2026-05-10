namespace APPCORE;

public abstract class StoreProcedureClass : TransactionalClass
{
	public List<Object>? Parameters { get; set; }
	public ResponseService Execute()
	{
		var DataProcedure = MDataMapper?.GDatos.ExecuteProcedure(this, Parameters);
		return new ResponseService
		{
			message = "Procedimiento ejecutado correctamente"
		};
	}
	public List<T> Get<T>()
	{
		var DataProcedure = MDataMapper?.TakeListWithProcedure<T>(this, Parameters);
		return DataProcedure?.ToList() ?? new List<T>();
	}
}
