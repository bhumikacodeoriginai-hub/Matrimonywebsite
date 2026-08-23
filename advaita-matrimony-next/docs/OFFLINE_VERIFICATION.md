# Offline verification harness

## Why this exists

The environment this redesign was authored in has **no npm registry access** — every
request to `registry.npmjs.org` returns `403 Forbidden`:

```
npm error code E403
npm error 403 Forbidden - GET https://registry.npmjs.org/@types%2fnode
```

Consequences, stated plainly:

- `node_modules` cannot be installed.
- `next build`, `next dev`, `next start` and `npm run typecheck` **cannot be run**.
- No new runtime dependency can be added. The entire design system is therefore built
  on **zero new dependencies** — CSS Modules (native to Next.js), CSS custom properties,
  CSS animations and the Web Animations API instead of a JS animation library.
  That constraint turned out to be a feature: it keeps the client JS budget small,
  which is what the performance targets ask for anyway.

## What can still be verified offline

`npm run check:offline` (or `bash scripts/offline-check.sh`) runs two real gates:

| Gate                                  | What it proves                                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `prettier --check`                    | Every `.ts` / `.tsx` / `.css` file **parses**. A syntax error fails the parse, not merely the formatting.      |
| `tsc -p tsconfig.offline.json`        | Our own source typechecks: bad imports, unknown identifiers, wrong hook usage, wrong props on our components. |

`tsconfig.offline.json` points at the loose stub declarations in `.offline-types/`,
which stand in for `@types/react`, `next` and `@types/node`. They are deliberately
permissive — they exist to catch **our** mistakes, not to model React accurately.

## What it does NOT prove

- It is **not** `next build`. Bundling, the App Router's server/client boundary
  enforcement, CSS Module resolution and route collision checks are not exercised.
- Real React/Next types are stricter than the stubs. Expect a handful of genuine type
  errors to surface the first time the real gate runs.
- No runtime behaviour is verified: no rendering, no network calls, no Lighthouse or
  Core Web Vitals measurement.

## Run the real gate as soon as the registry is reachable

```bash
cd advaita-matrimony-next
npm install
npm run typecheck   # real @types/react + next types
npm run build       # bundling, RSC boundaries, route + CSS Module resolution
npm run dev         # visual, interaction and responsive QA
```

Once that passes, `.offline-types/` and `tsconfig.offline.json` can be deleted — they
are only scaffolding for a network-restricted environment. Nothing in `app/`,
`components/`, `lib/` or `styles/` imports them.


## Known differences between the offline and real configs

| Setting | `tsconfig.json` (real) | `tsconfig.offline.json` | Why |
| ------- | ---------------------- | ----------------------- | --- |
| `jsx`   | `preserve`             | `react-jsx`             | Under `preserve`, `tsc` resolves the JSX namespace in a way the stubs cannot satisfy, producing a false "Property 'children' is missing" on every component with a required `children` prop. `react-jsx` resolves it from `react/jsx-runtime`, which the stubs declare. Type resolution only — `noEmit` is set, so nothing about the build changes. |
| `types` | inherited              | `[]` + `typeRoots: []`  | Prevents `tsc` from hunting for a `node_modules/@types` that does not exist. |

If you are editing `.offline-types/react.d.ts`, note the comment above the `JSX`
namespaces: `ElementChildrenAttribute` and `ElementAttributesProperty` are matched
on their **own** declared members, so an interface that only `extends` a base
silently disables JSX children mapping. The duplication in those blocks is
required.
