using APPCORE;
using BusinessLogic.Connection;

namespace Category
{
    class CategoryEntity: EntityClass
    {
        public CategoryEntity()
        {
            this.MDataMapper = new BDConnection().BDOrigen;
        }
        [PrimaryKey(Identity = true)]
        public int? Id_Categoria { get; set; }
        public string? Nombre { get; set; }        
        public DateTime? UpdateAt { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
