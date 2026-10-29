/* Every row a query matches, not just the first 1000.

   Supabase quietly stops at 1000 rows per request (the API's max_rows). Once
   the shop passed 1000 closed jobs, every report that read "all CLOSED
   tickets" got an arbitrary 1000 of the 1041 — a different 1000 from one
   request to the next — so a technician's job count on Finances fell from 127
   to 120 overnight with nothing changed. This pages through in id order, which
   is stable, until a short page says there is nothing left.

   `build` returns a fresh query each call (a builder cannot be re-ranged).
   Returns { data, error } so it drops in where `await query` was. */
export async function allRows(build, pageSize = 1000) {
  const data = [];
  for (let at = 0; ; at += pageSize) {
    const { data: page, error } = await build().order("id", { ascending: true }).range(at, at + pageSize - 1);
    if (error) return { data: null, error };
    data.push(...(page || []));
    if (!page || page.length < pageSize) return { data, error: null };
  }
}
