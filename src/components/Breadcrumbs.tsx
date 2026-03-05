import { Link } from 'react-router-dom';
import {
  breadcrumbsAnchor,
  breadcrumbsItemCurrent,
  breadcrumbsItemMuted,
  breadcrumbsList,
  breadcrumbsNav,
  breadcrumbsSlash,
  heroIntroText,
  heroIntroTitle,
  heroIntroWrap,
  heroPatternSection,
  heroPatternWrap
} from '../styles/ui';

type BreadcrumbsProps = {
  title?: string;
  description?: string;
  parentLabel?: string;
  parentHref?: string;
  currentLabel?: string;
  currentHref?: string;
};

function renderBreadcrumbLink(href: string, label: string, className: string) {
  const isExternal = href.startsWith('http://') || href.startsWith('https://');

  return isExternal ? (
    <a href={href} className={className}>
      {label}
    </a>
  ) : (
    <Link to={href} className={className}>
      {label}
    </Link>
  );
}

function Breadcrumbs({
  title = 'Publicacoes Cientificas',
  description = 'O ISPGAYA desenvolve investigacao cientifica nas diversas areas em que oferece formacao, resultando em publicacoes, livros, capitulos e artigos cientificos.',
  parentLabel = 'Investigacao',
  parentHref = '/',
  currentLabel = 'Publicacoes Cientificas',
  currentHref = '/'
}: BreadcrumbsProps) {
  return (
    <div className={heroPatternWrap}>
      <section className={heroPatternSection}>
        <nav className={breadcrumbsNav} aria-label="Breadcrumb">
          <ol role="list" className={breadcrumbsList}>
            <li>
              <div className={breadcrumbsItemMuted}>
                {renderBreadcrumbLink(parentHref, parentLabel, breadcrumbsAnchor)}
                <span className={breadcrumbsSlash}>/</span>
              </div>
            </li>
            <li>
              <div className={breadcrumbsItemCurrent}>
                {renderBreadcrumbLink(currentHref, currentLabel, breadcrumbsAnchor)}
              </div>
            </li>
          </ol>
        </nav>

        <div className={heroIntroWrap}>
          <h1 className={heroIntroTitle}>{title}</h1>
          <p className={heroIntroText}>{description}</p>
        </div>
      </section>
    </div>
  );
}

export default Breadcrumbs;
