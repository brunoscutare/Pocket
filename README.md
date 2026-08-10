# Pocket

App de finanças pessoais feito com [Expo](https://expo.dev) e React Native. Organize pendências, acompanhe renda, saldo e movimentações — tudo **offline**, com dados salvos localmente no dispositivo.

## Funcionalidades

- **Home** — renda, saldo disponível, gráfico por tipo de gasto e atalho para notificações
- **Pendências** — contas a pagar com valor fixo ou variável, vencimento e lembretes
- **Movimentações** — histórico de entradas e saídas
- **Configurações** — preferências do app

Não há backend nem login: os dados ficam em SQLite (`pocket.db`) no aparelho.

## Requisitos

- Node.js 18+
- npm

## Como rodar

```bash
npm install
npx expo start
```

Depois, abra no Expo Go, emulador Android ou simulador iOS.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia o Metro / Expo |
| `npm run android` | Abre no Android |
| `npm run ios` | Abre no iOS |
| `npm run web` | Abre no navegador |

## Estrutura

```
app/           Rotas (Expo Router)
src/features/  Telas por domínio
src/services/  SQLite e regras de negócio
src/components Componentes reutilizáveis
```

## Variáveis de ambiente

O app não usa `.env` hoje. Se você adicionar no futuro, crie um `.env.example` documentando as chaves e **nunca** commite o `.env` real (já está no `.gitignore`).

## Licença

MIT — veja [LICENSE](./LICENSE).
