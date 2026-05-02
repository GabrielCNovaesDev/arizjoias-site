'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/utils/slugify';
import { ImageUploader } from '@/components/admin/image-uploader';

interface Category {
  id: string;
  name: string;
}

interface ProductImage {
  url: string;
  alt_text?: string | null;
}

interface ProductFormProps {
  action: (formData: FormData) => Promise<{ error: string } | void>;
  categories: Category[];
  defaultValues?: {
    name?: string;
    slug?: string;
    description?: string;
    category_id?: string | null;
    material?: string | null;
    price?: string;
    promotional_price?: string;
    stock?: number;
    weight_grams?: number;
    width_cm?: number;
    height_cm?: number;
    length_cm?: number;
    is_active?: boolean;
    is_featured?: boolean;
    images?: ProductImage[];
  };
  submitLabel?: string;
  extraActions?: React.ReactNode;
}

export function ProductForm({
  action,
  categories,
  defaultValues = {},
  submitLabel = 'Salvar produto',
  extraActions,
}: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(defaultValues.name ?? '');
  const [slug, setSlug] = useState(defaultValues.slug ?? '');
  const [slugManual, setSlugManual] = useState(!!defaultValues.slug);
  const [images, setImages] = useState<ProductImage[]>(defaultValues.images ?? []);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setName(val);
    if (!slugManual) setSlug(slugify(val));
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugManual(true);
    setSlug(e.target.value);
  }

  function addImage() {
    setImages((prev) => [...prev, { url: '', alt_text: '' }]);
  }

  function updateImageUrl(index: number, url: string) {
    setImages((prev) => prev.map((img, i) => (i === index ? { ...img, url } : img)));
  }

  function updateImageAlt(index: number, alt: string) {
    setImages((prev) => prev.map((img, i) => (i === index ? { ...img, alt_text: alt } : img)));
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    // Append images
    images.forEach((img) => {
      formData.append('image_urls[]', img.url);
      formData.append('image_alts[]', img.alt_text ?? '');
    });

    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) setError(result.error);
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

  const sectionStyle: React.CSSProperties = {
    background: 'var(--color-bg)',
    border: '1px solid var(--color-primary)',
    padding: '24px',
    marginBottom: 20,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: 18,
    fontWeight: 300,
    margin: '0 0 20px',
    paddingBottom: 12,
    borderBottom: '1px solid var(--color-primary)',
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 800 }}>
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px 16px', fontSize: 12, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Básico */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Informações básicas</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="name" style={labelStyle}>Nome *</label>
            <input id="name" name="name" type="text" required value={name} onChange={handleNameChange} style={inputStyle} placeholder="Ex: Anel Borboleta" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="slug" style={labelStyle}>Slug *</label>
            <input id="slug" name="slug" type="text" required value={slug} onChange={handleSlugChange} style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 12 }} />
            <div style={{ fontSize: 10, color: 'var(--color-text-light)', marginTop: 4 }}>Usado na URL: /produto/{slug || 'slug-do-produto'}</div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="description" style={labelStyle}>Descrição</label>
            <textarea id="description" name="description" defaultValue={defaultValues.description ?? ''} rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Descrição do produto..." />
          </div>
          <div>
            <label htmlFor="category_id" style={labelStyle}>Categoria</label>
            <select id="category_id" name="category_id" defaultValue={defaultValues.category_id ?? ''} style={inputStyle}>
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="material" style={labelStyle}>Material</label>
            <input id="material" name="material" type="text" defaultValue={defaultValues.material ?? ''} style={inputStyle} placeholder="Ex: Prata 925" />
          </div>
        </div>
      </div>

      {/* Preço */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Preço e estoque</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div>
            <label htmlFor="price" style={labelStyle}>Preço normal *</label>
            <input id="price" name="price" type="text" required defaultValue={defaultValues.price ?? ''} style={inputStyle} placeholder="R$ 0,00" />
          </div>
          <div>
            <label htmlFor="promotional_price" style={labelStyle}>Preço promocional</label>
            <input id="promotional_price" name="promotional_price" type="text" defaultValue={defaultValues.promotional_price ?? ''} style={inputStyle} placeholder="R$ 0,00" />
          </div>
          <div>
            <label htmlFor="stock" style={labelStyle}>Estoque *</label>
            <input id="stock" name="stock" type="number" min={0} required defaultValue={defaultValues.stock ?? 0} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Dimensões */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Dimensões e peso</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <div>
            <label htmlFor="weight_grams" style={labelStyle}>Peso (g)</label>
            <input id="weight_grams" name="weight_grams" type="number" min={0} defaultValue={defaultValues.weight_grams ?? 0} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="width_cm" style={labelStyle}>Largura (cm)</label>
            <input id="width_cm" name="width_cm" type="number" min={0} step="0.1" defaultValue={defaultValues.width_cm ?? 0} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="height_cm" style={labelStyle}>Altura (cm)</label>
            <input id="height_cm" name="height_cm" type="number" min={0} step="0.1" defaultValue={defaultValues.height_cm ?? 0} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="length_cm" style={labelStyle}>Comprimento (cm)</label>
            <input id="length_cm" name="length_cm" type="number" min={0} step="0.1" defaultValue={defaultValues.length_cm ?? 0} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Imagens */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Imagens</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {images.map((img, i) => (
            <div key={i} style={{ border: '1px solid var(--color-primary)', padding: 16, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-text-light)' }}>
                  Imagem {i + 1}{i === 0 ? ' (principal)' : ''}
                </span>
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  style={{ fontSize: 10, color: '#b91c1c', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                >
                  Remover
                </button>
              </div>
              <ImageUploader
                bucket="products"
                pathPrefix={`products/${slug || 'produto'}`}
                value={img.url}
                onChange={(url) => updateImageUrl(i, url)}
                label=""
              />
              <div style={{ marginTop: 10 }}>
                <label style={labelStyle}>Texto alternativo (acessibilidade)</label>
                <input
                  type="text"
                  value={img.alt_text ?? ''}
                  onChange={(e) => updateImageAlt(i, e.target.value)}
                  style={inputStyle}
                  placeholder={`Descrição da imagem ${i + 1}`}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addImage}
            style={{
              background: 'none',
              border: '1px dashed var(--color-primary-dark)',
              padding: '12px',
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            + Adicionar imagem
          </button>
        </div>
      </div>

      {/* Visibilidade */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Visibilidade</h2>
        <div style={{ display: 'flex', gap: 32 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
            <input
              type="hidden"
              name="is_active"
              value="false"
            />
            <input
              type="checkbox"
              name="is_active"
              value="true"
              defaultChecked={defaultValues.is_active ?? true}
              style={{ width: 16, height: 16, accentColor: 'var(--color-sage-dark)' }}
            />
            Produto ativo (visível na loja)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
            <input
              type="hidden"
              name="is_featured"
              value="false"
            />
            <input
              type="checkbox"
              name="is_featured"
              value="true"
              defaultChecked={defaultValues.is_featured ?? false}
              style={{ width: 16, height: 16, accentColor: 'var(--color-gold)' }}
            />
            Destaque na home
          </label>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingTop: 8 }}>
        <button type="submit" disabled={isPending} className="az-btn az-btn-primary" style={{ opacity: isPending ? 0.6 : 1 }}>
          {isPending ? 'Salvando...' : submitLabel}
        </button>
        <button type="button" onClick={() => router.push('/admin/produtos')} className="az-btn az-btn-ghost">
          Cancelar
        </button>
        {extraActions}
      </div>
    </form>
  );
}
