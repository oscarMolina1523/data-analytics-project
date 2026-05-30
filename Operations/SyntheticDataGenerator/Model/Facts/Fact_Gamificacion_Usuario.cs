using APPCORE;

namespace Operations.DataGenerator.Entities.Facts
{
    public class Fact_Gamificacion_Usuario : EntityClass
    {
        [PrimaryKey]
        public long? Id_Gamificacion { get; set; }

        public int? Id_Usuario { get; set; }

        public int? Id_Tiempo { get; set; }

        public int? Score_Gamificacion_Mensual { get; set; }

        public int? Retos_Completados { get; set; }

        public int? Retos_Totales_Asignados { get; set; }

        public int? Puntos_Ganados { get; set; }

        public bool? Flag_Renovacion_Suscripcion { get; set; }
    }
}