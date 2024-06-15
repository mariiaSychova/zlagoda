import { TProduct } from "@/types"
import { executeDBQuery } from "@/utils/db"

export async function POST(req: Request) {
    const data = (await req.json()) as TProduct

    // await executeDBQuery("")

    return Response.json({})
}
