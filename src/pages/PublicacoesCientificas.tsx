import Breadcrumbs from '../components/Breadcrumbs';
import DocumentRow from '../components/DocumentRow';
import Footer from '../components/Footer';
import HeaderNav from '../components/HeaderNav';
import StatCard from '../components/StatCard';
import TopBar from '../components/TopBar';
import {
  blockText,
  blockTitle,
  container,
  docsList,
  docsSection,
  heroContent,
  heroImage,
  heroOverlay,
  heroWrap,
  leadText,
  mainContent,
  pageTitle,
  sectionSpace,
  statsGrid
} from '../styles/ui';
import skyline from '../assets/gaia-skyline.webp';

const stats = [
  { value: 611, label: 'Publicacoes' },
  { value: 43, label: 'Livros' },
  { value: 162, label: 'Capitulos' },
  { value: 292, label: 'Artigos Cientificos' },
  { value: 114, label: 'Artigos em atas' }
];

const documents = [
  {
    name: 'Relatorio de Producao Cientifica 2025',
    meta: 'PDF · 2.4 MB · Janeiro 2026',
    href: '#'
  },
  {
    name: 'Guia de Publicacao e Boas Praticas de Investigacao',
    meta: 'PDF · 1.1 MB · Novembro 2025',
    href: '#'
  },
  {
    name: 'Resumo Estatistico de Publicacoes 2010-2025',
    meta: 'PDF · 3.0 MB · Dezembro 2025',
    href: '#'
  }
];

function PublicacoesCientificas() {
  return (
    <>
      <TopBar />
      <HeaderNav />
      <Breadcrumbs />

      <main className={mainContent}>
        <section className={heroWrap}>
          <img src={skyline} alt="" className={heroImage} />
          <div className={heroOverlay} />
          <div className={`${container} ${sectionSpace} ${heroContent}`}>
            <h1 className={pageTitle}>Publicacoes Cientificas</h1>
            <p className={leadText}>
              Esta pagina apresenta, de forma demonstrativa, a atividade editorial e
              cientifica desenvolvida por equipas academicas e parceiros de
              investigacao. O conteudo abaixo usa dados de exemplo para refletir a
              organizacao visual de um portal institucional.
            </p>
          </div>
        </section>

        <section>
          <div className={`${container} ${sectionSpace}`}>
            <h2 className={blockTitle}>Research at ISPGAYA</h2>
            <p className={blockText}>
              Desde 2010, a atividade de investigacao evoluiu de forma consistente,
              com maior colaboracao internacional, reforco da publicacao em revistas
              indexadas e crescimento da producao aplicada em contextos
              profissionais. Os indicadores abaixo ilustram esse percurso.
            </p>

            <div className={statsGrid}>
              {stats.map((stat) => (
                <StatCard key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </div>
          </div>
        </section>

        <section className={docsSection}>
          <div className={`${container} ${sectionSpace}`}>
            <h2 className={blockTitle}>Documentos</h2>
            <p className={blockText}>
              Aceda a documentos institucionais de exemplo com informacao sobre
              resultados, diretrizes editoriais e panorama de publicacoes.
            </p>

            <div className={docsList}>
              {documents.map((document) => (
                <DocumentRow
                  key={document.name}
                  name={document.name}
                  meta={document.meta}
                  href={document.href}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default PublicacoesCientificas;
