import Breadcrumbs from '../components/Breadcrumbs';
import DocumentRow from '../components/DocumentRow';
import Footer from '../components/Footer';
import HeaderNav from '../components/HeaderNav';
import PieChartHero from '../components/PieChartHero';
import StatCard from '../components/StatCard';
import TopBar from '../components/TopBar';
import {
  blockText,
  blockTitle,
  container,
  docsList,
  docsSection,
  mainContent,
  pieSection,
  sectionSpace,
  statsGrid,
  statsSection
} from '../styles/ui';

const stats = [
  { value: 611, label: 'Publicacoes' },
  { value: 43, label: 'Livros' },
  { value: 162, label: 'Capitulos' },
  { value: 292, label: 'Artigos Cientificos' },
  { value: 114, label: 'Artigos em atas' }
];

const document = {
  name: 'Publicacoes Cientificas 2010-2024-janeiro.pdf',
  meta: '853KB',
  href: '#'
};

function PublicacoesCientificas() {
  return (
    <>
      <TopBar />
      <HeaderNav />
      <Breadcrumbs
        title="Publicacoes Cientificas"
        description="O ISPGAYA desenvolve investigacao cientifica nas diversas areas em que oferece formacao, resultando em publicacoes, livros, capitulos e artigos cientificos."
      />

      <main className={mainContent}>
        <section className={statsSection}>
          <div className={container}>
            <h2 className={blockTitle}>Research at ISPGAYA</h2>
            <p className={blockText}>
              A producao cientifica institucional tem registado crescimento
              sustentado, refletindo colaboracao nacional e internacional em
              diferentes areas de conhecimento.
            </p>
            <div className={statsGrid}>
              {stats.map((item) => (
                <StatCard key={item.label} value={item.value} label={item.label} />
              ))}
            </div>
          </div>
        </section>

        <section className={pieSection}>
          <div className={container}>
            <PieChartHero />
          </div>
        </section>

        <section className={docsSection}>
          <div className={`${container} ${sectionSpace}`}>
            <h2 className={blockTitle}>Documentos</h2>
            <div className={docsList}>
              <DocumentRow name={document.name} meta={document.meta} href={document.href} />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default PublicacoesCientificas;
