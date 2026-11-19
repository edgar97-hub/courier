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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const pdf_fonts_config_1 = require("../../config/pdf-fonts.config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const PDFMake = require("pdfmake");
const settings_entity_1 = require("../../settings/entities/settings.entity");
const distributor_record_entity_1 = require("../entities/distributor-record.entity");
let PdfGeneratorService = class PdfGeneratorService {
    constructor(distributorRecordRepository, settingRepository) {
        this.distributorRecordRepository = distributorRecordRepository;
        this.settingRepository = settingRepository;
        this.printer = new PDFMake(pdf_fonts_config_1.pdfMakeFonts);
    }
    async streamDistributorRecordPdfToResponseq(recordId, res) {
        const record = await this.distributorRecordRepository.findOne({
            where: { id: recordId },
            relations: ['user'],
        });
        if (!record) {
            throw new common_1.NotFoundException(`Registro con ID ${recordId} no encontrado.`);
        }
        const getValue = (value, defaultValue = '---') => (value || defaultValue).toString().trim().toUpperCase();
        const docDefinition = {
            pageSize: { width: 288, height: 'auto' },
            pageMargins: [15, 15, 15, 15],
            defaultStyle: {
                font: 'Roboto',
                fontSize: 16,
                bold: true,
                color: '#000000',
            },
            content: [
                {
                    table: {
                        widths: ['*'],
                        body: [
                            [
                                {
                                    stack: [
                                        {
                                            text: `DATOS DE ENVÍO #${record.code}`,
                                            style: 'title',
                                            alignment: 'center',
                                            margin: [0, 0, 0, 20],
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
                                    margin: [15, 15, 15, 15],
                                },
                            ],
                        ],
                    },
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
        try {
            const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="rotulo_${record.code}.pdf"`);
            pdfDoc.pipe(res);
            pdfDoc.end();
        }
        catch (error) {
            console.error('Error generando PDF:', error);
            throw new common_1.InternalServerErrorException('No se pudo generar el rótulo en PDF.');
        }
    }
    async streamDistributorRecordPdfToResponse2(recordId, res) {
        const record = await this.distributorRecordRepository.findOne({
            where: { id: recordId },
            relations: ['user'],
        });
        if (!record) {
            throw new common_1.NotFoundException(`Registro con ID ${recordId} no encontrado.`);
        }
        const getValue = (value, defaultValue = '---') => (value || defaultValue).toString().trim().toUpperCase();
        const docDefinition = {
            pageSize: { width: 500, height: 500 },
            pageMargins: [30, 30, 30, 30],
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
                        paddingTop: () => 17,
                        paddingBottom: () => 12,
                        paddingRight: (i) => (i === 0 ? 17 : 0),
                        paddingLeft: () => 0,
                    },
                },
            ],
            styles: {
                title: {
                    fontSize: 20,
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
        try {
            const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="rotulo_${record.code}.pdf"`);
            pdfDoc.pipe(res);
            pdfDoc.end();
        }
        catch (error) {
            console.error('Error generando PDF:', error);
            throw new common_1.InternalServerErrorException('No se pudo generar el rótulo en PDF.');
        }
    }
    async streamDistributorRecordPdfToResponse(recordId, res) {
        const record = await this.distributorRecordRepository.findOne({
            where: { id: recordId },
            relations: ['user'],
        });
        if (!record) {
            throw new common_1.NotFoundException(`Registro con ID ${recordId} no encontrado.`);
        }
        const getValue = (value, defaultValue = '---') => (value || defaultValue).toString().trim().toUpperCase();
        const createFieldBox = (label, value) => {
            return {
                table: {
                    widths: ['*'],
                    body: [
                        [
                            {
                                text: [
                                    { text: `${label}\n`, style: 'label' },
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
                margin: [0, 0, 0, 10],
            };
        };
        const docDefinition = {
            pageSize: { width: 400, height: 'auto' },
            pageMargins: [20, 20, 20, 20],
            defaultStyle: {
                font: 'Roboto',
                fontSize: 16,
                bold: true,
                color: '#000000',
            },
            content: [
                {
                    text: `DATOS DE ENVÍO #${getValue(record.code)}`,
                    style: 'title',
                    alignment: 'center',
                    margin: [0, 0, 0, 15],
                },
                createFieldBox('REMITENTE', getValue(record.user?.username)),
                createFieldBox('NOMBRE', getValue(record.clientName)),
                createFieldBox('DNI', getValue(record.clientDni)),
                createFieldBox('TELEFONO', getValue(record.clientPhone)),
                createFieldBox('DESTINO', getValue(record.destinationAddress)),
                createFieldBox('AGENCIA / OBSERVACIÓN', getValue(record.observation)),
            ],
            styles: {
                title: {
                    fontSize: 18,
                    decoration: 'underline',
                },
                label: {},
                value: {
                    bold: false,
                },
            },
        };
        try {
            const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="rotulo_${record.code}.pdf"`);
            pdfDoc.pipe(res);
            pdfDoc.end();
        }
        catch (error) {
            console.error('Error generando PDF:', error);
            throw new common_1.InternalServerErrorException('No se pudo generar el rótulo en PDF.');
        }
    }
};
exports.PdfGeneratorService = PdfGeneratorService;
exports.PdfGeneratorService = PdfGeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(distributor_record_entity_1.DistributorRecordEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(settings_entity_1.SettingsEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PdfGeneratorService);
//# sourceMappingURL=pdf-generator.service.js.map