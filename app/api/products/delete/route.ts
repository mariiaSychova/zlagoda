import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { id } = (await req.json()) as { id: number };

  await executeDBQuery(`DELETE FROM public.product WHERE id_product = '${id}'`);

  return Response.json({ message: "Product deleted successfully" });
}
