## ADDED Requirements

### Requirement: Neutros do tema claro com viés cromático sutil

Os tokens de superfície do tema claro (`--background`, `--card`, `--border`, `--input`) SHALL usar um leve viés de matiz alinhado ao `--primary` da marca, em vez de serem puramente acromáticos (chroma ≈0) — um neutro combinado de propósito com o tom de destaque, não um cinza/branco genérico. O mesmo conjunto de valores SHALL ser usado tanto no tema claro padrão (`:root`) quanto no tema claro forçado da tela pública do representante (`.tema-claro`), mantendo os dois visualmente equivalentes. O tema escuro (`.dark`) não é afetado por este requirement.

#### Scenario: Fundo do painel com viés de matiz da marca

- **WHEN** o admin visualiza qualquer tela do painel no tema claro
- **THEN** o fundo da página e dos cartões usam uma cor neutra com leve viés de matiz na mesma família do `--primary`, não um branco ou cinza puramente acromático

#### Scenario: Tema claro forçado do representante acompanha o mesmo fundo

- **WHEN** o representante acessa a tela pública por token (`.tema-claro`)
- **THEN** o fundo usa os mesmos valores de `--background`/`--card`/`--border`/`--input` do tema claro do painel admin
