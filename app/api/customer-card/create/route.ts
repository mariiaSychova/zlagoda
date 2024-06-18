import { TCustomerCard } from "@/types";
import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const data = (await req.json()) as TCustomerCard;

  await executeDBQuery(`
        INSERT INTO public.customer_card 
        (card_number, cust_surname, cust_name, cust_patronymic, phone_number, city, street, zip_code, percent)
        VALUES 
        ('${data.card_number}',
        '${data.cust_surname}',
        '${data.cust_name}',
        '${data.cust_patronymic || ""}',
        '${data.phone_number}', '${data.city}',
        '${data.street}',
        '${data.zip_code}',
         ${data.percent})`);

  return Response.json({ message: "Customer card created successfully" });
}
