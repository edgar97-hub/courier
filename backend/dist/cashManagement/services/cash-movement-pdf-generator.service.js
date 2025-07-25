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
exports.CashMovementPdfGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cashManagement_entity_1 = require("../entities/cashManagement.entity");
const PDFMake = require("pdfmake");
const date_fns_1 = require("date-fns");
const settings_entity_1 = require("../../settings/entities/settings.entity");
const node_fetch_1 = require("node-fetch");
const pdf_fonts_config_1 = require("../../config/pdf-fonts.config");
let CashMovementPdfGeneratorService = class CashMovementPdfGeneratorService {
    constructor(cashMovementRepository, settingRepository) {
        this.cashMovementRepository = cashMovementRepository;
        this.settingRepository = settingRepository;
        this.printer = new PDFMake(pdf_fonts_config_1.pdfMakeFonts);
    }
    async streamCashMovementPdfToResponse(movementId, req, res) {
        const movement = await this.cashMovementRepository.findOne({
            where: { id: movementId },
            relations: ['user'],
        });
        if (!movement) {
            throw new common_1.NotFoundException(`Movimiento de caja con ID ${movementId} no encontrado.`);
        }
        const [setting] = await this.settingRepository.find({
            order: {
                id: 'ASC',
            },
            take: 1,
        });
        if (!setting) {
            throw new common_1.NotFoundException(`Configuración de empresa no encontrada.`);
        }
        const formatDate = (dateInput) => {
            if (!dateInput)
                return 'N/A';
            try {
                const date = new Date(dateInput);
                if (isNaN(date.getTime()))
                    return 'Fecha inválida';
                return (0, date_fns_1.format)(date, 'dd/MM/yyyy HH:mm');
            }
            catch (e) {
                return 'Fecha inválida';
            }
        };
        const formatCurrency = (amount) => {
            if (amount === null || amount === undefined || isNaN(amount))
                return 'S/ 0.00';
            return `S/ ${Number(amount).toFixed(2)}`;
        };
        const getValue = (value, defaultValue = 'N/A') => {
            if (value === null ||
                value === undefined ||
                (typeof value === 'string' && value.trim() === '')) {
                return defaultValue;
            }
            return value.toString().trim();
        };
        async function imageToBase64(imageUrl) {
            try {
                const response = await (0, node_fetch_1.default)(imageUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(new Uint8Array(arrayBuffer));
                const base64String = buffer.toString('base64');
                const contentType = response.headers.get('content-type') || 'image/png';
                return `data:${contentType};base64,${base64String}`;
            }
            catch (error) {
                console.error('Error fetching image:', error);
                return null;
            }
        }
        const LOGO_BASE64_STRING = await imageToBase64(setting?.logo_url);
        const documentDefinition = {
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
                    columns: [],
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
            res.setHeader('Content-Disposition', `inline; filename="movimiento_${movement.code || movement.id}.pdf"`);
            pdfDoc.pipe(res);
            pdfDoc.end();
        }
        catch (error) {
            console.error('Error generando PDF:', error);
            throw new common_1.InternalServerErrorException('No se pudo generar el PDF del movimiento de caja.');
        }
    }
};
exports.CashMovementPdfGeneratorService = CashMovementPdfGeneratorService;
exports.CashMovementPdfGeneratorService = CashMovementPdfGeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cashManagement_entity_1.CashManagementEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(settings_entity_1.SettingsEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CashMovementPdfGeneratorService);
//# sourceMappingURL=cash-movement-pdf-generator.service.js.map