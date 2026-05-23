using APPCORE;
using APPCORE.BDCore.Abstracts;
namespace BusinessLogic.Connection
{
	public class BDConnection
	{
		public WDataMapper? BDOrigen { get; set; }
		public WDataMapper? BDDestino { get; set; }
		public BDConnection()
		{
			BDOrigen = SqlADOConexion.BuildDataMapper(".", "sa", "123456789", "BDOrigen");
			BDDestino = SqlADOConexion.BuildDataMapper(".", "sa", "123456789", "BDDestino");
			BDDestino?.GDatos.TestConnection();
			BDOrigen?.GDatos.TestConnection();
		}

		public bool InitMainConnection(bool isDebug = false)
		{
			return SqlADOConexion.IniciarConexion("sa", "123456789", ".", "DW_Bienestar_Psicoemocional");
		}
	}
}