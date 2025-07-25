import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import {
  formatCurrency,
  formatDateTime,
  formatRelativeTime,
} from "@/utils/formatters";
import DataBackup from "./DataBackup";
import SecurityStatus from "./SecurityStatus";
import {
  Plus,
  Minus,
  Wallet,
  FileText,
  TrendingUp,
  TrendingDown,
  Shield,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";

const Dashboard = () => {
  const {
    transactions,
    programs,
    getTotalIncome,
    getTotalExpense,
    getBalance,
  } = useApp();

  const [showBackup, setShowBackup] = useState(false);
  const [showDataManagement, setShowDataManagement] = useState(true);

  const totalIncome = getTotalIncome();
  const totalExpense = getTotalExpense();
  const balance = getBalance();
  const recentTransactions = transactions.slice(-5).reverse();

  const stats = [
    {
      title: "Total Pemasukan",
      value: totalIncome,
      icon: Plus,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Total Pengeluaran",
      value: totalExpense,
      icon: Minus,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Saldo Kas",
      value: balance,
      icon: Wallet,
      color: balance >= 0 ? "text-blue-600" : "text-red-600",
      bg: balance >= 0 ? "bg-blue-50" : "bg-red-50",
    },
    {
      title: "Program Kerja",
      value: programs.length,
      icon: FileText,
      color: "text-purple-600",
      bg: "bg-purple-50",
      isCount: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                      {stat.title}
                    </p>
                    <p
                      className={`text-lg sm:text-2xl font-bold ${stat.color} break-words`}
                    >
                      {stat.isCount ? stat.value : formatCurrency(stat.value)}
                    </p>
                  </div>
                  <div
                    className={`p-2 sm:p-3 rounded-full ${stat.bg} flex-shrink-0 ml-2`}
                  >
                    <Icon className={`h-4 w-4 sm:h-6 sm:w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Transaksi Terbaru</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="space-y-3">
              {recentTransactions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Belum ada transaksi
                </p>
              ) : (
                recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-start sm:items-center justify-between border-b pb-3 last:border-b-0"
                  >
                    <div className="flex items-start sm:items-center space-x-3 flex-1 min-w-0">
                      <div
                        className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
                          transaction.type === "income"
                            ? "bg-green-100"
                            : "bg-red-100"
                        }`}
                      >
                        {transaction.type === "income" ? (
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">
                          {transaction.description}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p
                        className={`font-semibold text-sm sm:text-base ${
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Status Program Kerja</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="space-y-3">
              {programs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Belum ada program kerja
                </p>
              ) : (
                programs.map((program) => {
                  const percentage =
                    program.allocatedBudget > 0
                      ? (program.usedBudget / program.allocatedBudget) * 100
                      : 0;

                  return (
                    <div key={program.id} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{program.name}</span>
                        <span className="text-sm text-gray-500">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            percentage > 100
                              ? "bg-red-500"
                              : percentage > 80
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>
                          Terpakai: {formatCurrency(program.usedBudget)}
                        </span>
                        <span>
                          Alokasi: {formatCurrency(program.allocatedBudget)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Management & Security Section */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Data Management & Security</h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowDataManagement(!showDataManagement)}
              variant="outline"
              className="flex items-center gap-2"
            >
              {showDataManagement ? <EyeOff size={16} /> : <Eye size={16} />}
              {showDataManagement ? "Hide" : "Show"} Section
            </Button>
            {showDataManagement && (
              <Button
                onClick={() => setShowBackup(!showBackup)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Settings size={16} />
                {showBackup ? "Hide" : "Show"} Backup
              </Button>
            )}
          </div>
        </div>

        {showDataManagement && (
          <>
            {/* Security Status - Always visible when section is shown */}
            <div className="mb-4">
              <SecurityStatus />
            </div>

            {showBackup && <DataBackup />}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
