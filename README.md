# firebot-front

## Arquitetura Front-End

```
src/
├── app/
│   ├── __tests__/
│   │   ├── layout.test.tsx
│   │   └── page.test.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── __tests__/
│   │   │   └── button.test.tsx
│   │   └── button.tsx
│   ├── features/
│   │   └── auth/
│   │       ├── __tests__/
│   │       └── login-form.tsx
│   └── layout/
│       ├── __tests__/
│       └── sidebar.tsx
├── hooks/
│   ├── __tests__/
│   │   └── use-auth.test.ts
│   └── use-auth.ts
├── services/
│   ├── __tests__/
│   │   └── api.test.ts
│   └── api.ts
├── stores/
│   ├── __tests__/
│   │   └── auth-store.test.ts
│   └── auth-store.ts
├── tests/
│   ├── setup.ts
│   ├── mocks/
│   ├── fixtures/
│   └── utils/
└── jest.config.js
```

```
features/
├── auth/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   └── utils/
├── dashboard/
└── settings/
```
