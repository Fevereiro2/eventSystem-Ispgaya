import {
  container,
  topBar,
  topBarGroup,
  topBarInner,
  topBarLink,
  topBarLocale,
  topBarLogo
} from '../styles/ui';
import logoNegative from '../assets/ispgaya-logo-negative.svg';

const leftLinks = ['PT', 'EN'];
const rightLinks = ['Email', 'Inforestudante', 'Biblioteca'];

function TopBar() {
  return (
    <div className={topBar}>
      <div className={`${container} ${topBarInner}`}>
        <div className={topBarGroup}>
          <img src={logoNegative} alt="ISPGAYA" className={topBarLogo} />
        </div>
        <div className={topBarGroup}>
          <span className={topBarLocale}>
            {leftLinks.map((item, index) => (
              <a key={item} href="#" className={topBarLink}>
                {item}
                {index === 0 ? ' |' : ''}
              </a>
            ))}
          </span>
          {rightLinks.map((item) => (
            <a key={item} href="#" className={topBarLink}>
              {item}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TopBar;
