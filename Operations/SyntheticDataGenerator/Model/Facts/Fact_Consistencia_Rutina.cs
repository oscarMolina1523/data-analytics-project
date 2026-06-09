using APPCORE;

namespace Operations.DataGenerator.Entities.Facts
{
    public class Fact_Consistencia_Rutina : EntityClass
    {
        [PrimaryKey]
        public long? Id_Consistencia { get; set; }

        public int? Id_Usuario { get; set; }

        public int? Id_Tiempo { get; set; }

        public int? Sesiones_Programadas { get; set; }

        public int? Sesiones_Completadas { get; set; }

        public decimal? Cumplimiento_Pct { get; set; }

        public decimal? Variacion_Metrica_Semanal { get; set; }
    }
}