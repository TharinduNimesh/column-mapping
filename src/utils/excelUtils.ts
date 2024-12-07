import * as XLSX from 'xlsx';

interface CellInfo {
  value: any;
  isMerged: boolean;
  mergeInfo?: {
    start: { row: number; col: number };
    end: { row: number; col: number };
  };
}

interface ColumnAnalysis {
  possibleHeaderRow: number;
  confidence: number;
  headers: string[];
}

export const getCellValue = (worksheet: XLSX.WorkSheet, row: number, col: number): CellInfo => {
  const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
  const cell = worksheet[cellAddress];
  const value = cell ? cell.v : undefined;

  // Check if cell is part of a merged range
  const merges = worksheet['!merges'] || [];
  const mergeInfo = merges.find(range => 
    row >= range.s.r && row <= range.e.r &&
    col >= range.s.c && col <= range.e.c
  );

  if (mergeInfo) {
    // For merged cells, get value from the top-left cell
    const topLeftCell = worksheet[XLSX.utils.encode_cell({ r: mergeInfo.s.r, c: mergeInfo.s.c })];
    return {
      value: topLeftCell ? topLeftCell.v : undefined,
      isMerged: true,
      mergeInfo: {
        start: { row: mergeInfo.s.r, col: mergeInfo.s.c },
        end: { row: mergeInfo.e.r, col: mergeInfo.e.c }
      }
    };
  }

  return {
    value,
    isMerged: false
  };
};

export const analyzeColumnHeaders = (worksheet: XLSX.WorkSheet, maxRowsToAnalyze = 10): ColumnAnalysis => {
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  const numCols = range.e.c - range.s.c + 1;
  const analysisRows = Math.min(maxRowsToAnalyze, range.e.r + 1);
  
  let bestHeaderRow = 0;
  let bestConfidence = 0;
  let bestHeaders: string[] = [];

  // Analyze each row as a potential header row
  for (let row = 0; row < analysisRows; row++) {
    let confidence = 0;
    const headers: string[] = [];
    let emptyCount = 0;
    let hasNumericValues = false;

    // Analyze each cell in the row
    for (let col = 0; col <= range.e.c; col++) {
      const cellInfo = getCellValue(worksheet, row, col);
      const value = cellInfo.value;
      
      if (value === undefined || value === '') {
        emptyCount++;
        headers.push(`Column ${col + 1}`);
        continue;
      }

      // Convert to string and clean up
      const headerText = String(value).trim();
      headers.push(headerText);

      // Analyze the cell content
      if (typeof value === 'number') {
        hasNumericValues = true;
        confidence -= 5; // Numeric values are less likely to be headers
      } else if (typeof value === 'string') {
        // Check for common header patterns
        if (/^[A-Z_]+$/i.test(headerText)) confidence += 2; // ALL_CAPS or single_word
        if (/^[A-Z][a-z]+([A-Z][a-z]+)*$/.test(headerText)) confidence += 2; // CamelCase
        if (/^[a-z]+(_[a-z]+)*$/i.test(headerText)) confidence += 2; // snake_case
        if (headerText.length > 30) confidence -= 2; // Too long for a header
        if (headerText.includes('.') || headerText.includes(',')) confidence -= 1; // Likely data
      }

      // Check the data in the next row for comparison
      if (row < range.e.r) {
        const nextRowCell = getCellValue(worksheet, row + 1, col);
        const nextValue = nextRowCell.value;

        if (nextValue !== undefined && typeof nextValue !== typeof value) {
          confidence += 2; // Different types suggest header row
        }
      }
    }

    // Adjust confidence based on row characteristics
    confidence -= (emptyCount / numCols) * 10; // Penalize empty cells
    if (hasNumericValues) confidence -= 5;
    if (row === 0) confidence += 2; // Slight preference for first row
    if (emptyCount === 0) confidence += 3; // Prefer rows with no empty cells

    // Check for merged cells
    const merges = worksheet['!merges'] || [];
    const rowHasMerges = merges.some(range => range.s.r <= row && row <= range.e.r);
    if (rowHasMerges) confidence -= 3; // Merged cells are less likely to be column headers

    // Update best match if this row has higher confidence
    if (confidence > bestConfidence) {
      bestConfidence = confidence;
      bestHeaderRow = row;
      bestHeaders = headers;
    }
  }

  return {
    possibleHeaderRow: bestHeaderRow,
    confidence: bestConfidence,
    headers: bestHeaders
  };
};

export const getDataRows = (
  worksheet: XLSX.WorkSheet, 
  headerRow: number, 
  maxRows = 1000
): any[][] => {
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  const dataRows: any[][] = [];

  // Start from the row after headers
  for (let row = headerRow + 1; row <= range.e.r && dataRows.length < maxRows; row++) {
    const rowData: any[] = [];
    let isEmptyRow = true;

    for (let col = 0; col <= range.e.c; col++) {
      const cellInfo = getCellValue(worksheet, row, col);
      const value = cellInfo.value;

      if (value !== undefined && value !== '') {
        isEmptyRow = false;
      }
      rowData.push(value);
    }

    // Skip empty rows
    if (!isEmptyRow) {
      dataRows.push(rowData);
    }
  }

  return dataRows;
};
