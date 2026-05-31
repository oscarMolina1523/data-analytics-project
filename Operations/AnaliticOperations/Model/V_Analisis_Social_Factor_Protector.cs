using APPCORE;

//Hipotesis H5
//La interacción social amortigua la percepción de esfuerzo.

namespace Operations.AnaliticOperations.Model
{
    public class V_Analisis_Social_Factor_Protector : EntityClass
    {
        [PrimaryKey(Identity = false)]
        public long? Id_Social_Factor { get; set; }

        public int? Id_Usuario { get; set; }

        // Datos usuario
        public string? Genero { get; set; }

        // Variables H5
        public decimal? Volumen_Carga_Semanal { get; set; }

        public decimal? Densidad_Interaccion_Recibida { get; set; }

        public int? Likes_Recibidos { get; set; }
        public int? Comentarios_Recibidos { get; set; }

        public int? Score_Percepcion_Esfuerzo_Borg { get; set; }

        // Variables derivadas
        public int? Total_Interacciones { get; set; }

        public string? Nivel_Interaccion { get; set; }

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