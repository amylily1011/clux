export const UNIX_RULES = `
1. Composability & Pipes — commands must accept stdin and write clean stdout so they compose with pipes (cmd1 | cmd2)
2. KISS Principle — do one thing and do it well; avoid feature bloat or combining unrelated operations
3. Everything is a File — treat I/O uniformly; support file paths and stdin/stdout interchangeably where applicable
4. Silence is Golden — produce no output on success unless explicitly requested; do not print confirmations or banners
5. Rule of Clarity — behavior must be unambiguous; the command name and flags must clearly describe what happens
6. Rule of Transparency — show what you're doing; side effects must be predictable and observable (e.g. --dry-run, --verbose)
7. Rule of Diversity — support multiple output formats (human text by default, --json for scripting); work across environments
8. Exit codes — exit 0 on success, non-zero on any failure; exit codes must be consistent and documented
9. Stderr for errors — error messages, warnings, and diagnostic output must go to stderr, never stdout
10. --help / -h always available — every command and subcommand must respond to --help or -h with usage information
11. --no-color / NO_COLOR — respect the NO_COLOR env var and provide a --no-color flag; never force color in pipelines
12. Credentials via env vars — passwords, tokens, and secrets must come from environment variables or prompts, never CLI flags
`.trim();
