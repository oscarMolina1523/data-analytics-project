using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Operations.AnaliticOperations.Model
{
    public  class DataAnaliticRequest
    {
        public required DateTime Desde { get; set; }
        public required DateTime Hasta { get; set; }
        public required List<string> GroupParams { get; set; }
        public required List<string> EvalParams { get; set; }
    }
}