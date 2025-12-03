# LTC Events (Java 25 + JavaFX 25)

## Visao Geral
- Aplicacao desktop para gestao de eventos, participantes, sessoes e recursos, com UI JavaFX.
- Autenticacao segura com BCrypt, migracao transparente de passwords antigas e gestao de sessao em memoria.
- Painel administrativo para gerir participantes, eventos, sessoes e recursos; calendario mensal com detalhes por evento.
- Base de dados SQLite local (`eventos.db`) pronta a usar; logging de acoes em `logs_app.txt`.

## Tecnologias
- Java 25, JavaFX 25
- Maven 3.8+
- SQLite (sqlite-jdbc)
- BCrypt (org.mindrot), dotenv-java
- SLF4J simple (logging console) + logging aplicacional em ficheiro

## Estrutura de Pastas (principal)
```
src/main/java/ltc/events/
  Main.java
  Modules/
    db.java                # liga SQLite
    Window.java            # janela principal e navegacao
    account/               # screens de conta
    admin/                 # screens administrativas
    connection/            # DAOs (EventDB, ParticipantDB, SessionDB, ResourcesDB, ...)
    ui/                    # settings, alteracao de password
    util/                  # LoggingUtil, NifUtil
    visual/                # Login, Register, CalendarEventoView, CustomAlert, StyleUtil
  classes/                 # modelos: Event, Participant, Session, Resources, State, Types, etc.

database/                  # scripts SQL de apoio (PostgreSQL/SQLite)
eventos.db                 # base SQLite de exemplo
relatorio_admin.txt        # contagens rapidas (participantes/eventos/recursos/sessoes)
logs_app.txt               # registo de acoes
TemplateTrabalhos.docx     # template de relatorio
```

## Funcionalidades
- Modo admin direto: a aplicacao arranca autenticada como administrador (sem ecras de login/registo) com acesso imediato ao painel.
- Login/Logout com BCrypt e migracao automatica de passwords antigas em texto simples.
- Registo de utilizadores, validacao de email unico e validacao de NIF (`NifUtil`).
- Listagem e edicao de participantes (admin), incluindo tipo/permissoes.
- Gestao de eventos: criar/listar/editar com estado, imagem e datas; associacao a sessoes e recursos.
- Calendario mensal (`CalendarEventoView`) e lista de eventos com filtros (ativos/antigos, ano/estado).
- Gestao de sessoes e participacoes (`SessionDB`, `SessionParticipantDB`).
- Logging aplicacional (`LoggingUtil` -> `logs_app.txt`) e ficheiro de contagem `relatorio_admin.txt`.

## Pre-requisitos
- Java 25 instalado e `JAVA_HOME` configurado.
- Maven 3.8+ no PATH.
- Ambiente Windows/Linux/Mac com permissao de criar ficheiros (para logs e DB).

## Configuracao Rapida
1) Garantir Java/Maven instalados.
2) Base de dados: por defeito usa SQLite local. O ficheiro `eventos.db` ja vem preparado. Se quiser recriar:
   - Usar `sqlite.sql` (SQLite) ou `Database.sql` (estrutura equivalente).
3) Variaveis de ambiente: `.env` contem `URL=jdbc:sqlite:eventos.db`. Ajuste se mover a BD.

## Como Executar
```
mvn clean javafx:run
```
- O plugin `javafx-maven-plugin` injeta os modulos JavaFX necessarios.
- Se precisar de opcoes adicionais, veja `pom.xml` (ha flags `--enable-native-access`).

## Testes
- Comando: `mvn test` (no momento nao ha suite de testes automatizados criada).

## Notas e Limitacoes
- Sessao admin direta (admin@local, id 1); ecras de login/registo nao sao usados.
- O README anterior referia PostgreSQL; a versao atual usa SQLite por defeito. Para PostgreSQL, adapte `db.java` e a string de conexao no `.env`.
- O logging grava em `logs_app.txt` no diretorio raiz; evitar caminhos apenas de leitura.
- UI e strings em PT; internacionalizacao pode ser adicionada (suggestion).
