import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { surname } = await req.json();

  const query = `
    SELECT 
      empl_surname,
      phone_number,
      city,
      street,
      zip_code
    FROM 
      public.employee
    WHERE 
      empl_surname = '${surname}';`;

  const result = await executeDBQuery(query);
  return Response.json(result[0]);
}
