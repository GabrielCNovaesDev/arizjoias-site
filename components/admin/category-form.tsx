'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/utils/slugify';
import { ImageUploader } from '@/components/admin/image-uploader';

interface CategoryFormProps {
  action: (formData: FormData) => Promise<{ error: string } | void>;
  defaultValues?: {
    name?: string;
    slug?: string;
    description?: string;
    display_order?: number;
    image_url?: string;
  };
  submitLabel?: string;
  extraActions?: React.ReactNode;
}

export function CategoryForm({
  action,
  defaultValues = {},
  submitLabel = 'Salvar categoria',
  extraActions,
}: CategoryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(defaultValues.name ?? '');
  const [slug, setSlug] = useState(defaultValues.slug ?? '');
  const [slugManual, setSlugManual] = useState(!!defaultValues.slug);
  const [imageUrl, setImageUrl] = useState(defaultValues.image_url ?? '');

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setName(val);
    if (!slugManual) {
      setSlug(slugify(val));
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugManual(true);
    setSlug(e.target.value);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-primary-dark)',
    padding: '10px 14px',
    fontSize: 13,
    fontFamily: 'var(--font-body)',
    color: 'var(--color-text)',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 10,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--color-text-muted)',
    marginBottom: 6,
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            color: '#b91c1c',
            padding: '12px 16px',
            fontSize: 12,
            marginBottom: 24,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Nome */}
        <div>
          <label htmlFor="name" style={labelStyle}>Nome *</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={name}
            onChange={handleNameChange}
            style={inputStyle}
            placeholder="Ex: Anéis"
          />
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" style={labelStyle}>Slug *</label>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            value={slug}
            onChange={handleSlugChange}
            style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 12 }}
            placeholder="ex: aneis"
          />
          <div style={{ fontSize: 10, color: 'var(--color-text-light)', marginTop: 4 }}>
            Gerado automaticamente a partir do nome. Pode ser editado.
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label htmlFor="description" style={labelStyle}>Descrição</label>
          <textarea
            id="description"
            name="description"
            defaultValue={defaultValues.description ?? ''}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Descrição opcional da categoria"
          />
        </div>

        {/* Ordem */}
        <div>
          <label htmlFor="display_order" style={labelStyle}>Ordem de exibição</label>
          <input
            id="display_order"
            name="display_order"
            type="number"
            min={0}
            defaultValue={defaultValues.display_order ?? 0}
            style={{ ...inputStyle, width: 120 }}
          />
          <div style={{ fontSize: 10, color: 'var(--color-text-light)', marginTop: 4 }}>
            Menor número aparece primeiro.
          </div>
        </div>

        {/* URL da imagem (preenchida pelo uploader) */}
        <input type="hidden" name="image_url" value={imageUrl} />

        {/* Image uploader */}
        <ImageUploader
          bucket="categories"
          pathPrefix="covers"
          value={imageUrl}
          onChange={setImageUrl}
          label="Imagem de capa"
        />
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginTop: 32,
          paddingTop: 24,
          borderTop: '1px solid var(--color-primary)',
          alignItems: 'center',
        }}
      >
        <button
          type="submit"
          disabled={isPending}
          className="az-btn az-btn-primary"
          style={{ opacity: isPending ? 0.6 : 1 }}
        >
          {isPending ? 'Salvando...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/categorias')}
          className="az-btn az-btn-ghost"
        >
          Cancelar
        </button>
        {extraActions}
      </div>
    </form>
  );
}
