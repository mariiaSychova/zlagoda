import { TProduct_Optional } from "@/types";
import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { id_product, data } = (await req.json()) as {
    id_product: number;
    data: TProduct_Optional;
  };

  const updates = Object.entries(data)
    .map(([key, value]) => `${key} = '${value}'`)
    .join(", ");

  await executeDBQuery(`
        UPDATE public.product SET ${updates} WHERE id_product = '${id_product}'
        `);

  return Response.json({ message: "Product updated successfully" });
}
