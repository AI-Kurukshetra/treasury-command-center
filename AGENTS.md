# AGENTS.md

For questions about OpenAI APIs, models, SDKs, MCP, Codex, ChatGPT, Assistants, Responses, or platform behavior, use the `openaiDeveloperDocs` MCP server first before answering.

If `openaiDeveloperDocs` is unavailable, say that explicitly and fall back to the official OpenAI web docs.

For this repository, prefer project-specific MCPs before generic browsing:

- Use `supabaseLocal` for local Supabase schema, migrations, debugging, and database inspection when the local Supabase stack is running.
- Use `supabase` for Supabase platform docs and hosted project guidance when local Supabase is unavailable or a cloud-level answer is needed.
- Use `postgres` only if it has been explicitly wired to a database connection in the current environment. Otherwise prefer `supabaseLocal` or `supabase`.
- Use `vercelProject` first for deployment, project configuration, environment variables, domains, and runtime/log-related Vercel tasks for this repository.
- Use `vercel` only when a generic or account-level Vercel task is needed outside this linked project context.
- Use `playwright` for browser automation, smoke checks, and E2E investigation.
- Use `filesystem` for broad repository discovery when local shell search is not the best fit.

Prefer these MCPs over generic web search when they can answer the task directly.
