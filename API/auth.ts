import { TEmployee } from "@/types"
import axios from "axios"

export const loginInnerRoute = async (
    email: string,
    password: string
): Promise<{
    status: "success" | "error"
    user: TEmployee | null
}> => {
    const data = await axios.post("/api/auth/login", { email, password })

    return data.data
}

export const getUserInnerRoute = async (
    id: string
): Promise<TEmployee | null> => {
    const data = await axios.post("/api/auth/get-user", { id })

    return data.data
}
