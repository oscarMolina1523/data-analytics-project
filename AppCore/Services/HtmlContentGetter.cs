using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace APPCORE.Util
{
    public class HtmlContentGetter
    {
        public static string ReadHtmlFile(string file, string path = "Resources")
        {
            // Obtener la ruta base de la biblioteca de clases
            string baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
            // Combinar la ruta base con la carpeta Resources y el nombre del archivo
            string filePath = Path.Combine(baseDirectory, path, file);
            // Leer el contenido del archivo
            string htmlContent = File.ReadAllText(filePath);
            return htmlContent;
        }
    }
}