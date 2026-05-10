namespace APPCORE.Services
{
    public class SessionData:EntityClass
    {
        [PrimaryKey]
        public int? Id { get; set;}
        public string? KeyName { get; set; }
        public string? Value { get; set; }        
        public string? idetify { get; set; }
        public DateTime? created { get; set; }
        public DateTime ExpireTime { get; set; }
    }
}