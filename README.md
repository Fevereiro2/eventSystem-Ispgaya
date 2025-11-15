 # 📘LTC Events   — Desktop Manager (Java 25 + JavaFX 25)

LTC Events é uma aplicação desktop desenvolvida em Java 25 com JavaFX 25, utilizando Maven e acesso a base de dados PostgreSQL através de variáveis de ambiente com dotenv.

O objetivo da aplicação é gerir eventos, participantes, sessões, recursos e permitir um painel exclusivo para administradores.

# 🚀Tecnologias Utilizadas 

| Tecnologia | Versão | Description |
|------------|--------| ----------- |
| Java       | 25     |    Linguagem principal         |
| JavaFX     | 25     |      Interface gráfica (UI)       |
 | Maven      |   3.8+    | Gestão de dependências
| PostgreSQL      |     14+      | Base de dados
| Dotenv (Java)      |   5.2      | Gestão segura de credenciais
| BCrypt (Mindrot)    |     Atual      | Hash seguro de passwords

# 📁 Estrutura Geral do Projeto
```
src/
└── main/java/ltc/events/
├── classes/
│     ├── Event.java
│     ├── Participant.java
│     ├── Types.java
│     ├── State.java
│     └── Session.java
│
├── classes/hashs/
│     ├── AuthService.java
│     ├── PasswordUtil.java
│     └── SessionEntry.java
│
├── Modules/
│     ├── db.java
│     ├── Permissions.java
│     ├── Window.java
│     └── visual/
│           ├── Login.java
│           └── Register.java
│
├── Modules/con/
│     ├── EventDB.java
│     ├── ParticipantDB.java
│     ├── TypesDB.java
│     └── SessionDB.java
│
└── Main.java
```
# 🔌 Conexão à Base de Dados (dotenv)
O projeto usa um ficheiro .env para guardar as credenciais de forma segura:
```
URL=jdbc:postgresql://HOST:5432/NOME_BD
DB_USER=postgres
DB_PASSWORD=****
```

# 🔧 Classe db.java
Conecta automaticamente ao PostgreSQL:
``` java
Dotenv env = Dotenv.load();
String url = env.get("URL");
String user = env.get("DB_USER");
String pass = env.get("DB_PASSWORD");
conn = DriverManager.getConnection(url, user, pass);
```

# 🔐 Autenticação + BCrypt + Sessões

### ✔ Passwords são guardadas com BCrypt
 - Hash automático no registo
 - Migração automática de passwords antigas em plaintext

### ✔ Sistema de Login (AuthService)
- Valida hash
- Carrega participante + tipo (Types)
- Retorna objeto Participant

### ✔ Sistema de Sessão (SessionEntry)
```
SessionEntry.login(user);
SessionEntry.logout();
SessionEntry.isLogged();
SessionEntry.getUser();
```

# 🔑 Sistema de Permissões (Permissions)

Define acessos:
- Admin
- Moderador
- Participante

```java
public static boolean isAdmin() {
return SessionEntry.getUser().getType().getName().equalsIgnoreCase("admin");
}
```

# 🖼 JavaFX UI — Janela Principal (Window)

A UI principal inclui:

- Navbar estilo macOS
- Login / Register
- Cards dos eventos com imagem
- Tamanhos dinâmicos consoante data do evento
- Refresh automático após login
- Painel Admin para administradores

# 🧱 Cards dos Eventos (Modo "Windows 8 Tiles")

Cada Event aparece como:

- Cartão dinâmico
- Imagem
- Nome
- Data
- Estado com cor (badge)
- Tamanho adaptado consoante proximidade do evento

# 🔧 Painel Admin

Disponível só para:

Admin

Moderador

Inclui:

✔ Participantes

— Tabela com todos os participantes
— Duplo clique abre editor

✔ Sessões

— (A implementar)

✔ Eventos

— (A implementar)

✔ Recursos

— (A implementar)

# 🧩 Registo de Participantes (Register)

Campos incluídos:

- Nome
- Email
- Telefone
- Password
- Tipo = 2 (participante) sempre
- Hash automático de password
- Verificação de email duplicado
- Inserção no PostgreSQL

# 🗄 Access Layer (DB)

Cada tabela da BD tem uma classe DB:
- EventDB

Carrega todos os eventos.
- ParticipantDB

Registo, login e listagem de participantes.
- SessionDB

Listagem de sessões (a implementar).
- TypesDB

Carregar todos os tipos para dropdowns.




 # ⚙ Dependências Maven (importantes)
``` xml 
<dependencies>

    <!-- JavaFX -->
    <dependency>
        <groupId>org.openjfx</groupId>
        <artifactId>javafx-controls</artifactId>
        <version>25.0.1</version>
    </dependency>

    <!-- Dotenv -->
    <dependency>
        <groupId>io.github.cdimascio</groupId>
        <artifactId>java-dotenv</artifactId>
        <version>5.2.2</version>
    </dependency>

    <!-- BCrypt -->
    <dependency>
        <groupId>org.mindrot</groupId>
        <artifactId>jbcrypt</artifactId>
        <version>0.4</version>
    </dependency>

    <!-- PostgreSQL -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <version>42.7.2</version>
    </dependency>

</dependencies>
```

# 🔧 VM Options (JavaFX 25)

Necessário para correr o JavaFX:
```
--add-modules javafx.controls,javafx.fxml
--enable-native-access=javafx.graphics
```

# 👤 Autores

👨‍💻 Pedro Fevereiro

👨‍💻 Jadir Amador

Desenvolvedor e estudante ISPGAYA
Projeto académico e profissional de gestão de eventos.