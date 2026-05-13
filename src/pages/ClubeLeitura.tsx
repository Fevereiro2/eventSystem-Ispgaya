import { useEffect, useState } from 'react';

import { fetchPublicBooks, InfoCulturaBook } from '../api/infoculturaApi.js';
import BestBooksSection from '../components/sections/BestBooksSection.js';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Footer from '../components/layout/Footer';
import HeaderNav from '../components/layout/HeaderNav';
import TopBar from '../components/layout/TopBar';
import heroImage from '../assets/img/clube_leitura_ispgaya.jpg';
import { adminBtnPrimary, blockText, blockTitle, container, mainContent, sectionSpace } from '../styles/ui';
import { getLocaleText, useLocale } from '../i18n/locale.js';

function ClubeLeitura() {
  const { locale } = useLocale();
  const [books, setBooks] = useState<InfoCulturaBook[]>([]);

  useEffect(() => {
    let active = true;

    async function loadBooks() {
      try {
        const nextBooks = await fetchPublicBooks();
        if (!active) return;
        setBooks(nextBooks);
      } catch {
        if (!active) return;
        setBooks([]);
      }
    }

    void loadBooks();

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <TopBar />
      <HeaderNav />
      <Breadcrumbs
        title={getLocaleText(locale, 'Clube de Leitura', 'Reading Club')}
        description={getLocaleText(
          locale,
          'Bem-vindo ao Clube de Leitura da ISPGAYA! Um espaço dedicado aos amantes de livros e histórias.',
          'Welcome to the ISPGAYA Reading Club! A space dedicated to books and stories.'
        )}
        currentLabel={getLocaleText(locale, 'Clube de Leitura', 'Reading Club')}
        currentHref="/laboratorio-cultural/clube-leitura"
      />

      <main className={mainContent}>
        <div className={`${container} ${sectionSpace}`}>
          <h2 className={blockTitle}>{getLocaleText(locale, 'Aqui podes:', 'Here you can:')}</h2>
          <p className={blockText}>
            {getLocaleText(
              locale,
              'Descobrir novas obras literárias, participar em sessões de leitura, trocar recomendações com outros clubistas, aprofundar a tua paixão pela literatura. Junta-te a uma comunidade vibrante onde cada livro é uma porta para novos mundos e ideias.',
              'Discover new literary works, join reading sessions, exchange recommendations with other members, and deepen your passion for literature. Join a vibrant community where each book opens the door to new worlds and ideas.'
            )}
          </p>

          <img
            className="mx-auto mb-8 mt-8 aspect-[3/1] w-full max-w-5xl rounded-sm object-cover shadow-xl"
            src={heroImage}
            alt={getLocaleText(locale, 'Clube de Leitura', 'Reading Club')}
          />

          <p className={`${blockText} mb-8`}>
            {getLocaleText(
              locale,
              'Se gostas de ler, refletir e conversar sobre livros num ambiente descontraído, este é o teu lugar.',
              'If you like reading, reflecting and talking about books in a relaxed environment, this is your place.'
            )}
          </p>

          <div className="mb-8 flex max-w-3xl flex-col items-center gap-4 md:flex-row">
            <button type="button" className={adminBtnPrimary}>
              {getLocaleText(locale, 'Inscrever-me neste clube', 'Join this club')}
            </button>
            <p className="text-sm text-slate-600">
              {getLocaleText(
                locale,
                'O pedido sera enviado para validacao da equipa do clube.',
                'The request will be sent to the club team for validation.'
              )}
            </p>
          </div>

          <BestBooksSection
            books={books}
            locale={locale}
            title={getLocaleText(locale, 'Melhores livros', 'Best books')}
            description={getLocaleText(
              locale,
              'Livros selecionados para inspirar as próximas leituras do clube.',
              'Books selected to inspire the club’s next readings.'
            )}
            viewAllHref="/laboratorio-cultural"
            viewAllLabel={getLocaleText(locale, 'Explorar o laboratório', 'Explore the lab')}
            detailBaseHref="/laboratorio-cultural/livros"
            limit={4}
          />
        </div>
      </main>

      <Footer />
    </>
  );
}

export default ClubeLeitura;
