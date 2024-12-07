'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { ArrowLeft, Plus, X, Save, Table, AlertCircle } from 'lucide-react';
import { findBestMatch } from 'string-similarity';
import { useExcelStore } from '@/store/useExcelStore';
import { cn } from '@/lib/utils';

interface Column {
  id: string;
  name: string | undefined;
  type: 'string' | 'number' | 'date';
  required: boolean;
}

interface OutputStructure {
  sheets: string[];
  columns: Column[];
}

export default function NewStructure() {
  const router = useRouter();
  const { files, selectedFileIndex } = useExcelStore();
  const [structure, setStructure] = useState<OutputStructure>({
    sheets: ['Sheet1'],
    columns: []
  });

  const [newSheetName, setNewSheetName] = useState('');
  const [newColumn, setNewColumn] = useState<Partial<Column>>({
    name: '',
    type: 'string',
    required: false
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Get available column names from uploaded sheets
  const getAvailableColumns = () => {
    console.log('Files:', files);
    console.log('Selected Index:', selectedFileIndex);
    
    if (!files || files.length === 0 || selectedFileIndex === -1) {
      console.log('No files or invalid selection');
      return [];
    }
    
    const currentFile = files[selectedFileIndex];
    console.log('Current File:', currentFile);
    
    if (!currentFile || !currentFile.sheets) {
      console.log('No current file or sheets');
      return [];
    }

    const allColumns = new Set<string>();
    currentFile.sheets.forEach(sheet => {
      if (!sheet.isHidden && sheet.columns) {
        sheet.columns.forEach(column => {
          if (column.name) allColumns.add(column.name);
        });
      }
    });
    
    const columns = Array.from(allColumns);
    console.log('Available Columns:', columns);
    return columns;
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          setNewColumn(prev => ({ ...prev, name: suggestions[selectedIndex] }));
          setShowSuggestions(false);
          setSelectedIndex(-1);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Filter and sort suggestions based on input
  const updateSuggestions = (input: string) => {
    console.log('Updating suggestions for input:', input);
    
    if (!input) {
      console.log('Empty input, clearing suggestions');
      setSuggestions([]);
      setSelectedIndex(-1);
      return;
    }

    const availableColumns = getAvailableColumns();
    console.log('Got available columns:', availableColumns);
    
    if (availableColumns.length === 0) {
      console.log('No available columns');
      return;
    }

    const inputLower = input.toLowerCase();
    let matchedColumns: string[] = [];

    // For single letter input, show all columns that start with that letter
    if (input.length === 1) {
      matchedColumns = availableColumns.filter(col => 
        col.toLowerCase().startsWith(inputLower)
      );
    } else {
      // For longer inputs, use string similarity
      try {
        const matches = availableColumns
          .map(col => ({
            column: col,
            rating: findBestMatch(inputLower, [col.toLowerCase()]).ratings[0].rating
          }))
          .filter(match => match.rating > 0.2)
          .sort((a, b) => b.rating - a.rating)
          .map(match => match.column);

        // Remove exact duplicates
        matchedColumns = [...new Set(matches)];
      } catch (error) {
        console.error('Error in string similarity:', error);
        // Fallback to simple includes matching
        matchedColumns = availableColumns.filter(col => 
          col.toLowerCase().includes(inputLower)
        );
      }
    }

    // Take top 5 matches
    const finalSuggestions = matchedColumns.slice(0, 5);
    console.log('Final suggestions:', finalSuggestions);
    
    setSuggestions(finalSuggestions);
    setShowSuggestions(finalSuggestions.length > 0);
    setSelectedIndex(-1);
  };

  // Check for duplicate column names
  const isDuplicateColumn = (name: string) => {
    return structure.columns.some(
      col => col.name?.toLowerCase() === name.toLowerCase()
    );
  };

  const addSheet = () => {
    if (!newSheetName || structure.sheets.includes(newSheetName)) return;
    setStructure(prev => ({
      ...prev,
      sheets: [...prev.sheets, newSheetName]
    }));
    setNewSheetName('');
  };

  const removeSheet = (sheetName: string) => {
    setStructure(prev => ({
      ...prev,
      sheets: prev.sheets.filter(sheet => sheet !== sheetName)
    }));
  };

  const addColumn = () => {
    if (!newColumn.name) {
      setError('Column name is required');
      return;
    }

    if (isDuplicateColumn(newColumn.name)) {
      setError('Column name already exists');
      return;
    }

    setStructure(prev => ({
      ...prev,
      columns: [...prev.columns, {
        id: crypto.randomUUID(),
        name: newColumn.name!,
        type: newColumn.type || 'string',
        required: newColumn.required || false
      }]
    }));
    setNewColumn({ name: '', type: 'string', required: false });
    setError(null);
  };

  const removeColumn = (columnId: string) => {
    setStructure(prev => ({
      ...prev,
      columns: prev.columns.filter(col => col.id !== columnId)
    }));
  };

  const handleSave = () => {
    // TODO: Save structure to backend or local storage
    console.log('Saving structure:', structure);
  };

  // Update suggestions when typing
  useEffect(() => {
    console.log('Input changed:', newColumn.name);
    updateSuggestions(newColumn.name || '');
  }, [newColumn.name, files, selectedFileIndex]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                icon={<ArrowLeft className="w-4 h-4" />}
                className="mr-4"
              >
                Back
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Define Output Structure</h1>
            </div>
            <Button
              onClick={handleSave}
              variant="default"
              icon={<Save className="w-4 h-4 mr-2" />}
            >
              Save Structure
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Sheet Names Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Table className="w-5 h-5 mr-2" />
                Sheet Names
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  type="text"
                  value={newSheetName}
                  onChange={(e) => setNewSheetName(e.target.value)}
                  placeholder="Enter sheet name"
                  className="flex-1"
                />
                <Button
                  onClick={addSheet}
                  variant="outline"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                {structure.sheets.map((sheet) => (
                  <div
                    key={sheet}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
                  >
                    <span className="text-sm text-gray-700">{sheet}</span>
                    <Button
                      onClick={() => removeSheet(sheet)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      icon={<X className="w-4 h-4" />}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Column Structure Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Table className="w-5 h-5 mr-2" />
                Column Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 mb-4">
                <div className="relative">
                  <Command className="rounded-lg border shadow-md">
                    <CommandInput
                      placeholder="Column name"
                      value={newColumn.name}
                      onKeyDown={handleKeyDown}
                      onValueChange={(value) => {
                        console.log('Input value changed:', value);
                        setNewColumn(prev => ({ ...prev, name: value }));
                        setShowSuggestions(true);
                        setError(null);
                      }}
                      error={!!error}
                      className="bg-white text-gray-900 border-gray-200"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute w-full z-50">
                        <CommandList className="w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-[200px] overflow-auto">
                          <CommandGroup>
                            {suggestions.map((suggestion, index) => (
                              <CommandItem
                                key={suggestion}
                                onSelect={() => {
                                  console.log('Selected suggestion:', suggestion);
                                  setNewColumn(prev => ({ ...prev, name: suggestion }));
                                  setShowSuggestions(false);
                                  setSelectedIndex(-1);
                                }}
                                className={cn(
                                  "hover:bg-gray-100 cursor-pointer px-2 py-1.5",
                                  selectedIndex === index && "bg-gray-100"
                                )}
                              >
                                {suggestion}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </div>
                    )}
                  </Command>
                  {error && (
                    <div className="flex items-center mt-1 text-sm text-red-500">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {error}
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <select
                    value={newColumn.type}
                    onChange={(e) => setNewColumn(prev => ({ ...prev, type: e.target.value as Column['type'] }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="string">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                  </select>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newColumn.required}
                      onChange={(e) => setNewColumn(prev => ({ ...prev, required: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Required</span>
                  </label>
                  <Button
                    onClick={addColumn}
                    variant="outline"
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
                      <th className="px-6 py-3 relative">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {structure.columns.map((column) => (
                      <tr key={column.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{column.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{column.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {column.required ? 'Yes' : 'No'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            onClick={() => removeColumn(column.id)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            icon={<X className="w-4 h-4" />}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}