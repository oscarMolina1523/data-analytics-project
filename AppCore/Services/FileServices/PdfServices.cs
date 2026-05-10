using System;
using System.IO;
using System.Collections.Generic;
using iText.Html2pdf;
using iText.Kernel.Pdf;
using iText.Kernel.Events;
using iText.Layout;
using iText.Layout.Element;
using iText.Kernel.Geom;
using iText.Kernel.Pdf.Canvas;
using iText.Layout.Properties;

namespace APPCORE.Services
{
	public class PdfService
	{
		public static byte[] ConvertHtmlToPdf(string htmlContent, string? pageType = "a4", string? headerHtml = null, string? footerHtml = null)
		{
			using (var memoryStream = new MemoryStream())
			{
				PdfWriter writer = new PdfWriter(memoryStream);
				PdfDocument pdfDocument = new PdfDocument(writer);

				// Obtener el tamaño de la página según el tipo indicado
				PageSize pageSize = GetPageSize(pageType);
				pdfDocument.SetDefaultPageSize(pageSize);

				// Definir la altura del encabezado y el pie de página
				float headerHeight = 120; // Ajusta este valor según el tamaño de tu encabezado
				float footerHeight = 40;  // Ajusta este valor según el tamaño de tu pie de página

				// Establecer márgenes para el contenido principal
				Document document = new Document(pdfDocument);
				document.SetMargins(headerHeight, 0, footerHeight, 0);

				// Agregar evento para encabezado y pie de página
				pdfDocument.AddEventHandler(PdfDocumentEvent.END_PAGE, new HeaderFooterEventHandler(document, headerHtml, footerHtml, pageSize, headerHeight, footerHeight));

				// Convertir el HTML en contenido PDF
				ConverterProperties properties = new ConverterProperties();
				HtmlConverter.ConvertToPdf(htmlContent, pdfDocument, properties);

				document.Close();
				return memoryStream.ToArray();
			}
		}

		/*public async Task<byte[]> GeneratePdfWithPlaywright(string htmlContent, string? pageType)
		{
			using var playwright = await Playwright.CreateAsync();
			await using var browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions { Headless = true });
			var page = await browser.NewPageAsync();
			await page.SetContentAsync(htmlContent);
			var pdfStream = await page.PdfStreamAsync(new PagePdfOptions { Format =  pageType ?? "A4"  });
			using var memoryStream = new MemoryStream();
			await pdfStream.CopyToAsync(memoryStream);
			return memoryStream.ToArray();
		}*/
		private static PageSize GetPageSize(string? pageType)
		{
			switch (pageType?.ToLower())
			{
				case "a4":
					return PageSize.A4;
				case "a4-horizontal":
					return new PageSize(PageSize.A4.GetHeight(), PageSize.A4.GetWidth());
				case "carta":
					return new PageSize(612, 792); // Tamaño Carta
				case "carta-horizontal":
					return new PageSize(612, 792).Rotate(); // Carta Horizontal
				case "oficio":
					return new PageSize(816, 1056); // Tamaño Oficio
				case "oficio-horizontal":
					return new PageSize(816, 1056).Rotate(); // Oficio Horizontal
				default:
					return PageSize.A4; // Por defecto A4
			}
		}
	}

	// Clase para manejar encabezado y pie de página
	public class HeaderFooterEventHandler : IEventHandler
	{
		private readonly Document _document;
		private readonly string _headerHtml;
		private readonly string _footerHtml;
		private readonly PageSize _pageSize;
		private readonly float _headerHeight;
		private readonly float _footerHeight;

		public HeaderFooterEventHandler(Document document, string headerHtml, string footerHtml, PageSize pageSize, float headerHeight, float footerHeight)
		{
			_document = document;
			_headerHtml = headerHtml;
			_footerHtml = footerHtml;
			_pageSize = pageSize;
			_headerHeight = headerHeight;
			_footerHeight = footerHeight;
		}

		public void HandleEvent(Event currentEvent)
		{
			PdfDocumentEvent pdfEvent = (PdfDocumentEvent)currentEvent;
			PdfDocument pdfDoc = pdfEvent.GetDocument();
			PdfPage page = pdfEvent.GetPage();
			float pageWidth = _pageSize.GetWidth();
			float pageHeight = _pageSize.GetHeight();

			PdfCanvas canvas = new PdfCanvas(page.NewContentStreamBefore(), page.GetResources(), pdfDoc);
			Canvas layoutCanvas = new Canvas(canvas, _pageSize);

			// Agregar encabezado
			if (!string.IsNullOrEmpty(_headerHtml))
			{
				IList<IElement> headerElements = HtmlConverter.ConvertToElements(_headerHtml);
				Div headerDiv = new Div();
				foreach (var element in headerElements)
				{
					headerDiv.Add((IBlockElement)element);
				}
				// Posicionar el encabezado en la parte superior de la página
				layoutCanvas.Add(headerDiv.SetFixedPosition(30, pageHeight - _headerHeight, pageWidth - 60));
			}

			// Agregar pie de página
			if (!string.IsNullOrEmpty(_footerHtml))
			{
				IList<IElement> footerElements = HtmlConverter.ConvertToElements(_footerHtml);
				Div footerDiv = new Div();
				foreach (var element in footerElements)
				{
					footerDiv.Add((IBlockElement)element);
				}
				// Posicionar el pie de página en la parte inferior de la página
				layoutCanvas.Add(footerDiv.SetFixedPosition(30, _footerHeight - 20, pageWidth - 60));
			}

			layoutCanvas.Close();
			canvas.Release();
		}
	}


}
