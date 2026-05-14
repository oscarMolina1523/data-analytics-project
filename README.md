INSTALACION

clonar con todos los submodulos: ´´git clone --recurse-submodules -j8 https://github.com/Wilber1987/DATA_ANALITIC_EXAMPLE_API.git ´´

git submodule add https://github.com/Wilber1987/AppCore.git AppCore

para correr alguno de los proyectos sin tener que estar especificando archivo , puede seguir los siguientes pasos

```bash
#entrar en el proyecto que se desa ejecutar , en este ejemplo sera el ETLService
cd ETLService

#correr el siguiente comando, que levantara el proyecto en el que nos encontramos
dotnet watch run

#en caso de que estes teniendo problemas al levantarlo , por tema de testeo de conexion
#solo debes comentarear la siguiente linea en el archivo Program.cs y correr nuevamente la 
#linea anterior
await new StartServices().StartServicesApp();

#en caso de que en el archivo appsettings.json no tengas 
#la conexion a tu base de datos puedes usar esta 
"ConnectionStrings": {"DefaultConnection": "Server=.,1433;Database=mydb;Trusted_Connection=True;TrustServerCertificate=True;"}

```

Una vez que el servicio este corriendo , puedes ver los html haciendo uso del
localhost y el puerto que se te asigne, y siguiendo una ruta logica
a continuacion el ejemplo
```bash
http://localhost:5169/WDevCore/WSite/Prototype/barchart.html
```