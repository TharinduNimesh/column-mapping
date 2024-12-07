export interface ColumnInfo {
  name: string;
  type: string;
  sample: string;
}

export interface SheetData {
  name: string;
  columns: ColumnInfo[];
  preview: any[];
  isHidden?: boolean;
}

export interface FileStructure {
  fileName: string;
  sheets: SheetData[];
  activeSheet: string;
}

export interface ErrorMessage {
  show: boolean;
  message: string;
  type: 'error' | 'warning';
  fileName?: string;
}

export interface UploadProgress {
  currentFile: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
}
