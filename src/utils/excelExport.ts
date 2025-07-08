import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  date: string;
  programId?: string;
  category?: string;
  createdBy?: string;
}

export interface Program {
  id: string;
  name: string;
  allocatedBudget: number;
  usedBudget: number;
}

interface ExcelExportData {
  transactions: Transaction[];
  programs: Program[];
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    programCount: number;
  };
}

// Define color constants for consistent styling
const COLORS = {
  primary: 'FF2563EB',      // Blue
  success: 'FF10B981',      // Green
  danger: 'FFEF4444',       // Red
  warning: 'FFF59E0B',      // Yellow
  secondary: 'FF6B7280',    // Gray
  light: 'FFF3F4F6',        // Light Gray
  white: 'FFFFFFFF',        // White
  dark: 'FF1F2937',         // Dark Gray
  purple: 'FF8B5CF6',       // Purple
  orange: 'FFF97316',       // Orange
};

// Helper function to create styled cell
const createStyledCell = (value: any, style?: any) => {
  return {
    v: value,
    s: style
  };
};

// Helper function to create header style
const getHeaderStyle = (bgColor: string = COLORS.primary) => ({
  font: { 
    bold: true, 
    color: { rgb: COLORS.white },
    size: 12,
    name: 'Calibri'
  },
  fill: { 
    fgColor: { rgb: bgColor },
    patternType: 'solid'
  },
  alignment: { 
    horizontal: 'center',
    vertical: 'center',
    wrapText: true
  },
  border: {
    top: { style: 'thin', color: { rgb: COLORS.dark } },
    bottom: { style: 'thin', color: { rgb: COLORS.dark } },
    left: { style: 'thin', color: { rgb: COLORS.dark } },
    right: { style: 'thin', color: { rgb: COLORS.dark } }
  }
});

// Helper function to create data style
const getDataStyle = (textColor?: string, bgColor?: string, bold?: boolean) => ({
  font: { 
    color: textColor ? { rgb: textColor } : { rgb: COLORS.dark },
    bold: bold || false,
    size: 11,
    name: 'Calibri'
  },
  fill: bgColor ? { 
    fgColor: { rgb: bgColor },
    patternType: 'solid'
  } : undefined,
  alignment: { 
    vertical: 'center',
    wrapText: true
  },
  border: {
    top: { style: 'thin', color: { rgb: COLORS.secondary } },
    bottom: { style: 'thin', color: { rgb: COLORS.secondary } },
    left: { style: 'thin', color: { rgb: COLORS.secondary } },
    right: { style: 'thin', color: { rgb: COLORS.secondary } }
  }
});

// Helper function to create currency style
const getCurrencyStyle = (color: string, bold?: boolean) => ({
  ...getDataStyle(color, undefined, bold),
  numFmt: '"Rp "#,##0'
});

// Helper function to create title style
const getTitleStyle = () => ({
  font: { 
    bold: true, 
    size: 16,
    color: { rgb: COLORS.primary },
    name: 'Calibri'
  },
  alignment: { 
    horizontal: 'center',
    vertical: 'center'
  }
});

// Helper function to create section header style
const getSectionHeaderStyle = () => ({
  font: { 
    bold: true, 
    size: 14,
    color: { rgb: COLORS.white },
    name: 'Calibri'
  },
  fill: { 
    fgColor: { rgb: COLORS.dark },
    patternType: 'solid'
  },
  alignment: { 
    horizontal: 'center',
    vertical: 'center'
  },
  border: {
    top: { style: 'medium', color: { rgb: COLORS.dark } },
    bottom: { style: 'medium', color: { rgb: COLORS.dark } },
    left: { style: 'medium', color: { rgb: COLORS.dark } },
    right: { style: 'medium', color: { rgb: COLORS.dark } }
  }
});

export const exportToExcel = (data: ExcelExportData, filename?: string) => {
  try {
    // Create new workbook
    const workbook = XLSX.utils.book_new();
    
    // Set workbook properties
    workbook.Props = {
      Title: 'KKN Budget Nexus - Laporan Keuangan',
      Subject: 'Financial Report',
      Author: 'KKN Budget Nexus System',
      CreatedDate: new Date()
    };

    // 1. ENHANCED SUMMARY SHEET
    const summaryData = [
      [createStyledCell('KKN BUDGET NEXUS', getTitleStyle())],
      [createStyledCell('LAPORAN KEUANGAN KOMPREHENSIF', getTitleStyle())],
      [''],
      [createStyledCell(`📅 Tanggal Export: ${new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      })}`, getDataStyle(COLORS.secondary))],
      [createStyledCell(`🕐 Jam: ${new Date().toLocaleTimeString('id-ID')}`, getDataStyle(COLORS.secondary))],
      [''],
      
      // Financial Summary Section
      [createStyledCell('💰 RINGKASAN KEUANGAN', getSectionHeaderStyle())],
      [
        createStyledCell('Kategori', getHeaderStyle(COLORS.secondary)),
        createStyledCell('Jumlah', getHeaderStyle(COLORS.secondary))
      ],
      [
        createStyledCell('📈 Total Pemasukan', getDataStyle()),
        createStyledCell(data.summary.totalIncome, getCurrencyStyle(COLORS.success, true))
      ],
      [
        createStyledCell('📉 Total Pengeluaran', getDataStyle()),
        createStyledCell(data.summary.totalExpense, getCurrencyStyle(COLORS.danger, true))
      ],
      [
        createStyledCell('💵 SALDO AKHIR', getDataStyle(COLORS.dark, COLORS.light, true)),
        createStyledCell(data.summary.balance, getCurrencyStyle(
          data.summary.balance >= 0 ? COLORS.success : COLORS.danger, true
        ))
      ],
      [
        createStyledCell('🎯 Jumlah Program Aktif', getDataStyle()),
        createStyledCell(data.summary.programCount, getDataStyle(COLORS.primary, undefined, true))
      ],
      [
        createStyledCell('📊 Total Transaksi', getDataStyle()),
        createStyledCell(data.transactions.length, getDataStyle(COLORS.primary, undefined, true))
      ],
      [''],
      
      // Status Section
      [createStyledCell('📋 STATUS KEUANGAN', getSectionHeaderStyle())],
      [
        createStyledCell('Status Keuangan', getDataStyle()),
        createStyledCell(
          data.summary.balance >= 0 ? '✅ SURPLUS' : '⚠️ DEFISIT',
          getDataStyle(data.summary.balance >= 0 ? COLORS.success : COLORS.danger, 
          data.summary.balance >= 0 ? 'FFF0FDF4' : 'FFFEF2F2', true)
        )
      ],
      [
        createStyledCell('Nilai Absolut', getDataStyle()),
        createStyledCell(Math.abs(data.summary.balance), getCurrencyStyle(
          data.summary.balance >= 0 ? COLORS.success : COLORS.danger, true))
      ]
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Set column widths for summary
    summarySheet['!cols'] = [
      { width: 35 }, // Kategori
      { width: 25 }  // Jumlah
    ];
    
    // Merge cells for titles
    summarySheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }, // Title
      { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } }, // Subtitle
      { s: { r: 6, c: 0 }, e: { r: 6, c: 1 } }, // Financial header
      { s: { r: 13, c: 0 }, e: { r: 13, c: 1 } }, // Status header
    ];

    XLSX.utils.book_append_sheet(workbook, summarySheet, '📊 Ringkasan');    // 2. ENHANCED TRANSACTIONS SHEET
    const transactionHeaders = [
      createStyledCell('No', getHeaderStyle()),
      createStyledCell('📅 Tanggal', getHeaderStyle()),
      createStyledCell('📝 Deskripsi', getHeaderStyle()),
      createStyledCell('🔄 Tipe', getHeaderStyle()),
      createStyledCell('💰 Jumlah (Rp)', getHeaderStyle()),
      createStyledCell('🎯 Program', getHeaderStyle()),
      createStyledCell('🏷️ Kategori', getHeaderStyle()),
      createStyledCell('👤 Dibuat Oleh', getHeaderStyle())
    ];

    // Sort transactions by date
    const sortedTransactions = [...data.transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const transactionData = [
      [createStyledCell('💰 DETAIL TRANSAKSI KEUANGAN', getTitleStyle())],
      [createStyledCell(`📊 Total Transaksi: ${data.transactions.length}`, getDataStyle(COLORS.secondary))],
      [''],
      transactionHeaders,
      ...sortedTransactions.map((transaction, index) => {
        const programName = data.programs.find(p => p.id === transaction.programId)?.name || 'Umum';
        
        return [
          createStyledCell(index + 1, getDataStyle()),
          createStyledCell(new Date(transaction.date).toLocaleDateString('id-ID'), getDataStyle()),
          createStyledCell(transaction.description, getDataStyle()),
          createStyledCell(
            transaction.type === 'income' ? '📈 Pemasukan' : '📉 Pengeluaran',
            getDataStyle(transaction.type === 'income' ? COLORS.success : COLORS.danger, undefined, true)
          ),
          createStyledCell(
            transaction.amount,
            getCurrencyStyle(transaction.type === 'income' ? COLORS.success : COLORS.danger, true)
          ),
          createStyledCell(programName, getDataStyle()),
          createStyledCell(transaction.category || '-', getDataStyle()),
          createStyledCell(transaction.createdBy || 'System', getDataStyle(COLORS.secondary))
        ];
      }),
      [''], // Empty row
      
      // Summary rows with enhanced styling
      [
        '', '', '', 
        createStyledCell('📈 TOTAL PEMASUKAN', getDataStyle(COLORS.success, 'FFF0FDF4', true)),
        createStyledCell(
          data.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
          getCurrencyStyle(COLORS.success, true)
        ),
        '', '', ''
      ],
      [
        '', '', '',
        createStyledCell('📉 TOTAL PENGELUARAN', getDataStyle(COLORS.danger, 'FFFEF2F2', true)),
        createStyledCell(
          data.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
          getCurrencyStyle(COLORS.danger, true)
        ),
        '', '', ''
      ],
      [
        '', '', '',
        createStyledCell('💵 SALDO AKHIR', getDataStyle(COLORS.primary, COLORS.light, true)),
        createStyledCell(
          data.summary.balance,
          getCurrencyStyle(data.summary.balance >= 0 ? COLORS.success : COLORS.danger, true)
        ),
        '', '', ''
      ]
    ];

    const transactionSheet = XLSX.utils.aoa_to_sheet(transactionData);

    // Set column widths for transactions
    transactionSheet['!cols'] = [
      { width: 8 },   // No
      { width: 15 },  // Tanggal
      { width: 45 },  // Deskripsi (lebih lebar)
      { width: 18 },  // Tipe
      { width: 18 },  // Jumlah
      { width: 25 },  // Program (lebih lebar)
      { width: 20 },  // Kategori
      { width: 15 }   // Dibuat Oleh
    ];

    // Merge title cell
    transactionSheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }
    ];

    XLSX.utils.book_append_sheet(workbook, transactionSheet, '💰 Transaksi');    // 3. ENHANCED PROGRAMS SHEET
    const programHeaders = [
      createStyledCell('No', getHeaderStyle()),
      createStyledCell('🎯 Nama Program', getHeaderStyle()),
      createStyledCell('💰 Anggaran (Rp)', getHeaderStyle()),
      createStyledCell('📉 Terpakai (Rp)', getHeaderStyle()),
      createStyledCell('💵 Sisa (Rp)', getHeaderStyle()),
      createStyledCell('📊 Progress %', getHeaderStyle()),
      createStyledCell('⚡ Status', getHeaderStyle()),
      createStyledCell('📝 Transaksi', getHeaderStyle())
    ];

    const programData = [
      [createStyledCell('🎯 LAPORAN PROGRAM KERJA KKN', getTitleStyle())],
      [createStyledCell(`📊 Jumlah Program: ${data.programs.length}`, getDataStyle(COLORS.secondary))],
      [''],
      programHeaders,
      ...data.programs.map((program, index) => {
        const totalExpenses = data.transactions
          .filter(t => t.type === 'expense' && t.programId === program.id)
          .reduce((sum, t) => sum + t.amount, 0);
        
        const remaining = program.allocatedBudget - totalExpenses;
        const percentage = program.allocatedBudget > 0 ? 
          (totalExpenses / program.allocatedBudget) * 100 : 0;
        
        let status, statusColor, statusBg;
        if (percentage > 100) {
          status = '🚨 Over Budget';
          statusColor = COLORS.white;
          statusBg = COLORS.danger;
        } else if (percentage > 80) {
          status = '⚠️ Hampir Habis';
          statusColor = COLORS.dark;
          statusBg = 'FFFEF3C7'; // Yellow background
        } else {
          status = '✅ Aman';
          statusColor = COLORS.white;
          statusBg = COLORS.success;
        }

        const transactionCount = data.transactions
          .filter(t => t.type === 'expense' && t.programId === program.id).length;

        return [
          createStyledCell(index + 1, getDataStyle()),
          createStyledCell(program.name, getDataStyle(COLORS.dark, undefined, true)),
          createStyledCell(program.allocatedBudget, getCurrencyStyle(COLORS.primary)),
          createStyledCell(totalExpenses, getCurrencyStyle(COLORS.danger)),
          createStyledCell(remaining, getCurrencyStyle(remaining >= 0 ? COLORS.success : COLORS.danger, true)),
          createStyledCell(`${percentage.toFixed(1)}%`, getDataStyle(
            percentage > 100 ? COLORS.danger : percentage > 80 ? COLORS.warning : COLORS.success, 
            undefined, true)
          ),
          createStyledCell(status, getDataStyle(statusColor, statusBg, true)),
          createStyledCell(transactionCount, getDataStyle())
        ];
      }),
      [''], // Empty row
      
      // Summary totals
      [
        '', 
        createStyledCell('📊 TOTAL KESELURUHAN', getDataStyle(COLORS.primary, COLORS.light, true)),
        createStyledCell(
          data.programs.reduce((sum, p) => sum + p.allocatedBudget, 0),
          getCurrencyStyle(COLORS.primary, true)
        ),
        createStyledCell(
          data.programs.reduce((sum, p) => {
            return sum + data.transactions
              .filter(t => t.type === 'expense' && t.programId === p.id)
              .reduce((acc, t) => acc + t.amount, 0);
          }, 0),
          getCurrencyStyle(COLORS.danger, true)
        ),
        createStyledCell(
          data.programs.reduce((sum, p) => sum + p.allocatedBudget, 0) -
          data.programs.reduce((sum, p) => {
            return sum + data.transactions
              .filter(t => t.type === 'expense' && t.programId === p.id)
              .reduce((acc, t) => acc + t.amount, 0);
          }, 0),
          getCurrencyStyle(COLORS.success, true)
        ),
        '', '', ''
      ]
    ];

    const programSheet = XLSX.utils.aoa_to_sheet(programData);

    // Set column widths for programs
    programSheet['!cols'] = [
      { width: 8 },   // No
      { width: 35 },  // Nama Program (lebih lebar)
      { width: 18 },  // Anggaran
      { width: 18 },  // Terpakai
      { width: 18 },  // Sisa
      { width: 15 },  // Progress
      { width: 20 },  // Status (lebih lebar)
      { width: 12 }   // Transaksi
    ];

    // Merge title cells
    programSheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }
    ];

    XLSX.utils.book_append_sheet(workbook, programSheet, '🎯 Program');    // 4. ENHANCED MONTHLY ANALYSIS SHEET
    const monthlyData = getEnhancedMonthlyAnalysis(data.transactions);
    
    const monthlyHeaders = [
      createStyledCell('📅 Bulan', getHeaderStyle()),
      createStyledCell('📈 Pemasukan (Rp)', getHeaderStyle(COLORS.success)),
      createStyledCell('📉 Pengeluaran (Rp)', getHeaderStyle(COLORS.danger)),
      createStyledCell('💰 Net Cash Flow (Rp)', getHeaderStyle(COLORS.primary)),
      createStyledCell('🏦 Saldo Berjalan (Rp)', getHeaderStyle(COLORS.warning))
    ];

    const monthlySheetData = [
      [createStyledCell('📈 ANALISIS KEUANGAN BULANAN', getTitleStyle())],
      [createStyledCell(
        `📊 Periode: ${monthlyData.length > 0 ? 
          `${monthlyData[0].month} - ${monthlyData[monthlyData.length - 1].month}` : 
          'Tidak ada data'}`, 
        getDataStyle(COLORS.secondary)
      )],
      [''],
      monthlyHeaders,
      ...monthlyData.map(data => [
        createStyledCell(data.month, getDataStyle(COLORS.dark, undefined, true)),
        createStyledCell(data.income, getCurrencyStyle(COLORS.success)),
        createStyledCell(data.expense, getCurrencyStyle(COLORS.danger)),
        createStyledCell(data.net, getCurrencyStyle(data.net >= 0 ? COLORS.success : COLORS.danger, true)),
        createStyledCell(data.runningBalance, getCurrencyStyle(data.runningBalance >= 0 ? COLORS.success : COLORS.danger, true))
      ]),
      [''], // Empty row
      
      // Monthly analysis summary
      [
        createStyledCell('📊 RINGKASAN ANALISIS', getDataStyle(COLORS.primary, COLORS.light, true)),
        createStyledCell(
          monthlyData.length > 0 ? monthlyData.reduce((sum, d) => sum + d.income, 0) : 0,
          getCurrencyStyle(COLORS.success, true)
        ),
        createStyledCell(
          monthlyData.length > 0 ? monthlyData.reduce((sum, d) => sum + d.expense, 0) : 0,
          getCurrencyStyle(COLORS.danger, true)
        ),
        createStyledCell(
          monthlyData.length > 0 ? monthlyData.reduce((sum, d) => sum + d.net, 0) : 0,
          getCurrencyStyle(COLORS.primary, true)
        ),
        createStyledCell(
          monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].runningBalance : 0,
          getCurrencyStyle(COLORS.warning, true)
        )
      ]
    ];

    const monthlySheet = XLSX.utils.aoa_to_sheet(monthlySheetData);

    // Set column widths for monthly analysis
    monthlySheet['!cols'] = [
      { width: 20 }, // Bulan
      { width: 20 }, // Pemasukan
      { width: 20 }, // Pengeluaran
      { width: 22 }, // Net Cash Flow
      { width: 22 }  // Saldo Berjalan
    ];

    // Merge title cells
    monthlySheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }
    ];

    XLSX.utils.book_append_sheet(workbook, monthlySheet, '📈 Analisis Bulanan');    // 5. ENHANCED CATEGORY ANALYSIS SHEET
    const categoryAnalysis = getEnhancedCategoryAnalysis(data.transactions);
    
    const categoryHeaders = [
      createStyledCell('🏷️ Kategori', getHeaderStyle()),
      createStyledCell('📈 Pemasukan (Rp)', getHeaderStyle(COLORS.success)),
      createStyledCell('📉 Pengeluaran (Rp)', getHeaderStyle(COLORS.danger)),
      createStyledCell('💰 Net (Rp)', getHeaderStyle(COLORS.primary)),
      createStyledCell('📊 % dari Total', getHeaderStyle(COLORS.warning)),
      createStyledCell('📝 Transaksi', getHeaderStyle())
    ];

    const categorySheetData = [
      [createStyledCell('📋 ANALISIS PER KATEGORI', getTitleStyle())],
      [createStyledCell(`📊 Total Kategori: ${categoryAnalysis.length}`, getDataStyle(COLORS.secondary))],
      [''],
      categoryHeaders,
      ...categoryAnalysis.map(data => [
        createStyledCell(data.category, getDataStyle(COLORS.dark, undefined, true)),
        createStyledCell(data.income, getCurrencyStyle(COLORS.success)),
        createStyledCell(data.expense, getCurrencyStyle(COLORS.danger)),
        createStyledCell(data.net, getCurrencyStyle(data.net >= 0 ? COLORS.success : COLORS.danger, true)),
        createStyledCell(`${data.percentage}%`, getDataStyle(COLORS.primary, undefined, true)),
        createStyledCell(data.transactionCount, getDataStyle())
      ]),
      [''], // Empty row
      
      // Category summary
      [
        createStyledCell('📊 TOTAL KATEGORI', getDataStyle(COLORS.primary, COLORS.light, true)),
        createStyledCell(
          categoryAnalysis.reduce((sum, c) => sum + c.income, 0),
          getCurrencyStyle(COLORS.success, true)
        ),
        createStyledCell(
          categoryAnalysis.reduce((sum, c) => sum + c.expense, 0),
          getCurrencyStyle(COLORS.danger, true)
        ),
        createStyledCell(
          categoryAnalysis.reduce((sum, c) => sum + c.net, 0),
          getCurrencyStyle(COLORS.primary, true)
        ),
        createStyledCell('100%', getDataStyle(COLORS.primary, undefined, true)),
        createStyledCell(
          categoryAnalysis.reduce((sum, c) => sum + c.transactionCount, 0),
          getDataStyle(COLORS.primary, undefined, true)
        )
      ]
    ];

    const categorySheet = XLSX.utils.aoa_to_sheet(categorySheetData);

    // Set column widths for category analysis
    categorySheet['!cols'] = [
      { width: 30 }, // Kategori (lebih lebar)
      { width: 20 }, // Pemasukan
      { width: 20 }, // Pengeluaran
      { width: 18 }, // Net
      { width: 15 }, // Persentase
      { width: 15 }  // Transaksi
    ];

    // Merge title cells
    categorySheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }
    ];

    XLSX.utils.book_append_sheet(workbook, categorySheet, '📋 Kategori');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = filename || `KKN-Budget-Report-Professional-${timestamp}.xlsx`;    // Write and save file with enhanced options
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      cellStyles: true,
      sheetStubs: false
    });
    
    const data_blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    saveAs(data_blob, fileName);

    return { success: true, filename: fileName };
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return { success: false, error: (error as Error).message };
  }
};

// Enhanced helper function for monthly analysis with running balance
const getEnhancedMonthlyAnalysis = (transactions: Transaction[]) => {
  const monthlyMap = new Map<string, { month: string; income: number; expense: number; }>();
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
    
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        month: monthName,
        income: 0,
        expense: 0
      });
    }
    
    const monthData = monthlyMap.get(monthKey)!;
    if (transaction.type === 'income') {
      monthData.income += transaction.amount;
    } else {
      monthData.expense += transaction.amount;
    }
  });
  
  // Sort by month and calculate running balance
  const sortedData = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, data]) => data);
  
  let runningBalance = 0;
  
  return sortedData.map(data => {
    const net = data.income - data.expense;
    runningBalance += net;
    
    return {
      month: data.month,
      income: data.income,
      expense: data.expense,
      net: net,
      runningBalance: runningBalance
    };
  });
};

// Enhanced helper function for category analysis
const getEnhancedCategoryAnalysis = (transactions: Transaction[]) => {
  const categoryMap = new Map<string, { category: string; income: number; expense: number; transactionCount: number; }>();
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  transactions.forEach(transaction => {
    const category = transaction.category || 'Tidak Dikategorikan';
    
    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        category,
        income: 0,
        expense: 0,
        transactionCount: 0
      });
    }
    
    const categoryData = categoryMap.get(category)!;
    categoryData.transactionCount++;
    
    if (transaction.type === 'income') {
      categoryData.income += transaction.amount;
    } else {
      categoryData.expense += transaction.amount;
    }
  });
  
  return Array.from(categoryMap.values()).map(data => {
    const net = data.income - data.expense;
    const totalCategoryAmount = data.income + data.expense;
    const percentage = totalAmount > 0 ? ((totalCategoryAmount / totalAmount) * 100).toFixed(1) : '0';
    
    return {
      ...data,
      net,
      percentage
    };
  }).sort((a, b) => (b.income + b.expense) - (a.income + a.expense));
};

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
