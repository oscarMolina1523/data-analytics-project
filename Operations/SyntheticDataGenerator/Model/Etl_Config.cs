using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using APPCORE;

namespace Operations.SyntheticDataGenerator.Model
{
    public class Etl_Config: EntityClass
    {
        [PrimaryKey(Identity = true)]
        public int? Id { get; set; }
        public DateTime? Update_At { get; set; }
        public DateTime? BeginDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}