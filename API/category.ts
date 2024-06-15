import { TCategory, TCategory_Optional } from "@/types"
import axios from "axios"

export const getAllCategoriesInnerRoute = async (): Promise<TCategory[]> => {
    const data = await axios.get("/api/category/get-all")

    return data.data
}

export const createCategoryInnerRoute = async (
    data: TCategory
): Promise<void> => {
    await axios.post("/api/category/create", data)
}

export const updateCategoryInnerRoute = async (
    id: number,
    data: TCategory_Optional
): Promise<void> => {
    await axios.post("/api/category/create", { id, data })
}

export const deleteCategoryInnerRoute = async (id: number): Promise<void> => {
    await axios.post("/api/category/delete", { id })
}
