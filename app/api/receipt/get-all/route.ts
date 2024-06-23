import { executeDBQuery } from "@/utils/db";

export async function GET(req: Request) {
  const receipts = await executeDBQuery(`
    SELECT * FROM public.receipt
  `);

  return Response.json(receipts);
}
