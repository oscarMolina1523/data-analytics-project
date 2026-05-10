using APPCORE;
using Category;

namespace Operations.Category
{
    public class CategoryOperation
    {
        public void Excute()
        {            
            //EXTRACT 
            /*Cambiaremos el metodo get por el metodo where
            donde pondremos por filtro que solo tome los ultimos registros actualizados*/
            List<CategoryEntity> categoryEntities = new CategoryEntity().Where<CategoryEntity>(
                FilterData.Greater("UpdateAt", DateOLAPOperation.GetLastUpdatedate())
            );
            categoryEntities = new CategoryEntity().Get<CategoryEntity>();
            //TRANSFORM
            List<CategoryDIM> categoryDIMs = categoryEntities.Select(category => new CategoryDIM { 
                Id_Categoria = category.Id_Categoria,
                Nombre = category.Nombre,
            }).ToList();
            //LOAD
            foreach (var categoryDim in categoryDIMs)
            {
                /*
                agregaremos comprobacion para realizar guardado o
                posibles actualizacions de modelos al momento de 
                cargar los datos (en este ejemplo solo evitamos el guardado)
                */
                if (categoryDim.Exists())
                {
                    continue;
                }
                categoryDim.Save();
            }
        }
    }

   
}