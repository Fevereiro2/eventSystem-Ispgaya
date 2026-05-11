import Breadcrumbs from '../components/ui/Breadcrumbs';
import Footer from '../components/layout/Footer';
import HeaderNav from '../components/layout/HeaderNav';
import TopBar from '../components/layout/TopBar';
import {
  blockText,
  blockTitle,
  container,
  mainContent,
  sectionSpace,
} from '../styles/ui';


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
          
            <img className="mt-8 mb-8 mx-auto w-full max-w-5xl aspect-[3/1] object-cover shadow-xl rounded-sm" src="/src/assets/img/clube_leitura_ispgaya.jpg " alt="Clube de Leitura"></img>
    
            <p className={`${blockText} mb-8`}>
            Se gostas de ler, refletir e conversar sobre livros num ambiente descontraído, este é o teu lugar.
            </p>


            <div className="mb-8 max-w-3xl flex flex-col md:flex-row items-center gap-4">
              <button type="button" className="rounded-md bg-[#dd8609] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90">Inscrever-me neste clube</button>
              <p className="text-sm text-slate-600">O pedido sera enviado para validacao da equipa do clube.</p>
            </div>
          </div>  
  
      </main>

      <Footer />
    </>
  );
}

export default PublicacoesCientificas;
