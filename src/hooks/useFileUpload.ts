import { useState, useCallback } from 'react';
import { FileStructure, ErrorMessage, UploadProgress } from '@/types';
import { checkDuplicateFileName } from '@/utils/fileUtils';
import { processExcelFile } from '@/services/excelService';

interface UseFileUploadReturn {
  uploadedFiles: FileStructure[];
  selectedFileIndex: number;
  isProcessing: boolean;
  uploadProgress: UploadProgress | null;
  errorMessage: ErrorMessage;
  handleFileUpload: (files: File[]) => Promise<void>;
  handleDeleteFile: (index: number) => void;
  setSelectedFileIndex: (index: number) => void;
  setUploadedFiles: (files: FileStructure[]) => void;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [uploadedFiles, setUploadedFiles] = useState<FileStructure[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage>({
    show: false,
    message: '',
    type: 'error'
  });

  const handleFileUpload = async (files: File[]) => {
    setIsProcessing(true);
    setErrorMessage({ show: false, message: '', type: 'error' });
    
    const newFiles: FileStructure[] = [];
    const duplicates: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (checkDuplicateFileName(file.name, uploadedFiles)) {
        duplicates.push(file.name);
        continue;
      }

      try {
        setUploadProgress({
          currentFile: file.name,
          progress: 0,
          status: 'uploading'
        });

        const processedFile = await processExcelFile(file, {
          onProgress: (progress) => {
            setUploadProgress(prev => prev && ({
              ...prev,
              progress
            }));
          },
          onProcessingStart: () => {
            setUploadProgress(prev => prev && ({
              ...prev,
              status: 'processing',
              progress: 75
            }));
          },
          onProcessingProgress: (progress, sheetName) => {
            setUploadProgress(prev => prev && ({
              ...prev,
              progress,
              currentFile: `Processing ${sheetName}...`
            }));
          },
          onError: () => {
            setUploadProgress(prev => prev && ({
              ...prev,
              status: 'error',
              progress: 0
            }));
          }
        });

        newFiles.push(processedFile);
        
        setUploadProgress(prev => prev && ({
          ...prev,
          status: 'complete',
          progress: 100
        }));
      } catch (error) {
        console.error('Error processing file:', error);
        errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setSelectedFileIndex(uploadedFiles.length); // Select the first new file
    }

    if (duplicates.length > 0) {
      setErrorMessage({
        show: true,
        type: 'warning',
        message: duplicates.length === 1
          ? `File "${duplicates[0]}" already exists`
          : `${duplicates.length} files already exist: ${duplicates.join(', ')}`
      });
    } else if (errors.length > 0) {
      setErrorMessage({
        show: true,
        type: 'error',
        message: `Failed to process some files: ${errors.join('; ')}`
      });
    }

    setIsProcessing(false);
    setUploadProgress(null);
  };

  const handleDeleteFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, idx) => idx !== index));
    setSelectedFileIndex(prev => prev >= index ? Math.max(0, prev - 1) : prev);
  }, []);

  return {
    uploadedFiles,
    selectedFileIndex,
    isProcessing,
    uploadProgress,
    errorMessage,
    handleFileUpload,
    handleDeleteFile,
    setSelectedFileIndex,
    setUploadedFiles
  };
};
