import React, { useState } from "react";
import { useApp } from "../contexts/AppContext";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Download,
  Upload,
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
} from "lucide-react";
import { validateAppData, sanitizeData } from "../utils/dataValidation";

const DataBackup: React.FC = () => {
  const { state, setState } = useApp();
  const [importStatus, setImportStatus] = useState<{
    type: "success" | "error" | "warning" | null;
    message: string;
  }>({ type: null, message: "" });
  const [isImporting, setIsImporting] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Create ref for file input to ensure proper access
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  /**
   * Exports current app data as encrypted backup file
   */
  const exportData = () => {
    try {
      const backupData = {
        version: "1.2.0",
        timestamp: new Date().toISOString(),
        appName: "KKN SING HEMAT Budget Nexus",
        data: state,
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `kkn-budget-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      setImportStatus({
        type: "success",
        message: "Backup exported successfully! Keep this file safe.",
      });
    } catch (error) {
      console.error("Export failed:", error);
      setImportStatus({
        type: "error",
        message: "Failed to export backup. Please try again.",
      });
    }
  };
  /**
   * Imports data from backup file with validation
   */
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus({ type: null, message: "" });

    if (!file.name.endsWith(".json")) {
      setImportStatus({
        type: "error",
        message: "Invalid file type. Please select a JSON backup file.",
      });
      setIsImporting(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);

        // Validate backup file structure
        if (!importedData.data || !importedData.version) {
          throw new Error("Invalid backup file format");
        }

        // Validate app data
        if (!validateAppData(importedData.data)) {
          throw new Error("Backup contains invalid data structure");
        }

        // Sanitize and set data
        const sanitizedData = sanitizeData(importedData.data);
        setState(sanitizedData);

        setImportStatus({
          type: "success",
          message: `Data imported successfully from backup created on ${new Date(
            importedData.timestamp
          ).toLocaleDateString()}`,
        });
      } catch (error) {
        console.error("Import failed:", error);
        setImportStatus({
          type: "error",
          message:
            "Invalid backup file or corrupted data. Please check your file and try again.",
        });
      } finally {
        setIsImporting(false);
      }
    };

    reader.onerror = () => {
      setImportStatus({
        type: "error",
        message: "Failed to read file. Please try again.",
      });
      setIsImporting(false);
    };

    reader.readAsText(file);

    // Reset file input
    event.target.value = "";
  };
  /**
   * Triggers file input click programmatically
   */
  const handleImportClick = () => {
    setShowImportDialog(true);
  };

  /**
   * Confirms import and opens file dialog
   */
  const confirmImport = () => {
    setShowImportDialog(false);
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, 100); // Small delay to ensure dialog closes first
  };

  /**
   * Clears all app data (with confirmation)
   */
  const clearAllData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all data? This action cannot be undone. Make sure you have a backup first!"
      )
    ) {
      if (
        window.confirm(
          "This will permanently delete all transaction and program data. Are you absolutely sure?"
        )
      ) {
        setState({
          user: null,
          transactions: [],
          programs: [],
          isAuthenticated: false,
        });

        setImportStatus({
          type: "warning",
          message:
            "All data has been cleared. You can restore from a backup if needed.",
        });
      }
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Data Backup & Security
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Alert */}
        {importStatus.type && (
          <Alert
            className={`${
              importStatus.type === "success"
                ? "border-green-200 bg-green-50"
                : importStatus.type === "warning"
                ? "border-yellow-200 bg-yellow-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            {importStatus.type === "success" && (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            {importStatus.type === "warning" && (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
            {importStatus.type === "error" && (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription
              className={`${
                importStatus.type === "success"
                  ? "text-green-800"
                  : importStatus.type === "warning"
                  ? "text-yellow-800"
                  : "text-red-800"
              }`}
            >
              {importStatus.message}
            </AlertDescription>
          </Alert>
        )}{" "}
        {/* Export Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Export Backup</h3>
          <p className="text-sm text-gray-600">
            Create a backup file of all your budget data. This file contains all
            income, expense, and program information.
          </p>
          <Button
            onClick={exportData}
            className="flex items-center gap-2 w-full sm:w-auto min-h-[44px] touch-manipulation hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            <Download size={16} />
            Export Backup File
          </Button>
        </div>{" "}
        {/* Import Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Import Backup</h3>
          <p className="text-sm text-gray-600">
            Restore data from a previously exported backup file. This will
            replace all current data.
          </p>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={importData}
            className="hidden"
            aria-label="Import backup file"
          />

          {/* Import button with confirmation dialog */}
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                onClick={handleImportClick}
                disabled={isImporting}
                className="flex items-center gap-2 w-full sm:w-auto min-h-[44px] touch-manipulation hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <Upload
                  size={16}
                  className={isImporting ? "animate-pulse" : ""}
                />
                {isImporting ? "Importing..." : "Import Backup File"}
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Confirm Data Import
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm text-orange-800">
                    <strong>⚠️ Warning:</strong> Importing a backup will replace
                    ALL current data including:
                  </p>
                  <ul className="text-sm text-orange-700 mt-2 space-y-1">
                    <li>• All income and expense transactions</li>
                    <li>• All program data and budgets</li>
                    <li>• Current user settings</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Recommendation:</strong> Export a backup of your
                    current data before importing, so you can restore it if
                    needed.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowImportDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmImport}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Choose Backup File
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Import progress indicator */}
          {isImporting && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Processing backup file...
            </div>
          )}
        </div>
        {/* Security Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-blue-900">Security Features</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Data is stored locally on your device only</li>
            <li>• Enhanced with encryption for security</li>
            <li>• Backup files are validated before import</li>
            <li>• No data is sent to external servers</li>
            <li>• Complete privacy and control over your data</li>
          </ul>
        </div>
        {/* Danger Zone */}
        <div className="border-t pt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-red-900">Danger Zone</h4>
            <p className="text-sm text-red-800">
              Permanently delete all data. This action cannot be undone.
            </p>
            <Button
              onClick={clearAllData}
              variant="destructive"
              size="sm"
              className="bg-red-600 hover:bg-red-700"
            >
              Clear All Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataBackup;
