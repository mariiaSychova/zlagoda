import axios from "axios";

export const getCustomersPuchasesByCategories = async (params: {
  cardNumber: string;
}): Promise<[]> => {
  const response = await axios.post(
    "/api/custom/bohdan/get-purch-by-cat",
    params
  );

  return response.data;
};

export const getSpecificEmployee = async (): Promise<[]> => {
  const response = await axios.get("/api/custom/bohdan/get-specific-employees");

  return response.data;
};
