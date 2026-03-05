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

function Teatro() {
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
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Teatro;
