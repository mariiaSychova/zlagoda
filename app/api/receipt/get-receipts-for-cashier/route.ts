import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { id_employee, startDate, endDate } = await req.json();

  const query = `
    SELECT 
      r.check_number,
      r.print_date,
      r.sum_total,
      r.vat,
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
      store_product AS sp ON s.UPC = sp.UPC
    JOIN 
      product AS p ON sp.id_product = p.id_product
    WHERE 
      e.id_employee = '${id_employee}'
      AND r.print_date BETWEEN '${startDate}' AND '${endDate}'
    ORDER BY 
      r.print_date;`;

  const result = await executeDBQuery(query);
  return Response.json(result);
}
