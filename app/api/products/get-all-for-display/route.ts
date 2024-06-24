import { executeDBQuery } from "@/utils/db";

export async function GET(req: Request) {
  const products = await executeDBQuery(
    "SELECT id_product, product_name, producer, characteristics FROM public.product"
  );

  return Response.json(products);
}
