
using System.Text.RegularExpressions;
using MimeKit;
using System;
using System.IO;
using System.Text;


namespace APPCORE.Services
{
	public class FileService
	{
		public static ResponseService upload(string path, ModelFiles Attach)
		{
			try
			{

				string Carpeta = @"\wwwroot\" + path;
				string Ruta = Directory.GetCurrentDirectory() + Carpeta;
				if (!Directory.Exists(Ruta))
				{
					Directory.CreateDirectory(Ruta);
				}
				string? val = Attach?.Value;
				Attach!.Value = ExtractBase64(val ?? "");

				if (!IsBase64String(Attach?.Value ?? ""))
				{
					LoggerServices.AddMessageError("ERROR: FileService.upload", new Exception("Formato incorrecto, base64 invalido"));					
					return new ResponseService()
					{
						status = 403,
						body = new ModelFiles
						{
							Value = Attach?.Value,
						},
						message = "Formato incorrecto, base64 invalido"
					};
				}

				byte[] File64 = Convert.FromBase64String(Attach?.Value ?? "");
				string[]? extension = Attach?.Type?.Split(["data:"], StringSplitOptions.RemoveEmptyEntries);
				string MimeType = "";
				if (extension?.Length > 0)
				{
					MimeType = extension[0];
				}
				string FileType = GetFileType(MimeType);
				Guid Uuid = Guid.NewGuid();				
				string FileName =  Uuid.ToString() + FileType;
				string FileRoute = Ruta + FileName;
				File.WriteAllBytes(FileRoute, File64);
				string RutaRelativa = Path.GetRelativePath(Directory.GetCurrentDirectory(), FileRoute);

				ModelFiles AttachFiles = new ModelFiles
				{
					Name = FileName,
					Value = RutaRelativa,
					Type = FileType
				};

				return new ResponseService()
				{
					status = 200,
					body = AttachFiles,
					message = "Archivo creado correctamente"
				};

			}
			catch (Exception ex)
			{
				LoggerServices.AddMessageError("ERROR: FileService.upload", ex);
				return new ResponseService()
				{
					status = 500,
					value = ex.ToString(),
					message = "Error, intentelo nuevamente"
				};
			}

		}

		public static ModelFiles ReceiveFiles(string path, MimeEntity attachment)
		{
			string Carpeta = @"\wwwroot\Media\" + path;
			string Ruta = Directory.GetCurrentDirectory() + Carpeta;
			if (!Directory.Exists(Ruta))
			{
				Directory.CreateDirectory(Ruta);
			}
			//var fileName = attachment.ContentDisposition?.FileName ?? attachment.ContentType.Name;

			//byte[] datos = ObtenerDatosMimeEntity(attachment);           
			string FileType = GetFileType(attachment.ContentType.MimeType);
			string FileName = Guid.NewGuid().ToString() + FileType;
			string FileRoute = Ruta + FileName;
			//File.WriteAllBytes(FileRoute, datos);
			string RutaRelativa = Path.GetRelativePath(Directory.GetCurrentDirectory(), FileRoute);

			using (var stream = File.Create(FileRoute))
			{
				if (attachment is MimePart)
				{
					var part = (MimePart)attachment;
					part.Content.DecodeTo(stream);
				}
				else if (attachment is MessagePart)
				{
					var part = (MessagePart)attachment;
					part.Message.WriteTo(stream);
				}
			}

			ModelFiles AttachFiles = new ModelFiles
			{
				Name = attachment.ContentType.Name,
				Value = RutaRelativa,
				Type = FileType
			};
			return AttachFiles;
		}
		public static ModelFiles ReceiveFiles(string path, MimePart attachment)
		{
			string Carpeta = @"\wwwroot\Media\" + path;
			string Ruta = Directory.GetCurrentDirectory() + Carpeta;
			if (!Directory.Exists(Ruta))
			{
				Directory.CreateDirectory(Ruta);
			}
			//var fileName = attachment.ContentDisposition?.FileName ?? attachment.ContentType.Name;

			//byte[] datos = ObtenerDatosMimeEntity(attachment);           
			string FileType = GetFileType(attachment.ContentType.MimeType);
			string FileName = Guid.NewGuid().ToString() + FileType;
			string FileRoute = Ruta + FileName;
			//File.WriteAllBytes(FileRoute, datos);
			string RutaRelativa = Path.GetRelativePath(Directory.GetCurrentDirectory(), FileRoute);

			using (var stream = File.Create(FileRoute))
			{
				var part = (MimePart)attachment;
				part.Content.DecodeTo(stream);
			}

			ModelFiles AttachFiles = new ModelFiles
			{
				Name = attachment.ContentType.Name,
				Value = RutaRelativa,
				Type = FileType
			};
			return AttachFiles;
		}
		static byte[] ObtenerDatosMimeEntity(MimeEntity mimeEntity)
		{
			using (MemoryStream stream = new MemoryStream())
			{
				mimeEntity.WriteTo(stream);
				return stream.ToArray();
			}
		}


		public static ModelFiles HtmlToPdfBase64(string htmlString, string fileName)
		{
			using (MemoryStream memoryStream = new MemoryStream())
			{				
				// Obtener los bytes del PDF
				byte[] pdfBytes = PdfService.ConvertHtmlToPdf(htmlString);

				// Codificar el PDF en base64
				string base64EncodedPdf = Convert.ToBase64String(pdfBytes);

				// Mostrar la cadena codificada en base64
				//Console.WriteLine("PDF codificado en base64:");
				//Console.WriteLine(base64EncodedPdf);

				return new ModelFiles
				{
					Value = base64EncodedPdf,
					Name = fileName ?? Guid.NewGuid().ToString() + ".pdf",
					Type = "pdf"
				};
				// Aquí puedes usar base64EncodedPdf para enviar el PDF por correo
			}
		}

		public static string GetFileType(string mimeType)
		{
			Dictionary<string, string> TypeFile = new Dictionary<string, string>
			{
				{ "image/png;base64,", ".png" },
				{ "application/pdf;base64,", ".pdf" },
				{ "application/pdf", ".pdf" },
				{ "application", ".pdf" },
				{ "image/jpeg", ".png" },
				{ "image/png", ".png" },
				{ "image", ".png" },
				{ "png", ".png" },
				{ "jpg", ".png" },
				{ "jpeg", ".png" },
				{ "pdf", ".pdf" },
				{ "xlsx", ".xlsx" },
				{ "xls", ".xls" },
				{ "doc", ".doc" },
				{ "docx", ".docx" }
			};

			if (TypeFile.TryGetValue(mimeType, out string? Type))
			{
				return Type;
			}
			else
			{
				return ".unknown";
			}
		}
		public static bool IsBase64String(string base64)
		{
			Span<byte> buffer = new Span<byte>(new byte[base64.Length]);
			return Convert.TryFromBase64String(base64, buffer, out int bytesParsed);
		}
		static string? ExtractBase64(string? input)
		{
			// Utilizamos una expresión regular para extraer la cadena base64
			// después de "data:image/png;base64," o cualquier otro tipo de encabezado
			// que pueda aparecer.
			Regex regex = new Regex(@"data:[^;]+;base64,(.+)");
			Match match = regex.Match(input ?? "");

			if (match.Success)
			{
				// El valor capturado está en el grupo 1
				return match.Groups[1].Value;
			}

			// Si no hay coincidencia, simplemente devolvemos la cadena original
			return input;
		}
		public static string? setImage(string image, string path)
		{
			return ((ModelFiles?)FileService.upload(path, new ModelFiles { Type = "png", Value = image, Name = "" })?.body)?.Value?.Replace("wwwroot", "");
		}
	}


	public class ModelFiles
	{
		/*
		{
			"Name": "20240519_145425.jpg",
			"Value": "wwwroot\\Media\\Attach\\1e756b68-5353-40f2-8064-7474e9efa77c.png",
			"Type": ".png"
		}*/
		public string? Name { get; set; }
		public string? Value { get; set; }
		public string? Type { get; set; }
	}

}
