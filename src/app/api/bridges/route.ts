import { MAX_BRIDGE_LIMIT, MAX_QUERY_LENGTH, DEFAULT_BRIDGE_LIMIT, searchBridges } from "@/db/queries";

/**
 * GET /api/bridges?q=<structure number or name>[&limit=1-100]
 * Returns { query, total, bridges }, best matches first.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = (params.get("q") ?? "").trim();
  if (query === "") {
    return Response.json({ error: "Provide a search query with ?q=" }, { status: 400 });
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return Response.json({ error: `q must be at most ${MAX_QUERY_LENGTH} characters.` }, { status: 400 });
  }

  const limitParam = params.get("limit");
  const limit = limitParam === null ? DEFAULT_BRIDGE_LIMIT : Number(limitParam);
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_BRIDGE_LIMIT) {
    return Response.json({ error: `limit must be an integer from 1 to ${MAX_BRIDGE_LIMIT}.` }, { status: 400 });
  }

  const { total, bridges } = await searchBridges(query, { limit });
  return Response.json({ query, total, bridges });
}
