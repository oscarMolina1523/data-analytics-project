class ModelObject { 
    /**@type {ModelProperty}*/ Producto = { type: 'text' };
    /**@type {ModelProperty}*/ Sucursal = { type: 'text' };
    /**@type {ModelProperty}*/ Fecha = { type: 'text' };
    /**@type {ModelProperty}*/ SubTotal = { type: 'money' , Currency: "NIO" };
    /**@type {ModelProperty}*/ Descuento = { type: 'money' , Currency: "NIO" };
    /**@type {ModelProperty}*/ Iva = { type: 'money' , Currency: "NIO" };
    /**@type {ModelProperty}*/ Total = { type: 'money' , Currency: "NIO" };
}

 const data = [
    { Producto: 'Laptop', Categoria: 'Electronico A', Tipo: "Tipoa B",  Sucursal: 'Sucursal A', Fecha: '2024-02-01', SubTotal: 1200, Descuento: 20, Iva: 192, Total: 2000 },
    { Producto: 'Smartphone', Categoria: 'Electronico', Tipo: "Tipoa A",  Sucursal: 'Sucursal B', Fecha: '2024-02-02', SubTotal: 800, Descuento: 10, Iva: 128, Total: 928 },
    { Producto: 'Smartphone', Categoria: 'Electronico', Tipo: "Tipoa A",  Sucursal: 'Sucursal B', Fecha: '2024-02-02', SubTotal: 800, Descuento: 10, Iva: 128, Total: 928 },
    { Producto: 'Tablet', Categoria: 'Electronico', Tipo: "Tipoa A",  Sucursal: 'Sucursal A', Fecha: '2024-02-03', SubTotal: 500, Descuento: 20, Iva: 80, Total: 468 },
    { Producto: 'Monitor', Categoria: 'Electronico A', Tipo: "Tipoa A",  Sucursal: 'Sucursal B', Fecha: '2024-02-04', SubTotal: 300, Descuento: 10, Iva: 48, Total: 348 },
    { Producto: 'Monitor', Categoria: 'Electronico A', Tipo: "Tipoa A",  Sucursal: 'Sucursal B', Fecha: '2024-02-04', SubTotal: 300, Descuento: 10, Iva: 48, Total: 348 },
    { Producto: 'Teclado', Categoria: 'Electronico', Tipo: "Tipoa A",  Sucursal: 'Sucursal A', Fecha: '2024-02-05', SubTotal: 50, Descuento: 10, Iva: 8, Total: 58 },
    { Producto: 'Laptop', Categoria: 'Electronico A', Tipo: "Tipoa A",  Sucursal: 'Sucursal B', Fecha: '2024-02-06', SubTotal: 1250, Descuento: 20, Iva: 200, Total: 1150 },
    { Producto: 'Smartphone', Categoria: 'Electronico', Tipo: "Tipoa A",  Sucursal: 'Sucursal A', Fecha: '2024-02-07', SubTotal: 750, Descuento: 10, Iva: 120, Total: 870 },
    { Producto: 'Tablet', Categoria: 'Electronico', Tipo: "Tipoa A",  Sucursal: 'Sucursal B', Fecha: '2024-02-08', SubTotal: 480, Descuento: 20, Iva: 77, Total: 450 },
    { Producto: 'Monitor', Categoria: 'Electronico', Tipo: "Tipoa A",  Sucursal: 'Sucursal A', Fecha: '2024-02-09', SubTotal: 290, Descuento: 10, Iva: 46, Total: 336 },
    { Producto: 'Teclado', Categoria: 'Electronico A', Tipo: "Tipoa A",  Sucursal: 'Sucursal B', Fecha: '2024-02-10', SubTotal: 55, Descuento: 10, Iva: 9, Total: 64 },
    { Producto: 'Laptop', Categoria: 'Electronico', Tipo: "Tipoa B",  Sucursal: 'Sucursal A', Fecha: '2024-02-11', SubTotal: 1300, Descuento: 20, Iva: 208, Total: 1192 },
    { Producto: 'Smartphone', Categoria: 'Electronico', Tipo: "Tipoa A",  Sucursal: 'Sucursal B', Fecha: '2024-02-12', SubTotal: 820, Descuento: 10, Iva: 131, Total: 951 },
    { Producto: 'Tablet', Categoria: 'Electronico A', Tipo: "Tipoa B",  Sucursal: 'Sucursal A', Fecha: '2024-02-13', SubTotal: 510, Descuento: 20, Iva: 82, Total: 478 },
    { Producto: 'Monitor', Categoria: 'Electronico', Tipo: "Tipoa A",  Sucursal: 'Sucursal B', Fecha: '2024-02-14', SubTotal: 310, Descuento: 10, Iva: 50, Total: 360 },
    { Producto: 'Teclado', Categoria: 'Electronico A', Tipo: "Tipoa B",  Sucursal: 'Sucursal A', Fecha: '2024-02-15', SubTotal: 60, Descuento: 10, Iva: 10, Total: 70 },
    { Producto: 'Laptop', Categoria: 'Electronico', Tipo: "Tipoa A",  Sucursal: 'Sucursal B', Fecha: '2024-02-16', SubTotal: 1350, Descuento: 20, Iva: 216, Total: 1220 },
    { Producto: 'Smartphone', Categoria: 'Electronico', Tipo: "Tipoa A",  Sucursal: 'Sucursal A', Fecha: '2024-02-17', SubTotal: 830, Descuento: 10, Iva: 133, Total: 963 },
    { Producto: 'Tablet', Categoria: 'Electronico A', Tipo: "Tipoa B",  Sucursal: 'Sucursal B', Fecha: '2024-02-18', SubTotal: 520, Descuento: 20, Iva: 83, Total: 487 },
    { Producto: 'Monitor', Categoria: 'Electronico', Tipo: "Tipoa A",  Sucursal: 'Sucursal A', Fecha: '2024-02-19', SubTotal: 320, Descuento: 10, Iva: 51, Total: 371 },
    { Producto: 'Teclado', Categoria: 'Electronico', Tipo: "Tipoa A",  Sucursal: 'Sucursal B', Fecha: '2024-02-20', SubTotal: 65, Descuento: 10, Iva: 11, Total: 76 }
];
export { data, ModelObject }