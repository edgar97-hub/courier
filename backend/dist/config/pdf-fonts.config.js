"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfMakeFonts = void 0;
const fs = require("fs");
const path = require("path");
const getFontPath = (fontName) => {
    return path.join(process.cwd(), 'public/assets', 'fonts', fontName);
};
exports.pdfMakeFonts = {
    Roboto: {
        normal: fs.readFileSync(getFontPath('Roboto-Regular.ttf')),
        bold: fs.readFileSync(getFontPath('Roboto-Medium.ttf')),
        italics: fs.readFileSync(getFontPath('Roboto-Italic.ttf')),
        bolditalics: fs.readFileSync(getFontPath('Roboto-MediumItalic.ttf')),
    },
};
//# sourceMappingURL=pdf-fonts.config.js.map