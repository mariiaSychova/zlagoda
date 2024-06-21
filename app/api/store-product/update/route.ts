import { TStoreProduct_Optional } from "@/types";
import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { upc, data } = (await req.json()) as {
    upc: string;
    data: TStoreProduct_Optional;
  };

  const updates = Object.entries(data)
    .map(([key, value]) => {
      return value === null ? `${key} = NULL` : `${key} = '${value}'`;
    })
    .join(", ");
  await executeDBQuery(`
    UPDATE public.store_product SET ${updates} WHERE upc = '${upc}'
  `);

  return Response.json({ message: "Store product updated successfully" });
}
