import { TCategory, TProduct } from "@/types"
import { executeDBQuery } from "@/utils/db"

export async function POST(req: Request) {
    const data = (await req.json()) as TCategory

    // await executeDBQuery("")

    return Response.json({})
}
