import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { checkNumber } = await req.json();

  const query = `
    SELECT 
      r.check_number,
      r.print_date,
      r.sum_total,
      r.vat,
      e.empl_surname,
      cc.card_number,
      cc.cust_surname,
      p.product_name,
      s.selling_price,
      s.product_number
    FROM 
      public.receipt AS r
    JOIN 
      public.employee AS e ON r.id_employee = e.id_employee
    LEFT JOIN 
      public.customer_card AS cc ON r.card_number = cc.card_number
    JOIN 
      public.sale AS s ON r.check_number = s.check_number
    JOIN 
      public.store_product AS sp ON s.upc = sp.upc
    JOIN 
      public.product AS p ON sp.id_product = p.id_product
    WHERE 
      r.check_number = '${checkNumber}';`;

  const result = await executeDBQuery(query);
  return Response.json(result);
}
