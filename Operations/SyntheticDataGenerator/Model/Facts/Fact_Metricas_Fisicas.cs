using APPCORE;

namespace Operations.DataGenerator.Entities.Facts
{
    public class Fact_Metricas_Fisicas : EntityClass
    {
        [PrimaryKey]
        public long? Id_Registro_Metrica { get; set; }

        public int? Id_Usuario { get; set; }

        public int? Id_Tiempo { get; set; }

        public int? Id_Actividad { get; set; }

        public int? Frecuencia_Semanal_Real { get; set; }

        public decimal? Peso_Inicial { get; set; }

        public decimal? Peso_Actual { get; set; }

        public decimal? IMC_Inicial { get; set; }

        public decimal? IMC_Actual { get; set; }

        public decimal? Masa_Muscular_Inicial { get; set; }

        public decimal? Masa_Muscular_Actual { get; set; }
    }
}