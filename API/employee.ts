import { TEmployee } from "@/types";
import axios from "axios";

export const getAllEmployeesInnerRoute = async (): Promise<TEmployee[]> => {
  const data = await axios.get("/api/employee/get-all");
  return data.data;
};

export const createEmployeeInnerRoute = async (
  data: TEmployee
): Promise<void> => {
  await axios.post("/api/employee/create", data);
};

export const updateEmployeeInnerRoute = async (
  id_employee: string,
  data: Partial<TEmployee>
): Promise<void> => {
  await axios.post("/api/employee/update", { id_employee, data });
};

export const deleteEmployeeInnerRoute = async (
  id_employee: number
): Promise<void> => {
  await axios.post("/api/employee/delete", { id_employee });
};
