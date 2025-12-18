import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
  async streamOrderPdfToResponseTest(
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
    pdfDoc.pipe(res);
    pdfDoc.end();
  }

  /**
   * pdf A4
   * @param orderId
   * @param req
   * @param res
   */
  async streamOrderPdfRotuloToResponse(
    orderId: string,
    req: Request,
    res: Response,
  ): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'company'],
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

    const formatDate = (dateInput: Date | string | undefined): string => {
      if (!dateInput) return 'N/A';
      try {
        const date = new Date(dateInput);
        if (isNaN(date.getTime()))
          return typeof dateInput === 'string' ? dateInput : 'Inválida';
        return format(date, 'dd/MM/yyyy');
      } catch (e) {
        return typeof dateInput === 'string' ? dateInput : 'Inválida';
      }
    };

    const formatCurrency = (
      amount: number | undefined | null,
      currencySymbol: string = 'S/ ',
    ): string => {
      if (amount === null || amount === undefined || isNaN(amount))
        return `${currencySymbol}0.00`;
      return `${currencySymbol}${Number(amount).toFixed(2)}`;
    };

    const getValue = (value: any, defaultValue: string = ''): string => {
      if (
        value === null ||
        value === undefined ||
        (typeof value === 'string' && value.trim() === '')
      ) {
        return defaultValue;
      }
      return value.toString().toUpperCase().trim();
    };

    const pageSizeInPoints = 140 * 2.83465;

    // Definición de cómo se dibujarán los bordes para cada celda que simula un campo
    const fieldBorders: [boolean, boolean, boolean, boolean] = [
      true,
      true,
      true,
      true,
    ]; // [left, top, right, bottom]
    const fieldBorderColor = '#000000';
    const fieldLineWidth = 0.5;

    const createFieldContent = (
      label: string,
      value: string,
      labelStyle?: any,
      valueStyle?: any,
    ): any => {
      return {
        stack: [
          {
            text: label.toUpperCase(),
            style: ['fieldLabelRef', labelStyle || {}],
            margin: [0, 0, 0, 0.5],
          },
          { text: getValue(value), style: ['fieldValueRef', valueStyle || {}] },
        ],
        margin: [2, 1.5, 2, 1.5], // Padding interno para el contenido dentro de la celda bordeada
      };
    };

    // Función para crear una CELDA con el contenido del campo y sus bordes
    const createFieldCell = (
      label: string,
      value: string,
      labelStyle?: any,
      valueStyle?: any,
    ): any => {
      return {
        stack: createFieldContent(label, value, labelStyle, valueStyle).stack, // Tomamos el stack de la función anterior
        margin: createFieldContent(label, value).margin, // Y su margin para el padding interno
        border: fieldBorders,
        borderColor: [
          fieldBorderColor,
          fieldBorderColor,
          fieldBorderColor,
          fieldBorderColor,
        ],
        lineWidth: fieldLineWidth, // No es una propiedad directa de TableCell, se controla por layout.
        // Lo controlaremos con hLineWidth y vLineWidth en el layout de la tabla contenedora.
      };
    };
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
    const LOGO_BASE64_STRING = await imageToBase64(setting?.logo_url);

    const documentDefinition: TDocumentDefinitions = {
      pageSize: {
        width: pageSizeInPoints,
        // height: pageSizeInPoints,
        height: pageSizeInPoints,
      },
      //  pageMargins: [30, 30, 30, 30],
      defaultStyle: {
        font: 'Roboto',
        fontSize: 8,
        lineHeight: 1.2,
        color: '#000000',
      },
      pageMargins: [30, 45, 30, 0],

      header: (currentPage: number, pageCount: number) => ({
        margin: [24, -17, 0, 0], // Margen para todo el contenido del header
        table: {
          widths: [90], // Ancho TOTAL para la celda del logo
          body: [
            [
              {
                image: LOGO_BASE64_STRING, // Tu string base64 del logo
                // 'fit' escalará la imagen para que quepa dentro de 90pt de ancho,
                // manteniendo la proporción. La altura se ajustará.
                // Si quieres limitar también la altura, por ejemplo a 30pt: fit: [90, 30]
                fit: [90, 90], // Intenta encajar en un cuadrado de 90x90 (ajusta el segundo 90 si quieres limitar altura)
                alignment: 'center', // O 'center' si quieres centrarlo en la celda de 90pt
              },
            ],
          ],
        },
        layout: 'noBorders', // <--- Es bueno tener esto para que la tabla no tenga bordes visibles
      }),

      content: [
        ...(order.isExpress
          ? [
              // {
              //   text: setting.business_name,
              //   style: 'orderTitleRef',
              //   alignment: 'left',
              //   margin: [0, 0, 0, 3],
              // },
              {
                text: 'ENTREGA EXPRESS',
                style: 'orderTitleRef',
                alignment: 'left',
                margin: [0, 0, 0, 3],
              },
            ]
          : [
              // {
              //   text: setting.business_name,
              //   style: 'orderTitleRef',
              //   alignment: 'left',
              //   margin: [0, 5, 0, 10],
              // },
            ]),
        // --- Filas de Información usando Tablas para el Layout ---
        // Cada tabla representa una "fila" de campos de tu imagen
        {
          table: {
            widths: ['*', '*'], // Anchos para las celdas en esta fila
            body: [
              [
                createFieldCell(
                  'REMITENTE',
                  getValue(order.company.username, 'TU EMPRESA'),
                ),
                createFieldCell('DESTINATARIO', getValue(order.recipient_name)),
              ],
            ],
          },
          layout: {
            defaultBorder: false, // Sin bordes para la tabla contenedora en sí
            // Los siguientes son para las CELDAS DENTRO de esta tabla si no se especifica un layout en la celda
            hLineWidth: (i, node) => 0.5, // Grosor de línea horizontal
            vLineWidth: (i, node) => 0.5, // Grosor de línea vertical
            hLineColor: (i, node) => '#000000', // Color de línea
            vLineColor: (i, node) => '#000000', // Color de línea
            paddingTop: () => 0, // El padding ya está en el createFieldContent
            paddingBottom: () => 0,
            paddingLeft: () => 0,
            paddingRight: () => 0,
          },
          margin: [0, 0, 0, 10], // Margen entre "filas" de campos
        },
        {
          table: {
            widths: ['32%', '32%', '36%'],
            body: [
              [
                createFieldCell('TELÉFONO', getValue(order.recipient_phone)),
                createFieldCell('FECHA', formatDate(order.delivery_date)),
                createFieldCell('TIPO DE ENVÍO', getValue(order.shipment_type)),
              ],
            ],
          },
          layout: {
            defaultBorder: false,
            hLineWidth: (i, node) => 0.5,
            vLineWidth: (i, node) => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
            paddingTop: () => 0,
            paddingBottom: () => 0,
            paddingLeft: () => 0,
            paddingRight: () => 0,
          },
          margin: [0, 5, 0, 10],
        },
        {
          table: {
            widths: ['*'],
            body: [
              [
                createFieldCell(
                  'DIRECCIÓN DE ENTREGA',
                  `${getValue(order.delivery_address)} - ${getValue(order.delivery_district_name).toUpperCase()}`,
                ),
              ],
            ],
          },
          layout: {
            defaultBorder: false,
            hLineWidth: (i, node) => 0.5,
            vLineWidth: (i, node) => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
            paddingTop: () => 0,
            paddingBottom: () => 0,
            paddingLeft: () => 0,
            paddingRight: () => 0,
          },
          margin: [0, 5, 0, 10],
        },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                createFieldCell(
                  'MÉTODO DE PAGO',
                  getValue(order.payment_method_for_collection),
                ),
                createFieldCell(
                  'MONTO A COBRAR',
                  formatCurrency(order.amount_to_collect_at_delivery),
                  {},
                  { bold: true },
                ),
              ],
            ],
          },
          layout: {
            defaultBorder: false,
            hLineWidth: (i, node) => 0.5,
            vLineWidth: (i, node) => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
            paddingTop: () => 0,
            paddingBottom: () => 0,
            paddingLeft: () => 0,
            paddingRight: () => 0,
          },
          margin: [0, 5, 0, 10],
        },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                createFieldCell(
                  'TITULAR DE CUENTA',
                  getValue(order.company.name_account_number_owner),
                ),
                createFieldCell(
                  'N° CUENTA/REF.',
                  order.company.owner_bank_account
                    ? order.company.owner_bank_account
                    : 'N/A',
                ),
              ],
            ],
          },
          layout: {
            defaultBorder: false,
            hLineWidth: (i, node) => 0.5,
            vLineWidth: (i, node) => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
            paddingTop: () => 0,
            paddingBottom: () => 0,
            paddingLeft: () => 0,
            paddingRight: () => 0,
          },
          margin: [0, 5, 0, 10],
        },
        {
          table: {
            widths: ['*'],
            body: [
              [createFieldCell('PRODUCTO', getValue(order.item_description))],
            ],
          },
          layout: {
            defaultBorder: false,
            hLineWidth: (i, node) => 0.5,
            vLineWidth: (i, node) => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
            paddingTop: () => 0,
            paddingBottom: () => 0,
            paddingLeft: () => 0,
            paddingRight: () => 0,
          },
          margin: [0, 5, 0, 2],
        },
      ],

      styles: {
        orderTitleRef: { fontSize: 11, bold: true, alignment: 'center' },
        fieldLabelRef: { fontSize: 11, bold: true, margin: [0, 0, 0, 0.5] },
        fieldValueRef: { fontSize: 11, margin: [0, 0.5, 0, 0] }, // Quitamos el margen superior aquí
        sectionTitleRef: { fontSize: 11, bold: true },

        tableHeaderRef: {
          bold: true,
          fontSize: 9,
          color: '#000000',
          alignment: 'center',
        },
        tableCellRef: { fontSize: 9, alignment: 'center' },
        tableTotalLabelRef: { bold: true, fontSize: 9, margin: [0, 1, 0, 0] },
        tableTotalValueRef: { bold: true, fontSize: 9, margin: [0, 1, 0, 0] },
      },
    };

    // Crear y enviar el PDF
    try {
      const pdfDoc = this.printer.createPdfKitDocument(documentDefinition);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="guia_simplificada_${order.code || order.id}.pdf"`,
      );

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

  /**
   * pdf landscape
   */
  async streamOrderPdfLandscapeToResponse(
    orderId: string, // Asumo que el ID es string (UUID)
    req: Request,
    res: Response,
  ): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'company'], // Cargar la relación con el usuario para obtener el nombre
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

    const A4_LANDSCAPE_WIDTH_POINTS = 841.89;
    const PAGE_MARGIN_HORIZONTAL = 105;
    const CONTENT_WIDTH_TOTAL =
      A4_LANDSCAPE_WIDTH_POINTS - 2 * PAGE_MARGIN_HORIZONTAL;
    // Ajustar LEFT_COLUMN_WIDTH para que sea un poco menos de la mitad para dar un margen
    // o si la línea divisoria se dibuja desde el borde de la celda.
    // Si LEFT_COLUMN_WIDTH es para el contenido DENTRO de los márgenes de la celda de la tabla principal:
    const LEFT_COLUMN_WIDTH = Math.floor(CONTENT_WIDTH_TOTAL / 2) - 30; // Mitad menos un pequeño margen
    const RIGHT_COLUMN_WIDTH = '*';

    const documentDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [PAGE_MARGIN_HORIZONTAL, 70, PAGE_MARGIN_HORIZONTAL, 30],

      header: (currentPage: number, pageCount: number) => ({
        margin: [PAGE_MARGIN_HORIZONTAL, 15, PAGE_MARGIN_HORIZONTAL, 5],
        table: {
          widths: [LEFT_COLUMN_WIDTH, RIGHT_COLUMN_WIDTH],
          body: [
            [
              // Contenido del header para la columna izquierda
              {
                table: {
                  widths: [200, '*'], // Ancho para logo, resto para texto
                  body: [
                    [
                      // {
                      //   image: LOGO_BASE64_STRING, // TU LOGO AQUÍ
                      //   width: 60,
                      //   alignment: 'left',
                      // },
                      {
                        stack: [
                          {
                            text: 'GUÍA DE ENVÍO',
                            style: 'mainTitleInHeader',
                            alignment: 'center',
                            margin: [0, 0, 0, 8],
                          },
                          {
                            columns: [
                              {
                                text: setting.business_name.toUpperCase(),
                                style: 'headerCompanyNameSmall',
                                alignment: 'left',
                                width: '*',
                              },
                              {
                                text: `Pedido N°: ${getValue(order.code, 'N/D')}`,
                                style: 'headerOrderCodeSmall',
                                alignment: 'right',
                                width: 'auto',
                              },
                            ],
                          },
                        ],
                        margin: [0, 0, 0, 0], // Ajustar si es necesario para alineación vertical con logo
                      },
                    ],
                  ],
                },
                layout: 'noBorders',
              },
              // Columna derecha del header (vacía)
              { text: '' },
            ],
          ],
        },
        layout: 'noBorders',
      }),

      // footer: (currentPage: number, pageCount: number) => ({
      //   margin: [PAGE_MARGIN_HORIZONTAL, 10, PAGE_MARGIN_HORIZONTAL, 10],
      //   table: {
      //     widths: [LEFT_COLUMN_WIDTH, RIGHT_COLUMN_WIDTH],
      //     body: [
      //       [
      //         // Contenido del footer para la columna izquierda
      //         {
      //           columns: [
      //             // Usar columns para alinear texto a izquierda y derecha en la misma línea
      //             {
      //               text: `Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
      //               alignment: 'left',
      //               style: 'footerText',
      //               width: '*', // Ocupa el espacio disponible
      //             },
      //           ],
      //         },
      //         // Columna derecha del footer (vacía)
      //         { text: '' },
      //       ],
      //     ],
      //   },
      //   layout: 'noBorders',
      // }),

      content: [
        {
          table: {
            widths: [LEFT_COLUMN_WIDTH, RIGHT_COLUMN_WIDTH],
            body: [
              [
                {
                  stack: [
                    {
                      canvas: [
                        {
                          type: 'line',
                          x1: 0,
                          y1: 0,
                          x2: LEFT_COLUMN_WIDTH,
                          y2: 0,
                          lineWidth: 0.5,
                          lineColor: '#AEAEAE',
                        },
                      ],
                      margin: [0, 0, 0, 10], // Ajustar x2 a LEFT_COLUMN_WIDTH si no hay más márgenes internos
                    },

                    // --- Información del Envío ---
                    {
                      style: 'infoSection',
                      table: {
                        widths: ['auto', '*'],
                        body: [
                          [
                            { text: 'Tipo de Envío:', style: 'label' },
                            {
                              text: getValue(order.shipment_type).toUpperCase(),
                              style: 'value',
                            },
                          ],
                          [
                            { text: 'Fecha Entrega Prog.:', style: 'label' },
                            {
                              text: formatDate(order.delivery_date),
                              style: 'valueImportant',
                            },
                          ],
                          [
                            { text: 'Remitente:', style: 'label' },
                            {
                              text: order.company?.username,
                              style: 'valueImportant',
                            },
                          ],
                        ],
                      },
                      layout: 'noBorders',
                    },

                    // --- Información del Destinatario ---
                    {
                      text: 'DESTINATARIO',
                      style: 'sectionTitle',
                      margin: [0, 15, 0, 8],
                    }, // Ajustado margen
                    {
                      style: 'infoSection',
                      table: {
                        widths: ['auto', '*'],
                        body: [
                          [
                            { text: 'Nombre:', style: 'label' },
                            {
                              text: getValue(order.recipient_name),
                              style: 'value',
                            },
                          ],
                          [
                            { text: 'Teléfono:', style: 'label' },
                            {
                              text: getValue(order.recipient_phone),
                              style: 'value',
                            },
                          ],
                          [
                            { text: 'Distrito:', style: 'label' },
                            {
                              text: getValue(
                                order.delivery_district_name,
                              ).toUpperCase(),
                              style: 'value',
                            },
                          ],
                          [
                            { text: 'Dirección:', style: 'label' },
                            {
                              text: getValue(order.delivery_address),
                              style: 'valueSmall',
                            },
                          ],
                        ],
                      },
                      layout: 'noBorders',
                    },

                    // --- Información de Cobro ---
                    {
                      text: 'DETALLES DE COBRO',
                      style: 'sectionTitle',
                      margin: [0, 15, 0, 8],
                    }, // Ajustado margen
                    {
                      style: 'infoSection',
                      table: {
                        widths: ['auto', '*'],
                        body: [
                          [
                            { text: 'Monto a Cobrar:', style: 'label' },
                            {
                              text: formatCurrency(
                                order.amount_to_collect_at_delivery,
                              ),
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
                    {
                      text: 'OBSERVACIONES',
                      style: 'sectionTitle',
                      margin: [0, 15, 0, 8],
                    }, // Ajustado margen
                    {
                      text: getValue(order.observations, 'Ninguna.'),
                      style: 'paragraph',
                      margin: [0, 0, 0, 15], // Ajustado margen
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
                          // Puedes añadir más aquí si es necesario, como el estado actual
                          // [
                          //   { text: 'Estado Actual:', style: 'label' },
                          //   {
                          //     text: getValue(order.status).toUpperCase(),
                          //     style: 'value',
                          //   },
                          // ],
                        ],
                      },
                      layout: 'noBorders',
                    },
                  ], // Fin del stack de la columna izquierda
                },
                // --- FIN DEL CONTENIDO DE LA COLUMNA IZQUIERDA ---

                // --- COLUMNA DERECHA (VACÍA) ---
                {
                  text: '', // Es importante que haya un objeto, aunque sea con texto vacío
                },
                // --- FIN COLUMNA DERECHA ---
              ],
            ],
          },
          layout: 'noBorders',
        },
      ],

      styles: {
        headerCompanyNameSmall: {
          fontSize: 10,
          // color: '#455a64'
        },
        headerOrderCodeSmall: {
          fontSize: 12,
          bold: true,
          // color: '#3498db'
        },
        mainTitleInHeader: { fontSize: 18, bold: true, color: '#333333' },
        // headerCompanyName: { fontSize: 14, bold: true, color: '#2c3e50' }, // Se usa Small ahora
        // headerOrderCode: { fontSize: 12, color: '#3498db' }, // Se usa Small ahora
        // mainTitle: { fontSize: 18, bold: true, color: '#333333' }, // Se usa InHeader ahora
        sectionTitle: {
          fontSize: 12, // Ligeramente más pequeño para caber más
          bold: true,
          // color: '#2c3e50',
          // decoration: 'underline',
          // decorationStyle: 'solid',
          // decorationColor: '#3498db',
          margin: [0, 10, 0, 5], // Reducidos márgenes verticales
        },
        infoSection: {
          margin: [0, 0, 0, 8], // Reducido margen inferior
        },
        label: {
          fontSize: 14, // Ligeramente más pequeño
          bold: true,
          color: '#555555',
          // margin: [0, 0, 8, 3], // Reducidos márgenes
          width: '400px',
        },
        value: { fontSize: 14, color: '#333333', margin: [0, 0, 0, 3] }, // Ligeramente más pequeño
        valueSmall: { fontSize: 14, color: '#444444', margin: [0, 0, 0, 3] }, // Ligeramente más pequeño
        valueImportant: {
          fontSize: 14,
          // width: 200,
          bold: true,
          // color: '#e74c3c',
          margin: [0, 0, 0, 3],
        },
        valueHighlight: {
          fontSize: 14,
          bold: true,
          // color: '#2980b9',
          margin: [0, 0, 0, 3],
        },
        paragraph: {
          fontSize: 12,
          color: '#444444',
          lineHeight: 1.2,
          margin: [0, 0, 0, 10],
        },
        // smallNote: { fontSize: 8, italics: true, color: '#7f8c8d' }, // Ya no se usa en este diseño simplificado
        footerText: { fontSize: 8, color: '#AEAEAE' },
      },
      defaultStyle: {
        font: 'Roboto',
        fontSize: 9, // Reducido el tamaño base para que quepa más
        lineHeight: 1.1, // Reducido para compactar
        color: '#333333',
      },
    };

    // Crear y enviar el PDF
    try {
      const pdfDoc = this.printer.createPdfKitDocument(documentDefinition);

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

  /**
   * pdf formato ticketera 80mm
   */
  async streamOrderPdf80mmToResponse(
    orderId: string,
    req: Request,
    res: Response,
  ): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'company'],
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

    const host = (req as any).get('host');

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

    // --- Constantes para el ticket ---
    const TICKET_WIDTH_MM = 80;
    const TICKET_MARGIN_MM = 13; // Margen a cada lado
    const MM_TO_POINTS = 2.834645669; // 1mm = 2.8346... pt (aproximado)

    const TICKET_PAGE_WIDTH_PT = TICKET_WIDTH_MM * MM_TO_POINTS;
    const TICKET_MARGIN_PT = TICKET_MARGIN_MM * MM_TO_POINTS;
    const CONTENT_WIDTH_PT = TICKET_PAGE_WIDTH_PT - 2 * TICKET_MARGIN_PT;

    const LOGO_BASE64_STRING = await imageToBase64(setting?.logo_url);
    const documentDefinitionTicket: TDocumentDefinitions = {
      // Definir tamaño de página personalizado para el ticket
      // El alto puede ser grande, ya que las ticketeras cortan el papel.
      // O puedes intentar calcularlo, pero es más fácil dejarlo flexible.
      pageSize: { width: TICKET_PAGE_WIDTH_PT, height: 'auto' }, // Ancho de 80mm, alto automático
      pageMargins: [TICKET_MARGIN_PT, 55, TICKET_MARGIN_PT, 10], // [izq, arriba, der, abajo] - Márgenes pequeños
      // pageMargins: [30, 45, 30, 30],

      header: (currentPage: number, pageCount: number) => ({
        margin: [63, -20, 0, 0], // Margen para todo el contenido del header
        table: {
          widths: [90], // Ancho TOTAL para la celda del logo
          body: [
            [
              {
                image: LOGO_BASE64_STRING, // Tu string base64 del logo
                // 'fit' escalará la imagen para que quepa dentro de 90pt de ancho,
                // manteniendo la proporción. La altura se ajustará.
                // Si quieres limitar también la altura, por ejemplo a 30pt: fit: [90, 30]
                fit: [90, 90], // Intenta encajar en un cuadrado de 90x90 (ajusta el segundo 90 si quieres limitar altura)
                alignment: 'center', // O 'center' si quieres centrarlo en la celda de 90pt
              },
            ],
          ],
        },
        layout: 'noBorders', // <--- Es bueno tener esto para que la tabla no tenga bordes visibles
      }),
      content: [
        // {
        //   image: LOGO_BASE64_STRING, // Tu logo, asegúrate que sea pequeño y simple
        //   width: 70, // Ajusta el ancho de tu logo para que quepa bien
        //   alignment: 'center',
        //   margin: [0, 0, 0, 0], // Margen inferior después del logo
        // },
        {
          text: setting.business_name.toUpperCase(),
          style: 'ticketCompanyName',
          alignment: 'center',
        },
        {
          text: 'RUC:' + setting.ruc, // Reemplaza
          style: 'ticketInfoSmall',
          alignment: 'center',
        },
        {
          text: 'Tel: ' + setting.phone_number, // Reemplaza
          style: 'ticketInfoSmall',
          alignment: 'center',
          margin: [0, 0, 0, 0], // Margen inferior
        },
        {
          text: '----------------------------------------------', // Línea separadora simple
          style: 'ticketSeparator',
          alignment: 'center',
        },
        {
          text: `GUÍA DE ENVÍO`,
          style: 'ticketMainTitle',
          alignment: 'center',
        },
        {
          text: `Pedido N°: ${getValue(order.code, 'N/D')}`,
          style: 'ticketOrderCode',
          alignment: 'center',
          margin: [0, 0, 0, 8],
        },
        {
          text: `Fecha Reg: ${format(new Date(order.createdAt || Date.now()), 'dd/MM/yy HH:mm')}`, // Usar fecha de creación del pedido
          style: 'ticketInfoSmall',
          alignment: 'center',
          margin: [0, 0, 0, 0],
        },
        {
          text: '----------------------------------------------',
          style: 'ticketSeparator',
          alignment: 'center',
        },

        // --- DETALLES DEL ENVÍO ---
        ...(order.isExpress
          ? [
              {
                text: 'ENTREGA EXPRESS',
                style: 'ticketSectionTitle',
                alignment: 'left',
                margin: [0, 0, 0, 3],
              },
            ]
          : []),
        {
          text: `Tipo Envío: ${getValue(order.shipment_type).toUpperCase()}`,
          style: 'ticketDetail',
        },
        {
          text: `Fecha Entrega Prog.: ${formatDate(order.delivery_date)}`,
          style: 'ticketDetailImportant',
        },
        {
          text: `Remitente: ${order.company.username}`,
          style: 'ticketDetail',
        },

        // --- DESTINATARIO ---
        {
          text: 'DESTINATARIO:',
          style: 'ticketSectionTitle',
          margin: [0, 8, 0, 2],
        },
        {
          text: `Nombre: ${getValue(order.recipient_name)}`,
          style: 'ticketDetail',
        },
        {
          text: `Teléfono: ${getValue(order.recipient_phone)}`,
          style: 'ticketDetail',
        },
        {
          text: `Distrito: ${getValue(order.delivery_district_name).toUpperCase()}`,
          style: 'ticketDetail',
        },
        {
          text: `Dirección: ${getValue(order.delivery_address)}`,
          style: 'ticketDetailSmallWrap',
        }, // Para direcciones largas

        // --- DETALLES DE COBRO ---
        {
          text: 'COBRO EN ENTREGA:',
          style: 'ticketSectionTitle',
          margin: [0, 8, 0, 2],
        },
        {
          text: `Monto: ${formatCurrency(order.amount_to_collect_at_delivery)}`,
          style: 'ticketDetailHighlight',
        },
        {
          text: `Método: ${getValue(order.payment_method_for_collection).toUpperCase()}`,
          style: 'ticketDetail',
        },

        // --- OBSERVACIONES ---
        {
          text: 'OBSERVACIONES:',
          style: 'ticketSectionTitle',
          margin: [0, 8, 0, 2],
        },
        {
          text: getValue(order.observations, 'Ninguna.'),
          style: 'ticketDetailSmallWrap',
          margin: [0, 0, 0, 10],
        },

        // --- INFORMACIÓN ADICIONAL / PIE DE TICKET ---
        {
          text: '----------------------------------------------',
          style: 'ticketSeparator',
          alignment: 'center',
        },
        {
          text: `Atendido por: ${userName}`,
          style: 'ticketInfoSmall',
          alignment: 'center',
        },
        // Código de Barras o QR para el tracking_code (opcional)
        {
          qr: order.tracking_code || `PEDIDO-${order.code}`, // Contenido del QR
          fit: '80', // Tamaño del QR en puntos
          alignment: 'center',
          margin: [0, 10, 0, 10],
        },
        {
          text: `Tracking: ${getValue(order.tracking_code, 'N/A')}`,
          style: 'ticketInfoSmall',
          alignment: 'center',
          margin: [0, 0, 0, 10],
        },
        {
          text: '¡Gracias por su preferencia!',
          style: 'ticketFooter',
          alignment: 'center',
        },
        {
          text: host, // Reemplaza
          style: 'ticketFooterSmall',
          alignment: 'center',
        },
        // Puedes añadir un punto final o un carácter de corte si tu impresora no lo hace automáticamente
        // { text: '\n.\n', alignment: 'center' } // Para empujar el papel y facilitar el corte
      ],

      // --- ESTILOS PARA TICKET ---
      styles: {
        ticketCompanyName: {
          fontSize: 10, // Ajusta según tu logo y nombre
          bold: true,
          margin: [0, 0, 0, 1],
        },
        ticketInfoSmall: {
          fontSize: 7,
          color: '#333333',
          margin: [0, 0, 0, 1],
        },
        ticketSeparator: {
          fontSize: 12,
          margin: [0, 2, 0, 2],
          color: '#555555',
        },
        ticketMainTitle: {
          fontSize: 11, // Un poco más grande
          bold: true,
          margin: [0, 2, 0, 2],
        },
        ticketOrderCode: {
          fontSize: 10,
          bold: true,
          margin: [0, 0, 0, 2],
        },
        ticketSectionTitle: {
          fontSize: 9,
          bold: true,
          textDecoration: 'underline', // Opcional
          margin: [0, 5, 0, 1], // Espacio antes del título de sección
        },
        ticketDetail: {
          fontSize: 9,
          margin: [0, 0, 0, 2], // Espacio entre líneas de detalle
          lineHeight: 1.1,
        },
        ticketDetailImportant: {
          // Para la fecha de entrega
          fontSize: 8,
          bold: true,
          color: '#d32f2f', // Rojo para destacar
          margin: [0, 0, 0, 2],
        },
        ticketDetailHighlight: {
          // Para el monto a cobrar
          fontSize: 10, // Más grande
          bold: true,
          color: '#000000',
          margin: [0, 0, 0, 2],
        },
        ticketDetailSmallWrap: {
          // Para textos largos como dirección u observaciones
          fontSize: 7.5,
          margin: [0, 0, 0, 2],
          lineHeight: 1.1,
          // `pdfmake` maneja el ajuste de línea automáticamente si el texto es más largo que el ancho disponible.
        },
        ticketFooter: {
          fontSize: 8,
          bold: true,
          margin: [0, 5, 0, 1],
        },
        ticketFooterSmall: {
          fontSize: 7,
          margin: [0, 0, 0, 5],
        },
      },
      defaultStyle: {
        font: 'Roboto', // O una fuente monoespaciada si se ve mejor en ticketera
        fontSize: 10, // Tamaño de fuente base muy pequeño para tickets
        color: '#000000', // Texto negro por defecto
        lineHeight: 1, // Interlineado compacto
      },
    };
    // Crear y enviar el PDF
    try {
      const pdfDoc = this.printer.createPdfKitDocument(
        documentDefinitionTicket,
      );

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
