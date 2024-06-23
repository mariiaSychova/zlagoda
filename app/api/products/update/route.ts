import { TProduct_Optional } from "@/types";
import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { id, data } = (await req.json()) as {
    id: number;
    data: TProduct_Optional;
  };

  const updates = Object.entries(data)
    .map(([key, value]) => `${key} = '${value}'`)
    .join(", ");

  await executeDBQuery(`
        UPDATE public.product SET ${updates} WHERE id_product = '${id}'
        `);

  return Response.json({ message: "Product updated successfully" });
}
