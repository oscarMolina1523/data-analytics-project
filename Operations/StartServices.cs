using BusinessLogic.Connection;
using Operations.SyntheticDataGenerator;

namespace Operations;

public class StartServices
{
    public async Task<bool> StartServicesApp()
    {
        try
        {
            Console.Write("############### BEGINNN");
            new BDConnection().InitMainConnection();
            /*new CategoryOperation().Excute();
            new TimeOperation().Excute();
            
            DateOLAPOperation.UpdateLastUpdateDate(DateTime.Now);*/
          
            Console.WriteLine("iniciando gym data sinthetic generator");
            await GymSyntheticDataGeneratorOperation.Start();
            Console.WriteLine("gym data sinthetic generator finalizado");
            Console.Write("############### END");
            return true;
        }
        catch (System.Exception ex)
        {
            Console.WriteLine("error generando data");
            Console.WriteLine(ex.ToString());
            Console.Write(ex.Message);
            throw;
        }
    }

}
