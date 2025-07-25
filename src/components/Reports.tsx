import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import type { Transaction } from "@/contexts/AppContext";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { exportToExcel } from "@/utils/excelExport";
import {
  Download,
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  FileSpreadsheet,
  Loader2,
  Filter,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Reports = () => {
  const {
    transactions,
    programs,
    getTotalIncome,
    getTotalExpense,
    getBalance,
  } = useApp();
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reportType, setReportType] = useState("comprehensive");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const filterTransactionsByDate = (transactions: Transaction[]) => {
    if (!dateFrom && !dateTo) return transactions;

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      const fromDate = dateFrom ? new Date(dateFrom) : new Date("2000-01-01");
      const toDate = dateTo ? new Date(dateTo) : new Date("2099-12-31");

      return transactionDate >= fromDate && transactionDate <= toDate;
    });
  };

  const filteredTransactions = filterTransactionsByDate(transactions);
  const filteredIncome = filteredTransactions.filter(
    (t) => t.type === "income"
  );
  const filteredExpenses = filteredTransactions.filter(
    (t) => t.type === "expense"
  );

  const totalIncome = filteredIncome.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredExpenses.reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Income summary by category
  const incomeByCategory = filteredIncome.reduce((acc, transaction) => {
    const category = transaction.category || "Tidak Dikategorikan";
    acc[category] = (acc[category] || 0) + transaction.amount;
    return acc;
  }, {} as Record<string, number>);

  // Expense summary by category
  const expenseByCategory = filteredExpenses.reduce((acc, transaction) => {
    const category = transaction.category || "Tidak Dikategorikan";
    acc[category] = (acc[category] || 0) + transaction.amount;
    return acc;
  }, {} as Record<string, number>);

  // Program-wise expense breakdown
  const programExpenses = programs.map((program) => {
    const expenses = filteredExpenses.filter((t) => t.programId === program.id);
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const percentage =
      program.allocatedBudget > 0
        ? (totalExpense / program.allocatedBudget) * 100
        : 0;

    return {
      ...program,
      expenses,
      totalExpense,
      percentage,
      remainingBudget: program.allocatedBudget - totalExpense,
    };
  });

  // General expenses (not assigned to any program)
  const generalExpenses = filteredExpenses.filter((t) => !t.programId);
  const totalGeneralExpenses = generalExpenses.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  const generateCSV = () => {
    let csvContent = "";
    let filename = "";

    if (reportType === "comprehensive") {
      // Comprehensive Report with all details
      csvContent = "=== LAPORAN KEUANGAN KOMPREHENSIF ===\n\n";

      // Summary Section
      csvContent += "RINGKASAN KEUANGAN\n";
      csvContent += "Kategori,Jumlah Transaksi,Total (Rp)\n";
      csvContent += `Total Pemasukan,${
        filteredIncome.length
      },"${totalIncome.toLocaleString("id-ID")}"\n`;
      csvContent += `Total Pengeluaran,${
        filteredExpenses.length
      },"${totalExpense.toLocaleString("id-ID")}"\n`;
      csvContent += `Saldo Akhir,-,"${balance.toLocaleString("id-ID")}"\n\n`;

      // Income Breakdown
      csvContent += "RINCIAN PEMASUKAN PER KATEGORI\n";
      csvContent += "Kategori,Jumlah (Rp),Persentase dari Total\n";
      Object.entries(incomeByCategory).forEach(([category, amount]) => {
        const percentage =
          totalIncome > 0 ? ((amount / totalIncome) * 100).toFixed(2) : "0";
        csvContent += `"${category}","${amount.toLocaleString(
          "id-ID"
        )}","${percentage}%"\n`;
      });
      csvContent += "\n";

      // Expense Breakdown
      csvContent += "RINCIAN PENGELUARAN PER KATEGORI\n";
      csvContent += "Kategori,Jumlah (Rp),Persentase dari Total\n";
      Object.entries(expenseByCategory).forEach(([category, amount]) => {
        const percentage =
          totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(2) : "0";
        csvContent += `"${category}","${amount.toLocaleString(
          "id-ID"
        )}","${percentage}%"\n`;
      });
      csvContent += "\n";

      // Program Analysis
      csvContent += "ANALISIS PROGRAM KERJA\n";
      csvContent +=
        "Nama Program,Alokasi Dana (Rp),Dana Terpakai (Rp),Sisa Dana (Rp),Persentase Penggunaan,Status,Jumlah Transaksi\n";
      programExpenses.forEach((program) => {
        const status =
          program.percentage > 100
            ? "Over Budget"
            : program.percentage > 80
            ? "Hampir Habis"
            : "Aman";
        csvContent += `"${
          program.name
        }","${program.allocatedBudget.toLocaleString(
          "id-ID"
        )}","${program.totalExpense.toLocaleString(
          "id-ID"
        )}","${program.remainingBudget.toLocaleString(
          "id-ID"
        )}","${program.percentage.toFixed(2)}%","${status}","${
          program.expenses.length
        }"\n`;
      });

      // General expenses
      csvContent += `"Pengeluaran Umum","-","${totalGeneralExpenses.toLocaleString(
        "id-ID"
      )}","-","-","Umum","${generalExpenses.length}"\n\n`;

      // Detailed Transactions
      csvContent += "DETAIL SEMUA TRANSAKSI\n";
      csvContent +=
        "Tanggal,Jenis,Jumlah (Rp),Keterangan,Kategori,Program Kerja,Dibuat Oleh,Bukti Transaksi\n";
      filteredTransactions.forEach((transaction) => {
        const programName = transaction.programId
          ? programs.find((p) => p.id === transaction.programId)?.name ||
            "Tidak Diketahui"
          : "Umum";

        csvContent += `"${formatDate(transaction.date)}",`;
        csvContent += `"${
          transaction.type === "income" ? "Pemasukan" : "Pengeluaran"
        }",`;
        csvContent += `"${transaction.amount.toLocaleString("id-ID")}",`;
        csvContent += `"${transaction.description}",`;
        csvContent += `"${transaction.category || "Tidak Ada"}",`;
        csvContent += `"${programName}",`;
        csvContent += `"${transaction.createdBy}",`;
        csvContent += `"${transaction.receipt || "Tidak Ada"}"\n`;
      });

      filename = "laporan-keuangan-komprehensif.csv";
    } else if (reportType === "income") {
      // Income-focused report
      csvContent = "LAPORAN PEMASUKAN DETAIL\n\n";
      csvContent += "RINGKASAN PEMASUKAN\n";
      csvContent +=
        "Total Pemasukan (Rp),Jumlah Transaksi,Rata-rata per Transaksi (Rp)\n";
      const avgIncome =
        filteredIncome.length > 0 ? totalIncome / filteredIncome.length : 0;
      csvContent += `"${totalIncome.toLocaleString("id-ID")}","${
        filteredIncome.length
      }","${avgIncome.toLocaleString("id-ID")}"\n\n`;

      csvContent += "PEMASUKAN PER KATEGORI\n";
      csvContent +=
        "Kategori,Jumlah (Rp),Jumlah Transaksi,Persentase dari Total\n";
      Object.entries(incomeByCategory).forEach(([category, amount]) => {
        const count = filteredIncome.filter(
          (t) => (t.category || "Tidak Dikategorikan") === category
        ).length;
        const percentage =
          totalIncome > 0 ? ((amount / totalIncome) * 100).toFixed(2) : "0";
        csvContent += `"${category}","${amount.toLocaleString(
          "id-ID"
        )}","${count}","${percentage}%"\n`;
      });
      csvContent += "\n";

      csvContent += "DETAIL TRANSAKSI PEMASUKAN\n";
      csvContent += "Tanggal,Jumlah (Rp),Keterangan,Kategori,Dibuat Oleh\n";
      filteredIncome.forEach((transaction) => {
        csvContent += `"${formatDate(
          transaction.date
        )}","${transaction.amount.toLocaleString("id-ID")}","${
          transaction.description
        }","${transaction.category || "Tidak Ada"}","${
          transaction.createdBy
        }"\n`;
      });

      filename = "laporan-pemasukan-detail.csv";
    } else if (reportType === "expenses") {
      // Expense-focused report
      csvContent = "LAPORAN PENGELUARAN DETAIL\n\n";
      csvContent += "RINGKASAN PENGELUARAN\n";
      csvContent +=
        "Total Pengeluaran (Rp),Jumlah Transaksi,Rata-rata per Transaksi (Rp)\n";
      const avgExpense =
        filteredExpenses.length > 0
          ? totalExpense / filteredExpenses.length
          : 0;
      csvContent += `"${totalExpense.toLocaleString("id-ID")}","${
        filteredExpenses.length
      }","${avgExpense.toLocaleString("id-ID")}"\n\n`;

      csvContent += "PENGELUARAN PER KATEGORI\n";
      csvContent +=
        "Kategori,Jumlah (Rp),Jumlah Transaksi,Persentase dari Total\n";
      Object.entries(expenseByCategory).forEach(([category, amount]) => {
        const count = filteredExpenses.filter(
          (t) => (t.category || "Tidak Dikategorikan") === category
        ).length;
        const percentage =
          totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(2) : "0";
        csvContent += `"${category}","${amount.toLocaleString(
          "id-ID"
        )}","${count}","${percentage}%"\n`;
      });
      csvContent += "\n";

      csvContent += "PENGELUARAN PER PROGRAM KERJA\n";
      csvContent +=
        "Program,Jumlah (Rp),Jumlah Transaksi,Persentase dari Total Pengeluaran\n";
      programExpenses.forEach((program) => {
        const percentage =
          totalExpense > 0
            ? ((program.totalExpense / totalExpense) * 100).toFixed(2)
            : "0";
        csvContent += `"${program.name}","${program.totalExpense.toLocaleString(
          "id-ID"
        )}","${program.expenses.length}","${percentage}%"\n`;
      });
      csvContent += `"Pengeluaran Umum","${totalGeneralExpenses.toLocaleString(
        "id-ID"
      )}","${generalExpenses.length}","${
        totalExpense > 0
          ? ((totalGeneralExpenses / totalExpense) * 100).toFixed(2)
          : "0"
      }%"\n\n`;

      csvContent += "DETAIL TRANSAKSI PENGELUARAN\n";
      csvContent +=
        "Tanggal,Jumlah (Rp),Keterangan,Kategori,Program Kerja,Dibuat Oleh,Bukti Transaksi\n";
      filteredExpenses.forEach((transaction) => {
        const programName = transaction.programId
          ? programs.find((p) => p.id === transaction.programId)?.name ||
            "Tidak Diketahui"
          : "Umum";

        csvContent += `"${formatDate(
          transaction.date
        )}","${transaction.amount.toLocaleString("id-ID")}","${
          transaction.description
        }","${transaction.category || "Tidak Ada"}","${programName}","${
          transaction.createdBy
        }","${transaction.receipt || "Tidak Ada"}"\n`;
      });

      filename = "laporan-pengeluaran-detail.csv";
    }

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Berhasil",
      description: "Laporan berhasil diunduh",
    });
  };

  const generateExcel = async () => {
    setIsExporting(true);

    try {
      // Validate data before export
      if (!filteredTransactions || filteredTransactions.length === 0) {
        throw new Error("Tidak ada data transaksi untuk diexport");
      }

      if (!programs) {
        throw new Error("Data program tidak tersedia");
      }

      const exportData = {
        transactions: filteredTransactions,
        programs: programs,
        summary: {
          totalIncome,
          totalExpense,
          balance,
          programCount: programs.length,
        },
      };

      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `Financial-Report-Professional-${timestamp}.xlsx`;

      const result = await exportToExcel(exportData, filename);

      if (result.success) {
        toast({
          title: "Export Berhasil! 📊",
          description: `Laporan Excel telah diunduh: ${result.filename}`,
          variant: "default",
        });
      } else {
        throw new Error(result.error || "Export gagal tanpa pesan error");
      }
    } catch (error) {
      console.error("Export error details:", error);

      let errorMessage = "Terjadi kesalahan saat membuat file Excel";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Export Gagal",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 lg:bg-white">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 lg:relative lg:bg-transparent lg:border-0">
        <div className="px-4 py-4 lg:px-0 lg:py-6">
          <div className="flex items-center justify-between">
            {/* Title */}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 truncate lg:text-2xl lg:font-bold">
                Laporan Keuangan
              </h1>
              <p className="text-sm text-gray-500 lg:hidden">
                {filteredTransactions.length} transaksi
              </p>
              <p className="hidden lg:block text-base text-gray-600 mt-1">
                Laporan Keuangan Komprehensif
              </p>
            </div>

            {/* Action Buttons - Mobile */}
            <div className="flex items-center gap-2 lg:hidden">
              {/* Filter Button - Mobile */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="p-2">
                    <Filter className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh]">
                  <SheetHeader className="pb-4">
                    <SheetTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filter Laporan
                    </SheetTitle>
                    <SheetDescription>
                      Sesuaikan filter untuk melihat data yang diinginkan
                    </SheetDescription>
                  </SheetHeader>

                  <div className="space-y-6">
                    {/* Filter Controls */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Jenis Laporan
                        </label>
                        <Select
                          value={reportType}
                          onValueChange={setReportType}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="comprehensive">
                              📊 Komprehensif
                            </SelectItem>
                            <SelectItem value="income">
                              💰 Fokus Pemasukan
                            </SelectItem>
                            <SelectItem value="expenses">
                              💸 Fokus Pengeluaran
                            </SelectItem>
                            <SelectItem value="programs">
                              🎯 Program Kerja
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">
                            Dari Tanggal
                          </label>
                          <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="h-12"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">
                            Sampai Tanggal
                          </label>
                          <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="h-12"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Reset Button */}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDateFrom("");
                        setDateTo("");
                        setSelectedProgram("");
                      }}
                      className="w-full h-12 text-base"
                    >
                      🔄 Reset Filter
                    </Button>

                    {/* Export Actions */}
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Export Data
                      </h3>
                      <div className="space-y-3">
                        <Button
                          onClick={generateCSV}
                          disabled={filteredTransactions.length === 0}
                          className="w-full h-12 bg-green-600 hover:bg-green-700 text-base"
                        >
                          <Download className="mr-2 h-5 w-5" />
                          Export CSV
                        </Button>
                        <Button
                          onClick={generateExcel}
                          disabled={
                            isExporting || filteredTransactions.length === 0
                          }
                          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base"
                        >
                          {isExporting ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          ) : (
                            <FileSpreadsheet className="mr-2 h-5 w-5" />
                          )}
                          {isExporting ? "Exporting..." : "Export Excel"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* More Actions - Mobile */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="p-2">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[50vh]">
                  <SheetHeader className="pb-4">
                    <SheetTitle>Aksi Lainnya</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-3">
                    <Button
                      onClick={generateCSV}
                      disabled={filteredTransactions.length === 0}
                      variant="outline"
                      className="w-full h-12 text-base justify-start"
                    >
                      <Download className="mr-3 h-5 w-5 text-green-600" />
                      Export CSV
                    </Button>
                    <Button
                      onClick={generateExcel}
                      disabled={
                        isExporting || filteredTransactions.length === 0
                      }
                      variant="outline"
                      className="w-full h-12 text-base justify-start"
                    >
                      {isExporting ? (
                        <Loader2 className="mr-3 h-5 w-5 animate-spin text-blue-600" />
                      ) : (
                        <FileSpreadsheet className="mr-3 h-5 w-5 text-blue-600" />
                      )}
                      {isExporting ? "Exporting..." : "Export Excel"}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Export Buttons */}
            <div className="hidden lg:flex lg:gap-2">
              <Button
                onClick={generateCSV}
                className="bg-green-600 hover:bg-green-700"
                disabled={filteredTransactions.length === 0}
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button
                onClick={generateExcel}
                disabled={isExporting || filteredTransactions.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                )}
                {isExporting ? "Exporting..." : "Export Excel"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-4 space-y-4 lg:px-0 lg:pb-0 lg:space-y-6">
        {/* Desktop Filter Section */}
        <Card className="hidden lg:block">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Filter Laporan</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Jenis Laporan
              </label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Komprehensif</SelectItem>
                  <SelectItem value="income">Fokus Pemasukan</SelectItem>
                  <SelectItem value="expenses">Fokus Pengeluaran</SelectItem>
                  <SelectItem value="programs">Program Kerja</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Dari Tanggal
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Sampai Tanggal
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                  setSelectedProgram("");
                }}
                className="w-full"
              >
                Reset Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {/* Total Pemasukan */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-3 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 lg:p-2 rounded-lg bg-green-500 text-white lg:hidden">
                      <TrendingUp className="h-3 w-3" />
                    </div>
                    <p className="text-xs lg:text-sm font-medium text-green-700 truncate">
                      Pemasukan
                    </p>
                  </div>
                  <p className="text-sm lg:text-2xl font-bold text-green-800 mb-1 break-words">
                    {formatCurrency(totalIncome)}
                  </p>
                  <div className="flex items-center gap-1">
                    <Badge
                      variant="secondary"
                      className="text-xs bg-green-200 text-green-800 px-1.5 py-0.5"
                    >
                      {filteredIncome.length}
                    </Badge>
                    <span className="text-xs text-green-600 hidden lg:inline">
                      transaksi
                    </span>
                  </div>
                </div>
                <div className="hidden lg:block p-3 rounded-full bg-green-100">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Pengeluaran */}
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-3 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 lg:p-2 rounded-lg bg-red-500 text-white lg:hidden">
                      <TrendingDown className="h-3 w-3" />
                    </div>
                    <p className="text-xs lg:text-sm font-medium text-red-700 truncate">
                      Pengeluaran
                    </p>
                  </div>
                  <p className="text-sm lg:text-2xl font-bold text-red-800 mb-1 break-words">
                    {formatCurrency(totalExpense)}
                  </p>
                  <div className="flex items-center gap-1">
                    <Badge
                      variant="secondary"
                      className="text-xs bg-red-200 text-red-800 px-1.5 py-0.5"
                    >
                      {filteredExpenses.length}
                    </Badge>
                    <span className="text-xs text-red-600 hidden lg:inline">
                      transaksi
                    </span>
                  </div>
                </div>
                <div className="hidden lg:block p-3 rounded-full bg-red-100">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saldo */}
          <Card
            className={`bg-gradient-to-br border-2 hover:shadow-lg transition-all duration-200 ${
              balance >= 0
                ? "from-blue-50 to-blue-100 border-blue-200"
                : "from-red-50 to-red-100 border-red-200"
            }`}
          >
            <CardContent className="p-3 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`p-1.5 lg:p-2 rounded-lg text-white lg:hidden ${
                        balance >= 0 ? "bg-blue-500" : "bg-red-500"
                      }`}
                    >
                      <DollarSign className="h-3 w-3" />
                    </div>
                    <p
                      className={`text-xs lg:text-sm font-medium truncate ${
                        balance >= 0 ? "text-blue-700" : "text-red-700"
                      }`}
                    >
                      Saldo
                    </p>
                  </div>
                  <p
                    className={`text-sm lg:text-2xl font-bold mb-1 break-words ${
                      balance >= 0 ? "text-blue-800" : "text-red-800"
                    }`}
                  >
                    {formatCurrency(balance)}
                  </p>
                  <div className="flex items-center gap-1">
                    <Badge
                      variant={balance >= 0 ? "default" : "destructive"}
                      className="text-xs px-1.5 py-0.5"
                    >
                      {balance >= 0 ? "Surplus" : "Defisit"}
                    </Badge>
                  </div>
                </div>
                <div
                  className={`hidden lg:block p-3 rounded-full ${
                    balance >= 0 ? "bg-blue-100" : "bg-red-100"
                  }`}
                >
                  <DollarSign
                    className={`h-6 w-6 ${
                      balance >= 0 ? "text-blue-600" : "text-red-600"
                    }`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Program Aktif */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-3 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 lg:p-2 rounded-lg bg-purple-500 text-white lg:hidden">
                      <Target className="h-3 w-3" />
                    </div>
                    <p className="text-xs lg:text-sm font-medium text-purple-700 truncate">
                      Program
                    </p>
                  </div>
                  <p className="text-sm lg:text-2xl font-bold text-purple-800 mb-1">
                    {programs.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <Badge
                      variant="secondary"
                      className="text-xs bg-purple-200 text-purple-800 px-1.5 py-0.5"
                    >
                      {
                        programs.filter((p) => p.usedBudget < p.allocatedBudget)
                          .length
                      }{" "}
                      aktif
                    </Badge>
                  </div>
                </div>
                <div className="hidden lg:block p-3 rounded-full bg-purple-100">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Content Based on Type */}
        {reportType === "comprehensive" && (
          <>
            {/* Income by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Pemasukan per Kategori</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-right">
                        Jumlah Transaksi
                      </TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Persentase</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(incomeByCategory).map(
                      ([category, amount]) => {
                        const count = filteredIncome.filter(
                          (t) =>
                            (t.category || "Tidak Dikategorikan") === category
                        ).length;
                        const percentage =
                          totalIncome > 0
                            ? ((amount / totalIncome) * 100).toFixed(1)
                            : "0";
                        return (
                          <TableRow key={category}>
                            <TableCell className="font-medium">
                              {category}
                            </TableCell>
                            <TableCell className="text-right">
                              {count}
                            </TableCell>
                            <TableCell className="text-right text-green-600 font-semibold">
                              {formatCurrency(amount)}
                            </TableCell>
                            <TableCell className="text-right">
                              {percentage}%
                            </TableCell>
                          </TableRow>
                        );
                      }
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Expense by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Pengeluaran per Kategori</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-right">
                        Jumlah Transaksi
                      </TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Persentase</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(expenseByCategory).map(
                      ([category, amount]) => {
                        const count = filteredExpenses.filter(
                          (t) =>
                            (t.category || "Tidak Dikategorikan") === category
                        ).length;
                        const percentage =
                          totalExpense > 0
                            ? ((amount / totalExpense) * 100).toFixed(1)
                            : "0";
                        return (
                          <TableRow key={category}>
                            <TableCell className="font-medium">
                              {category}
                            </TableCell>
                            <TableCell className="text-right">
                              {count}
                            </TableCell>
                            <TableCell className="text-right text-red-600 font-semibold">
                              {formatCurrency(amount)}
                            </TableCell>
                            <TableCell className="text-right">
                              {percentage}%
                            </TableCell>
                          </TableRow>
                        );
                      }
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Program Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Analisis Program Kerja</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Program</TableHead>
                      <TableHead className="text-right">Alokasi</TableHead>
                      <TableHead className="text-right">Terpakai</TableHead>
                      <TableHead className="text-right">Sisa</TableHead>
                      <TableHead className="text-right">Persentase</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programExpenses.map((program) => {
                      const status =
                        program.percentage > 100
                          ? "Over Budget"
                          : program.percentage > 80
                          ? "Hampir Habis"
                          : "Aman";
                      const statusColor =
                        program.percentage > 100
                          ? "text-red-600"
                          : program.percentage > 80
                          ? "text-yellow-600"
                          : "text-green-600";

                      return (
                        <TableRow key={program.id}>
                          <TableCell className="font-medium">
                            {program.name}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(program.allocatedBudget)}
                          </TableCell>
                          <TableCell className="text-right text-red-600">
                            {formatCurrency(program.totalExpense)}
                          </TableCell>
                          <TableCell className="text-right text-blue-600">
                            {formatCurrency(program.remainingBudget)}
                          </TableCell>
                          <TableCell
                            className={`text-right font-semibold ${statusColor}`}
                          >
                            {program.percentage.toFixed(1)}%
                          </TableCell>
                          <TableCell
                            className={`text-right font-semibold ${statusColor}`}
                          >
                            {status}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow className="border-t-2">
                      <TableCell className="font-medium">
                        Pengeluaran Umum
                      </TableCell>
                      <TableCell className="text-right">-</TableCell>
                      <TableCell className="text-right text-red-600">
                        {formatCurrency(totalGeneralExpenses)}
                      </TableCell>
                      <TableCell className="text-right">-</TableCell>
                      <TableCell className="text-right">-</TableCell>
                      <TableCell className="text-right text-gray-600">
                        Umum
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {reportType === "income" && (
          <Card>
            <CardHeader>
              <CardTitle>Detail Pemasukan</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Dibuat Oleh</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncome.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {transaction.category || "Tidak Dikategorikan"}
                        </span>
                      </TableCell>
                      <TableCell>{transaction.createdBy}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        +{formatCurrency(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {reportType === "expenses" && (
          <Card>
            <CardHeader>
              <CardTitle>Detail Pengeluaran</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Dibuat Oleh</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((transaction) => {
                    const programName = transaction.programId
                      ? programs.find((p) => p.id === transaction.programId)
                          ?.name || "Tidak Diketahui"
                      : "Umum";

                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            {transaction.category || "Tidak Dikategorikan"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {programName}
                          </span>
                        </TableCell>
                        <TableCell>{transaction.createdBy}</TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          -{formatCurrency(transaction.amount)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {reportType === "programs" && (
          <Card>
            <CardHeader>
              <CardTitle>Laporan Program Kerja</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Program</TableHead>
                    <TableHead className="text-right">Alokasi</TableHead>
                    <TableHead className="text-right">Terpakai</TableHead>
                    <TableHead className="text-right">Sisa</TableHead>
                    <TableHead className="text-right">Persentase</TableHead>
                    <TableHead className="text-right">Transaksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programExpenses.map((program) => {
                    const percentage =
                      program.allocatedBudget > 0
                        ? (program.totalExpense / program.allocatedBudget) * 100
                        : 0;

                    return (
                      <TableRow key={program.id}>
                        <TableCell className="font-medium">
                          {program.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(program.allocatedBudget)}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          {formatCurrency(program.totalExpense)}
                        </TableCell>
                        <TableCell className="text-right text-blue-600">
                          {formatCurrency(
                            program.allocatedBudget - program.totalExpense
                          )}
                        </TableCell>
                        <TableCell
                          className={`text-right font-semibold ${
                            percentage > 100
                              ? "text-red-600"
                              : percentage > 80
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {percentage.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right">
                          {program.expenses.length}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Reports;
