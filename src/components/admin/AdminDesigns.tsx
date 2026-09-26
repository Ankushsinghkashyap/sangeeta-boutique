import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../api/client.ts';
import { Design, Category } from '../../types/index.ts';
import {
  Scissors,
  Plus,
  Edit2,
  Trash2,
  Search,
  Upload,
  X,
  Sparkles,
  Check,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface AdminDesignsProps {
  categories: Category[];
  onRefreshData?: () => void;
}

export const AdminDesigns: React.FC<AdminDesignsProps> = ({
  categories,
  onRefreshData,
}) => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Edit / Add Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDesign, setEditingDesign] = useState<Design | null>(null);

  // Form fields
  const [designCode, setDesignCode] = useState('');
  const [name, setName] = useState('');
  const [categoryName, setCategoryName] = useState('Blouse');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [description, setDescription] = useState('');
  const [designPrice, setDesignPrice] = useState('2500');
  const [sewingPrice, setSewingPrice] = useState('1500');
  const [customizationPrice, setCustomizationPrice] = useState('400');
  const [fabricInfo, setFabricInfo] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('3-5 business days');
  const [availableSizes, setAvailableSizes] = useState('XS, S, M, L, XL, XXL, Custom');
  const [mainImage, setMainImage] = useState('/images/bridal-blouse-red.jpg');
  const [featured, setFeatured] = useState(false);
  const [popular, setPopular] = useState(false);
  const [status, setStatus] = useState<'active' | 'inactive' | 'unavailable'>('active');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminDesigns();
      setDesigns(data);
    } catch (err) {
      console.error('Failed to fetch designs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  const openAddModal = () => {
    setEditingDesign(null);
    setDesignCode(`SB-${Date.now().toString().slice(-4)}`);
    setName('');
    setCategoryName(categories[0]?.name || 'Blouse');
    setCategoryId(categories[0]?.id);
    setDescription('');
    setDesignPrice('2500');
    setSewingPrice('1500');
    setCustomizationPrice('400');
    setFabricInfo('Handloom Raw Silk with Soft Cotton Lining');
    setEstimatedTime('3-5 business days');
    setAvailableSizes('XS, S, M, L, XL, XXL, Custom');
    setMainImage('/images/bridal-blouse-red.jpg');
    setFeatured(false);
    setPopular(false);
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (design: Design) => {
    setEditingDesign(design);
    setDesignCode(design.designCode);
    setName(design.name);
    setCategoryName(design.categoryName);
    setCategoryId(design.categoryId);
    setDescription(design.description);
    setDesignPrice(design.designPrice);
    setSewingPrice(design.sewingPrice);
    setCustomizationPrice(design.customizationPrice);
    setFabricInfo(design.fabricInfo || '');
    setEstimatedTime(design.estimatedTime || '3-5 business days');
    setAvailableSizes(design.availableSizes || 'XS, S, M, L, XL, XXL, Custom');
    setMainImage(design.mainImage);
    setFeatured(design.featured);
    setPopular(design.popular);
    setStatus(design.status);
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const uploadRes = await api.uploadImage(base64, file.name);
        setMainImage(uploadRes.url);
      } catch (err: any) {
        alert(err.message || 'Image upload failed');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !designCode) return;
    setIsSaving(true);

    try {
      const payload = {
        designCode,
        name,
        categoryId,
        categoryName,
        description,
        designPrice,
        sewingPrice,
        customizationPrice,
        fabricInfo,
        estimatedTime,
        availableSizes,
        mainImage,
        featured,
        popular,
        status,
      };

      if (editingDesign) {
        await api.updateDesign(editingDesign.id, payload);
      } else {
        await api.createDesign(payload);
      }

      setIsModalOpen(false);
      await fetchDesigns();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to save design');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete design "${name}"? Historical orders will not be affected.`)) {
      return;
    }
    try {
      await api.deleteDesign(id);
      await fetchDesigns();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete design');
    }
  };

  const filteredDesigns = designs.filter((d) => {
    if (categoryFilter !== 'All' && d.categoryName.toLowerCase() !== categoryFilter.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.designCode.toLowerCase().includes(q) ||
        d.categoryName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#6E1423]">
            Design Catalog CMS
          </h2>
          <p className="text-xs text-[#8A7968]">
            Add new creations, update stitching rates, manage photography, and control store availability
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#6E1423] hover:bg-[#530E1A] text-white text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Design</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#EADBCE] shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8A7968] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code, design name..."
            className="w-full pl-9 pr-4 py-2 bg-[#FDFBF7] border border-[#EADBCE] rounded-lg text-xs focus:border-[#6E1423] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#8A7968]">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-[#FDFBF7] border border-[#EADBCE] rounded-lg text-[#2B2320] focus:outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Designs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-[#8A7968]">
            Loading designs catalog...
          </div>
        ) : filteredDesigns.length > 0 ? (
          filteredDesigns.map((design) => (
            <div
              key={design.id}
              className="bg-white rounded-xl border border-[#EADBCE] overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="relative h-56 bg-[#F4EDE4] overflow-hidden">
                  <img
                    src={design.mainImage || '/images/bridal-blouse-red.jpg'}
                    alt={design.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/bridal-blouse-red.jpg';
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="px-2 py-0.5 font-mono text-[10px] font-bold bg-[#6E1423] text-white rounded">
                      {design.designCode}
                    </span>
                    {design.featured && (
                      <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-[#E5C158] text-[#2B2320] rounded">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        design.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : design.status === 'unavailable'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {design.status}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-semibold text-[#8C6D1F] uppercase text-[10px] tracking-wider">
                      {design.categoryName}
                    </span>
                    <span className="font-serif font-bold text-base text-[#6E1423]">
                      ₹{Number(design.totalPrice).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-sm text-[#2B2320] line-clamp-1">
                    {design.name}
                  </h3>

                  <p className="text-[11px] text-[#6A5E57] line-clamp-2">
                    {design.description}
                  </p>

                  <div className="pt-2 text-[10px] text-[#8A7968] space-y-0.5 border-t border-[#EADBCE]">
                    <p>Design: ₹{design.designPrice} | Sewing: ₹{design.sewingPrice}</p>
                    <p>Fabric: {design.fabricInfo || 'Silk'}</p>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-[#FDFBF7] border-t border-[#EADBCE] flex items-center justify-between gap-2">
                <button
                  onClick={() => openEditModal(design)}
                  className="flex-1 py-1.5 px-2 bg-white border border-[#EADBCE] hover:border-[#6E1423] text-[#2B2320] rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3 text-[#C59B27]" />
                  <span>Edit Details</span>
                </button>
                <button
                  onClick={() => handleDelete(design.id, design.name)}
                  className="p-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                  title="Delete design"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-xs text-[#8A7968]">
            No designs found matching your search.
          </div>
        )}
      </div>

      {/* Add / Edit Design Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#EADBCE] overflow-hidden my-6">
            <div className="bg-[#6E1423] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#FDFBF7]">
                {editingDesign ? `Edit Design: ${editingDesign.designCode}` : 'Add New Boutique Design'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDesign} className="p-6 max-h-[75vh] overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#2B2320] mb-1">
                    Design Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Royal Heritage Velvet Blouse"
                    className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-lg focus:outline-none focus:border-[#6E1423]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B2320] mb-1">
                    Unique Design Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={designCode}
                    onChange={(e) => setDesignCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SB-BL-105"
                    className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-lg font-mono uppercase focus:outline-none focus:border-[#6E1423]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B2320] mb-1">Category</label>
                  <select
                    value={categoryName}
                    onChange={(e) => {
                      setCategoryName(e.target.value);
                      const cat = categories.find((c) => c.name === e.target.value);
                      if (cat) setCategoryId(cat.id);
                    }}
                    className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-lg focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#2B2320] mb-1">Availability Status</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-lg focus:outline-none"
                  >
                    <option value="active">Active (Available to order)</option>
                    <option value="unavailable">Currently Unavailable (Disabled)</option>
                    <option value="inactive">Inactive / Draft (Hidden)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#2B2320] mb-1">
                    Design & Fabric Price (₹)
                  </label>
                  <input
                    type="number"
                    value={designPrice}
                    onChange={(e) => setDesignPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-lg focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B2320] mb-1">
                    Sewing & Stitching Charge (₹)
                  </label>
                  <input
                    type="number"
                    value={sewingPrice}
                    onChange={(e) => setSewingPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-lg focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B2320] mb-1">
                    Customization Starting (₹)
                  </label>
                  <input
                    type="number"
                    value={customizationPrice}
                    onChange={(e) => setCustomizationPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B2320] mb-1">Estimated Sewing Time</label>
                  <input
                    type="text"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    placeholder="e.g. 3-5 business days"
                    className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-lg focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#2B2320] mb-1">Fabric Details</label>
                  <input
                    type="text"
                    value={fabricInfo}
                    onChange={(e) => setFabricInfo(e.target.value)}
                    placeholder="e.g. Pure Silk Velvet with Butter Crepe Lining"
                    className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-lg focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#2B2320] mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe cutwork, sleeve style, neckline, and embroidery highlights..."
                    className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-lg focus:outline-none"
                    required
                  />
                </div>

                {/* Image Upload & Preview */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="block font-semibold text-[#2B2320]">Main Showcase Image</label>
                  <div className="flex items-center gap-4 p-3 bg-white border border-[#EADBCE] rounded-xl">
                    <img
                      src={mainImage}
                      alt="Preview"
                      className="w-16 h-20 object-cover rounded-lg border border-[#EADBCE]"
                    />
                    <div className="space-y-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-[#F9F6F0] hover:bg-[#ECE4D8] border border-[#EADBCE] text-[#2B2320] rounded font-semibold text-xs cursor-pointer"
                      >
                        Upload Custom Photo
                      </button>
                      <p className="text-[10px] text-[#8A7968]">Or choose sample preset:</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {[
                          '/images/bridal-blouse-red.jpg',
                          '/images/designer-blouse-back.jpg',
                          '/images/anarkali-suit-royal.jpg',
                          '/images/bridal-lehenga-luxury.jpg',
                          '/images/kurti-ivory.jpg',
                          '/images/saree-drapes.jpg',
                          '/images/gown-indowestern.jpg',
                        ].map((preset, idx) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setMainImage(preset)}
                            className="px-2 py-0.5 text-[9px] bg-[#FCF8EC] border border-[#E5C158] rounded hover:bg-[#E5C158] transition-colors"
                          >
                            Preset {idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-xs">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="accent-[#6E1423]"
                    />
                    <span>Mark as Featured</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-xs">
                    <input
                      type="checkbox"
                      checked={popular}
                      onChange={(e) => setPopular(e.target.checked)}
                      className="accent-[#6E1423]"
                    />
                    <span>Trending / Popular</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-[#EADBCE] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-[#EADBCE] hover:bg-[#F9F6F0] text-[#2B2320] rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-[#6E1423] hover:bg-[#530E1A] text-white rounded-lg font-semibold uppercase tracking-wider disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save & Publish Design'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
