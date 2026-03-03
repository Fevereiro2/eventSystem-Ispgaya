import {
  container,
  topBar,
  topBarGroup,
  topBarInner,
  topBarLink,
  topBarLocale,
  topBarLocaleWrap,
  topBarSeparator
} from '../styles/ui';

const leftLinks = ['Inforestudante', 'Infordocente', 'Email', 'Horarios'];
const rightLinks = ['Perguntas Frequentes', 'Candidatura Online', 'Contactos'];

function TopBar() {
  return (
    <div className={topBar}>
      <div className={`${container} ${topBarInner}`}>
        <div className={topBarGroup}>
          {leftLinks.map((item) => (
            <a key={item} href="#" className={topBarLink}>
              {item}
            </a>
          ))}
        </div>

        <div className={topBarGroup}>
          {rightLinks.map((item) => (
            <a key={item} href="#" className={topBarLink}>
              {item}
            </a>
          ))}
          <span className={topBarLocaleWrap}>
            <a href="#" className={topBarLocale}>
              PT
            </a>
            <span className={topBarSeparator}>|</span>
            <a href="#" className={topBarLocale}>
              EN
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}

export default TopBar;
