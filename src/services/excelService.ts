import * as XLSX from 'xlsx';
import { FileStructure, SheetData } from '@/types';
import { detectColumnType } from '@/utils/fileUtils';
import { analyzeColumnHeaders, getDataRows } from '@/utils/excelUtils';

export interface ExcelProcessingCallbacks {
  onProgress?: (progress: number) => void;
  onProcessingStart?: () => void;
  onProcessingProgress?: (progress: number, sheetName: string) => void;
  onError?: (error: Error) => void;
}

const processSheet = async (
  sheet: XLSX.WorkSheet,
  sheetName: string,
  callbacks: ExcelProcessingCallbacks
): Promise<SheetData> => {
  const { onProcessingProgress } = callbacks;

  // Analyze the sheet to find the most likely header row
  const headerAnalysis = analyzeColumnHeaders(sheet);
  
  if (headerAnalysis.confidence < 0) {
    throw new Error(`Could not detect column headers reliably in sheet "${sheetName}". Please check the format.`);
  }

  onProcessingProgress?.(75, sheetName);

  // Get data rows starting from after the detected header row
  const rows = getDataRows(sheet, headerAnalysis.possibleHeaderRow);

  if (rows.length === 0) {
    throw new Error(`No data rows found in sheet "${sheetName}"`);
  }

  onProcessingProgress?.(90, sheetName);

  // Process each column using the detected headers
  const columns = headerAnalysis.headers.map((header, index) => {
    const columnValues = rows.map(row => row[index]);
    const type = detectColumnType(columnValues);
    const sample = columnValues.find(v => v !== null && v !== undefined && v !== '') || 'No data';

    return {
      name: header || `Column ${index + 1}`,
      type,
      sample: String(sample)
    };
  });

  return {
    name: sheetName,
    columns,
    preview: rows.slice(0, 3),
    isHidden: false
  };
};

export const processExcelFile = (
  file: File,
  callbacks: ExcelProcessingCallbacks = {}
): Promise<FileStructure> => {
  const { onProgress, onProcessingStart, onError } = callbacks;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        onProcessingStart?.();

        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheets: SheetData[] = [];

        // Process each sheet
        for (const sheetName of workbook.SheetNames) {
          try {
            const sheet = workbook.Sheets[sheetName];
            const processedSheet = await processSheet(sheet, sheetName, callbacks);
            sheets.push(processedSheet);
          } catch (error) {
            console.warn(`Error processing sheet "${sheetName}":`, error);
            // Continue with other sheets even if one fails
          }
        }

        if (sheets.length === 0) {
          throw new Error('No valid sheets found in the file');
        }

        // Debug information
        console.log('Excel Processing Debug Info:', {
          file: file.name,
          totalSheets: workbook.SheetNames.length,
          processedSheets: sheets.length,
          sheetsInfo: sheets.map(s => ({
            name: s.name,
            columns: s.columns.length,
            rows: s.preview.length
          }))
        });

        resolve({
          fileName: file.name,
          sheets,
          activeSheet: sheets[0].name
        });
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        onError?.(err);
        reject(err);
      }
    };

    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 50);
        onProgress?.(progress);
      }
    };

    reader.onerror = () => {
      const error = new Error('Failed to read file');
      onError?.(error);
      reject(error);
    };

    reader.readAsBinaryString(file);
  });
};
