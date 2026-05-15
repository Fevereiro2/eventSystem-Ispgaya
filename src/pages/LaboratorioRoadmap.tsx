import Breadcrumbs from '../components/ui/Breadcrumbs';
import Footer from '../components/layout/Footer';
import HeaderNav from '../components/layout/HeaderNav';
import TopBar from '../components/layout/TopBar';
import { getLocaleText, useLocale } from '../i18n/locale.js';
import { blockText, blockTitle, container, contentCard, contentSection, mainContent } from '../styles/ui';

function LaboratorioRoadmap() {
  const { locale } = useLocale();
  const contentBlocks =
    locale === 'en'
      ? [
          {
            title: 'Mission',
            text: 'Promote culture within the academic community, encouraging participation, creativity and the sharing of experiences.'
          },
          {
            title: 'Goals',
            items: [
              'Encourage participation in cultural activities',
              'Promote cultural events and initiatives',
              'Stimulate creativity and critical thinking',
              'Bring students closer to culture inside and outside the institution'
            ]
          }
        ]
      : [
          {
            title: 'Missão',
            text: 'Promover a cultura na comunidade académica, incentivando a participação, a criatividade e a partilha de experiências.'
          },
          {
            title: 'Objetivos',
            items: [
              'Incentivar a participação em atividades culturais',
              'Divulgar eventos e iniciativas culturais',
              'Estimular a criatividade e o pensamento crítico',
              'Aproximar os estudantes da cultura dentro e fora da instituição'
            ]
          }
        ];

  return (
    <>
      <TopBar />
      <HeaderNav />
      <Breadcrumbs
        title={getLocaleText(locale, 'Missão e Objetivos', 'Mission and Goals')}
        description={getLocaleText(
          locale,
          'O Laboratório Cultural é um espaço vivo onde a criatividade ganha forma e a cultura se torna experiência.',
          'The Cultural Lab is a living space where creativity takes shape and culture becomes an experience.'
        )}
        parentLabel={getLocaleText(locale, 'Laboratorio Cultural', 'Cultural Lab')}
        parentHref="/laboratorio-cultural"
        currentLabel={getLocaleText(locale, 'Missão e Objetivos', 'Mission and Goals')}
        currentHref="/laboratorio-cultural/roadmap"
      />

      <main className={mainContent}>
        <section className={contentSection}>
          <div className={`${container} px-4 sm:px-6 xl:px-8`}>
            <div className="mx-auto max-w-4xl">
              <article className={contentCard}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#dd8609]">
                  Laboratório Cultural
                </p>
                <h2 className={`${blockTitle} mt-4`}>{getLocaleText(locale, 'Missão e Objetivos', 'Mission and Goals')}</h2>
                <p className={blockText}>
                  {getLocaleText(
                    locale,
                    'O Laboratório Cultural é um espaço vivo onde a criatividade ganha forma e a cultura se torna experiência.',
                    'The Cultural Lab is a living space where creativity takes shape and culture becomes an experience.'
                  )}
                </p>

                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {contentBlocks.map((item) => (
                    <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <h3 className="font-heading text-2xl font-semibold text-slate-900">
                        {item.title}
                      </h3>

                      {'text' in item ? (
                        <p className="mt-3 text-sm leading-7 text-slate-700">{item.text}</p>
                      ) : (
                        <div className="mt-4 space-y-3">
                          {item.items.map((objective) => (
                            <div key={objective} className="flex items-start gap-3">
                              <span className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#dd8609]" />
                              <p className="text-sm leading-7 text-slate-700">{objective}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="/laboratorio-cultural"
                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-[#dd8609] hover:text-[#dd8609]"
                  >
                    {getLocaleText(locale, 'Voltar ao laboratório', 'Back to lab')}
                  </a>
                  <a
                    href="/laboratorio-cultural"
                    className="rounded-md bg-[#dd8609] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    {getLocaleText(locale, 'Explorar laboratório', 'Explore lab')}
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default LaboratorioRoadmap;
