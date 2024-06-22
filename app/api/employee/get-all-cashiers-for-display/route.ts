import { executeDBQuery } from "@/utils/db";

export async function GET(req: Request) {
  const employees = await executeDBQuery(`
    SELECT id_employee, empl_surname, empl_name, empl_patronymic
    FROM public.employee
    WHERE empl_role = 'Касир';
  `);

  return new Response(JSON.stringify(employees), {
    headers: { "Content-Type": "application/json" },
  });
}
