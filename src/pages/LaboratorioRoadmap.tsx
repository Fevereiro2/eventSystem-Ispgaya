import Breadcrumbs from '../components/ui/Breadcrumbs';
import Footer from '../components/layout/Footer';
import HeaderNav from '../components/layout/HeaderNav';
import TopBar from '../components/layout/TopBar';
import logo from '../assets/ispgaya-logo.svg';
import { container, mainContent } from '../styles/ui';

const contentBlocks = [
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

function LaboratorioRoadmap() {
  return (
    <>
      <TopBar />
      <HeaderNav />
      <Breadcrumbs
        title="Missão e Objetivos"
        description="O Laboratório Cultural é um espaço vivo onde a criatividade ganha forma e a cultura se torna experiência."
        parentLabel="Laboratorio Cultural"
        parentHref="/laboratorio-cultural"
        currentLabel="Missão e Objetivos"
        currentHref="/laboratorio-cultural/roadmap"
      />

      <main className={mainContent}>
        <section className="pb-20">
          <div className={`${container} mt-6 px-4 sm:px-6 xl:px-8`}>
            <div className="relative grid grid-cols-12 items-start gap-8">
              <div className="col-span-12 mt-8 grid grid-cols-2 gap-8 lg:col-span-8">
                {contentBlocks.map((item) => (
                  <div key={item.title} className="col-span-2 md:col-span-1">
                    <h2 className="mb-3 font-heading text-[2rem] font-bold leading-tight decoration-2 underline-offset-3">
                      {item.title}
                    </h2>

                    {'text' in item ? (
                      <p className="text-[1.12rem] leading-9 text-slate-700">{item.text}</p>
                    ) : (
                      <div className="space-y-4">
                        {item.items.map((objective) => (
                          <div key={objective} className="flex items-start gap-4">
                            <span className="mt-3 h-2.5 w-2.5 shrink-0 rounded-full bg-[#dd8609]" />
                            <p className="text-[1.08rem] leading-8 text-slate-700">{objective}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="col-span-4 hidden lg:block">
                <div className="sticky top-40 mx-auto mt-6 flex h-96 w-96 items-center justify-center rounded-[1.75rem] border border-slate-100 bg-slate-50 p-10 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
                  <div className="text-center">
                    <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-slate-200 bg-white">
                      <img src={logo} alt="ISPGAYA" className="h-14 w-auto" />
                    </div>
                    <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Laboratório Cultural
                    </p>
                    <p className="mt-4 text-base leading-8 text-slate-600">
                      Um espaço para descobrir, participar e dar continuidade às experiências culturais da comunidade académica.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default LaboratorioRoadmap;
