"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PdfService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
const PdfPrinter = require("pdfmake");
let PdfService = PdfService_1 = class PdfService {
    constructor() {
        this.logger = new common_1.Logger(PdfService_1.name);
        const fontDescriptors = {
            Roboto: {
                normal: path
                    .join(__dirname, '..', '..', 'node_modules', 'pdfmake', 'build', 'vfs_fonts.js')
                    .includes('vfs_fonts.js')
                    ? require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Regular.ttf']
                    : fs.readFileSync(path.resolve('./node_modules/pdfmake/build/fonts/Roboto-Regular.ttf')),
                bold: path
                    .join(__dirname, '..', '..', 'node_modules', 'pdfmake', 'build', 'vfs_fonts.js')
                    .includes('vfs_fonts.js')
                    ? require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Medium.ttf']
                    : fs.readFileSync(path.resolve('./node_modules/pdfmake/build/fonts/Roboto-Medium.ttf')),
                italics: path
                    .join(__dirname, '..', '..', 'node_modules', 'pdfmake', 'build', 'vfs_fonts.js')
                    .includes('vfs_fonts.js')
                    ? require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Italic.ttf']
                    : fs.readFileSync(path.resolve('./node_modules/pdfmake/build/fonts/Roboto-Italic.ttf')),
                bolditalics: path
                    .join(__dirname, '..', '..', 'node_modules', 'pdfmake', 'build', 'vfs_fonts.js')
                    .includes('vfs_fonts.js')
                    ? require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-MediumItalic.ttf']
                    : fs.readFileSync(path.resolve('./node_modules/pdfmake/build/fonts/Roboto-MediumItalic.ttf')),
            },
        };
        this.printer = new PdfPrinter(fontDescriptors);
    }
    formatDate(dateInput) {
        if (!dateInput)
            return 'N/A';
        try {
            const date = new Date(dateInput);
            return date.toLocaleDateString('es-PE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        }
        catch (e) {
            return String(dateInput);
        }
    }
    async generateShipmentLabel(shipmentData) {
        try {
            const docDefinition = {
                content: [
                    {
                        text: 'Etiqueta de Envío',
                        style: 'header',
                        alignment: 'center',
                        margin: [0, 0, 0, 20],
                    },
                    {
                        columns: [
                            {
                                width: '50%',
                                stack: [
                                    { text: 'Remitente:', style: 'subheader' },
                                    { text: 'Mi Empresa Logística SAC', style: 'text' },
                                    { text: 'Calle Falsa 123, Oficina 404', style: 'text' },
                                    { text: 'Lima, Perú', style: 'text' },
                                    {
                                        text: 'RUC: 20123456789',
                                        style: 'text',
                                        margin: [0, 0, 0, 10],
                                    },
                                ],
                            },
                            {
                                width: '50%',
                                stack: [
                                    { text: 'Destinatario:', style: 'subheader' },
                                    {
                                        text: shipmentData.recipient_name || 'N/A',
                                        style: 'text_bold',
                                        fontSize: 12,
                                    },
                                    {
                                        text: shipmentData.delivery_address || 'N/A',
                                        style: 'text',
                                    },
                                    {
                                        text: shipmentData.delivery_district_name || 'N/A',
                                        style: 'text',
                                    },
                                    {
                                        text: `Tel: ${shipmentData.recipient_phone || 'N/A'}`,
                                        style: 'text',
                                        margin: [0, 0, 0, 10],
                                    },
                                ],
                            },
                        ],
                        columnGap: 20,
                        margin: [0, 0, 0, 15],
                    },
                    {
                        canvas: [
                            {
                                type: 'line',
                                x1: 0,
                                y1: 5,
                                x2: 515,
                                y2: 5,
                                lineWidth: 0.5,
                                lineColor: '#cccccc',
                            },
                        ],
                        margin: [0, 5, 0, 10],
                    },
                    {
                        text: `Guía de Remisión / Código: #${shipmentData.code || 'PENDIENTE'}`,
                        style: 'subheader',
                        alignment: 'left',
                        margin: [0, 0, 0, 5],
                    },
                    {
                        text: `Fecha de Emisión: ${this.formatDate(shipmentData.createdAt || new Date())}`,
                        style: 'text',
                        alignment: 'left',
                    },
                    {
                        text: `Fecha Entrega Prog.: ${this.formatDate(shipmentData.delivery_date)}`,
                        style: 'text',
                        alignment: 'left',
                        margin: [0, 0, 0, 15],
                    },
                    {
                        text: 'Detalles del Paquete:',
                        style: 'subheader',
                        margin: [0, 10, 0, 5],
                    },
                    {
                        style: 'tableExample',
                        table: {
                            widths: ['auto', '*'],
                            body: [
                                [
                                    { text: 'Tipo de Envío:', style: 'tableHeader' },
                                    {
                                        text: shipmentData.shipment_type || 'N/A',
                                        style: 'tableCell',
                                    },
                                ],
                                [
                                    { text: 'Descripción Ítem:', style: 'tableHeader' },
                                    {
                                        text: shipmentData.item_description || 'N/A',
                                        style: 'tableCell',
                                    },
                                ],
                                [
                                    { text: 'Dimensiones (cm):', style: 'tableHeader' },
                                    {
                                        text: `L:${shipmentData.package_length_cm || 0} x An:${shipmentData.package_width_cm || 0} x Al:${shipmentData.package_height_cm || 0}`,
                                        style: 'tableCell',
                                    },
                                ],
                                [
                                    { text: 'Peso (kg):', style: 'tableHeader' },
                                    {
                                        text: `${shipmentData.package_weight_kg?.toFixed(2) || '0.00'} kg`,
                                        style: 'tableCell',
                                    },
                                ],
                                [
                                    { text: 'Costo de Envío:', style: 'tableHeader' },
                                    {
                                        text: `S/ ${shipmentData.shipping_cost?.toFixed(2) || '0.00'}`,
                                        style: 'tableCell',
                                    },
                                ],
                            ],
                        },
                        layout: {
                            hLineWidth: (i, node) => i === 0 || i === node.table.body.length ? 0.5 : 0.5,
                            vLineWidth: (i, node) => 0,
                            hLineColor: (i, node) => '#dddddd',
                            paddingLeft: (i, node) => (i === 0 ? 0 : 8),
                            paddingRight: (i, node) => i === node.table.widths.length - 1 ? 0 : 8,
                            paddingTop: (i, node) => 4,
                            paddingBottom: (i, node) => 4,
                        },
                        margin: [0, 0, 0, 15],
                    },
                    ...(shipmentData.amount_to_collect_at_delivery &&
                        shipmentData.amount_to_collect_at_delivery > 0
                        ? [
                            {
                                text: 'Instrucciones de Cobro en Destino:',
                                style: 'subheader_important',
                                margin: [0, 10, 0, 5],
                            },
                            {
                                text: `Monto a Cobrar: S/ ${shipmentData.amount_to_collect_at_delivery.toFixed(2)}`,
                                style: 'text_bold_large',
                            },
                            {
                                text: `Método de Pago: ${shipmentData.payment_method_for_collection || 'Efectivo / Otro (verificar)'}`,
                                style: 'text',
                                margin: [0, 0, 0, 15],
                            },
                        ]
                        : []),
                    ...(shipmentData.observations
                        ? [
                            {
                                text: 'Observaciones:',
                                style: 'subheader',
                                margin: [0, 10, 0, 5],
                            },
                            {
                                text: shipmentData.observations,
                                style: 'text_italic',
                                margin: [0, 0, 0, 15],
                            },
                        ]
                        : []),
                    {
                        columns: [
                            {
                                qr: `SHIPMENT_CODE:${shipmentData.code}`,
                                fit: '80',
                                alignment: 'left',
                            },
                            {
                                text: 'Firma del Receptor: _____________________\nDNI: _______________________',
                                style: 'text',
                                alignment: 'right',
                                margin: [0, 30, 0, 0],
                            },
                        ],
                        margin: [0, 20, 0, 0],
                    },
                ],
                defaultStyle: { font: 'Roboto', fontSize: 9 },
                styles: {
                    header: {
                        fontSize: 20,
                        bold: true,
                        alignment: 'center',
                        color: '#2c3e50',
                    },
                    subheader: {
                        fontSize: 11,
                        bold: true,
                        margin: [0, 8, 0, 4],
                        color: '#34495e',
                    },
                    subheader_important: {
                        fontSize: 11,
                        bold: true,
                        margin: [0, 8, 0, 4],
                        color: '#c0392b',
                    },
                    text: { margin: [0, 0, 0, 3], color: '#555' },
                    text_bold: { bold: true, color: '#333' },
                    text_bold_large: { bold: true, fontSize: 12, color: '#333' },
                    text_italic: { italics: true, color: '#555' },
                    tableHeader: { bold: true, color: '#333333', fillColor: '#f2f2f2' },
                    tableCell: {},
                    tableExample: { margin: [0, 5, 0, 15] },
                },
                pageMargins: [40, 60, 40, 60],
                footer: function (currentPage, pageCount) {
                    return {
                        columns: [
                            {
                                text: `Generado: ${new Date().toLocaleString('es-PE')}`,
                                alignment: 'left',
                                style: 'text_italic',
                                fontSize: 8,
                                margin: [40, 20, 0, 0],
                            },
                            {
                                text: `Página ${currentPage.toString()} de ${pageCount}`,
                                alignment: 'right',
                                style: 'text_italic',
                                fontSize: 8,
                                margin: [0, 20, 40, 0],
                            },
                        ],
                    };
                },
            };
            const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
            const buffers = [];
            pdfDoc.on('data', buffers.push.bind(buffers));
            pdfDoc.on('error', (err) => {
                this.logger.error('Error en stream de PDF durante la generación', err);
            });
            return new Promise((resolve, reject) => {
                pdfDoc.on('end', () => {
                    const pdfBuffer = Buffer.concat(buffers);
                    this.logger.log(`PDF generado correctamente. Tamaño: ${pdfBuffer.length} bytes`);
                    resolve(pdfBuffer);
                });
                pdfDoc.end();
            });
        }
        catch (error) {
            this.logger.error('Error generando el documento PDF:', error);
            throw new common_1.InternalServerErrorException('No se pudo generar la etiqueta PDF.');
        }
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = PdfService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PdfService);
//# sourceMappingURL=pdf.service.js.map