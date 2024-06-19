import { TEmployee } from "@/types";
import axios from "axios";
import { formatDate, parseDate } from "@/utils/formatDate";

export const getAllEmployeesInnerRoute = async (): Promise<TEmployee[]> => {
  const response = await axios.get("/api/employee/get-all");
  const employees = response.data as TEmployee[];

  const formattedEmployees = employees.map((employee) => ({
    ...employee,
    date_of_birth: formatDate(employee.date_of_birth),
    date_of_start: formatDate(employee.date_of_start),
  }));

  return formattedEmployees;
};

export const createEmployeeInnerRoute = async (
  data: TEmployee
): Promise<void> => {
  const formattedData = {
    ...data,
    date_of_birth: parseDate(data.date_of_birth),
    date_of_start: parseDate(data.date_of_start),
  };
  await axios.post("/api/employee/create", formattedData);
};

export const updateEmployeeInnerRoute = async (
  id_employee: string,
  data: Partial<TEmployee>
): Promise<void> => {
  const formattedData = {
    ...data,
    date_of_birth: parseDate(data.date_of_birth),
    date_of_start: parseDate(data.date_of_start),
  };
  await axios.post("/api/employee/update", {
    id_employee,
    data: formattedData,
  });
};

export const deleteEmployeeInnerRoute = async (
  id_employee: number
): Promise<void> => {
  await axios.post("/api/employee/delete", { id_employee });
};
