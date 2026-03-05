import Breadcrumbs from '../components/Breadcrumbs';
import Footer from '../components/Footer';
import HeaderNav from '../components/HeaderNav';
import TopBar from '../components/TopBar';
import {
  blockText,
  blockTitle,
  container,
  contentCard,
  contentSection,
  mainContent
} from '../styles/ui';

function ClubeLeitura() {
  return (
    <>
      <TopBar />
      <HeaderNav />
      <Breadcrumbs
        title="Clube de Leitura"
        description="Pagina de trabalho do Clube de Leitura do Laboratorio Cultural."
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
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default ClubeLeitura;
