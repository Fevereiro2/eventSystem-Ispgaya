import { Download } from 'lucide-react';
import {
  docBadge,
  docDownloadAction,
  docDownloadIcon,
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
      <span className={docBadge}>PDF</span>

      <div className={docMain}>
        <div className={docTop}>
          <h3 className={docName}>{name}</h3>
        </div>
        <p className={docMeta}>{meta}</p>
      </div>

      <a href={href} className={docDownloadAction} aria-label={`Download ${name}`}>
        <Download className={docDownloadIcon} />
      </a>
    </article>
  );
}

export default DocumentRow;
