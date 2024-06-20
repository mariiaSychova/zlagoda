import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { id_employee } = (await req.json()) as { id_employee: string };
  await executeDBQuery(
    `DELETE FROM public.employee WHERE id_employee = '${id_employee}'`
  );

  return new Response(
    JSON.stringify({ message: "Employee deleted successfully" }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}
