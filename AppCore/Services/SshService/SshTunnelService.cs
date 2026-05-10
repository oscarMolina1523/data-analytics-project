using Microsoft.Extensions.Configuration;
using Renci.SshNet;
using System;

public class SshTunnelService
{
    private SshClient _sshClient;
    private ForwardedPortLocal _forwardedPort;
    private readonly IConfigurationRoot _configuration;

    public SshTunnelService(IConfigurationRoot configurationRoot)
    {
        // Cargar las configuraciones automáticamente al crear la instancia
        _configuration = configurationRoot;
    }

    private IConfigurationRoot LoadConfiguration()
    {
        return new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .Build();
    }

    public SshClient GetSshClient(string connectionName)
    {
        var sshSettings = _configuration.GetSection($"ConnectionStrings:SSHConnection{connectionName}");
        var host = sshSettings["HostName"];
        var username = sshSettings["UserName"];
        var password = sshSettings["Password"];
        var port = int.Parse(sshSettings["Port"]);
        var _sshClient = new SshClient(host, port, username, password);
        return _sshClient;
    }
    public ForwardedPortLocal GetForwardedPort(string connectionName, SshClient _sshClient, int localPort)
    {
        var mysqlSettings = _configuration.GetSection($"ConnectionStrings:MySQLConnection{connectionName}");
        var remoteHost = mysqlSettings["Server"];
        var remotePort = int.Parse(mysqlSettings["Port"]);
        var _forwardedPort = new ForwardedPortLocal("127.0.0.1", (uint)localPort, "127.0.0.1", (uint)remotePort);
        _sshClient.AddForwardedPort(_forwardedPort);
        return _forwardedPort;
    }


}
