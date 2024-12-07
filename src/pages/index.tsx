'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { FileDropzone } from '@/components/FileDropzone';
import { ErrorMessage } from '@/components/ErrorMessage';
import { FileList } from '@/components/FileList';
import { FilePreview } from '@/components/FilePreview';
import { UploadProgress } from '@/components/UploadProgress';
import { SheetManager } from '@/components/SheetManager';
import { useExcelStore } from '@/store/useExcelStore';
import { processExcelFile } from '@/services/excelService';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();
  const {
    files,
    selectedFileIndex,
    isProcessing,
    uploadProgress,
    errorMessage,
    addFile,
    removeFile,
    setSelectedFileIndex,
    setIsProcessing,
    setUploadProgress,
    setErrorMessage,
    updateFile
  } = useExcelStore();

  const selectedFile = files[selectedFileIndex];

  const handleFileUpload = useCallback(async (uploadedFiles: File[]) => {
    try {
      setIsProcessing(true);
      setErrorMessage({ show: false, message: '', type: 'error' });

      for (const file of uploadedFiles) {
        setUploadProgress({
          currentFile: file.name,
          progress: 0,
          status: 'Processing...'
        });

        const result = await processExcelFile(file, (progress) => {
          setUploadProgress({
            currentFile: file.name,
            progress,
            status: 'Processing...'
          });
        });

        addFile(result);
      }

      setUploadProgress(null);
    } catch (error) {
      setErrorMessage({
        show: true,
        message: error instanceof Error ? error.message : 'Failed to process file',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [addFile, setIsProcessing, setErrorMessage, setUploadProgress]);

  const handleSheetChange = useCallback((sheetName: string) => {
    if (!selectedFile) return;
    updateFile(selectedFileIndex, {
      ...selectedFile,
      activeSheet: sheetName
    });
  }, [selectedFile, selectedFileIndex, updateFile]);

  const handleToggleSheet = useCallback((sheetName: string) => {
    if (!selectedFile) return;
    updateFile(selectedFileIndex, {
      ...selectedFile,
      sheets: selectedFile.sheets.map(sheet => 
        sheet.name === sheetName
          ? { ...sheet, isHidden: !sheet.isHidden }
          : sheet
      )
    });
  }, [selectedFile, selectedFileIndex, updateFile]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-slate-900">Excel Column Mapping</h1>
              {selectedFile && (
                <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                  {selectedFile.fileName}
                </span>
              )}
            </div>
            <div className="text-sm text-slate-500">
              {files.length} file{files.length !== 1 ? 's' : ''} loaded
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        {!selectedFile && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="mt-2 text-lg font-medium text-slate-900">Upload Excel Files</h2>
              <p className="mt-1 text-sm text-slate-500">
                Drop your Excel files here or click to browse
              </p>
            </div>
            <FileDropzone 
              onFileSelect={handleFileUpload}
              isProcessing={isProcessing}
            />
          </div>
        )}
        
        {/* Error Messages */}
        {errorMessage.show && (
          <div className="mb-6">
            <ErrorMessage 
              message={errorMessage.message} 
              type={errorMessage.type} 
            />
          </div>
        )}

        {/* Upload Progress */}
        {uploadProgress && (
          <div className="mb-6">
            <UploadProgress
              currentFile={uploadProgress.currentFile}
              progress={uploadProgress.progress}
              status={uploadProgress.status}
            />
          </div>
        )}

        {/* Create Structure Button */}
        {files.length > 0 && (
          <div className="mb-6">
            <Button
              variant="default"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => router.push('/new-structure')}
            >
              Create Structure
            </Button>
          </div>
        )}

        {/* File Management and Preview */}
        {selectedFile && (
          <div className="flex gap-6">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                  <h2 className="text-sm font-medium text-slate-700">Files</h2>
                </div>
                <FileList
                  files={files}
                  selectedIndex={selectedFileIndex}
                  onFileSelect={setSelectedFileIndex}
                  onFileDelete={removeFile}
                />
                <div className="p-4 bg-slate-50 border-t border-slate-200">
                  <FileDropzone 
                    onFileSelect={handleFileUpload}
                    isProcessing={isProcessing}
                    compact
                  />
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Sheet Manager */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <SheetManager
                  file={selectedFile}
                  onSheetChange={handleSheetChange}
                  onToggleSheet={handleToggleSheet}
                />
              </div>

              {/* Preview */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <FilePreview file={selectedFile} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}