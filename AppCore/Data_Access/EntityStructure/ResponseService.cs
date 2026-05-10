

namespace APPCORE
{
    public class ResponseService
    {
        public ResponseService() { }
        public ResponseService(int? status, string? message)
        {
            this.status = status;
            this.message = message;
        }
        public ResponseService(int? status, string? message, object? body)
        {
            this.status = status;
            this.message = message;
            this.body = body;
        }
        public ResponseService(int? status, string? message, string? value)
        {
            this.status = status;
            this.message = message;
            this.value = value;
        }
         public ResponseService(int? status, string? message, string? value, object? body)
        {
            this.status = status;
            this.message = message;
            this.value = value;
            this.body = body;
        }
        public int? status { get; set; }
        public string? message { get; set; }
        public string? value { get; set; }
        public object? body { get; set; }
    }
}