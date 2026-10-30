/**
 * Formulário declarativo WebMCP (toolname / tooldescription / toolparamdescription).
 * @see https://github.com/webmachinelearning/webmcp/blob/main/declarative-api-explainer.md
 */
export function LotusContactAgentForm() {
  const formAttrs = {
    toolname: "request_proposal_access",
    tooldescription:
      "Solicita acesso ao fluxo de proposta da Lótus. Envia o visitante para login com retorno em /propostas.",
    toolautosubmit: "",
  };

  const emailAttrs = {
    toolparamdescription:
      "E-mail comercial da empresa interessada na gestão de tráfego pago",
  };

  return (
    <form
      action="/login"
      method="get"
      className="mt-8 flex w-full max-w-sm flex-col gap-3"
      {...formAttrs}
    >
      <input type="hidden" name="next" value="/propostas" />
      <label className="text-xs font-medium text-white/50" htmlFor="agent-email">
        E-mail comercial
      </label>
      <input
        id="agent-email"
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="voce@empresa.com"
        className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/35"
        {...emailAttrs}
      />
      <button
        type="submit"
        className="rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90"
      >
        Continuar para proposta
      </button>
    </form>
  );
}
