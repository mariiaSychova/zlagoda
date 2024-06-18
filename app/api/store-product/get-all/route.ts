import { executeDBQuery } from "@/utils/db";

export async function GET(req: Request) {
  const storeProducts = await executeDBQuery(
    "SELECT * FROM public.store_product"
  );

  return Response.json(storeProducts);
}
