import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { category_number } = (await req.json()) as { category_number: number };

  await executeDBQuery(`
        DELETE FROM public.category WHERE category_number = '${category_number}'
        `);

  return Response.json({ message: "Category deleted successfully" });
}
