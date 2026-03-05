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

function TunaAcademica() {
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
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default TunaAcademica;
