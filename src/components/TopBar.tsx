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
} from '../styles/ui';

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

function TopBar() {
  return (
    <div className={topBar}>
      <div className={`${container} ${topBarInner}`}>
        <div className={topBarGroup}>
          {leftLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.target}
              rel={item.rel}
              className={topBarLink}
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
                className={topBarLink}
              >
                {item.label}
              </a>
            ))}
          </div>
          <span className={topBarLocaleWrap}>
            <a
              href="https://ispgaya.pt/pt/investigacao/publicacoes-cientificas"
              title="pt"
              rel="alternate"
              hrefLang="pt"
              className={topBarLocaleActive}
            >
              PT
            </a>
            <a
              href="https://ispgaya.pt/en/investigacao/publicacoes-cientificas"
              title="en"
              rel="alternate"
              hrefLang="en"
              className={topBarLocale}
            >
              EN
            </a>
          </span>
        </div>
      </div>
      <hr />
    </div>
  );
}

export default TopBar;
