using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Text;
using System.Text.RegularExpressions;

namespace APPCORE
{
	public class LoggerServices
	{
		public static void AddMessageInfo(string message)
		{
			Console.WriteLine(message);
			try
			{
				new Log
				{
					Fecha = DateTime.Now,
					message = message,
					LogType = LogType.INFO.ToString()
				}.Save();
			}
			catch (System.Exception)
			{ }
		}
		public static void AddAction(string message, int Id_User)
		{
			Console.WriteLine(message);
			try
			{
				new Log
				{
					Fecha = DateTime.Now,
					message = message,
					Id_User = Id_User,
					LogType = LogType.ACTION.ToString()
				}.Save();
			}
			catch (System.Exception)
			{ }
		}

		public static void AddMessageError(string message, Exception ex)
		{
			// Escribe el mensaje y la excepción en la consola para depuración rápida.
			Console.WriteLine($"{message}: {ex.Message}");

			try
			{
				// Detecta si el error es un error relacionado con SQL Server.
				if (ex is SqlException sqlEx)
				{
					/*// Comprobamos los números de error SQL comunes que indican problemas de conexión.
					// Esta lista puede ser expandida para incluir otros errores específicos de SQL Server.
					if (sqlEx.Number == -2 ||  // Timeout
						sqlEx.Number == 53 ||  // Error de conexión (Nombre de servidor incorrecto)
						sqlEx.Number == 233 || // Error de conexión (SQL Server no permite conexiones)
						sqlEx.Number == 4060 ||// Error de inicio de sesión en la base de datos
						sqlEx.Number == 3981 )  
					{*/
						// Es un error de conexión o transacción.
						LogErrorToFile(message, ex);
						return;
					//}
				}

				// Si no es un error de conexión o transacción, o si es otro tipo de excepción,
				// intentamos guardar el log en la base de datos.
				var logEntry = new Log
				{
					Fecha = DateTime.Now,
					body = 	$"Tipo: {ex.GetType().Name},\n\n Mensaje: {ex.Message},\n\n Pila de llamadas:\n\n {ex.StackTrace}",
					message = message,
					LogType = LogType.ERROR.ToString()
				};

				logEntry.Save();
			}
			catch (Exception logEx)
			{
				// Maneja la excepción del logging para no dejarla silenciosa.
				// Aquí puedes decidir cómo manejar esto. Quizás enviar a otro almacenamiento o un log de emergencia.
				Console.WriteLine("Failed to log error to the database: " + logEx.Message);
				// También podría escribir este error a un archivo de log como alternativa.
				LogErrorToFile("Failed to log true error to file", ex);
				LogErrorToFile("Failed to log error to the database", logEx);
			}
		}

		private static void LogErrorToFile(string message, Exception ex)
		{
			try
			{
				// Ruta de archivo de log. Ajusta según sea necesario.
				string logFilePath = "error_log.txt";

				// Formato de registro de error.
				string logMessage = $"[{DateTime.Now}] {message}: {ex.Message}{Environment.NewLine}{ex.StackTrace}{Environment.NewLine}";

				// Escribir en el archivo de log.
				File.AppendAllText(logFilePath, logMessage);
			}
			catch (Exception fileEx)
			{
				// Si falla el logging en archivo, muestra en consola.
				Console.WriteLine("Failed to log error to file: " + fileEx.Message);
			}
		}
		static string RemoveSpecialCharactersForSql(string input)
		{
			// Utilizar una expresión regular para eliminar caracteres especiales para SQL
			return Regex.Replace(input, "[^a-zA-Z0-9]", " ");
		}

		static string RemoveSpecialCharactersForJson(string input)
		{
			// Utilizar una expresión regular para eliminar caracteres especiales para JSON
			return Regex.Replace(input, "[^a-zA-Z0-9,.{}\":]", "");
		}

		static string RemoveQuotes(string input)
		{
			// Eliminar comillas simples
			string withoutSingleQuotes = input.Replace("'", string.Empty);

			// Eliminar comillas dobles
			string withoutDoubleQuotes = withoutSingleQuotes.Replace("\"", string.Empty);

			return withoutDoubleQuotes;
		}

	}
	public class Logger : LoggerServices
	{

	}

	public class Log : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? Id_Log { get; set; }
		public int? Id_User { get; set; }
		public DateTime? Fecha { get; set; }
		public string? message { get; set; }
		public string? LogType { get; set; }
		public string? body { get; set; }
	}

	public enum LogType
	{
		ERROR, INFO, ACTION,
        MEMORYINFO
    }
}
