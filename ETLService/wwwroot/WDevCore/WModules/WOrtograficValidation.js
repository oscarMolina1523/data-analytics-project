class WOrtograficValidation {
    /**
     * 
     * @param {String} val 
     * @returns {String}
     */
    static es = (val = "") => {
        try {
            val = val.toString().replaceAll("_id", "")
                .replaceAll("Tbl_", "")
                .replaceAll("_ModelComponent", " ")
                .replaceAll("Tbl_", "")
                .replaceAll("Tbl_", "")
                .replaceAll("Cat_", "")
                .replaceAll("Catalogo_", "")
                .replaceAll("catalogo_", "")
                .replaceAll("Transaction_", "")
                .replaceAll("transaction_", "")
                .replaceAll("Relational_", "")
                .replaceAll("relational_", "")
                .replaceAll("cat_", "")
                .replaceAll("tbl_", "")
                .replaceAll("Tbl", "")
                .replaceAll("tbl", "")
                .replaceAll("id_", "")
                .replaceAll("Id_", "")
                //.replaceAll("_Id", "")
                .replaceAll("_", " ");
            const words = val.split(" ");
            let valReturn = "";
            words.forEach((word, index) => {
                const valUper = word.toUpperCase();
                const validate = this.spanish.find(v => v.error.find(e => e == valUper));
                if (index > 0) {
                    valReturn += " ";
                }
                if (validate != null) {
                    valReturn += validate.value;
                } else {
                    valReturn += word;
                }
            });
            return valReturn;
        } catch (error) {
            console.log(error);
            console.log(val);
            return "";
        }   

    }

    static spanish = [
        // Errores comunes de acentuación
        { error: ["INSTITUCION", "INSTITUSION"], value: "institución" },
        { error: ["FINALIZACION"], value: "finalización" },
        { error: ["PAIS"], value: "país" },
        { error: ["PSICOLOGO"], value: "psicólogo" },
        { error: ["TELEFONO"], value: "teléfono" },
        { error: ["DNI"], value: "DNI" },
        { error: ["DIRECCION"], value: "dirección" },
        { error: ["VALORACION"], value: "valoración" },
        { error: ["CODIGO"], value: "código" },
        { error: ["TITULO"], value: "título" },
        { error: ["GENERO"], value: "género" },
        { error: ["DESCRIPCION"], value: "descripción" },
        { error: ["EMPENO"], value: "empeño" }, 
        { error: ["TRANSACCION", "Transaccion"], value: "transacción" },
        { error: ["CORDOBAS", "CORDOBA"], value: "C$" },
        { error: ["DOLARES", "DOLAR"], value: "$" },
        { error: ["IDENTIFICACION"], value: "identificación" },
        { error: ["CLASIFICACION"], value: "clasificación" },
        { error: ["INTERES"], value: "interés" },
        { error: ["APELLIDIO"], value: "apellido" },  
        { error: ["FECHANAC"], value: "fecha de nacimiento" },    
        { error: ["EMPENO"], value: "empeño" },    
        { error: ["VEHICULO"], value: "vehículo" },  
        { error: ["GUIA"], value: "guía" }, 
        { error: ["REGION"], value: "región" }, 
        { error: ["RELIGION"], value: "religión" }, 

        // Errores comunes de escritura (b/v, s/c, y/ll, etc.)
        { error: ["HABER", "ABER"], value: "haber" }, // Confusión entre "haber" y "a ver"
        { error: ["HASTA", "ASTA"], value: "hasta" }, // Confusión entre "hasta" y "asta"
        { error: ["HECHO", "ECHO"], value: "hecho" }, // Confusión entre "hecho" y "echo"
        { error: ["HOLA", "OLA"], value: "hola" }, // Confusión entre "hola" y "ola"
        { error: ["HAYA", "AYA", "ALLA"], value: "haya" }, // Confusión entre "haya", "aya" y "allá"
        { error: ["VALLADO", "BAYADO"], value: "vallado" }, // Confusión entre "vallado" y "bayado"
        { error: ["VACILAR", "BACILAR"], value: "vacilar" }, // Confusión entre "vacilar" y "bacilar"
        { error: ["VASO", "BASO"], value: "vaso" }, // Confusión entre "vaso" y "baso"
        { error: ["CIEN", "SIEN"], value: "cien" }, // Confusión entre "cien" y "sien"
        { error: ["CASA", "CAZA"], value: "casa" }, // Confusión entre "casa" y "caza"
        { error: ["COSA", "COZA"], value: "cosa" }, // Confusión entre "cosa" y "coza"
        { error: ["CIELO", "SIELO"], value: "cielo" }, // Confusión entre "cielo" y "sielo"
        { error: ["CEREAL", "SEREAL"], value: "cereal" }, // Confusión entre "cereal" y "sereal"
        { error: ["YEMA", "LLEMA"], value: "yema" }, // Confusión entre "yema" y "llema"
        { error: ["YERRO", "LLERRO"], value: "yerro" }, // Confusión entre "yerro" y "llerro"
        { error: ["YATE", "LLATE"], value: "yate" }, // Confusión entre "yate" y "llate"

        // Errores comunes de mayúsculas y minúsculas
        { error: ["NICARAGUA", "Nicaragua"], value: "Nicaragua" }, // Asegurar mayúscula inicial
        { error: ["MANAGUA", "Managua"], value: "Managua" }, // Asegurar mayúscula inicial
        { error: ["ESPAÑOL", "Español"], value: "español" }, // Asegurar minúscula inicial
        { error: ["INGLES", "Inglés"], value: "inglés" }, // Asegurar minúscula inicial

        // Errores comunes de plurales y singulares
        { error: ["MESES", "MES"], value: "meses" }, // Plural correcto
        { error: ["ANOS", "AÑOS"], value: "años" }, // Plural correcto
        { error: ["DIAS", "DÍA"], value: "días" }, // Plural correcto

        // Errores comunes de palabras compuestas
        { error: ["PARAGUAS", "PARA AGUAS"], value: "paraguas" }, // Palabra compuesta
        { error: ["SACAPUNTAS", "SACA PUNTAS"], value: "sacapuntas" }, // Palabra compuesta
        { error: ["LIMPIABOTAS", "LIMPIA BOTAS"], value: "limpiabotas" }, // Palabra compuesta

        // Errores comunes de palabras homófonas
        { error: ["HABER", "A VER"], value: "haber" }, // Confusión entre "haber" y "a ver"
        { error: ["HAY", "AHÍ", "AY"], value: "hay" }, // Confusión entre "hay", "ahí" y "ay"
        { error: ["HOLA", "OLA"], value: "hola" }, // Confusión entre "hola" y "ola"
        { error: ["HECHO", "ECHO"], value: "hecho" }, // Confusión entre "hecho" y "echo"
        { error: ["HASTA", "ASTA"], value: "hasta" }, // Confusión entre "hasta" y "asta"

        // Errores comunes de palabras extranjeras
        { error: ["EMAIL", "E-MAIL"], value: "correo electrónico" }, // Traducción al español
        { error: ["OK", "OKEY"], value: "bien" }, // Traducción al español
        { error: ["CHAT", "CHATEAR"], value: "charla" }, // Traducción al español
        { error: ["ARTICULO"], value: "artículo" },
        { error: ["ARTICULOS"], value: "artículos" },
];
}

export { WOrtograficValidation };