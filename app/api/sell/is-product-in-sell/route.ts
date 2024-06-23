import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { upc } = await req.json();

  if (!upc) {
    return new Response(JSON.stringify({ error: "upc is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const productInSell = await executeDBQuery(`
    SELECT * FROM public.sale
    WHERE upc = '${upc}'
  `);
  const exists = (productInSell.length > 0);
  return new Response(JSON.stringify({ exists }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
