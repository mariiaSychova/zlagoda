import { TCategory, TCategory_Optional } from "@/types";
import axios from "axios";

export const getAllCategoriesInnerRoute = async (): Promise<TCategory[]> => {
  const data = await axios.get("/api/category/get-all");

  return data.data;
};

export const createCategoryInnerRoute = async (
  data: TCategory
): Promise<void> => {
  await axios.post("/api/category/create", data);
};

export const updateCategoryInnerRoute = async (
  category_number: number,
  data: TCategory_Optional
): Promise<void> => {
  await axios.post("/api/category/update", { category_number, data });
};

export const deleteCategoryInnerRoute = async (
  category_number: number
): Promise<void> => {
  await axios.post("/api/category/delete", { category_number });
};
