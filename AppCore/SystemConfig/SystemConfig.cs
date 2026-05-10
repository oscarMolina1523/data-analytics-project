using System.Diagnostics;
using APPCORE.Services;
using Microsoft.Extensions.Configuration;
namespace APPCORE.SystemConfig
{
	public abstract class SystemConfig
	{
		public static bool isDebug = false;
		public static bool IsDevelopment = false;
		public string TITULO = "TEMPLATE";
		public string SUB_TITULO = "Template";
		public string NOMBRE_EMPRESA = "TEMPLATE";
		public string LOGO_PRINCIPAL = "logo.png";
		public string MEDIA_IMG_PATH = "/media/img/";
		public string MEDIA_ATTACH_PATH = "/media/";
		public string VERSION = "2024.07";
		public string MEMBRETE_HEADER = "";
		public string MEMBRETE_FOOTHER = "";
		public bool USE_ONLY_FILE_NAME = false;
		public List<Transactional_Configuraciones> configuraciones = new List<Transactional_Configuraciones>();
		public static IConfigurationRoot AppConfiguration()
		{
			return new ConfigurationBuilder()
					.SetBasePath(Directory.GetCurrentDirectory())
					.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
					.Build();
		}
		public static IConfigurationSection AppConfigurationSection(string sectionName)
		{
			return new ConfigurationBuilder()
					.SetBasePath(Directory.GetCurrentDirectory())
					.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
					.Build().GetSection(sectionName);
		}
		public static string? AppConfigurationValue(AppConfigurationList sectionName, string value)
		{
			return new ConfigurationBuilder()
					.SetBasePath(Directory.GetCurrentDirectory())
					.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
					.Build().GetSection(sectionName.ToString())[value];
		}

		public static MailConfig? GetSMTPDefaultConfig()
		{
			string? domain = AppConfigurationValue(AppConfigurationList.Smtp, "Domain");
			string? user = AppConfigurationValue(AppConfigurationList.Smtp, "User");
			string? password = AppConfigurationValue(AppConfigurationList.Smtp, "Password");
			string? port = AppConfigurationValue(AppConfigurationList.Smtp, "Port");
			return new MailConfig()
			{
				HOST = domain,
				PASSWORD = password,
				USERNAME = user,
				PORT = port != null ? Convert.ToInt32(port) : null,
				AutenticationType = AutenticationTypeEnum.BASIC
			};
		}
	}


}
