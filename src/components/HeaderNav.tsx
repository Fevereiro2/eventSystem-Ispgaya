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

type LinkItem = {
  label: string;
  href: string;
  internal?: boolean;
};

type MenuItem = LinkItem & {
  dropdown?: LinkItem[];
};

const menuItems: MenuItem[] = [
  {
    label: 'Instituicao',
    href: 'https://ispgaya.pt/pt/instituicao',
    dropdown: [
      { label: 'O ISPGAYA', href: 'https://ispgaya.pt/pt/instituicao/ispgaya' },
      { label: 'Organizacao', href: 'https://ispgaya.pt/pt/instituicao/organizacao' },
      { label: 'Qualidade', href: 'https://ispgaya.pt/pt/instituicao/qualidade' },
      { label: 'Legislacao', href: 'https://ispgaya.pt/pt/instituicao/legislacao' },
      { label: 'Recrutamento', href: 'https://ispgaya.pt/pt/instituicao/recrutamento' },
      { label: 'Instalacoes', href: 'https://ispgaya.pt/pt/instituicao/instalacoes' },
      { label: 'Visita Virtual', href: 'https://ispgaya.pt/pt/instituicao/visita-virtual' },
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
      },
      {
        label: 'Academia Cisco',
        href: 'https://ispgaya.pt/pt/ensino/oferta-formativa/academia-cisco'
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
    dropdown: [
      { label: 'Tuna Academica', href: '/laboratorio-cultural/tuna', internal: true },
      {
        label: 'Clube de Leitura',
        href: '/laboratorio-cultural/clube-leitura',
        internal: true
      },
      { label: 'Teatro', href: '/laboratorio-cultural/teatro', internal: true }
    ]
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

function HeaderNav() {
  return (
    <header className={headerNav}>
      <div className={`${container} ${headerNavInner}`}>
        <Link to="/" className={brandWrap}>
          <img src={logo} alt="ISPGAYA" className={brandLogo} />
        </Link>

        <nav className={desktopMenu} aria-label="Principal">
          {menuItems.map((item) =>
            item.dropdown ? (
              <div key={item.label} className={navItemGroup}>
                {renderMenuLink(item, navLink)}
                <div className={navDropdownWrap}>
                  <ul className={navDropdownList}>
                    {item.dropdown.map((child) => (
                      <li key={child.label} className={navDropdownItem}>
                        {renderMenuLink(child, navDropdownAnchor)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div key={item.label}>{renderMenuLink(item, navLink)}</div>
            )
          )}
        </nav>

        <button type="button" className={mobileMenuButton}>
          Menu
        </button>
      </div>
    </header>
  );
}

export default HeaderNav;
