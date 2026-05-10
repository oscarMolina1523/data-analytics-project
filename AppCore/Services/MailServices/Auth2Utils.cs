namespace APPCORE.Services;
public class Auth2Utils
{
    public static async Task<AccessTokenModel> GetAccessTokenAsync(MailConfig mailConfig)
    {
        string url = $"https://login.microsoftonline.com/{mailConfig.TENAT}/oauth2/v2.0/token";
        var data = new Dictionary<string, string>
            {
                {"grant_type", "client_credentials"},
                {"scope", "https://outlook.office365.com/.default"},
                {"client_id",  mailConfig.CLIENT},
                {"client_secret", mailConfig.CLIENT_SECRET}
            };
        using (HttpClient client = new()) 
        {
            var response = await client.PostAsync(url, new FormUrlEncodedContent(data));
            return await response.Content.ReadAsAsync<AccessTokenModel>();
        }        
    }
}