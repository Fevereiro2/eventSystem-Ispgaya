import ClubeCultural from './ClubeCultural';

function ClubeLeitura() {
  return (
    <ClubeCultural
      pageTitle="Clube de Leitura"
      pageDescription="Pagina publica do Clube de Leitura com livros, sessoes, noticias e eventos ligados ao clube."
      routePath="/laboratorio-cultural/clube-leitura"
      clubSearchTerms={['leitura']}
    />
  );
}

export default ClubeLeitura;
