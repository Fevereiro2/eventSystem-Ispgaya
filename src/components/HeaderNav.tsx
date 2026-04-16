import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  brandLogo,
  brandWrap,
  container,
  desktopMenu,
  headerNav,
  headerNavInner,
  mobileMenuButton,
  navDropdownAnchor,
  navDropdownItem,
  navDropdownList,
  navDropdownWrap,
  navItemGroup,
  navLink
} from '../styles/ui';
import logo from '../assets/ispgaya-logo.svg';
import logoNegative from '../assets/ispgaya-logo-negative.svg';
import { fetchPublicClubs, InfoCulturaClub } from '../data/infoculturaApi';

type LinkItem = {
  label: string;
  href: string;
  internal?: boolean;
};

type MenuItem = LinkItem & {
  dropdown?: LinkItem[];
};

const defaultLaboratorioDropdown: LinkItem[] = [
  { label: 'Tuna Academica', href: '/laboratorio-cultural/tuna', internal: true },
  {
    label: 'Clube de Leitura',
    href: '/laboratorio-cultural/clube-leitura',
    internal: true
  },
  { label: 'Clube de Teatro', href: '/laboratorio-cultural/teatro', internal: true }
];

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

function mapClubToLinkItem(club: InfoCulturaClub): LinkItem {
  return {
    label: club.name,
    href: getClubHref(club),
    internal: true
  };
}

const menuItems: MenuItem[] = [
  {
    label: 'Instituicao',
    href: 'https://ispgaya.pt/pt/instituicao',
    dropdown: [
      { label: 'O ISPGAYA', href: 'https://ispgaya.pt/pt/instituicao/ispgaya' },
      { label: 'Organizacao', href: 'https://ispgaya.pt/pt/instituicao/organizacao' },
      { label: 'Corpo Docente', href: 'https://ispgaya.pt/pt/instituicao/corpo-docente' },
      { label: 'Qualidade Institucional', href: 'https://ispgaya.pt/pt/instituicao/qualidade' },
      { label: 'Etica e Boas Praticas', href: 'https://ispgaya.pt/pt/instituicao/etica-e-boas-praticas' },
      { label: 'Emprego e Recrutamento', href: 'https://forms.office.com' },
      { label: 'Titulo Especialista', href: 'https://ispgaya.pt/pt/instituicao/titulo-especialista' },
      { label: 'Contactos', href: 'https://ispgaya.pt/pt/instituicao/contactos' }
    ]
  },
  {
    label: 'Ensino',
    href: 'https://ispgaya.pt/pt/ensino',
    dropdown: [
      { label: 'Oferta Formativa', href: 'https://ispgaya.pt/pt/ensino/oferta-formativa' },
      {
        label: 'Programas Avancados',
        href: 'https://ispgaya.pt/pt/ensino/programas-avancados'
      },
      { label: 'Candidaturas', href: 'https://ispgaya.pt/pt/ensino/candidaturas' },
      {
        label: 'Bolsas e Financiamento',
        href: 'https://ispgaya.pt/pt/ensino/bolsas-e-financiamento'
      }
    ]
  },
  {
    label: 'Empregabilidade',
    href: 'https://ispgaya.pt/pt/empregabilidade',
    dropdown: [
      {
        label: 'Estagios e Emprego',
        href: 'https://ispgaya.pt/pt/empregabilidade/estagios-e-emprego'
      },
      { label: 'Alumni', href: 'https://ispgaya.pt/pt/empregabilidade/alumni' }
    ]
  },
  {
    label: 'Investigacao',
    href: 'https://ispgaya.pt/pt/investigacao',
    dropdown: [
      {
        label: 'Publicacoes Cientificas',
        href: 'https://ispgaya.pt/pt/investigacao/publicacoes-cientificas'
      },
      {
        label: 'Atividades Cientificas',
        href: 'https://ispgaya.pt/pt/investigacao/atividades-cientificas'
      },
      { label: 'Biblioteca', href: 'https://ispgaya.pt/pt/investigacao/biblioteca' },
      { label: 'WIDESKILLS', href: 'https://ispgaya.pt/pt/investigacao/wideskills' },
      { label: 'Politecnica', href: 'https://ispgaya.pt/pt/investigacao/politecnica-revista' }
    ]
  },
  {
    label: 'Internacional',
    href: 'https://ispgaya.pt/pt/internacional',
    dropdown: [
      { label: 'Estudantes Internacionais', href: 'https://international.ispgaya.pt/pt' },
      { label: 'Erasmus+', href: 'https://ispgaya.pt/pt/internacional/erasmus+' },
      { label: 'Guia ECTS', href: 'https://ispgaya.pt/pt/internacional/guia-ects' }
    ]
  },
  {
    label: 'Laboratorio Cultural',
    href: '/laboratorio-cultural',
    internal: true,
    dropdown: defaultLaboratorioDropdown
  },
  {
    label: 'Vida Academica',
    href: 'https://ispgaya.pt/pt/vida-academica',
    dropdown: [
      { label: 'Noticias', href: 'https://ispgaya.pt/pt/vida-academica/noticias' },
      { label: 'Eventos', href: 'https://ispgaya.pt/pt/vida-academica/eventos' },
      {
        label: 'Estudante ISPGAYA',
        href: 'https://ispgaya.pt/pt/vida-academica/estudante-ispgaya'
      },
      {
        label: 'Associacao de Estudantes',
        href: 'https://ispgaya.pt/pt/vida-academica/associacao-estudantes'
      },
      { label: 'Tuna Academica', href: 'https://ispgaya.pt/pt/vida-academica/tuna-academica' }
    ]
  }
];

function renderMenuLink(item: LinkItem, className: string) {
  return item.internal ? (
    <Link to={item.href} className={className}>
      {item.label}
    </Link>
  ) : (
    <a href={item.href} className={className}>
      {item.label}
    </a>
  );
}

type HeaderNavProps = {
  transparent?: boolean;
};

function HeaderNav({ transparent = false }: HeaderNavProps) {
  const [laboratorioDropdown, setLaboratorioDropdown] = useState<LinkItem[]>(
    defaultLaboratorioDropdown
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadClubDropdown() {
      try {
        const clubs = await fetchPublicClubs();
        if (!active) return;

        setLaboratorioDropdown(
          clubs.length > 0 ? clubs.map(mapClubToLinkItem) : defaultLaboratorioDropdown
        );
      } catch {
        if (!active) return;
        setLaboratorioDropdown(defaultLaboratorioDropdown);
      }
    }

    void loadClubDropdown();

    return () => {
      active = false;
    };
  }, []);

  const resolvedMenuItems = menuItems.map((item) =>
    item.label === 'Laboratorio Cultural'
      ? { ...item, dropdown: laboratorioDropdown }
      : item
  );

  const rootClassName = transparent
    ? 'border-b border-white/10 bg-transparent text-white'
    : headerNav;
  const desktopMenuClassName = transparent
    ? 'relative z-[80] hidden items-center gap-7 xl:flex'
    : desktopMenu;
  const innerClassName = transparent
    ? 'flex items-center justify-between gap-6 py-4'
    : headerNavInner;
  const linkClassName = transparent
    ? 'text-[15px] font-medium text-white transition-colors hover:text-[#f7c47a]'
    : navLink;
  const dropdownWrapClassName = transparent
    ? 'right-0 z-[90] absolute hidden w-72 pt-2 opacity-0 transition-opacity group-hover:block group-hover:opacity-100 group-focus-within:block group-focus-within:opacity-100'
    : navDropdownWrap;
  const mobileButtonClassName = transparent
    ? 'inline-flex items-center rounded-lg border border-white/25 bg-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:border-white hover:bg-white/10 xl:hidden'
    : mobileMenuButton;
  const logoSrc = transparent ? logoNegative : logo;
  const dropdownListClassName = transparent
    ? 'rounded border border-gray-100 bg-white px-4 py-3 text-slate-900 shadow-xl space-y-3'
    : navDropdownList;
  const dropdownItemClassName = transparent
    ? 'flex items-center font-medium text-slate-900 hover:text-[#dd8609] hover:underline underline-offset-2'
    : navDropdownItem;
  const dropdownAnchorClassName = transparent
    ? 'inline-block w-full py-0.5 text-inherit'
    : navDropdownAnchor;

  return (
    <header className={rootClassName}>
      <div className={`${container} ${innerClassName}`}>
        <Link to="/" className={brandWrap}>
          <img src={logoSrc} alt="ISPGAYA" className={brandLogo} />
        </Link>

        <nav className={desktopMenuClassName} aria-label="Principal">
          {resolvedMenuItems.map((item) =>
            item.dropdown ? (
              <div key={item.label} className={navItemGroup}>
                {renderMenuLink(item, linkClassName)}
                <div className={dropdownWrapClassName}>
                  <ul className={dropdownListClassName}>
                    {item.dropdown.map((child) => (
                      <li key={child.label} className={dropdownItemClassName}>
                        {renderMenuLink(child, dropdownAnchorClassName)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div key={item.label}>{renderMenuLink(item, linkClassName)}</div>
            )
          )}
        </nav>

        <button
          type="button"
          className={mobileButtonClassName}
          onClick={() => setIsMobileMenuOpen((value) => !value)}
          aria-expanded={isMobileMenuOpen}
          aria-label="Abrir menu"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {isMobileMenuOpen ? (
        <div
          className={`border-t px-4 py-4 lg:hidden ${
            transparent
              ? 'border-white/10 bg-[#10263b]/96 text-white backdrop-blur-md'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className={`${container} grid gap-5`}>
            {resolvedMenuItems.map((item) => (
              <div key={item.label} className="space-y-2">
                {renderMenuLink(
                  item,
                  transparent
                    ? 'text-sm font-semibold text-white'
                    : 'text-sm font-semibold text-slate-900'
                )}
                {item.dropdown ? (
                  <div className="grid gap-2 pl-3">
                    {item.dropdown.map((child) => (
                      <div key={child.label}>
                        {renderMenuLink(
                          child,
                          transparent
                            ? 'text-sm text-white/80'
                            : 'text-sm text-slate-600'
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default HeaderNav;
