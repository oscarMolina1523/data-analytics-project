using System.Data;
using System.Transactions;
using APPCORE.BDCore.Abstracts;
using APPCORE.BDCore.MySqlImplementations;
using APPCORE.BDCore.PostgresImplementations;
using APPCORE.BDCore.SQLServerImplementations;

namespace APPCORE
{
	public abstract class GDatosAbstract
	{
		public string? Database { get; set; }
		/**
		Esta propiedad abstracta define una conexión a la base de datos. La clase derivada debe implementar esta propiedad para proporcionar una instancia de IDbConnection (por ejemplo, SqlConnection para SQL Server o MySqlConnection para MySQL).
		*/
		/**
		 * Propiedad que devuelve la conexión a la base de datos.
		 * Si existe una conexión previa (MTConnection), la devuelve; de lo contrario, crea una nueva conexión.
		 */
		protected IDbConnection SQLMCon
		{
			get
			{
				if (this.MTConnection != null && this.MTConnection.ConnectionString?.Length > 0)
				{
					return this.MTConnection;
				}
				this.MTConnection = CrearConexion(ConexionString ?? "");
				return this.MTConnection;
			}
		}
		/**
		Esta variable almacena la cadena de conexión a la base de datos. Debe ser inicializada por la clase derivada antes de usarla para establecer la conexión.
		*/
		public string? ConexionString;
		/**
		Esta variable representa una transacción de base de datos. Puede ser nula si no se está utilizando una transacción.
		*/
		protected TransactionScope? MTransaccion;
		/**
		Esta variable indica si se está utilizando una transacción global (que abarca múltiples operaciones) o no.
		*/
		protected bool globalTransaction;
		/**
		Esta variable representa otra conexión de base de datos. Al igual que MTransaccion, puede ser nula si no se está utilizando.
		*/
		protected IDbConnection? MTConnection;
		/**
		Este método abstracto debe ser implementado por las clases derivadas para crear y devolver una instancia de IDbConnection utilizando la cadena de conexión proporcionada.
		*/
		public abstract IDbConnection CrearConexion(string cadena);
		/**
		Este método abstracto crea un objeto IDbCommand (por ejemplo, SqlCommand o MySqlCommand) para ejecutar una consulta SQL en la base de datos.
		*/
		protected abstract IDbCommand ComandoSql(string comandoSql, IDbConnection connection);
		/*
		Este método abstracto crea un objeto IDataAdapter (por ejemplo, SqlDataAdapter o MySqlDataAdapter) para llenar un DataSet con los resultados de una consulta SQL.		
		*/
		protected abstract IDataAdapter CrearDataAdapterSql(string comandoSql, IDbConnection connection);
		/*
		Similar al método anterior, pero crea un IDataAdapter a partir de un objeto IDbCommand.
		*/
		protected abstract IDataAdapter CrearDataAdapterSql(IDbCommand comandoSql);
		/*
		Este método abstracto ejecuta un procedimiento almacenado o función en la base de datos y devuelve un objeto como resultado.
		*/
		public abstract object ExecuteProcedure(StoreProcedureClass Inst, List<object> Params);
		/*
		Similar al método anterior, pero devuelve un DataTable con los resultados.
		*/
		public abstract DataTable ExecuteProcedureWithSQL(StoreProcedureClass Inst, List<object> Params);

		public List<EntityProps>? EntityDescription { get; set; }

		public SqlEnumType GetSqlType { get; set; }
		
		public void BeginGlobalTransaction()
		{
			if (this.GetSqlType == SqlEnumType.MYSQL)
			{
				return;
			}
			if (this.globalTransaction) { 
				throw new InvalidOperationException("No se puede iniciar una segunda global transaction sin antes haber finalizado la anterior");				
			}
			MTransaccion = new TransactionScope();
			this.globalTransaction = true;

		}
		public void CommitGlobalTransaction()
		{
			if (this.GetSqlType == SqlEnumType.MYSQL)
			{
				return;
			}
			if (this.MTransaccion != null)
			{
				try
				{
					MTransaccion.Complete();
				}
				catch (Exception ex)
				{
					// Manejar el caso donde la transacción ya no sea válida o haya fallado
					LoggerServices.AddMessageError("Error committing transaction", ex);
					throw;
				}
				finally
				{
					MTransaccion.Dispose();
					this.globalTransaction = false;		
				}
			}
		}
		public void RollBackGlobalTransaction()
		{
			if (this.GetSqlType == SqlEnumType.MYSQL)
			{
				return;
			}
			if (this.MTransaccion != null)
			{

				this.MTransaccion = null; 
				this.globalTransaction = false;
			}
		}
		#region ADO.NET METHODS
		/**
		* Método para probar la conexión a la base de datos.
		* Devuelve verdadero si la conexión es exitosa, de lo contrario, lanza una excepción.
		*/
		public bool TestConnection()
		{
			try
			{

				using (SQLMCon)
				{
					SQLMCon.Open();
					string DescribeEntityQuery = GetSqlType switch
					{
						SqlEnumType.SQL_SERVER => SQLServerEntityQuerys.DescribeEntitys,
						SqlEnumType.POSTGRES_SQL => PostgreEntityQuerys.DescribeEntitys,
						SqlEnumType.MYSQL => MySqlEntityQuerys.DescribeEntityQuery.Replace("entityDatabase", Database),
						_ => ""
					};
					this.EntityDescription = AdapterUtil.ConvertDataTable<EntityProps>(
						TraerDatosSQL(DescribeEntityQuery, SQLMCon, null, null),
						new EntityProps());
				}
				return true;
			}
			catch (Exception ex)
			{
				LoggerServices.AddMessageError("error conectando a bd", ex);
				throw;
			}
		}

		/**
		* Método para ejecutar una consulta SQL en la base de datos.
		* Devuelve el resultado de la consulta o lanza una excepción en caso de error.
		* @param strQuery Consulta SQL a ejecutar.
		* @param parameters Lista de parámetros (opcional) para la consulta.
		* @return El resultado de la consulta o verdadero si no hay resultados.
		*/
		public object? ExcuteSqlQuery(string strQuery, IDbConnection dbConnection, IDbTransaction? dbTransaction, List<IDbDataParameter>? parameters = null)
		{
			/*try
			{*/
			return ExecuteWithRetry(() =>
			{
				using (var command = ComandoSql(strQuery, dbConnection))
				{
					command.Transaction = dbTransaction;
					SetParametersInCommand(parameters, command);
					var scalar = command.ExecuteScalar();
					if (scalar == DBNull.Value)
					{
						return true;
					}
					else
					{
						return Convert.ToInt32(scalar);
					}
				}
			});
		}

		public object? ExcuteSqlQueryWithOutScalar(string strQuery, IDbConnection dbConnection, IDbTransaction? dbTransaction, List<IDbDataParameter>? parameters = null)
		{
			try
			{
				using (var command = ComandoSql(strQuery, dbConnection))
				{
					command.Transaction = dbTransaction;
					SetParametersInCommand(parameters, command);
					var scalar = command.ExecuteNonQuery();
					return true;
				}
			}
			catch (System.Exception)
			{
				ReStartData();
				return false;
			}
		}

		private void SetParametersInCommand(List<IDbDataParameter>? parameters, IDbCommand command)
		{
			if (parameters != null)
			{
				foreach (var param in parameters)
				{
					command.Parameters.Add(CloneParameter(param));
				}
			}
		}

		private IDbDataParameter? CloneParameter(IDbDataParameter originalParam)
		{
			IDbDataParameter? newParam = (IDbDataParameter?)Activator.CreateInstance(originalParam.GetType());
			foreach (var prop in originalParam.GetType().GetProperties())
			{
				if (prop.CanWrite)
				{
					prop.SetValue(newParam, prop.GetValue(originalParam));
				}
			}
			return newParam;
		}
		// Otros métodos y propiedades existentes

		protected object ExecuteWithRetry(Func<object> operation, int maxRetries = 0)
		{
			int retries = 0;
			while (true)
			{
				try
				{
					return operation();
				}
				catch (Exception ex)
				{
					if (retries >= maxRetries)
					{
						// Log the error and rethrow the exception
						LoggerServices.AddMessageError("ERROR: Max retries reached. Operation failed.", ex);
						this.ReStartData(ex);
						throw;
					}
					// Log the retry attempt
					retries++;
					Console.WriteLine($"read retry query => {retries}");
					// Optionally, add a delay before retrying
					Task.Delay(100).Wait();
					//this.ReStartData(ex);
				}
			}
		}

		/**
		 * Reinicia los datos de conexión y transacción en caso de excepción.
		 * @param ex Excepción que provocó la reinicialización.
		 */
		public void ReStartData(Exception ex)
		{
			ReStartData();
			LoggerServices.AddMessageError("Transaction failed and connection restarted.", ex);
		}
		public void ReStartData()
		{
			globalTransaction = false;
			this.MTConnection = null;
			this.MTransaccion = null;
		}

		/**
		 * Ejecuta una consulta SQL y devuelve los resultados en un DataTable.
		 * @param queryString Consulta SQL a ejecutar.
		 * @return DataTable con los resultados de la consulta.
		 */
		public DataTable TraerDatosSQL(string queryString, IDbConnection dbConnection, IDbTransaction? dbTransaction, List<IDbDataParameter>? parameters = null)
		{
			return (DataTable)ExecuteWithRetry(() =>
			{
				DataSet ObjDS = new DataSet();
				DataTable resultTable = new DataTable();
				using (var command = ComandoSql(queryString, dbConnection))
				{
					command.Transaction = dbTransaction;
					SetParametersInCommand(parameters, command);
					using (var reader = command.ExecuteReader())
					{
						resultTable.Load(reader);
					}
					return resultTable;
				}
			});
		}

		/**
		* Ejecuta una consulta SQL y devuelve los resultados en un DataTable.
		* @param Command Comando SQL a ejecutar.
		* @return DataTable con los resultados de la consulta.
		*/
		public DataTable TraerDatosSQL(IDbCommand Command)
		{
			return (DataTable)ExecuteWithRetry(() =>
			{
				DataSet ObjDS = new DataSet();
				CrearDataAdapterSql(Command).Fill(ObjDS);
				return ObjDS.Tables[0].Copy();
			});
		}
		/**
		* Ejecuta una consulta SQL y devuelve los resultados en un DataTable.
		* @param Command Comando SQL a ejecutar.
		* @return DataTable con los resultados de la consulta.
		*/
		public DataTable TraerDatosSQL(string queryString)
		{
			return (DataTable)ExecuteWithRetry(() =>
			{
				DataSet ObjDS = new DataSet();
				CrearDataAdapterSql(ComandoSql(queryString, CrearConexion(ConexionString ?? ""))).Fill(ObjDS);
				return ObjDS.Tables[0].Copy();
			});
		}
		#endregion
	}

}
