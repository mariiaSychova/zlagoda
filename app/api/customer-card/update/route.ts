import { TCustomerCard_Optional } from "@/types";
import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { card_number, data } = (await req.json()) as {
    card_number: string;
    data: TCustomerCard_Optional;
  };

  const updates = Object.entries(data)
    .map(([key, value]) => `${key} = '${value}'`)
    .join(", ");

  await executeDBQuery(`
        UPDATE public.customer_card SET ${updates} WHERE card_number = '${card_number}'
    `);

  return Response.json({ message: "Customer card updated successfully" });
}
