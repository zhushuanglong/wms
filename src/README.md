## Getting started

```bash
# install dependency
yarn

# develop
yarn dev
```

This will automatically open http://localhost:9527

## Build

```bash
# build for test environment
yarn build:stage

# build for production environment
yarn build:prod
```

## Advanced

```bash
# preview the release environment effect
yarn preview

# preview the release environment effect + static resource analysis
yarn preview -- --report

# code format check
yarn lint

# code format check and auto fix
yarn lint -- --fix
```

