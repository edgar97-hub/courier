import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TDocumentDefinitions } from 'pdfmake';
import { pdfMakeFonts } from '../../config/pdf-fonts.config';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as PDFMake from 'pdfmake';
import { format } from 'date-fns';
import fetch from 'node-fetch';
import { SettingsEntity } from 'src/settings/entities/settings.entity';
import { DistributorRecordEntity } from '../entities/distributor-record.entity'; // Asegúrate que la ruta es correcta

@Injectable()
export class PdfGeneratorService {
  private printer: PDFMake;

  constructor(
    @InjectRepository(DistributorRecordEntity)
    private readonly distributorRecordRepository: Repository<DistributorRecordEntity>,
    @InjectRepository(SettingsEntity)
    private readonly settingRepository: Repository<SettingsEntity>,
  ) {
    this.printer = new PDFMake(pdfMakeFonts);
  }

  async streamDistributorRecordPdfToResponseq(
    recordId: string,
    res: Response,
  ): Promise<void> {
    // 1. OBTENER LOS DATOS
    const record = await this.distributorRecordRepository.findOne({
      where: { id: recordId },
      relations: ['user'],
    });

    if (!record) {
      throw new NotFoundException(`Registro con ID ${recordId} no encontrado.`);
    }

    // Helper para obtener y formatear valores
    const getValue = (value: any, defaultValue = '---') =>
      (value || defaultValue).toString().trim().toUpperCase();

    // 2. DEFINICIÓN DEL DOCUMENTO PDF
    const docDefinition: TDocumentDefinitions = {
      pageSize: { width: 288, height: 'auto' }, // 4 pulgadas de ancho, altura automática

      // --- ¡CORRECCIÓN CLAVE AQUÍ! ---
      // Volvemos a definir los márgenes de la página.
      // Esto creará el espacio entre el borde del papel y nuestro marco.
      pageMargins: [15, 15, 15, 15],

      defaultStyle: {
        font: 'Roboto',
        fontSize: 16,
        bold: true,
        color: '#000000',
      },

      // La función 'background' no es necesaria.

      content: [
        // Tabla principal que actúa como el marco exterior del rótulo.
        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  stack: [
                    // Título del rótulo
                    {
                      text: `DATOS DE ENVÍO #${record.code}`,
                      style: 'title',
                      alignment: 'center',
                      margin: [0, 0, 0, 20],
                    },
                    // Tabla interna para alinear el contenido
                    {
                      table: {
                        widths: ['auto', '*'],
                        body: [
                          ['REMITENTE:', getValue(record.user?.username)],
                          ['NOMBRE:', getValue(record.clientName)],
                          ['DNI:', getValue(record.clientDni)],
                          ['TELEFONO:', getValue(record.clientPhone)],
                          [
                            { text: 'DESTINO:', style: 'label' },
                            {
                              text: getValue(record.destinationAddress),
                              style: 'destinationValue',
                            },
                          ],
                          ['OBSERVACIÓN:', getValue(record.observation)],
                        ],
                      },
                      layout: {
                        defaultBorder: false,
                        paddingTop: () => 10,
                        paddingBottom: () => 10,
                        paddingRight: (i) => (i === 0 ? 15 : 0),
                        paddingLeft: () => 0,
                      },
                    },
                  ],
                  // El padding interno de la celda principal
                  margin: [15, 15, 15, 15],
                },
              ],
            ],
          },
          // Layout de la tabla principal: solo un borde exterior grueso
          layout: {
            defaultBorder: false,
            hLineWidth: () => 2,
            vLineWidth: () => 2,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
        },
      ],

      styles: {
        title: {
          fontSize: 18,
          bold: true,
          decoration: 'underline',
        },
        label: {},
        destinationValue: {
          fontSize: 22,
          bold: true,
        },
      },
    };

    // 3. GENERAR Y ENVIAR EL PDF
    try {
      const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="rotulo_${record.code}.pdf"`,
      );
      pdfDoc.pipe(res);
      pdfDoc.end();
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw new InternalServerErrorException(
        'No se pudo generar el rótulo en PDF.',
      );
    }
  }

  async streamDistributorRecordPdfToResponse2(
    recordId: string,
    res: Response,
  ): Promise<void> {
    // 1. OBTENER LOS DATOS (sin cambios)
    const record = await this.distributorRecordRepository.findOne({
      where: { id: recordId },
      relations: ['user'],
    });

    if (!record) {
      throw new NotFoundException(`Registro con ID ${recordId} no encontrado.`);
    }

    const getValue = (value: any, defaultValue = '---') =>
      (value || defaultValue).toString().trim().toUpperCase();

    // 2. DEFINICIÓN DEL DOCUMENTO PDF
    const docDefinition: TDocumentDefinitions = {
      pageSize: { width: 500, height: 500 },
      pageMargins: [30, 30, 30, 30], // Aumentar un poco el margen para que no se vea tan pegado
      defaultStyle: {
        font: 'Roboto',
        fontSize: 18,
        bold: true,
        color: '#000000',
      },

      background: function (currentPage, pageSize) {
        return {
          canvas: [
            {
              type: 'rect',
              x: 15,
              y: 15,
              w: pageSize.width - 30,
              h: pageSize.height - 30,
              lineWidth: 2,
              lineColor: '#000000',
            },
          ],
        };
      },

      content: [
        {
          text: `DATOS DE ENVÍO #${record.code}`,
          style: 'title',
          alignment: 'center',
          margin: [0, 20, 0, 20],
        },

        {
          table: {
            widths: ['auto', '*'],
            body: [
              ['REMITENTE:', getValue(record.user?.username)],
              ['NOMBRE:', getValue(record.clientName)],
              ['DNI:', getValue(record.clientDni)],
              ['TELEFONO:', getValue(record.clientPhone)],
              [
                { text: 'DESTINO:', style: 'destinationValue' },
                {
                  text: getValue(record.destinationAddress),
                  style: 'destinationValue',
                },
              ],
              ['Agencia / Oberservación:', getValue(record.observation)],
            ],
          },
          layout: {
            defaultBorder: false,
            paddingTop: () => 17, // Aumentar espaciado vertical
            paddingBottom: () => 12,
            paddingRight: (i) => (i === 0 ? 17 : 0),
            paddingLeft: () => 0,
          },
        },
      ],

      // --- ESTILOS REFINADOS ---
      styles: {
        title: {
          fontSize: 20,
          bold: true,
          decoration: 'underline',
        },
        label: {
          // Ya no necesita estilo propio, usa el defaultStyle
        },
        // Estilo especial solo para el valor del destino
        destinationValue: {
          fontSize: 22, // <-- Letra significativamente más grande
          bold: true,
        },
      },
    };

    // 3. GENERAR Y ENVIAR EL PDF (sin cambios)
    try {
      const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="rotulo_${record.code}.pdf"`,
      );
      pdfDoc.pipe(res);
      pdfDoc.end();
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw new InternalServerErrorException(
        'No se pudo generar el rótulo en PDF.',
      );
    }
  }

  async streamDistributorRecordPdfToResponse(
    recordId: string,
    res: Response,
  ): Promise<void> {
    // 1. OBTENER LOS DATOS (sin cambios)
    const record = await this.distributorRecordRepository.findOne({
      where: { id: recordId },
      relations: ['user'],
    });

    if (!record) {
      throw new NotFoundException(`Registro con ID ${recordId} no encontrado.`);
    }

    const getValue = (value: any, defaultValue = '---') =>
      (value || defaultValue).toString().trim().toUpperCase();

    const createFieldBox = (label: string, value: string) => {
      return {
        table: {
          widths: ['*'],
          body: [
            [
              {
                // Usamos text en lugar de stack, con un array de textos
                text: [
                  { text: `${label}\n`, style: 'label' }, // Añadimos un salto de línea
                  { text: value, style: 'value' },
                ],
                borderColor: ['#000000', '#000000', '#000000', '#000000'],
                border: [true, true, true, true],
                padding: [8, 5, 8, 5],
              },
            ],
          ],
        },
        layout: { defaultBorder: false },
        margin: [0, 0, 0, 10], // Espacio entre cada caja
      };
    };

    // 2. DEFINICIÓN DEL DOCUMENTO PDF (USANDO LA FUNCIÓN DE AYUDA)
    const docDefinition: any = {
      pageSize: { width: 400, height: 'auto' },
      pageMargins: [20, 20, 20, 20],
      defaultStyle: {
        font: 'Roboto',
        fontSize: 16, // Aumentamos el tamaño base
        bold: true,
        color: '#000000', // Color base negro
      },

      content: [
        {
          text: `DATOS DE ENVÍO #${getValue(record.code)}`,
          style: 'title',
          alignment: 'center',
          margin: [0, 0, 0, 15],
        },
        // Llamamos a la función de ayuda para cada campo
        createFieldBox('REMITENTE', getValue(record.user?.username)),
        createFieldBox('NOMBRE', getValue(record.clientName)),
        createFieldBox('DNI', getValue(record.clientDni)),
        createFieldBox('TELEFONO', getValue(record.clientPhone)),
        createFieldBox('DESTINO', getValue(record.destinationAddress)),
        createFieldBox('AGENCIA / OBSERVACIÓN', getValue(record.observation)),
      ],

      // Los estilos ahora son mucho más simples
      styles: {
        title: {
          fontSize: 18,
          decoration: 'underline',
        },
        label: {
          // Hereda el tamaño, color y negrita del defaultStyle
        },
        value: {
          bold: false,
          // Hereda el tamaño, color y negrita del defaultStyle
        },
      },
    };

    // 3. GENERACIÓN Y ENVÍO DEL PDF (sin cambios)
    try {
      const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="rotulo_${record.code}.pdf"`,
      );
      pdfDoc.pipe(res);
      pdfDoc.end();
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw new InternalServerErrorException(
        'No se pudo generar el rótulo en PDF.',
      ); // ... tu código para enviar el buffer a la respuesta ...
    }
  }
}
