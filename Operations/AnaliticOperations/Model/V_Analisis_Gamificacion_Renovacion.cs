using APPCORE;

//Hipotesis H2
//Cumplimiento de retos predice renovación.

namespace Operations.AnaliticOperations.Model
{
    public class V_Analisis_H2_Gamificacion_Renovacion : EntityClass
    {
        [PrimaryKey(Identity = false)]
        public long? Id_Gamificacion { get; set; }

        public int? Id_Usuario { get; set; }

        // Usuario
        public string? Tipo_Suscripcion { get; set; }
        public int? Antiguedad_Meses { get; set; }

        // Variables H2
        public int? Score_Gamificacion_Mensual { get; set; }

        public int? Retos_Completados { get; set; }
        public int? Retos_Totales_Asignados { get; set; }

        public int? Puntos_Ganados { get; set; }

        public decimal? Pct_Cumplimiento_Retos { get; set; }

        public bool? Flag_Renovacion_Suscripcion { get; set; }

        // Variable derivada
        public string? Nivel_Gamificacion { get; set; }

        // Tiempo
        public int? Anio { get; set; }
        public int? Mes { get; set; }
        public string? Nombre_Mes { get; set; }
        public DateTime? Fecha { get; set; }

        public int? Dia { get; set; }

        public int? Trimestre { get; set; }

        public int? Semana_Anio { get; set; }
    }
}