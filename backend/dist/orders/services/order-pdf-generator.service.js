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
exports.OrderPdfGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const pdf_fonts_config_1 = require("../../config/pdf-fonts.config");
const orders_entity_1 = require("../entities/orders.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const PDFMake = require("pdfmake");
const date_fns_1 = require("date-fns");
let OrderPdfGeneratorService = class OrderPdfGeneratorService {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
        this.printer = new PDFMake(pdf_fonts_config_1.pdfMakeFonts);
    }
    async streamOrderPdfToResponse(orderId, res) {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${orderId} not found`);
        }
        const formatDate = (dateInput) => {
            if (!dateInput)
                return 'N/A';
            try {
                const date = typeof dateInput === 'string' && !dateInput.includes('T')
                    ? new Date(dateInput + 'T00:00:00')
                    : new Date(dateInput);
                return (0, date_fns_1.format)(date, 'dd/MM/yyyy');
            }
            catch (e) {
                return typeof dateInput === 'string' ? dateInput : 'Fecha inválida';
            }
        };
        const formatDateTime = (dateInput) => {
            if (!dateInput)
                return 'N/A';
            try {
                const date = new Date(dateInput);
                return (0, date_fns_1.format)(date, 'dd/MM/yyyy HH:mm');
            }
            catch (e) {
                return typeof dateInput === 'string' ? dateInput : 'Fecha inválida';
            }
        };
        const formatCurrency = (amount) => {
            if (amount === null || amount === undefined)
                return 'S/ 0.00';
            return `S/ ${amount.toFixed(2)}`;
        };
        const getValue = (value, defaultValue = 'N/A') => {
            if (value === null ||
                value === undefined ||
                (typeof value === 'string' && value.trim() === '')) {
                return defaultValue;
            }
            return value.toString();
        };
        const documentDefinition = {
            pageSize: 'A4',
            pageMargins: [40, 20, 40, 20],
            header: function (currentPage, pageCount, pageSize) {
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
                    margin: [0, 20, 0, 30],
                };
            },
            content: [
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
                            margin: [0, 0, 10, 0],
                        },
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
                    margin: [0, 0, 0, 20],
                },
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
                            width: 'auto',
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
                            width: '*',
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
                    margin: [0, 0, 0, 30],
                },
                {
                    columns: [
                        {
                            qr: `PEDIDO-${getValue(order.code)}-${formatDate(order.delivery_date)}`,
                            fit: '80',
                            alignment: 'left',
                        },
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
                    margin: [0, 0, 0, 5],
                    color: '#2c3e50',
                },
                orderCode: {
                    fontSize: 16,
                    bold: true,
                    color: '#3498db',
                    margin: [0, 0, 0, 15],
                },
                sectionTitle: {
                    fontSize: 14,
                    bold: true,
                    margin: [0, 15, 0, 8],
                    color: '#34495e',
                    border: [false, false, false, true],
                    borderColor: ['#bdc3c7', '#bdc3c7', '#bdc3c7', '#bdc3c7'],
                    padding: [0, 0, 0, 2],
                },
                sectionTitleSmall: {
                    fontSize: 12,
                    bold: true,
                    color: '#7f8c8d',
                    margin: [0, 5, 0, 3],
                },
                detailText: {
                    fontSize: 10,
                    margin: [0, 0, 0, 6],
                    lineHeight: 1.2,
                    color: '#555',
                },
                detailTextList: {
                    fontSize: 10,
                    margin: [0, 0, 0, 3],
                    lineHeight: 1.2,
                    color: '#555',
                },
                detailTextImportant: {
                    fontSize: 11,
                    bold: true,
                    color: '#e74c3c',
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
        const pdfDoc = this.printer.createPdfKitDocument(documentDefinition);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="orden_${order.code || order.id}.pdf"`);
        pdfDoc.pipe(res);
        pdfDoc.end();
    }
};
exports.OrderPdfGeneratorService = OrderPdfGeneratorService;
exports.OrderPdfGeneratorService = OrderPdfGeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(orders_entity_1.OrdersEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], OrderPdfGeneratorService);
//# sourceMappingURL=order-pdf-generator.service.js.map