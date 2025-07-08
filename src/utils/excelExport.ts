import * as ExcelJS from "exceljs";
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

// Professional color palette
const PROFESSIONAL_COLORS = {
  primary: "0F4C81",
  primaryLight: "2B6CB0",
  primaryLighter: "DBEAFE",
  success: "065F46",
  successLight: "059669",
  successLighter: "D1FAE5",
  danger: "991B1B",
  dangerLight: "DC2626",
  dangerLighter: "FEE2E2",
  warning: "92400E",
  warningLight: "D97706",
  warningLighter: "FEF3C7",
  dark: "111827",
  darkGray: "374151",
  mediumGray: "6B7280",
  lightGray: "D1D5DB",
  lighterGray: "F3F4F6",
  white: "FFFFFF",
  accent1: "7C3AED",
  accent2: "DC2626",
  accent3: "059669",
  accent4: "D97706",
  accent5: "0891B2",
  headerBg: "F8FAFC",
  alternateRow: "F9FAFB",
  border: "E5E7EB",
};

export const exportToExcel = async (
  data: ExcelExportData,
  filename?: string
) => {
  try {
    console.log("Starting professional Excel export (fixed version)...");

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "KKN Budget Nexus System";

    // Simplified helper functions (self-contained)
    const applyHeaderStyle = (
      cell: ExcelJS.Cell,
      bgColor: string = PROFESSIONAL_COLORS.primary
    ) => {
      cell.font = {
        bold: true,
        color: { argb: `FF${PROFESSIONAL_COLORS.white}` },
        size: 11,
        name: "Calibri",
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: `FF${bgColor}` },
      };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      cell.border = {
        top: {
          style: "thin",
          color: { argb: `FF${PROFESSIONAL_COLORS.border}` },
        },
        bottom: {
          style: "thin",
          color: { argb: `FF${PROFESSIONAL_COLORS.border}` },
        },
        left: {
          style: "thin",
          color: { argb: `FF${PROFESSIONAL_COLORS.border}` },
        },
        right: {
          style: "thin",
          color: { argb: `FF${PROFESSIONAL_COLORS.border}` },
        },
      };
    };

    const applyCurrencyStyle = (
      cell: ExcelJS.Cell,
      bgColor?: string,
      textColor?: string
    ) => {
      cell.numFmt = '"Rp "#,##0';
      cell.alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      if (bgColor) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: `FF${bgColor}` },
        };
      }
      if (textColor) {
        cell.font = {
          ...cell.font,
          color: { argb: `FF${textColor}` },
          bold: true,
        };
      }
    };

    // 1. EXECUTIVE SUMMARY SHEET
    const summarySheet = workbook.addWorksheet("Executive Summary");

    summarySheet.columns = [
      { key: "category", width: 40 },
      { key: "amount", width: 28 },
    ];

    // Title
    summarySheet.addRow(["KKN BUDGET NEXUS"]);
    summarySheet.addRow(["FINANCIAL SUMMARY REPORT"]);
    summarySheet.addRow([""]);

    // Merge title cells
    summarySheet.mergeCells("A1:B1");
    summarySheet.mergeCells("A2:B2");

    // Style titles
    const titleRow1 = summarySheet.getRow(1);
    titleRow1.getCell(1).font = { bold: true, size: 18, name: "Calibri" };
    titleRow1.getCell(1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    titleRow1.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: `FF${PROFESSIONAL_COLORS.headerBg}` },
    };

    const titleRow2 = summarySheet.getRow(2);
    titleRow2.getCell(1).font = {
      bold: true,
      size: 14,
      name: "Calibri",
      color: { argb: `FF${PROFESSIONAL_COLORS.mediumGray}` },
    };
    titleRow2.getCell(1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    titleRow2.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: `FF${PROFESSIONAL_COLORS.headerBg}` },
    };

    // Date
    summarySheet.addRow([
      `Report Generated: ${new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })} at ${new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      })}`,
    ]);
    summarySheet.addRow([""]);

    // Headers
    const headerRow = summarySheet.addRow([
      "Financial Category",
      "Amount (IDR)",
    ]);
    applyHeaderStyle(headerRow.getCell(1), PROFESSIONAL_COLORS.primaryLight);
    applyHeaderStyle(headerRow.getCell(2), PROFESSIONAL_COLORS.primaryLight);

    // Data rows
    const incomeRow = summarySheet.addRow([
      "Total Revenue",
      data.summary.totalIncome,
    ]);
    incomeRow.getCell(1).font = { bold: true };
    incomeRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: `FF${PROFESSIONAL_COLORS.successLighter}` },
    };
    applyCurrencyStyle(
      incomeRow.getCell(2),
      PROFESSIONAL_COLORS.successLighter,
      PROFESSIONAL_COLORS.success
    );

    const expenseRow = summarySheet.addRow([
      "Total Expenditure",
      data.summary.totalExpense,
    ]);
    expenseRow.getCell(1).font = { bold: true };
    expenseRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: `FF${PROFESSIONAL_COLORS.dangerLighter}` },
    };
    applyCurrencyStyle(
      expenseRow.getCell(2),
      PROFESSIONAL_COLORS.dangerLighter,
      PROFESSIONAL_COLORS.danger
    );

    const balanceRow = summarySheet.addRow([
      "Net Balance",
      data.summary.balance,
    ]);
    const balanceColor =
      data.summary.balance >= 0
        ? PROFESSIONAL_COLORS.primary
        : PROFESSIONAL_COLORS.danger;
    const balanceBg =
      data.summary.balance >= 0
        ? PROFESSIONAL_COLORS.primaryLighter
        : PROFESSIONAL_COLORS.dangerLighter;
    balanceRow.getCell(1).font = { bold: true };
    balanceRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: `FF${balanceBg}` },
    };
    applyCurrencyStyle(balanceRow.getCell(2), balanceBg, balanceColor);

    console.log("Summary sheet created...");

    // 2. TRANSACTION DETAILS SHEET
    const transactionSheet = workbook.addWorksheet("Transaction Details");

    transactionSheet.columns = [
      { key: "no", width: 8 },
      { key: "date", width: 16 },
      { key: "description", width: 50 },
      { key: "type", width: 16 },
      { key: "amount", width: 20 },
      { key: "program", width: 28 },
      { key: "category", width: 22 },
    ];

    // Title
    const transactionTitleRow = transactionSheet.addRow([
      "TRANSACTION REGISTER",
    ]);
    transactionSheet.mergeCells("A1:G1");
    transactionTitleRow.getCell(1).font = {
      bold: true,
      size: 16,
      name: "Calibri",
    };
    transactionTitleRow.getCell(1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    transactionTitleRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: `FF${PROFESSIONAL_COLORS.headerBg}` },
    };

    const subtitleRow = transactionSheet.addRow([
      `Total Records: ${
        data.transactions.length
      } | Period: ${new Date().getFullYear()}`,
    ]);
    transactionSheet.mergeCells("A2:G2");
    subtitleRow.getCell(1).font = {
      size: 11,
      color: { argb: `FF${PROFESSIONAL_COLORS.mediumGray}` },
      name: "Calibri",
    };
    subtitleRow.getCell(1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    transactionSheet.addRow([""]);

    // Headers
    const transactionHeaderRow = transactionSheet.addRow([
      "No.",
      "Date",
      "Description",
      "Type",
      "Amount (IDR)",
      "Program",
      "Category",
    ]);
    transactionHeaderRow.eachCell((cell, colNumber) => {
      applyHeaderStyle(cell, PROFESSIONAL_COLORS.primary);
      if (colNumber === 4) applyHeaderStyle(cell, PROFESSIONAL_COLORS.accent1); // Type
      if (colNumber === 5) applyHeaderStyle(cell, PROFESSIONAL_COLORS.success); // Amount
    });

    // Sort transactions by date
    const sortedTransactions = [...data.transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Data rows (limit for performance)
    const limitedTransactions = sortedTransactions.slice(0, 500);
    limitedTransactions.forEach((transaction, index) => {
      const programName = transaction.programId
        ? data.programs.find((p) => p.id === transaction.programId)?.name ||
          "General"
        : "General";

      const row = transactionSheet.addRow([
        index + 1,
        new Date(transaction.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        }),
        transaction.description,
        transaction.type === "income" ? "Revenue" : "Expense",
        transaction.amount,
        programName,
        transaction.category || "Uncategorized",
      ]);

      // Alternating row colors
      if (index % 2 === 1) {
        row.eachCell((cell) => {
          if (!cell.fill || (cell.fill as any).fgColor?.argb === "FFFFFFFF") {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: `FF${PROFESSIONAL_COLORS.lighterGray}` },
            };
          }
        });
      }

      // Type cell styling
      const typeCell = row.getCell(4);
      const typeColor =
        transaction.type === "income"
          ? PROFESSIONAL_COLORS.success
          : PROFESSIONAL_COLORS.danger;
      const typeBg =
        transaction.type === "income"
          ? PROFESSIONAL_COLORS.successLighter
          : PROFESSIONAL_COLORS.dangerLighter;
      typeCell.font = { bold: true, color: { argb: `FF${typeColor}` } };
      typeCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: `FF${typeBg}` },
      };
      typeCell.alignment = { horizontal: "center", vertical: "middle" };

      // Amount cell
      applyCurrencyStyle(row.getCell(5), typeBg, typeColor);
    });

    console.log("Transaction sheet created...");

    // 3. PROGRAM MANAGEMENT SHEET
    const programSheet = workbook.addWorksheet("Program Management");

    programSheet.columns = [
      { key: "no", width: 8 },
      { key: "name", width: 40 },
      { key: "budget", width: 22 },
      { key: "used", width: 22 },
      { key: "remaining", width: 22 },
      { key: "progress", width: 16 },
      { key: "status", width: 24 },
    ];

    // Title
    const programTitleRow = programSheet.addRow(["PROGRAM BUDGET ALLOCATION"]);
    programSheet.mergeCells("A1:G1");
    programTitleRow.getCell(1).font = { bold: true, size: 16, name: "Calibri" };
    programTitleRow.getCell(1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    programTitleRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: `FF${PROFESSIONAL_COLORS.headerBg}` },
    };

    const programSubtitleRow = programSheet.addRow([
      `Active Programs: ${data.programs.length}`,
    ]);
    programSheet.mergeCells("A2:G2");
    programSubtitleRow.getCell(1).font = {
      size: 11,
      color: { argb: `FF${PROFESSIONAL_COLORS.mediumGray}` },
      name: "Calibri",
    };
    programSubtitleRow.getCell(1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    programSheet.addRow([""]);

    // Headers
    const programHeaderRow = programSheet.addRow([
      "No.",
      "Program Name",
      "Budget Allocated (IDR)",
      "Amount Used (IDR)",
      "Remaining (IDR)",
      "Progress %",
      "Status",
    ]);
    programHeaderRow.eachCell((cell, colNumber) => {
      applyHeaderStyle(cell, PROFESSIONAL_COLORS.primary);
      if (colNumber === 3) applyHeaderStyle(cell, PROFESSIONAL_COLORS.accent4); // Budget
      if (colNumber === 4) applyHeaderStyle(cell, PROFESSIONAL_COLORS.danger); // Used
      if (colNumber === 5) applyHeaderStyle(cell, PROFESSIONAL_COLORS.success); // Remaining
      if (colNumber === 6) applyHeaderStyle(cell, PROFESSIONAL_COLORS.accent1); // Progress
    });

    // Program data
    data.programs.forEach((program, index) => {
      const totalExpenses = data.transactions
        .filter((t) => t.type === "expense" && t.programId === program.id)
        .reduce((sum, t) => sum + t.amount, 0);

      const remaining = program.allocatedBudget - totalExpenses;
      const percentage =
        program.allocatedBudget > 0
          ? (totalExpenses / program.allocatedBudget) * 100
          : 0;

      const status =
        percentage > 100
          ? "OVER BUDGET"
          : percentage > 85
          ? "HIGH USAGE"
          : percentage > 70
          ? "MODERATE"
          : "ON TRACK";
      const statusColor =
        percentage > 100
          ? PROFESSIONAL_COLORS.white
          : percentage > 85
          ? PROFESSIONAL_COLORS.dark
          : PROFESSIONAL_COLORS.white;
      const statusBgColor =
        percentage > 100
          ? PROFESSIONAL_COLORS.danger
          : percentage > 85
          ? PROFESSIONAL_COLORS.warningLighter
          : PROFESSIONAL_COLORS.success;

      const row = programSheet.addRow([
        index + 1,
        program.name,
        program.allocatedBudget,
        totalExpenses,
        remaining,
        `${percentage.toFixed(1)}%`,
        status,
      ]);

      // Alternating rows
      if (index % 2 === 1) {
        row.eachCell((cell) => {
          if (!cell.fill || (cell.fill as any).fgColor?.argb === "FFFFFFFF") {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: `FF${PROFESSIONAL_COLORS.lighterGray}` },
            };
          }
        });
      }

      // Style specific cells
      applyCurrencyStyle(
        row.getCell(3),
        undefined,
        PROFESSIONAL_COLORS.accent4
      );
      row.getCell(3).font = { bold: true };

      applyCurrencyStyle(
        row.getCell(4),
        undefined,
        totalExpenses > 0
          ? PROFESSIONAL_COLORS.danger
          : PROFESSIONAL_COLORS.mediumGray
      );
      row.getCell(4).font = { bold: true };

      applyCurrencyStyle(
        row.getCell(5),
        undefined,
        remaining >= 0
          ? PROFESSIONAL_COLORS.success
          : PROFESSIONAL_COLORS.danger
      );
      row.getCell(5).font = { bold: true };

      row.getCell(6).font = {
        bold: true,
        color: {
          argb: `FF${
            percentage > 85
              ? PROFESSIONAL_COLORS.warning
              : PROFESSIONAL_COLORS.primary
          }`,
        },
      };
      row.getCell(6).alignment = { horizontal: "center", vertical: "middle" };

      row.getCell(7).font = { bold: true, color: { argb: `FF${statusColor}` } };
      row.getCell(7).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: `FF${statusBgColor}` },
      };
      row.getCell(7).alignment = { horizontal: "center", vertical: "middle" };
    });

    console.log("Program sheet created...");

    // 4. CATEGORY ANALYSIS SHEET (Simplified)
    const categorySheet = workbook.addWorksheet("Category Analysis");

    categorySheet.columns = [
      { key: "category", width: 32 },
      { key: "income", width: 20 },
      { key: "expense", width: 20 },
      { key: "net", width: 20 },
      { key: "percentage", width: 16 },
      { key: "transactions", width: 16 },
    ];

    // Title
    const categoryTitleRow = categorySheet.addRow([
      "CATEGORY BREAKDOWN ANALYSIS",
    ]);
    categorySheet.mergeCells("A1:F1");
    categoryTitleRow.getCell(1).font = {
      bold: true,
      size: 16,
      name: "Calibri",
    };
    categoryTitleRow.getCell(1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    categoryTitleRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: `FF${PROFESSIONAL_COLORS.headerBg}` },
    };

    categorySheet.addRow([""]);

    // Headers
    const categoryHeaderRow = categorySheet.addRow([
      "Category",
      "Income (IDR)",
      "Expense (IDR)",
      "Net (IDR)",
      "% of Total",
      "Transactions",
    ]);
    categoryHeaderRow.eachCell((cell, colNumber) => {
      if (colNumber === 1) applyHeaderStyle(cell, PROFESSIONAL_COLORS.primary);
      if (colNumber === 2) applyHeaderStyle(cell, PROFESSIONAL_COLORS.success);
      if (colNumber === 3) applyHeaderStyle(cell, PROFESSIONAL_COLORS.danger);
      if (colNumber === 4) applyHeaderStyle(cell, PROFESSIONAL_COLORS.accent1);
      if (colNumber === 5) applyHeaderStyle(cell, PROFESSIONAL_COLORS.accent4);
      if (colNumber === 6)
        applyHeaderStyle(cell, PROFESSIONAL_COLORS.mediumGray);
    });

    // Simple category analysis
    const categoryMap = new Map();
    const totalAmount = data.transactions.reduce((sum, t) => sum + t.amount, 0);

    data.transactions.forEach((transaction) => {
      const category = transaction.category || "Uncategorized";

      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,
          income: 0,
          expense: 0,
          transactionCount: 0,
        });
      }

      const categoryData = categoryMap.get(category);
      categoryData.transactionCount++;

      if (transaction.type === "income") {
        categoryData.income += transaction.amount;
      } else {
        categoryData.expense += transaction.amount;
      }
    });

    // Sort categories by total amount
    const sortedCategories = Array.from(categoryMap.values()).sort(
      (a, b) => b.income + b.expense - (a.income + a.expense)
    );

    sortedCategories.forEach((category, index) => {
      const net = category.income - category.expense;
      const percentage =
        totalAmount > 0
          ? ((category.income + category.expense) / totalAmount) * 100
          : 0;

      const row = categorySheet.addRow([
        category.category,
        category.income,
        category.expense,
        net,
        `${percentage.toFixed(1)}%`,
        category.transactionCount,
      ]);

      // Alternating rows
      if (index % 2 === 1) {
        row.eachCell((cell) => {
          if (!cell.fill || (cell.fill as any).fgColor?.argb === "FFFFFFFF") {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: `FF${PROFESSIONAL_COLORS.lighterGray}` },
            };
          }
        });
      }

      // Style cells
      applyCurrencyStyle(
        row.getCell(2),
        undefined,
        category.income > 0
          ? PROFESSIONAL_COLORS.success
          : PROFESSIONAL_COLORS.mediumGray
      );
      applyCurrencyStyle(
        row.getCell(3),
        undefined,
        category.expense > 0
          ? PROFESSIONAL_COLORS.danger
          : PROFESSIONAL_COLORS.mediumGray
      );
      applyCurrencyStyle(
        row.getCell(4),
        undefined,
        net >= 0 ? PROFESSIONAL_COLORS.primary : PROFESSIONAL_COLORS.danger
      );

      row.getCell(5).font = {
        bold: true,
        color: { argb: `FF${PROFESSIONAL_COLORS.accent4}` },
      };
      row.getCell(5).alignment = { horizontal: "center", vertical: "middle" };

      row.getCell(6).alignment = { horizontal: "center", vertical: "middle" };
    });

    console.log("Category sheet created...");

    // Generate filename
    const timestamp = new Date().toISOString().split("T")[0];
    const fileName =
      filename || `Financial-Report-Professional-${timestamp}.xlsx`;

    // Export
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, fileName);

    console.log("Professional Excel export completed successfully");
    return { success: true, filename: fileName };
  } catch (error) {
    console.error("Professional Excel export failed:", error);
    return { success: false, error: (error as Error).message };
  }
};
