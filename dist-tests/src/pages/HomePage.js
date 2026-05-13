import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Footer from '../components/layout/Footer';
import HeaderNav from '../components/layout/HeaderNav';
import NewsHighlightsSection from '../components/ui/NewsHighlightsSection';
import BestBooksSection from '../components/sections/BestBooksSection.js';
import TopBar from '../components/layout/TopBar';
import heroWelcomeImage from '../assets/backgroundphotos/bem-vindos-estudantes-ispgaya.webp';
import heroStudyImage from '../assets/backgroundphotos/estudar-no-ispagaya.webp';
import heroEmployabilityImage from '../assets/backgroundphotos/empregabilidade-ispgaya.webp';
import aondefuturo from '../assets/homepage/ondefuturo.webp';
import helix from '../assets/homepage/destaques/helix-ispgaya-site.webp';
import mais23 from '../assets/homepage/destaques/3.webp';
import manuel from '../assets/homepage/testemunhos/2.webp';
import maribel from '../assets/homepage/testemunhos/1.webp';
import { fetchPublicBooks, fetchPublicEvents, fetchPublicNews, resolveInfoCulturaAssetUrl } from '../api/infoculturaApi';
import { container, mainContent } from '../styles/ui';
import { getLocaleText, useLocale } from '../i18n/locale.js';
const studyLinks = [
    { label: 'CTeSP', href: 'https://ispgaya.pt/pt/ensino/oferta-formativa/ctesp' },
    { label: 'Licenciaturas', href: 'https://ispgaya.pt/pt/ensino/oferta-formativa/licenciaturas' },
    { label: 'Mestrados', href: 'https://ispgaya.pt/pt/ensino/oferta-formativa/mestrados' },
    {
        label: 'Pós-Graduações',
        href: 'https://ispgaya.pt/pt/ensino/programas-avancados/pos-graduacoes'
    }
];
const heroSlides = [
    {
        title: 'Bem-vindo ao Instituto Superior Politécnico Gaya',
        text: 'Aqui, é onde o teu futuro começa!\nNo ISPGAYA vais adquirir novos conhecimentos, desenvolver novas competências e experienciar um clima académico único.',
        image: heroWelcomeImage
    },
    {
        title: 'Dinamiza as tuas capacidades connosco',
        text: 'Temos à tua disposição instalações modernas, estreita proximidade entre o corpo docente e os estudantes, assim como, um excelente ambiente académico.',
        image: heroStudyImage
    },
    {
        title: 'O mercado de trabalho espera por ti',
        text: 'Temos como objetivo dar-te as ferramentas necessárias para criar uma carreira com significado e tomares as melhores decisões para a tua vida profissional e pessoal.',
        image: heroEmployabilityImage
    }
];
const highlightCards = [
    {
        title: 'Laboratório Cultural',
        text: 'Projeto cultural aberto a quem quer participar em atividades nas áreas da musica, teatro e leitura.',
        href: '/laboratorio-cultural',
        image: helix
    },
    {
        title: 'Regime M23 - Candidaturas Abertas!',
        text: 'Estão abertas as candidaturas ao Regime M23!',
        href: 'https://ispgaya.pt/pt/ensino/candidaturas/licenciaturas/m-23',
        image: mais23
    },
    {
        title: 'O ISPGAYA junta-se à Q-Helix Alliance!',
        text: 'É com grande satisfação que anunciamos que o ISPGAYA – Instituto Superior Politécnico de Gaia passou a integrar oficialmente a Q-Helix Alliance, uma rede europeia em crescimento dedicada ao reforço da cooperação no ensino superior, investigação e inovação.',
        href: 'https://ispgaya.pt/pt/vida-academica/noticias/o-ispgaya-junta-se-a-q-helix-alliance',
        image: helix
    }
];
const metrics = [
    {
        value: '36',
        title: 'Experiência',
        text: 'Desde 1990 a formar futuros empreendedores. Somos uma instituição de ensino de referência há mais de 30 anos em Vila Nova de Gaia. Quer pela qualidade dos seus cursos, quer pelo corpo docente qualificado, quer pelo clima académico estimulante e diferenciador.'
    },
    {
        value: '+3.5k',
        title: 'Profissionais Formados',
        text: 'A formação continua a ser um dos nossos principais pilares. Somos reconhecidos pela formação de excelência e já formamos mais de 3500 profissionais de sucesso. Aqui os estudantes têm oportunidade de construir o seu futuro pessoal e profissional.'
    },
    {
        value: '+200',
        title: 'Empresas',
        text: 'Trabalhamos em proximidade com as empresas, estando atentos às suas necessidades e a par das suas aspirações. Temos protocolos celebrados com mais de 200 empresas que garantem a qualidade dos estágios e permitem a integração de estudantes no mercado de trabalho.'
    }
];
const supportSlides = [
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
const testimonialSlides = [
    {
        quote: 'De forma a consolidar os conhecimentos na área da segurança de informação e cibersegurança, optei pelo mestrado do ISPGAYA pela diversidade de oportunidades e pela transversalidade das competências adquiridas.',
        name: 'Manuel Oliveira',
        role: 'Estudante Mestrado',
        image: manuel
    },
    {
        quote: 'Escolhi o ISPGAYA por recomendação de outros alunos e da mesma forma também, eu o recomendo. A maioria dos professores e colaboradores que me acompanharam ao longo da minha licenciatura em gestão foram sempre muito prestáveis e cada um com a sua função proporcionaram me momento inesquecíveis que me enriqueceram para o meu futuro. Por isso quero desde já agradecer a todas as pessoas que me acompanharam, porque em cada dia que estiveram presentes na minha vida deixaram o seu contributo para a minha realização pessoal e profissional, muito obrigada.',
        name: 'Maribel Carvalho',
        role: 'Estudante ISPGAYA',
        image: maribel
    }
];
function HomePage() {
    const [activeHero, setActiveHero] = useState(0);
    const [activeSupport, setActiveSupport] = useState(0);
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const [isHeaderSolid, setIsHeaderSolid] = useState(false);
    const testimonialTouchStartX = useRef(null);
    const [homepageNewsHighlights, setHomepageNewsHighlights] = useState([]);
    const [homepageEventHighlights, setHomepageEventHighlights] = useState([]);
    const [homepageBookHighlights, setHomepageBookHighlights] = useState([]);
    const { locale } = useLocale();
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
    useEffect(() => {
        let active = true;
        async function loadHomepageNews() {
            try {
                const newsItems = await fetchPublicNews();
                if (!active)
                    return;
                const items = newsItems
                    .slice()
                    .sort((left, right) => {
                    const leftTime = new Date(left.published_at || left.created_at).getTime();
                    const rightTime = new Date(right.published_at || right.created_at).getTime();
                    return rightTime - leftTime;
                })
                    .slice(0, 3)
                    .map((item) => ({
                    title: item.title,
                    href: `/vida-academica/noticias/${item.id}`,
                    internal: true,
                    excerpt: item.summary,
                    image: resolveInfoCulturaAssetUrl(item.image),
                    imageAlt: item.title,
                    publishedAt: item.published_at || item.created_at,
                    publishedLabel: new Intl.DateTimeFormat('pt-PT', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                    }).format(new Date(item.published_at || item.created_at)),
                    tags: item.club_name
                        ? [{ label: `#${item.club_name.toLowerCase().replace(/\s+/g, '')}`, href: '/vida-academica/noticias' }]
                        : []
                }));
                setHomepageNewsHighlights(items);
            }
            catch {
                if (!active)
                    return;
                setHomepageNewsHighlights([]);
            }
        }
        async function loadHomepageEvents() {
            try {
                const events = await fetchPublicEvents();
                if (!active)
                    return;
                const items = events
                    .slice()
                    .sort((left, right) => {
                    const leftTime = new Date(left.start_date || left.event_date).getTime();
                    const rightTime = new Date(right.start_date || right.event_date).getTime();
                    return rightTime - leftTime;
                })
                    .slice(0, 3)
                    .map((item) => ({
                    title: item.title,
                    href: `/vida-academica/eventos/${item.id}`,
                    internal: true,
                    excerpt: item.description,
                    image: resolveInfoCulturaAssetUrl(item.image),
                    imageAlt: item.title,
                    publishedAt: item.start_date || item.event_date,
                    publishedLabel: new Intl.DateTimeFormat('pt-PT', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                    }).format(new Date(item.start_date || item.event_date)),
                    tags: item.categories.map((category) => ({
                        label: `#${category.name.toLowerCase().replace(/\s+/g, '')}`,
                        href: '/vida-academica/eventos'
                    }))
                }));
                setHomepageEventHighlights(items);
            }
            catch {
                if (!active)
                    return;
                setHomepageEventHighlights([]);
            }
        }
        async function loadHomepageBooks() {
            try {
                const books = await fetchPublicBooks();
                if (!active)
                    return;
                setHomepageBookHighlights(books);
            }
            catch {
                if (!active)
                    return;
                setHomepageBookHighlights([]);
            }
        }
        void loadHomepageNews();
        void loadHomepageEvents();
        void loadHomepageBooks();
        return () => {
            active = false;
        };
    }, []);
    const currentHero = heroSlides[activeHero];
    const showStudyLinks = activeHero === 0;
    function showPreviousTestimonial() {
        setActiveTestimonial((current) => Math.max(current - 1, 0));
    }
    function showNextTestimonial() {
        setActiveTestimonial((current) => Math.min(current + 1, testimonialSlides.length - 1));
    }
    function handleTestimonialTouchStart(event) {
        testimonialTouchStartX.current = event.touches[0]?.clientX ?? null;
    }
    function handleTestimonialTouchEnd(event) {
        const startX = testimonialTouchStartX.current;
        const endX = event.changedTouches[0]?.clientX ?? null;
        testimonialTouchStartX.current = null;
        if (startX === null || endX === null)
            return;
        const deltaX = endX - startX;
        if (Math.abs(deltaX) < 40)
            return;
        if (deltaX > 0) {
            showPreviousTestimonial();
            return;
        }
        showNextTestimonial();
    }
    function SliderArrowIcon({ direction }) {
        return (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: `h-7 w-7 ${direction === 'left' ? 'rotate-180' : ''}`, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M17 8l4 4m0 0l-4 4m4-4H3" }) }));
    }
    return (_jsxs(_Fragment, { children: [_jsxs("main", { className: mainContent, children: [_jsxs("section", { className: "relative h-screen overflow-hidden bg-[#10263b]", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden", children: [_jsx("div", { className: "flex h-full w-full transition-transform duration-700 ease-in-out", style: { transform: `translateX(-${activeHero * 100}%)` }, children: heroSlides.map((slide, index) => (_jsx("img", { src: slide.image, alt: slide.title, className: "h-full w-full shrink-0 object-cover", loading: index === 0 ? 'eager' : 'lazy', fetchPriority: index === 0 ? 'high' : 'auto' }, slide.title))) }), _jsx("div", { className: "absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.15))]" }), _jsx("div", { className: "absolute inset-0 bg-[linear-gradient(90deg,rgba(18,30,44,0.78)_0%,rgba(18,30,44,0.55)_45%,rgba(18,30,44,0.25)_100%)]" })] }), _jsxs("div", { className: `fixed inset-x-0 top-0 z-50 transition-all duration-300 ${isHeaderSolid ? 'bg-white' : 'bg-transparent'}`, children: [_jsx(TopBar, { transparent: !isHeaderSolid }), _jsx(HeaderNav, { transparent: !isHeaderSolid })] }), _jsxs("div", { className: `relative z-10 flex h-full flex-col ${container}`, children: [_jsx("div", { className: "flex-1" }), _jsxs("div", { className: "pb-[7vh] text-white", children: [_jsxs("div", { className: "grid grid-cols-12 gap-y-8", children: [_jsxs("div", { className: "col-span-12 lg:col-span-6 xl:col-span-7", children: [_jsx("h1", { className: "font-heading text-3xl font-bold leading-snug sm:text-5xl sm:leading-snug lg:text-4xl lg:leading-snug xl:pr-[8vw] xl:text-5xl xl:leading-snug 2xl:pr-[5vw] 2xl:text-6xl", children: currentHero.title }), _jsx("p", { className: "mt-4 max-w-2xl whitespace-pre-line text-base font-medium sm:text-lg", children: currentHero.text })] }), _jsxs("div", { className: "col-span-12 hidden lg:block lg:col-span-6 xl:col-span-5", children: [_jsxs("div", { className: showStudyLinks ? '' : 'invisible pointer-events-none select-none', "aria-hidden": !showStudyLinks, children: [_jsx("p", { className: "font-medium", children: getLocaleText(locale, 'Fica a conhecer a nossa oferta formativa:', 'Discover our training programs:') }), _jsx("ul", { className: "mt-1 divide-y-2 divide-white", children: studyLinks.map((item) => (_jsx("li", { children: _jsxs("a", { href: item.href, className: "group flex items-center justify-between px-1.5 py-2 text-lg font-bold xl:px-4 xl:py-3 xl:text-xl 2xl:text-2xl", children: [_jsx("span", { className: "transition-opacity group-hover:opacity-80", children: item.label }), _jsx("span", { className: "-translate-x-4 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100", children: "\u27F6" })] }) }, item.label))) })] }), _jsx("div", { className: `mt-5 lg:mt-6 xl:text-right ${showStudyLinks ? '' : 'invisible pointer-events-none select-none'}`, "aria-hidden": !showStudyLinks, children: _jsxs("a", { href: "#content-start", className: "inline-flex items-center justify-end opacity-70 transition-opacity hover:opacity-100", children: [_jsx("span", { className: "text-sm font-bold uppercase tracking-tight", children: getLocaleText(locale, 'Descobre Mais', 'Find out more') }), _jsx("span", { className: "ml-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white transition hover:scale-110 hover:border-dashed", children: _jsx(ChevronRight, { className: "h-5 w-5 rotate-90" }) })] }) })] })] }), _jsx("div", { className: "mt-8 flex items-center space-x-5", children: heroSlides.map((slide, index) => (_jsxs("button", { type: "button", onClick: () => setActiveHero(index), className: `flex h-7 w-7 items-center justify-center rounded-full border border-white transition-opacity ${index === activeHero ? 'opacity-100' : 'opacity-60'}`, children: [_jsxs("span", { className: "sr-only", children: ["Slide ", index + 1] }), _jsx("span", { className: "h-3 w-3 rounded-full bg-white" })] }, slide.title))) })] })] })] }), _jsxs("section", { id: "content-start", className: "scroll-mt-36 bg-white pt-10 lg:pt-12 xl:pt-16 2xl:pt-20", children: [_jsx("div", { className: `${container} text-center`, children: _jsx("h2", { className: "font-heading text-3xl font-bold tracking-tight text-black xl:text-4xl 2xl:text-5xl", children: getLocaleText(locale, 'Destaques', 'Highlights') }) }), _jsx("div", { className: `${container} mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 pt-2 sm:px-6 md:justify-center md:gap-6 md:px-0`, children: highlightCards.map((item) => (_jsxs("a", { href: item.href, className: "group relative flex min-h-[500px] min-w-[78vw] max-w-[78vw] snap-center flex-col overflow-hidden rounded bg-gray-200 first:ml-0 md:min-w-0 md:max-w-none md:basis-6/12 lg:basis-4/12 2xl:basis-3/12", children: [_jsxs("div", { className: "absolute inset-0", children: [_jsx("img", { src: item.image, alt: item.title, className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" })] }), _jsxs("div", { className: "relative z-10 mt-auto px-6 pb-6 pt-6 text-white", children: [_jsx("p", { className: "font-heading text-2xl underline-offset-2 group-hover:underline", children: item.title }), _jsx("div", { className: "max-h-40 overflow-hidden transition-[max-height] duration-500 ease-in-out md:max-h-0 md:group-hover:max-h-40", children: _jsx("p", { className: "mt-4 font-medium", children: item.text }) })] }), _jsxs("div", { className: "relative z-10 flex items-center px-6 py-6 text-white", children: [_jsx(ChevronRight, { className: "h-7 w-7" }), _jsx("p", { className: "ml-3 font-medium", children: getLocaleText(locale, 'Fica a saber mais', 'Find out more') })] })] }, item.title))) })] }), _jsx("section", { className: "relative mt-20 bg-gray-50 py-16 before:absolute before:-top-5 before:h-14 before:w-full before:-skew-y-1 before:bg-gray-50 after:absolute after:-bottom-5 after:h-14 after:w-full after:-skew-y-1 after:bg-gray-50 lg:mt-24 xl:mt-28", children: _jsxs("div", { className: `${container} grid grid-cols-1 gap-y-10 lg:grid-cols-2 lg:gap-x-4 xl:gap-x-6 2xl:gap-x-8`, children: [_jsx("div", { className: "relative col-span-1 hidden lg:block", children: _jsx("div", { className: "sticky top-36", children: _jsx("img", { src: aondefuturo, alt: getLocaleText(locale, 'Onde o Futuro Te Leva', 'Where the Future Takes You'), className: "relative z-10 mx-auto block shadow-2xl lg:w-10/12 xl:w-auto" }) }) }), _jsxs("div", { className: "col-span-2 mx-auto max-w-xl space-y-10 lg:col-span-1 lg:mx-0 lg:max-w-none xl:space-y-14", children: [_jsx("div", { className: "text-center lg:text-left", children: _jsx("h2", { className: "font-heading text-3xl font-bold tracking-tight text-black xl:text-4xl 2xl:text-5xl", children: "Onde o Futuro Te Leva" }) }), metrics.map((item, index) => (_jsx("div", { className: "flex", children: index % 2 === 1 ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mr-4 border-b-2 border-l-2 border-gray-300 pb-6 pl-6 pr-2 pt-2", children: [_jsx("p", { className: "text-lg font-bold xl:text-2xl", children: item.title }), _jsx("p", { className: "mt-3 max-w-md text-sm sm:text-base", children: item.text })] }), _jsx("div", { children: _jsx("p", { className: "mt-2 font-heading text-3xl font-bold text-orange-400 sm:text-4xl lg:text-5xl xl:text-6xl", children: item.value }) })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { children: _jsx("p", { className: "mt-2 font-heading text-3xl font-bold text-orange-400 sm:text-4xl lg:text-5xl xl:text-6xl", children: item.value }) }), _jsxs("div", { className: "ml-2 border-b-2 border-r-2 border-gray-300 pb-2 pl-2 pr-2 pt-2 sm:ml-4 sm:pb-6 sm:pl-6", children: [_jsx("p", { className: "text-lg font-bold xl:text-2xl", children: item.title }), _jsx("p", { className: "mt-3 max-w-md text-sm sm:text-base", children: item.text })] })] })) }, item.title)))] })] }) }), _jsx("section", { className: "relative mt-16 overflow-hidden lg:mt-28 xl:mt-32 2xl:mt-32", children: _jsxs("div", { className: `${container} grid grid-cols-1 gap-x-10 bg-white lg:grid-cols-2`, children: [_jsxs("div", { className: "relative z-10 col-span-2 bg-white py-6 lg:col-span-1", children: [_jsx("h2", { className: "max-w-2xl font-heading text-3xl font-bold tracking-tight text-black xl:text-4xl 2xl:text-5xl", children: getLocaleText(locale, 'Ainda queres saber mais? Nós podemos ajudar-te.', 'Do you still want to know more? We can help you') }), _jsx("p", { className: "mt-4", children: getLocaleText(locale, 'A candidatura ao ensino superior é um passo muito importante. O ISPGAYA dispõe da modalidade de acesso ideal para ti, quer tenhas terminado o ensino secundário ou já estejas a trabalhar e queiras aperfeiçoar os teus conhecimentos.', 'Applying for higher education is a very important step, it is the starting point for becoming a successful professional. ISPGAYA has the ideal access modality for you, whether you have finished secondary education or are already working and want to improve your knowledge.') }), _jsxs("div", { className: "mt-6 flex flex-col sm:flex-row sm:items-center", children: [_jsx("a", { href: "https://inforestudante.ispgaya.pt/nonio/security/preRegisto.do?origem=CANDIDATURAS", className: "inline-block bg-orange-400 px-6 py-2 text-center font-bold text-white transition hover:bg-orange-500", children: "Candidatar-me" }), _jsx("a", { href: "https://ispgaya.pt/pt/ensino/candidaturas", className: "mt-3 inline-block border-2 border-orange-700 px-6 py-2 text-center font-bold text-orange-700 transition hover:border-orange-600 hover:bg-orange-600 hover:text-white sm:ml-6 sm:mt-0", children: "Quero saber mais" })] })] }), _jsx("div", { className: "col-span-2 min-w-0 bg-white lg:col-span-1", children: _jsxs("div", { className: "xl:max-w-2xl", children: [_jsxs("div", { className: "flex items-center py-4", children: [_jsx("button", { type: "button", onClick: () => setActiveSupport((current) => current === 0 ? supportSlides.length - 1 : current - 1), className: "p-2 text-gray-700 transition hover:text-gray-600", children: _jsx(ChevronLeft, { className: "h-7 w-7" }) }), _jsx("div", { className: "mx-2 flex items-center space-x-3", children: supportSlides.map((item, index) => (_jsx("button", { type: "button", onClick: () => setActiveSupport(index), className: `h-2.5 w-2.5 rounded-full ${index === activeSupport ? 'bg-orange-400' : 'bg-gray-300'}`, children: _jsxs("span", { className: "sr-only", children: ["Slide ", index + 1] }) }, item.title))) }), _jsx("button", { type: "button", onClick: () => setActiveSupport((current) => (current + 1) % supportSlides.length), className: "p-2 text-gray-700 transition hover:text-gray-600", children: _jsx(ChevronRight, { className: "h-7 w-7" }) })] }), _jsx("div", { className: "grid gap-4 md:grid-cols-3", children: supportSlides.map((item, index) => (_jsxs("a", { href: item.href, className: `border px-6 py-8 text-center transition ${index === activeSupport
                                                        ? 'border-orange-200 bg-orange-100'
                                                        : 'border-orange-50 bg-orange-50 hover:border-orange-200 hover:bg-orange-100'}`, children: [_jsx("div", { className: "mx-auto h-40 w-40", children: _jsx("img", { src: item.image, alt: item.title, className: "h-full w-full object-cover" }) }), _jsx("p", { className: "mt-3 text-lg font-bold", children: item.title }), _jsx("p", { className: "mt-2", children: item.text }), _jsx("span", { className: "mt-6 inline-block border-2 border-orange-700 px-5 py-1.5 text-sm font-semibold text-orange-700 transition hover:border-orange-600 hover:bg-orange-600 hover:text-white", children: "Ver mais" })] }, item.title))) })] }) })] }) }), _jsx("section", { className: "mt-12 bg-white lg:mt-16 xl:mt-20", children: _jsx("div", { className: `${container}`, children: _jsxs("div", { className: "mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 lg:grid-cols-2", children: [_jsx(NewsHighlightsSection, { title: "Not\u00EDcias", viewAllHref: "/vida-academica/noticias", viewAllInternal: true, items: homepageNewsHighlights, className: "w-full" }), _jsx(NewsHighlightsSection, { title: "Eventos", viewAllHref: "/vida-academica/eventos", viewAllInternal: true, items: homepageEventHighlights, className: "w-full" })] }) }) }), _jsx("section", { className: "bg-slate-50 py-16 lg:py-20", children: _jsx("div", { className: container, children: _jsx(BestBooksSection, { books: homepageBookHighlights, locale: locale, title: getLocaleText(locale, 'Livros em destaque', 'Featured books'), description: getLocaleText(locale, 'Uma seleção de livros do Laboratório Cultural e dos clubes.', 'A curated selection of books from the Cultural Lab and clubs.'), viewAllHref: "/laboratorio-cultural", viewAllLabel: getLocaleText(locale, 'Explorar o laboratório', 'Explore the lab'), detailBaseHref: "/laboratorio-cultural/livros", limit: 4 }) }) }), _jsxs("section", { className: "mb-6 mt-8 bg-white md:mb-8 md:mt-10 lg:mb-10 lg:mt-12 xl:mb-16 xl:mt-16", children: [_jsx("div", { className: "text-center", children: _jsx("h2", { className: "font-heading text-3xl font-bold tracking-tight text-black xl:text-4xl 2xl:text-5xl", children: "Testemunhos" }) }), _jsxs("div", { className: `${container} mx-auto w-full overflow-hidden lg:max-w-2xl`, children: [_jsx("div", { className: "w-full touch-pan-y overflow-hidden pb-2 pt-6 md:pb-4 md:pt-8 lg:pb-4 lg:pt-10 xl:pb-6 xl:pt-12", onTouchStart: handleTestimonialTouchStart, onTouchEnd: handleTestimonialTouchEnd, children: _jsx("div", { className: "flex w-full transition-transform duration-500 ease-out", style: { transform: `translateX(-${activeTestimonial * 100}%)` }, children: testimonialSlides.map((item) => (_jsxs("div", { className: "w-full shrink-0", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute -top-4 text-orange-400 opacity-20 sm:-left-1 sm:-top-5", children: _jsx("svg", { className: "h-20 w-20 sm:h-28 sm:w-28", viewBox: "0 0 24 24", fill: "currentColor", children: _jsx("path", { d: "M23 5.655c-3.008 1.475-4.511 3.208-4.511 5.2 1.282.148 2.342.67 3.18 1.567.838.897 1.257 1.936 1.257 3.116 0 1.254-.407 2.311-1.22 3.171-.814.86-1.837 1.291-3.069 1.291-1.38 0-2.576-.559-3.587-1.678-1.011-1.119-1.516-2.477-1.516-4.075 0-4.794 2.687-8.543 8.061-11.247L23 5.655zm-13.534 0c-3.032 1.475-4.548 3.208-4.548 5.2 1.307.148 2.379.67 3.217 1.567.838.897 1.257 1.936 1.257 3.116 0 1.254-.413 2.311-1.239 3.171C7.327 19.569 6.298 20 5.065 20c-1.38 0-2.57-.559-3.568-1.678-.998-1.119-1.498-2.477-1.498-4.075C-.001 9.453 2.674 5.704 8.023 3l1.442 2.655z" }) }) }), _jsx("blockquote", { className: "text-center text-lg sm:text-lg", children: item.quote })] }), _jsxs("div", { className: "mt-7 flex items-center justify-center", children: [_jsx("img", { src: item.image, alt: item.name, className: "block h-16 w-16 shrink-0 rounded-full border-2 border-white object-cover shadow" }), _jsxs("div", { className: "ml-5 font-medium", children: [_jsx("p", { className: "text-xl", children: item.name }), _jsx("p", { className: "text-base text-gray-500", children: item.role })] })] })] }, item.name))) }) }), _jsxs("div", { className: "flex w-full items-center justify-center", children: [_jsx("button", { type: "button", onClick: showPreviousTestimonial, disabled: activeTestimonial === 0, className: "p-2 text-gray-700 transition hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30", children: _jsx(SliderArrowIcon, { direction: "left" }) }), _jsx("button", { type: "button", onClick: showNextTestimonial, disabled: activeTestimonial === testimonialSlides.length - 1, className: "p-2 text-gray-700 transition hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30", children: _jsx(SliderArrowIcon, { direction: "right" }) })] })] })] })] }), _jsx(Footer, {})] }));
}
export default HomePage;
