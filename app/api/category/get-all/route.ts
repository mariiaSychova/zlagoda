import { executeDBQuery } from "@/utils/db";

export async function GET(req: Request) {
  const categories = await executeDBQuery("SELECT * FROM public.category");

  return Response.json(categories);
}
