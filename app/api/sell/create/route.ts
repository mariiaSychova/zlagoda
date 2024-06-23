import { TSell } from "@/types";
import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const data = (await req.json()) as TSell;

  await executeDBQuery(`
    INSERT INTO public.sale 
    (upc, check_number, product_number, selling_price)
    VALUES 
    ('${data.upc}',
     '${data.check_number}',
     ${data.product_number},
     ${data.selling_price})
  `);

  return Response.json({ message: "Sale record created successfully" });
}
