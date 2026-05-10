using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.Text.RegularExpressions;
namespace APPCORE.Services;

public static class NumberUtility
{
	public static string NumeroALetras(double? numberAsString, bool isMoney = true, string currency = "")
	{
		//creamos el objeto
		Moneda oMoneda = new Moneda();
		//primer parametro es la cantidad en string
		//segundo parametro es si queremos que sea mayuscula
		//tercer parametro la moneda
		return oMoneda.Convertir(isMoney
			? Math.Round((decimal)numberAsString, 2).ToString("0.00")
			: Math.Round((decimal)numberAsString, 2).ToString(), false, currency);

	}
	public static string NumeroALetras(this decimal numberAsString)
	{
		string dec = "";
		var entero = Convert.ToInt64(Math.Truncate(numberAsString));
		var decimales = Convert.ToInt32(Math.Round((numberAsString - entero) * 100, 2));
		if (decimales > 0)
		{
			//dec = " PESOS CON " + decimales.ToString() + "/100";
			//dec = $"{decimales}";
		}
		//Código agregado por mí
		else
		{
			//dec = " PESOS CON " + decimales.ToString() + "/100";
			//dec = $"{decimales}";
		}
		var res = NumeroALetrasD(Convert.ToDouble(entero)) + dec;
		return res.ToLower();
	}
	private static string NumeroALetrasD(double value)
	{
		string num2Text; value = Math.Truncate(value);
		if (value == 0) num2Text = "CERO";
		else if (value == 1) num2Text = "UNO";
		else if (value == 2) num2Text = "DOS";
		else if (value == 3) num2Text = "TRES";
		else if (value == 4) num2Text = "CUATRO";
		else if (value == 5) num2Text = "CINCO";
		else if (value == 6) num2Text = "SEIS";
		else if (value == 7) num2Text = "SIETE";
		else if (value == 8) num2Text = "OCHO";
		else if (value == 9) num2Text = "NUEVE";
		else if (value == 10) num2Text = "DIEZ";
		else if (value == 11) num2Text = "ONCE";
		else if (value == 12) num2Text = "DOCE";
		else if (value == 13) num2Text = "TRECE";
		else if (value == 14) num2Text = "CATORCE";
		else if (value == 15) num2Text = "QUINCE";
		else if (value < 20) num2Text = "DIECI" + NumeroALetras(value - 10);
		else if (value == 20) num2Text = "VEINTE";
		else if (value < 30) num2Text = "VEINTI" + NumeroALetras(value - 20);
		else if (value == 30) num2Text = "TREINTA";
		else if (value == 40) num2Text = "CUARENTA";
		else if (value == 50) num2Text = "CINCUENTA";
		else if (value == 60) num2Text = "SESENTA";
		else if (value == 70) num2Text = "SETENTA";
		else if (value == 80) num2Text = "OCHENTA";
		else if (value == 90) num2Text = "NOVENTA";
		else if (value < 100) num2Text = NumeroALetras(Math.Truncate(value / 10) * 10) + " Y " + NumeroALetras(value % 10);
		else if (value == 100) num2Text = "CIEN";
		else if (value < 200) num2Text = "CIENTO " + NumeroALetras(value - 100);
		else if ((value == 200) || (value == 300) || (value == 400) || (value == 600) || (value == 800)) num2Text = NumeroALetras(Math.Truncate(value / 100)) + "CIENTOS";
		else if (value == 500) num2Text = "QUINIENTOS";
		else if (value == 700) num2Text = "SETECIENTOS";
		else if (value == 900) num2Text = "NOVECIENTOS";
		else if (value < 1000) num2Text = NumeroALetras(Math.Truncate(value / 100) * 100) + " " + NumeroALetras(value % 100);
		else if (value == 1000) num2Text = "MIL";
		else if (value < 2000) num2Text = "MIL " + NumeroALetras(value % 1000);
		else if (value < 1000000)
		{
			num2Text = NumeroALetras(Math.Truncate(value / 1000)) + " MIL";
			if ((value % 1000) > 0)
			{
				num2Text = num2Text + " " + NumeroALetras(value % 1000);
			}
		}
		else if (value == 1000000)
		{
			num2Text = "UN MILLON";
		}
		else if (value < 2000000)
		{
			num2Text = "UN MILLON " + NumeroALetras(value % 1000000);
		}
		else if (value < 1000000000000)
		{
			num2Text = NumeroALetras(Math.Truncate(value / 1000000)) + " MILLONES ";
			if ((value - Math.Truncate(value / 1000000) * 1000000) > 0)
			{
				num2Text = num2Text + " " + NumeroALetras(value - Math.Truncate(value / 1000000) * 1000000);
			}
		}
		else if (value == 1000000000000) num2Text = "UN BILLON";
		else if (value < 2000000000000) num2Text = "UN BILLON " + NumeroALetras(value - Math.Truncate(value / 1000000000000) * 1000000000000);
		else
		{
			num2Text = NumeroALetras(Math.Truncate(value / 1000000000000)) + " BILLONES";
			if ((value - Math.Truncate(value / 1000000000000) * 1000000000000) > 0)
			{
				num2Text = num2Text + " " + NumeroALetras(value - Math.Truncate(value / 1000000000000) * 1000000000000);
			}
		}
		return num2Text;
	}
	public static String ConvertToMoneyString(double? cuotafija)
	{
		//CultureInfo cultura = new CultureInfo("es-ES"); 
		//return cuotafija.GetValueOrDefault().ToString("#,##0.00", cultura); 
		return cuotafija.GetValueOrDefault().ToString("#,##0.00", CultureInfo.GetCultureInfo("es-ES"))
			.Replace(",", "|").Replace(".", ",").Replace("|", "."); ;
	}
	public static string ObtenerEnumeracion(int numero)
    {
		if (numero == 0)
		{
			numero = 1;
		}
        if (numero < 1 || numero > 30)
            throw new ArgumentOutOfRangeException("El número debe estar entre 1 y 30");

        string[] unidades = { "primer", "segundo", "tercer", "cuarto", "quinto", "sexto", "séptimo", "octavo", "noveno", "décimo" };
        string[] decenas = { "décimo", "vigésimo", "trigésimo" };

        if (numero <= 10)
        {
            return unidades[numero - 1];
        }
        else if (numero <= 20)
        {
            return "décimo " + unidades[numero - 11];
        }
        else if (numero <= 30)
        {
            return "vigésimo " + unidades[numero - 21];
        }

        // Solo hasta el número 30, así que no es necesario manejar más casos.
        return string.Empty;
    }
    public static string ToRoman(int num)
	{
		string[] roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
		return roman[num - 1];
	}

}

public class Moneda
{
	private String[] UNIDADES = { "", "un ", "dos ", "tres ", "cuatro ", "cinco ", "seis ", "siete ", "ocho ", "nueve " };
	private String[] DECENAS = {"diez ", "once ", "doce ", "trece ", "catorce ", "quince ", "dieciseis ",
		"diecisiete ", "dieciocho ", "diecinueve", "veinte ", "treinta ", "cuarenta ",
		"cincuenta ", "sesenta ", "setenta ", "ochenta ", "noventa "};
	private String[] CENTENAS = {"", "ciento ", "doscientos ", "trecientos ", "cuatrocientos ", "quinientos ", "seiscientos ",
		"setecientos ", "ochocientos ", "novecientos "};

	private Regex r;

	public String Convertir(String numero, bool mayusculas, string moneda = "PESOS")
	{

		String literal = "";
		String parte_decimal;
		//si el numero utiliza (.) en lugar de (,) -> se reemplaza
		numero = numero.Replace(".", ",");

		//si el numero no tiene parte decimal, se le agrega ,00
		if (numero.IndexOf(",") == -1)
		{
			numero = numero + ",00";
		}
		//se valida formato de entrada -> 0,00 y 999 999 999,00
		r = new Regex(@"\d{1,9},\d{1,2}");
		MatchCollection mc = r.Matches(numero);
		if (mc.Count > 0)
		{
			//se divide el numero 0000000,00 -> entero y decimal
			String[] Num = numero.Split(',');

			string MN = " M.N.";
			if (moneda != "PESOS")
				MN = moneda;

			//de da formato al numero decimal
			//parte_decimal = moneda + " " + Num[1] + "/100" + MN;
			//se convierte el numero a literal
			literal = buildLiteral(Num[0]);
			parte_decimal = buildLiteral(Num[1]);
			parte_decimal = $" {moneda} con {parte_decimal} centavos";
			//devuelve el resultado en mayusculas o minusculas
			if (mayusculas)
			{
				return (literal + parte_decimal).ToUpper();
			}
			else
			{
				return (literal + parte_decimal);
			}
		}
		else
		{//error, no se puede convertir
			return literal = null;
		}
	}

	private string buildLiteral(string Num)
	{
		string literal;
		if (int.Parse(Num) == 0)
		{//si el valor es cero
			literal = "cero ";
		}
		else if (int.Parse(Num) > 999999)
		{//si es millon
			literal = getMillones(Num);
		}
		else if (int.Parse(Num) > 999)
		{//si es miles
			literal = getMiles(Num);
		}
		else if (int.Parse(Num) > 99)
		{//si es centena
			literal = getCentenas(Num);
		}
		else if (int.Parse(Num) > 9)
		{//si es decena
			literal = getDecenas(Num);
		}
		else
		{//sino unidades -> 9
			literal = getUnidades(Num);
		}

		return literal;
	}

	/* funciones para convertir los numeros a literales */

	private String getUnidades(String numero)
	{   // 1 - 9
		//si tuviera algun 0 antes se lo quita -> 09 = 9 o 009=9
		String num = numero.Substring(numero.Length - 1);
		return UNIDADES[int.Parse(num)];
	}

	private String getDecenas(String num)
	{// 99
		int n = int.Parse(num);
		if (n < 10)
		{//para casos como -> 01 - 09
			return getUnidades(num);
		}
		else if (n > 19)
		{//para 20...99
			String u = getUnidades(num);
			if (u.Equals(""))
			{ //para 20,30,40,50,60,70,80,90
				return DECENAS[int.Parse(num.Substring(0, 1)) + 8];
			}
			else
			{
				return DECENAS[int.Parse(num.Substring(0, 1)) + 8] + "y " + u;
			}
		}
		else
		{//numeros entre 11 y 19
			return DECENAS[n - 10];
		}
	}

	private String getCentenas(String num)
	{// 999 o 099
		if (int.Parse(num) > 99)
		{//es centena
			if (int.Parse(num) == 100)
			{//caso especial
				return " cien ";
			}
			else
			{
				return CENTENAS[int.Parse(num.Substring(0, 1))] + getDecenas(num.Substring(1));
			}
		}
		else
		{//por Ej. 099
		 //se quita el 0 antes de convertir a decenas
			return getDecenas(int.Parse(num) + "");
		}
	}

	private String getMiles(String numero)
	{// 999 999
	 //obtiene las centenas
		String c = numero.Substring(numero.Length - 3);
		//obtiene los miles
		String m = numero.Substring(0, numero.Length - 3);
		String n = "";
		//se comprueba que miles tenga valor entero
		if (int.Parse(m) > 0)
		{
			n = getCentenas(m);
			return n + " mil " + getCentenas(c);
		}
		else
		{
			return "" + getCentenas(c);
		}

	}

	private String getMillones(String numero)
	{ //000 000 000
	  //se obtiene los miles
		String miles = numero.Substring(numero.Length - 6);
		//se obtiene los millones
		String millon = numero.Substring(0, numero.Length - 6);
		String n = "";
		if (millon.Length > 1)
		{
			n = getCentenas(millon) + "millones ";
		}
		else
		{
			n = getUnidades(millon) + "millon ";
		}
		return n + getMiles(miles);
	}

}