import ClubeCultural from './ClubeCultural';

function Teatro() {
  return (
    <ClubeCultural
      pageTitle="Teatro"
      pageDescription="Pagina publica do clube de Teatro com noticias, agenda, sessoes e eventos em destaque."
      routePath="/laboratorio-cultural/teatro"
      clubSearchTerms={['teatro']}
    />
  );
}

export default Teatro;
