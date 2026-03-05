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

function ClubeLeitura() {
  const items = useMemo(() => getCulturalItemsByArea('clube-leitura'), []);

  return (
    <>
      <TopBar />
      <HeaderNav />
      <Breadcrumbs
        title="Laboratorio Cultural"
        description="A nossa abordagem cultural e interdisciplinar, promovendo criacao artistica, participacao academica e ligacao com a comunidade."
        parentLabel="Laboratorio Cultural"
        parentHref="/laboratorio-cultural"
        currentLabel="Clube de Leitura"
        currentHref="/laboratorio-cultural/clube-leitura"
      />

      <main className={mainContent}>
        <section className={contentSection}>
          <div className={container}>
            <div className={contentCard}>
              <h2 className={blockTitle}>Clube de Leitura</h2>
              <p className={blockText}>
                Area preparada para dinamicas do Clube de Leitura: livros do mes,
                encontros, notas e recomendacoes da comunidade academica.
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

export default ClubeLeitura;
