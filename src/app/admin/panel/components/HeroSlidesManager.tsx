'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PhotoIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

interface HeroSlide {
  id: string;
  imageUrl: string;
  imageFile: string;
  tag: string;
  title: string;
  titleAccent: string;
  body: string;
  neon: string;
  neonInk: string;
  order: number;
}

const NEON_PRESETS = [
  { label: 'بنفش (برند)', value: '#a855f7', ink: '#7c3aed' },
  { label: 'سیان (سایبرپانک)', value: '#22d3ee', ink: '#0e7490' },
  { label: 'قرمز (سینما)', value: '#f43f5e', ink: '#be123c' },
  { label: 'طلایی (دون)', value: '#fbbf24', ink: '#b45309' },
  { label: 'سبز (طبیعت)', value: '#34d399', ink: '#047857' },
  { label: 'سبز نئون (اکسنت)', value: '#22ff88', ink: '#16a34a' },
];

const EMPTY_SLIDE: Omit<HeroSlide, 'id' | 'order' | 'imageFile'> = {
  imageUrl: '',
  tag: '',
  title: '',
  titleAccent: '',
  body: '',
  neon: '#a855f7',
  neonInk: '#7c3aed',
};

export default function HeroSlidesManager() {
  const [slides, setSlides]       = useState<HeroSlide[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isCreating, setIsCreating]     = useState(false);
  const [formData, setFormData]         = useState({ ...EMPTY_SLIDE });
  const [imageFile, setImageFile]       = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/hero-slides', { credentials: 'include' });
      const d = await res.json();
      if (d.success) setSlides(d.data);
    } catch { toast.error('خطا در بارگذاری اسلایدها'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setIsCreating(false);
    setFormData({
      imageUrl: slide.imageUrl,
      tag: slide.tag,
      title: slide.title,
      titleAccent: slide.titleAccent,
      body: slide.body,
      neon: slide.neon,
      neonInk: slide.neonInk,
    });
    setImageFile(null);
    setImagePreview(slide.imageUrl);
  };

  const openCreate = () => {
    setEditingSlide(null);
    setIsCreating(true);
    setFormData({ ...EMPTY_SLIDE });
    setImageFile(null);
    setImagePreview('');
  };

  const closeModal = () => {
    setEditingSlide(null);
    setIsCreating(false);
    setImageFile(null);
    setImagePreview('');
  };

  const handleImageSelect = (file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('فقط PNG، JPG، WEBP');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const pickNeonPreset = (preset: typeof NEON_PRESETS[0]) => {
    setFormData(f => ({ ...f, neon: preset.value, neonInk: preset.ink }));
  };

  const buildFormData = () => {
    const fd = new FormData();
    if (editingSlide) fd.append('id', editingSlide.id);
    if (imageFile)    fd.append('file', imageFile);
    fd.append('imageUrl',     formData.imageUrl);
    fd.append('tag',          formData.tag);
    fd.append('title',        formData.title);
    fd.append('titleAccent',  formData.titleAccent);
    fd.append('body',         formData.body);
    fd.append('neon',         formData.neon);
    fd.append('neonInk',      formData.neonInk);
    return fd;
  };

  const save = async () => {
    if (!formData.title.trim() && !formData.titleAccent.trim())
      return toast.error('حداقل عنوان یا عنوان رنگی را وارد کنید');

    setSaving(true);
    try {
      const res = await fetch('/api/admin/hero-slides', {
        method: editingSlide ? 'PUT' : 'POST',
        credentials: 'include',
        body: buildFormData(),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(editingSlide ? 'اسلاید بروزرسانی شد' : 'اسلاید جدید اضافه شد');
        await load();
        closeModal();
      } else {
        toast.error(d.error || 'خطا در ذخیره');
      }
    } catch { toast.error('خطای اتصال'); }
    finally { setSaving(false); }
  };

  const remove = async (slide: HeroSlide) => {
    if (!confirm(`حذف اسلاید "${slide.title || slide.titleAccent}"؟`)) return;
    setDeletingId(slide.id);
    try {
      const res = await fetch('/api/admin/hero-slides', {
        method: 'DELETE', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: slide.id }),
      });
      const d = await res.json();
      if (d.success) { toast.success('حذف شد'); await load(); }
      else toast.error(d.error || 'خطا');
    } catch { toast.error('خطای اتصال'); }
    finally { setDeletingId(null); }
  };

  const reorder = async (slide: HeroSlide, dir: 'up' | 'down') => {
    setReorderingId(slide.id);
    try {
      const res = await fetch('/api/admin/hero-slides', {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: slide.id, direction: dir }),
      });
      const d = await res.json();
      if (d.success) setSlides(d.data);
      else toast.error(d.error || 'خطا');
    } catch { toast.error('خطای اتصال'); }
    finally { setReorderingId(null); }
  };

  const isModalOpen = !!editingSlide || isCreating;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-fg">اسلایدهای هیرو</h2>
          <p className="text-muted text-sm mt-1">
            هر اسلاید شامل تصویر مدل، تگ، عنوان و متن است — همه با هم در هیرو نمایش داده می‌شوند.
          </p>
        </div>
        <button onClick={openCreate} className="btn btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          اسلاید جدید
        </button>
      </div>

      {/* Slides list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-xl bg-surface-2 animate-pulse" />
          ))}
        </div>
      ) : slides.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-subtle">
          <PhotoIcon className="w-12 h-12" />
          <p>اسلایدی وجود ندارد. اولین اسلاید را بسازید.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors"
            >
              {/* Thumbnail */}
              <div className="w-16 h-20 rounded-lg overflow-hidden bg-surface-2 flex-shrink-0 border border-border">
                {slide.imageUrl ? (
                  <img src={slide.imageUrl} alt="" className="w-full h-full object-cover object-top" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PhotoIcon className="w-6 h-6 text-subtle" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full border" style={{ color: slide.neon, borderColor: slide.neon + '44', backgroundColor: slide.neon + '11' }}>
                    {slide.tag || 'بدون تگ'}
                  </span>
                  <span className="text-subtle text-xs">#{idx + 1}</span>
                </div>
                <p className="font-semibold text-fg truncate">
                  {slide.title} <span style={{ color: slide.neon }}>{slide.titleAccent}</span>
                </p>
                {slide.body && <p className="text-muted text-sm truncate">{slide.body}</p>}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => reorder(slide, 'up')}
                  disabled={idx === 0 || reorderingId === slide.id}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-fg hover:bg-surface-2 transition-colors disabled:opacity-30"
                  title="بالاتر"
                >
                  <ArrowUpIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => reorder(slide, 'down')}
                  disabled={idx === slides.length - 1 || reorderingId === slide.id}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-fg hover:bg-surface-2 transition-colors disabled:opacity-30"
                  title="پایین‌تر"
                >
                  <ArrowDownIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEdit(slide)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
                  title="ویرایش"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => remove(slide)}
                  disabled={deletingId === slide.id}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-error hover:bg-error/10 transition-colors disabled:opacity-50"
                  title="حذف"
                >
                  {deletingId === slide.id
                    ? <span className="w-3.5 h-3.5 border-2 border-error/30 border-t-error rounded-full animate-spin" />
                    : <TrashIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />

          {/* Panel */}
          <div className="relative bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-surface z-10">
              <h3 className="font-bold text-fg text-lg">
                {isCreating ? 'اسلاید جدید' : 'ویرایش اسلاید'}
              </h3>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-2 text-muted hover:text-fg transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-muted mb-2">تصویر مدل</label>
                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleImageSelect(f); }}
                  onClick={() => inputRef.current?.click()}
                  className="relative border-2 border-dashed border-border hover:border-primary/50 rounded-xl overflow-hidden cursor-pointer transition-colors hover:bg-primary/5"
                  style={{ minHeight: imagePreview ? 240 : 120 }}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="" className="w-full object-contain max-h-60" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-sm font-medium">کلیک برای تغییر</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                      <PhotoIcon className="w-8 h-8 text-subtle" />
                      <p className="text-muted text-sm">تصویر را اینجا رها کنید یا کلیک کنید</p>
                      <p className="text-subtle text-xs">PNG، JPG، WEBP</p>
                    </div>
                  )}
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImageSelect(f); }}
                />
              </div>

              {/* Tag */}
              <div>
                <label className="block text-sm font-medium text-muted mb-2">تگ (badge کوچک)</label>
                <input
                  type="text"
                  value={formData.tag}
                  onChange={e => setFormData(f => ({ ...f, tag: e.target.value }))}
                  placeholder="مثلاً: سایبرپانک"
                  className="admin-input w-full"
                />
              </div>

              {/* Title + TitleAccent */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">عنوان (سفید)</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                    placeholder="آینده را"
                    className="admin-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: formData.neon }}>عنوان رنگی</label>
                  <input
                    type="text"
                    value={formData.titleAccent}
                    onChange={e => setFormData(f => ({ ...f, titleAccent: e.target.value }))}
                    placeholder="به تن کن"
                    className="admin-input w-full"
                    style={{ borderColor: formData.neon + '55', color: formData.neon }}
                  />
                </div>
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-muted mb-2">متن زیرعنوان</label>
                <textarea
                  value={formData.body}
                  onChange={e => setFormData(f => ({ ...f, body: e.target.value }))}
                  placeholder="توضیح کوتاه برای این کالکشن..."
                  rows={2}
                  className="admin-input w-full resize-none"
                />
              </div>

              {/* Neon Color */}
              <div>
                <label className="block text-sm font-medium text-muted mb-2">رنگ نئون</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {NEON_PRESETS.map(p => (
                    <button
                      key={p.value}
                      onClick={() => pickNeonPreset(p)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all"
                      style={{
                        borderColor: p.value + (formData.neon === p.value ? 'ff' : '44'),
                        backgroundColor: formData.neon === p.value ? p.value + '22' : 'transparent',
                        color: p.value,
                      }}
                    >
                      {formData.neon === p.value && <CheckIcon className="w-3 h-3" />}
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.neon}
                    onChange={e => setFormData(f => ({ ...f, neon: e.target.value }))}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-border bg-transparent"
                  />
                  <input
                    type="text"
                    value={formData.neon}
                    onChange={e => setFormData(f => ({ ...f, neon: e.target.value }))}
                    className="admin-input flex-1 font-mono text-sm"
                    placeholder="#a855f7"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-xl overflow-hidden border border-border bg-bg p-4 relative">
                <p className="text-subtle text-xs mb-3">پیش‌نمایش</p>
                <div className="flex gap-3 items-end">
                  {imagePreview && (
                    <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={imagePreview} alt="" className="w-full h-full object-cover object-top" />
                    </div>
                  )}
                  <div>
                    {formData.tag && (
                      <span className="text-xs px-2 py-0.5 rounded-full border mb-2 inline-block" style={{ color: formData.neon, borderColor: formData.neon + '44', backgroundColor: formData.neon + '11' }}>
                        {formData.tag}
                      </span>
                    )}
                    <p className="text-xl font-black leading-tight text-fg">
                      {formData.title} <span style={{ color: formData.neon }}>{formData.titleAccent}</span>
                    </p>
                    {formData.body && <p className="text-muted text-sm mt-1">{formData.body}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border sticky bottom-0 bg-surface">
              <button onClick={closeModal} className="btn text-muted hover:text-fg">لغو</button>
              <button
                onClick={save}
                disabled={saving}
                className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <CheckIcon className="w-4 h-4" />}
                {isCreating ? 'ایجاد اسلاید' : 'ذخیره تغییرات'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
