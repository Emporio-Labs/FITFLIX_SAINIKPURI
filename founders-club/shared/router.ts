import { initTRPC } from "@trpc/server";
import { z } from "zod";
import {
  applicationSchema,
  type ApplicationResult,
  type CampaignSettings,
} from "./founders";

const t = initTRPC.create();
const slots = z.array(
  z.object({
    id: z.string().uuid(),
    startAt: z.string(),
    endAt: z.string(),
  })
);
const result = z.custom<ApplicationResult>();
const settings = z.custom<CampaignSettings>();

// Type metadata only: the browser uses the native REST proxy, never this router at runtime.
export const publicRouter = t.router({
  founders: t.router({
    settings: t.procedure.output(settings).query(() => null as never),
    slots: t.procedure.output(slots).query(() => []),
    submit: t.procedure.input(applicationSchema).output(result).mutation(() => null as never),
    lead: t.procedure.input(z.object({ id: z.string(), token: z.string() })).output(result).mutation(() => null as never),
    bookingConfig: t.procedure.input(z.object({ id: z.string(), token: z.string() })).output(z.object({ bookingUrl: z.string().nullable() })).mutation(() => ({ bookingUrl: null })),
    requestCall: t.procedure.input(z.object({ id: z.string(), token: z.string(), slotId: z.string().optional(), preferredWindow: z.string().optional(), kind: z.enum(["call", "tour"]) })).output(z.object({ status: z.literal("requested"), message: z.string() })).mutation(() => ({ status: "requested" as const, message: "Request received." })),
  }),
});
export type AppRouter = typeof publicRouter;
