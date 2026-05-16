import { getLocaleText, useLocale } from '../i18n/locale.js';
import ClubeCultural from './ClubeCultural';

function Teatro() {
  const { locale } = useLocale();

  return (
    <ClubeCultural
      pageTitle={getLocaleText(locale, 'Teatro', 'Theatre')}
      pageDescription={getLocaleText(
        locale,
        'Página pública do clube de Teatro com notícias, agenda, sessões e eventos em destaque.',
        'Public page for the Theatre club with featured news, agenda, sessions and events.'
      )}
      routePath="/laboratorio-cultural/teatro"
      clubSearchTerms={['teatro']}
    />
  );
}

export default Teatro;
