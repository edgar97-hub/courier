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
const node_fetch_1 = require("node-fetch");
const settings_entity_1 = require("../../settings/entities/settings.entity");
let OrderPdfGeneratorService = class OrderPdfGeneratorService {
    constructor(orderRepository, settingRepository) {
        this.orderRepository = orderRepository;
        this.settingRepository = settingRepository;
        this.printer = new PDFMake(pdf_fonts_config_1.pdfMakeFonts);
    }
    async streamOrderPdfToResponseTest(orderId, res) {
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
    async streamOrderPdfToResponse(orderId, req, res) {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ['user', 'company'],
        });
        if (!order) {
            throw new common_1.NotFoundException(`Pedido con ID ${orderId} no encontrado.`);
        }
        const [setting] = await this.settingRepository.find({
            order: {
                id: 'ASC',
            },
            take: 1,
        });
        if (!setting) {
            throw new common_1.NotFoundException(`empresa no encontrado`);
        }
        const formatDate = (dateInput) => {
            if (!dateInput)
                return 'N/A';
            try {
                const date = new Date(dateInput);
                if (isNaN(date.getTime()))
                    return typeof dateInput === 'string' ? dateInput : 'Inválida';
                return (0, date_fns_1.format)(date, 'dd/MM/yyyy');
            }
            catch (e) {
                return typeof dateInput === 'string' ? dateInput : 'Inválida';
            }
        };
        const formatCurrency = (amount, currencySymbol = 'S/ ') => {
            if (amount === null || amount === undefined || isNaN(amount))
                return `${currencySymbol}0.00`;
            return `${currencySymbol}${Number(amount).toFixed(2)}`;
        };
        const getValue = (value, defaultValue = '') => {
            if (value === null ||
                value === undefined ||
                (typeof value === 'string' && value.trim() === '')) {
                return defaultValue;
            }
            return value.toString().trim();
        };
        const pageSizeInPoints = 140 * 2.83465;
        const fieldBorders = [
            true,
            true,
            true,
            true,
        ];
        const fieldBorderColor = '#000000';
        const fieldLineWidth = 0.5;
        const createFieldContent = (label, value, labelStyle, valueStyle) => {
            return {
                stack: [
                    {
                        text: label.toUpperCase(),
                        style: ['fieldLabelRef', labelStyle || {}],
                        margin: [0, 0, 0, 0.5],
                    },
                    { text: getValue(value), style: ['fieldValueRef', valueStyle || {}] },
                ],
                margin: [2, 1.5, 2, 1.5],
            };
        };
        const createFieldCell = (label, value, labelStyle, valueStyle) => {
            return {
                stack: createFieldContent(label, value, labelStyle, valueStyle).stack,
                margin: createFieldContent(label, value).margin,
                border: fieldBorders,
                borderColor: [
                    fieldBorderColor,
                    fieldBorderColor,
                    fieldBorderColor,
                    fieldBorderColor,
                ],
                lineWidth: fieldLineWidth,
            };
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
            pageSize: { width: pageSizeInPoints, height: pageSizeInPoints },
            defaultStyle: {
                font: 'Roboto',
                fontSize: 8,
                lineHeight: 1.2,
                color: '#000000',
            },
            pageMargins: [30, 45, 30, 30],
            header: (currentPage, pageCount) => ({
                margin: [24, -20, 0, 0],
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
                    text: setting.business_name,
                    style: 'orderTitleRef',
                    alignment: 'left',
                    margin: [0, 0, 0, 3],
                },
                {
                    table: {
                        widths: ['*', '*'],
                        body: [
                            [
                                createFieldCell('REMITENTE', getValue(order.company.username, 'TU EMPRESA')),
                                createFieldCell('DESTINATARIO', getValue(order.recipient_name)),
                            ],
                        ],
                    },
                    layout: {
                        defaultBorder: false,
                        hLineWidth: (i, node) => 0.5,
                        vLineWidth: (i, node) => 0.5,
                        hLineColor: (i, node) => '#000000',
                        vLineColor: (i, node) => '#000000',
                        paddingTop: () => 0,
                        paddingBottom: () => 0,
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                    },
                    margin: [0, 0, 0, 2],
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
                    margin: [0, 5, 0, 2],
                },
                {
                    table: {
                        widths: ['*'],
                        body: [
                            [
                                createFieldCell('DIRECCIÓN DE ENTREGA', `${getValue(order.delivery_address)} - ${getValue(order.delivery_district_name).toUpperCase()}`),
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
                    margin: [0, 5, 0, 2],
                },
                {
                    table: {
                        widths: ['*', '*'],
                        body: [
                            [
                                createFieldCell('MÉTODO DE PAGO', getValue(order.payment_method_for_collection)),
                                createFieldCell('MONTO A COBRAR', formatCurrency(order.amount_to_collect_at_delivery), {}, { bold: true }),
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
                    margin: [0, 5, 0, 2],
                },
                {
                    table: {
                        widths: ['*', '*'],
                        body: [
                            [
                                createFieldCell('TITULAR DE CUENTA', getValue(order.company.name_account_number_owner)),
                                createFieldCell('N° CUENTA/REF.', order.company.owner_bank_account
                                    ? order.company.owner_bank_account
                                    : 'N/A'),
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
                    margin: [0, 5, 0, 2],
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
                orderTitleRef: { fontSize: 10, bold: true, alignment: 'center' },
                fieldLabelRef: { fontSize: 9, bold: true, margin: [0, 0, 0, 0.5] },
                fieldValueRef: { fontSize: 9, margin: [0, 0.5, 0, 0] },
                sectionTitleRef: { fontSize: 9, bold: true },
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
        try {
            const pdfDoc = this.printer.createPdfKitDocument(documentDefinition);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="guia_simplificada_${order.code || order.id}.pdf"`);
            pdfDoc.pipe(res);
            pdfDoc.end();
        }
        catch (error) {
            console.error('Error generando PDF:', error);
            throw new common_1.InternalServerErrorException('No se pudo generar el PDF del pedido.');
        }
    }
    async streamOrderPdfLandscapeToResponse(orderId, req, res) {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ['user', 'company'],
        });
        if (!order) {
            throw new common_1.NotFoundException(`Pedido con ID ${orderId} no encontrado.`);
        }
        const [setting] = await this.settingRepository.find({
            order: {
                id: 'ASC',
            },
            take: 1,
        });
        if (!setting) {
            throw new common_1.NotFoundException(`empresa no encontrado`);
        }
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
        const formatDate = (dateInput) => {
            if (!dateInput)
                return 'No especificada';
            try {
                const date = typeof dateInput === 'string' &&
                    !dateInput.includes('T') &&
                    dateInput.match(/^\d{4}-\d{2}-\d{2}$/)
                    ? new Date(dateInput + 'T00:00:00Z')
                    : new Date(dateInput);
                if (isNaN(date.getTime()))
                    return 'Fecha inválida';
                return (0, date_fns_1.format)(date, 'dd/MM/yyyy');
            }
            catch (e) {
                return typeof dateInput === 'string' ? dateInput : 'Fecha inválida';
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
        const userName = order.user
            ? getValue(order.user.username || order.user.email, 'Sistema')
            : 'Sistema';
        const LOGO_BASE64_STRING = await imageToBase64(setting?.logo_url);
        const A4_LANDSCAPE_WIDTH_POINTS = 841.89;
        const PAGE_MARGIN_HORIZONTAL = 105;
        const CONTENT_WIDTH_TOTAL = A4_LANDSCAPE_WIDTH_POINTS - 2 * PAGE_MARGIN_HORIZONTAL;
        const LEFT_COLUMN_WIDTH = Math.floor(CONTENT_WIDTH_TOTAL / 2) - 30;
        const RIGHT_COLUMN_WIDTH = '*';
        const documentDefinition = {
            pageSize: 'A4',
            pageOrientation: 'landscape',
            pageMargins: [PAGE_MARGIN_HORIZONTAL, 70, PAGE_MARGIN_HORIZONTAL, 30],
            header: (currentPage, pageCount) => ({
                margin: [PAGE_MARGIN_HORIZONTAL, 15, PAGE_MARGIN_HORIZONTAL, 5],
                table: {
                    widths: [LEFT_COLUMN_WIDTH, RIGHT_COLUMN_WIDTH],
                    body: [
                        [
                            {
                                table: {
                                    widths: [200, '*'],
                                    body: [
                                        [
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
                                                margin: [0, 0, 0, 0],
                                            },
                                        ],
                                    ],
                                },
                                layout: 'noBorders',
                            },
                            { text: '' },
                        ],
                    ],
                },
                layout: 'noBorders',
            }),
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
                                            margin: [0, 0, 0, 10],
                                        },
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
                                        {
                                            text: 'DESTINATARIO',
                                            style: 'sectionTitle',
                                            margin: [0, 15, 0, 8],
                                        },
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
                                                            text: getValue(order.delivery_district_name).toUpperCase(),
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
                                        {
                                            text: 'DETALLES DE COBRO',
                                            style: 'sectionTitle',
                                            margin: [0, 15, 0, 8],
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
                                                            text: getValue(order.payment_method_for_collection).toUpperCase(),
                                                            style: 'value',
                                                        },
                                                    ],
                                                ],
                                            },
                                            layout: 'noBorders',
                                        },
                                        {
                                            text: 'OBSERVACIONES',
                                            style: 'sectionTitle',
                                            margin: [0, 15, 0, 8],
                                        },
                                        {
                                            text: getValue(order.observations, 'Ninguna.'),
                                            style: 'paragraph',
                                            margin: [0, 0, 0, 15],
                                        },
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
                                                ],
                                            },
                                            layout: 'noBorders',
                                        },
                                    ],
                                },
                                {
                                    text: '',
                                },
                            ],
                        ],
                    },
                    layout: 'noBorders',
                },
            ],
            styles: {
                headerCompanyNameSmall: {
                    fontSize: 10,
                },
                headerOrderCodeSmall: {
                    fontSize: 12,
                    bold: true,
                },
                mainTitleInHeader: { fontSize: 18, bold: true, color: '#333333' },
                sectionTitle: {
                    fontSize: 12,
                    bold: true,
                    margin: [0, 10, 0, 5],
                },
                infoSection: {
                    margin: [0, 0, 0, 8],
                },
                label: {
                    fontSize: 14,
                    bold: true,
                    color: '#555555',
                    width: '400px',
                },
                value: { fontSize: 14, color: '#333333', margin: [0, 0, 0, 3] },
                valueSmall: { fontSize: 14, color: '#444444', margin: [0, 0, 0, 3] },
                valueImportant: {
                    fontSize: 14,
                    bold: true,
                    margin: [0, 0, 0, 3],
                },
                valueHighlight: {
                    fontSize: 14,
                    bold: true,
                    margin: [0, 0, 0, 3],
                },
                paragraph: {
                    fontSize: 12,
                    color: '#444444',
                    lineHeight: 1.2,
                    margin: [0, 0, 0, 10],
                },
                footerText: { fontSize: 8, color: '#AEAEAE' },
            },
            defaultStyle: {
                font: 'Roboto',
                fontSize: 9,
                lineHeight: 1.1,
                color: '#333333',
            },
        };
        try {
            const pdfDoc = this.printer.createPdfKitDocument(documentDefinition);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="guia_simplificada_${order.code || order.id}.pdf"`);
            pdfDoc.pipe(res);
            pdfDoc.end();
        }
        catch (error) {
            console.error('Error generando PDF:', error);
            throw new common_1.InternalServerErrorException('No se pudo generar el PDF del pedido.');
        }
    }
    async streamOrderPdf80mmToResponse(orderId, req, res) {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ['user', 'company'],
        });
        if (!order) {
            throw new common_1.NotFoundException(`Pedido con ID ${orderId} no encontrado.`);
        }
        const [setting] = await this.settingRepository.find({
            order: {
                id: 'ASC',
            },
            take: 1,
        });
        if (!setting) {
            throw new common_1.NotFoundException(`empresa no encontrado`);
        }
        const host = req.get('host');
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
        const formatDate = (dateInput) => {
            if (!dateInput)
                return 'No especificada';
            try {
                const date = typeof dateInput === 'string' &&
                    !dateInput.includes('T') &&
                    dateInput.match(/^\d{4}-\d{2}-\d{2}$/)
                    ? new Date(dateInput + 'T00:00:00Z')
                    : new Date(dateInput);
                if (isNaN(date.getTime()))
                    return 'Fecha inválida';
                return (0, date_fns_1.format)(date, 'dd/MM/yyyy');
            }
            catch (e) {
                return typeof dateInput === 'string' ? dateInput : 'Fecha inválida';
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
        const userName = order.user
            ? getValue(order.user.username || order.user.email, 'Sistema')
            : 'Sistema';
        const TICKET_WIDTH_MM = 80;
        const TICKET_MARGIN_MM = 13;
        const MM_TO_POINTS = 2.834645669;
        const TICKET_PAGE_WIDTH_PT = TICKET_WIDTH_MM * MM_TO_POINTS;
        const TICKET_MARGIN_PT = TICKET_MARGIN_MM * MM_TO_POINTS;
        const CONTENT_WIDTH_PT = TICKET_PAGE_WIDTH_PT - 2 * TICKET_MARGIN_PT;
        const LOGO_BASE64_STRING = await imageToBase64(setting?.logo_url);
        const documentDefinitionTicket = {
            pageSize: { width: TICKET_PAGE_WIDTH_PT, height: 'auto' },
            pageMargins: [TICKET_MARGIN_PT, 55, TICKET_MARGIN_PT, 10],
            header: (currentPage, pageCount) => ({
                margin: [63, -20, 0, 0],
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
                    text: `Fecha Reg: ${(0, date_fns_1.format)(new Date(order.createdAt || Date.now()), 'dd/MM/yy HH:mm')}`,
                    style: 'ticketInfoSmall',
                    alignment: 'center',
                    margin: [0, 0, 0, 0],
                },
                {
                    text: '----------------------------------------------',
                    style: 'ticketSeparator',
                    alignment: 'center',
                },
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
                },
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
                {
                    qr: order.tracking_code || `PEDIDO-${order.code}`,
                    fit: '80',
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
                    text: host,
                    style: 'ticketFooterSmall',
                    alignment: 'center',
                },
            ],
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
            const pdfDoc = this.printer.createPdfKitDocument(documentDefinitionTicket);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="guia_simplificada_${order.code || order.id}.pdf"`);
            pdfDoc.pipe(res);
            pdfDoc.end();
        }
        catch (error) {
            console.error('Error generando PDF:', error);
            throw new common_1.InternalServerErrorException('No se pudo generar el PDF del pedido.');
        }
    }
};
exports.OrderPdfGeneratorService = OrderPdfGeneratorService;
exports.OrderPdfGeneratorService = OrderPdfGeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(orders_entity_1.OrdersEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(settings_entity_1.SettingsEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], OrderPdfGeneratorService);
//# sourceMappingURL=order-pdf-generator.service.js.map