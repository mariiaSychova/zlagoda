import { executeDBQuery } from "@/utils/db";

export async function GET(req: Request) {
  const storeProducts = await executeDBQuery(
    `SELECT 
      sp.upc, 
      p.product_name, 
      p.producer,
      p.characteristics,
      sp.selling_price,
      sp.products_number,
      sp.upc_prom,
      sp.id_product,
      sp.promotional_product
    FROM 
      store_product sp
    INNER JOIN 
      product p ON sp.id_product = p.id_product;`
  );

  return Response.json(storeProducts);
}
