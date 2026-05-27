# Fluxo de Integração InfoCultura ↔ Eventbrite

## Visão Geral

O InfoCultura é o **painel principal** para gerenciar eventos. A Eventbrite funciona como **plataforma externa de venda/inscrição**. Tudo criado no InfoCultura é automaticamente exportado/sincronizado para Eventbrite.

## Fluxo de Criação de Evento

### 1. **Criar Evento no InfoCultura** (Status: `draft`)
```
POST /api/events/admin/
{
  "title": "Conferência de Cultura",
  "description": "Uma conferência sobre cultura e artes",
  "event_date": "2026-06-15",
  "start_date": "2026-06-15T14:00:00Z",
  "end_date": "2026-06-15T17:00:00Z",
  "city": "Lisboa",
  "location": "Auditório da Universidade",
  "enable_registrations": true,
  "registration_capacity": 200,
  "status": "draft",
  "club_id": 1,
  "category_ids": [1, 2],
  "eventbrite_venue": {
    "name": "Auditório",
    "address_1": "Av. da Cultura nº 123",
    "city": "Lisboa",
    "country": "PT",
    "postal_code": "1000-001"
  },
  "eventbrite_ticket_classes": [
    {
      "name": "Entrada Geral",
      "type": "free",
      "quantity_total": 200
    },
    {
      "name": "Entrada VIP",
      "type": "paid",
      "cost": 15.00,
      "quantity_total": 50
    }
  ]
}
```

**Resultado**: Evento criado no banco de dados com:
- `eventbrite_event_id`: `null` (não sincronizado ainda)
- `eventbrite_url`: `null`
- `status`: `draft`

---

### 2. **Publicar Evento no InfoCultura**
Quando o evento passa para status `published`, a sincronização com Eventbrite é **automática**:

```
PATCH /api/events/admin/{event_id}/
{
  "status": "published"
}
```

**O que acontece automaticamente**:
- ✅ InfoCultura chama a **API da Eventbrite**
- ✅ Eventbrite **cria o evento** com os dados do InfoCultura
- ✅ Eventbrite retorna o `event_id`
- ✅ InfoCultura **guarda o ID internamente**:
  - `eventbrite_event_id`: "123456789"
  - `eventbrite_url`: "https://www.eventbrite.com/e/123456789"
  - `eventbrite_status`: "draft" ou "live"
  - `eventbrite_last_synced_at`: timestamp atual
  - `eventbrite_last_error`: null

---

### 3. **Atualizar Evento no InfoCultura**
Qualquer alteração no InfoCultura é **sincronizada com Eventbrite**:

```
PATCH /api/events/admin/{event_id}/
{
  "title": "Conferência de Cultura - Edição 2026",
  "registration_capacity": 250
}
```

**O que acontece**:
- ✅ Evento atualizado no banco de dados
- ✅ Se `eventbrite_event_id` existe, a Eventbrite é atualizada automaticamente
- ✅ Sincronização ocorre em tempo real

---

### 4. **Consultar Dados do Evento (com informações Eventbrite)**
```
GET /api/events/admin/{event_id}/
```

**Resposta inclui**:
```json
{
  "id": 1,
  "title": "Conferência de Cultura",
  "status": "published",
  "eventbrite_event_id": "123456789",
  "eventbrite_url": "https://www.eventbrite.com/e/123456789",
  "eventbrite_status": "live",
  "eventbrite_last_synced_at": "2026-05-27T10:30:00Z",
  "eventbrite_last_error": null,
  "eventbrite_venue_id": "987654321",
  ...
}
```

---

## Operações Disponíveis

### Tickets
```
POST /api/events/admin/{event_id}/eventbrite/ticket-classes/
{
  "name": "Membro Especial",
  "type": "donation",
  "quantity_total": 100
}
```

### Participantes / Inscritos
```
GET /api/events/admin/{event_id}/eventbrite/attendees/
```

### Encomendas / Bilhetes Vendidos
```
GET /api/events/admin/{event_id}/eventbrite/orders/
```

### Detalhe do Evento na Eventbrite
```
GET /api/events/admin/{event_id}/eventbrite/
```

### Sincronização Manual (se necessário)
```
POST /api/events/admin/{event_id}/eventbrite/sync/
{
  "publish": false
}
```

---

## Fluxo Completo Visual

```
┌─────────────────────────────────────┐
│  InfoCultura (Painel Principal)    │
│                                     │
│  1. Criar Evento (draft)           │
│     - Título, descrição            │
│     - Data, local                  │
│     - Lotação, tickets             │
│     - Sala/venue                   │
│                                     │
│  ↓                                  │
│                                     │
│  2. Publicar (status = published)   │
│                                     │
└─────────────┬───────────────────────┘
              │
              │ AUTO-SYNC
              ↓
┌─────────────────────────────────────┐
│  Eventbrite API                     │
│                                     │
│  - Cria evento                      │
│  - Cria salas/venues                │
│  - Cria classes de bilhetes         │
│  - Retorna event_id                 │
│                                     │
└─────────────┬───────────────────────┘
              │
              │ Retorna ID
              ↓
┌─────────────────────────────────────┐
│  InfoCultura (DB)                   │
│                                     │
│  Guarda internamente:               │
│  - eventbrite_event_id              │
│  - eventbrite_url                   │
│  - eventbrite_status                │
│  - eventbrite_last_synced_at        │
│                                     │
└─────────────────────────────────────┘
              │
              ↓
  ┌──────────────────────────┐
  │  Eventbrite (Pública)    │
  │  Evento visível para:    │
  │  - Compradores           │
  │  - Inscritos             │
  │  - Vendas de bilhetes    │
  └──────────────────────────┘
```

---

## Campos Eventbrite (Opcional / Automático)

| Campo | Tipo | Obrigatório? | Descrição |
|-------|------|--------------|-----------|
| `eventbrite_event_id` | string | ❌ Não (gerado) | ID único da Eventbrite |
| `eventbrite_url` | string | ❌ Não (gerado) | URL do evento na Eventbrite |
| `eventbrite_status` | string | ❌ Não (gerado) | Status na Eventbrite (`draft`, `live`, etc) |
| `eventbrite_last_synced_at` | datetime | ❌ Não (gerado) | Última sincronização |
| `eventbrite_last_error` | text | ❌ Não | Erro da última sincronização (se houver) |
| `eventbrite_venue_id` | string | ❌ Opcional | ID da sala na Eventbrite |
| `eventbrite_venue` | JSON | ❌ Opcional | Dados da sala (criado automaticamente se não existir) |
| `eventbrite_ticket_classes` | JSON | ❌ Opcional | Classe de bilhetes (se não especificado, cria bilhete gratuito) |

---

## Limitações

### O que funciona via API pública da Eventbrite:
✅ Criar evento  
✅ Criar/associar sala  
✅ Criar tickets gratuitos, pagos e donativos  
✅ Definir lotação  
✅ Publicar evento  
✅ Consultar encomendas  
✅ Consultar participantes/lugares reservados  

### O que NÃO funciona (requer painel web):
❌ Mapa visual de lugares/reserved seating  
❌ Algumas funcionalidades avançadas do painel web  

---

## Tratamento de Erros

Se a sincronização com Eventbrite falhar:

1. **O evento é criado no InfoCultura** (não é bloqueado)
2. **Erro é registrado** em `eventbrite_last_error`
3. **Status fica como `draft`** no InfoCultura
4. **`eventbrite_event_id` permanece `null`**
5. **Admin pode tentar sincronizar manualmente** via endpoint de sync manual

```json
{
  "eventbrite_last_error": "Eventbrite API Error: Invalid API token",
  "eventbrite_last_synced_at": "2026-05-27T10:30:00Z"
}
```

---

## Exemplos de Resposta

### Evento não sincronizado (draft)
```json
{
  "id": 1,
  "title": "Evento em Rascunho",
  "status": "draft",
  "eventbrite_event_id": null,
  "eventbrite_url": null,
  "eventbrite_status": null,
  "eventbrite_last_synced_at": null,
  "eventbrite_last_error": null
}
```

### Evento sincronizado com sucesso
```json
{
  "id": 2,
  "title": "Evento Publicado",
  "status": "published",
  "eventbrite_event_id": "123456789",
  "eventbrite_url": "https://www.eventbrite.com/e/123456789-nome-do-evento",
  "eventbrite_status": "live",
  "eventbrite_last_synced_at": "2026-05-27T10:35:15Z",
  "eventbrite_last_error": null
}
```

### Evento com erro de sincronização
```json
{
  "id": 3,
  "title": "Evento com Erro",
  "status": "published",
  "eventbrite_event_id": null,
  "eventbrite_url": null,
  "eventbrite_status": null,
  "eventbrite_last_synced_at": "2026-05-27T10:40:00Z",
  "eventbrite_last_error": "Eventbrite is not configured: Configure EVENTBRITE_PRIVATE_TOKEN no .env."
}
```

---

## Configuração Necessária (.env)

```bash
EVENTBRITE_PRIVATE_TOKEN=your_private_token_here
EVENTBRITE_ORGANIZATION_ID=your_org_id_here
EVENTBRITE_API_BASE_URL=https://www.eventbriteapi.com/v3
EVENTBRITE_DEFAULT_TIMEZONE=Europe/Lisbon
EVENTBRITE_DEFAULT_CURRENCY=EUR
EVENTBRITE_DEFAULT_COUNTRY=PT
EVENTBRITE_TICKET_NAME=Entrada geral
EVENTBRITE_DEFAULT_VENUE_ID=optional_default_venue_id
```

---

## Resumo

| Ação | Resultado | Eventbrite | Dados |
|------|-----------|-----------|--------|
| Criar evento (draft) | ✅ Criado | ❌ Nada | `eventbrite_event_id = null` |
| Publicar evento | ✅ Publicado | ✅ Evento criado | `eventbrite_event_id = "123..."` |
| Atualizar evento | ✅ Atualizado | ✅ Sincronizado | ID permanece igual |
| Alterar tickets | ✅ Atualizado | ✅ Sincronizado | Tickets atualizados |

**InfoCultura é a fonte de verdade.** Eventbrite é apenas uma plataforma de venda/inscrição sincronizada.
