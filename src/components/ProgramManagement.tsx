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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import type { Program } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/utils/formatters";
import {
  Plus,
  Trash2,
  Edit,
  FileText,
  Calendar,
  DollarSign,
  MoreHorizontal,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

const ProgramManagement = () => {
  const {
    programs,
    addProgram,
    updateProgram,
    deleteProgram,
    getExpensesByProgram,
    user,
  } = useApp();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    allocatedBudget: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.allocatedBudget) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang diperlukan",
        variant: "destructive",
      });
      return;
    }

    if (editingProgram) {
      updateProgram(editingProgram, {
        name: formData.name,
        allocatedBudget: parseFloat(formData.allocatedBudget),
        description: formData.description,
      });
      toast({
        title: "Berhasil",
        description: "Program kerja berhasil diperbarui",
      });
    } else {
      addProgram({
        name: formData.name,
        allocatedBudget: parseFloat(formData.allocatedBudget),
        description: formData.description,
      });
      toast({
        title: "Berhasil",
        description: "Program kerja berhasil ditambahkan",
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      allocatedBudget: "",
      description: "",
    });
    setIsDialogOpen(false);
    setEditingProgram(null);
  };

  const handleEdit = (program: Program) => {
    setFormData({
      name: program.name,
      allocatedBudget: program.allocatedBudget.toString(),
      description: program.description,
    });
    setEditingProgram(program.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteProgram(id);
    toast({
      title: "Berhasil",
      description: "Program kerja berhasil dihapus",
    });
  };

  const canEdit = user?.role === "treasurer";

  return (
    <div className="min-h-screen bg-gray-50 lg:bg-white">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 lg:relative lg:bg-transparent lg:border-0">
        <div className="px-4 py-4 lg:px-0 lg:py-6">
          <div className="flex items-center justify-between">
            {/* Title */}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 truncate lg:text-2xl lg:font-bold">
                Program Kerja
              </h1>
              <p className="text-sm text-gray-500 lg:hidden">
                {programs.length} program aktif
              </p>
              <p className="hidden lg:block text-base text-gray-600 mt-1">
                Manajemen Program Kerja
              </p>
            </div>
            
            {/* Action Buttons - Mobile */}
            <div className="flex items-center gap-2 lg:hidden">
              {canEdit && (
                <>
                  {/* Add Program - Mobile */}
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        className="bg-purple-600 hover:bg-purple-700 p-2"
                        onClick={() => setEditingProgram(null)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="mx-4 max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {editingProgram ? "Edit Program" : "Tambah Program"}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Nama Program
                          </label>
                          <Input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, name: e.target.value }))
                            }
                            placeholder="Nama program kerja"
                            className="h-12"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Alokasi Dana (Rp)
                          </label>
                          <Input
                            type="number"
                            value={formData.allocatedBudget}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                allocatedBudget: e.target.value,
                              }))
                            }
                            placeholder="0"
                            className="h-12"
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
                            placeholder="Deskripsi program kerja..."
                            className="min-h-[80px] resize-none"
                            required
                          />
                        </div>

                        <div className="flex space-x-2 pt-2">
                          <Button type="submit" className="flex-1 h-12">
                            {editingProgram ? "Update Program" : "Simpan Program"}
                          </Button>
                          <Button type="button" variant="outline" onClick={resetForm} className="h-12">
                            Batal
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </>
              )}
              
              {/* More Actions - Mobile */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="p-2">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[40vh]">
                  <SheetHeader className="pb-4">
                    <SheetTitle>Aksi Program</SheetTitle>
                    <SheetDescription>
                      Kelola program kerja dan alokasi budget
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-3">
                    {canEdit && (
                      <Button
                        onClick={() => {
                          setEditingProgram(null);
                          setIsDialogOpen(true);
                        }}
                        variant="outline"
                        className="w-full h-12 text-base justify-start"
                      >
                        <Plus className="mr-3 h-5 w-5 text-purple-600" />
                        Tambah Program Baru
                      </Button>
                    )}
                    <div className="text-sm text-gray-500 pt-2">
                      Total {programs.length} program kerja terdaftar
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            {/* Desktop Add Button */}
            {canEdit && (
              <div className="hidden lg:block">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => setEditingProgram(null)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Program
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingProgram ? "Edit Program Kerja" : "Tambah Program Kerja Baru"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Nama Program
                        </label>
                        <Input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, name: e.target.value }))
                          }
                          placeholder="Nama program kerja"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Alokasi Dana (Rp)
                        </label>
                        <Input
                          type="number"
                          value={formData.allocatedBudget}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              allocatedBudget: e.target.value,
                            }))
                          }
                          placeholder="0"
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
                          placeholder="Deskripsi program kerja..."
                          required
                        />
                      </div>

                      <div className="flex space-x-2">
                        <Button type="submit" className="flex-1">
                          {editingProgram ? "Update Program" : "Simpan Program"}
                        </Button>
                        <Button type="button" variant="outline" onClick={resetForm}>
                          Batal
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-4 space-y-4 lg:px-0 lg:pb-0 lg:space-y-6">

        {/* Program Cards */}
        <div className="space-y-3 lg:space-y-4">
          {programs.length === 0 ? (
            <Card className="mx-auto max-w-md lg:max-w-none">
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <Target className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Belum ada program kerja</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Mulai dengan menambahkan program kerja pertama
                    </p>
                  </div>
                  {canEdit && (
                    <Button
                      onClick={() => {
                        setEditingProgram(null);
                        setIsDialogOpen(true);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 mt-4"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Program Pertama
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            programs.map((program) => {
              const expenses = getExpensesByProgram(program.id);
              const percentage =
                program.allocatedBudget > 0
                  ? (program.usedBudget / program.allocatedBudget) * 100
                  : 0;

              // Status determination
              const getStatusInfo = (percentage: number) => {
                if (percentage > 100) {
                  return {
                    label: "Over Budget",
                    color: "bg-red-500",
                    bgColor: "bg-red-50",
                    textColor: "text-red-700",
                    icon: AlertTriangle,
                    progressColor: "bg-red-500"
                  };
                } else if (percentage > 80) {
                  return {
                    label: "Hampir Habis",
                    color: "bg-orange-500",
                    bgColor: "bg-orange-50",
                    textColor: "text-orange-700",
                    icon: AlertTriangle,
                    progressColor: "bg-orange-500"
                  };
                } else if (percentage > 50) {
                  return {
                    label: "Berjalan Baik",
                    color: "bg-blue-500",
                    bgColor: "bg-blue-50",
                    textColor: "text-blue-700",
                    icon: TrendingUp,
                    progressColor: "bg-blue-500"
                  };
                } else {
                  return {
                    label: "Sehat",
                    color: "bg-green-500",
                    bgColor: "bg-green-50",
                    textColor: "text-green-700",
                    icon: CheckCircle,
                    progressColor: "bg-green-500"
                  };
                }
              };

              const statusInfo = getStatusInfo(percentage);
              const StatusIcon = statusInfo.icon;
              const remainingBudget = program.allocatedBudget - program.usedBudget;

              return (
                <Card
                  key={program.id}
                  className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500"
                >
                  <CardContent className="p-4 lg:p-6">
                    {/* Mobile Layout */}
                    <div className="lg:hidden">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base text-gray-900 truncate">
                            {program.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {program.description}
                          </p>
                        </div>
                        {canEdit && (
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button variant="ghost" size="sm" className="p-1.5 ml-2 flex-shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent side="bottom" className="h-[30vh]">
                              <SheetHeader className="pb-4">
                                <SheetTitle>Kelola Program</SheetTitle>
                                <SheetDescription className="truncate">
                                  {program.name}
                                </SheetDescription>
                              </SheetHeader>
                              <div className="space-y-3">
                                <Button
                                  onClick={() => handleEdit(program)}
                                  variant="outline"
                                  className="w-full h-12 text-base justify-start"
                                >
                                  <Edit className="mr-3 h-5 w-5 text-blue-600" />
                                  Edit Program
                                </Button>
                                <Button
                                  onClick={() => handleDelete(program.id)}
                                  variant="outline"
                                  className="w-full h-12 text-base justify-start text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="mr-3 h-5 w-5" />
                                  Hapus Program
                                </Button>
                              </div>
                            </SheetContent>
                          </Sheet>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <Badge 
                          variant="secondary" 
                          className={`${statusInfo.bgColor} ${statusInfo.textColor} border-0 px-2 py-1`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {percentage.toFixed(1)}% terpakai
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2 mb-4">
                        <Progress
                          value={Math.min(percentage, 100)}
                          className="h-2"
                          style={{
                            // @ts-ignore
                            '--progress-background': statusInfo.progressColor,
                          }}
                        />
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Terpakai: {formatCurrency(program.usedBudget)}</span>
                          <span>Alokasi: {formatCurrency(program.allocatedBudget)}</span>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-center mb-1">
                            <DollarSign className="h-3 w-3 text-gray-500" />
                          </div>
                          <div className="text-xs font-medium text-gray-900">
                            {formatCurrency(remainingBudget)}
                          </div>
                          <div className="text-xs text-gray-500">Sisa</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-center mb-1">
                            <FileText className="h-3 w-3 text-gray-500" />
                          </div>
                          <div className="text-xs font-medium text-gray-900">
                            {expenses.length}
                          </div>
                          <div className="text-xs text-gray-500">Transaksi</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-center mb-1">
                            <Calendar className="h-3 w-3 text-gray-500" />
                          </div>
                          <div className="text-xs font-medium text-gray-900">
                            {formatDate(program.createdAt)}
                          </div>
                          <div className="text-xs text-gray-500">Dibuat</div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden lg:block">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">
                            {program.name}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {program.description}
                          </p>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress Dana</span>
                              <span className={statusInfo.textColor}>
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                            <Progress
                              value={Math.min(percentage, 100)}
                              className="h-2"
                            />
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>
                                Terpakai: {formatCurrency(program.usedBudget)}
                              </span>
                              <span>
                                Alokasi: {formatCurrency(program.allocatedBudget)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 mt-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(program.createdAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FileText className="h-4 w-4" />
                              <span>{expenses.length} transaksi</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>
                                Sisa: {formatCurrency(remainingBudget)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {canEdit && (
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleEdit(program)}
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(program.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgramManagement;
