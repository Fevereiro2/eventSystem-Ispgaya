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


function PublicacoesCientificas() {
  return (
    <>
      <TopBar />
      <HeaderNav />
      <Breadcrumbs
        title="Clube de Leitura"
        description="Bem-vindo ao Clube de Leitura da ISPGAYA! Um espaço dedicado aos amantes de livros e histórias. "
      />

      <main className={mainContent}>
          <div className={`${container} ${sectionSpace}`}>
            <h2 className={blockTitle}>Aqui podes: </h2>
            <p className={blockText}>
              Descobrir novas obras literárias, participar em sessões de leitura, trocar recomendações com outros clubistas, aprofundar a tua paixão pela literatura. 
              Junta-te a uma comunidade vibrante onde cada livro é uma porta para novos mundos e ideias.
            </p>
          
            <img className="mx-auto w-full max-w-5xl aspect-[3/1] object-cover shadow-xl rounded-sm" src="/src/assets/img/clube_leitura_ispgaya.jpg " alt="Clube de Leitura"></img>
      
          </div>
        

      

     
      </main>

      <Footer />
    </>
  );
}

export default PublicacoesCientificas;

