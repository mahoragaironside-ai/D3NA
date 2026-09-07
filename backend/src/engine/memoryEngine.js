// Funde os "updates" extraídos pela camada de IA na memória estruturada do projeto.
// Nunca sobrescreve um dado 'confirmado' com um dado 'estimado' do mesmo campo,
// a menos que o novo valor também venha marcado como 'confirmado'.

export function mergeMemory(currentMemory, updates) {
  const next = { ...currentMemory };
  for (const [field, incoming] of Object.entries(updates || {})) {
    if (!incoming || incoming.value === undefined || incoming.value === null || incoming.value === "") continue;
    const existing = next[field];
    if (existing?.status === "confirmado" && incoming.status !== "confirmado") {
      continue; // não degradar um dado confirmado para estimado
    }
    next[field] = { value: incoming.value, status: incoming.status === "confirmado" ? "confirmado" : "estimado" };
  }
  return next;
}

export function splitMemoryForStorage(memory) {
  const confirmed_facts = {};
  const user_estimates = {};
  const unknown_information = [];
  for (const [field, entry] of Object.entries(memory)) {
    if (entry.status === "confirmado") confirmed_facts[field] = entry.value;
    else user_estimates[field] = entry.value;
  }
  return { confirmed_facts, user_estimates, unknown_information };
}
