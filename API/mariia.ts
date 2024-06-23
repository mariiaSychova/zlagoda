import { TMariia_1, TMariia_2 } from "@/types"
import axios from "axios"

export const getMariia1InnerRoute = async (): Promise<TMariia_1[]> => {
    const data = await axios.get("/api/custom/mariia/query-1")
    return data.data
}

export const getMariia2InnerRoute = async (
    category_name: string
): Promise<TMariia_2[]> => {
    const data = await axios.post("/api/custom/mariia/query-2", {
        category_name,
    })
    return data.data
}
