# 20TwentyScore

A cricket scorecard web app for Twenty20 (T20) cricket games.

Live at: **https://20-twenty-score.vercel.app/**

## Features

- Track runs, wickets, overs, and balls for two teams
- Ball-by-ball scoring with over-by-over breakdown
- Batting and bowling player tracking
- Extras (wides, no-balls, byes, leg-byes)
- Save and load game state via localStorage
- Responsive layout built with Emotion (CSS-in-JS)

## Tech stack

- [Next.js](https://nextjs.org/) — React framework and routing
- [React](https://react.dev/) with TypeScript
- [Emotion](https://emotion.sh/) — CSS-in-JS styling
- React Context + `useReducer` — state management
- [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/) — unit and integration tests

## Getting started

### Prerequisites

- Node.js 18+
- [Yarn](https://yarnpkg.com/)

### Install dependencies

```bash
yarn install
```

### Run the development server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
yarn build
yarn start
```

## Running tests

```bash
yarn test
```

To generate a coverage report:

```bash
yarn jest --coverage
```

## Linting

```bash
yarn lint
```

Auto-fix lint issues:

```bash
yarn lint:fix
```

Format all files with Prettier:

```bash
yarn format
```
