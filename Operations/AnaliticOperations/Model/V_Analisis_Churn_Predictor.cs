using APPCORE;

//Hipotesis H3
//La inactividad prolongada predice abandono.

namespace Operations.AnaliticOperations.Model
{
    public class V_Analisis_Churn_Predictor : EntityClass
    {
        [PrimaryKey(Identity = false)]
        public long? Id_Adherencia { get; set; }

        public int? Id_Usuario { get; set; }

        // Usuario
        public string? Tipo_Suscripcion { get; set; }

        // Variables H3
        public int? Dias_Inactividad_Consecutiva { get; set; }

        public bool? Flag_Abandono_Confirmado { get; set; }

        public int? Lag_Periodo { get; set; }

        // Variables derivadas
        public string? Nivel_Riesgo { get; set; }

        public decimal? Probabilidad_Churn { get; set; }

        // Tiempo
        public int? Anio { get; set; }
        public int? Mes { get; set; }
        public string? Nombre_Mes { get; set; }
        public DateTime? Fecha { get; set; }
    }
}