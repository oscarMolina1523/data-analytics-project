using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Operations.EstadisticModule;

namespace Operations.Utility
{


    public class GroupingResult
    {
        public object GroupedData { get; set; }
        public Dictionary<string, Dictionary<string, SummaryMetric>> MetricLevels { get; set; }
    }

    public class SummaryMetric
    {
        public decimal? Sum { get; set; }
        public int Count { get; set; }
        public decimal Avg { get; set; }
    }

    public class ModelProperty
    {
        public string Type { get; set; } // "MONEY", "NUMBER", "TEXT", etc.
    }

    public static class DataGroupingHelper
    {
        public class DataGroupingResult
        {
            public object groupedData { get; set; }
            public object metricLevels { get; set; }
            public List<HipotesisTestResult> hipotesisTestResults { get; set; } = [];
        }
        public static DataGroupingResult GroupData<T>(
            IEnumerable<T> data,
            List<string> groupParams,
            List<string> evalParams,
            Dictionary<string, ModelProperty> modelObject,
            string title,
            bool isFinalGroupedData = false)
        {
            if (!groupParams.Contains(evalParams[0]))
            {
                groupParams.Add(evalParams[0]);
            }
            var metricLevels = new Dictionary<string, object>();

            if (groupParams == null || groupParams.Count == 0)
            {
                metricLevels[title ?? "Reporte"] = CalculateSummary(data.Cast<object>().ToList(), null,
                    data.Cast<object>().ToList().Count, evalParams, modelObject, isFinalGroupedData);

                /*return new Dictionary<string, object>
                {
                    [title ?? "Reporte"] = data
                };*/
                return new DataGroupingResult
                {
                    groupedData = data,
                    metricLevels = metricLevels
                };
            }

            var groupedData = new Dictionary<string, object>();
            var listGroupObjects = new List<object>();

            foreach (var item in data)
            {
                object currentLevel = groupedData;
                List<string> path = new List<string>();
                string metricKey = groupParams.Last();

                for (int i = 0; i < groupParams.Count; i++)
                {
                    var param = groupParams[i];

                    var value = GetPropertyValue(item, param)?.ToString() ?? "Undefined";

                    var dict = currentLevel as Dictionary<string, object>;

                    if (!dict.ContainsKey(value))
                    {
                        dict[value] = (i == groupParams.Count - 1)
                            ? new List<object>()
                            : new Dictionary<string, object>();
                    }

                    currentLevel = dict[value];
                }


                var list = currentLevel as List<object>;

                if (isFinalGroupedData && list != null)
                {
                    var existing = list.FirstOrDefault(it =>
                        GetPropertyValue(it, metricKey)?.ToString() ==
                        GetPropertyValue(item, metricKey)?.ToString()
                    );

                    if (existing == null)
                    {
                        var newItem = ToGroupingDictionary(item, groupParams);
                        newItem["count"] = 1;
                        // Si necesitas acumular evalParams para métricas, agrégalos explícitamente
                        foreach (var param in evalParams)
                        {
                            var val = GetPropertyValue(item, param);
                            if (val != null)
                            {
                                if (double.TryParse(val.ToString(), out double numericValue))
                                {
                                    newItem[param] = numericValue;
                                }
                                else
                                {
                                    newItem[param] = val;
                                }
                            }
                        }
                        list.Add(newItem);
                    }
                    else
                    {
                        var dictExisting = existing as Dictionary<string, object>;
                        dictExisting["count"] = Convert.ToInt32(dictExisting["count"]) + 1;

                        foreach (var param in evalParams)
                        {
                            if (double.TryParse(dictExisting[param]?.ToString() ?? "", out double numericValue))
                            {
                                var val = Convert.ToDouble(dictExisting[param]);
                                var newVal = Convert.ToDouble(GetPropertyValue(item, param) ?? 0);
                                dictExisting[param] = val + newVal;
                            }

                        }
                    }
                }
                else
                {
                    list?.Add(item);
                }
                listGroupObjects.Add(item);
            }


            // Procesar métricas
            List<object> ProcessGroup(object group, List<string> path)
            {
                var allItems = new List<object>();
                var dict = group as Dictionary<string, object>;

                foreach (var key in dict.Keys)
                {
                    var currentPath = new List<string>(path) { key };

                    if (dict[key] is List<object> list)
                    {
                        // 👇 CALCULAR EL TOTAL DEL GRUPO ACTUAL desde dict
                        int groupTotal = dict.Values
                            .OfType<List<object>>()
                            .SelectMany(l => l)
                            .Sum(item => Convert.ToInt32(GetPropertyValue(item, "count") ?? 0));

                        // Crear un objeto que represente el total del grupo
                        var groupTotalData = new List<object>
                        {
                            new { TotalCount = groupTotal }
                        };

                        metricLevels[string.Join(" > ", currentPath)] =
                            CalculateSummary(list, groupTotalData, data.Cast<object>().ToList().Count,  
                            evalParams, modelObject, isFinalGroupedData);

                        allItems.AddRange(list);
                    }
                    else
                    {
                        var subItems = ProcessGroup(dict[key], currentPath);
                        allItems.AddRange(subItems);
                    }
                }

                if (allItems.Count > 0)
                {
                    // Para el nivel padre, calcular su total
                    int parentTotal = dict.Values
                        .OfType<List<object>>()
                        .SelectMany(l => l)
                        .Sum(item => Convert.ToInt32(GetPropertyValue(item, "count") ?? 0));

                    var parentTotalData = new List<object>
                    {
                        new { TotalCount = parentTotal }
                    };

                    metricLevels[string.Join(" > ", path)] =
                        CalculateSummary(allItems, parentTotalData, data.Cast<object>().ToList().Count,
                         evalParams, modelObject, isFinalGroupedData);
                }

                return allItems;
            }
            ProcessGroup(groupedData, new List<string>());

            metricLevels["General Summary"] =
                CalculateSummary(data.Cast<object>().ToList(), null, data.Cast<object>().ToList().Count,
                 evalParams, modelObject, isFinalGroupedData);

            return new DataGroupingResult
            {
                groupedData = groupedData,
                metricLevels = metricLevels
            };
        }

        // =========================
        // SUMMARY
        // =========================
        private static Dictionary<string, object> CalculateSummary(
            List<object> data,
            List<object> parentData,  // 👈 Ahora contiene el total del grupo
            int TotalData,
            List<string> evalParams,
            Dictionary<string, ModelProperty> modelObject,
            bool isFinalGroupedData)
        {
            var summary = new Dictionary<string, object>();

            // 👇 EXTRAER EL TOTAL DEL GRUPO desde parentData
            int groupTotal = 0;
            if (parentData != null && parentData.Any())
            {
                // Si parentData tiene un objeto con TotalCount
                var totalObj = parentData.FirstOrDefault();
                if (totalObj.GetType().GetProperty("TotalCount") != null)
                {
                    groupTotal = Convert.ToInt32(GetPropertyValue(totalObj, "TotalCount"));
                }
                else
                {
                    // Fallback: sumar counts si son datos normales
                    groupTotal = isFinalGroupedData
                        ? parentData.Sum(item => Convert.ToInt32(GetPropertyValue(item, "count") ?? 0))
                        : parentData.Count;
                }
            }

            // Si no hay parentData, calcular desde data
            if (groupTotal == 0)
            {
                groupTotal = isFinalGroupedData
                    ? data.Sum(item => Convert.ToInt32(GetPropertyValue(item, "count") ?? 0))
                    : data.Count;
            }

            foreach (var param in evalParams)
            {
                bool isWithModel = modelObject != null && modelObject.ContainsKey(param);
                bool isMoney = isWithModel && modelObject[param].Type?.ToUpper() == "MONEY";
                bool isNumber = isWithModel && modelObject[param].Type?.ToUpper() == "NUMBER";
                bool isCategorical = !isMoney && !isNumber;

                double? totalSum = null;
                int validCount = 0;

                if (isFinalGroupedData)
                {
                    validCount = data.Sum(item =>
                    {
                        var countVal = GetPropertyValue(item, "count");
                        return countVal != null ? Convert.ToInt32(countVal) : 0;
                    });

                    if (isMoney || isNumber)
                    {
                        totalSum = data.Sum(item =>
                        {
                            var val = GetPropertyValue(item, param);
                            return double.TryParse(val?.ToString(), out double r) ? r : 0;
                        });
                    }
                }
                else
                {
                    validCount = data.Count(item => GetPropertyValue(item, param) != null);

                    if (isMoney || isNumber)
                    {
                        totalSum = data.Sum(item =>
                        {
                            var val = GetPropertyValue(item, param);
                            return double.TryParse(val?.ToString(), out double r) ? r : 0;
                        });
                    }
                }

                // 📊 CALCULAR PORCENTAJE SOBRE EL TOTAL DEL GRUPO
                double pctOfGroup = groupTotal > 0
                    ? (double)validCount / groupTotal * 100
                    : 0;

                double avg = TotalData > 0
                ? (double)validCount / TotalData * 100
                : 0;


                var metric = new Dictionary<string, object>
                {
                    ["count"] = validCount,
                    ["groupTotal"] = groupTotal,  // 👈 Total del grupo (Naranja+Verde+Fresa)
                    ["pct"] = Math.Round(pctOfGroup, 2),  // 👈 % dentro del grupo
                    ["avg"] = Math.Round(avg, 2)   // Mismo valor para compatibilidad
                };

                if (totalSum.HasValue)
                    metric["sum"] = Math.Round(totalSum.Value, 2);

                summary[param] = metric;
            }

            return summary;
        }

        // =========================
        // HELPERS
        // =========================
        private static object GetPropertyValue(object obj, string prop)
        {
            if (string.IsNullOrEmpty(prop))
                return null;

            if (obj is Dictionary<string, object> dict)
                return dict.ContainsKey(prop) ? dict[prop] : null;

            var property = obj.GetType().GetProperty(prop);
            return property?.GetValue(obj);
        }

        private static Dictionary<string, object> ToDictionary(object obj)
        {
            return obj.GetType()
                .GetProperties()
                .ToDictionary(p => p.Name, p => p.GetValue(obj)!);
        }
        private static Dictionary<string, object> ToGroupingDictionary(object obj, List<string> groupingProperties)
        {
            var result = new Dictionary<string, object>();

            foreach (var prop in groupingProperties)
            {
                var value = GetPropertyValue(obj, prop);
                result[prop] = value;
            }

            return result;
        }
    }


}