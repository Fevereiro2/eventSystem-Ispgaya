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

type MenuItem = {
  label: string;
  href: string;
  dropdown?: Array<{ label: string; href: string }>;
};

const menuItems: MenuItem[] = [
  { label: 'Instituicao', href: '#' },
  { label: 'Ensino', href: '#' },
  { label: 'Empregabilidade', href: '#' },
  { label: 'Investigacao', href: '#' },
  { label: 'Internacional', href: '#' },
  {
    label: 'Vida Academica',
    href: '#',
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
      {
        label: 'Tuna Academica',
        href: 'https://ispgaya.pt/pt/vida-academica/tuna-academica'
      }
    ]
  }
];

function HeaderNav() {
  return (
    <header className={headerNav}>
      <div className={`${container} ${headerNavInner}`}>
        <a href="#" className={brandWrap}>
          <img src={logo} alt="ISPGAYA" className={brandLogo} />
        </a>

        <nav className={desktopMenu} aria-label="Principal">
          {menuItems.map((item) =>
            item.dropdown ? (
              <div key={item.label} className={navItemGroup}>
                <a href={item.href} className={navLink}>
                  {item.label}
                </a>
                <div className={navDropdownWrap}>
                  <ul className={navDropdownList}>
                    {item.dropdown.map((child) => (
                      <li key={child.label} className={navDropdownItem}>
                        <a className={navDropdownAnchor} href={child.href}>
                          {child.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <a key={item.label} href={item.href} className={navLink}>
                {item.label}
              </a>
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
