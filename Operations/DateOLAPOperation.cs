namespace Operations
{
    public class DateOLAPOperation
    {        
        
        public static void UpdateLastUpdateDate(DateTime beginTime)
        {
            /*IMPLEMENTAR LOGICA PARA ACTUALIZAR LA FECHA*/
            //throw new NotImplementedException();
        }

        public static DateTime GetLastUpdatedate()
        {
            /*IMPORTANTE LA FECHA DE ACTUALIZACION DEBE ESTAR CARGADA DE LA BD 
            O DE ALGUYN ARCHIVO DE CONFIGURACION PERISTENTE */
            return DateTime.Parse("2025-05-01");
        }
    }
}