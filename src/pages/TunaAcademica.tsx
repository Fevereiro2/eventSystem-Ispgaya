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

function TunaAcademica() {
  const items = useMemo(() => getCulturalItemsByArea('tuna'), []);

  return (
    <>
      <TopBar />
      <HeaderNav />
      <Breadcrumbs
        title="Tuna Academica"
        description="Pagina de trabalho da Tuna Academica do Laboratorio Cultural."
        parentLabel="Laboratorio Cultural"
        parentHref="/laboratorio-cultural"
        currentLabel="Tuna Academica"
        currentHref="/laboratorio-cultural/tuna"
      />

      <main className={mainContent}>
        <section className={contentSection}>
          <div className={container}>
            <div className={contentCard}>
              <h2 className={blockTitle}>Tuna Academica</h2>
              <p className={blockText}>
                Area preparada para conteudos da Tuna Academica: calendario,
                repertorio, eventos e informacao para novos elementos.
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

export default TunaAcademica;
