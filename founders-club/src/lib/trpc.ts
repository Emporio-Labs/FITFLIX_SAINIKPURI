import { createTRPCReact } from "@trpc/react-query";
import { TRPCClientError, type Operation, type TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import type { AppRouter } from "../../shared/router";

export const trpc = createTRPCReact<AppRouter>();

function actionFromPath(path: string) {
  const action = path.split(".").at(-1) || "";
  if (!["settings", "slots", "submit", "lead", "bookingConfig", "requestCall"].includes(action)) {
    throw new Error("Unsupported public campaign operation");
  }
  return action;
}

export const publicRestLink: TRPCLink<AppRouter> = () => ({ op }: { op: Operation }) => {
    return observable(observer => {
      const action = actionFromPath(op.path);
      const isQuery = op.type === "query";
      const url = `/api/presales/founders?operation=${encodeURIComponent(action)}`;
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 15000);
      const init: RequestInit = {
        method: isQuery ? "GET" : "POST",
        signal: controller.signal,
        headers: isQuery ? undefined : { "Content-Type": "application/json" },
        body: isQuery ? undefined : JSON.stringify(op.input ?? {}),
        credentials: "same-origin",
      };
      fetch(url, init)
        .then(async response => {
          const payload = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new TRPCClientError(
              typeof payload?.error === "string" ? payload.error : "Campaign request failed"
            );
          }
          observer.next({ result: { data: payload } } as never);
          observer.complete();
        })
        .catch(error => observer.error(error))
        .finally(() => window.clearTimeout(timer));
      return () => controller.abort();
    });
  };
