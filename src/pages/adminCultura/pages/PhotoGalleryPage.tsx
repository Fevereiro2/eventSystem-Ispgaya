import { Images, Trash2 } from 'lucide-react';
import type { Dispatch, FormEvent, SetStateAction } from 'react';

import type { InfoCulturaPhoto } from '../../../api/infoculturaApi';
import PhotoCarousel from '../../../components/ui/PhotoCarousel';
import { resolveInfoCulturaAssetUrl } from '../../../api/client';
import {
  adminActions,
  adminBtnDanger,
  adminBtnEdit,
  adminBtnPrimary,
  adminError,
  adminField,
  adminFieldSpaced,
  adminFormGridSpaced,
  adminInfo,
  adminInput,
  adminLabel,
  adminList,
  adminListDesc,
  adminListHeader,
  adminListItem,
  adminListMeta,
  adminListTitle,
  adminListTools,
  adminListTop,
  adminPanelCard,
  adminPanelForm,
  adminTextarea,
  blockText,
  blockTitle,
} from '../../../styles/ui';
import type { PhotoFormState } from '../types';

type PhotoGalleryPageProps = {
  photos: InfoCulturaPhoto[];
  form: PhotoFormState;
  setForm: Dispatch<SetStateAction<PhotoFormState>>;
  editingPhotoId: string | null;
  isSaving: boolean;
  isUploading: boolean;
  isLoading: boolean;
  error: string;
  uploadingKey: number;
  deletingPhotoId: string | null;
  showForm: boolean;
  showList: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onImageUpload: (file: File) => void;
  onEdit: (photo: InfoCulturaPhoto) => void;
  onDelete: (id: string) => void;
};

function PhotoGalleryPage({
  photos,
  form,
  setForm,
  editingPhotoId,
  isSaving,
  isUploading,
  isLoading,
  error,
  uploadingKey,
  deletingPhotoId,
  showForm,
  showList,
  onSubmit,
  onImageUpload,
  onEdit,
  onDelete,
}: PhotoGalleryPageProps) {
  const activePhotos = photos.filter((photo) => photo.is_active).sort((a, b) => a.display_order - b.display_order);
  const previewPhotos = activePhotos.filter((photo) => photo.section.trim() === 'laboratorio-cultural');

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
            <Images className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Galeria</h2>
            <p className="mt-1 text-sm text-slate-600">
              Gestão das imagens usadas em carrosséis e secções visuais.
            </p>
          </div>
        </div>
      </section>

      {error ? <p className={adminError}>{error}</p> : null}

      {showForm ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <form onSubmit={onSubmit} className={adminPanelForm}>
            <h3 className={blockTitle}>{editingPhotoId ? 'Editar Foto' : 'Nova Foto'}</h3>
            <p className={blockText}>Cria imagens para o carrossel do Laboratório Cultural.</p>

            <div className={adminFormGridSpaced}>
              <div className={adminField}>
                <label className={adminLabel} htmlFor="photo-order">
                  Ordem
                </label>
                <input
                  id="photo-order"
                  type="number"
                  min="0"
                  className={adminInput}
                  value={form.display_order}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, display_order: event.target.value }))
                  }
                />
              </div>

              <div className={adminField}>
                <label className={adminLabel} htmlFor="photo-title">
                  Título
                </label>
                <input
                  id="photo-title"
                  className={adminInput}
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                />
              </div>

              <div className={adminField}>
                <label className={adminLabel} htmlFor="photo-alt-text">
                  Alt text
                </label>
                <input
                  id="photo-alt-text"
                  className={adminInput}
                  value={form.alt_text}
                  onChange={(event) => setForm((prev) => ({ ...prev, alt_text: event.target.value }))}
                />
              </div>
            </div>

            <div className={adminFieldSpaced}>
              <label className={adminLabel} htmlFor="photo-caption">
                Legenda
              </label>
              <textarea
                id="photo-caption"
                rows={4}
                className={adminTextarea}
                value={form.caption}
                onChange={(event) => setForm((prev) => ({ ...prev, caption: event.target.value }))}
              />
            </div>

            <div className={adminFieldSpaced}>
              <label className={adminLabel} htmlFor="photo-image">
                Imagem
              </label>
              <input
                key={uploadingKey}
                id="photo-image"
                type="file"
                accept="image/*"
                className={adminInput}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    onImageUpload(file);
                  }
                }}
              />
              <p className={adminInfo}>
                {isUploading
                  ? 'A carregar imagem...'
                  : form.image
                    ? 'Imagem carregada com sucesso.'
                    : 'Seleciona a imagem para o carrossel.'}
              </p>
              {form.image ? (
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <img
                    src={resolveInfoCulturaAssetUrl(form.image)}
                    alt={form.alt_text || form.title || 'Pré-visualização'}
                    className="h-64 w-full object-cover"
                  />
                </div>
              ) : null}
            </div>

            <div className={adminFieldSpaced}>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, is_active: event.target.checked }))
                  }
                />
                Foto ativa
              </label>
            </div>

            <div className={adminActions}>
              <button type="submit" className={adminBtnPrimary} disabled={isSaving}>
                {isSaving ? 'A guardar...' : editingPhotoId ? 'Guardar alterações' : 'Criar foto'}
              </button>
            </div>
          </form>

          <aside className={adminPanelCard}>
            <h3 className={blockTitle}>Pré-visualização</h3>
            <p className={blockText}>
              O preview mostra as fotos ativas do carrossel pela ordem definida.
            </p>
            {previewPhotos.length > 0 ? (
              <PhotoCarousel items={previewPhotos} className="mt-5" aspectClassName="aspect-[4/3]" />
            ) : (
              <p className="mt-5 text-sm text-slate-500">Ainda não existem fotos ativas no carrossel.</p>
            )}
          </aside>
        </div>
      ) : null}

      {showList ? (
        <section className={adminPanelCard}>
          <h3 className={blockTitle}>Fotos registadas</h3>
          <p className={blockText}>Lista organizada por secção e ordem de apresentação.</p>

          {isLoading ? <p className="mt-4 text-sm text-slate-500">A carregar fotos...</p> : null}

          <div className={adminList}>
            {photos.map((photo) => (
              <article key={photo.id} className={adminListItem}>
                <div className={adminListTop}>
                  <div className={adminListHeader}>
                    <p className={adminListTitle}>{photo.title}</p>
                    <p className={adminListMeta}>
                      Ordem: {photo.display_order} · {photo.is_active ? 'Ativa' : 'Inativa'}
                    </p>
                  </div>
                  <div className={adminListTools}>
                    <button type="button" className={adminBtnEdit} onClick={() => onEdit(photo)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className={adminBtnDanger}
                      onClick={() => onDelete(photo.id)}
                      disabled={deletingPhotoId === photo.id}
                    >
                      <span className="inline-flex items-center gap-1">
                        <Trash2 className="h-3.5 w-3.5" />
                        {deletingPhotoId === photo.id ? 'A apagar...' : 'Apagar'}
                      </span>
                    </button>
                  </div>
                </div>

                {photo.image ? (
                  <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
                    <img
                      src={resolveInfoCulturaAssetUrl(photo.image)}
                      alt={photo.alt_text || photo.title}
                      className="h-52 w-full object-cover"
                    />
                  </div>
                ) : null}

                {photo.caption ? <p className={adminListDesc}>{photo.caption}</p> : null}
              </article>
            ))}

            {!isLoading && photos.length === 0 ? (
              <p className="text-sm text-slate-500">Ainda não existem fotos registadas.</p>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default PhotoGalleryPage;
