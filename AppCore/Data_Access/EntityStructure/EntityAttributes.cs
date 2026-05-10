using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace APPCORE
{
    /*
       * @param {KeyColumn} Nombre de la llave primaria de la tabla con cardinalidad uno
       * esta propiedad hace referencias al identificador primario de la tabla
       * con cardinalidad 1 y sera el valor que se agregara a la entidad con 
       * cardinalidad muchos
       */
    public class PrimaryKey : Attribute
    {
        public bool Identity { get; set; }
    }
    public class JsonProp : Attribute
    {
    }
    public class OneToMany : Attribute
    {
        public string TableName { get; set; }
        public string KeyColumn { get; set; }
        public string ForeignKeyColumn { get; set; }
    }
    public class ManyToOne : Attribute
    {
        public string TableName { get; set; }
        public string KeyColumn { get; set; }
        public string ForeignKeyColumn { get; set; }
        public bool isView { get; set; }
    }
    public class OneToOne : Attribute
    {
        public string TableName { get; set; }
        public string KeyColumn { get; set; }
        public string ForeignKeyColumn { get; set; }
    }
    public class ManyToMany : Attribute
    {
        public string TableName { get; set; }
        public string KeyColumn { get; set; }
        public string ForeignKeyColumn { get; set; }
    }

    //DATA MODELS
    public class EntitySchema
    {
        public string TABLE_NAME { get; set; }
        public string TABLE_SCHEMA { get; set; }
        public string TABLE_TYPE { get; set; }
    }
    public class OneToOneSchema
    {
        public string TABLE_NAME { get; set; }
        public string CONSTRAINT_COLUMN_NAME { get; set; }
        public string REFERENCE_TABLE_NAME { get; set; }
        public string REFERENCE_COLUMN_NAME { get; set; }
    }
    public class OneToManySchema
    {
        public string PKTABLE_NAME { get; set; }
        public string PKCOLUMN_NAME { get; set; }
        public string FKTABLE_NAME { get; set; }
        public string FKCOLUMN_NAME { get; set; }

    }

    public class EntityProps
    {
        public string COLUMN_NAME { get; set; }
        public string DATA_TYPE { get; set; }
        public string IS_NULLABLE { get; set; }
        public string TABLE_SCHEMA { get; set; }
        public string TABLE_NAME { get; set; }
    }
    public class EntityColumn
    {
        public string TABLE_NAME { get; set; }
        public string COLUMN_NAME { get; set; }
        public string TYPE_NAME { get; set; }
    }

}
