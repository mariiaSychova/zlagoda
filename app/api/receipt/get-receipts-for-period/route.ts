import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { startDate, endDate } = await req.json();

  const query = `
    SELECT 
      r.check_number,
      r.print_date,
      r.sum_total,
      r.vat,
      e.empl_surname,
      p.product_name,
      s.product_number,
      s.selling_price
    FROM 
      public.receipt AS r
    JOIN 
      public.employee AS e ON r.id_employee = e.id_employee
    JOIN 
      public.sale AS s ON r.check_number = s.check_number
    JOIN 
      public.store_product AS sp ON s.UPC = sp.UPC
    JOIN 
      public.product AS p ON sp.id_product = p.id_product
    WHERE 
      r.print_date BETWEEN '${startDate}' AND '${endDate}'
    ORDER BY 
      r.print_date;`;

  const result = await executeDBQuery(query);
  return Response.json(result);
}
