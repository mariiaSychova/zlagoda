import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { upc } = (await req.json()) as { upc: string };

  await executeDBQuery(`
    DELETE FROM public.store_product WHERE upc = '${upc}'
  `);

  return Response.json({ message: "Store product deleted successfully" });
}
