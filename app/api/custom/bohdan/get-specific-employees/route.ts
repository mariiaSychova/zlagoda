import { executeDBQuery } from "@/utils/db";

export async function GET(req: Request) {
  const employees = await executeDBQuery(
    `SELECT e.id_employee, e.empl_name, e.empl_surname, e.empl_patronymic, e.empl_role
        FROM employee AS e
        WHERE NOT EXISTS (
            SELECT c.category_number
            FROM category AS c
                WHERE NOT EXISTS (
                SELECT c.category_number
                    FROM receipt AS r
                        INNER JOIN sale AS s ON s.check_number = r.check_number
                        INNER JOIN store_product AS sp ON sp.upc = s.upc
                        INNER JOIN product AS p ON p.id_product = sp.id_product
                        WHERE r.id_employee = e.id_employee AND p.category_number = c.category_number
                )
        )`
  );

  return Response.json(employees);
}
