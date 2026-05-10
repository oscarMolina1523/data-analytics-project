using System.Data;
using MySql.Data.MySqlClient;

namespace APPCORE.MySqlImplementations
{
    public class MySqlGDatos : GDatosAbstract
    {
        public MySqlGDatos(string ConexionString)
        {
            this.ConexionString = ConexionString;
        }
        
        // Ejecuta un procedimiento almacenado en la base de datos.
        public override object ExecuteProcedure(StoreProcedureClass Inst, List<object> Params)
        {
            IDbCommand? Command = buildProcedureCommand(Inst, Params);
            Command?.Connection?.Open();
            Command?.ExecuteNonQuery();
            Command?.Connection?.Close();
            return true;
        }

        // Ejecuta un procedimiento almacenado y devuelve los resultados en un DataTable.
        public override DataTable ExecuteProcedureWithSQL(StoreProcedureClass Inst, List<object> Params)
        {
            IDbCommand? Command = buildProcedureCommand(Inst, Params);
            DataTable Table = TraerDatosSQL(Command);
            return Table;
        }

        // Crea un objeto IDbCommand para ejecutar una consulta SQL.
        protected override IDbCommand ComandoSql(string comandoSql, IDbConnection Conexion)
        {
            var com = new MySqlCommand(comandoSql, (MySqlConnection)Conexion);
            return com;
        }

        // Crea una nueva conexión a la base de datos.
        public override IDbConnection CrearConexion(string ConexionString)
        {
            return new MySqlConnection(ConexionString);
        }

        // Crea un objeto IDataAdapter para llenar un DataSet con los resultados de una consulta SQL.
        protected override IDataAdapter CrearDataAdapterSql(string comandoSql, IDbConnection Conexion)
        {
            var da = new MySqlDataAdapter((MySqlCommand)ComandoSql(comandoSql, Conexion));
            return da;
        }

        // Crea un objeto IDataAdapter a partir de un IDbCommand.
        protected override IDataAdapter CrearDataAdapterSql(IDbCommand comandoSql)
        {
            var da = new MySqlDataAdapter((MySqlCommand)comandoSql);
            return da;
        }

        // Crea un objeto IDbCommand para ejecutar un procedimiento almacenado en la base de datos.
        private IDbCommand? buildProcedureCommand(StoreProcedureClass Inst, List<object> Params)
        {
            var conec = CrearConexion(ConexionString);
            var Command = ComandoSql(Inst.GetType().Name, conec);
            Command.CommandType = CommandType.StoredProcedure;
            conec.Open();
            MySqlCommandBuilder.DeriveParameters((MySqlCommand)Command);
            conec.Close();
            if (Params?.Count != 0)
            {
                int i = 0;
                foreach (var param in Params ?? new List<object>())
                {
                    if (Command != null)
                    {
                        MySqlParameter? p = (MySqlParameter?)Command.Parameters[i + 1];
                        if (p != null)
                            p.Value = param;
                    }
                    i++;
                }
            }

            return Command;
        }      
    }
}
