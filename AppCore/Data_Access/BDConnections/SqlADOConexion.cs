using System;
using System.Collections.Generic;
using System.Text;
using APPCORE.BDCore;
using APPCORE.BDCore.Abstracts;
using APPCORE.BDCore.Implementations;

namespace APPCORE;

public class SqlADOConexion
{
    public static WDataMapper? SQLM;
    static public bool IniciarConexion(string SGBD_USER, string SWGBD_PASSWORD, string SQLServer, string BDNAME)
    {
        try
        {
            return createConexion(SQLServer, SGBD_USER, SWGBD_PASSWORD, BDNAME);
        }
        catch (Exception ex)
        {
            SQLM = null;
            //return false;
            throw new Exception("Error al conectar a base de datos" , ex);
        }
    }
    private static bool createConexion(string SQLServer, string SGBD_USER, string SWGBD_PASSWORD, string BDNAME)
    {
        string userSQLConexion = $"Data Source={SQLServer}; Initial Catalog={BDNAME}; User ID={SGBD_USER};Password={SWGBD_PASSWORD};MultipleActiveResultSets=true";
        SQLM = new WDataMapper(new SqlServerGDatos(userSQLConexion), new SQLServerQueryBuilder());
        if (SQLM.GDatos.TestConnection())
        {
            Connections.Default = SQLM;
            return true;
        }
        else
        {
            SQLM = null;
            return false;
        }
    }
    public static WDataMapper? BuildDataMapper(string SQLServer, string SGBD_USER, string SWGBD_PASSWORD, string BDNAME, int Port = 3306)
    {
        string userSQLConexion = $"Data Source={SQLServer}; Initial Catalog={BDNAME}; User ID={SGBD_USER};Password={SWGBD_PASSWORD};MultipleActiveResultSets=true";
        WDataMapper mapper = new WDataMapper(new SqlServerGDatos(userSQLConexion), new SQLServerQueryBuilder());
        if (SQLM?.GDatos.TestConnection() == false)
        {
            return null;
        }
        return mapper;
    }
}


