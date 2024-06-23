import { executeDBQuery } from "@/utils/db";

export async function PUT(req: Request) {
  const { upc, quantity } = (await req.json()) as {
    upc: string;
    quantity: number;
  };

  try {
    await executeDBQuery(`
      UPDATE public.store_product
      SET products_number = ${quantity}
      WHERE upc = '${upc}'
    `);

    return new Response(
      JSON.stringify({ message: "Store product updated successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error updating store product:", error);
    return new Response(
      JSON.stringify({ message: "Failed to update store product" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
