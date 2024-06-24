import { executeDBQuery } from "@/utils/db";
import { TSell } from "@/types";

export async function PUT(req: Request) {
  const data = (await req.json()) as TSell;
  await executeDBQuery(`
    UPDATE public.sale 
    SET
      product_number = ${data.product_number},
      selling_price = ${data.selling_price}
    WHERE 
      upc = '${data.upc}' AND check_number = '${data.check_number}'
  `);

  return Response.json({ message: "Sale record updated successfully" });
}
