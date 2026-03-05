import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import Footer from '../components/Footer';
import HeaderNav from '../components/HeaderNav';
import TopBar from '../components/TopBar';
import {
  container,
  labResearchGrid,
  labResearchHeroCard,
  labResearchHeroText,
  labResearchHeroTitle,
  labResearchLink,
  labResearchSection,
  labResearchSubcard,
  labResearchSubtext,
  labResearchSubtitle,
  mainContent
} from '../styles/ui';

const culturalAreas = [
  {
    title: 'InfoCultura',
    href: '/infocultura',
    summary:
      'A plataforma de gestao cultural agrega publicacoes, agenda e comunicacao das iniciativas do Laboratorio Cultural.',
    featured: false
  },
  {
    title: 'Tuna Academica',
    href: '/laboratorio-cultural/tuna',
    summary:
      'Dinamica artistica orientada para repertorio, ensaios e representacoes no contexto academico e comunitario.'
  },
  {
    title: 'Clube de Leitura',
    href: '/laboratorio-cultural/clube-leitura',
    summary:
      'Espaco de debate e partilha de obras, com encontros regulares e atividades de mediacao de leitura.'
  },
  {
    title: 'Teatro',
    href: '/laboratorio-cultural/teatro',
    summary:
      'Projeto de expressao cenica com foco em criacao colaborativa, ensaios e apresentacoes tematicas.'
  }
];

function LaboratorioCultural() {
  return (
    <>
      <TopBar />
      <HeaderNav />
      <Breadcrumbs
        title="Laboratorio Cultural"
        description="A nossa abordagem cultural e interdisciplinar, promovendo criacao artistica, participacao academica e ligacao com a comunidade."
        parentLabel="Laboratorio Cultural"
        parentHref="/laboratorio-cultural"
        currentLabel="Laboratorio Cultural"
        currentHref="/laboratorio-cultural"
      />

      <main className={mainContent}>
        <section className={labResearchSection}>
          <div className={container}>


            <div className={labResearchGrid}>
              {culturalAreas.map((area) =>
                area.featured ? (
                  <article key={area.title} className={labResearchHeroCard}>
                    <h2 className={labResearchHeroTitle}>{area.title}</h2>
                    <p className={labResearchHeroText}>{area.summary}</p>
                    <Link to={area.href} className={labResearchLink}>
                      Ver mais
                    </Link>
                  </article>
                ) : (
                  <article key={area.title} className={labResearchSubcard}>
                    <h3 className={labResearchSubtitle}>{area.title}</h3>
                    <p className={labResearchSubtext}>{area.summary}</p>
                    <Link to={area.href} className={labResearchLink}>
                      Ver mais
                    </Link>
                  </article>
                )
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default LaboratorioCultural;
