using APPCORE;

namespace Operations.DataGenerator.Entities.Dimensions.Dimensions
{
    public class Dim_Actividad : EntityClass
    {
        [PrimaryKey]
        public int? Id_Actividad { get; set; }

        public string? Tipo_Actividad { get; set; }

        public string? Categoria { get; set; }
    }
}