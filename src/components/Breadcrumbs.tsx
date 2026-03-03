import {
  breadcrumbsAnchor,
  breadcrumbsItemCurrent,
  breadcrumbsItemMuted,
  breadcrumbsList,
  breadcrumbsNav,
  breadcrumbsSlash,
  container,
  heroIntroText,
  heroIntroTitle,
  heroIntroWrap,
  heroPatternSection,
  heroPatternWrap
} from '../styles/ui';

type BreadcrumbsProps = {
  title?: string;
  description?: string;
};

function Breadcrumbs({
  title = 'Publicacoes Cientificas',
  description = 'O ISPGAYA desenvolve investigacao cientifica nas diversas areas em que oferece formacao, resultando em publicacoes, livros, capitulos e artigos cientificos.'
}: BreadcrumbsProps) {
  return (
    <div className={heroPatternWrap}>
      <section className={`${container} ${heroPatternSection}`}>
        <nav className={breadcrumbsNav} aria-label="Breadcrumb">
          <ol role="list" className={breadcrumbsList}>
            <li>
              <div className={breadcrumbsItemMuted}>
                <a href="#" className={breadcrumbsAnchor}>
                  Investigacao
                </a>
                <span className={breadcrumbsSlash}>/</span>
              </div>
            </li>
            <li>
              <div className={breadcrumbsItemCurrent}>
                <a href="#" className={breadcrumbsAnchor} aria-current="page">
                  Publicacoes Cientificas
                </a>
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
