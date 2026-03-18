@startuml
left to right direction
skinparam packageStyle rectangle
skinparam shadowing false

actor "Visitante" as V
actor "Admin de Clube" as AC
actor "Superadmin" as SA
actor "Google OAuth API" as GO
actor "Google Calendar API" as GCal
actor "Serviço de Email/SMTP" as SMTP

rectangle "Sistema de Eventos / Laboratório Cultural" {

  ' =========================
  ' FRONT-OFFICE (Público)
  ' =========================
  usecase "Consultar Home\n(Apresentação, Missão, Destaques)" as FO_HOME
  usecase "Consultar Clubes" as FO_CLUBS
  usecase "Consultar Página de Clube" as FO_CLUB_PAGE
  usecase "Consultar Programação Cultural" as FO_PROGRAM
  usecase "Pesquisar/Filtrar Eventos\n(Cidade, Categoria, Data)" as FO_FILTER
  usecase "Consultar Detalhe de Evento" as FO_EVENT_DETAIL
  usecase "Consultar Notícias" as FO_NEWS
  usecase "Consultar Detalhe de Notícia" as FO_NEWS_DETAIL
  usecase "Consultar Conteúdo do Clube\n(Sessões, Agenda, Livros, Galeria)" as FO_CLUB_CONTENT
  usecase "Submeter Inscrição/Pedido\n(Simulada)" as FO_SIGNUP

  ' Newsletter
  usecase "Subscrever Newsletter" as FO_NEWSLETTER_SUB
  usecase "Confirmar Subscrição\n(Double Opt-in)" as FO_NEWSLETTER_CONFIRM
  usecase "Cancelar Subscrição" as FO_NEWSLETTER_UNSUB

  ' =========================
  ' AUTENTICAÇÃO / CONTA
  ' =========================
  usecase "Autenticar (Login)" as BO_LOGIN
  usecase "Login com Google" as BO_LOGIN_GOOGLE
  usecase "Terminar Sessão (Logout)" as BO_LOGOUT

  usecase "Solicitar Recuperação de Password" as ACC_RECOVER_REQ
  usecase "Enviar Email de Recuperação" as ACC_RECOVER_EMAIL
  usecase "Redefinir Password" as ACC_RESET

  ' =========================
  ' BACK-OFFICE (Admin de Clube)
  ' =========================
  usecase "Gerir Eventos do Clube\n(CRUD + Publicação)" as BO_CLUB_EVENTS
  usecase "Gerir Atividades do Clube\n(CRUD + Publicação)" as BO_CLUB_ACTIVITIES
  usecase "Gerir Notícias do Clube\n(CRUD + Publicação)" as BO_CLUB_NEWS
  usecase "Gerir Imagens\n(Upload, Remover, Capa, Galeria)" as BO_MEDIA
  usecase "Submeter para Aprovação" as BO_SUBMIT_APPROVAL

  ' Newsletter - gestão (admin)
  usecase "Gerir Newsletter\n(Lista, Templates, Envio)" as BO_NEWSLETTER_MGMT

  ' =========================
  ' BACK-OFFICE (Superadmin)
  ' =========================
  usecase "Gerir Clubes\n(CRUD, Ativar/Desativar)" as BO_MANAGE_CLUBS
  usecase "Gerir Administradores\n(Criar, Editar, Desativar, Apagar)" as BO_MANAGE_ADMINS
  usecase "Associar Admin(s) a Clube(s)" as BO_ASSIGN_ADMINS
  usecase "Remover Associação Admin-Clube" as BO_REMOVE_ASSIGN
  usecase "Gerir Categorias/Cidades\n(CRUD)" as BO_META
  usecase "Aprovar/Rejeitar Publicação" as BO_APPROVE
  usecase "Importar Eventos Externos" as BO_IMPORT

  ' =========================
  ' Relações include/extend
  ' =========================

  ' Login com Google é alternativa ao login normal
  BO_LOGIN_GOOGLE .> BO_LOGIN : <<extend>>

  ' Recuperação de password
  ACC_RECOVER_REQ .> ACC_RECOVER_EMAIL : <<include>>
  ACC_RESET .> ACC_RECOVER_REQ : <<extend>>

  ' Newsletter (double opt-in recomendado)
  FO_NEWSLETTER_SUB .> FO_NEWSLETTER_CONFIRM : <<include>>
}

' =========================
' Ligações dos Atores
' =========================

' Visitante (front)
V --> FO_HOME
V --> FO_CLUBS
V --> FO_PROGRAM
V --> FO_NEWS
FO_CLUBS --> FO_CLUB_PAGE
FO_CLUB_PAGE --> FO_CLUB_CONTENT
FO_PROGRAM --> FO_FILTER
FO_FILTER --> FO_EVENT_DETAIL
FO_NEWS --> FO_NEWS_DETAIL

FO_SIGNUP .> FO_CLUB_CONTENT : <<extend>>

' Visitante (newsletter)
V --> FO_NEWSLETTER_SUB
V --> FO_NEWSLETTER_UNSUB
V --> FO_NEWSLETTER_CONFIRM

' Conta (recuperação)
V --> ACC_RECOVER_REQ
V --> ACC_RESET

' Admin de Clube (backoffice)
AC --> BO_LOGIN
AC --> BO_LOGOUT
AC --> BO_CLUB_EVENTS
AC --> BO_CLUB_ACTIVITIES
AC --> BO_CLUB_NEWS
AC --> BO_MEDIA
AC --> BO_SUBMIT_APPROVAL
AC --> BO_NEWSLETTER_MGMT

' Superadmin (backoffice)
SA --> BO_LOGIN
SA --> BO_LOGOUT
SA --> BO_MANAGE_CLUBS
SA --> BO_MANAGE_ADMINS
SA --> BO_ASSIGN_ADMINS
SA --> BO_REMOVE_ASSIGN
SA --> BO_META
SA --> BO_APPROVE
SA --> BO_IMPORT
SA --> BO_NEWSLETTER_MGMT

' Autenticação obrigatória para backoffice
BO_CLUB_EVENTS .> BO_LOGIN : <<include>>
BO_CLUB_ACTIVITIES .> BO_LOGIN : <<include>>
BO_CLUB_NEWS .> BO_LOGIN : <<include>>
BO_MEDIA .> BO_LOGIN : <<include>>
BO_SUBMIT_APPROVAL .> BO_LOGIN : <<include>>
BO_NEWSLETTER_MGMT .> BO_LOGIN : <<include>>

BO_MANAGE_CLUBS .> BO_LOGIN : <<include>>
BO_MANAGE_ADMINS .> BO_LOGIN : <<include>>
BO_ASSIGN_ADMINS .> BO_LOGIN : <<include>>
BO_REMOVE_ASSIGN .> BO_LOGIN : <<include>>
BO_META .> BO_LOGIN : <<include>>
BO_APPROVE .> BO_LOGIN : <<include>>
BO_IMPORT .> BO_LOGIN : <<include>>

BO_SUBMIT_APPROVAL .> BO_CLUB_EVENTS : <<extend>>
BO_SUBMIT_APPROVAL .> BO_CLUB_ACTIVITIES : <<extend>>
BO_SUBMIT_APPROVAL .> BO_CLUB_NEWS : <<extend>>
BO_APPROVE .> BO_SUBMIT_APPROVAL : <<include>>

' Integrações externas
GO --> BO_LOGIN_GOOGLE
GCal --> BO_IMPORT

' Emails (SMTP/SendGrid/Mailgun)
SMTP --> ACC_RECOVER_EMAIL
SMTP --> FO_NEWSLETTER_CONFIRM
SMTP --> BO_NEWSLETTER_MGMT

@enduml