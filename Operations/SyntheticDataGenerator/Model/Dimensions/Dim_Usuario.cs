using APPCORE;

namespace Operations.DataGenerator.Entities.Dimensions.Dimensions
{
    public class Dim_Usuario : EntityClass
    {
        [PrimaryKey]
        public int? Id_Usuario { get; set; }

        public string? Codigo_Usuario { get; set; }

        public string? Genero { get; set; }

        public int? Edad { get; set; }

        public string? Nivel_Fitness_Inicial { get; set; }

        public string? Objetivo_Salud { get; set; }

        public string? Tipo_Suscripcion { get; set; }

        public int? Antiguedad_Meses { get; set; }

        public DateTime? Fecha_Registro { get; set; }

        public bool? Activo { get; set; }
    }
}