import { TCategory } from "@/types";
import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const data = (await req.json()) as TCategory;

  await executeDBQuery(`
        INSERT INTO public.category
        (category_number, category_name)
        VALUES
        ('${data.category_number}',
        '${data.category_name}')
        `);

  return Response.json({ message: "Category created successfully" });
}
