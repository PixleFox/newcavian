'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { TrashIcon, CloudArrowUpIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface HeroModelImage {
  filename: string;
  url: string;
  createdAt: string;
  source: 'uploaded' | 'default';
}

export default function HeroModels() {
  const [images, setImages]   = useState<HeroModelImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/hero-models', { credentials: 'include' });
      const d   = await res.json();
      if (d.success) setImages(d.data);
    } catch {
      toast.error('خطا در بارگذاری تصاویر');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    let success = 0;
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await fetch('/api/admin/hero-models', {
          method: 'POST', credentials: 'include', body: fd,
        });
        const d = await res.json();
        if (d.success) { success++; }
        else { toast.error(d.error || 'خطا در آپلود'); }
      } catch {
        toast.error('خطای اتصال');
      }
    }
    if (success > 0) {
      toast.success(`${success} تصویر آپلود شد`);
      await load();
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const remove = async (img: HeroModelImage) => {
    if (img.source === 'default') {
      toast('این تصویر پیش‌فرض است و قابل حذف نیست. برای مدیریت، ابتدا یک تصویر آپلود کنید.', { icon: 'ℹ️' });
      return;
    }
    if (!confirm(`حذف "${img.filename}"؟`)) return;
    setDeleting(img.filename);
    try {
      const res = await fetch('/api/admin/hero-models', {
        method: 'DELETE', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: img.filename }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success('تصویر حذف شد');
        setImages(prev => prev.filter(i => i.filename !== img.filename));
      } else {
        toast.error(d.error || 'خطا در حذف');
      }
    } catch {
      toast.error('خطای اتصال');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-fg">تصاویر هیرو مدل</h2>
          <p className="text-muted text-sm mt-1">
            تصاویر این بخش به صورت خودکار در اسلایدر هیرو صفحه اول نمایش داده می‌شوند.
          </p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="btn btn-md btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {uploading
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <CloudArrowUpIcon className="w-4 h-4" />}
          آپلود تصویر
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={e => upload(e.target.files)}
        />
      </div>

      {/* Info banner */}
      {images.length > 0 && images[0].source === 'default' && (
        <div className="bg-primary/8 border border-primary/20 rounded-xl px-4 py-3 text-sm text-primary">
          در حال نمایش تصاویر پیش‌فرض از پوشه Models. برای مدیریت کامل، تصاویر خودتان را آپلود کنید.
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); upload(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors duration-200 hover:bg-primary/5"
      >
        <CloudArrowUpIcon className="w-10 h-10 text-subtle" />
        <p className="text-muted text-sm text-center">
          تصویر را اینجا رها کنید یا کلیک کنید
          <br />
          <span className="text-subtle text-xs">PNG، JPG، WEBP — حداکثر ۱۰ مگابایت</span>
        </p>
      </div>

      {/* Images grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl bg-surface-2 animate-pulse" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-subtle">
          <PhotoIcon className="w-12 h-12" />
          <p>هیچ تصویری آپلود نشده است</p>
        </div>
      ) : (
        <>
          <p className="text-subtle text-xs">{images.length} تصویر — به ترتیب جدیدترین</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map((img, i) => (
              <div key={img.filename} className="group relative rounded-xl overflow-hidden bg-surface-2 border border-border">
                {/* Order badge */}
                <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-bg/80 backdrop-blur-sm flex items-center justify-center text-[10px] font-bold text-muted">
                  {i + 1}
                </div>

                {/* Default badge */}
                {img.source === 'default' && (
                  <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/20 text-primary border border-primary/30">
                    پیش‌فرض
                  </div>
                )}

                <img
                  src={img.url}
                  alt={img.filename}
                  className="w-full aspect-[3/4] object-cover object-top"
                  loading="lazy"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                  {img.source === 'uploaded' && (
                    <button
                      onClick={() => remove(img)}
                      disabled={deleting === img.filename}
                      className="w-9 h-9 rounded-full bg-error/20 border border-error/40 text-error flex items-center justify-center hover:bg-error/30 transition-colors disabled:opacity-50"
                      title="حذف"
                    >
                      {deleting === img.filename
                        ? <span className="w-3.5 h-3.5 border-2 border-error/30 border-t-error rounded-full animate-spin" />
                        : <TrashIcon className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
