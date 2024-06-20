import { TReceipt } from "@/types";
import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const data = (await req.json()) as TReceipt;

  await executeDBQuery(`
    INSERT INTO public.receipt 
    (check_number, id_employee, card_number, print_date, sum_total, vat)
    VALUES 
    ('${data.check_number}',
     '${data.id_employee}',
     '${data.card_number || ""}',
     '${data.print_date}',
     ${data.sum_total},
     ${data.vat})
  `);

  for (const product of data.products) {
    await executeDBQuery(`
      INSERT INTO public.sell 
      (upc, check_number, product_number, selling_price)
      VALUES 
      ('${product.upc}',
       '${data.check_number}',
       ${product.product_number},
       ${product.selling_price})
    `);
  }

  return Response.json({ message: "Receipt created successfully" });
}
