class WImports {
    static importarScript = async(name, UrlPath = "") => {
        var s = document.createElement("script");
        s.src = UrlPath + name;
        document.querySelector("head").appendChild(s);
    }
    static importarScriptModule = async(name, UrlPath = "") => {
        var s = document.createElement("script");
        s.src = UrlPath + name;
        s.type = "module";
        document.querySelector("head").appendChild(s);
    }
    static importarStyle = async(name, UrlPath = "") => {
        var s = document.createElement("link");
        s.href = UrlPath + name;
        s.rel = "stylesheet";
        document.querySelector("head").appendChild(s);
    }
    static awaitFunction = async() => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(0);
            }, 0);
        });
    }
}
const Url_Path = "";
const LoadWExpDev = async() => {
    //AGREGAR LOS SCRIPTS
    WImports.importarScript("./WDevCore/WModules/WComponents.js", Url_Path);
    WImports.importarScript("./WDevCore/WModules/WComponentsTools.js", Url_Path);
    WImports.importarScript("./WDevCore/WModules/WStyledRender.js", Url_Path);
}
WImports.importarStyle("./WDevCore/StyleModules/StyleModules.css", Url_Path);
WImports.importarStyle("./WDevCore/StyleModules/WchartStyle.css", Url_Path);
WImports.importarStyle("./WDevCore/StyleModules/MultiSelectStyle.css", Url_Path);
//LoadWExpDev();