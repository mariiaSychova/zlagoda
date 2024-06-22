import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { check_number } = await req.json();

  if (!check_number) {
    return new Response(JSON.stringify({ error: "check_number is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const sales = await executeDBQuery(`
    SELECT * FROM public.sale
    WHERE check_number = '${check_number}'
  `);

  return new Response(JSON.stringify(sales), {
    headers: { "Content-Type": "application/json" },
  });
}
