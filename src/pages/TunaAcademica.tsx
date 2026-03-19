import ClubeCultural from './ClubeCultural';

function TunaAcademica() {
  return (
    <ClubeCultural
      pageTitle="Tuna Academica"
      pageDescription="Pagina publica da Tuna Academica com noticias, eventos, sessoes e atividades do clube."
      routePath="/laboratorio-cultural/tuna"
      clubSearchTerms={['tuna']}
    />
  );
}

export default TunaAcademica;
