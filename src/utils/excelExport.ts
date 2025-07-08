import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  programId?: string;
  category?: string;
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

export const exportToExcel = (data: ExcelExportData, filename?: string) => {
  try {
    // Create new workbook
    const workbook = XLSX.utils.book_new();

    // 1. SUMMARY SHEET
    const summaryData = [
      ['KKN BUDGET NEXUS - LAPORAN KEUANGAN'],
      ['Tanggal Export:', new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })],
      ['Jam:', new Date().toLocaleTimeString('id-ID')],
      [''],
      ['RINGKASAN KEUANGAN'],
      ['Total Pemasukan:', formatCurrency(data.summary.totalIncome)],
      ['Total Pengeluaran:', formatCurrency(data.summary.totalExpense)],
      ['Saldo:', formatCurrency(data.summary.balance)],
      ['Jumlah Program:', data.summary.programCount],
      ['Jumlah Transaksi:', data.transactions.length],
      [''],
      ['STATUS KEUANGAN'],
      [data.summary.balance >= 0 ? 'SURPLUS' : 'DEFISIT', formatCurrency(Math.abs(data.summary.balance))]
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Style the summary sheet
    summarySheet['!cols'] = [{ width: 25 }, { width: 25 }];
    
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

    // 2. TRANSACTIONS SHEET
    const transactionHeaders = [
      'No',
      'Tanggal',
      'Deskripsi',
      'Tipe',
      'Jumlah (Rp)',
      'Program',
      'Kategori'
    ];

    // Sort transactions by date
    const sortedTransactions = [...data.transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const transactionData = sortedTransactions.map((transaction, index) => {
      const programName = data.programs.find(p => p.id === transaction.programId)?.name || '-';
      
      return [
        index + 1,
        new Date(transaction.date).toLocaleDateString('id-ID'),
        transaction.description,
        transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        transaction.amount,
        programName,
        transaction.category || '-'
      ];
    });

    const totalIncome = data.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = data.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const transactionSheet = XLSX.utils.aoa_to_sheet([
      ['DETAIL TRANSAKSI KEUANGAN'],
      ['Total Transaksi:', data.transactions.length],
      [''],
      transactionHeaders,
      ...transactionData,
      [''],
      ['TOTAL PEMASUKAN:', '', '', '', totalIncome],
      ['TOTAL PENGELUARAN:', '', '', '', totalExpense],
      ['SALDO AKHIR:', '', '', '', totalIncome - totalExpense]
    ]);

    // Set column widths for transactions
    transactionSheet['!cols'] = [
      { width: 5 },   // No
      { width: 12 },  // Tanggal
      { width: 30 },  // Deskripsi
      { width: 12 },  // Tipe
      { width: 15 },  // Jumlah
      { width: 20 },  // Program
      { width: 15 }   // Kategori
    ];

    XLSX.utils.book_append_sheet(workbook, transactionSheet, 'Transaksi');

    // 3. PROGRAMS SHEET
    const programHeaders = [
      'No',
      'Nama Program',
      'Anggaran Dialokasikan (Rp)',
      'Total Pengeluaran (Rp)',
      'Sisa Anggaran (Rp)',
      'Status',
      'Persentase Terpakai (%)'
    ];

    const programData = data.programs.map((program, index) => {
      const totalExpenses = data.transactions
        .filter(t => t.type === 'expense' && t.programId === program.id)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const remaining = program.allocatedBudget - totalExpenses;
      const percentage = program.allocatedBudget > 0 ? 
        ((totalExpenses / program.allocatedBudget) * 100).toFixed(1) : '0';
      
      const status = remaining >= 0 ? 'Dalam Anggaran' : 'Melebihi Anggaran';

      return [
        index + 1,
        program.name,
        program.allocatedBudget,
        totalExpenses,
        remaining,
        status,
        parseFloat(percentage)
      ];
    });

    const totalAllocated = data.programs.reduce((sum, p) => sum + p.allocatedBudget, 0);
    const totalUsed = data.programs.reduce((sum, p) => {
      return sum + data.transactions
        .filter(t => t.type === 'expense' && t.programId === p.id)
        .reduce((acc, t) => acc + t.amount, 0);
    }, 0);

    const programSheet = XLSX.utils.aoa_to_sheet([
      ['LAPORAN PROGRAM KKN'],
      ['Jumlah Program:', data.programs.length],
      [''],
      programHeaders,
      ...programData,
      [''],
      ['TOTAL ALOKASI:', '', totalAllocated],
      ['TOTAL TERPAKAI:', '', '', totalUsed],
      ['SISA TOTAL:', '', '', '', totalAllocated - totalUsed]
    ]);

    // Set column widths for programs
    programSheet['!cols'] = [
      { width: 5 },   // No
      { width: 25 },  // Nama Program
      { width: 20 },  // Anggaran
      { width: 20 },  // Pengeluaran
      { width: 18 },  // Sisa
      { width: 18 },  // Status
      { width: 18 }   // Persentase
    ];

    XLSX.utils.book_append_sheet(workbook, programSheet, 'Program');

    // 4. MONTHLY ANALYSIS SHEET
    const monthlyData = getMonthlyAnalysis(data.transactions);
    const monthlyHeaders = ['Bulan', 'Pemasukan (Rp)', 'Pengeluaran (Rp)', 'Net (Rp)', 'Kumulatif (Rp)'];
    
    const monthlySheet = XLSX.utils.aoa_to_sheet([
      ['ANALISIS BULANAN'],
      ['Periode:', monthlyData.length > 0 ? `${monthlyData[0][0]} - ${monthlyData[monthlyData.length - 1][0]}` : 'Tidak ada data'],
      [''],
      monthlyHeaders,
      ...monthlyData.map(row => [
        row[0], // Month
        row[1], // Income (as number)
        row[2], // Expense (as number)
        row[3], // Net (as number)
        row[4]  // Cumulative (as number)
      ])
    ]);

    monthlySheet['!cols'] = [
      { width: 15 }, // Bulan
      { width: 18 }, // Pemasukan
      { width: 18 }, // Pengeluaran
      { width: 18 }, // Net
      { width: 18 }  // Kumulatif
    ];
    
    XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Analisis Bulanan');

    // 5. CATEGORY ANALYSIS SHEET (New)
    const categoryData = getCategoryAnalysis(data.transactions);
    const categoryHeaders = ['Kategori', 'Jumlah Transaksi', 'Total Pengeluaran (Rp)', 'Rata-rata (Rp)', 'Persentase (%)'];
    
    const categorySheet = XLSX.utils.aoa_to_sheet([
      ['ANALISIS KATEGORI PENGELUARAN'],
      [''],
      categoryHeaders,
      ...categoryData
    ]);

    categorySheet['!cols'] = [
      { width: 20 }, // Kategori
      { width: 18 }, // Jumlah
      { width: 20 }, // Total
      { width: 18 }, // Rata-rata
      { width: 15 }  // Persentase
    ];

    XLSX.utils.book_append_sheet(workbook, categorySheet, 'Analisis Kategori');

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = filename || `KKN-Budget-Report-${timestamp}.xlsx`;

    // Write and save file
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      cellStyles: true
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

// Helper function for monthly analysis
const getMonthlyAnalysis = (transactions: Transaction[]) => {
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
  
  // Sort by month key and calculate cumulative
  const sortedData = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, data]) => data);

  let cumulative = 0;
  return sortedData.map(data => {
    const net = data.income - data.expense;
    cumulative += net;
    
    return [
      data.month,
      data.income,
      data.expense,
      net,
      cumulative
    ];
  });
};

// Helper function for category analysis
const getCategoryAnalysis = (transactions: Transaction[]) => {
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const categoryMap = new Map<string, { count: number; total: number; }>();
  
  expenseTransactions.forEach(transaction => {
    const category = transaction.category || 'Tidak Berkategori';
    
    if (!categoryMap.has(category)) {
      categoryMap.set(category, { count: 0, total: 0 });
    }
    
    const categoryData = categoryMap.get(category)!;
    categoryData.count += 1;
    categoryData.total += transaction.amount;
  });
  
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  return Array.from(categoryMap.entries())
    .map(([category, data]) => [
      category,
      data.count,
      data.total,
      data.count > 0 ? data.total / data.count : 0,
      totalExpenses > 0 ? ((data.total / totalExpenses) * 100).toFixed(1) : '0'
    ])
    .sort((a, b) => (b[2] as number) - (a[2] as number)); // Sort by total amount descending
};

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};
