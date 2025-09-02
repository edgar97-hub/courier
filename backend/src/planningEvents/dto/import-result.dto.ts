export interface ImportResult {
  success: boolean;
  message: string;
  importedCount?: number;
  errors?: { row?: number; message?: string; data?: any; rowExcel?: number }[];
}
