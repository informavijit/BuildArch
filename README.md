# BuildArch - Workspace Architecture & Design Analyzer

**Publisher:** `AvijitKumarTewary`  
**Version:** `1.0.0`  
**License:** MIT (100% Free & Open-Source for any personal, commercial, or educational purpose)

**BuildArch** is a high-performance VS Code extension that analyzes any workspace (single-folder or multi-root, monorepo or microservices) and generates a detailed, self-contained **Architecture and Design report as one single HTML file**.

---

## 🏛️ Features & Architecture Highlights

- **100% Free & Unrestricted License:** Free to use, modify, distribute, and embed for any purpose without restrictions.
- **80%+ Rule-Based Pipeline (Zero-AI by default):** Analyzes files, manifests, routes, endpoints, models, infrastructure, and call graphs deterministically without AI tokens or network calls.
- **Opt-in AI Enrichment (`BuildArch: Workspace AI`):** Optional AI mode enriches compact architecture facts with executive summaries, component purpose statements, and workflow narratives using `vscode.lm` or configured AI models with token budget safety and caching.
- **Section 7 Design System:** Embedded dark-theme visual design featuring gradient header, top-border cards, central hub cards, direction arrows, bubble flow diagrams, component dependency matrix, filterable component catalog, and dark/light mode toggle.
- **Cross-Language Interop Linker:** Automatically links HTTP clients to backend endpoints, native P/Invoke/external DLL calls to C/C++ libraries, and process execution across projects.
- **Secrets Protection & Redaction:** Redacts sensitive token/password values automatically while preserving key names for architecture review.

---

## 🌐 Complete Supported Languages & Frameworks Matrix

- **JavaScript / TypeScript:** Node.js, Express, NestJS, Fastify, Koa, REST routes, `import`/`require`, NPM modules.
- **React.js:** JSX/TSX components, React Router routes, state management (`useContext`/`useState`), Next.js pages/app router.
- **Angular & AngularJS:** Angular `@Component`/`@Injectable`/`@NgModule`, AngularJS `angular.module`, controllers, directives, factories, `$http`.
- **Java:** Spring Boot (`@RestController`, `@GetMapping`, `@Service`, `@Repository`), JPA entities, Jakarta EE, Maven/Gradle modules.
- **C# / .NET:** ASP.NET Controllers & Minimal APIs (`[HttpGet]`, `MapGet`), EF `DbContext`/`DbSet`, WPF/WinForms, P/Invoke `DllImport`.
- **C / C++:** `#include` graphs, CMake, Qt (`Q_OBJECT`, signals/slots), DLL exports (`__declspec(dllexport)`), sockets.
- **Delphi / Object Pascal:** `.pas`, `.dfm`/`.fmx` pairing, `.dpr`, `.dpk`, form component trees (`TForm`, `TFrame`, `TDataModule`), FireDAC/ADO DB components (`TFDConnection`, `TFDQuery`), event handlers (`OnClick = Method`), `external 'x.dll'` imports.
- **Python:** FastAPI (`@app.get`), Flask, Django, SQLAlchemy models, Celery tasks.
- **Dart / Flutter:** Widgets/screens, GoRouter, state management (Bloc, Provider, Riverpod), Dio/HTTP clients.
- **PowerShell:** Functions, module manifests (`.psd1`), `Import-Module`, `Invoke-RestMethod`, dot-sourcing.
- **Perl:** Package modules (`.pm`), `use`/`require`, `sub`, DBI database connections, system/exec calls.
- **Go, Rust, Kotlin, Swift, PHP, Ruby:** Package manifests (`go.mod`, `Cargo.toml`, `build.gradle.kts`, `Package.swift`, `composer.json`, `Gemfile`), entry points, routing.
- **Shell / Bash:** Sourced scripts, executables, environment variables, `curl`/`wget`.
- **SQL & Migrations:** `CREATE TABLE`, `CREATE VIEW`, `PROCEDURE`, foreign keys, migration order.
- **Config & IaC & Contracts:** Dockerfile, Docker Compose, Kubernetes, Helm, CI/CD pipelines (GitHub Actions, Azure Pipelines, GitLab CI), gRPC `.proto`, OpenAPI / Swagger specs.

---

## 🚀 Commands

| Command | Palette Title | Mode |
|---|---|---|
| `buildarch.workspace` | **`BuildArch: Workspace`** | Default rule-based architecture analysis (No AI, zero token cost) |
| `buildarch.workspaceAi` | **`BuildArch: Workspace AI`** | Rule-based pipeline + Opt-in AI enrichment with token budget cap & dry-run confirmation |
| `buildarch.openLastReport` | **`BuildArch: Open Last Report`** | Opens the most recently generated architecture report HTML |

---

## 📄 License

MIT License. Free to use for any purpose. Copyright (c) 2026 AvijitKumarTewary.
