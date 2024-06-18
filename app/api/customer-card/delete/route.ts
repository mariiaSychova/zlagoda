import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { card_number } = (await req.json()) as { card_number: string };

  await executeDBQuery(`
        DELETE FROM public.customer_card WHERE card_number = '${card_number}'
    `);

  return Response.json({ message: "Customer card deleted successfully" });
}
