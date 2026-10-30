"use client";

import { completeClaimAction, type ClaimFormState } from "@/app/claim/actions";
import { useActionState } from "react";

export function ClaimForm({ claimAttemptToken }: { claimAttemptToken: string }) {
  const [state, action, pending] = useActionState<ClaimFormState, FormData>(
    completeClaimAction,
    null,
  );

  if (state?.ok) {
    return (
      <p className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm">
        Agente vinculado. Você já pode fechar esta página.
      </p>
    );
  }

  return (
    <form action={action} className="mt-6 flex flex-col gap-3">
      <input type="hidden" name="claim_attempt_token" value={claimAttemptToken} />
      <label className="text-sm font-medium" htmlFor="user_code">
        Código
      </label>
      <input
        id="user_code"
        name="user_code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        pattern="[0-9]{6}"
        required
        className="rounded-lg border border-border bg-transparent px-3 py-2 text-center text-lg tracking-[0.3em]"
        placeholder="••••••"
      />
      {state?.error ? (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending || !claimAttemptToken}
        className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background disabled:opacity-50"
      >
        {pending ? "Confirmando…" : "Confirmar"}
      </button>
    </form>
  );
}
