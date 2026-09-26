import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.ts';
import { Category } from '../../types/index.ts';
import { Layers, Plus, Edit2, Trash2, X, Check, Upload } from 'lucide-react';

interface AdminCategoriesProps {
  categories: Category[];
  onRefresh: () => void;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({
  categories,
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('/images/hero-banner.jpg');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isSaving, setIsSaving] = useState(false);

  const openAdd = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImage('/images/bridal-blouse-red.jpg');
    setStatus('active');
    setDisplayOrder(String(categories.length + 1));
    setIsModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImage(cat.image || '/images/hero-banner.jpg');
    setStatus(cat.status);
    setDisplayOrder(String(cat.displayOrder || 0));
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '-'));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;
    setIsSaving(true);
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, {
          name,
          slug,
          description,
          image,
          status,
          displayOrder: parseInt(displayOrder) || 0,
        });
      } else {
        await api.createCategory({
          name,
          slug,
          description,
          image,
          status,
          displayOrder: parseInt(displayOrder) || 0,
        });
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number, catName: string) => {
    if (!confirm(`Delete category "${catName}"? Designs will remain safely in the system.`)) return;
    try {
      await api.deleteCategory(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#6E1423]">
            Silhouette Categories CMS
          </h2>
          <p className="text-xs text-[#8A7968]">
            Manage boutique clothing categories (Blouses, Suits, Lehengas, Kurtis, Sarees, Gowns)
          </p>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2.5 bg-[#6E1423] hover:bg-[#530E1A] text-white text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-xl border border-[#EADBCE] overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 bg-[#ECE4D8] overflow-hidden">
                <img
                  src={cat.image || '/images/hero-banner.jpg'}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/bridal-blouse-red.jpg';
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      cat.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {cat.status}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-1">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-serif font-bold text-lg text-[#2B2320]">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] font-mono text-[#8A7968]">
                    Order: {cat.displayOrder || 0}
                  </span>
                </div>
                <p className="text-xs text-[#8A7968] font-mono">{cat.slug}</p>
                <p className="text-xs text-[#6A5E57] line-clamp-2 pt-1">
                  {cat.description || 'Custom tailored designs'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#FDFBF7] border-t border-[#EADBCE] flex items-center justify-between gap-2">
              <button
                onClick={() => openEdit(cat)}
                className="flex-1 py-1.5 px-2 bg-white border border-[#EADBCE] hover:border-[#6E1423] text-[#2B2320] rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3 h-3 text-[#C59B27]" />
                <span>Edit Category</span>
              </button>
              <button
                onClick={() => handleDelete(cat.id, cat.name)}
                className="p-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#EADBCE] overflow-hidden">
            <div className="bg-[#6E1423] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-[#FDFBF7]">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#2B2320] mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Bridal Blouse / Anarkali Suits"
                  className="w-full px-3 py-2 border border-[#EADBCE] rounded-lg focus:outline-none focus:border-[#6E1423]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2B2320] mb-1">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EADBCE] rounded-lg font-mono focus:outline-none focus:border-[#6E1423]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2B2320] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short summary of this silhouette..."
                  className="w-full px-3 py-2 border border-[#EADBCE] rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2B2320] mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-[#EADBCE] rounded-lg focus:outline-none"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#2B2320] mb-1">Display Order</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="w-full px-3 py-2 border border-[#EADBCE] rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2B2320] mb-1">Image URL / Path</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EADBCE] rounded-lg focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#EADBCE] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#EADBCE] rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#6E1423] text-white rounded-lg font-semibold uppercase disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
