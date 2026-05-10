using System.Data;
using Npgsql;

namespace APPCORE.PostgresImplementations
{
    public class PostgreGDatos : GDatosAbstract
    {
        public PostgreGDatos(string ConexionString)
        {
            this.ConexionString = ConexionString;
        }       

        /**
         * Ejecuta un procedimiento almacenado en la base de datos.
         * @param Inst Objeto que representa el procedimiento almacenado.
         * @param Params Lista de parámetros para el procedimiento.
         * @return Verdadero si la ejecución es exitosa.
         */
        public override object ExecuteProcedure(StoreProcedureClass Inst, List<object> Params)
        {
            IDbCommand? Command = buildProcedureCommand(Inst, Params);
            Command?.Connection?.Open();
            Command?.ExecuteNonQuery();
            Command?.Connection?.Close();
            return true;
        }

        /**
         * Ejecuta un procedimiento almacenado y devuelve los resultados en un DataTable.
         * @param Inst Objeto que representa el procedimiento almacenado.
         * @param Params Lista de parámetros para el procedimiento.
         * @return DataTable con los resultados del procedimiento.
         */
        public override DataTable ExecuteProcedureWithSQL(StoreProcedureClass Inst, List<object> Params)
        {
            IDbCommand? Command = buildProcedureCommand(Inst, Params);
            DataTable Table = TraerDatosSQL(Command);
            return Table;
        }


        /**
         * Crea un objeto IDbCommand para ejecutar una consulta SQL.
         * @param comandoSql Consulta SQL a ejecutar.
         * @param Conexion Conexión a la base de datos.
         * @return Objeto IDbCommand configurado para la consulta.
         */
        protected override IDbCommand ComandoSql(string comandoSql, IDbConnection Conexion)
        {
            var com = new NpgsqlCommand(comandoSql, (NpgsqlConnection)Conexion);
            return com;
        }

        /**
         * Crea una nueva conexión a la base de datos.
         * @param ConexionString Cadena de conexión.
         * @return Objeto IDbConnection que representa la conexión.
         */
        public override IDbConnection CrearConexion(string ConexionString)
        {
            return new NpgsqlConnection(ConexionString);
        }

        /**
         * Crea un objeto IDataAdapter para llenar un DataSet con los resultados de una consulta SQL.
         * @param comandoSql Consulta SQL a ejecutar.
         * @param Conexion Conexión a la base de datos.
         * @return Objeto IDataAdapter configurado para la consulta.
         */
        protected override IDataAdapter CrearDataAdapterSql(string comandoSql, IDbConnection Conexion)
        {
            var da = new NpgsqlDataAdapter((NpgsqlCommand)ComandoSql(comandoSql, Conexion));
            return da;
        }

        /**
         * Crea un objeto IDataAdapter a partir de un IDbCommand.
         * @param comandoSql Objeto IDbCommand que representa la consulta SQL.
         * @return Objeto IDataAdapter configurado para la consulta.
         */
        protected override IDataAdapter CrearDataAdapterSql(IDbCommand comandoSql)
        {
            var da = new NpgsqlDataAdapter((NpgsqlCommand)comandoSql);
            return da;
        }

        /**
        * Crea un objeto IDbCommand para ejecutar un procedimiento almacenado en la base de datos.
        * @param Inst Objeto que representa el procedimiento almacenado.
        * @param Params Lista de parámetros para el procedimiento.
        * @return Objeto IDbCommand configurado para la ejecución del procedimiento.
        */
        private IDbCommand? buildProcedureCommand(StoreProcedureClass Inst, List<object> Params)
        {
            var conec = CrearConexion(ConexionString);
            var Command = ComandoSql(Inst.GetType().Name, conec);
            Command.CommandType = CommandType.StoredProcedure;
            conec.Open();
            NpgsqlCommandBuilder.DeriveParameters((NpgsqlCommand)Command);
            conec.Close();
            if (Params?.Count != 0)
            {
                int i = 0;
                foreach (var param in Params ?? new List<object>())
                {
                    if (Command != null)
                    {
                        NpgsqlParameter? p = (NpgsqlParameter?)Command.Parameters[i + 1];
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
