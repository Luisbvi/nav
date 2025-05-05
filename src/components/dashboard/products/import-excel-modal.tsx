'use client';
import { X, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';

interface ImportExcelModalProps {
  importedData: Product[];
  importErrors: string[];
  importSuccess: boolean;
  onClose: () => void;
  onConfirmImport: () => void;
}

const ImportExcelModal = ({
  importedData,
  importErrors,
  importSuccess,
  onClose,
  onConfirmImport,
}: ImportExcelModalProps) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl transform rounded-xl bg-white p-6 shadow-xl transition-all">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Import Products from Excel</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {importSuccess ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">Import Successful</h3>
              <p className="mb-6 text-gray-500">
                {importedData.length} products have been imported successfully.
              </p>
              <Button
                onClick={onClose}
                className="rounded-md bg-[#0099ff] px-4 py-2 text-white hover:bg-[#0088ee]"
              >
                Close
              </Button>
            </div>
          ) : (
            <>
              {importErrors.length > 0 && (
                <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start">
                    <AlertCircle className="mt-0.5 mr-2 h-5 w-5 text-red-500" />
                    <div>
                      <h3 className="mb-2 text-sm font-medium text-red-800">
                        {importErrors.length} errors found in the file
                      </h3>
                      <ul className="list-disc space-y-1 pl-5 text-sm text-red-700">
                        {importErrors.slice(0, 5).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {importErrors.length > 5 && (
                          <li>And {importErrors.length - 5} more errors...</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {importedData.length > 0 ? (
                <>
                  <div className="mb-4">
                    <h3 className="mb-2 font-medium text-gray-700">
                      Data preview ({importedData.length} products)
                    </h3>
                    <div className="max-h-80 overflow-x-auto rounded-md border">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="sticky top-0 bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                              Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                              Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                              Unit
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                              Stock
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {importedData.map((item, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                {item.info['en'].name}
                              </td>
                              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                {item.category}
                              </td>
                              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                ${item.price.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                {item.unit || 'KG'}
                              </td>
                              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                {item.stock}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={onClose}
                      className="rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={onConfirmImport}
                      className="rounded-md bg-[#0099ff] px-4 py-2 text-white hover:bg-[#0088ee]"
                    >
                      Confirm Import
                    </Button>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="mb-4 text-gray-500">
                    No valid data found to import. Please check the file format.
                  </p>
                  <Button
                    onClick={onClose}
                    className="rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportExcelModal;
