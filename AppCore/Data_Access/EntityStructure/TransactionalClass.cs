using System.Data;
using APPCORE.BDCore;
using APPCORE.BDCore.Abstracts;

namespace APPCORE;

public abstract class TransactionalClass
{
	private IDbTransaction? Transaction;
	private IDbConnection? SqlConection;
	private WDataMapper? Conection;
	protected WDataMapper? MDataMapper
	{
		get
		{
			if (this.Conection != null)
				return this.Conection;
			else
				return Connections.Default;
		}
		set { Conection = value; }
	}
	internal WDataMapper? GetConnection()
	{
		return MDataMapper;
	}
	public void SetConnection(WDataMapper? wDataMapper)
	{
		MDataMapper = wDataMapper;
	}

	//TRANSACCIONES
	public void BeginGlobalTransaction()
	{
		MDataMapper?.GDatos.BeginGlobalTransaction();
	}
	public void CommitGlobalTransaction()
	{
		MDataMapper?.GDatos.CommitGlobalTransaction();
	}
	public void RollBackGlobalTransaction()
	{
		MDataMapper?.GDatos.RollBackGlobalTransaction();
	}
	

	internal IDbTransaction? GetTransaction()
	{
		return this.Transaction;
	}

	internal IDbConnection? GetSqlConnection()
	{
		return SqlConection;
	}
	

	internal void SetTransaction(IDbTransaction? transaction)
	{
		Transaction = transaction;
	}

	internal void SetSqlConnection(IDbConnection? connection)
	{
		SqlConection = connection;
	}
	public object? ExecuteSqlQuery(string query)
	{
		return MDataMapper?.GDatos.ExcuteSqlQueryWithOutScalar(query, GetSqlConnection(), GetTransaction());
	}
}
