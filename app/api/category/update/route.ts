import { TCategory_Optional, TProduct_Optional } from "@/types";
import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { category_number, data } = (await req.json()) as {
    category_number: number;
    data: TCategory_Optional;
  };

  const updates = Object.entries(data)
    .map(([key, value]) => `${key} = '${value}'`)
    .join(", ");

  await executeDBQuery(`
        UPDATE public.category SET ${updates} WHERE category_number = '${category_number}'
        `);

  return Response.json({ message: "Category updated successfully" });
}
