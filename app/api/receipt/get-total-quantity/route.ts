import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { upc, startDate, endDate } = await req.json();

  const query = `
    SELECT 
      p.product_name,
      SUM(s.product_number) AS total_quantity_sold
    FROM 
      public.sale AS s
    JOIN 
      public.store_product AS sp ON s.UPC = sp.UPC
    JOIN 
      public.product AS p ON sp.id_product = p.id_product
    JOIN 
      public.receipt AS r ON s.check_number = r.check_number
    WHERE 
      sp.UPC = '${upc}'
      AND r.print_date BETWEEN '${startDate}' AND '${endDate}'
    GROUP BY 
      p.product_name;`;

  const result = await executeDBQuery(query);
  return Response.json(result[0]);
}
