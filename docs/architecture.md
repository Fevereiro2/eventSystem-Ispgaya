# Arquitectura e Organização do Código

Este projeto está organizado para separar responsabilidades e evitar lógica espalhada pela aplicação.

## Estrutura Geral

### Frontend

- `src/pages/`: páginas completas e rotas.
- `src/components/`: componentes reutilizáveis.
- `src/api/`: comunicação com o backend.
- `src/hooks/`: lógica reutilizável de estado e efeitos.
- `src/utils/`: funções puras e helpers.
- `src/styles/`: tokens visuais e classes comuns.

### Backend

- `backend/infocultura/models.py`: modelos de domínio e persistência.
- `backend/infocultura/api/serializers_*.py`: validação e normalização de dados.
- `backend/infocultura/view_modules/`: handlers HTTP organizados por área.
- `backend/infocultura/database/`: camada de schema e modelos SQLAlchemy auxiliares.
- `backend/infocultura/service_modules/`: regras de negócio, integrações e operações compostas.

## MVC / MVT

O backend Django é tecnicamente **MVT**. Ainda assim, a organização do código segue a intenção do **MVC**:

- **Model**: representa os dados e regras estruturais, principalmente em `models.py`.
- **View / Controller**: recebe pedidos HTTP, aplica filtros, chama a lógica necessária e devolve respostas, sobretudo em `view_modules/`.
- **Validation / DTO**: `serializers.py` trata da entrada e saída de dados, validando payloads antes de chegar à lógica de negócio.

Na prática, isto evita colocar regras no frontend ou em views gigantes sem estrutura.

## POO

O projeto usa **Programação Orientada a Objetos** para modelar o domínio:

- cada entidade relevante é uma classe (`Event`, `Session`, `Book`, `News`, `Club`, `Registration`)
- a herança é usada para reaproveitar comportamento comum
- métodos e propriedades encapsulam comportamentos da entidade
- serializers e serviços usam objetos compostos para manter a lógica organizada

## Boas Práticas Aplicadas

- Separação de responsabilidades.
- Componentes pequenos e reutilizáveis.
- Funções puras em `utils/`.
- Lógica de API concentrada numa camada própria.
- Validação no backend antes de persistir.
- Nomes explícitos para estados, filtros e tipos.
- Evitar duplicação entre páginas públicas e admin, reaproveitando componentes e helpers.

## Regra prática para evoluir o projeto

- Se for UI reutilizável, vai para `components/`.
- Se for lógica de estado ou carregamento, vai para `hooks/`.
- Se for cálculo puro, vai para `utils/`.
- Se for validação ou transformação de payload, vai para `serializers/`.
- Se for regra de negócio ou integração externa, vai para `service_modules/`.

