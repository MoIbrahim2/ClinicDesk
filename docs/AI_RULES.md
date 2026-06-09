# AI Rules

- Read the documented technology stack from the existing project documentation and follow it strictly.
- Follow the architecture patterns and conventions defined in the project documentation.
- Maintain a feature-based or domain-driven structure as documented.
- Keep business logic separated from presentation and infrastructure concerns.
- Follow established coding standards, naming conventions, and project guidelines.
- Reuse existing patterns before introducing new ones.
- Document significant architectural or technical decisions.
- Ensure critical business logic is covered by appropriate tests.
- Respect security, performance, and scalability requirements defined in the documentation.
- Do not introduce technologies, frameworks, or libraries that are not aligned with the documented stack without explicit approval.

## Documented Stack To Follow

- Frontend: React 18 with Vite
- Routing: React Router v6
- Server state: React Query
- UI library: Ant Design 5
- Forms: React Hook Form with Zod
- i18n: i18next with Arabic RTL and English LTR support
- Charts: Recharts
- HTTP client: Axios
- Backend: NestJS 10
- ORM: TypeORM
- Validation: class-validator and class-transformer
- Authentication: Passport and `@nestjs/jwt`
- Database: MySQL 8
- Infrastructure: Docker Compose with Nginx

## Architectural Conventions To Preserve

- Backend modules should follow the documented controller -> service -> repository layering.
- Frontend code should keep data access inside the `api/` layer rather than calling Axios directly from UI components.
- Domain modules should align with the documented business capabilities: auth, users, patients, doctors, appointments, visits, prescriptions, billing, reports, notifications, admin, and clinic settings.
- Localization, accessibility, audit logging, and security are core requirements, not optional polish.
- Clinical and financial records should favor non-destructive state changes and auditable workflows over hard deletes.
