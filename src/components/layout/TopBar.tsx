import {
  container,
  topBar,
  topBarGroup,
  topBarInner,
  topBarLink,
  topBarLocaleActive,
  topBarLocale,
  topBarLocaleWrap,
  topBarRightGroup,
  topBarRightLinks
} from '../../styles/ui';
import { useLocale, getLocaleText } from '../../i18n/locale.js';

const leftLinks = [
  {
    label: 'Inforestudante',
    href: 'https://inforestudante.ispgaya.pt',
    target: '_blank',
    rel: 'noindex nofollow'
  },
  {
    label: 'Infordocente',
    href: 'https://infordocente.ispgaya.pt',
    target: '_blank',
    rel: 'noindex nofollow'
  },
  {
    label: 'Infocultura',
    href: '/infocultura',
    target: '_blank',
    rel: 'noindex nofollow'
  },
  {
    label: 'Email',
    href: 'https://outlook.office.com',
    target: '_blank',
    rel: 'noindex nofollow'
  },
  {
    label: 'Horarios',
    href: 'https://horarios.ispgaya.pt/geral/',
    target: '_blank',
    rel: 'noindex nofollow'
  }
];

const rightLinks = [
  {
    label: 'Perguntas Frequentes',
    href: 'https://ispgaya.pt/pt/perguntas-frequentes'
  },
  {
    label: 'Candidatura Online',
    href: 'https://inforestudante.ispgaya.pt/nonio/security/preRegisto.do?origem=CANDIDATURAS',
    target: '_blank',
    rel: 'noopener noreferrer'
  },
  {
    label: 'Contactos',
    href: 'https://ispgaya.pt/pt/instituicao/contactos'
  }
];

type TopBarProps = {
  transparent?: boolean;
};

function TopBar({ transparent = false }: TopBarProps) {
  const { locale, setLocale } = useLocale();
  const rootClassName = transparent
    ? 'hidden xl:block bg-transparent text-white'
    : topBar;
  const linkClassName = transparent
    ? 'text-white/90 transition-colors hover:text-white'
    : topBarLink;
  const localeActiveClassName = transparent
    ? 'font-bold text-white transition-colors hover:text-white'
    : topBarLocaleActive;
  const localeClassName = transparent
    ? 'text-white/80 transition-colors hover:text-white'
    : topBarLocale;
  const dividerClassName = transparent ? 'border-white/10' : 'border-slate-200';
  const localeLabel = getLocaleText(locale, 'Idioma', 'Language');

  return (
    <div className={rootClassName}>
      <div className={`${container} ${topBarInner}`}>
        <div className={topBarGroup}>
          {leftLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.target}
              rel={item.rel}
              className={linkClassName}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className={topBarRightGroup}>
          <div className={topBarRightLinks}>
            {rightLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.target}
                rel={item.rel}
                className={linkClassName}
              >
                {item.label}
              </a>
            ))}
          </div>
          <span className={topBarLocaleWrap}>
            <button
              type="button"
              title={localeLabel}
              aria-pressed={locale === 'pt'}
              className={locale === 'pt' ? localeActiveClassName : localeClassName}
              onClick={() => setLocale('pt')}
            >
              PT
            </button>
            <button
              type="button"
              title={localeLabel}
              aria-pressed={locale === 'en'}
              className={locale === 'en' ? localeActiveClassName : localeClassName}
              onClick={() => setLocale('en')}
            >
              EN
            </button>
          </span>
        </div>
      </div>
      <hr className={dividerClassName} />
    </div>
  );
}

export default TopBar;
