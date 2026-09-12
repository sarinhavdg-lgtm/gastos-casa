import { useState, type FormEvent } from "react";
import { CategoryItem } from "../types";
import { DEFAULT_CATEGORIES } from "../utils/formatters";
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Check,
  RotateCcw,
  Tag,
  Palette,
  Sparkles,
} from "lucide-react";

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  onSaveCategories: (updatedCategories: CategoryItem[]) => void;
  onSelectCategory?: (categoryKey: string) => void;
  isDark?: boolean;
}

const COLOR_PALETTE = [
  "#f97316", // Laranja
  "#16a34a", // Verde
  "#eab308", // Amarelo
  "#0284c7", // Azul Céu
  "#ef4444", // Vermelho
  "#8b5cf6", // Roxo
  "#ec4899", // Rosa
  "#06b6d4", // Ciano
  "#f59e0b", // Âmbar
  "#10b981", // Esmeralda
  "#3b82f6", // Azul Real
  "#14b8a6", // Turquesa
  "#d946ef", // Fúcsia
  "#f43f5e", // Rosa Choque
  "#6366f1", // Índigo
  "#64748b", // Ardósia
];

export function CategoryManagerModal({
  isOpen,
  onClose,
  categories,
  onSaveCategories,
  onSelectCategory,
  isDark = false,
}: CategoryManagerModalProps) {
  const currentCategories = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  // New category form state
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState(COLOR_PALETTE[0]);

  // Editing inline state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editColor, setEditColor] = useState("");

  if (!isOpen) return null;

  const handleStartEdit = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setEditLabel(cat.label);
    setEditColor(cat.color);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditLabel("");
    setEditColor("");
  };

  const handleSaveEdit = (id: string) => {
    if (!editLabel.trim()) return;
    const updated = currentCategories.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          label: editLabel.trim(),
          color: editColor || c.color,
        };
      }
      return c;
    });
    onSaveCategories(updated);
    setEditingId(null);
  };

  const handleCreateCategory = (e: FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    // Generate slug id
    const baseSlug = newLabel
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
    
    const uniqueId = `cat_${baseSlug || Date.now()}_${Math.random().toString(36).substring(2, 5)}`;

    const newCategory: CategoryItem = {
      id: uniqueId,
      label: newLabel.trim(),
      color: newColor,
      isCustom: true,
      bgColor: "bg-slate-50 text-slate-700 border-slate-200",
    };

    const updated = [...currentCategories, newCategory];
    onSaveCategories(updated);
    setNewLabel("");

    if (onSelectCategory) {
      onSelectCategory(uniqueId);
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm("Tem certeza que deseja remover esta categoria?")) {
      const updated = currentCategories.filter((c) => c.id !== id);
      onSaveCategories(updated);
    }
  };

  const handleResetDefaults = () => {
    if (
      confirm(
        "Deseja restaurar a lista de categorias padrão da casa? Suas personalizações serão redefinidas."
      )
    ) {
      onSaveCategories(DEFAULT_CATEGORIES);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        id="category-manager-modal"
        className={`w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden my-auto max-h-[92vh] flex flex-col ${
          isDark
            ? "bg-slate-900 border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Gerenciar Categorias da Casa
              </h2>
              <p className="text-[11px] text-slate-400">
                Adicione, renomeie ou edite cores para o controle da residência
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-sm">
          {/* Add New Category Box */}
          <form
            onSubmit={handleCreateCategory}
            className={`p-3.5 rounded-xl border ${
              isDark
                ? "bg-slate-800/60 border-slate-700/70"
                : "bg-indigo-50/50 border-indigo-100"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Criar Nova Categoria Personalizada</span>
            </div>

            <div className="space-y-3">
              <div>
                <input
                  id="input-new-category-name"
                  type="text"
                  required
                  placeholder="Ex: Fraldas do Bebê, Academia, Material de Obra..."
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500"
                      : "bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                  }`}
                />
              </div>

              {/* Color selector */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                  Escolha a cor de identificação:
                </span>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-6 h-6 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                        newColor === color
                          ? "ring-2 ring-offset-2 ring-indigo-500 scale-110 shadow-xs"
                          : "hover:scale-105 opacity-90"
                      }`}
                    >
                      {newColor === color && (
                        <Check className="w-3 h-3 text-white drop-shadow-xs" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                id="btn-submit-new-category"
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Adicionar Categoria
              </button>
            </div>
          </form>

          {/* Categories List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Categorias Ativas ({currentCategories.length}):
              </span>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-[11px] text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer font-medium"
                title="Restaurar lista original completa de categorias"
              >
                <RotateCcw className="w-3 h-3" />
                Restaurar Padrões
              </button>
            </div>

            <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
              {currentCategories.map((cat) => {
                const isEditing = editingId === cat.id;

                if (isEditing) {
                  return (
                    <div
                      key={cat.id}
                      className={`p-2.5 rounded-xl border space-y-2 ${
                        isDark
                          ? "bg-slate-800 border-indigo-500/50"
                          : "bg-indigo-50/70 border-indigo-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          className={`flex-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            isDark
                              ? "bg-slate-900 border-slate-700 text-white"
                              : "bg-white border-slate-300 text-slate-800"
                          }`}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(cat.id)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Salvar
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-2 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1 items-center pt-1">
                        {COLOR_PALETTE.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setEditColor(color)}
                            style={{ backgroundColor: color }}
                            className={`w-5 h-5 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                              editColor === color
                                ? "ring-2 ring-indigo-500 scale-110 shadow-xs"
                                : "hover:scale-105 opacity-80"
                            }`}
                          >
                            {editColor === color && (
                              <Check className="w-2.5 h-2.5 text-white" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={cat.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-colors ${
                      isDark
                        ? "bg-slate-800/40 hover:bg-slate-800/70 border-slate-800 text-slate-200"
                        : "bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-semibold truncate">{cat.label}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {onSelectCategory && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectCategory(cat.id);
                            onClose();
                          }}
                          className="px-2 py-1 rounded-lg text-[11px] font-bold bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 dark:text-indigo-300 transition-colors cursor-pointer mr-1"
                        >
                          Usar
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleStartEdit(cat)}
                        className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Renomear ou mudar cor desta categoria"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Excluir categoria"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
}
