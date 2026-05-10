using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
namespace AppCore.Services
{
    public class YmlToJson
    {
        public static T ParseToObject<T>(string data) where T : new()
        {
            var obj = new T();
            //var type = typeof(T);
            //var properties = type.GetProperties(BindingFlags.Public | BindingFlags.Instance);
            //var dict = new Dictionary<string, object>();
            string[] lines = data.Split(new[] { "\n" }, StringSplitOptions.RemoveEmptyEntries);

            string? currentKey = null;
            var nestedDict = new Dictionary<string, int>();

            foreach (var line in lines)
            {
                string evline = line.Replace("---", "");
                if (evline.StartsWith(":"))
                {
                    if (currentKey != null && nestedDict.Count > 0)
                    {
                        SetProperty(obj, currentKey, nestedDict);
                        nestedDict = new Dictionary<string, int>();
                    }

                    var parts = evline.Split([':'], 3);
                    currentKey = parts[1].Trim();

                    if (parts.Length > 2 && !string.IsNullOrWhiteSpace(parts[2]))
                    {
                        SetProperty(obj, currentKey, parts[2].Trim());
                        currentKey = null;
                    }
                }
                else if (currentKey != null && evline.Trim().Length > 0)
                {
                    var hashParts = evline.Trim().Split([':'], 2);
                    if (hashParts.Length == 2 && int.TryParse(hashParts[1].Trim(), out int value))
                    {
                        nestedDict[hashParts[0].Trim()] = value;
                    }
                }
            }

            if (currentKey != null && nestedDict.Count > 0)
            {
                SetProperty(obj, currentKey, nestedDict);
            }

            return obj;
        }

        private static void SetProperty<T>(T obj, string propertyName, object value)
        {
            var property = typeof(T).GetProperty(propertyName, BindingFlags.Public | BindingFlags.Instance);
            if (property != null && property.CanWrite)
            {
                if (property.PropertyType == typeof(Dictionary<string, int>))
                {
                    property.SetValue(obj, value);
                }
                else if (property.PropertyType == typeof(string))
                {
                    property.SetValue(obj, value.ToString());
                }
                else if (property.PropertyType == typeof(int) && int.TryParse(value.ToString(), out int intValue))
                {
                    property.SetValue(obj, intValue);
                }
                else if (property.PropertyType == typeof(int?))
                {
                    if (int.TryParse(value.ToString(), out int nullableIntValue))
                    {
                        property.SetValue(obj, nullableIntValue);
                    }
                    else
                    {
                        property.SetValue(obj, null);
                    }
                }
            }
        }
    }
}