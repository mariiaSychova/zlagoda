import { TEmployee } from "@/types";
import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { id_employee, data } = (await req.json()) as {
    id_employee: string;
    data: Partial<TEmployee>;
  };

  const updates = Object.entries(data)
    .map(([key, value]) => `${key} = '${value}'`)
    .join(", ");

  console.log(
    `UPDATE public.employee SET ${updates} WHERE id_employee = '${id_employee}'`
  );

  await executeDBQuery(
    `UPDATE public.employee SET ${updates} WHERE id_employee = '${id_employee}'`
  );

  return new Response(
    JSON.stringify({ message: "Employee updated successfully" }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}
