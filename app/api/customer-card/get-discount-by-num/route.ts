import { executeDBQuery } from "@/utils/db";
export async function POST(req: Request) {
  const { card_number } = await req.json();

  const result = await executeDBQuery(`
      SELECT percent
      FROM public.customer_card
      WHERE card_number = '${card_number}'
    `);

  return new Response(JSON.stringify(result[0]), {
    headers: { "Content-Type": "application/json" },
  });
}
