import * as fs from 'fs';
import * as path from 'path';

const getFontPath = (fontName: string) => {
  return path.join(process.cwd(), 'public/assets', 'fonts', fontName);
};

export const pdfMakeFonts = {
  Roboto: {
    normal: fs.readFileSync(getFontPath('Roboto-Regular.ttf')),
    bold: fs.readFileSync(getFontPath('Roboto-Medium.ttf')),
    italics: fs.readFileSync(getFontPath('Roboto-Italic.ttf')),
    bolditalics: fs.readFileSync(getFontPath('Roboto-MediumItalic.ttf')),
  },
};
