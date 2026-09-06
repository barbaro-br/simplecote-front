## ADDED Requirements

### Requirement: Biblioteca de ícones Phosphor

A interface SHALL usar `@phosphor-icons/react` como biblioteca de ícones, com um peso padrão consistente (`regular`) definido globalmente, e pesos de ênfase (`bold`/`fill`) aplicados apenas de forma pontual (ação primária, estado ativo). `lucide-react` SHALL ser removido. Os ícones SHALL respeitar o dimensionamento por classe utilitária (Tailwind `size-*`) e continuar acessíveis pelos `aria-label`/`role` dos controles que os contêm.

#### Scenario: Ícone renderiza com o peso padrão

- **WHEN** qualquer tela renderiza um ícone sem peso explícito
- **THEN** ele usa o peso `regular` definido globalmente

#### Scenario: Nenhuma referência a lucide

- **WHEN** o projeto é buildado
- **THEN** não há nenhum import de `lucide-react` e o build passa

#### Scenario: Acessibilidade preservada

- **WHEN** um botão só de ícone é renderizado
- **THEN** ele mantém seu `aria-label`, e o ícone em si é decorativo
