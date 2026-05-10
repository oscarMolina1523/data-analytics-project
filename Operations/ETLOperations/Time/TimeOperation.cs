using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Operations.Time
{
    public class TimeOperation
    {
        public void Excute()
        { 
            var beginTime = DateOLAPOperation.GetLastUpdatedate();
            var endTime = DateTime.Now;
            
             //EXTRACT - TRANSFORM
            List<TimeDIM> entitys = TimeGenerator.Generar(beginTime, endTime);
           
            //LOAD
            foreach (var entity in entitys)
            {
                if (new TimeDIM { FechaKey = entity.FechaKey }
                    .SimpleFind<TimeDIM>() != null)
                {
                    continue;
                }
                entity.Save();
            }
            
        }

    }
}