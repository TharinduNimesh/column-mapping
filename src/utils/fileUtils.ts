import { FileStructure } from '@/types';
import * as XLSX from 'xlsx';

export const checkDuplicateFileName = (fileName: string, existingFiles: FileStructure[]): boolean => {
  return existingFiles.some(file => file.fileName.toLowerCase() === fileName.toLowerCase());
};

export const detectColumnType = (values: any[]): string => {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  if (nonNullValues.length === 0) return 'Unknown';

  const types = nonNullValues.map(value => {
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'Integer' : 'Decimal';
    }
    if (value instanceof Date) return 'Date';
    if (typeof value === 'boolean') return 'Boolean';
    if (typeof value === 'string') {
      // Check if string is a date
      const dateValue = new Date(value);
      if (!isNaN(dateValue.getTime()) && value.includes('-')) return 'Date';
      return 'Text';
    }
    return 'Unknown';
  });

  // Return most common type
  const typeCount = types.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0][0];
};
