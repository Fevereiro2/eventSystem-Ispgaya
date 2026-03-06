import { useEffect, useState } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import Footer from '../components/Footer';
import HeaderNav from '../components/HeaderNav';
import TopBar from '../components/TopBar';
import { CulturalItem } from '../data/culturalContent';
import { fetchPublicContent } from '../data/infoculturaApi';
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

function Teatro() {
  const [items, setItems] = useState<CulturalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadItems() {
      try {
        const next = await fetchPublicContent('teatro');
        if (!active) return;
        setItems(next);
      } catch (error) {
        if (!active) return;
        const message =
          error instanceof Error ? error.message : 'Nao foi possivel carregar os conteudos.';
        setLoadError(message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadItems();

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <TopBar />
      <HeaderNav />
      <Breadcrumbs
        title="Teatro"
        description="Pagina de trabalho do nucleo de Teatro do Laboratorio Cultural."
        parentLabel="Laboratorio Cultural"
        parentHref="/laboratorio-cultural"
        currentLabel="Teatro"
        currentHref="/laboratorio-cultural/teatro"
      />

      <main className={mainContent}>
        <section className={contentSection}>
          <div className={container}>
            <div className={contentCard}>
              <h2 className={blockTitle}>Teatro</h2>
              <p className={blockText}>
                Area preparada para conteudos de Teatro: elenco, ensaios, pecas em
                desenvolvimento e agenda de apresentacoes.
              </p>

              {isLoading ? (
                <p className={contentEmpty}>A carregar conteudos...</p>
              ) : loadError ? (
                <p className={contentEmpty}>{loadError}</p>
              ) : items.length === 0 ? (
                <p className={contentEmpty}>Ainda nao existem conteudos publicados.</p>
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
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Teatro;
