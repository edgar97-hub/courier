import { themeQuartz, colorSchemeLight, iconSetMaterial } from 'ag-grid-community';

export const courierGridTheme = themeQuartz
  .withPart(colorSchemeLight)
  .withPart(iconSetMaterial)
  .withParams({
    headerBackgroundColor: '#012147',
    headerTextColor: '#ffffff',
    headerFontWeight: '600',
    headerFontSize: 11,
    headerHeight: 32,

    accentColor: '#f97c06',

    backgroundColor: '#ffffff',
    foregroundColor: '#000000',
    borderColor: '#e0e0e0',

    oddRowBackgroundColor: '#f8f9fa',
    selectedRowBackgroundColor: 'rgba(249, 124, 6, 0.12)',
    rangeSelectionBackgroundColor: 'rgba(249, 124, 6, 0.15)',

    fontFamily: "'Inter', sans-serif",
    fontSize: 12,

    spacing: 4,
  });
