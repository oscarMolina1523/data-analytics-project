using APPCORE;
using BusinessLogic.Connection;

namespace Category
{
    class CategoryDIM : EntityClass
    {
        public CategoryDIM()
        {
            this.MDataMapper = new BDConnection().BDDestino;
        }
        [PrimaryKey(Identity = false)]
        public int? Id_Categoria { get; set; }
        public string? Nombre { get; set; }
        public DateTime? UpdateAt { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}