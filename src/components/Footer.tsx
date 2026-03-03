import {
  container,
  footerBrand,
  footerBrandText,
  footerBottom,
  footerBottomInner,
  footerBottomLinks,
  footerCertIcon,
  footerCertRow,
  footerGrid,
  footerLink,
  footerList,
  footerLogo,
  footerTitle,
  footerWrap
} from '../styles/ui';
import iso14001 from '../assets/ISO-14001.svg';
import iso21001 from '../assets/ISO-21001.svg';
import iso9001 from '../assets/ISO-9001.svg';
import logoNegative from '../assets/ispgaya-logo-negative.svg';

const columns = [
  {
    title: 'Instituicao',
    items: ['Sobre', 'Mensagem da Direcao', 'Campus', 'Qualidade']
  },
  {
    title: 'Ensino',
    items: ['Licenciaturas', 'Pos-graduacoes', 'Formacao Executiva', 'Candidaturas']
  },
  {
    title: 'Investigacao',
    items: ['Centros', 'Projetos', 'Publicacoes', 'Parcerias']
  }
];

function Footer() {
  return (
    <footer className={footerWrap}>
      <div className={`${container} ${footerGrid}`}>
        <section className={footerBrand}>
          <img src={logoNegative} alt="ISPGAYA" className={footerLogo} />
          <p className={footerBrandText}>
            Comunidade academica orientada para ensino superior, inovacao aplicada
            e transferencia de conhecimento para a sociedade.
          </p>
          <div className={footerCertRow}>
            <img src={iso9001} alt="Certificacao ISO 9001" className={footerCertIcon} />
            <img
              src={iso14001}
              alt="Certificacao ISO 14001"
              className={footerCertIcon}
            />
            <img
              src={iso21001}
              alt="Certificacao ISO 21001"
              className={footerCertIcon}
            />
          </div>
        </section>

        {columns.map((column) => (
          <section key={column.title}>
            <h4 className={footerTitle}>{column.title}</h4>
            <ul className={footerList}>
              {column.items.map((item) => (
                <li key={item}>
                  <a href="#" className={footerLink}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className={footerBottom}>
        <div className={`${container} ${footerBottomInner}`}>
          <p>© 2026 ISPGAYA Placeholder. Todos os direitos reservados.</p>
          <div className={footerBottomLinks}>
            <a href="#" className={footerLink}>
              Termos
            </a>
            <a href="#" className={footerLink}>
              Privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
