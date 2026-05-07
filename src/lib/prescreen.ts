// Single-line command pattern (with optional leading prompt char stripped)
const COMMAND_PATTERN = /^[\w][\w/.-]*(\s+[\w][\w/.-]*)*(\s+--?[\w-]+)*$/;

// Clearly non-content: only whitespace, punctuation, or a lone prompt char
const CLEARLY_EMPTY = /^[$%#>!\s]*$/;

export function prescreenCLIContent(text: string): { ok: boolean; reason?: string } {
  const trimmed = text.trim();

  if (trimmed.length < 2 || CLEARLY_EMPTY.test(trimmed)) {
    return { ok: false, reason: "Input is too short to evaluate." };
  }

  // Multi-line content (command + output, help text, tables, etc.) — always pass
  if (trimmed.includes("\n")) {
    return { ok: true };
  }

  // Single-line: strip a leading shell prompt if present, then check command shape
  const withoutPrompt = trimmed.replace(/^[$%#>]\s+/, "").trim();

  if (COMMAND_PATTERN.test(withoutPrompt)) {
    return { ok: true };
  }

  return {
    ok: false,
    reason: "Try a command name like `git --help`, or paste the output of `<command> --help`.",
  };
}
