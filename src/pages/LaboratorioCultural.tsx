import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import Footer from '../components/Footer';
import HeaderNav from '../components/HeaderNav';
import TopBar from '../components/TopBar';
import { fetchPublicClubs, InfoCulturaClub, resolveInfoCulturaAssetUrl } from '../data/infoculturaApi';
import {
  container,
  contentEmpty,
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

function normalizeLabel(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getClubHref(club: InfoCulturaClub): string {
  const label = normalizeLabel(club.name);

  if (label.includes('tuna')) {
    return '/laboratorio-cultural/tuna';
  }

  if (label.includes('leitura')) {
    return '/laboratorio-cultural/clube-leitura';
  }

  if (label.includes('teatro')) {
    return '/laboratorio-cultural/teatro';
  }

  return `/laboratorio-cultural/clubes/${club.id}`;
}

function LaboratorioCultural() {
  const [clubs, setClubs] = useState<InfoCulturaClub[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadClubs() {
      try {
        const nextClubs = await fetchPublicClubs();
        if (!active) return;
        setClubs(nextClubs);
      } catch (error) {
        if (!active) return;
        const message =
          error instanceof Error ? error.message : 'Nao foi possivel carregar os clubes.';
        setLoadError(message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadClubs();

    return () => {
      active = false;
    };
  }, []);

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
              <article className={labResearchHeroCard}>
                <h2 className={labResearchHeroTitle}>InfoCultura</h2>
                <p className={labResearchHeroText}>
                  A plataforma de gestao cultural agrega publicacoes, agenda e comunicacao das
                  iniciativas do Laboratorio Cultural.
                </p>
                <Link to="/infocultura" className={labResearchLink}>
                  Ver mais
                </Link>
              </article>

              {isLoading ? <p className={contentEmpty}>A carregar clubes...</p> : null}
              {!isLoading && loadError ? <p className={contentEmpty}>{loadError}</p> : null}
              {!isLoading && !loadError && clubs.length === 0 ? (
                <p className={contentEmpty}>Ainda nao existem clubes ativos para mostrar.</p>
              ) : null}

              {!isLoading && !loadError
                ? clubs.map((club) => (
                    <article key={club.id} className={labResearchSubcard}>
                      {club.image ? (
                        <img
                          src={resolveInfoCulturaAssetUrl(club.image)}
                          alt={club.name}
                          className="mb-4 h-40 w-full rounded-xl object-cover"
                        />
                      ) : null}
                      <h3 className={labResearchSubtitle}>{club.name}</h3>
                      <p className={labResearchSubtext}>
                        {club.mission || club.description || 'Clube cultural disponivel no laboratorio.'}
                      </p>
                      <Link to={getClubHref(club)} className={labResearchLink}>
                        Ver mais
                      </Link>
                    </article>
                  ))
                : null}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default LaboratorioCultural;
