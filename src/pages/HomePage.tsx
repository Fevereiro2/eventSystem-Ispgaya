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
import { adminBtnPrimary, adminBtnSecondary, container, mainContent } from '../styles/ui';

const studyLinks = [
  { label: 'CTeSP', href: 'https://ispgaya.pt/pt/ensino/oferta-formativa' },
  { label: 'Licenciaturas', href: 'https://ispgaya.pt/pt/ensino/oferta-formativa' },
  { label: 'Mestrados', href: 'https://ispgaya.pt/pt/ensino/oferta-formativa' },
  { label: 'Pos-Graduacoes', href: 'https://ispgaya.pt/pt/ensino/oferta-formativa' }
];

const heroSlides = [
  {
    title: 'Bem-vindo? ao Instituto Superior Politecnico Gaya',
    text:
      'Uma homepage com header transparente, mensagem de entrada forte e uma estrutura visual alinhada com o portal institucional.',
    image: heroWelcomeImage
  },
  {
    title: 'Dinamiza as tuas capacidades connosco',
    text:
      'Espaco preparado para destacar instalacoes, proximidade com docentes e um ambiente academico mais vivo.',
    image: heroStudyImage
  },
  {
    title: 'O mercado de trabalho espera por ti',
    text:
      'Zona central pensada para ligar formacao, empregabilidade, estagios e percurso profissional.',
    image: heroEmployabilityImage
  }
];

const highlightCards = [
  {
    title: 'Laboratorio Cultural',
    text:
      'Projeto cultural aberto a quem quer participar em atividades nas areas da musica, teatro e leitura.',
    href: '/laboratorio-cultural',
    internal: true
  },
  {
    title: 'Estudantes Internacionais',
    text: 'Bloco pronto para campanhas e candidaturas dirigidas a publico internacional.',
    href: 'https://international.ispgaya.pt/pt'
  },
  {
    title: 'Candidaturas Abertas',
    text:
      'Espaco pensado para dar visibilidade imediata ao acesso ao ensino superior e a periodos de candidatura.',
    href: 'https://ispgaya.pt/pt/ensino/candidaturas'
  }
];

const metrics = [
  {
    value: '35',
    title: 'Experiencia',
    text:
      'Mais de tres decadas de percurso a formar profissionais e a consolidar uma identidade forte em Vila Nova de Gaia.'
  },
  {
    value: '+3.5k',
    title: 'Profissionais Formados',
    text:
      'Um bloco de impacto para mostrar resultados, percurso academico e alcance da formacao ao longo do tempo.'
  },
  {
    value: '+200',
    title: 'Empresas',
    text:
      'Parcerias e protocolos que ajudam a ligar o percurso academico ao contexto real de trabalho.'
  }
];

const supportSlides = [
  {
    title: 'Quero Candidatar-me',
    text: 'Comeca aqui a tua candidatura e organiza o processo de entrada num dos cursos.',
    href: 'https://inforestudante.ispgaya.pt/nonio/security/preRegisto.do?origem=CANDIDATURAS',
    image: heroWelcomeImage
  },
  {
    title: 'Bolsas e Apoios',
    text: 'Consulta as modalidades de apoio financeiro e a informacao util para candidatos.',
    href: 'https://ispgaya.pt/pt/ensino/bolsas-e-financiamento',
    image: heroStudyImage
  },
  {
    title: 'Acesso ao Ensino Superior',
    text: 'Explora as vias de ingresso e percebe que percurso faz mais sentido para ti.',
    href: 'https://ispgaya.pt/pt/ensino/candidaturas',
    image: heroEmployabilityImage
  }
];

const testimonialSlides = [
  {
    quote:
      'Escolhi um percurso onde encontrei proximidade, apoio e contexto para crescer de forma mais completa.',
    name: 'Maribel Carvalho',
    role: 'Estudante ISPGAYA',
    image: heroWelcomeImage
  },
  {
    quote:
      'A componente pratica e o contacto com docentes e projetos ajudaram-me a consolidar o meu percurso profissional.',
    name: 'Manuel Oliveira',
    role: 'Estudante Mestrado',
    image: heroEmployabilityImage
  }
];

function formatDate(value?: string | null): string {
  if (!value) return 'Data por definir';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-PT', { dateStyle: 'long' }).format(date);
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
        setLoadError(
          error instanceof Error ? error.message : 'Nao foi possivel carregar a homepage.'
        );
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  const currentHero = heroSlides[activeHero];
  const highlightedNews = useMemo(() => newsItems.slice(0, 3), [newsItems]);
  const highlightedEvents = useMemo(() => events.slice(0, 3), [events]);
  const fallbackNews = useMemo<InfoCulturaNews[]>(
    () =>
      highlightedNews.length > 0
        ? highlightedNews
        : [
            {
              id: 0,
              title: 'Espaco preparado para noticia institucional',
              summary: 'Substitui depois por conteudo real vindo da area publica.',
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
              summary: 'Estrutura pronta para thumbnail, data, titulo e resumo.',
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
              summary: 'Bloco alinhado com a grelha editorial da homepage institucional.',
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
    [highlightedNews]
  );
  const fallbackEvents = useMemo<InfoCulturaEvent[]>(
    () =>
      highlightedEvents.length > 0
        ? highlightedEvents
        : [
            {
              id: 0,
              title: 'Espaco preparado para evento institucional',
              description: 'Area pronta para data, imagem, titulo e descricao.',
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
              description: 'Mantem a composicao do site real e fica pronto para conteudo final.',
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
              description: 'Este card fica alinhado com a mesma grelha da homepage de referencia.',
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
    [highlightedEvents]
  );

  return (
    <>
      <main className={mainContent}>
        <section className="relative overflow-hidden bg-[#10263b]">
          <div className="absolute inset-0">
            <img
              src={currentHero.image}
              alt={currentHero.title}
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,24,37,0.82)_0%,rgba(15,38,59,0.74)_46%,rgba(15,38,59,0.48)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(233,159,55,0.42),transparent_28%)]" />
          </div>

          <div className="absolute inset-x-0 top-0 z-30">
            <TopBar transparent />
            <HeaderNav transparent />
          </div>

          <div className={`relative z-10 ${container} pb-16 pt-44 md:pb-20 md:pt-52 lg:pt-56`}>
            <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-end">
              <div className="max-w-2xl text-white">
                <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/90 backdrop-blur">
                  Instituto Superior Politecnico Gaya
                </p>
                <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                  {currentHero.title}
                </h1>
                <p className="mt-6 max-w-xl text-base leading-8 text-white/82 md:text-lg">
                  {currentHero.text}
                </p>

                <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-white/72">
                  Fica a conhecer a nossa oferta formativa
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {studyLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <a href="https://ispgaya.pt/pt" className={adminBtnPrimary}>
                    Descobre Mais
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveHero((current) =>
                        current === 0 ? heroSlides.length - 1 : current - 1
                      )
                    }
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition-colors hover:bg-white/20"
                    aria-label="Slide anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveHero((current) => (current + 1) % heroSlides.length)}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition-colors hover:bg-white/20"
                    aria-label="Slide seguinte"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-8 flex gap-3">
                  {heroSlides.map((slide, index) => (
                    <button
                      key={slide.title}
                      type="button"
                      onClick={() => setActiveHero(index)}
                      aria-label={`Ir para slide ${index + 1}`}
                      className={`h-1.5 rounded-full transition-all ${
                        index === activeHero ? 'w-16 bg-[#dd8609]' : 'w-8 bg-white/35'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid gap-5 lg:pl-8">
                <div className="overflow-hidden rounded-[30px] border border-white/12 bg-white/10 shadow-2xl shadow-black/20 backdrop-blur-sm">
                  <div className="grid min-h-[390px] lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="p-7 text-white">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f2c17a]">
                        Destaque Principal
                      </p>
                      <h2 className="mt-4 text-3xl font-semibold leading-tight">
                        Header transparente sobre imagem, com o mesmo peso visual do site real.
                      </h2>
                      <p className="mt-4 text-sm leading-7 text-white/78">
                        Esta zona fica pronta para entrarem as tuas fotos reais sem voltares a
                        refazer a composicao.
                      </p>
                    </div>
                    <div className="relative min-h-[260px]">
                      <img
                        src={heroSlides[activeHero].image}
                        alt="Placeholder institucional"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(15,38,59,0.65))]" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <article className="overflow-hidden rounded-[26px] border border-white/12 bg-white/10 p-6 text-white backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f2c17a]">
                      Slide Atual
                    </p>
                    <h3 className="mt-4 text-2xl font-semibold">{heroSlides[activeHero].title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/76">
                      Estrutura pronta para cartaz, campanha ou fotografia de rececao.
                    </p>
                  </article>
                  <article className="overflow-hidden rounded-[26px] border border-white/12 bg-white/10">
                    <img
                      src={heroSlides[(activeHero + 1) % heroSlides.length].image}
                      alt="Placeholder secundario"
                      className="h-44 w-full object-cover"
                    />
                  </article>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-14 md:py-20">
          <div className={`${container} grid gap-6 lg:grid-cols-2`}>
            <article className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_30px_70px_rgba(15,23,42,0.07)]">
              <div className="h-64 overflow-hidden">
                <img src={heroStudyImage} alt="Instalacoes" className="h-full w-full object-cover" />
              </div>
              <div className="p-8">
                <h2 className="text-3xl font-semibold text-slate-900">
                  Dinamiza as tuas capacidades connosco
                </h2>
                <p className="mt-4 text-base leading-8 text-slate-600">
                  Bloco principal para destacar instalacoes, acompanhamento e ambiente academico.
                </p>
              </div>
            </article>

            <article className="overflow-hidden rounded-[30px] border border-slate-200 bg-[#f7f4ec] shadow-[0_30px_70px_rgba(15,23,42,0.06)]">
              <div className="h-64 overflow-hidden">
                <img
                  src={heroEmployabilityImage}
                  alt="Empregabilidade"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-8">
                <h2 className="text-3xl font-semibold text-slate-900">
                  O mercado de trabalho espera por ti
                </h2>
                <p className="mt-4 text-base leading-8 text-slate-600">
                  Secao pronta para falar de carreira, oportunidades, estagios e preparacao para o
                  mundo profissional.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="bg-[#f6f3ec] py-14 md:py-18">
          <div className={container}>
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#dd8609]">
                Destaques
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {highlightCards.map((item) =>
                item.internal ? (
                  <Link
                    key={item.title}
                    to={item.href}
                    className="group rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_22px_60px_rgba(15,23,42,0.05)] transition-transform hover:-translate-y-1"
                  >
                    <div className="mb-5 h-40 rounded-[22px] bg-[linear-gradient(135deg,#dde4ec,#f6f7f8)]" />
                    <h3 className="text-2xl font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-slate-600">{item.text}</p>
                    <span className="mt-5 inline-flex text-sm font-semibold text-[#dd8609]">
                      Fica a saber mais
                    </span>
                  </Link>
                ) : (
                  <a
                    key={item.title}
                    href={item.href}
                    className="group rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_22px_60px_rgba(15,23,42,0.05)] transition-transform hover:-translate-y-1"
                  >
                    <div className="mb-5 h-40 rounded-[22px] bg-[linear-gradient(135deg,#dde4ec,#f6f7f8)]" />
                    <h3 className="text-2xl font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-slate-600">{item.text}</p>
                    <span className="mt-5 inline-flex text-sm font-semibold text-[#dd8609]">
                      Fica a saber mais
                    </span>
                  </a>
                )
              )}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className={`${container} grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center`}>
            <div className="overflow-hidden rounded-[32px] border border-slate-200 shadow-[0_28px_80px_rgba(15,23,42,0.07)]">
              <img
                src={gaiaSkyline}
                alt="Onde o Futuro Te Leva"
                className="h-full min-h-[520px] w-full object-cover"
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#dd8609]">
                Onde o Futuro Te Leva
              </p>
              <div className="mt-6 grid gap-6">
                {metrics.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-[28px] border border-slate-200 bg-[#f8f6f1] p-7"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-6">
                      <div className="min-w-[120px] text-4xl font-bold text-[#dd8609]">
                        {item.value}
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold text-slate-900">{item.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#10263b] py-16 text-white md:py-20">
          <div className={container}>
            <div className="max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f2c17a]">
                Ainda queres saber mais? Nos podemos ajudar-te.
              </p>
              <h2 className="mt-4 text-3xl font-semibold md:text-4xl">
                Slider institucional preparado para candidatura, bolsas e informacao de acesso.
              </h2>
              <p className="mt-4 text-base leading-8 text-white/75">
                Esta secao passa a comportar-se como carrossel, com setas e transicao de blocos,
                como pediste.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a
                href="https://inforestudante.ispgaya.pt/nonio/security/preRegisto.do?origem=CANDIDATURAS"
                className={adminBtnPrimary}
              >
                Candidatar-me
              </a>
              <a href="https://ispgaya.pt/pt/ensino/candidaturas" className={adminBtnSecondary}>
                Quero saber mais
              </a>
            </div>

            <div className="mt-10 flex items-center justify-between">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setActiveSupport((current) =>
                      current === 0 ? supportSlides.length - 1 : current - 1
                    )
                  }
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/15"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSupport((current) => (current + 1) % supportSlides.length)}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/15"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {supportSlides.map((item, index) => (
                <a
                  key={item.title}
                  href={item.href}
                  className={`rounded-[28px] border p-7 transition-all ${
                    index === activeSupport
                      ? 'border-[#f2c17a] bg-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.2)]'
                      : 'border-white/10 bg-white/5 opacity-70'
                  }`}
                >
                  <div className="mb-5 h-44 overflow-hidden rounded-[20px]">
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                  <h3 className="text-2xl font-semibold">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/75">{item.text}</p>
                  <span className="mt-5 inline-flex text-sm font-semibold text-[#f2c17a]">
                    Ver mais
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className={container}>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#dd8609]">
                  Noticias
                </p>
                <h2 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">
                  Grelha editorial preparada como no portal principal.
                </h2>
              </div>
              <a href="https://ispgaya.pt/pt/vida-academica/noticias" className={adminBtnSecondary}>
                Ver tudo
              </a>
            </div>

            {loadError ? (
              <p className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {loadError}
              </p>
            ) : null}

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {fallbackNews.map((item) => (
                <Link
                  key={item.id}
                  to={item.id > 0 ? getNewsHref(item) : '#'}
                  className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.05)] transition-transform hover:-translate-y-1"
                >
                  {item.image ? (
                    <img
                      src={resolveInfoCulturaAssetUrl(item.image)}
                      alt={item.title}
                      className="h-56 w-full object-cover"
                    />
                  ) : (
                    <img src={heroWelcomeImage} alt={item.title} className="h-56 w-full object-cover" />
                  )}
                  <div className="p-6">
                    <p className="text-sm font-medium text-slate-500">
                      {formatDate(item.published_at || item.created_at)}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {truncateText(item.summary || item.content || 'Sem resumo.', 180)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f7f3ea] py-16 md:py-20">
          <div className={container}>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#dd8609]">
                  Eventos
                </p>
                <h2 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">
                  Agenda com a mesma leitura da homepage institucional.
                </h2>
              </div>
              <a href="https://ispgaya.pt/pt/vida-academica/eventos" className={adminBtnSecondary}>
                Ver tudo
              </a>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {fallbackEvents.map((item) => (
                <Link
                  key={item.id}
                  to={item.id > 0 ? getEventHref(item) : '#'}
                  className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.05)] transition-transform hover:-translate-y-1"
                >
                  {item.image ? (
                    <img
                      src={resolveInfoCulturaAssetUrl(item.image)}
                      alt={item.title}
                      className="h-56 w-full object-cover"
                    />
                  ) : (
                    <img src={heroEmployabilityImage} alt={item.title} className="h-56 w-full object-cover" />
                  )}
                  <div className="p-6">
                    <p className="text-sm font-medium text-slate-500">{formatDate(item.event_date)}</p>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {truncateText(item.description || 'Sem descricao.', 190)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className={`${container} grid gap-8 lg:grid-cols-[0.9fr_1.1fr]`}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#dd8609]">
                Testemunhos
              </p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">
                Secao em formato de carrossel, com controlo manual.
              </h2>
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setActiveTestimonial((current) =>
                      current === 0 ? testimonialSlides.length - 1 : current - 1
                    )
                  }
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition-colors hover:border-[#dd8609] hover:text-[#dd8609]"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveTestimonial((current) => (current + 1) % testimonialSlides.length)
                  }
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition-colors hover:border-[#dd8609] hover:text-[#dd8609]"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <article className="overflow-hidden rounded-[32px] border border-slate-200 bg-[#fbfaf7] shadow-[0_26px_70px_rgba(15,23,42,0.06)]">
              <div className="grid gap-0 md:grid-cols-[1.05fr_0.95fr]">
                <div className="p-8 md:p-10">
                  <p className="text-xl leading-9 text-slate-700">
                    “{testimonialSlides[activeTestimonial].quote}”
                  </p>
                  <p className="mt-8 text-lg font-semibold text-slate-900">
                    {testimonialSlides[activeTestimonial].name}
                  </p>
                  <p className="mt-1 text-sm uppercase tracking-[0.14em] text-slate-500">
                    {testimonialSlides[activeTestimonial].role}
                  </p>
                </div>
                <div className="h-full min-h-[280px]">
                  <img
                    src={testimonialSlides[activeTestimonial].image}
                    alt={testimonialSlides[activeTestimonial].name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default HomePage;
