import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import Footer from '../components/Footer';
import HeaderNav from '../components/HeaderNav';
import TopBar from '../components/TopBar';
import {
  fetchPublicEventItem,
  fetchPublicNewsItem,
  fetchPublicSessionItem,
  InfoCulturaEvent,
  InfoCulturaNews,
  InfoCulturaSession,
  resolveInfoCulturaAssetUrl
} from '../data/infoculturaApi';
import {
  adminBtnSecondary,
  blockText,
  blockTitle,
  container,
  contentCard,
  contentEmpty,
  contentSection,
  mainContent
} from '../styles/ui';

type EntryKind = 'news' | 'session' | 'event';

type CulturalEntryDetailProps = {
  kind: EntryKind;
};

function formatDate(value?: string | null): string {
  if (!value) return 'Sem data';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'medium',
    timeStyle: value.includes('T') ? 'short' : undefined
  }).format(date);
}

function CulturalEntryDetail({ kind }: CulturalEntryDetailProps) {
  const params = useParams();
  const itemId =
    kind === 'news' ? params.newsId : kind === 'session' ? params.sessionId : params.eventId;
  const [entry, setEntry] = useState<InfoCulturaNews | InfoCulturaSession | InfoCulturaEvent | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadEntry() {
      if (!itemId) {
        setLoadError('Conteudo invalido.');
        setIsLoading(false);
        return;
      }

      try {
        const parsedId = Number(itemId);
        const nextEntry =
          kind === 'news'
            ? await fetchPublicNewsItem(parsedId)
            : kind === 'session'
              ? await fetchPublicSessionItem(parsedId)
              : await fetchPublicEventItem(parsedId);

        if (!active) return;
        setEntry(nextEntry);
      } catch (error) {
        if (!active) return;
        const message =
          error instanceof Error ? error.message : 'Nao foi possivel carregar o detalhe.';
        setLoadError(message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadEntry();

    return () => {
      active = false;
    };
  }, [itemId, kind]);

  const title = entry?.title || 'Detalhe';
  const clubId = entry && 'club_id' in entry ? entry.club_id : undefined;
  const clubName = entry && 'club_name' in entry ? entry.club_name : undefined;
  const image: string =
    entry && 'image' in entry
      ? String(entry.image || '')
      : entry && 'cover_image' in entry
        ? String(entry.cover_image || '')
        : '';

  return (
    <>
      <TopBar />
      <HeaderNav />
      <Breadcrumbs
        title={title}
        description="Detalhe publico do conteudo cultural."
        parentLabel="Laboratorio Cultural"
        parentHref="/laboratorio-cultural"
        currentLabel={title}
        currentHref="#"
      />

      <main className={mainContent}>
        <section className={contentSection}>
          <div className={container}>
            <div className={contentCard}>
              {isLoading ? <p className={contentEmpty}>A carregar detalhe...</p> : null}
              {loadError ? <p className={contentEmpty}>{loadError}</p> : null}
              {!isLoading && !loadError && entry ? (
                <>
                  {image ? (
                    <img
                      src={resolveInfoCulturaAssetUrl(image)}
                      alt={title}
                      className="mb-6 h-72 w-full rounded-2xl object-cover"
                    />
                  ) : null}
                  <h2 className={blockTitle}>{title}</h2>
                  <p className={blockText}>
                    {clubName ? `${clubName} · ` : ''}
                    {'published_at' in entry
                      ? formatDate(entry.published_at || entry.created_at)
                      : 'session_date' in entry
                        ? formatDate(entry.start_date)
                        : formatDate(entry.start_date)}
                  </p>
                  {'summary' in entry ? (
                    <p className={blockText}>{entry.summary}</p>
                  ) : null}
                  {'description' in entry ? (
                    <p className={blockText}>{entry.description}</p>
                  ) : null}
                  {'content' in entry ? (
                    <div className="mt-6 whitespace-pre-wrap text-slate-700">{entry.content}</div>
                  ) : null}
                  {'categories' in entry && entry.categories.length > 0 ? (
                    <p className={blockText}>
                      Categorias: {entry.categories.map((category) => category.name).join(', ')}
                    </p>
                  ) : null}
                  {'location' in entry ? (
                    <p className={blockText}>
                      Local: {entry.location || entry.city || 'Local por definir'}
                    </p>
                  ) : null}
                  <div className="mt-8 flex flex-wrap gap-3">
                    {clubId ? (
                      <Link
                        to={`/laboratorio-cultural/clubes/${clubId}`}
                        className={adminBtnSecondary}
                      >
                        Ver clube
                      </Link>
                    ) : null}
                    <Link to="/laboratorio-cultural" className={adminBtnSecondary}>
                      Voltar ao laboratorio
                    </Link>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default CulturalEntryDetail;
