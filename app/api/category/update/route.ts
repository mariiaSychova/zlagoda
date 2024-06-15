import { TCategory_Optional, TProduct_Optional } from "@/types"
import { executeDBQuery } from "@/utils/db"

export async function POST(req: Request) {
    const { id } = (await req.json()) as {
        id: number
        data: TCategory_Optional
    }

    // await executeDBQuery("")

    return Response.json({})
}
