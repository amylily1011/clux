const CLI_SIGNALS = [
  /--[\w-]+/,                          // long flags: --help, --dry-run
  /-[a-zA-Z]\b/,                       // short flags: -v, -h
  /\busage:/i,                         // "Usage:" header
  /\bsynopsis:/i,                      // "Synopsis:" header
  /\boptions:/i,                       // "Options:" header
  /\bcommands?:/i,                     // "Commands:" or "Command:"
  /\bsubcommands?:/i,                  // "Subcommands:" header
  /\bflags:/i,                         // "Flags:" header
  /\barguments?:/i,                    // "Arguments:" header
  /\bexamples?:/i,                     // "Examples:" header
  /^\s*\$/m,                           // $ prompt line
  /\[options\]/i,                      // [options] placeholder
  /\[flags\]/i,                        // [flags] placeholder
  /\(default[: ]/i,                    // "(default: ...)" pattern
  /exit code/i,                        // exit code mention
  /^\s{2,}\w[\w-]+\s{2,}/m,           // indented command listing (common in help output)
];

const MIN_SIGNALS = 1;

const COMMAND_NAME = /^[\w][\w.-]*(\s+[\w][\w.-]*)*(\s+--?[\w-]+)*$/;

export function prescreenCLIContent(text: string): { ok: boolean; reason?: string } {
  const trimmed = text.trim();

  if (trimmed.length < 2) {
    return { ok: false, reason: "Input is too short to evaluate." };
  }

  // Short single-line input with no newlines → treat as a command name (e.g. "multipass find")
  if (!trimmed.includes("\n") && trimmed.length <= 120 && COMMAND_NAME.test(trimmed)) {
    return { ok: true };
  }

  const matches = CLI_SIGNALS.filter((pattern) => pattern.test(trimmed));

  if (matches.length < MIN_SIGNALS) {
    return {
      ok: false,
      reason:
        "This doesn't look like CLI output. Try a command name like `multipass find`, or paste the output of `<command> --help`.",
    };
  }

  return { ok: true };
}
