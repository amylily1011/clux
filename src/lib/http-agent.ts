import { Agent, setGlobalDispatcher } from "undici";

// Extend undici's default 10s connect timeout — large convention prompts
// can cause the TCP/TLS handshake to take longer on slower connections.
setGlobalDispatcher(
  new Agent({
    connect: { timeout: 60_000 },   // 60s connect timeout (was 10s)
    keepAliveTimeout: 10_000,
    keepAliveMaxTimeout: 600_000,
  })
);
