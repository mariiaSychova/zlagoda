import { executeDBQuery } from "@/utils/db";

export async function GET(req: Request) {
  const employees = await executeDBQuery("SELECT * FROM public.employee");

  return new Response(JSON.stringify(employees), {
    headers: { "Content-Type": "application/json" },
  });
}
