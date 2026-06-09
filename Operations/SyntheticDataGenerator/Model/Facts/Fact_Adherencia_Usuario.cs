using APPCORE;

namespace Operations.DataGenerator.Entities.Facts
{
    public class Fact_Adherencia_Usuario : EntityClass
    {
        [PrimaryKey]
        public long? Id_Adherencia { get; set; }

        public int? Id_Usuario { get; set; }

        public int? Id_Tiempo { get; set; }

        public int? Dias_Inactividad_Consecutiva { get; set; }

        public bool? Flag_Abandono_Confirmado { get; set; }

        public int? Lag_Periodo { get; set; }
    }
}