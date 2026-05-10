using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Mail;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Identity.Client;
using MimeKit;

namespace APPCORE.Services
{
	public class SMTPMailServices
	{
		const string USERNAME = "wdevexp@outlook.com";
		const string PASSWORD = "%WtestDev2023%1";
		const string HOST = "smtp-mail.outlook.com";
		const int PORT = 587;
		
		public static MailConfig Config = new MailConfig() { HOST = HOST, PASSWORD = PASSWORD, USERNAME = USERNAME , AutenticationType = AutenticationTypeEnum.BASIC };

		public async static Task<bool> SendMail(string? from,
		   List<string>? toMails,
		   string? subject,
		   string? body,
		   List<ModelFiles>? attach,
		   string? uid,
		   MailConfig? config)
		{
			if (config?.AutenticationType == AutenticationTypeEnum.AUTH2)
			{
				return await SendMailAuth2(from, toMails, subject, body, attach, config, uid);
			}
			else
			{
				if (config == null)
				{
					config = Config;
				}
				return SendMailBasic(from, toMails, subject, body, attach, config, uid);
			}
		}
		static async Task<bool> SendMailAuth2(string from,
			List<string> toMails,
			string subject,
			string body,
			List<ModelFiles> attach,
			MailConfig mailConfig,
			string? uid)
		{
			try
			{
				var clientId = mailConfig.CLIENT;
				var clientSecret = mailConfig.CLIENT_SECRET;
				var tenantId = mailConfig.TENAT;
				var cca = ConfidentialClientApplicationBuilder.Create(clientId)
					.WithClientSecret(clientSecret)
					.WithAuthority(new Uri($"https://login.microsoftonline.com/{tenantId}"))
					.Build();

				var AccessToken = await Auth2Utils.GetAccessTokenAsync(mailConfig);

				var message = new MimeMessage();
				if (toMails == null || toMails.Count == 0)
				{
					return false;

				}
				toMails.ForEach(m =>
				{
					string? mail = obtainMail(m);
					message.To.Add(new MailboxAddress("-", mail));
				});
				message.From.Add(new MailboxAddress("PORTAL CCA", mailConfig.USERNAME));

				message.Subject = subject;
				if (uid != null)
				{
					message.InReplyTo = uid;
					message.References.Add(uid);
				}

				var multipart = new Multipart("mixed");
				var htmlBody = new TextPart("html")
				{
					Text = body ?? "correo enviado desde Soporte:"
				};
				multipart.Add(htmlBody);
				if (attach != null)
				{
					foreach (var file in attach)
					{
						var attachment = new MimePart("application", "octet-stream")
						{
							ContentDisposition = new ContentDisposition(ContentDisposition.Attachment),
							ContentTransferEncoding = ContentEncoding.Base64,
							FileName = file.Name,
							// Aquí especifica la ruta del archivo
							// var filePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, file.Name);
							// Lee el contenido del archivo y asigna al cuerpo del adjunto
							Content = new MimeContent(File.OpenRead(file.Value))
						};
						//attachment.Content = new MimeContent(new MemoryStream(Convert.FromBase64String(base64Data)));
						multipart.Add(attachment);
					}
				}
				// Asigna el cuerpo del mensaje al mensaje principal
				message.Body = multipart;
				using (var client = new MailKit.Net.Smtp.SmtpClient())
				{
					client.Connect(mailConfig.HOST, 587, SecureSocketOptions.StartTls);
					// use the access token
					var oauth2 = new SaslMechanismOAuth2(mailConfig.USERNAME, AccessToken.Access_token);
					client.Authenticate(oauth2);
					client.Send(message);
					client.Disconnect(true);
				}
				return true;
			}
			catch (Exception ex)
			{
				LoggerServices.AddMessageError($"error enviando correo desde {mailConfig.HOST} {mailConfig.USERNAME}", ex);
				return false;
			}
		}
		public static string? obtainMail(string inputString)
		{
			if (IsValidEmail(inputString))
			{
				return new MailAddress(inputString).Address;
			}
			// Utilizamos una expresión regular para buscar direcciones de correo electrónico
			string pattern = @"<([^>]+)>"; // Buscará lo que esté dentro de los corchetes angulares
			Regex regex = new Regex(pattern);

			// Buscamos coincidencias en la cadena
			Match match = regex.Match(inputString);

			// Verificamos si se encontró una coincidencia
			if (match.Success)
			{
				string emailAddress = match.Groups[1].Value;
				return emailAddress;
			}
			else
			{
				return null;
			}
		}
		static bool IsValidEmail(string email)
		{
			try
			{
				var addr = new MailAddress(email);
				return true;
			}
			catch
			{
				return false;
			}
		}
		public static bool SendMailBasic(string from,
			List<string> toMails,
			string subject,
			string body,
			List<ModelFiles> attach,
			MailConfig config,
			string? uid)
		{
			if (config.HOST == null && config.USERNAME == null)
			{
				return false;
			}
			try
			{
				//var templatePage = Path.Combine(System.IO.Path.GetFullPath("../UI/Pages/Mails"), path);
				MailMessage correo = new MailMessage();
				correo.From = new MailAddress(config.USERNAME, config.DISPLAYNAME ?? config.USERNAME, System.Text.Encoding.UTF8);//Correo de salida
				if (toMails == null || toMails.Count == 0)
				{
					return false;

				}
				foreach (string toMail in toMails)
				{
					correo.To.Add(toMail); //Correos de destino
				}

				if (attach != null)
				{
					foreach (var files in attach)
					{
						Attachment AttachFile = new Attachment(files.Value);
						AttachFile.Name = files.Name;
						correo.Attachments.Add(AttachFile);
					}
				}
				
				correo.Subject = subject; //Asunto
				correo.Body = from + ": " + body;//ContractService.RenderTemplate(templatePage, model);
				correo.IsBodyHtml = true;
				correo.Priority = MailPriority.Normal;
				if (uid != null)
				{
					correo.Headers.Add("In-Reply-To", uid);
				}
				System.Net.Mail.SmtpClient smtp = new System.Net.Mail.SmtpClient
				{
					UseDefaultCredentials = false,
					Host = config.HOST ?? "",
					Port = config.PORT ?? PORT, //Puerto de salida 
					Credentials = new NetworkCredential(config.USERNAME, config.PASSWORD)//Cuenta de correo
				};
				ServicePointManager.ServerCertificateValidationCallback +=
				  (sender, cert, chain, sslPolicyErrors) => true;
				smtp.EnableSsl = true;//True si el servidor de correo permite ssl
				smtp.Send(correo);
				return true;
			}
			catch (Exception ex)
			{
				LoggerServices.AddMessageError($"error enviando correo desde {config.HOST} {config.USERNAME}", ex);
				return false;
			}
		}
		
	}

}
