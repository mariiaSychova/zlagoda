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

export type TProductForDisplay = {
  id_product: number;
  product_name: string;
  producer: string;
};

export type TEmployee = {
  id_employee: number;
  empl_surname: string;
  empl_name: string;
  empl_patronymic?: string;
  empl_role: "Касир" | "Менеджер";
  salary: number;
  date_of_birth: string;
  date_of_start: string;
  phone_number: string;
  city: string;
  street: string;
  zip_code: number;
  email: string;
  password?: string;
};

export type TEmployeeForDisplay = {
  id_employee: number;
  empl_surname: string;
  empl_name: string;
  empl_patronymic?: string;
};

export type TCategory = {
  category_number: number;
  category_name: string;
};

export type TCategory_Optional = {
  category_name?: string;
};

export type TCustomerCard = {
  card_number: string;
  cust_surname: string;
  cust_name: string;
  cust_patronymic?: string;
  phone_number: string;
  city?: string;
  street?: string;
  zip_code?: string;
  percent: number;
};

export type TCustomerCard_Optional = {
  cust_surname?: string;
  cust_name?: string;
  cust_patronymic?: string;
  phone_number?: string;
  city?: string;
  street?: string;
  zip_code?: string;
  percent?: number;
};

export type TCustomerCardForDisplay = {
  card_number: string;
  cust_surname: string;
  cust_name: string;
  cust_patronymic?: string;
  percent: number;
};

export type TStoreProduct = {
  upc: string;
  upc_prom?: string;
  id_product: number;
  selling_price: number;
  products_number: number;
  promotional_product: boolean;
};

export type TStoreProduct_Optional = {
  upc_prom?: string;
  id_product?: number;
  selling_price?: number;
  products_number?: number;
  promotional_product?: boolean;
};


export type TStoreProductForDisplay = {
  upc: string;
  product_name: string;
  producer: string;
  characteristics: string;
  products_number: number;
  selling_price: number;
}

export type TMariia_1 = {
  card_number: number;
  cust_name: string;
  cust_surname: string;
};

export type TMariia_2 = {
  product_name: string;
  characteristics: string;
};

export type TSell = {
  upc: string;
  check_number: string;
  product_number: number;
  selling_price: number;
};

export type TReceipt = {
  check_number: string;
  id_employee: string;
  card_number?: string;
  print_date: string;
  sum_total: number;
  vat: number;
};
