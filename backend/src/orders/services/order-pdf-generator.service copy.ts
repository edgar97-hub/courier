import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
// import PdfPrinter from 'pdfmake'; // Importación para Node.js
import { TDocumentDefinitions, BufferOptions, ImageDefinition } from 'pdfmake';
import { pdfMakeFonts } from '../../config/pdf-fonts.config'; // Importa tu configuración de fuentes
import { Response } from 'express'; // Para enviar el PDF como respuesta HTTP
import { OrdersEntity } from '../entities/orders.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as PDFMake from 'pdfmake';
import { format } from 'date-fns';
import fetch from 'node-fetch';
import { SettingsEntity } from 'src/settings/entities/settings.entity';

@Injectable()
export class OrderPdfGeneratorService {
  private printer: PDFMake;

  constructor(
    @InjectRepository(OrdersEntity)
    private readonly orderRepository: Repository<OrdersEntity>,
    @InjectRepository(SettingsEntity)
    private readonly settingRepository: Repository<SettingsEntity>,
  ) {
    this.printer = new PDFMake(pdfMakeFonts);
  }

  // Método para enviar el PDF directamente como respuesta HTTP
  async streamOrderPdfToResponse(
    orderId: string,
    res: Response,
  ): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

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

  async streamSimplifiedOrderPdfToResponse(
    orderId: string, // Asumo que el ID es string (UUID)
    res: Response,
  ): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user'], // Cargar la relación con el usuario para obtener el nombre
    });

    if (!order) {
      throw new NotFoundException(`Pedido con ID ${orderId} no encontrado.`);
    }
    const [setting] = await this.settingRepository.find({
      order: {
        id: 'ASC',
      },
      take: 1,
    });

    if (!setting) {
      throw new NotFoundException(`empresa no encontrado`);
    }
    async function imageToBase64(imageUrl) {
      try {
        const response = await fetch(imageUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(new Uint8Array(arrayBuffer));
        const base64String = buffer.toString('base64');
        const contentType = response.headers.get('content-type') || 'image/png';

        return `data:${contentType};base64,${base64String}`;
      } catch (error) {
        console.error('Error fetching image:', error);
        return null;
      }
    }

    // --- Helpers ---
    const formatDate = (dateInput: string | Date | undefined): string => {
      if (!dateInput) return 'No especificada';
      try {
        const date =
          typeof dateInput === 'string' &&
          !dateInput.includes('T') &&
          dateInput.match(/^\d{4}-\d{2}-\d{2}$/)
            ? new Date(dateInput + 'T00:00:00Z') // Asumir UTC si es solo fecha para evitar problemas de zona horaria
            : new Date(dateInput);
        if (isNaN(date.getTime())) return 'Fecha inválida';
        return format(date, 'dd/MM/yyyy');
        // Para formato en español: return format(date, 'P', { locale: es });
      } catch (e) {
        return typeof dateInput === 'string' ? dateInput : 'Fecha inválida';
      }
    };

    const formatCurrency = (amount: number | undefined | null): string => {
      if (amount === null || amount === undefined || isNaN(amount))
        return 'S/ 0.00';
      return `S/ ${Number(amount).toFixed(2)}`;
    };

    const getValue = (value: any, defaultValue: string = 'N/A'): string => {
      if (
        value === null ||
        value === undefined ||
        (typeof value === 'string' && value.trim() === '')
      ) {
        return defaultValue;
      }
      return value.toString().trim();
    };

    const userName = order.user
      ? getValue(order.user.username || order.user.email, 'Sistema')
      : 'Sistema';

    const LOGO_BASE64_STRING = await imageToBase64(setting?.logo_url);
    const documentDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [30, 70, 30, 40],
      header: (currentPage: number, pageCount: number) => ({
        margin: [30, 15, 30, 10], // Margen para todo el contenido del header
        table: {
          widths: [60, '*'], // Ancho para el logo, el resto para el texto
          //
          body: [
            [
              {
                image: LOGO_BASE64_STRING,
                width: 60,
                alignment: 'left',
              },
              {
                stack: [
                  {
                    text: 'ORDEN DE SERVICIO', // Título principal
                    style: 'mainTitleInHeader', // Usa el estilo que definimos para esto
                    alignment: 'center', // Centrar el título principal en esta columna
                    margin: [0, 0, 0, 8], // Margen inferior para separar
                  },
                  {
                    // Un nuevo bloque de columnas para Nombre Empresa y N° Pedido debajo del título
                    columns: [
                      {
                        text: setting.business_name.toUpperCase(),
                        style: 'headerCompanyNameSmall', // Un estilo ligeramente más pequeño
                        alignment: 'left', // Nombre de empresa a la izquierda de este sub-bloque
                        width: '*', // Que ocupe el espacio necesario
                      },
                      {
                        text: `Pedido N°: ${getValue(order.code, 'N/D')}`,
                        style: 'headerOrderCodeSmall', // Un estilo ligeramente más pequeño
                        alignment: 'right', // N° Pedido a la derecha de este sub-bloque
                        width: 'auto', // Que se ajuste a su contenido
                      },
                    ],
                    // margin: [0, 0, 0, 0] // Sin margen extra para este columns
                  },
                ],
                margin: [0, 0, 0, 0],
              },
            ],
          ],
        },
        layout: 'noBorders',
      }),

      footer: {
        columns: [
          {
            text: `Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
            alignment: 'left',
            style: 'footerText',
            margin: [30, 0, 0, 0],
          },
          // {
          //   text: 'www.tuempresa.com',
          //   alignment: 'right',
          //   style: 'footerText',
          //   margin: [0, 0, 30, 0],
          // },
        ],
        margin: [0, 10, 0, 10], // Margen para que no se pegue al borde inferior
      },

      content: [
        // {
        //   canvas: [
        //     {
        //       type: 'line',
        //       x1: 0,
        //       y1: 0,
        //       x2: 595 - 60,
        //       y2: 0,
        //       lineWidth: 0.5,
        //       lineColor: '#AEAEAE',
        //     },
        //   ],
        //   margin: [0, 0, 0, 15], // Margen después de la línea, antes del título principal
        // },
        // {
        //   text: 'ORDEN DE SERVICIO',
        //   style: 'mainTitle',
        //   alignment: 'center',
        //   margin: [0, 40, 0, 15],
        // },
        // --- Información del Envío ---
        {
          style: 'infoSection',
          margin: [0, 55, 0, 10], // Margen para todo el contenido del header

          table: {
            widths: ['auto', '*'], // Primera columna se ajusta, segunda ocupa el resto
            body: [
              // Fila 1
              [
                { text: 'Tipo de Envío:', style: 'label' },
                {
                  text: getValue(order.shipment_type).toUpperCase(),
                  style: 'value',
                },
              ],
              // Fila 2
              [
                { text: 'Fecha Entrega Prog.:', style: 'label' },
                {
                  text: formatDate(order.delivery_date),
                  style: 'valueImportant',
                },
              ],
            ],
          },
          layout: 'noBorders', // Sin bordes para esta tabla de layout
        },

        // --- Información del Destinatario ---
        { text: 'DESTINATARIO', style: 'sectionTitle', margin: [0, 20, 0, 8] },
        {
          style: 'infoSection',
          table: {
            widths: ['auto', '*'],
            body: [
              [
                { text: 'Nombre:', style: 'label' },
                { text: getValue(order.recipient_name), style: 'value' },
              ],
              [
                { text: 'Teléfono:', style: 'label' },
                { text: getValue(order.recipient_phone), style: 'value' },
              ],
              [
                { text: 'Distrito:', style: 'label' },
                {
                  text: getValue(order.delivery_district_name).toUpperCase(),
                  style: 'value',
                },
              ],
              // Opcional: Dirección completa si es necesaria aunque no la pediste explícitamente para el resumen
              [
                { text: 'Dirección:', style: 'label' },
                { text: getValue(order.delivery_address), style: 'valueSmall' },
              ],
            ],
          },
          layout: 'noBorders',
        },

        // --- Información de Cobro ---
        {
          text: 'DETALLES DE COBRO',
          style: 'sectionTitle',
          margin: [0, 20, 0, 8],
        },
        {
          style: 'infoSection',
          table: {
            widths: ['auto', '*'],
            body: [
              [
                { text: 'Monto a Cobrar:', style: 'label' },
                {
                  text: formatCurrency(order.amount_to_collect_at_delivery),
                  style: 'valueHighlight',
                },
              ],
              [
                { text: 'Método de Pago:', style: 'label' },
                {
                  text: getValue(
                    order.payment_method_for_collection,
                  ).toUpperCase(),
                  style: 'value',
                },
              ],
            ],
          },
          layout: 'noBorders',
        },

        // --- Observaciones ---
        { text: 'OBSERVACIONES', style: 'sectionTitle', margin: [0, 20, 0, 8] },
        {
          text: getValue(order.observations, 'Ninguna.'),
          style: 'paragraph',
          margin: [0, 0, 0, 20],
        },

        // --- Usuario que Registró ---
        {
          text: 'INFORMACIÓN ADICIONAL',
          style: 'sectionTitle',
          margin: [0, 10, 0, 8],
        },
        {
          style: 'infoSection',
          table: {
            widths: ['auto', '*'],
            body: [
              [
                { text: 'Registrado por:', style: 'label' },
                { text: userName, style: 'valueSmall' },
              ],
              // [
              //   { text: 'Estado Actual:', style: 'label' },
              //   {
              //     text: getValue(order.status).toUpperCase(),
              //     style: 'valueImportant',
              //   },
              // ],
            ],
          },
          layout: 'noBorders',
        },

        // Espacio para firma o información de la empresa al final
        // {
        //   text: '\n\n\nPara uso interno o del motorizado.',
        //   style: 'smallNote',
        //   alignment: 'center',
        //   margin: [0, 50, 0, 0],
        // },
      ],

      // --- ESTILOS ---
      styles: {
        headerCompanyNameSmall: {
          // Nuevo estilo más pequeño para el nombre de la empresa
          fontSize: 10, // Reducido
          bold: false, // Quizás no tan bold
          color: '#455a64', // Mismo color o ligeramente más claro
        },
        headerOrderCodeSmall: {
          // Nuevo estilo más pequeño para el N° Pedido
          fontSize: 10, // Reducido
          bold: true,
          color: '#3498db',
        },
        mainTitleInHeader: {
          fontSize: 18, // O el tamaño que desees para "ORDEN DE SERVICIO"
          bold: true,
          color: '#333333',
          // alignment: 'center', // Ya está en el stack
        },
        //
        headerCompanyName: {
          fontSize: 14,
          bold: true,
          color: '#2c3e50', // Azul oscuro corporativo
        },
        headerOrderCode: {
          fontSize: 12,
          color: '#3498db', // Azul más brillante
        },
        // mainTitleInHeader: {
        //   // Nuevo estilo para el título dentro del header
        //   fontSize: 18, // O el tamaño de tu 'mainTitle' original
        //   bold: true,
        //   color: '#333333', // O tu color de 'mainTitle'
        //   // margin: [0, 5, 0, 0] // Margen superior si es necesario dentro del stack
        // },
        mainTitle: {
          fontSize: 18,
          bold: true,
          color: '#333333',
        },
        sectionTitle: {
          fontSize: 12,
          bold: true,
          color: '#2c3e50', // Azul oscuro
          // background: '#ecf0f1', // Fondo gris muy claro para el título de sección
          // padding: [0, 2, 0, 2],
          decoration: 'underline',
          decorationStyle: 'solid',
          decorationColor: '#3498db', // Subrayado azul
          margin: [0, 15, 0, 5], // Espacio antes y después
        },
        infoSection: {
          margin: [0, 0, 0, 10], // Espacio después de cada bloque de información
        },
        label: {
          fontSize: 10,
          bold: true,
          color: '#555555',
          margin: [0, 0, 10, 4], // Margen derecho para separar de valor, y inferior
          width: 'auto', // Asegura que no se expanda innecesariamente
        },
        value: {
          fontSize: 10,
          color: '#333333',
          margin: [0, 0, 0, 4],
        },
        valueSmall: {
          fontSize: 9,
          color: '#444444',
          margin: [0, 0, 0, 4],
        },
        valueImportant: {
          fontSize: 10,
          bold: true,
          color: '#e74c3c', // Rojo para destacar
          margin: [0, 0, 0, 4],
        },
        valueHighlight: {
          fontSize: 12, // Más grande para el monto
          bold: true,
          color: '#2980b9', // Azul
          margin: [0, 0, 0, 4],
        },
        paragraph: {
          fontSize: 10,
          color: '#444444',
          lineHeight: 1.3,
        },
        smallNote: {
          fontSize: 8,
          italics: true,
          color: '#7f8c8d',
        },
        footerText: {
          fontSize: 8,
          color: '#AEAEAE', // Gris claro para el pie de página
        },
      },
      defaultStyle: {
        font: 'Roboto',
        fontSize: 10, // Tamaño de fuente base
        lineHeight: 1.2,
      },
    };

    // Crear y enviar el PDF
    try {
      const pdfDoc = this.printer.createPdfKitDocument(documentDefinition);

      // const printer = new PdfPrinter(fonts); // Crear instancia aquí
      // const pdfDoc = printer.createPdfKitDocument(documentDefinition);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="guia_simplificada_${order.code || order.id}.pdf"`,
      );
      // Para descarga directa:
      // res.setHeader('Content-Disposition', `attachment; filename="guia_simplificada_${order.code || order.id}.pdf"`);

      pdfDoc.pipe(res);
      pdfDoc.end();
    } catch (error) {
      console.error('Error generando PDF:', error);
      // Lanza un error HTTP si la generación del PDF falla
      throw new InternalServerErrorException(
        'No se pudo generar el PDF del pedido.',
      );
    }
  }
}
