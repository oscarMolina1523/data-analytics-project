using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using APPCORE;
using BusinessLogic.Connection;
using Operations.Time;

namespace Operations
{


    public class ProductEntity : EntityClass
    {
        public ProductEntity()
        {
            this.MDataMapper = new BDConnection().BDOrigen;
        }
        public int Id_Producto { get; set; }
        public string NombreProducto { get; set; }
        public string Marca { get; set; }
        public string Color { get; set; }
        public DateTime UpdateAt { get; set; }
    }


    public class SalesFactQuery : QueryClass
    {

        public SalesFactQuery()
        {
            this.MDataMapper = new BDConnection().BDOrigen;
        }
        // Campos aplanados del JOIN (Header + Detail)
        public int Id_Detalle { get; set; }
        public int Id_Producto { get; set; }
        public DateTime Fecha_Venta { get; set; }
        public int Cantidad { get; set; }
        public decimal MontoBruto { get; set; }
        public decimal Descuento { get; set; }
        public DateTime? UpdateAt { get; set; } // Fecha del Encabezado (para Incremental)     

        public override string GetQuery()
        {
            // Se asume que 'this.UpdateAt' contendrá la fecha de corte
            string lastUpdateDate = this.UpdateAt.HasValue
                ? this.UpdateAt.Value.ToString("yyyy-MM-dd HH:mm:ss")
                : "1900-01-01 00:00:00";

            return $@"
            SELECT
                D.Id_Detalle,
                D.Id_Producto,
                H.Fecha_Venta,
                D.Cantidad,
                D.MontoBruto,
                D.Descuento,
                H.UpdateAt
            FROM
                VENTAS_ENCABEZADO H
            INNER JOIN
                VENTAS_DETALLE D ON H.Id_Venta = D.Id_Venta
            WHERE
                H.UpdateAt > '{lastUpdateDate}'; 
        ";
        }

        // Nota: El método Get<T>() de QueryClass debe ser llamado en la operación
        // para ejecutar el query.
    }

    // Dimensión de Destino para Producto (Dim_Producto)

    public class ProductDIM : EntityClass // Usa Entity para guardar/buscar
    {
        public ProductDIM()
        {
            this.MDataMapper = new BDConnection().BDDestino;
        }
        // Clave Subrogada (DW Key)
        public int ProductoKey { get; set; }

        // Clave Natural (OLTP Key)
        public int Id_Producto_OLTP { get; set; }

        // Atributos Descriptivos
        public string NombreProducto { get; set; }
        public string Marca { get; set; }
        public string Color { get; set; }

        // Atributo de Auditoría
        public DateTime UpdateAt_OLTP { get; set; }
    }


    // Tabla de Hechos de Destino (FACT_VENTAS)
    public class FactVentas : EntityClass // Usa Entity para guardar/buscar
    {
        public FactVentas()
        {
            this.MDataMapper = new BDConnection().BDDestino;
        }
        
        // Foreign Keys
        public int Producto_Key { get; set; }
        public int Fecha_Key { get; set; }

        // Atributo Degenerado
        public int Id_Detalle_OLTP { get; set; }

        // Hechos / Métricas
        public int Cantidad_Vendida { get; set; }
        public decimal Monto_Venta_Neto { get; set; }
    }

    //PRODUCT
    public class ProductOperation
    {
        public void Excute()
        {
            // E: Obtener la fecha de la última carga exitosa
            var lastUpdate = DateOLAPOperation.GetLastUpdatedate();

            // 1. EXTRACT (Incremental - Simple Where)
            List<ProductEntity> productEntities = new ProductEntity().Where<ProductEntity>(
                FilterData.Greater("UpdateAt", lastUpdate)
            );

            // 2. TRANSFORM (Mapeo)
            List<ProductDIM> productDIMs = productEntities.Select(product => new ProductDIM
            {
                Id_Producto_OLTP = product.Id_Producto,
                NombreProducto = product.NombreProducto,
                Marca = product.Marca,
                Color = product.Color,
                UpdateAt_OLTP = product.UpdateAt
            }).ToList();

            // 3. LOAD (Upsert / SCD Tipo 1)
            foreach (var productDim in productDIMs)
            {

                if (productDim.Exists())
                {
                    productDim.ProductoKey = productDim.ProductoKey;
                    productDim.Update();
                }
                else
                {
                    productDim.Save();
                }
            }
        }
    }

    public class SalesFactOperation
    {
        public void Excute()
        {
            // E: Obtener la fecha de la última carga exitosa
            var lastUpdate = DateOLAPOperation.GetLastUpdatedate();

            // 1. EXTRACT (Extracción Compleja usando QueryClass)
            // Se inicializa la QueryClass con el parámetro de corte (UpdateAt)
            var salesQuery = new SalesFactQuery { UpdateAt = lastUpdate };

            // Llama al método Get, que internamente ejecuta el SQL JOIN definido en GetQuery()
            // Se asume que este método existe en la estructura APPCORE/QueryClass
            List<SalesFactQuery> factSourceData = salesQuery.Get<SalesFactQuery>();

            List<FactVentas> factVentasList = new List<FactVentas>();

            // 2. TRANSFORM (Resolución de Claves y Cálculo)
            foreach (var item in factSourceData)
            {
                // Cálculo del hecho
                decimal montoNeto = item.MontoBruto - item.Descuento;

                var fact = new FactVentas
                {
                    Cantidad_Vendida = item.Cantidad,
                    Monto_Venta_Neto = montoNeto,

                    // Atributo Degenerado usa el ID del Detalle
                    Id_Detalle_OLTP = item.Id_Detalle,

                    // **RESOLUCIÓN DE CLAVES (LOOKUP)**

                    // a) Lookup para Dim_Tiempo 
                    Fecha_Key = int.Parse(item.Fecha_Venta.ToString("yyyyMMdd")),

                    // b) Lookup para Dim_Producto 
                    Producto_Key = item.Id_Producto
                };

                factVentasList.Add(fact);
            }

            // 3. LOAD (Insert-Only)
            foreach (var fact in factVentasList)
            {
                fact.Save();
            }

            // 4. Auditoría (Ejemplo)
            // DateOLAPOperation.UpdateLastUpdateDate(DateTime.Now); 
        }
    }

}