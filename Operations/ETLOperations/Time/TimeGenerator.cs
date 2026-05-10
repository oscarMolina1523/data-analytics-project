using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace Operations.Time
{
    public class TimeGenerator
    {
        public static List<TimeDIM> Generar(DateTime fechaInicio, DateTime fechaFin)
        {
            var lista = new List<TimeDIM>();
            var fecha = fechaInicio;

            while (fecha <= fechaFin)
            {
                var registro = new TimeDIM
                {
                    FechaKey = int.Parse(fecha.ToString("yyyyMMdd")),
                    Fecha = fecha,
                    Anio = fecha.Year,
                    Mes = fecha.Month,
                    NombreMes = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(fecha.Month),
                    Trimestre = ((fecha.Month - 1) / 3) + 1,
                    NombreTrimestre = $"T{((fecha.Month - 1) / 3) + 1} {fecha.Year}",
                    Bimestre = ((fecha.Month - 1) / 2) + 1,
                    NombreBimestre = $"B{((fecha.Month - 1) / 2) + 1} {fecha.Year}",
                    Cuatrimestre = ((fecha.Month - 1) / 4) + 1,
                    NombreCuatrimestre = $"C{((fecha.Month - 1) / 4) + 1} {fecha.Year}",
                    SemanaAnio = CultureInfo.CurrentCulture.Calendar.GetWeekOfYear(fecha, CalendarWeekRule.FirstDay, DayOfWeek.Monday),
                    NombreDia = fecha.ToString("dddd", new CultureInfo("es-ES")),
                    DiaMes = fecha.Day,
                    DiaAnio = fecha.DayOfYear,
                    EsFinDeSemana = (fecha.DayOfWeek == DayOfWeek.Saturday || fecha.DayOfWeek == DayOfWeek.Sunday)
                };

                lista.Add(registro);
                fecha = fecha.AddDays(1);
            }

            return lista;
        }
    }
}