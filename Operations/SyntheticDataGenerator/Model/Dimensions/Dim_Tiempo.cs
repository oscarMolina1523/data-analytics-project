using APPCORE;

namespace Operations.DataGenerator.Entities.Dimensions.Dimensions
{
    public class Dim_Tiempo : EntityClass
    {
        [PrimaryKey]
        public int? Id_Tiempo { get; set; }

        public DateTime? Fecha { get; set; }

        public int? Dia { get; set; }

        public int? Mes { get; set; }

        public string? Nombre_Mes { get; set; }

        public int? Trimestre { get; set; }

        public int? Anio { get; set; }

        public int? Semana_Anio { get; set; }
    }
}