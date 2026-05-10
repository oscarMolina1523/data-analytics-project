
/**
 * @typedef {Object} ObjectOptions 
 *  * @property {Boolean} [AddObject]
	* @property {String} [Url]
	* @property {Function} [SaveFunction]
**/

export class ResponseServices {
	/**
	* @param {Partial<ResponseServices>} [props] 
	*/
	constructor(props) {
		Object.assign(this, props);
	}
	/**@type {Number} */ status
	/**@type {String} */ message
}

/**
* @param {Object.<string, any>} [EditingObject] este objeto es el padre que se esta editando en el formulario y que puede ser utilizado para definir el comportamiento del modelo resultante
* @returns {Object.<string, any>}
*/
function ModelFunction(EditingObject) {
	return {}
}
/**
 * @typedef {Object} ModelProperty 
	* @property {String} type - RADIO | DRAW | PASSWORD |
	CHECKBOX | TEXT | IMG | NUMBER | DATE | EMAIL | FILE 
	| MONEY (se trata como number)| PERCENTAGE (se trata como number)|
	TEL | TEXTAREA | MODEL | MASTERDETAIL | SELECT  | WSELECT | imagecapture 
	CALENDAR | OPERATION (requiere un action para funcionar y toma el valor que retorne el action)
	* @property {Boolean|Function} [hidden] desabilita la propiedad y la oculta
	* @property {TableOptions} [Options] 
	* @property {Boolean} [hiddenInTable] oculta en la tabla
	* @property {Boolean|Function} [require]
	* @property {Boolean} [primary]
	* @property {Boolean|Function} [disabled]
	* @property {String} [label]
	* @property {String} [Currency] para los tipo "MONEY" puede ser cualquier string ejemplo: NIO, C$
	* @property {String} [ForeignKeyColumn] nombre de la llave foranea que enlaza el ModelObject de esta propiedad con la propiedad padre
	* @property {Array} [fileType]
	* @property {{ name: string, action: (EditingObject, form, control, propertyName)=>{}}[]} [ControlAction] botones adicionales que se le agregan al control 
	* @property {String} [pattern]
	* @property {any} [defaultValue]
	* @property {String} [placeholder]
	* @property {Boolean} [hiddenFilter]
	* @property {Boolean} [fullDetail] - esto oculta el detalle del objeto en multiselect(por ahora)
	* @property {String | Number} [min] para rangos de tipo number y date
	* @property {String | Number} [max] para rangos de tipo number y date
	* @property {String} [fieldRequire] CAMBIA UN ESTADO DE UNA PROPIEDAD A REQUERIDO
	* @property {Object | EntityClass | ModelFunction} [ModelObject] si es una funcion, esta podra recibir de forma opcional el EditingObject el cual es el padre que se esta editando en el formulario y que puede ser utilizado para definir el comportamiento del modelo resultante
	* @property { EntityClass | ModelFunction} [EntityModel]
	* @property {Array} [Dataset]
	* @property {Function} [action] Accion adicional que realizara el control cuando exista un cambio de valor recibe como parametro el objeto editado
	* @property {() => { Agenda: Agenda[]; Calendario: Tbl_Calendario[]; }} [CalendarFunction] (obj) => {  }
	* @property {String} [SelfChargeDataset] Si es un WSELECT con el valor de esta propiedad puede usar datos para llenar el desplegable a partir de la entidad padre, es funcional para relaciones recursivas dentro de un master detail
		  * @property {Boolean} [IsGridDisplay] Se  usa para el formulario con propiedades MULTISELECT o WSELECT y despliega una tabla en lugar de un combo
	SE AGREGARA SECCION UTIL PARA CONFIGURAR PROPIEDADES EDITABLES EN COMPONENTES TABLAS
	* @property {Boolean} [IsEditableInGrid]
**/
class ModelProperty {
	IsNumber() {
		return this.type?.toUpperCase() == "NUMBER"
	}
}
/**
 * @typedef {Object} FormConfig 
 *  * @property {Object.<string, any>} [ObjectDetail]
	* @property {Object.<string, any>} [EditObject]
	* @property {Object.<string, any>} [ParentModel]
	* @property {Object.<string, any>} [ParentEntity]
	* @property {Object.<string, any>} [UserActions]
	* @property {Object.<string, any>} [ModelObject]
	* @property {Object.<string, any>} [EntityModel]     
	* @property {Boolean} [DarkMode]
	* @property {Boolean} [AutoSave]
	* @property {Boolean} [WSelectAddObject]
	* @property {Boolean} [DataRequire]    
	* @property {String} [id] 
	* @property {String} [StyleForm] - columnX1 | columnX3 | columnX3   
	* @property {String} [DivColumns] - columnX1 | columnX3 | columnX3 
	* @property {Number} [limit] 
	* @property {Boolean} [Options]
	* @property {ObjectOptions} [ObjectOptions]
	* @property {String} [ImageUrlPath]
	* @property {Function} [SaveFunction]
	* @property {Function} [ValidateFunction]
	* @property {Function} [ProxyAction]
	* @property {HTMLStyleElement} [CustomStyle] 
	**/
class FormConfig { };

/**
 * @typedef {Object} ElementStyle
	 * @property {?String | undefined} [alignContent]
	 * @property {?String | undefined} [alignItems]
	 * @property {?String | undefined} [alignSelf]
	 * @property {?String | undefined} [animation]
	 * @property {?String | undefined} [animationDelay]
	 * @property {?String | undefined} [animationDirection]
	 * @property {?String | undefined} [animationDuration]
	 * @property {?String | undefined} [animationFillMode]
	 * @property {?String | undefined} [animationIterationCount]
	 * @property {?String | undefined} [animationName]
	 * @property {?String | undefined} [animationTimingFunction]
	 * @property {?String | undefined} [animationPlayState]
	 * @property {?String | undefined} [background]
	 * @property {?String | undefined} [backgroundAttachment]
	 * @property {?String | undefined} [backgroundColor]
	 * @property {?String | undefined} [pointerEvents]
	 * @property {?String | undefined} [backgroundImage]
	 * @property {?String | undefined} [backgroundPosition]
	 * @property {?String | undefined} [backgroundRepeat]
	 * @property {?String | undefined} [backgroundClip]
	 * @property {?String | undefined} [backgroundOrigin]
	 * @property {?String | undefined} [backgroundSize]
	 * @property {?String | undefined} [backfaceVisibility]
	 * @property {?String | undefined} [border]
	 * @property {?String | undefined} [borderBottom]
	 * @property {?String | undefined} [borderBottomColor]
	 * @property {?String | undefined} [borderBottomLeftRadius]
	 * @property {?String | undefined} [borderBottomRightRadius]
	 * @property {?String | undefined} [borderBottomStyle]
	 * @property {?String | undefined} [borderBottomWidth]
	 * @property {?String | undefined} [borderCollapse]
	 * @property {?String | undefined} [borderColor]
	 * @property {?String | undefined} [borderImage]
	 * @property {?String | undefined} [borderImageOutset]
	 * @property {?String | undefined} [borderImageRepeat]
	 * @property {?String | undefined} [borderImageSlice]
	 * @property {?String | undefined} [borderImageSource]
	 * @property {?String | undefined} [borderImageWidth]
	 * @property {?String | undefined} [borderLeft]
	 * @property {?String | undefined} [borderLeftColor]
	 * @property {?String | undefined} [borderLeftStyle]
	 * @property {?String | undefined} [borderLeftWidth]
	 * @property {?String | undefined} [borderRadius]
	 * @property {?String | undefined} [borderRight]
	 * @property {?String | undefined} [borderRightColor]
	 * @property {?String | undefined} [borderRightStyle]
	 * @property {?String | undefined} [borderRightWidth]
	 * @property {?String | undefined} [borderSpacing]
	 * @property {?String | undefined} [borderStyle]
	 * @property {?String | undefined} [borderTop]
	 * @property {?String | undefined} [borderTopColor]
	 * @property {?String | undefined} [borderTopLeftRadius]
	 * @property {?String | undefined} [borderTopRightRadius]
	 * @property {?String | undefined} [borderTopStyle]
	 * @property {?String | undefined} [borderTopWidth]
	 * @property {?String | undefined} [borderWidth]
	 * @property {?String | undefined} [bottom]
	 * @property {?String | undefined} [boxDecorationBreak]
	 * @property {?String | undefined} [boxShadow]
	 * @property {?String | undefined} [boxSizing]
	 * @property {?String | undefined} [captionSide]
	 * @property {?String | undefined} [caretColor]
	 * @property {?String | undefined} [clear]
	 * @property {?String | undefined} [clip]
	 * @property {?String | undefined} [color]
	 * @property {?String | undefined} [columnCount]
	 * @property {?String | undefined} [columnFill]
	 * @property {?String | undefined} [columnGap]
	 * @property {?String | undefined} [columnRule]
	 * @property {?String | undefined} [columnRuleColor]
	 * @property {?String | undefined} [columnRuleStyle]
	 * @property {?String | undefined} [columnRuleWidth]
	 * @property {?String | undefined} [columns]
	 * @property {?String | undefined} [columnSpan]
	 * @property {?String | undefined} [columnWidth]
	 * @property {?String | undefined} [content]
	 * @property {?String | undefined} [counterIncrement]
	 * @property {?String | undefined} [counterReset]
	 * @property {?String | undefined} [cursor]
	 * @property {?String | undefined} [direction]
	 * @property {?String | undefined} [display]
	 * @property {?String | undefined} [emptyCells]
	 * @property {?String | undefined} [filter]
	 * @property {?String | undefined} [flex]
	 * @property {?String | undefined} [flexBasis]
	 * @property {?String | undefined} [flexDirection]
	 * @property {?String | undefined} [flexFlow]
	 * @property {?String | undefined} [flexGrow]
	 * @property {?String | undefined} [flexShrink]
	 * @property {?String | undefined} [flexWrap]
	 * @property {?String | undefined} [cssFloat]
	 * @property {?String | undefined} [font]
	 * @property {?String | undefined} [fontFamily]
	 * @property {?String | undefined} [fontSize]
	 * @property {?String | undefined} [fontStyle]
	 * @property {?String | undefined} [fontVariant]
	 * @property {?String | undefined} [fontWeight]
	 * @property {?String | undefined} [fontSizeAdjust]
	 * @property {?String | undefined} [fontStretch]
	 * @property {?String | undefined} [hangingPunctuation]
	 * @property {?String | undefined} [height]
	 * @property {?String | undefined} [hyphens]
	 * @property {?String | undefined} [icon]
	 * @property {?String | undefined} [imageOrientation]
	 * @property {?String | undefined} [isolation]
	 * @property {?String | undefined} [justifyContent]
	 * @property {?String | undefined} [left]
	 * @property {?String | undefined} [letterSpacing]
	 * @property {?String | undefined} [lineHeight]
	 * @property {?String | undefined} [listStyle]
	 * @property {?String | undefined} [listStyleImage]
	 * @property {?String | undefined} [listStylePosition]
	 * @property {?String | undefined} [listStyleType]
	 * @property {?String | undefined} [margin]
	 * @property {?String | undefined} [marginBottom]
	 * @property {?String | undefined} [marginLeft]
	 * @property {?String | undefined} [marginRight]
	 * @property {?String | undefined} [marginTop]
	 * @property {?String | undefined} [maxHeight]
	 * @property {?String | undefined} [maxWidth]
	 * @property {?String | undefined} [minHeight]
	 * @property {?String | undefined} [minWidth]
	 * @property {?String | undefined} [navDown]
	 * @property {?String | undefined} [navIndex]
	 * @property {?String | undefined} [navLeft]
	 * @property {?String | undefined} [navRight]
	 * @property {?String | undefined} [navUp]
	 * @property {?String | undefined} [objectFit]
	 * @property {?String | undefined} [objectPosition]
	 * @property {?String | undefined} [opacity]
	 * @property {?String | undefined} [order]
	 * @property {?String | undefined} [orphans]
	 * @property {?String | undefined} [outline]
	 * @property {?String | undefined} [outlineColor]
	 * @property {?String | undefined} [outlineOffset]
	 * @property {?String | undefined} [outlineStyle]
	 * @property {?String | undefined} [outlineWidth]
	 * @property {?String | undefined} [overflow]
	 * @property {?String | undefined} [overflowX]
	 * @property {?String | undefined} [overflowY]
	 * @property {?String | undefined} [padding]
	 * @property {?String | undefined} [paddingBottom]
	 * @property {?String | undefined} [paddingLeft]
	 * @property {?String | undefined} [paddingRight]
	 * @property {?String | undefined} [paddingTop]
	 * @property {?String | undefined} [pageBreakAfter]
	 * @property {?String | undefined} [pageBreakBefore]
	 * @property {?String | undefined} [pageBreakInside]
	 * @property {?String | undefined} [perspective]
	 * @property {?String | undefined} [perspectiveOrigin]
	 * @property {?String | undefined} [position]
	 * @property {?String | undefined} [quotes]
	 * @property {?String | undefined} [resize]
	 * @property {?String | undefined} [right]
	 * @property {?String | undefined} [scrollBehavior]
	 * @property {?String | undefined} [tableLayout]
	 * @property {?String | undefined} [tabSize]
	 * @property {?String | undefined} [textAlign]
	 * @property {?String | undefined} [textAlignLast]
	 * @property {?String | undefined} [textDecoration]
	 * @property {?String | undefined} [textDecorationColor]
	 * @property {?String | undefined} [textDecorationLine]
	 * @property {?String | undefined} [textDecorationStyle]
	 * @property {?String | undefined} [textIndent]
	 * @property {?String | undefined} [textJustify]
	 * @property {?String | undefined} [textOverflow]
	 * @property {?String | undefined} [textShadow]
	 * @property {?String | undefined} [textTransform]
	 * @property {?String | undefined} [top]
	 * @property {?String | undefined} [transform]
	 * @property {?String | undefined} [transformOrigin]
	 * @property {?String | undefined} [transformStyle]
	 * @property {?String | undefined} [transition]
	 * @property {?String | undefined} [transitiontype]
	 * @property {?String | undefined} [transitionDuration]
	 * @property {?String | undefined} [transitionTimingFunction]
	 * @property {?String | undefined} [transitionDelay]
	 * @property {?String | undefined} [unicodeBidi]
	 * @property {?String | undefined} [userSelect]
	 * @property {?String | undefined} [verticalAlign]
	 * @property {?String | undefined} [visibility]
	 * @property {?String | undefined} [whiteSpace]
	 * @property {?String | undefined} [width]
	 * @property {?String | undefined} [wordBreak]
	 * @property {?String | undefined} [wordSpacing]
	 * @property {?String | undefined} [wordWrap]
	 * @property {?String | undefined} [widows]
	 * @property {?String | undefined} [zIndex]
	 * @property {?String | undefined} [gridTemplateColumns]
	 * @property {?String | undefined} [gridTemplateRows]
	 * @property {?String | undefined} [gridColumn]
	 * @property {?String | undefined} [gridRow]
	 * @property {?String | undefined} [gridGap]
	 */
class ElementStyle { }
/**
 * @typedef {Object} WNode
	 * @property {String} [tagName]
	 * @property {String} [id]
	 * @property {String} [type]
	 * @property {String} [title] 
	 * @property {Partial<CSSStyleDeclaration> | String} [style]
	 * @property {String} [className]
	 * @property {Boolean} [hidden]
	 * @property {String} [class]
	 * @property {String} [name]
	 * @property {String} [htmlFor]
	 * @property {Boolean} [selected]
	 * @property {Boolean} [checked]
	 * @property {Boolean} [multiple]
	 * @property {Boolean} [disabled]
	 * @property {number} [colSpan] 
	 * @property {String} [src]
	 * @property {String} [href]
	 * @property {String} [innerText]    
	 * @property {String | Number} [min]
	 * @property {String | Number} [max]   
	 * @property {String | Number} [value]
	 * @property {String} [innerHTML]
	 * @property {String} [placeholder]
	 * @property {String} [pattern]
	 * @property {Array<HTMLElement | String |Partial<WNode>| Object<string, any> | undefined>} [children]
	 * @property {Function} [onclick] 
	 * @property {Function} [ondragover]
	 * @property {Boolean} [draggable]
	 * @property {Boolean} [require]
	 * @property {Function} [onchange]
	 * @property {Function} [onkeyup]
	 * @property {Function} [ondrop]
	 * @property {Function} [onkeydown]
	 * @property {Function} [onkeypress]
	 * @property {Function} [onload]
	 * @property {Function} [oninput]
	 * @property {Function} [onmouseenter]
	 * @property {Function} [onmouseleave]
	 * @property {Object.<string, any>} [object]
	 * @property {String} [autocomplete]
 **/
class WNode {
	/**
	 * 
	 * @param {*} props 
	 */
	constructor(props = {}) {
		Object.assign(this, props);
	}
}
/**
 * @typedef {Object} Actions 
 * @property {String} name
 * @property {Function} action
 * @property {Function|Boolean} [rendered] funcion que debe retornar true o false
 * **/
/**
 * @typedef {Object} TableOptions 
 *  * @property {Boolean} [AddObject]
	* @property {Boolean} [Show]
	* @property {Boolean} [Filter]
	* @property {Boolean} [AutoSetDate]
	* @property {Boolean} [Edit]
	* @property {Boolean} [FilterDisplay]
	* @property {Boolean} [UseEntityMethods]
	* @property {Boolean} [Delete]
	* @property {Boolean} [Add]
	* @property {Boolean} [Search]
	* @property {Boolean} [Select]
	* @property {Boolean} [MultiSelect] funciona solo cuando select esta habilitado
	* @property {Boolean} [Print]
	* @property {Boolean} [XlsExport]
	* @property {Boolean} [PdfExport]
	* @property {Array<Actions?>} [UserActions]
	* @property {Boolean} [UseManualControlForFiltering] le indica al filtro si debe usar opciones manuales, solo aplica si esta erl filtro activo
	* @property {String} [UrlUpdate]
	* @property {String} [UrlAdd]
	* @property {String} [UrlDelete]
	* @property {String} [UrlSearch]	
	* @property {Function} [AddAction] requiere Add en true, recibe como parametro el elemento y si esta funcion retorna false elimina el objeto agregado de la tabla
	* @property {Function} [EditAction] requiere Edit en true, recibe como parametro el elemento
	* @property {Function} [DeleteAction] requiere Delete en true, recibe como parametro el elemnto
	* @property {Function} [SelectAction] requiere select en true, recibe como parametro el elemnto
	* 
**/

/**
 * @typedef {Object} SearchItemsFromApi 
 * @property {String} [ApiUrl]
 * @property {Function} [action]
 * **/
/**
 * @typedef {Object} TableConfig 
 *  * @property {Array} [Dataset]
	* @property {Array} [selectedItems]
	* @property {Object.<string, any>} [ModelObject]  
	* @property {Boolean} [UseEntityMethods]  
	* @property {Object.<string, any>} [FilterModelObject]
	* @property {Object.<string, any>} [EntityModel] 
	* @property {Object.<string, any>} [ParentModel]  
	* @property {Object.<string, any>} [ParentEntity]
	* @property {Boolean} [WSelectAddObject]
	* @property {Boolean} [DarkMode]
	* @property {Boolean} [paginate] 
	* @property {Boolean} [AddItemsFromApi]
	* @property {Boolean} [AutoSave]
	* @property {Boolean} [isActiveSorts] permite activar los ordenamientos de las columnas
	* @property {Boolean} [isActiveMultiSorts] funciona solo cuando select esta habilitado [isActiveSorts] y permite enviar ordenamientos multiples por peticiones ajax
	* @property {SearchItemsFromApi} [SearchItemsFromApi]
	* @property {String} [TypeMoney] Euro, Dollar, Cordoba
	* @property {Number} [maxElementByPage] 
	* @property {TableOptions} [Options]
	* @property {String} [ImageUrlPath]
	* @property {String} [id]
	* @property {Function} [SaveFunction]
	* @property {String} [icon]   
	* @property {Function} [ValidateFunction]	
	* @property {HTMLStyleElement} [CustomStyle] 
 **/
class TableConfig { };
/**
 * @typedef {Object} ModalConfig 
 *  * @property {Boolean} [ShadowRoot]
	* @property {String} [icon]
	* @property {String} [title]  
	* @property {Boolean} [HeadOptions]    
	* @property {String} [StyleForm]   columnX1 | columnX3 | columnX3
	* @property {String} [ImageUrlPath] 
	* @property {Object.<string, any>} [ModelObject] 
	* @property {Object.<string, any>} [EntityModel] 
	* @property {Object.<string, any>} [ObjectDetail]
	* @property {Object.<string, any>} [EditObject] 
	* @property {Object.<string, any>} [ParentModel]  
	* @property {Object.<string, any>} [ParentEntity]   
	* @property {Array} [UserActions] 
	* @property {ObjectOptions} [ObjectOptions] //recibe las opcions del formulario incluido el SaveFunction si esque existiera alguna
	* @property {Boolean} [AutoSave]
	* @property {Boolean} [WSelectAddObject]
	* @property {Function} [ValidateFunction]
	* @property {Object | WNode | Node} [ObjectModal] nodo o componente html que se dibujara dentro del modal
	* @property {Boolean} [CloseOption]
	* @property {Function} [ProxyAction]
 **/

class ModalConfig {
	// ModelObject = {
	//     property: undefined,
	//     Operation: {
	//         type: "OPERATION", action: (obj) => {
	//             return obj.value1 + obj.value2;
	//         }
	//     }
	// };
}

class FilterData {
	/**
	 * @param {Partial<FilterData>} [props] 
	 */
	constructor(props) {
		Object.assign(this, props);
	}
	/**@type {String}*/ PropName;
	/**@type {String} */ FilterType;
	/**@type {Array<any>}*/ Values;
	/**@type {Array<FilterData>}*/ Filters;

	/**@type {String}*/ JsonPropName;
	/**@type {String}*/ PropSQLType;
	// Static methods

	static In(propName, ...values) {
		return new FilterData({ PropName: propName, FilterType: "in", Values: values.map(v => v?.toString()) });
	}

	static NotIn(propName, ...values) {
		return new FilterData({ PropName: propName, FilterType: "not in", Values: values.map(v => v?.toString()) });
	}

	static Equal(propName, value) {
		if (value === null || value === undefined) {
			throw new Error(`The value cannot be null or undefined for ${propName}`);
		}
		return new FilterData({ PropName: propName, FilterType: "=", Values: [value?.toString()] });
	}

	static Greater(propName, value) {
		return new FilterData({ PropName: propName, FilterType: ">", Values: [value?.toString()] });
	}

	static GreaterEqual(propName, value) {
		return new FilterData({ PropName: propName, FilterType: ">=", Values: [value?.toString()] });
	}

	static Less(propName, value) {
		return new FilterData({ PropName: propName, FilterType: "<", Values: [value?.toString()] });
	}

	static LessEqual(propName, value) {
		return new FilterData({ PropName: propName, FilterType: "<=", Values: [value?.toString()] });
	}

	static Distinct(propName, value) {
		return new FilterData({ PropName: propName, FilterType: "!=", Values: [value?.toString()] });
	}

	static Like(propName, value) {
		return new FilterData({ PropName: propName, FilterType: "like", Values: [value] });
	}

	static Between(propName, value1, value2) {
		return new FilterData({ PropName: propName, FilterType: "BETWEEN", Values: [value1?.toString(), value2?.toString()] });
	}

	static IsNull(propName) {
		return new FilterData({ PropName: propName, FilterType: "IsNull" });
	}

	static NotNull(propName) {
		return new FilterData({ PropName: propName, FilterType: "NotNull" });
	}

	static Or(...conditions) {
		return new FilterData({ FilterType: "or", Filters: conditions });
	}

	static And(...conditions) {
		return new FilterData({ FilterType: "and", Filters: conditions });
	}

	static OrderByAsc(propName) {
		return new FilterData({ PropName: propName, FilterType: "asc" });
	}

	static OrderByDesc(propName) {
		return new FilterData({ PropName: propName, FilterType: "desc" });
	}

	static Paginate(value1, value2) {
		return new FilterData({ FilterType: "paginate", Values: [value1.toString(), value2.toString()] });
	}

	static Limit(value) {
		return new FilterData({ FilterType: "limit", Values: [value.toString()] });
	}

	//json filters
	static JsonPropEqual(propName, jsonPropName, value, type) {
		if (value === null || value === undefined) {
			throw new Error(`The value cannot be null or undefined for ${propName}`);
		}
		return new FilterData({
			PropName: propName,
			JsonPropName: jsonPropName,
			FilterType: "JSONPROP_EQUAL",
			PropSQLType: type,
			Values: [value?.toString()]
		});
	}
}
class OrderData {
	/**
	* @param {Partial<OrdeData>} [props] 
	*/
	constructor(props) {
		Object.assign(this, props);
	}
	PropName;
	OrderType;
	static Asc(propName) {
		return new OrderData({ PropName: propName, OrderType: "ASC" });
	}
	static Desc(propName) {
		return new OrderData({ PropName: propName, OrderType: "DESC" });
	}

}
class ModelFiles {
	constructor(name, value, type) {
		this.Name = name;
		this.Type = type;
		this.Value = value;
	}
	Name = "";
	Value = "";
	Type = "";
}

export {
	WNode,
	ModelFiles,
	ElementStyle,
	FormConfig,
	ModelFunction,
	ModelProperty,
	TableConfig,
	ModalConfig,
	FilterData,
	OrderData
}