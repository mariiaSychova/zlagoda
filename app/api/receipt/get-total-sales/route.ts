import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { id_employee, startDate, endDate } = await req.json();

  const query = `
    SELECT 
      SUM(s.selling_price * s.product_number) AS total_sales
    FROM 
      public.receipt AS r
    JOIN 
      public.employee AS e ON r.id_employee = e.id_employee
    JOIN 
      public.sale AS s ON r.check_number = s.check_number
    WHERE 
      e.id_employee = '${id_employee}'
      AND r.print_date BETWEEN '${startDate}' AND '${endDate}'
    GROUP BY 
      e.id_employee;`;

  const result = await executeDBQuery(query);
  return Response.json(result[0]);
}
