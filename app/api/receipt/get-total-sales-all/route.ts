import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { startDate, endDate } = await req.json();

  const query = `
    SELECT 
      e.empl_surname,
      SUM(s.selling_price * s.product_number) AS total_sales
    FROM 
      public.receipt AS r
    JOIN 
      public.employee AS e ON r.id_employee = e.id_employee
    JOIN 
      public.sale AS s ON r.check_number = s.check_number
    WHERE 
      r.print_date BETWEEN '${startDate}' AND '${endDate}'
    GROUP BY 
      e.empl_surname
    ORDER BY 
      total_sales DESC;`;

  const result = await executeDBQuery(query);
  return Response.json(result);
}
