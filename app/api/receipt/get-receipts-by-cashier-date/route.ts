import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { surname, date } = await req.json();

  const query = `
    SELECT 
      r.check_number,
      r.print_date,
      r.sum_total,
      r.vat
    FROM 
      public.receipt AS r
    JOIN 
      public.employee AS e ON r.id_employee = e.id_employee
    WHERE 
      e.empl_surname = '${surname}'
      AND DATE(r.print_date) = '${date}'
    ORDER BY 
      r.print_date;`;

  const result = await executeDBQuery(query);
  return Response.json(result);
}
