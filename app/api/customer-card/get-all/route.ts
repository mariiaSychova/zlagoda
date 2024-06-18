import { executeDBQuery } from "@/utils/db";

export async function GET(req: Request) {
  const customerCards = await executeDBQuery(
    "SELECT * FROM public.customer_card"
  );

  return Response.json(customerCards);
}
