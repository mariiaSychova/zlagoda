export type TProduct = {
  id_product: number;
  category_number: number;
  product_name: string;
  characteristics: string;
  producer: string;
};

export type TProduct_Optional = {
  category_number?: number;
  product_name?: string;
  characteristics?: string;
  producer?: string;
};

export type TEmployee = {
  id_employee: number;
  empl_surname: string;
  empl_name: string;
  empl_patronymic: string;
  empl_role: "Cashier" | "Manager";
  salary: number;
  date_of_birth: string;
  date_of_start: string;
  phone_number: string;
  city: string;
  street: string;
  zip_code: number;
};

export type TCategory = {
  category_number: number;
  category_name: string;
};

export type TCategory_Optional = {
  category_name?: string;
};
