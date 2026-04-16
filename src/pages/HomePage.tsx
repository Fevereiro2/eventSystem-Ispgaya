import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import HeaderNav from '../components/HeaderNav';
import TopBar from '../components/TopBar';
import heroWelcomeImage from '../assets/backgroundphotos/bem-vindos-estudantes-ispgaya.webp';
import heroStudyImage from '../assets/backgroundphotos/estudar-no-ispagaya.webp';
import heroEmployabilityImage from '../assets/backgroundphotos/empregabilidade-ispgaya.webp';
import gaiaSkyline from '../assets/gaia-skyline.webp';
import helix from '../assets/homepage/destaques/helix-ispgaya-site.webp';
import internacionalStudents from '../assets/homepage/destaques/2.webp';
import mais23 from '../assets/homepage/destaques/3.webp';
import { container, mainContent } from '../styles/ui';

type HeroSlide = {
  title: string;
  text: string;
  image: string;
};

type HighlightCard = {
  title: string;
  text: string;
  href: string;
  image: string;
};

type SupportSlide = {
  title: string;
  text: string;
  href: string;
  image: string;
};

type TestimonialSlide = {
  quote: string;
  name: string;
  role: string;
  image: string;
};

const studyLinks = [
  { label: 'CTeSP', href: 'https://ispgaya.pt/pt/ensino/oferta-formativa/ctesp' },
  { label: 'Licenciaturas', href: 'https://ispgaya.pt/pt/ensino/oferta-formativa/licenciaturas' },
  { label: 'Mestrados', href: 'https://ispgaya.pt/pt/ensino/oferta-formativa/mestrados' },
  {
    label: 'Pós-Graduações',
    href: 'https://ispgaya.pt/pt/ensino/programas-avancados/pos-graduacoes'
  }
];

const heroSlides: HeroSlide[] = [
  {
    title: 'Bem-vindo ao Instituto Superior Politécnico Gaya',
    text:
      'Aqui, é onde o teu futuro começa!\nNo ISPGAYA vais adquirir novos conhecimentos, desenvolver novas competências e experienciar um clima académico único.',
    image: heroWelcomeImage
  },
  {
    title: 'Dinamiza as tuas capacidades connosco',
    text:
      'Temos à tua disposição instalações modernas, estreita proximidade entre o corpo docente e os estudantes, assim como, um excelente ambiente académico.',
    image: heroStudyImage
  },
  {
    title: 'O mercado de trabalho espera por ti',
    text:
      'Temos como objetivo dar-te as ferramentas necessárias para criar uma carreira com significado e tomares as melhores decisões para a tua vida profissional e pessoal.',
    image: heroEmployabilityImage
  }
];

const highlightCards: HighlightCard[] = [
  {
    title: 'O ISPGAYA integra a AMBA e BGA',
    text: 'ISPGAYA tem o orgulho de anunciar a sua filiação oficial na Association of MBAs (AMBA) e na Business Graduates Association (BGA).',
    href: 'https://ispgaya.pt/pt/vida-academica/noticias/o-ispgaya-integra-a-amba-e-bga',
    image: internacionalStudents
  },
  {
    title: 'Regime M23 - Candidaturas Abertas!',
    text: 'Estão abertas as candidaturas ao Regime M23!',
    href: 'https://ispgaya.pt/pt/ensino/candidaturas/licenciaturas/m-23',
    image: mais23
  },
  {
    title: 'O ISPGAYA junta-se à Q-Helix Alliance!',
    text:
      'É com grande satisfação que anunciamos que o ISPGAYA – Instituto Superior Politécnico de Gaia passou a integrar oficialmente a Q-Helix Alliance, uma rede europeia em crescimento dedicada ao reforço da cooperação no ensino superior, investigação e inovação.',
    href: 'https://ispgaya.pt/pt/vida-academica/noticias/o-ispgaya-junta-se-a-q-helix-alliance',
    image: helix
  }
];

const metrics = [
  {
    value: '36',
    title: 'Experiência',
    text:
      'Desde 1990 a formar futuros empreendedores. Somos uma instituição de ensino de referência há mais de 30 anos em Vila Nova de Gaia. Quer pela qualidade dos seus cursos, quer pelo corpo docente qualificado, quer pelo clima académico estimulante e diferenciador.'
  },
  {
    value: '+3.5k',
    title: 'Profissionais Formados',
    text:
      'A formação continua a ser um dos nossos principais pilares. Somos reconhecidos pela formação de excelência e já formamos mais de 3500 profissionais de sucesso. Aqui os estudantes têm oportunidade de construir o seu futuro pessoal e profissional.'
  },
  {
    value: '+200',
    title: 'Empresas',
    text:
      'Trabalhamos em proximidade com as empresas, estando atentos às suas necessidades e a par das suas aspirações. Temos protocolos celebrados com mais de 200 empresas que garantem a qualidade dos estágios e permitem a integração de estudantes no mercado de trabalho.'
  }
];

const supportSlides: SupportSlide[] = [
  {
    title: 'Quero Candidatar-me',
    text: 'Sabias que podes realizar a tua candidatura online? Começa aqui a candidatura a um dos nossos cursos.',
    href: 'https://inforestudante.ispgaya.pt/nonio/security/preRegisto.do?origem=CANDIDATURAS',
    image: heroWelcomeImage
  },
  {
    title: 'Bolsas e Apoios',
    text: 'Fica a saber como funcionam as bolsas de estudo e os apoios disponíveis para candidatos.',
    href: 'https://ispgaya.pt/pt/ensino/bolsas-e-financiamento',
    image: heroStudyImage
  },
  {
    title: 'Acesso ao Ensino Superior',
    text: 'Existem várias formas de ingressar no ISPGAYA. Aqui tens um ponto de entrada simples para perceber tudo.',
    href: 'https://ispgaya.pt/pt/ensino/candidaturas',
    image: heroEmployabilityImage
  }
];

const testimonialSlides: TestimonialSlide[] = [
  {
    quote:
      'De forma a consolidar os conhecimentos na área da segurança de informação e cibersegurança, optei pelo mestrado do ISPGAYA pela diversidade de oportunidades e pela transversalidade das competências adquiridas.',
    name: 'Manuel Oliveira',
    role: 'Estudante Mestrado',
    image: heroEmployabilityImage
  },
  {
    quote:
      'Escolhi o ISPGAYA por recomendação de outros alunos. Professores e colaboradores acompanharam-me de forma próxima e deixaram um contributo real para a minha realização pessoal e profissional.',
    name: 'Maribel Carvalho',
    role: 'Estudante ISPGAYA',
    image: heroWelcomeImage
  }
];

function HomePage() {
  const [activeHero, setActiveHero] = useState(0);
  const [activeSupport, setActiveSupport] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isHeaderSolid, setIsHeaderSolid] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveHero((current) => (current + 1) % heroSlides.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setIsHeaderSolid(window.scrollY > 40);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentHero = heroSlides[activeHero];
  const showStudyLinks = activeHero === 0;

  return (
    <>
      <main className={mainContent}>
        <section className="relative h-screen overflow-hidden bg-[#10263b]">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="flex h-full w-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${activeHero * 100}%)` }}
            >
              {heroSlides.map((slide, index) => (
                <img
                  key={slide.title}
                  src={slide.image}
                  alt={slide.title}
                  className="h-full w-full shrink-0 object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                />
              ))}
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.15))]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,30,44,0.78)_0%,rgba(18,30,44,0.55)_45%,rgba(18,30,44,0.25)_100%)]" />
          </div>

          <div
            className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
              isHeaderSolid ? 'bg-white' : 'bg-transparent'
            }`}
          >
            <TopBar transparent={!isHeaderSolid} />
            <HeaderNav transparent={!isHeaderSolid} />
          </div>

          <div className={`relative z-10 h-full ${container}`}>
            <div className="absolute inset-x-0 bottom-[12vh]">
              <div className="grid grid-cols-12 gap-y-8 text-white">
                <div className="col-span-12 lg:col-span-6 xl:col-span-7">
                  <h1 className="font-heading text-3xl font-bold leading-snug sm:text-5xl sm:leading-snug lg:text-4xl lg:leading-snug xl:pr-[8vw] xl:text-5xl xl:leading-snug 2xl:pr-[5vw] 2xl:text-6xl">
                    {currentHero.title}
                  </h1>
                  <p className="mt-5 hidden max-w-2xl whitespace-pre-line text-lg font-medium xl:block">
                    {currentHero.text}
                  </p>
                </div>

                <div className="col-span-12 lg:col-span-6 xl:col-span-5">
                  <div
                    className={showStudyLinks ? '' : 'invisible pointer-events-none select-none'}
                    aria-hidden={!showStudyLinks}
                  >
                    <p className="font-medium">Fica a conhecer a nossa oferta formativa:</p>
                    <ul className="mt-1 divide-y-2 divide-white">
                      {studyLinks.map((item) => (
                        <li key={item.label}>
                          <a
                            href={item.href}
                            className="group flex items-center justify-between px-1.5 py-2 text-lg font-bold xl:px-4 xl:py-3 xl:text-xl 2xl:text-2xl"
                          >
                            <span className="transition-opacity group-hover:opacity-80">{item.label}</span>
                            <span className="-translate-x-4 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                              &#10230;
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    className={`mt-5 lg:mt-6 xl:text-right ${
                      showStudyLinks ? '' : 'invisible pointer-events-none select-none'
                    }`}
                    aria-hidden={!showStudyLinks}
                  >
                    <a
                      href="#content-start"
                      className="inline-flex items-center justify-end opacity-70 transition-opacity hover:opacity-100"
                    >
                      <span className="text-sm font-bold uppercase tracking-tight">Descobre Mais</span>
                      <span className="ml-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white transition hover:scale-110 hover:border-dashed">
                        <ChevronRight className="h-5 w-5 rotate-90" />
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-[5vh]">
              <div className="swiper-pagination slider-bullet-clickable swiper-pagination-horizontal flex items-center space-x-5">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.title}
                    type="button"
                    onClick={() => setActiveHero(index)}
                    className={`swiper-pagination-bullet flex h-7 w-7 items-center justify-center rounded-full border border-white transition-opacity ${
                      index === activeHero ? 'opacity-100' : 'opacity-60'
                    }`}
                  >
                    <span className="sr-only">Slide {index + 1}</span>
                    <span className="h-3 w-3 rounded-full bg-white" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="content-start" className="scroll-mt-36 bg-white pt-10 lg:pt-12 xl:pt-16 2xl:pt-20">
          <div className={`${container} text-center`}>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-black xl:text-4xl 2xl:text-5xl">
              Destaques
            </h2>
          </div>

          <div className={`${container} mt-10 flex snap-x gap-2 overflow-x-auto py-2 md:justify-center md:gap-6`}>
            {highlightCards.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="group relative flex min-h-[500px] basis-[90vw] snap-center flex-col overflow-hidden rounded bg-gray-200 md:basis-6/12 lg:basis-4/12 2xl:basis-3/12"
              >
                <div className="absolute inset-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
                </div>
                <div className="relative z-10 mt-auto px-6 pb-6 pt-6 text-white">
                  <p className="font-heading text-2xl underline-offset-2 group-hover:underline">
                    {item.title}
                  </p>
                  <div className="overflow-hidden transition-[max-height] duration-500 ease-in-out max-h-0 group-hover:max-h-40">
                    <p className="mt-4 font-medium">{item.text}</p>
                  </div>
                </div>
                <div className="relative z-10 flex items-center px-6 py-6 text-white">
                  <ChevronRight className="h-7 w-7" />
                  <p className="ml-3 font-medium">Fica a saber mais</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="relative mt-20 bg-gray-50 py-16 before:absolute before:-top-5 before:h-14 before:w-full before:-skew-y-1 before:bg-gray-50 after:absolute after:-bottom-5 after:h-14 after:w-full after:-skew-y-1 after:bg-gray-50 lg:mt-24 xl:mt-28">
          <div className={`${container} grid grid-cols-2 gap-y-10 lg:gap-x-4 xl:gap-x-6 2xl:gap-x-8`}>
            <div className="relative col-span-1 hidden lg:block">
              <div className="sticky top-36">
                <img
                  src={gaiaSkyline}
                  alt="Onde o Futuro Te Leva"
                  className="relative z-10 mx-auto block shadow-2xl lg:w-10/12 xl:w-auto"
                />
              </div>
            </div>

            <div className="col-span-2 mx-auto max-w-xl space-y-10 lg:col-span-1 lg:mx-0 lg:max-w-none xl:space-y-14">
              <div className="text-center lg:text-left">
                <h2 className="font-heading text-3xl font-bold tracking-tight text-black xl:text-4xl 2xl:text-5xl">
                  Onde o Futuro Te Leva
                </h2>
              </div>

              {metrics.map((item, index) => (
                <div key={item.title} className="flex">
                  {index % 2 === 1 ? (
                    <>
                      <div className="mr-4 border-b-2 border-l-2 border-gray-300 pb-6 pl-6 pr-2 pt-2">
                        <p className="text-lg font-bold xl:text-2xl">{item.title}</p>
                        <p className="mt-3 max-w-md text-sm sm:text-base">{item.text}</p>
                      </div>
                      <div>
                        <p className="mt-2 font-heading text-3xl font-bold text-orange-400 sm:text-4xl lg:text-5xl xl:text-6xl">
                          {item.value}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="mt-2 font-heading text-3xl font-bold text-orange-400 sm:text-4xl lg:text-5xl xl:text-6xl">
                          {item.value}
                        </p>
                      </div>
                      <div className="ml-2 border-b-2 border-r-2 border-gray-300 pb-2 pl-2 pr-2 pt-2 sm:ml-4 sm:pb-6 sm:pl-6">
                        <p className="text-lg font-bold xl:text-2xl">{item.title}</p>
                        <p className="mt-3 max-w-md text-sm sm:text-base">{item.text}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative mt-16 overflow-hidden lg:mt-28 xl:mt-32 2xl:mt-32">
          <div className={`${container} grid grid-cols-2 gap-x-10 bg-white`}>
            <div className="relative z-10 col-span-2 bg-white py-6 lg:col-span-1">
              <h2 className="max-w-2xl font-heading text-3xl font-bold tracking-tight text-black xl:text-4xl 2xl:text-5xl">
                Ainda queres saber mais? Nós podemos ajudar-te.
              </h2>
              <p className="mt-4">
                A candidatura ao ensino superior é um passo muito importante. O ISPGAYA dispõe da
                modalidade de acesso ideal para ti, quer tenhas terminado o ensino secundário ou já
                estejas a trabalhar e queiras aperfeiçoar os teus conhecimentos.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row sm:items-center">
                <a
                  href="https://inforestudante.ispgaya.pt/nonio/security/preRegisto.do?origem=CANDIDATURAS"
                  className="inline-block bg-orange-400 px-6 py-2 text-center font-bold text-white transition hover:bg-orange-500"
                >
                  Candidatar-me
                </a>
                <a
                  href="https://ispgaya.pt/pt/ensino/candidaturas"
                  className="mt-3 inline-block border-2 border-orange-700 px-6 py-2 text-center font-bold text-orange-700 transition hover:border-orange-600 hover:bg-orange-600 hover:text-white sm:ml-6 sm:mt-0"
                >
                  Quero saber mais
                </a>
              </div>
            </div>

            <div className="col-span-2 min-w-0 bg-white lg:col-span-1">
              <div className="xl:max-w-2xl">
                <div className="flex items-center py-4">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveSupport((current) =>
                        current === 0 ? supportSlides.length - 1 : current - 1
                      )
                    }
                    className="p-2 text-gray-700 transition hover:text-gray-600"
                  >
                    <ChevronLeft className="h-7 w-7" />
                  </button>

                  <div className="mx-2 flex items-center space-x-3">
                    {supportSlides.map((item, index) => (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => setActiveSupport(index)}
                        className={`h-2.5 w-2.5 rounded-full ${
                          index === activeSupport ? 'bg-orange-400' : 'bg-gray-300'
                        }`}
                      >
                        <span className="sr-only">Slide {index + 1}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveSupport((current) => (current + 1) % supportSlides.length)}
                    className="p-2 text-gray-700 transition hover:text-gray-600"
                  >
                    <ChevronRight className="h-7 w-7" />
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {supportSlides.map((item, index) => (
                    <a
                      key={item.title}
                      href={item.href}
                      className={`border px-6 py-8 text-center transition ${
                        index === activeSupport
                          ? 'border-orange-200 bg-orange-100'
                          : 'border-orange-50 bg-orange-50 hover:border-orange-200 hover:bg-orange-100'
                      }`}
                    >
                      <div className="mx-auto h-40 w-40">
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                      </div>
                      <p className="mt-3 text-lg font-bold">{item.title}</p>
                      <p className="mt-2">{item.text}</p>
                      <span className="mt-6 inline-block border-2 border-orange-700 px-5 py-1.5 text-sm font-semibold text-orange-700 transition hover:border-orange-600 hover:bg-orange-600 hover:text-white">
                        Ver mais
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 mt-8 bg-white md:mb-8 md:mt-10 lg:mb-10 lg:mt-12 xl:mb-16 xl:mt-16">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-black xl:text-4xl 2xl:text-5xl">
              Testemunhos
            </h2>
          </div>

          <div className={`${container} mx-auto w-full overflow-hidden lg:max-w-2xl`}>
            <div className="w-full pb-2 pt-6 md:pb-4 md:pt-8 lg:pb-4 lg:pt-10 xl:pb-6 xl:pt-12">
              <div className="relative">
                <div className="absolute -top-4 text-orange-400 opacity-20 sm:-left-1 sm:-top-5">
                  <svg className="h-20 w-20 sm:h-28 sm:w-28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23 5.655c-3.008 1.475-4.511 3.208-4.511 5.2 1.282.148 2.342.67 3.18 1.567.838.897 1.257 1.936 1.257 3.116 0 1.254-.407 2.311-1.22 3.171-.814.86-1.837 1.291-3.069 1.291-1.38 0-2.576-.559-3.587-1.678-1.011-1.119-1.516-2.477-1.516-4.075 0-4.794 2.687-8.543 8.061-11.247L23 5.655zm-13.534 0c-3.032 1.475-4.548 3.208-4.548 5.2 1.307.148 2.379.67 3.217 1.567.838.897 1.257 1.936 1.257 3.116 0 1.254-.413 2.311-1.239 3.171C7.327 19.569 6.298 20 5.065 20c-1.38 0-2.57-.559-3.568-1.678-.998-1.119-1.498-2.477-1.498-4.075C-.001 9.453 2.674 5.704 8.023 3l1.442 2.655z" />
                  </svg>
                </div>
                <blockquote className="text-center text-lg sm:text-lg">
                  {testimonialSlides[activeTestimonial].quote}
                </blockquote>
              </div>

              <div className="mt-7 flex items-center justify-center">
                <img
                  src={testimonialSlides[activeTestimonial].image}
                  alt={testimonialSlides[activeTestimonial].name}
                  className="block h-16 w-16 shrink-0 rounded-full border-2 border-white object-cover shadow"
                />

                <div className="ml-5 font-medium">
                  <p className="text-xl">{testimonialSlides[activeTestimonial].name}</p>
                  <p className="text-base text-gray-500">{testimonialSlides[activeTestimonial].role}</p>
                </div>
              </div>
            </div>

            <div className="flex w-full items-center justify-center">
              <button
                type="button"
                onClick={() =>
                  setActiveTestimonial((current) =>
                    current === 0 ? testimonialSlides.length - 1 : current - 1
                  )
                }
                className="p-2 text-gray-700 transition hover:text-gray-600"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveTestimonial((current) => (current + 1) % testimonialSlides.length)
                }
                className="p-2 text-gray-700 transition hover:text-gray-600"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default HomePage;
