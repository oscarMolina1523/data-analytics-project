using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using APPCORE;
using BusinessLogic.Connection;

namespace Operations.Time
{
    public class TimeDIM : EntityClass
    {
    
        public TimeDIM()
        {
            this.MDataMapper = new BDConnection().BDDestino;
        }
        [PrimaryKey(Identity = false)]
        public int? FechaKey { get; set; }
        public DateTime? Fecha { get; set; }
        public int? Anio { get; set; }
        public int? Mes { get; set; }
        public string? NombreMes { get; set; }
        public int? Trimestre { get; set; }
        public string? NombreTrimestre { get; set; }
        public int? Bimestre { get; set; }
        public string? NombreBimestre { get; set; }
        public int? Cuatrimestre { get; set; }
        public string? NombreCuatrimestre { get; set; }
        public int? SemanaAnio { get; set; }
        public string? NombreDia { get; set; }
        public int? DiaMes { get; set; }
        public int? DiaAnio { get; set; }
        public bool? EsFinDeSemana { get; set; }
    }
}