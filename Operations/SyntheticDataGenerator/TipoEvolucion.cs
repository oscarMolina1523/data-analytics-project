using APPCORE;

namespace Operations.DataGenerator
{
    public class TipoEvolucion:EntityClass
    {
        public int? IdEvolucion { get; set; }
        public string? TipoEvolucionStr { get; set; }
        public decimal? ValorImpacto { get; set; }
    }
}