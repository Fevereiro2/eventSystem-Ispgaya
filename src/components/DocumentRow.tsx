import {
  docAction,
  docBadge,
  docMain,
  docMeta,
  docName,
  docRow,
  docTop
} from '../styles/ui';

type DocumentRowProps = {
  name: string;
  meta: string;
  href: string;
};

function DocumentRow({ name, meta, href }: DocumentRowProps) {
  return (
    <article className={docRow}>
      <div className={docMain}>
        <div className={docTop}>
          <span className={docBadge}>PDF</span>
          <h3 className={docName}>{name}</h3>
        </div>
        <p className={docMeta}>{meta}</p>
      </div>

      <a href={href} className={docAction}>
        Abrir / Download
      </a>
    </article>
  );
}

export default DocumentRow;
