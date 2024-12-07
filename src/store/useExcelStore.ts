import { create } from 'zustand';
import { FileStructure } from '@/types';

interface ExcelStore {
  files: FileStructure[];
  selectedFileIndex: number;
  isProcessing: boolean;
  uploadProgress: {
    currentFile: string;
    progress: number;
    status: string;
  } | null;
  errorMessage: {
    show: boolean;
    message: string;
    type: 'error' | 'warning';
  };
  setFiles: (files: FileStructure[]) => void;
  setSelectedFileIndex: (index: number) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setUploadProgress: (progress: ExcelStore['uploadProgress']) => void;
  setErrorMessage: (error: ExcelStore['errorMessage']) => void;
  addFile: (file: FileStructure) => void;
  removeFile: (index: number) => void;
  updateFile: (index: number, file: FileStructure) => void;
}

export const useExcelStore = create<ExcelStore>((set) => ({
  files: [],
  selectedFileIndex: -1,
  isProcessing: false,
  uploadProgress: null,
  errorMessage: {
    show: false,
    message: '',
    type: 'error'
  },
  setFiles: (files) => set({ files }),
  setSelectedFileIndex: (index) => set({ selectedFileIndex: index }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  setErrorMessage: (error) => set({ errorMessage: error }),
  addFile: (file) => set((state) => ({ 
    files: [...state.files, file],
    selectedFileIndex: state.files.length
  })),
  removeFile: (index) => set((state) => {
    const newFiles = state.files.filter((_, i) => i !== index);
    return {
      files: newFiles,
      selectedFileIndex: state.selectedFileIndex > index 
        ? state.selectedFileIndex - 1 
        : state.selectedFileIndex >= newFiles.length 
        ? newFiles.length - 1 
        : state.selectedFileIndex
    };
  }),
  updateFile: (index, file) => set((state) => ({
    files: state.files.map((f, i) => i === index ? file : f)
  }))
}));
