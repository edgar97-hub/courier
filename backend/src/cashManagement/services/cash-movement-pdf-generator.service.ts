import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashManagementEntity } from '../entities/cashManagement.entity';
import * as PDFMake from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake';
import { format } from 'date-fns';
import { Response } from 'express';
import { SettingsEntity } from '../../settings/entities/settings.entity';
import fetch from 'node-fetch';
import { pdfMakeFonts } from '../../config/pdf-fonts.config';

@Injectable()
export class CashMovementPdfGeneratorService {
  private printer: PDFMake;

  constructor(
    @InjectRepository(CashManagementEntity)
    private readonly cashMovementRepository: Repository<CashManagementEntity>,
    @InjectRepository(SettingsEntity)
    private readonly settingRepository: Repository<SettingsEntity>,
  ) {
    this.printer = new PDFMake(pdfMakeFonts);
  }

  async streamCashMovementPdfA4ToResponse(
    movementId: string,
    req: Request,
    res: Response,
  ): Promise<void> {
    const movement = await this.cashMovementRepository.findOne({
      where: { id: movementId },
      relations: ['user'],
    });

    if (!movement) {
      throw new NotFoundException(
        `Movimiento de caja con ID ${movementId} no encontrado.`,
      );
    }

    const [setting] = await this.settingRepository.find({
      order: {
        id: 'ASC',
      },
      take: 1,
    });

    if (!setting) {
      throw new NotFoundException(`Configuración de empresa no encontrada.`);
    }

    const formatDate = (dateInput: Date | string | undefined): string => {
      if (!dateInput) return 'N/A';
      try {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return 'Fecha inválida';
        return format(date, 'dd/MM/yyyy HH:mm');
      } catch (e) {
        return 'Fecha inválida';
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
      pageSize: 'A4',
      pageMargins: [40, 20, 40, 20],

      header: function (currentPage, pageCount, pageSize) {
        return {
          columns: [
            {
              image: LOGO_BASE64_STRING,
              width: 60,
              alignment: 'left',
              margin: [40, 10, 0, 0],
            },
            {
              text: setting.business_name,
              style: 'companyName',
              alignment: 'center',
              margin: [0, 20, 0, 0],
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

      //   footer: function (currentPage, pageCount) {
      //     return {
      //       text: 'Generado por el Sistema de Gestión de Caja - ' + format(new Date(), 'dd/MM/yyyy HH:mm'),
      //       alignment: 'center',
      //       style: 'footerText',
      //       margin: [0, 20, 0, 30],
      //     };
      //   },

      content: [
        {
          text: 'COMPROBANTE DE MOVIMIENTO DE CAJA',
          style: 'mainTitle',
          alignment: 'center',
        },
        {
          text: `MOVIMIENTO N°: ${getValue(movement.code, 'Desconocido')}`,
          style: 'movementCode',
          alignment: 'center',
        },
        {
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
          margin: [0, 5, 0, 15],
        },

        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'Detalles del Movimiento', style: 'sectionTitle' },
                {
                  text: `Fecha: ${formatDate(movement.date)}`,
                  style: 'detailText',
                },
                {
                  text: `Tipo: ${getValue(movement.typeMovement).toUpperCase()}`,
                  style: 'detailTextImportant',
                },
                {
                  text: `Monto: ${formatCurrency(movement.amount)}`,
                  style: 'detailTextImportant',
                },
                {
                  text: `Forma de Pago: ${getValue(movement.paymentsMethod).toUpperCase()}`,
                  style: 'detailText',
                },
              ],
              margin: [0, 0, 10, 0],
            },
            {
              width: '50%',
              stack: [
                { text: 'Información Adicional', style: 'sectionTitle' },
                {
                  text: `Descripción: ${getValue(movement.description)}`,
                  style: 'detailText',
                },
                {
                  text: `Registrado por: ${getValue(movement.user?.username || movement.user?.email)}`,
                  style: 'detailText',
                },
                {
                  text: `Fecha de Registro: ${formatDate(movement.createdAt)}`,
                  style: 'detailText',
                },
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },

        {
          columns: [
            // {
            //   qr: `MOVIMIENTO-${getValue(movement.code)}-${formatDate(movement.date)}`,
            //   fit: '80',
            //   alignment: 'left',
            // },
            // {
            //   text: '\n\n\n__________________________\nFirma del Responsable',
            //   style: 'signatureLine',
            //   alignment: 'right',
            // },
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
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 5],
          color: '#2c3e50',
        },
        movementCode: {
          fontSize: 14,
          bold: true,
          color: '#3498db',
          margin: [0, 0, 0, 15],
        },
        sectionTitle: {
          fontSize: 12,
          bold: true,
          margin: [0, 15, 0, 8],
          color: '#34495e',
          border: [false, false, false, true],
          borderColor: ['#bdc3c7', '#bdc3c7', '#bdc3c7', '#bdc3c7'],
          padding: [0, 0, 0, 2],
        },
        detailText: {
          fontSize: 10,
          margin: [0, 0, 0, 6],
          lineHeight: 1.2,
          color: '#555',
        },
        detailTextImportant: {
          fontSize: 11,
          bold: true,
          color: '#e74c3c',
          margin: [0, 0, 0, 6],
        },
        signatureLine: {
          fontSize: 10,
          color: '#555',
          italics: true,
        },
        footerText: {
          fontSize: 9,
          color: '#7f8c8d',
          italics: true,
        },
      },
      defaultStyle: {
        font: 'Roboto',
        fontSize: 10,
        lineHeight: 1.2,
        color: '#333333',
      },
    };

    try {
      const pdfDoc = this.printer.createPdfKitDocument(documentDefinition);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="movimiento_${movement.code || movement.id}.pdf"`,
      );

      pdfDoc.pipe(res);
      pdfDoc.end();
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw new InternalServerErrorException(
        'No se pudo generar el PDF del movimiento de caja.',
      );
    }
  }

  /**
   * pdf formato ticketera 80mm
   */
  async streamCashMovementPdf80mmToResponse(
    movementId: string,
    req: Request,
    res: Response,
  ): Promise<void> {
    const movement = await this.cashMovementRepository.findOne({
      where: { id: movementId },
      relations: ['user'],
    });

    if (!movement) {
      throw new NotFoundException(
        `Movimiento de caja con ID ${movementId} no encontrado.`,
      );
    }

    const [setting] = await this.settingRepository.find({
      order: {
        id: 'ASC',
      },
      take: 1,
    });

    if (!setting) {
      throw new NotFoundException(`Configuración de empresa no encontrada.`);
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

    const formatDate = (dateInput: Date | string | undefined): string => {
      if (!dateInput) return 'N/A';
      try {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return 'Fecha inválida';
        return format(date, 'dd/MM/yyyy HH:mm');
      } catch (e) {
        return 'Fecha inválida';
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

    const userName = movement.user
      ? getValue(movement.user.username || movement.user.email, 'Sistema')
      : 'Sistema';

    // --- Constantes para el ticket ---
    const TICKET_WIDTH_MM = 80;
    const TICKET_MARGIN_MM = 13; // Margen a cada lado
    const MM_TO_POINTS = 2.834645669; // 1mm = 2.8346... pt (aproximado)

    const TICKET_PAGE_WIDTH_PT = TICKET_WIDTH_MM * MM_TO_POINTS;
    const TICKET_MARGIN_PT = TICKET_MARGIN_MM * MM_TO_POINTS;
    // const CONTENT_WIDTH_PT = TICKET_PAGE_WIDTH_PT - 2 * TICKET_MARGIN_PT;

    const LOGO_BASE64_STRING = await imageToBase64(setting?.logo_url);

    const documentDefinitionTicket: TDocumentDefinitions = {
      pageSize: { width: TICKET_PAGE_WIDTH_PT, height: 'auto' },
      pageMargins: [TICKET_MARGIN_PT, 55, TICKET_MARGIN_PT, 10],

      header: (currentPage: number, pageCount: number) => ({
        margin: [63, -10, 0, 0],
        table: {
          widths: [90],
          body: [
            [
              {
                image: LOGO_BASE64_STRING,
                fit: [90, 90],
                alignment: 'center',
              },
            ],
          ],
        },
        layout: 'noBorders',
      }),
      content: [
        {
          text: setting.business_name.toUpperCase(),
          style: 'ticketCompanyName',
          alignment: 'center',
        },
        {
          text: 'RUC:' + setting.ruc,
          style: 'ticketInfoSmall',
          alignment: 'center',
        },
        {
          text: 'Tel: ' + setting.phone_number,
          style: 'ticketInfoSmall',
          alignment: 'center',
          margin: [0, 0, 0, 0],
        },
        {
          text: '----------------------------------------------',
          style: 'ticketSeparator',
          alignment: 'center',
        },
        // {
        //   text: `COMPROBANTE DE MOVIMIENTO DE CAJA`,
        //   style: 'ticketMainTitle',
        //   alignment: 'center',
        // },
        {
          text: `MOVIMIENTO N°: ${getValue(movement.code, 'N/D')}`,
          style: 'ticketOrderCode',
          alignment: 'center',
          margin: [0, 0, 0, 8],
        },
        {
          text: `Fecha: ${formatDate(movement.updatedAt || Date.now())}`,
          style: 'ticketInfoSmall',
          alignment: 'center',
          margin: [0, 0, 0, 0],
        },
        {
          text: '----------------------------------------------',
          style: 'ticketSeparator',
          alignment: 'center',
        },

        // --- DETALLES DEL MOVIMIENTO ---
        {
          text: `Tipo de Movimiento: ${getValue(movement.typeMovement).toUpperCase()}`,
          style: 'ticketDetail',
        },
        {
          text: `Monto: ${formatCurrency(movement.amount)}`,
          style: 'ticketDetailHighlight',
        },
        {
          text: `Forma de Pago: ${getValue(movement.paymentsMethod).toUpperCase()}`,
          style: 'ticketDetail',
        },

        // --- DESCRIPCIÓN ---
        {
          text: 'DESCRIPCIÓN:',
          style: 'ticketSectionTitle',
          margin: [0, 8, 0, 2],
        },
        {
          text: getValue(movement.description, 'Ninguna.'),
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
          text: `Registrado por: ${userName}`,
          style: 'ticketInfoSmall',
          alignment: 'center',
        },
        {
          qr: movement.id, // Using movement ID for QR
          fit: '80',
          alignment: 'center',
          margin: [0, 10, 0, 10],
        },
        {
          text: `ID Movimiento: ${getValue(movement.id)}`,
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
          text: host,
          style: 'ticketFooterSmall',
          alignment: 'center',
        },
      ],

      // --- ESTILOS PARA TICKET ---
      styles: {
        ticketCompanyName: {
          fontSize: 10,
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
          fontSize: 11,
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
          textDecoration: 'underline',
          margin: [0, 5, 0, 1],
        },
        ticketDetail: {
          fontSize: 9,
          margin: [0, 0, 0, 2],
          lineHeight: 1.1,
        },
        ticketDetailImportant: {
          fontSize: 8,
          bold: true,
          color: '#d32f2f',
          margin: [0, 0, 0, 2],
        },
        ticketDetailHighlight: {
          fontSize: 10,
          bold: true,
          color: '#000000',
          margin: [0, 0, 0, 2],
        },
        ticketDetailSmallWrap: {
          fontSize: 7.5,
          margin: [0, 0, 0, 2],
          lineHeight: 1.1,
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
        font: 'Roboto',
        fontSize: 10,
        color: '#000000',
        lineHeight: 1,
      },
    };

    try {
      const pdfDoc = this.printer.createPdfKitDocument(
        documentDefinitionTicket,
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="movimiento_ticket_${movement.code || movement.id}.pdf"`,
      );

      pdfDoc.pipe(res);
      pdfDoc.end();
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw new InternalServerErrorException(
        'No se pudo generar el PDF del movimiento de caja.',
      );
    }
  }
}
