import { TCustomerCard, TCustomerCard_Optional } from "@/types";
import axios from "axios";

export const getAllCustomerCardsInnerRoute = async (): Promise<
  TCustomerCard[]
> => {
  const data = await axios.get("/api/customer-card/get-all");
  return data.data;
};

export const createCustomerCardInnerRoute = async (
  data: TCustomerCard
): Promise<void> => {
  await axios.post("/api/customer-card/create", data);
};

export const updateCustomerCardInnerRoute = async (
  card_number: string,
  data: TCustomerCard_Optional
): Promise<void> => {
  await axios.post("/api/customer-card/update", { card_number, data });
};

export const deleteCustomerCardInnerRoute = async (
  card_number: string
): Promise<void> => {
  await axios.post("/api/customer-card/delete", { card_number });
};
