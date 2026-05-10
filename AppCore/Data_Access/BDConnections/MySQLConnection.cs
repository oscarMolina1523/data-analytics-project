using APPCORE.BDCore.Abstracts;
using APPCORE.BDCore.MySqlImplementations;
using APPCORE.MySqlImplementations;
using MySql.Data.MySqlClient;
using Renci.SshNet;




namespace APPCORE;

public class MySQLConnection
{
    public static WDataMapper? SQLM;

    static public bool IniciarConexion(string SGBD_USER, string SWGBD_PASSWORD, string SQLServer, string BDNAME, int PORT)
    {
        try
        {
            return createConexion(SQLServer, SGBD_USER, SWGBD_PASSWORD, BDNAME, PORT);
        }
        catch (Exception)
        {
            SQLM = null;
            return false;
            throw;
        }
    }
    private static bool createConexion(string SGBD_USER, string SWGBD_PASSWORD, string MySQLServer, string BDNAME, int Port = 3306)
    {
        string userSQLConexion = $"Server={MySQLServer};Port={Port};User ID={SGBD_USER};Password={SWGBD_PASSWORD};Database={BDNAME};";
        SQLM = new WDataMapper(new MySqlGDatos(userSQLConexion), new MySQLQueryBuilder());
        SQLM.GDatos.Database = BDNAME;
        SQLM.GDatos.GetSqlType = SqlEnumType.MYSQL;
        if (SQLM.GDatos.TestConnection())
        {
            return true;
        }
        else
        {
            SQLM = null;
            return false;
        }
    }

    public static WDataMapper? BuildDataMapper(string MySQLServer,
    string SGBD_USER,
    string SWGBD_PASSWORD,
    string BDNAME,
    int Port = 3306)
    {
        string userSQLConexion = $"Server={MySQLServer};Port={Port};User ID={SGBD_USER};Password={SWGBD_PASSWORD};Database={BDNAME};SslMode=None;";
        WDataMapper mapper = new WDataMapper(new MySqlGDatos(userSQLConexion), new MySQLQueryBuilder());
        mapper.GDatos.Database = BDNAME;
        mapper.GDatos.GetSqlType = SqlEnumType.MYSQL;
        /*if (mapper.GDatos.TestConnection() == false)
        {
            return null;
        }*/
        return mapper;
    }

    public static WDataMapper? BuildDataMapper(
                string MySQLServer,
                string SGBD_USER,
                string SWGBD_PASSWORD,
                string BDNAME,
                int Port = 3306,
                string? sshHostName = null,
                string? sshUserName = null,
                string? sshPassword = null,
                int sshHostPort = 0
    )
    {
        using (var client = new SshClient(sshHostName, sshHostPort, sshUserName, sshPassword))
        {
            try
            {
                // Conexión SSH
                client.Connect();
                Console.WriteLine("Conexión SSH establecida.");

                // Crear el túnel (reenvío de puertos)
                var forwardedPort = new ForwardedPortLocal("127.0.0.1", 3307, "127.0.0.1", 3306); // El puerto local 3307 redirige al remoto 3306
                client.AddForwardedPort(forwardedPort);
                forwardedPort.Start();
                Console.WriteLine("Túnel SSH configurado correctamente.");

                // Conexión a MySQL a través del túnel SSH
                string connStr = $"Server=127.0.0.1;Port=3307;Database={BDNAME};Uid={SGBD_USER};Pwd={SWGBD_PASSWORD};";
                using (var conn = new MySqlConnection(connStr))
                {
                    try
                    {
                        conn.Open();
                        Console.WriteLine("Conexión exitosa a la base de datos!");

                        // Aquí puedes realizar consultas
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error conectando a la base de datos: {ex.Message}");
                    }
                }
                forwardedPort.Stop();
                client.Disconnect();
                Console.WriteLine("Túnel SSH detenido y desconectado.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error configurando la conexión SSH: {ex.Message}");
            }
        }

        string userSQLConexion = $"Server={MySQLServer};Port={Port};User ID={SGBD_USER};Password={SWGBD_PASSWORD};Database={BDNAME};";
        WDataMapper mapper = new WDataMapper(new MySqlGDatos(userSQLConexion), new MySQLQueryBuilder());
        mapper.GDatos.Database = BDNAME;
        mapper.GDatos.GetSqlType = SqlEnumType.MYSQL;
        if (mapper.GDatos.TestConnection() == false)
        {
            return null;
        }
        return mapper;
    }

}


