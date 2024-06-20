import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { id_product } = (await req.json()) as { id_product: number };

  await executeDBQuery(
    `DELETE FROM public.product WHERE id_product = '${id_product}'`
  );

  return Response.json({ message: "Product deleted successfully" });
}
