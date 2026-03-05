import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import Footer from '../components/Footer';
import HeaderNav from '../components/HeaderNav';
import TopBar from '../components/TopBar';
import {
  blockText,
  blockTitle,
  container,
  contentCard,
  contentLink,
  contentList,
  contentSection,
  mainContent
} from '../styles/ui';

function LaboratorioCultural() {
  return (
    <>
      <TopBar />
      <HeaderNav />
      <Breadcrumbs
        title="Laboratorio Cultural"
        description="Espaco dedicado a dinamicas artisticas e culturais do ISPGAYA, com atividades de Tuna Academica, Clube de Leitura e Teatro."
        parentLabel="Laboratorio Cultural"
        parentHref="/laboratorio-cultural"
        currentLabel="Laboratorio Cultural"
        currentHref="/laboratorio-cultural"
      />

      <main className={mainContent}>
        <section className={contentSection}>
          <div className={container}>
            <div className={contentCard}>
              <h2 className={blockTitle}>Areas do Laboratorio</h2>
              <p className={blockText}>
                Escolhe a area que queres desenvolver. Cada bloco tem pagina propria
                para poderes continuar a construir conteudo especifico.
              </p>
              <ul className={contentList}>
                <li>
                  <Link to="/laboratorio-cultural/tuna" className={contentLink}>
                    Tuna Academica
                  </Link>
                </li>
                <li>
                  <Link to="/laboratorio-cultural/clube-leitura" className={contentLink}>
                    Clube de Leitura
                  </Link>
                </li>
                <li>
                  <Link to="/laboratorio-cultural/teatro" className={contentLink}>
                    Teatro
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default LaboratorioCultural;
