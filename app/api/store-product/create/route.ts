import { TStoreProduct } from "@/types";
import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const data = (await req.json()) as TStoreProduct;

  await executeDBQuery(`
    INSERT INTO public.store_product 
    (upc, upc_prom, id_product, selling_price, products_number, promotional_product)
    VALUES 
    ('${data.upc}',
     '${data.upc_prom || ""}',
     ${data.id_product},
     ${data.selling_price},
     ${data.products_number},
     ${data.promotional_product})`);

  return Response.json({ message: "Store product created successfully" });
}
