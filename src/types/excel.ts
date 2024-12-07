export interface ExcelSheet {
  headers: string[];
  data: any[][];
}

export interface ExcelFile {
  name: string;
  sheets: { [key: string]: ExcelSheet };
}

export interface ExcelStore {
  files: ExcelFile[];
  selectedFileIndex: number | null;
  addFile: (file: ExcelFile) => void;
  removeFile: (index: number) => void;
  setSelectedFileIndex: (index: number | null) => void;
  updateFile: (index: number, file: ExcelFile) => void;
}
