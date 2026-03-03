import {
  breadcrumbsCurrent,
  breadcrumbsInner,
  breadcrumbsLink,
  breadcrumbsWrap,
  container
} from '../styles/ui';

function Breadcrumbs() {
  return (
    <div className={breadcrumbsWrap}>
      <div className={`${container} ${breadcrumbsInner}`}>
        <a href="#" className={breadcrumbsLink}>
          Investigacao
        </a>
        <span>/</span>
        <span className={breadcrumbsCurrent}>Publicacoes Cientificas</span>
      </div>
    </div>
  );
}

export default Breadcrumbs;
