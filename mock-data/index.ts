import { TEmployee } from "@/types";

export const mockUser: TEmployee = {
  id_employee: 1,
  empl_surname: "Surname",
  empl_name: "Name",
  empl_patronymic: "Patronimic",
  empl_role: "Manager",
  salary: 10000,
  date_of_birth: new Date("02-21-2003").toLocaleDateString(),
  date_of_start: new Date("02-17-2023").toLocaleDateString(),
  phone_number: "+38(***)**-**-***",
  city: "Kyiv",
  street: "Abc",
  zip_code: 51234,
};
