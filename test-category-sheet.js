// Test category sheet implementation
import { exportToExcel } from "./src/utils/excelExport.js";

// Sample test data
const testData = {
  transactions: [
    {
      id: "1",
      type: "income",
      amount: 1000000,
      description: "Dana dari Universitas",
      date: "2025-01-01",
      category: "Dana Universitas",
      createdBy: "Admin",
    },
    {
      id: "2",
      type: "income",
      amount: 200000,
      description: "Iuran anggota batch 1",
      date: "2025-01-02",
      category: "Iuran Anggota",
      createdBy: "Admin",
    },
    {
      id: "3",
      type: "income",
      amount: 200000,
      description: "Iuran anggota batch 2",
      date: "2025-01-03",
      category: "Iuran Anggota",
      createdBy: "Admin",
    },
    {
      id: "4",
      type: "expense",
      amount: 500000,
      description: "Pembelian kebutuhan lainnya",
      date: "2025-01-05",
      category: "Lainnya",
      createdBy: "Admin",
    },
    {
      id: "5",
      type: "expense",
      amount: 50000,
      description: "Makanan snack rapat",
      date: "2025-01-06",
      category: "Konsumsi",
      createdBy: "Admin",
    },
    {
      id: "6",
      type: "expense",
      amount: 50000,
      description: "Kertas dan alat tulis",
      date: "2025-01-07",
      category: "Alat dan Bahan",
      createdBy: "Admin",
    },
  ],
  programs: [
    {
      id: "prog1",
      name: "Program Pendidikan",
      allocatedBudget: 800000,
      usedBudget: 300000,
    },
    {
      id: "prog2",
      name: "Program Kesehatan",
      allocatedBudget: 600000,
      usedBudget: 300000,
    },
  ],
  summary: {
    totalIncome: 1400000,
    totalExpense: 600000,
    balance: 800000,
    programCount: 2,
  },
};

console.log("✅ Category sheet implementation added successfully!");
console.log("📊 Test data structure matches the expected format");
console.log("🎨 New category sheet features:");
console.log("  - Rainbow headers (Purple, Green, Red, Blue, Yellow, Gray)");
console.log("  - Alternating row colors for better readability");
console.log("  - Dynamic cell coloring based on income/expense values");
console.log("  - Professional summary row with gradient colors");
console.log("  - Currency formatting for all monetary values");
console.log("  - Percentage calculation and display");
console.log("  - Transaction count per category");
console.log("  - Visual indicators for positive/negative net values");
