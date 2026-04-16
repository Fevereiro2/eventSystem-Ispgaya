import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import HeaderNav from '../components/HeaderNav';
import TopBar from '../components/TopBar';
import heroWelcomeImage from '../assets/backgroundphotos/bem-vindos-estudantes-ispgaya.webp';
import heroStudyImage from '../assets/backgroundphotos/estudar-no-ispagaya.webp';
import heroEmployabilityImage from '../assets/backgroundphotos/empregabilidade-ispgaya.webp';
import gaiaSkyline from '../assets/gaia-skyline.webp';
import {
  fetchPublicEvents,
  fetchPublicNews,
  InfoCulturaEvent,
  InfoCulturaNews,
  resolveInfoCulturaAssetUrl
} from '../data/infoculturaApi';
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
  internal?: boolean;
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
      'Aqui, é onde o teu futuro começa. No ISPGAYA vais adquirir novos conhecimentos, desenvolver novas competências e experienciar um clima académico único.',
    image: heroWelcomeImage
  },
  {
    title: 'Dinamiza as tuas capacidades connosco',
    text:
      'Temos à tua disposição instalações modernas, proximidade entre docentes e estudantes e um ambiente académico diferenciador.',
    image: heroStudyImage
  },
  {
    title: 'O mercado de trabalho espera por ti',
    text:
      'Temos como objetivo dar-te as ferramentas necessárias para construíres uma carreira com significado e tomares as melhores decisões para o teu futuro.',
    image: heroEmployabilityImage
  }
];

const highlightCards: HighlightCard[] = [
  {
    title: 'Laboratório Cultural',
    text:
      'Projeto cultural aberto a quem quer participar em atividades nas áreas da música, teatro e leitura.',
    href: '/laboratorio-cultural',
    image: heroWelcomeImage,
    internal: true
  },
  {
    title: 'Estudantes Internacionais',
    text: 'Área preparada para candidaturas e campanhas dirigidas a estudantes internacionais.',
    href: 'https://international.ispgaya.pt/pt',
    image: heroStudyImage
  },
  {
    title: 'Candidaturas Abertas',
    text:
      'Espaço pensado para destacar acesso ao ensino superior, prazos e modalidades de candidatura.',
    href: 'https://ispgaya.pt/pt/ensino/candidaturas',
    image: heroEmployabilityImage
  }
];

const metrics = [
  {
    value: '36',
    title: 'Experiência',
    text:
      'Desde 1990 a formar futuros empreendedores. Somos uma instituição de ensino de referência em Vila Nova de Gaia.'
  },
  {
    value: '+3.5k',
    title: 'Profissionais Formados',
    text:
      'Já formámos mais de 3500 profissionais. Aqui os estudantes têm oportunidade de construir o seu futuro pessoal e profissional.'
  },
  {
    value: '+200',
    title: 'Empresas',
    text:
      'Temos protocolos com mais de 200 empresas que ajudam a garantir estágios de qualidade e aproximação ao mercado.'
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

function formatDate(value?: string | null): string {
  if (!value) return 'Data por definir';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}...`;
}

function getNewsHref(item: InfoCulturaNews): string {
  return `/laboratorio-cultural/noticias/${item.id}`;
}

function getEventHref(item: InfoCulturaEvent): string {
  return `/laboratorio-cultural/eventos/${item.id}`;
}

function getNewsTag(item: InfoCulturaNews): string {
  return item.club_name ? `#${item.club_name.toLowerCase().replace(/\s+/g, '')}` : '#noticias';
}

function getEventTag(item: InfoCulturaEvent): string {
  if (item.city) return `#${item.city.toLowerCase().replace(/\s+/g, '')}`;
  if (item.club_name) return `#${item.club_name.toLowerCase().replace(/\s+/g, '')}`;
  return '#eventos';
}

function HomePage() {
  const [activeHero, setActiveHero] = useState(0);
  const [activeSupport, setActiveSupport] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [newsItems, setNewsItems] = useState<InfoCulturaNews[]>([]);
  const [events, setEvents] = useState<InfoCulturaEvent[]>([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveHero((current) => (current + 1) % heroSlides.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [nextNews, nextEvents] = await Promise.all([fetchPublicNews(), fetchPublicEvents()]);
        if (!active) return;
        setNewsItems(nextNews);
        setEvents(nextEvents);
      } catch (error) {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar a homepage.');
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  const currentHero = heroSlides[activeHero];

  const newsList = useMemo<InfoCulturaNews[]>(
    () =>
      newsItems.length > 0
        ? newsItems.slice(0, 3)
        : [
            {
              id: 0,
              title: 'Espaço preparado para notícia institucional',
              summary: 'Estrutura pronta para data, título, resumo e hashtag.',
              image: '',
              content: '',
              published_at: null,
              created_at: '',
              updated_at: '',
              news_status_id: 0,
              news_status_name: 'published',
              club_id: 0,
              club_name: ''
            },
            {
              id: 1,
              title: 'Segundo destaque noticioso',
              summary: 'Grelha editorial preparada para o bloco de notícias.',
              image: '',
              content: '',
              published_at: null,
              created_at: '',
              updated_at: '',
              news_status_id: 0,
              news_status_name: 'published',
              club_id: 0,
              club_name: ''
            },
            {
              id: 2,
              title: 'Terceiro destaque da homepage',
              summary: 'Área pronta para notícia real ou campanha institucional.',
              image: '',
              content: '',
              published_at: null,
              created_at: '',
              updated_at: '',
              news_status_id: 0,
              news_status_name: 'published',
              club_id: 0,
              club_name: ''
            }
          ],
    [newsItems]
  );

  const eventList = useMemo<InfoCulturaEvent[]>(
    () =>
      events.length > 0
        ? events.slice(0, 3)
        : [
            {
              id: 0,
              title: 'Espaço preparado para evento institucional',
              description: 'Área pronta para data, título, descrição e hashtag.',
              event_date: '',
              start_date: '',
              end_date: '',
              image: '',
              is_external: false,
              enable_registrations: false,
              registration_capacity: null,
              status: 'published',
              created_at: null,
              updated_at: null,
              city: '',
              location: '',
              user_id: 0,
              club_id: null,
              club_name: null,
              owner_name: null,
              categories: [],
              category_ids: [],
              confirmed_registrations: 0,
              waitlist_registrations: 0,
              remaining_slots: null,
              registration_state: 'closed',
              google_calendar_url: '',
              outlook_calendar_url: ''
            },
            {
              id: 1,
              title: 'Segundo evento em destaque',
              description: 'Secção pronta para a agenda pública da homepage.',
              event_date: '',
              start_date: '',
              end_date: '',
              image: '',
              is_external: false,
              enable_registrations: false,
              registration_capacity: null,
              status: 'published',
              created_at: null,
              updated_at: null,
              city: '',
              location: '',
              user_id: 0,
              club_id: null,
              club_name: null,
              owner_name: null,
              categories: [],
              category_ids: [],
              confirmed_registrations: 0,
              waitlist_registrations: 0,
              remaining_slots: null,
              registration_state: 'closed',
              google_calendar_url: '',
              outlook_calendar_url: ''
            },
            {
              id: 2,
              title: 'Terceiro evento da agenda',
              description: 'Bloco afinado para a estrutura editorial do portal principal.',
              event_date: '',
              start_date: '',
              end_date: '',
              image: '',
              is_external: false,
              enable_registrations: false,
              registration_capacity: null,
              status: 'published',
              created_at: null,
              updated_at: null,
              city: '',
              location: '',
              user_id: 0,
              club_id: null,
              club_name: null,
              owner_name: null,
              categories: [],
              category_ids: [],
              confirmed_registrations: 0,
              waitlist_registrations: 0,
              remaining_slots: null,
              registration_state: 'closed',
              google_calendar_url: '',
              outlook_calendar_url: ''
            }
          ],
    [events]
  );

  return (
    <>
      <main className={mainContent}>
        <section className="relative h-screen overflow-hidden bg-[#10263b]">
          <div className="absolute inset-0">
            <img
              src={currentHero.image}
              alt={currentHero.title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.15))]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,30,44,0.78)_0%,rgba(18,30,44,0.55)_45%,rgba(18,30,44,0.25)_100%)]" />
          </div>

          <div className="absolute inset-x-0 top-0 z-30">
            <TopBar transparent />
            <HeaderNav transparent />
          </div>

          <div className={`relative z-10 h-full ${container}`}>
            <div className="absolute inset-x-0 bottom-[12vh]">
              <div className="grid grid-cols-12 gap-y-8 text-white">
                <div className="col-span-12 lg:col-span-6 xl:col-span-7">
                  <h1 className="font-heading text-3xl font-bold leading-snug sm:text-5xl sm:leading-snug lg:text-4xl lg:leading-snug xl:pr-[8vw] xl:text-5xl xl:leading-snug 2xl:pr-[5vw] 2xl:text-6xl">
                    {currentHero.title}
                  </h1>
                  <p className="mt-5 hidden max-w-2xl text-lg font-medium xl:block">{currentHero.text}</p>
                </div>

                <div className="col-span-12 lg:col-span-6 xl:col-span-5">
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

                  <div className="mt-5 lg:mt-6 xl:text-right">
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
            {highlightCards.map((item) =>
              item.internal ? (
                <Link
                  key={item.title}
                  to={item.href}
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
                    <p className="mt-4 font-medium">{item.text}</p>
                  </div>
                  <div className="relative z-10 flex items-center px-6 py-6 text-white">
                    <ChevronRight className="h-7 w-7" />
                    <p className="ml-3 font-medium">Fica a saber mais</p>
                  </div>
                </Link>
              ) : (
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
                    <p className="mt-4 font-medium">{item.text}</p>
                  </div>
                  <div className="relative z-10 flex items-center px-6 py-6 text-white">
                    <ChevronRight className="h-7 w-7" />
                    <p className="ml-3 font-medium">Fica a saber mais</p>
                  </div>
                </a>
              )
            )}
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

        <section className="mt-14 bg-white lg:mt-16 xl:mt-20 2xl:mt-24">
          <div className={`${container} grid grid-cols-2 gap-y-10 lg:gap-x-8 xl:gap-x-10`}>
            <div className="col-span-2 lg:col-span-1">
              <div className="pl-3">
                <h2 className="font-heading text-3xl font-bold tracking-tight text-black xl:text-4xl 2xl:text-5xl">
                  Notícias
                </h2>
                <a
                  href="https://ispgaya.pt/pt/vida-academica/noticias"
                  className="ml-1 mt-1 flex items-center text-sm text-gray-500 hover:underline"
                >
                  <span>Ver tudo</span>
                  <ChevronRight className="ml-1 mt-1 h-4 w-4" />
                </a>
              </div>

              {loadError ? (
                <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {loadError}
                </p>
              ) : null}

              <div className="mt-2 sm:mt-4">
                {newsList.map((item) => (
                  <Link
                    key={item.id}
                    to={item.id > 0 ? getNewsHref(item) : '#'}
                    className="group relative block overflow-hidden border-b-2 border-gray-200 p-3.5"
                  >
                    <div className="absolute inset-0 z-20 hidden group-hover:block">
                      <img
                        className="pointer-events-none z-10 aspect-[16/9] w-full object-cover"
                        src={item.image ? resolveInfoCulturaAssetUrl(item.image) : heroWelcomeImage}
                        alt={item.title}
                      />
                      <span className="absolute inset-0 z-10 h-full w-full bg-black/70" />
                    </div>

                    <div className="relative z-30">
                      <time className="text-sm font-semibold uppercase text-orange-400">
                        {formatDate(item.published_at || item.created_at)}
                      </time>
                      <p className="mt-2 text-lg font-bold transition group-hover:text-white group-hover:underline xl:text-xl 2xl:text-2xl">
                        {item.title}
                      </p>
                      <p className="mt-1 line-clamp-2 transition group-hover:text-white">
                        {truncateText(item.summary || item.content || 'Sem resumo.', 180)}
                      </p>
                      <div className="mt-2 flex items-center space-x-3 text-sm text-gray-600 transition group-hover:text-white">
                        <span>{getNewsTag(item)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="col-span-2 lg:col-span-1">
              <div className="pl-3">
                <h2 className="font-heading text-3xl font-bold tracking-tight text-black xl:text-4xl 2xl:text-5xl">
                  Eventos
                </h2>
                <a
                  href="https://ispgaya.pt/pt/vida-academica/eventos"
                  className="ml-1 mt-1 flex items-center text-sm text-gray-500 hover:underline"
                >
                  <span>Ver tudo</span>
                  <ChevronRight className="ml-1 mt-1 h-4 w-4" />
                </a>
              </div>

              <div className="mt-2 sm:mt-4">
                {eventList.map((item) => (
                  <Link
                    key={item.id}
                    to={item.id > 0 ? getEventHref(item) : '#'}
                    className="group relative block overflow-hidden border-b-2 border-gray-200 p-3.5"
                  >
                    <div className="absolute inset-0 z-20 hidden group-hover:block">
                      <img
                        className="pointer-events-none w-full object-cover"
                        src={item.image ? resolveInfoCulturaAssetUrl(item.image) : heroEmployabilityImage}
                        alt={item.title}
                      />
                      <span className="absolute inset-0 z-10 h-full w-full bg-black/60" />
                    </div>

                    <div className="relative z-30">
                      <time className="text-sm font-semibold uppercase text-orange-400">
                        {formatDate(item.event_date)}
                      </time>
                      <p className="mt-2 text-lg font-bold transition group-hover:text-white group-hover:underline xl:text-xl 2xl:text-2xl">
                        {item.title}
                      </p>
                      <p className="mt-1 line-clamp-2 transition group-hover:text-white">
                        {truncateText(item.description || 'Sem descrição.', 180)}
                      </p>
                      <div className="mt-2 flex items-center space-x-3 text-sm text-gray-600 transition group-hover:text-white">
                        <span>{getEventTag(item)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
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
