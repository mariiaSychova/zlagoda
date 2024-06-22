import { executeDBQuery } from "@/utils/db";
export async function GET(req: Request) {
  const products = await executeDBQuery(
    "SELECT card_number, cust_name, cust_surname, cust_patronymic FROM public.customer_card"
  );

  return Response.json(products);
}
