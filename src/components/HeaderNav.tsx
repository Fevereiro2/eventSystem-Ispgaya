import {
  brandLogo,
  brandWrap,
  container,
  desktopMenu,
  headerNav,
  headerNavInner,
  mobileMenuButton,
  navLink
} from '../styles/ui';
import logo from '../assets/ispgaya-logo.svg';

const menuItems = [
  'Instituicao',
  'Ensino',
  'Investigacao',
  'Internacional',
  'Noticias',
  'Contactos'
];

function HeaderNav() {
  return (
    <header className={headerNav}>
      <div className={`${container} ${headerNavInner}`}>
        <a href="#" className={brandWrap}>
          <img src={logo} alt="ISPGAYA" className={brandLogo} />
        </a>

        <nav className={desktopMenu} aria-label="Principal">
          {menuItems.map((item) => (
            <a key={item} href="#" className={navLink}>
              {item}
            </a>
          ))}
        </nav>

        <button type="button" className={mobileMenuButton}>
          Menu
        </button>
      </div>
    </header>
  );
}

export default HeaderNav;
