import { executeDBQuery } from "@/utils/db";

export async function GET(req: Request) {
  const products = await executeDBQuery("SELECT * FROM public.product");

  return Response.json(products);
}
