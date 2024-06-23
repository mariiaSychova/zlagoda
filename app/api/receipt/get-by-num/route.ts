import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { checkNumber } = await req.json();

  if (!checkNumber) {
    return new Response(JSON.stringify({ error: "check_number is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const receiptArray = await executeDBQuery(`
      SELECT *
      FROM public.receipt
      WHERE check_number = '${checkNumber}'
      LIMIT 1
  `);

  if (receiptArray.length === 0) {
    return new Response(JSON.stringify({ error: "Receipt not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const receipt = receiptArray[0];
  return Response.json(receipt);
}
