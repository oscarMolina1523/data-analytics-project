using APPCORE;

//Hipotesis H4
//Premium reduce inconsistencia.

namespace Operations.AnaliticOperations.Model
{
    public class V_Analisis_Consistencia_Premium : EntityClass
    {
        [PrimaryKey(Identity = false)]
        public long? Id_Consistencia { get; set; }

        public int? Id_Usuario { get; set; }

        // Usuario
        public string? Tipo_Suscripcion { get; set; }
        public string? Objetivo_Salud { get; set; }

        // Variables H4
        public int? Sesiones_Programadas { get; set; }
        public int? Sesiones_Completadas { get; set; }

        public decimal? Cumplimiento_Pct { get; set; }

        public decimal? Variacion_Metrica_Semanal { get; set; }

        // Variable derivada
        public string? Nivel_Consistencia { get; set; }

        // Tiempo
        public int? Anio { get; set; }
        public int? Mes { get; set; }
        public string? Nombre_Mes { get; set; }
        public DateTime? Fecha { get; set; }
    }
}