using APPCORE;

//Hipotesis H1
//Mayor frecuencia de entrenamiento correlaciona con mejor condición física final.
namespace Operations.AnaliticOperations.Model
{
    public class V_Analisis_Frecuencia_Evolucion : EntityClass
    {
        [PrimaryKey(Identity = false)]
        public long? Id_Registro_Metrica { get; set; }

        public int? Id_Usuario { get; set; }
        public int? Id_Actividad { get; set; }

        // Datos usuario
        public string? Genero { get; set; }
        public string? Nivel_Fitness_Inicial { get; set; }
        public string? Tipo_Suscripcion { get; set; }

        // Variables H1
        public int? Frecuencia_Semanal_Real { get; set; }

        public decimal? Peso_Inicial { get; set; }
        public decimal? Peso_Actual { get; set; }

        public decimal? IMC_Inicial { get; set; }
        public decimal? IMC_Actual { get; set; }

        public decimal? Masa_Muscular_Inicial { get; set; }
        public decimal? Masa_Muscular_Actual { get; set; }

        // Variables derivadas
        public decimal? Mejora_Peso_Pct { get; set; }
        public decimal? Mejora_IMC_Pct { get; set; }
        public decimal? Mejora_Masa_Muscular_Pct { get; set; }

        public string? Tipo_Actividad { get; set; }
        public string? Rango_Frecuencia { get; set; }

        // Tiempo
        public int? Anio { get; set; }
        public int? Mes { get; set; }
        public string? Nombre_Mes { get; set; }
        public DateTime? Fecha { get; set; }
    }
}