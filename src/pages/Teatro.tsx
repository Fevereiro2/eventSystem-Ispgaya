import { useMemo } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import Footer from '../components/Footer';
import HeaderNav from '../components/HeaderNav';
import TopBar from '../components/TopBar';
import { getCulturalItemsByArea } from '../data/culturalContent';
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
  const items = useMemo(() => getCulturalItemsByArea('teatro'), []);

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

              {items.length === 0 ? (
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
