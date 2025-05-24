import { Injectable, NotFoundException } from '@nestjs/common';
// import PdfPrinter from 'pdfmake'; // Importación para Node.js
import { TDocumentDefinitions, BufferOptions } from 'pdfmake';
import { pdfMakeFonts } from '../../config/pdf-fonts.config'; // Importa tu configuración de fuentes
import { Response } from 'express'; // Para enviar el PDF como respuesta HTTP
import { OrdersEntity } from '../entities/orders.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as PDFMake from 'pdfmake';
import { format } from 'date-fns';

@Injectable()
export class OrderPdfGeneratorService {
  private printer: PDFMake;

  constructor(
    @InjectRepository(OrdersEntity)
    private readonly orderRepository: Repository<OrdersEntity>,
  ) {
    // Configura el printer con las fuentes
    this.printer = new PDFMake(pdfMakeFonts);
  }

  // async generateOrderPdfBuffer(orderId: string): Promise<Buffer> {
  //   // console.log(getFontPath('Roboto-Regular.ttf'));
  //   // 1. Obtener los datos de la orden desde la base de datos
  //   const order = await this.orderRepository.findOne({
  //     where: { id: orderId } /*, relations: ['user', 'items'] opcional */,
  //   });

  //   if (!order) {
  //     throw new NotFoundException(`Order with ID ${orderId} not found`);
  //   }

  //   // 2. Definir el contenido del PDF (similar al ejemplo del frontend)
  //   const documentDefinition: TDocumentDefinitions = {
  //     content: [
  //       { text: 'Detalle de la Orden', style: 'header' },
  //       { text: `Pedido N°: ${order.code || order.id}`, style: 'subheader' },
  //       {
  //         text: `Fecha de Registro: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}`,
  //         style: 'subheaderSmall',
  //       },
  //       {
  //         canvas: [
  //           {
  //             type: 'line',
  //             x1: 0,
  //             y1: 5,
  //             x2: 515,
  //             y2: 5,
  //             lineWidth: 0.5,
  //             lineColor: '#cccccc',
  //           },
  //         ],
  //         margin: [0, 10, 0, 10],
  //       },

  //       { text: 'Información del Destinatario:', style: 'sectionHeader' },
  //       `Nombre: ${order.recipient_name || 'N/A'}`,
  //       `Teléfono: ${order.recipient_phone || 'N/A'}`,
  //       `Dirección: ${order.delivery_address || 'N/A'}`,
  //       `Distrito: ${order.delivery_district_name || 'N/A'}`,
  //       // ... (más campos de la orden como en el ejemplo anterior) ...
  //       `Descripción del Artículo: ${order.item_description || 'N/A'}`,
  //       {
  //         text: `Monto a Cobrar: S/ ${order.amount_to_collect_at_delivery?.toFixed(2) || '0.00'}`,
  //         style: 'financialInfoImportant',
  //       },

  //       {
  //         text: `\n\nEstado Actual: ${order.status}`,
  //         style: 'status',
  //         alignment: 'right',
  //       },
  //     ],
  //     styles: {
  //       header: {
  //         fontSize: 22,
  //         bold: true,
  //         margin: [0, 0, 0, 10],
  //         alignment: 'center',
  //         color: '#3f51b5',
  //       },
  //       subheader: {
  //         fontSize: 14,
  //         bold: true,
  //         margin: [0, 0, 0, 5],
  //         color: '#444',
  //       },
  //       subheaderSmall: {
  //         fontSize: 10,
  //         italics: true,
  //         margin: [0, 0, 0, 15],
  //         color: '#777',
  //       },
  //       sectionHeader: {
  //         fontSize: 16,
  //         bold: true,
  //         margin: [0, 15, 0, 8],
  //         color: '#333',
  //       },
  //       financialInfoImportant: {
  //         fontSize: 13,
  //         bold: true,
  //         color: '#c0392b',
  //         margin: [0, 2, 0, 8],
  //       },
  //       status: { fontSize: 12, bold: true, color: '#2980b9' },
  //     },
  //     defaultStyle: {
  //       font: 'Roboto', // Especifica la familia de fuentes por defecto
  //       fontSize: 11,
  //       lineHeight: 1.3,
  //     },
  //   };

  //   // 3. Generar el PDF como un Buffer
  //   return new Promise((resolve, reject) => {
  //     const pdfDoc = this.printer.createPdfKitDocument(documentDefinition);
  //     const chunks: any[] = [];
  //     pdfDoc.on('data', (chunk) => chunks.push(chunk));
  //     pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
  //     pdfDoc.on('error', (err) => reject(err));
  //     pdfDoc.end();
  //   });
  // }

  // Método para enviar el PDF directamente como respuesta HTTP
  async streamOrderPdfToResponse(
    orderId: string,
    res: Response,
  ): Promise<void> {
    // console.log('pdfMakeFonts', pdfMakeFonts);

    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // const documentDefinition: TDocumentDefinitions = {
    //   /* ... tu definición de documento ... */
    //   content: [
    //     {
    //       text: `PDF para Orden ${order.code || order.id}`,
    //       style: 'header',
    //     } /* ... más contenido ... */,
    //   ],
    //   styles: { header: { fontSize: 18, bold: true } },
    //   defaultStyle: { font: 'Roboto' },
    // };

    const formatDate = (dateInput: string | Date | undefined): string => {
      if (!dateInput) return 'N/A';
      try {
        // Asume que delivery_date puede ser un string 'YYYY-MM-DD' o un objeto Date
        // y createdAt/updatedAt son objetos Date o strings ISO
        const date =
          typeof dateInput === 'string' && !dateInput.includes('T')
            ? new Date(dateInput + 'T00:00:00')
            : new Date(dateInput);
        return format(date, 'dd/MM/yyyy');
        // Para hora también: return format(date, 'dd/MM/yyyy HH:mm');
        // Para formato en español: return format(date, 'P', { locale: es });
      } catch (e) {
        return typeof dateInput === 'string' ? dateInput : 'Fecha inválida';
      }
    };

    const formatDateTime = (dateInput: string | Date | undefined): string => {
      if (!dateInput) return 'N/A';
      try {
        const date = new Date(dateInput);
        return format(date, 'dd/MM/yyyy HH:mm');
      } catch (e) {
        return typeof dateInput === 'string' ? dateInput : 'Fecha inválida';
      }
    };

    // Helper para formatear moneda
    const formatCurrency = (amount: number | undefined | null): string => {
      if (amount === null || amount === undefined) return 'S/ 0.00';
      return `S/ ${amount.toFixed(2)}`;
    };

    // Helper para texto por defecto
    const getValue = (value: any, defaultValue: string = 'N/A'): string => {
      if (
        value === null ||
        value === undefined ||
        (typeof value === 'string' && value.trim() === '')
      ) {
        return defaultValue;
      }
      return value.toString();
    };

    const documentDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [40, 20, 40, 20], // [left, top, right, bottom]

      header: function (currentPage, pageCount, pageSize) {
        // Puedes poner un logo o un texto simple aquí
        return {
          columns: [
            {
              text: 'Nombre de tu Empresa Courier',
              style: 'companyName',
              alignment: 'left',
              margin: [40, 20, 0, 0],
            },
            {
              text: `Página ${currentPage.toString()} de ${pageCount}`,
              alignment: 'right',
              style: 'pageNumber',
              margin: [0, 20, 40, 0],
            },
          ],
        };
      },

      footer: function (currentPage, pageCount) {
        return {
          text: 'Gracias por su preferencia - Contacto: (01) 555-1234 - www.tuempresa.com',
          alignment: 'center',
          style: 'footerText',
          margin: [0, 20, 0, 30], // Margen para que no se pegue al borde inferior
        };
      },

      content: [
        // SECCIÓN DE TÍTULO Y CÓDIGO DE ORDEN
        {
          text: 'ORDEN DE SERVICIO',
          style: 'mainTitle',
          alignment: 'center',
        },
        {
          text: `PEDIDO N°: ${getValue(order.code, 'Desconocido')}`,
          style: 'orderCode',
          alignment: 'center',
        },
        {
          // Línea divisoria
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 2,
              x2: 515,
              y2: 2,
              lineWidth: 1,
              lineColor: '#cccccc',
            },
          ],
          margin: [0, 5, 0, 15], // [left, top, right, bottom]
        },

        // SECCIÓN DE INFORMACIÓN GENERAL Y DESTINATARIO
        {
          columns: [
            // Columna Izquierda: Info General
            {
              width: '50%',
              stack: [
                { text: 'Información General', style: 'sectionTitle' },
                {
                  text: `Tipo de Envío: ${getValue(order.shipment_type).toUpperCase()}`,
                  style: 'detailText',
                },
                {
                  text: `Fecha de Registro: ${formatDateTime(order.createdAt)}`,
                  style: 'detailText',
                },
                {
                  text: `Fecha Entrega Prog.: ${formatDate(order.delivery_date)}`,
                  style: 'detailText',
                },
                {
                  text: `Estado Actual: ${getValue(order.status).toUpperCase()}`,
                  style: 'detailTextImportant',
                },
              ],
              margin: [0, 0, 10, 0], // Margen derecho para la columna
            },
            // Columna Derecha: Info Destinatario
            {
              width: '50%',
              stack: [
                { text: 'Información del Destinatario', style: 'sectionTitle' },
                {
                  text: `Nombre: ${getValue(order.recipient_name)}`,
                  style: 'detailText',
                },
                {
                  text: `Teléfono: ${getValue(order.recipient_phone)}`,
                  style: 'detailText',
                },
                {
                  text: `Dirección: ${getValue(order.delivery_address)}`,
                  style: 'detailText',
                },
                {
                  text: `Distrito: ${getValue(order.delivery_district_name).toUpperCase()}`,
                  style: 'detailText',
                },
                {
                  text: `Coordenadas: ${getValue(order.delivery_coordinates)}`,
                  style: 'detailText',
                  italics: true,
                  color: 'gray',
                },
              ],
            },
          ],
          margin: [0, 0, 0, 20], // Margen inferior para la sección de columnas
        },

        // SECCIÓN DETALLES DEL PAQUETE
        { text: 'Descripción del Contenido', style: 'sectionTitle' },
        {
          text: getValue(order.item_description, 'Sin descripción detallada.'),
          style: 'paragraph',
        },

        {
          text: 'Detalles del Paquete',
          style: 'sectionTitleSmall',
          margin: [0, 10, 0, 5],
        },
        {
          columns: [
            {
              width: 'auto', // Ajustar al contenido
              stack: [
                {
                  text: `Tipo de Tamaño: ${getValue(order.package_size_type).toUpperCase()}`,
                  style: 'detailTextList',
                },
                {
                  text: `Peso (kg): ${getValue(order.package_weight_kg?.toFixed(2))} kg`,
                  style: 'detailTextList',
                },
              ],
            },
            {
              width: '*', // Ocupa el resto del espacio
              stack: [
                {
                  text: `Ancho: ${getValue(order.package_width_cm)} cm`,
                  style: 'detailTextList',
                },
                {
                  text: `Largo: ${getValue(order.package_length_cm)} cm`,
                  style: 'detailTextList',
                },
                {
                  text: `Alto: ${getValue(order.package_height_cm)} cm`,
                  style: 'detailTextList',
                },
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },

        // SECCIÓN FINANCIERA
        { text: 'Información Financiera', style: 'sectionTitle' },
        {
          columns: [
            {
              text: `Costo de Envío: ${formatCurrency(order.shipping_cost)}`,
              style: 'detailText',
            },
            {
              text: `Monto a Cobrar en Entrega: ${formatCurrency(order.amount_to_collect_at_delivery)}`,
              style: 'detailTextImportant',
            },
          ],
          margin: [0, 0, 0, 5],
        },
        {
          text: `Método de Cobro: ${getValue(order.payment_method_for_collection).toUpperCase()}`,
          style: 'detailText',
          margin: [0, 0, 0, 20],
        },

        // OBSERVACIONES Y LOGÍSTICA
        {
          stack: [
            order.observations
              ? {
                  text: 'Observaciones del Pedido:',
                  style: 'sectionTitleSmall',
                  margin: [0, 0, 0, 2],
                }
              : {},
            order.observations
              ? {
                  text: getValue(order.observations),
                  style: 'paragraph',
                  margin: [0, 0, 0, 10],
                }
              : {},

            order.type_order_transfer_to_warehouse
              ? {
                  text: 'Logística de Almacén:',
                  style: 'sectionTitleSmall',
                  margin: [0, 0, 0, 2],
                }
              : {},
            order.type_order_transfer_to_warehouse
              ? {
                  text: `Tipo Transf. Almacén: ${getValue(order.type_order_transfer_to_warehouse).toUpperCase()}`,
                  style: 'detailText',
                }
              : {},
          ],
          margin: [0, 0, 0, 30], // Margen inferior antes del pie de página
        },

        // Espacio para firma o sello (si es necesario)
        {
          columns: [
            {
              qr: `PEDIDO-${getValue(order.code)}-${formatDate(order.delivery_date)}`,
              fit: '80',
              alignment: 'left',
            }, // Ejemplo de QR
            {
              text: '\n\n\n__________________________\nFirma del Receptor',
              style: 'signatureLine',
              alignment: 'right',
            },
          ],
          margin: [0, 50, 0, 0],
        },
      ],

      styles: {
        companyName: {
          fontSize: 10,
          color: 'gray',
          italics: true,
        },
        pageNumber: {
          fontSize: 9,
          color: 'gray',
        },
        mainTitle: {
          fontSize: 20,
          bold: true,
          margin: [0, 0, 0, 5], // top, right, bottom, left
          color: '#2c3e50', // Un azul oscuro
        },
        orderCode: {
          fontSize: 16,
          bold: true,
          color: '#3498db', // Un azul más brillante para el código
          margin: [0, 0, 0, 15],
        },
        sectionTitle: {
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 8], // Espacio antes y después
          color: '#34495e', // Otro tono de azul/gris
          border: [false, false, false, true], // Solo línea inferior
          borderColor: ['#bdc3c7', '#bdc3c7', '#bdc3c7', '#bdc3c7'],
          padding: [0, 0, 0, 2], // Pequeño padding para la línea
        },
        sectionTitleSmall: {
          fontSize: 12,
          bold: true,
          color: '#7f8c8d', // Un gris
          margin: [0, 5, 0, 3],
        },
        detailText: {
          fontSize: 10,
          margin: [0, 0, 0, 6], // Espacio entre líneas de detalle
          lineHeight: 1.2,
          color: '#555',
        },
        detailTextList: {
          // Para listas dentro de columnas
          fontSize: 10,
          margin: [0, 0, 0, 3],
          lineHeight: 1.2,
          color: '#555',
        },
        detailTextImportant: {
          fontSize: 11,
          bold: true,
          color: '#e74c3c', // Un rojo para destacar
          margin: [0, 0, 0, 6],
        },
        paragraph: {
          fontSize: 10,
          margin: [0, 0, 0, 10],
          lineHeight: 1.3,
          color: '#333',
        },
        signatureLine: {
          fontSize: 10,
          color: '#555',
          italics: true,
        },
        footerText: {
          fontSize: 9,
          color: '#7f8c8d', // Gris
          italics: true,
        },
      },
      defaultStyle: {
        font: 'Roboto', // Asegúrate que esta fuente esté configurada en tu PdfPrinter
        fontSize: 10,
        lineHeight: 1.2,
        color: '#333333',
      },
    };

    const pdfDoc = this.printer.createPdfKitDocument(documentDefinition);

    // Configurar headers para la respuesta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="orden_${order.code || order.id}.pdf"`,
    );
    // Para descarga en lugar de visualización:
    // res.setHeader('Content-Disposition', `attachment; filename="orden_${order.code || order.id}.pdf"`);

    pdfDoc.pipe(res); // Enviar el stream del PDF directamente a la respuesta
    pdfDoc.end();
  }
}
