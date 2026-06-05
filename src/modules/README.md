# Module structure

Each module owns its pages, API calls, state, validation, and routes.

```text
modules/
  auth/
    api/
    components/
    pages/
    queries/
    schemas/
    stores/
    types/
    routes.ts
  iam/
    users/
      components/
      pages/
    roles/         # add when role management is implemented
    permissions/   # add when permission management is implemented
    routes.ts
  dashboard/
    pages/
    routes.ts
  organization/
    api/
    components/
    pages/
    queries/
    schemas/
    stores/
    types/
    routes.ts
```

Use `auth` only for authentication and session concerns. User, role, and
permission administration belongs to `iam`.

Create folders only when a feature needs them. Shared UI stays in
`src/components`, while shared infrastructure such as the HTTP client stays in
`src/services` or `src/configs`.
