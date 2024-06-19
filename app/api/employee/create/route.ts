import { TEmployee } from "@/types";
import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const data = (await req.json()) as TEmployee;

  await executeDBQuery(`
    INSERT INTO public.employee 
    (id_employee, empl_surname, empl_name, empl_patronymic, empl_role, salary, date_of_birth, date_of_start, phone_number, city, street, zip_code, email, password)
    VALUES 
    (${data.id_employee},
    '${data.empl_surname}',
    '${data.empl_name}',
    '${data.empl_patronymic || ""}',
    '${data.empl_role}',
    ${data.salary},
    '${data.date_of_birth}',
    '${data.date_of_start}',
    '${data.phone_number}',
    '${data.city}',
    '${data.street}',
    ${data.zip_code},
    '${data.email}',
    '${data.password}')
  `);

  return new Response(
    JSON.stringify({ message: "Employee created successfully" }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}
