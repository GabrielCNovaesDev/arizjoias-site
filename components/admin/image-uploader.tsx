'use client';

import { useState, useRef, useCallback } from 'react';
import { uploadImageAction } from '@/lib/actions/storage';

interface ImageUploaderProps {
  bucket: 'categories' | 'products';
  pathPrefix: string;
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUploader({
  bucket,
  pathPrefix,
  value,
  onChange,
  label = 'Imagem',
}: ImageUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      // Client-side validation
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(file.type)) {
        setError('Formato inválido. Use JPG, PNG ou WebP.');
        return;
      }

      const maxSize = bucket === 'categories' ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`Arquivo muito grande. Máximo: ${maxSize / (1024 * 1024)}MB.`);
        return;
      }

      // Show local preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setUploading(true);

      try {
        const ext = file.name.split('.').pop() ?? 'jpg';
        const path = `${pathPrefix}/${Date.now()}.${ext}`;

        const formData = new FormData();
        formData.set('file', file);
        formData.set('bucket', bucket);
        formData.set('path', path);

        const result = await uploadImageAction(formData);

        if ('error' in result) {
          setError(result.error);
          setPreview(value ?? null);
        } else {
          onChange(result.url);
          setPreview(result.url);
        }
      } finally {
        setUploading(false);
        URL.revokeObjectURL(objectUrl);
      }
    },
    [bucket, pathPrefix, onChange, value]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <div
        style={{
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          marginBottom: 8,
        }}
      >
        {label}
      </div>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? 'var(--color-sage)' : 'var(--color-primary-dark)'}`,
          background: dragging ? 'var(--color-sage-pale)' : 'var(--color-surface)',
          padding: preview ? 0 : '32px 16px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          position: 'relative',
          overflow: 'hidden',
          minHeight: preview ? 160 : undefined,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              style={{
                width: '100%',
                height: 160,
                objectFit: 'cover',
                display: 'block',
                opacity: uploading ? 0.5 : 1,
                transition: 'opacity 0.2s',
              }}
            />
            {uploading && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255,255,255,0.6)',
                  fontSize: 11,
                  color: 'var(--color-text-muted)',
                  letterSpacing: '0.1em',
                }}
              >
                Enviando...
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
            <div style={{ fontSize: 24, marginBottom: 8, color: 'var(--color-text-light)' }}>↑</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              {uploading ? 'Enviando...' : 'Clique ou arraste uma imagem'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-light)', marginTop: 4 }}>
              JPG, PNG ou WebP · máx. {bucket === 'categories' ? '2' : '5'}MB
            </div>
          </div>
        )}
      </div>

      {/* Remove button */}
      {preview && !uploading && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setPreview(null);
            onChange('');
          }}
          style={{
            marginTop: 6,
            fontSize: 10,
            color: 'var(--color-text-light)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: 0,
          }}
        >
          Remover imagem
        </button>
      )}

      {error && (
        <div
          style={{
            marginTop: 6,
            fontSize: 11,
            color: '#b91c1c',
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            padding: '6px 10px',
          }}
        >
          {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />
    </div>
  );
}
