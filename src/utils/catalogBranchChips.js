/**
 * Estilos para chips de sucursal (Todas / Durango / Chihuahua).
 * Resaltan en modo claro y oscuro.
 */
export function getBranchChipClass(branch, active) {
  const inactive =
    'rounded-lg border border-transparent px-4 py-2 text-sm font-semibold transition-colors text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white'

  if (!active) return inactive

  switch (branch) {
    case 'Todas':
      return 'rounded-lg px-4 py-2 text-sm font-semibold bg-slate-900 text-white shadow-md ring-2 ring-slate-900/20 dark:bg-zinc-100 dark:text-zinc-950 dark:ring-emerald-500/40'
    case 'Durango':
      return 'rounded-lg px-4 py-2 text-sm font-semibold bg-amber-500 text-amber-950 shadow-md ring-2 ring-amber-500/50 dark:bg-amber-400 dark:text-amber-950 dark:ring-amber-300/60'
    case 'Chihuahua':
      return 'rounded-lg px-4 py-2 text-sm font-semibold bg-sky-500 text-white shadow-md ring-2 ring-sky-500/40 dark:bg-sky-400 dark:text-sky-950 dark:ring-sky-300/50'
    default:
      return inactive
  }
}
