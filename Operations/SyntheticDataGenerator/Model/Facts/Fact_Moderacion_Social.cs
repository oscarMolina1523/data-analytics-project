using APPCORE;

namespace Operations.DataGenerator.Entities.Facts
{
    public class Fact_Moderacion_Social : EntityClass
    {
        [PrimaryKey]
        public long? Id_Social_Factor { get; set; }

        public int? Id_Usuario { get; set; }

        public int? Id_Tiempo { get; set; }

        public int? Likes_Recibidos { get; set; }

        public int? Comentarios_Recibidos { get; set; }

        public decimal? Densidad_Interaccion_Recibida { get; set; }

        public decimal? Volumen_Carga_Semanal { get; set; }

        public int? Score_Percepcion_Esfuerzo_Borg { get; set; }
    }
}