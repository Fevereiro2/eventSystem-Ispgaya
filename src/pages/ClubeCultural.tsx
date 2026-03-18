import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import Footer from '../components/Footer';
import HeaderNav from '../components/HeaderNav';
import TopBar from '../components/TopBar';
import { CulturalArea, CulturalItem } from '../data/culturalContent';
import { fetchPublicClub, fetchPublicContent, InfoCulturaClub } from '../data/infoculturaApi';
import {
  blockText,
  blockTitle,
  container,
  contentCard,
  contentEmpty,
  contentItemCard,
  contentItemDate,
  contentItemDesc,
  contentItemHeader,
  contentItemStatus,
  contentItemTitle,
  contentItems,
  contentSection,
  mainContent
} from '../styles/ui';

function normalizeLabel(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getAreaFromClubName(name: string): CulturalArea | null {
  const label = normalizeLabel(name);

  if (label.includes('tuna')) return 'tuna';
  if (label.includes('leitura')) return 'clube-leitura';
  if (label.includes('teatro')) return 'teatro';
  return null;
}

function ClubeCultural() {
  const { clubId } = useParams();
  const [club, setClub] = useState<InfoCulturaClub | null>(null);
  const [items, setItems] = useState<CulturalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadClub() {
      if (!clubId) {
        setLoadError('Clube invalido.');
        setIsLoading(false);
        return;
      }

      try {
        const nextClub = await fetchPublicClub(Number(clubId));
        if (!active) return;

        setClub(nextClub);

        const area = getAreaFromClubName(nextClub.name);
        if (area) {
          const nextItems = await fetchPublicContent(area);
          if (!active) return;
          setItems(nextItems);
        } else {
          setItems([]);
        }
      } catch (error) {
        if (!active) return;
        const message =
          error instanceof Error ? error.message : 'Nao foi possivel carregar o clube.';
        setLoadError(message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadClub();

    return () => {
      active = false;
    };
  }, [clubId]);

  const title = club?.name || 'Clube Cultural';

  return (
    <>
      <TopBar />
      <HeaderNav />
      <Breadcrumbs
        title="Laboratorio Cultural"
        description="A nossa abordagem cultural e interdisciplinar, promovendo criacao artistica, participacao academica e ligacao com a comunidade."
        parentLabel="Laboratorio Cultural"
        parentHref="/laboratorio-cultural"
        currentLabel={title}
        currentHref={clubId ? `/laboratorio-cultural/clubes/${clubId}` : '/laboratorio-cultural'}
      />

      <main className={mainContent}>
        <section className={contentSection}>
          <div className={container}>
            <div className={contentCard}>
              <h2 className={blockTitle}>{title}</h2>
              <p className={blockText}>
                {club?.mission || club?.description || 'Pagina publica do clube cultural.'}
              </p>

              {isLoading ? (
                <p className={contentEmpty}>A carregar clube...</p>
              ) : loadError ? (
                <p className={contentEmpty}>{loadError}</p>
              ) : club?.description ? (
                <p className={blockText}>{club.description}</p>
              ) : null}

              {!isLoading && !loadError ? (
                <>
                  {items.length === 0 ? (
                    <p className={contentEmpty}>Ainda nao existem conteudos publicados para este clube.</p>
                  ) : (
                    <div className={contentItems}>
                      {items.map((item) => (
                        <article key={item.id} className={contentItemCard}>
                          <div className={contentItemHeader}>
                            <h3 className={contentItemTitle}>{item.title}</h3>
                            <span className={contentItemStatus}>{item.status}</span>
                          </div>
                          <p className={contentItemDate}>{item.date}</p>
                          <p className={contentItemDesc}>{item.description}</p>
                        </article>
                      ))}
                    </div>
                  )}
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

export default ClubeCultural;
