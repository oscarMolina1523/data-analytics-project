using Newtonsoft.Json;

namespace APPCORE.Services
{
    public class SessionServices
    {
        public static List<SessionData> SessionDatas = [];
        public static void Set(string key, Object value, string sessionKey)
        {
            var find = SessionDatas.Find(x => x.KeyName!.Equals(key) && x.idetify!.Equals(sessionKey));
            if (find != null)
            {
                SessionDatas.Remove(find);
            }
            SessionDatas.Add(new SessionData()
            {
                KeyName = key,
                Value = System.Text.Json.JsonSerializer.Serialize(value),
                created = DateTime.Now,
                idetify = sessionKey
            });
        }

        public static T? Get<T>(string key, string? sessionKey)
        {
            var find = SessionDatas.Find(x => x.KeyName!.Equals(key) && x.idetify!.Equals(sessionKey));
            return find == null ? default : JsonConvert.DeserializeObject<T>(find.Value ?? "{}");
                //System.Text.Json.JsonSerializer.Deserialize<T>(find.Value);
        }

        public static void ClearSeason(string sessionKey)
        {
            SessionDatas.RemoveAll(x => x.idetify!.Equals(sessionKey));
        }
        // ✅ Limpia sesiones expiradas automáticamente
        public static void ClearExpiredSessions()
        {
            DateTime now = DateTime.UtcNow;
            SessionDatas.RemoveAll(x => x.ExpireTime < now);
        }
    }

}