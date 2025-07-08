import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import {
  Minus,
  Trash2,
  Calendar,
  User,
  Camera,
  MoreHorizontal,
  CreditCard,
  Receipt,
} from "lucide-react";

const ExpenseManagement = () => {
  const { transactions, programs, addTransaction, deleteTransaction, user } =
    useApp();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5), // HH:MM format
    category: "",
    programId: "",
    receipt: "",
  });

  const expenseCategories = [
    "Konsumsi",
    "Transportasi",
    "Alat dan Bahan",
    "Dokumentasi",
    "Administrasi",
    "Lainnya",
  ];

  const expenseTransactions = transactions.filter((t) => t.type === "expense");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.description) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang diperlukan",
        variant: "destructive",
      });
      return;
    }

    // Combine date and time for accurate timestamp
    const dateTime = new Date(`${formData.date}T${formData.time}`);
    const isoDateTime = dateTime.toISOString();

    addTransaction({
      type: "expense",
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: isoDateTime, // Use full ISO timestamp
      category: formData.category || "Lainnya",
      programId:
        formData.programId === "general"
          ? undefined
          : formData.programId || undefined,
      receipt: formData.receipt || undefined,
    });

    toast({
      title: "Berhasil",
      description: "Pengeluaran berhasil ditambahkan",
    });

    // Reset form with current date/time
    const now = new Date();
    setFormData({
      amount: "",
      description: "",
      date: now.toISOString().split("T")[0],
      time: now.toTimeString().slice(0, 5),
      category: "",
      programId: "",
      receipt: "",
    });
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    toast({
      title: "Berhasil",
      description: "Pengeluaran berhasil dihapus",
    });
  };

  const canDelete = user?.role === "treasurer";
  const getProgramName = (programId: string) => {
    const program = programs.find((p) => p.id === programId);
    return program ? program.name : "Umum";
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
                Pengeluaran
              </h1>
              <p className="text-sm text-gray-500 lg:hidden">
                {expenseTransactions.length} transaksi
              </p>
              <p className="hidden lg:block text-base text-gray-600 mt-1">
                Manajemen Pengeluaran
              </p>
            </div>

            {/* Action Buttons - Mobile & Desktop */}
            <div className="flex items-center gap-2">
              {user?.role === "treasurer" && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 lg:px-4"
                    >
                      <Minus className="h-4 w-4 lg:mr-2" />
                      <span className="hidden lg:inline">Tambah Pengeluaran</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="mx-4 max-w-md lg:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Tambah Pengeluaran Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Jumlah (Rp)
                        </label>
                        <Input
                          type="number"
                          value={formData.amount}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              amount: e.target.value,
                            }))
                          }
                          placeholder="0"
                          className="h-12 lg:h-10"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Deskripsi
                        </label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Deskripsi pengeluaran..."
                          className="min-h-[80px] resize-none lg:min-h-[60px]"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Tanggal
                          </label>
                          <Input
                            type="date"
                            value={formData.date}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                date: e.target.value,
                              }))
                            }
                            className="text-base"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Waktu
                          </label>
                          <Input
                            type="time"
                            value={formData.time}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                time: e.target.value,
                              }))
                            }
                            className="text-base"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Kategori
                        </label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, category: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            {expenseCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Program Kerja (Opsional)
                        </label>
                        <Select
                          value={formData.programId}
                          onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, programId: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih program kerja" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">Umum</SelectItem>
                            {programs.map((program) => (
                              <SelectItem key={program.id} value={program.id}>
                                {program.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Bukti Transaksi (Opsional)
                        </label>
                        <Input
                          type="text"
                          value={formData.receipt}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              receipt: e.target.value,
                            }))
                          }
                          placeholder="URL atau keterangan bukti"
                        />
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button type="submit" className="flex-1 h-12 lg:h-10">
                          Simpan Pengeluaran
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetForm}
                          className="h-12 lg:h-10"
                        >
                          Batal
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}

              {/* More Actions - Mobile Only */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="p-2 lg:hidden">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[40vh]">
                  <SheetHeader className="pb-4">
                    <SheetTitle>Aksi Pengeluaran</SheetTitle>
                    <SheetDescription>
                      Kelola data pengeluaran dan transaksi
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-3">
                    {user?.role === "treasurer" && (
                      <Button
                        onClick={() => setIsDialogOpen(true)}
                        variant="outline"
                        className="w-full h-12 text-base justify-start"
                      >
                        <Minus className="mr-3 h-5 w-5 text-red-600" />
                        Tambah Pengeluaran Baru
                      </Button>
                    )}
                    <div className="text-sm text-gray-500 pt-2">
                      Total {expenseTransactions.length} transaksi pengeluaran
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-4 space-y-4 lg:px-0 lg:pb-0 lg:space-y-6">
        {/* Enhanced mobile-optimized expense list with badges and compact layout */}
        {expenseTransactions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Belum ada data pengeluaran</p>
            </CardContent>
          </Card>
        ) : (
          expenseTransactions.map((transaction) => (
            <Card
              key={transaction.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">
                        {transaction.description}
                      </h3>
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        {transaction.category}
                      </span>
                      {transaction.programId && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          {getProgramName(transaction.programId)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateTime(transaction.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{transaction.createdBy}</span>
                      </div>
                      {transaction.receipt && (
                        <div className="flex items-center space-x-1">
                          <Camera className="h-4 w-4" />
                          <span>Ada bukti</span>
                        </div>
                      )}
                    </div>

                    <p className="text-2xl font-bold text-red-600">
                      -{formatCurrency(transaction.amount)}
                    </p>
                  </div>

                  {canDelete && (
                    <Button
                      onClick={() => handleDelete(transaction.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ExpenseManagement;
