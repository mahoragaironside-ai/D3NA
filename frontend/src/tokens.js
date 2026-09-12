export const C = {
  bg: "var(--bg)",
  surface: "var(--surface)",
  ink: "var(--ink)",
  inkSoft: "var(--ink-soft)",
  border: "var(--border)",
  navy: "var(--navy)",
  navySoft: "var(--navy-soft)",
  accent: "var(--accent)",
  accent: "var(--accent)",
  green: "var(--green)",
  greenBg: "var(--green-bg)",
  amber: "var(--amber)",
  amberBg: "var(--amber-bg)",
  red: "var(--red)",
  redBg: "var(--red-bg)",
};

export function fmt(n) {
  if (n === undefined || n === null || isNaN(n)) return "—";
  return Math.round(n).toLocaleString("pt-PT") + " Kz";
}
