## Workspace

Run dependency, build, test, and dev commands from the repository root so Yarn can use the workspace install state.

Use root scripts such as:

```
yarn build
yarn test
yarn dev:app
yarn dev:api
```

Do not run package scripts from `app/` or `api/` unless a task specifically requires package-local behavior.
