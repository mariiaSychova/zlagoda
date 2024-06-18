import { TProduct } from "@/types";
import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const data = (await req.json()) as TProduct;

  await executeDBQuery(`
        INSERT INTO public.product
        (id_product, category_number, product_name, producer, characteristics)
        VALUES
        ('${data.id_product}',
        '${data.category_number}',
        '${data.product_name}',
        '${data.producer}',
        '${data.characteristics}')
        `);

  return Response.json({ message: "Product created successfully" });
}
