import { Facebook, Instagram, Linkedin } from 'lucide-react';
import {
  footerBottomContainer,
  footerBottomCopyright,
  footerBottomGaia,
  footerBottomInner,
  footerBottomLink,
  footerBottomLinks,
  footerBottomSeparator,
  footerBottomText,
  footerBottomUpdated,
  footerBrand,
  footerCertIcon,
  footerCertRow,
  footerCol,
  footerContactAddress,
  footerContactEmail,
  footerContactHint,
  footerContactPhone,
  footerContactStrong,
  footerFollowTitle,
  footerGrid,
  footerLink,
  footerList,
  footerListItem,
  footerLogo,
  footerSection,
  footerSocialIcon,
  footerSocialLink,
  footerSocialLinks,
  footerSrOnly,
  footerSubTitle,
  footerTitle,
  footerWrap
} from '../../styles/ui';
import iso14001 from '../../assets/ISO-14001.svg';
import iso21001 from '../../assets/ISO-21001.svg';
import iso9001 from '../../assets/ISO-9001.svg';
import gaiaSkyline from '../../assets/gaia-skyline.webp';
import logoNegative from '../../assets/ispgaya-logo-negative.svg';
import { useLocale, getLocaleText } from '../../i18n/locale.js';

const ensinoLinks = [
  'CTeSP',
  'Licenciaturas',
  'Mestrados',
  'Pos-Graduacoes',
  'Candidaturas',
  'Bolsas e Financiamento',
  'Programas Avancados'
];

const hubLinks = [
  'Inforestudante',
  'Infordocente',
  'Email',
  'Wi-Fi',
  'Password',
  'Cartao ISPGAYA',
  'Identidade Visual'
];

const interesseLinks = [
  'DGES',
  'A3ES',
  'Ciencia Vitae',
  'Governo de Portugal',
  'Projetos Cofinanciados',
  'Repositorio de Documentos'
];

function Footer() {
  const { locale } = useLocale();
  const text = {
    follow: getLocaleText(locale, 'Segue-nos', 'Follow us'),
    ensino: getLocaleText(locale, 'Ensino', 'Study'),
    interest: getLocaleText(locale, 'Links de Interesse', 'Useful Links'),
    contacts: getLocaleText(locale, 'Contactos', 'Contacts'),
    callHint: getLocaleText(
      locale,
      'O valor da chamada corresponde ao valor de uma chamada para a rede fixa, em funcao do seu plano tarifario.',
      'Call charges depend on your tariff plan and are billed as a fixed-line call.'
    ),
    updated: getLocaleText(locale, 'Atualizado em 02/03/2026 - 12:28', 'Updated on 02/03/2026 - 12:28'),
    terms: getLocaleText(locale, 'Termos e Condicoes', 'Terms and Conditions'),
    privacy: getLocaleText(locale, 'Politica de Privacidade', 'Privacy Policy')
  };

  return (
    <footer className={footerWrap}>
      <section className={footerSection}>
        <div className={footerGrid}>
          <div className={footerBrand}>
            <img src={logoNegative} width={175} height={54} className={footerLogo} alt="ISPGAYA" />
            <p className={footerFollowTitle}>{text.follow}</p>
            <div className={footerSocialLinks}>
              <a href="#" className={footerSocialLink}>
                <span className={footerSrOnly}>ISPGAYA Facebook</span>
                <Facebook className={footerSocialIcon} aria-hidden="true" />
              </a>
              <a href="#" className={footerSocialLink}>
                <span className={footerSrOnly}>ISPGAYA Instagram</span>
                <Instagram className={footerSocialIcon} aria-hidden="true" />
              </a>
              <a href="#" className={footerSocialLink}>
                <span className={footerSrOnly}>ISPGAYA LinkedIn</span>
                <Linkedin className={footerSocialIcon} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className={footerCol}>
            <p className={footerTitle}>{text.ensino}</p>
            <ul className={footerList}>
              {ensinoLinks.map((item) => (
                <li key={item} className={footerListItem}>
                  <a href="#" className={footerLink}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={footerCol}>
            <p className={footerTitle}>ISPGAYA HUB</p>
            <ul className={footerList}>
              {hubLinks.map((item) => (
                <li key={item} className={footerListItem}>
                  <a href="#" className={footerLink}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={footerCol}>
            <p className={footerSubTitle}>{text.interest}</p>
            <ul className={footerList}>
              {interesseLinks.map((item) => (
                <li key={item} className={footerListItem}>
                  <a href="#" className={footerLink}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={footerCol}>
            <p className={footerTitle}>{text.contacts}</p>
            <address className={footerContactAddress}>
              <p className={footerContactStrong}>Av. dos Descobrimentos, 333</p>
              <p className={footerContactStrong}>4400-103 Santa Marinha - V.N.Gaia</p>
              <p className={footerContactPhone}>
                (+351) 223 745 730 <span className={footerContactHint}>{text.callHint}</span>
              </p>
              <p className={footerContactEmail}>info@ispgaya.pt</p>
            </address>

            <div className={footerCertRow}>
              <img className={footerCertIcon} src={iso9001} alt="ISO 9001" width={142} height={155} />
              <img className={footerCertIcon} src={iso21001} alt="ISO 21001" width={404} height={446} />
              <img className={footerCertIcon} src={iso14001} alt="ISO 14001" width={404} height={446} />
            </div>
          </div>
        </div>

        <div className={footerBottomContainer}>
          <div className={footerBottomInner}>
            <div className={footerBottomText}>
              <span className={footerBottomCopyright}>© 2026 Instituto Superior Politecnico Gaya</span>
              <span className={footerBottomUpdated}>{text.updated}</span>
            </div>

            <div className={footerBottomLinks}>
              <a href="#" className={footerBottomLink}>
                {text.terms}
              </a>
              <span className={footerBottomSeparator}>/</span>
              <a href="#" className={footerBottomLink}>
                {text.privacy}
              </a>
            </div>
          </div>
        </div>
      </section>

      <img src={gaiaSkyline} width={795} height={140} className={footerBottomGaia} alt="Vila Nova de Gaia" />
    </footer>
  );
}

export default Footer;
