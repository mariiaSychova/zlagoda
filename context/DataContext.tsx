"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  createProductInnerRoute,
  deleteProductInnerRoute,
  getAllProductsInnerRoute,
  updateProductInnerRoute,
} from "@/API/products";
import {
  TCategory,
  TCategory_Optional,
  TCustomerCard,
  TCustomerCard_Optional,
  TMariia_1,
  TMariia_2,
  TProduct,
  TProduct_Optional,
} from "@/types";
import {
  createCategoryInnerRoute,
  deleteCategoryInnerRoute,
  getAllCategoriesInnerRoute,
  updateCategoryInnerRoute,
} from "@/API/category";
import {
  getAllCustomerCardsInnerRoute,
  createCustomerCardInnerRoute,
  updateCustomerCardInnerRoute,
  deleteCustomerCardInnerRoute,
} from "@/API/customer-card";
import { getMariia1InnerRoute, getMariia2InnerRoute } from "@/API/mariia";

type FetchType = {
  isLoading: boolean;

  products: TProduct[];
  createProduct: (v: TProduct) => Promise<void>;
  updateProduct: (id: number, v: TProduct_Optional) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;

  categories: TCategory[];
  createCategory: (v: TCategory) => Promise<void>;
  updateCategory: (id: number, v: TCategory_Optional) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;

  customerCards: TCustomerCard[];
  createCustomerCard: (v: TCustomerCard) => Promise<void>;
  updateCustomerCard: (
    card_number: string,
    v: TCustomerCard_Optional
  ) => Promise<void>;
  deleteCustomerCard: (card_number: string) => Promise<void>;

  mariia_1: TMariia_1[];
  mariia_2: TMariia_2[];
  fetchMariia_2: (v: string) => void;
};

export const DataContext = React.createContext<FetchType>({
  isLoading: false,

  products: [],
  createProduct: () => new Promise(() => {}),
  updateProduct: () => new Promise(() => {}),
  deleteProduct: () => new Promise(() => {}),

  categories: [],
  createCategory: () => new Promise(() => {}),
  updateCategory: () => new Promise(() => {}),
  deleteCategory: () => new Promise(() => {}),

  customerCards: [],
  createCustomerCard: () => new Promise(() => {}),
  updateCustomerCard: () => new Promise(() => {}),
  deleteCustomerCard: () => new Promise(() => {}),

  mariia_1: [],
  mariia_2: [],
  fetchMariia_2: () => {},
});

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { isReady } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<TProduct[]>([]);
  const [categories, setCategories] = useState<TCategory[]>([]);
  const [customerCards, setCustomerCards] = useState<TCustomerCard[]>([]);

  // Mariia
  const [mariia_1, setMariia_1] = useState<TMariia_1[]>([]);
  const [mariia_2, setMariia_2] = useState<TMariia_2[]>([]);

  useEffect(() => {
    Promise.all([
      fetchProducts(),
      fetchCategories(),
      fetchMariia_1(),
      fetchCustomerCards(),
    ]).then(() => setIsLoading(false));
  }, []);
  // PRODUCTS
  const fetchProducts = async () => {
    await getAllProductsInnerRoute().then((res) => setProducts(res));
  };
  const createProduct = async (data: TProduct) => {
    setIsLoading(true);
    await createProductInnerRoute(data);
    await fetchProducts();
    setIsLoading(false);
  };
  const updateProduct = async (id: number, data: TProduct_Optional) => {
    setIsLoading(true);
    await updateProductInnerRoute(id, data);
    await fetchProducts();
    setIsLoading(false);
  };
  const deleteProduct = async (id: number) => {
    setIsLoading(true);
    await deleteProductInnerRoute(id);
    await fetchProducts();
    setIsLoading(false);
  };

  // CATEGORIES
  const fetchCategories = async () => {
    await getAllCategoriesInnerRoute().then((res) => setCategories(res));
  };
  const createCategory = async (data: TCategory) => {
    setIsLoading(true);
    await createCategoryInnerRoute(data);
    await fetchCategories();
    setIsLoading(false);
  };
  const updateCategory = async (id: number, data: TCategory_Optional) => {
    setIsLoading(true);
    await updateCategoryInnerRoute(id, data);
    await fetchCategories();
    setIsLoading(false);
  };
  const deleteCategory = async (id: number) => {
    setIsLoading(true);
    await deleteCategoryInnerRoute(id);
    await fetchCategories();
    setIsLoading(false);
  };

  // CUSTOMER CARDS
  const fetchCustomerCards = async () => {
    await getAllCustomerCardsInnerRoute().then((res) => setCustomerCards(res));
  };
  const createCustomerCard = async (data: TCustomerCard) => {
    setIsLoading(true);
    await createCustomerCardInnerRoute(data);
    await fetchCustomerCards();
    setIsLoading(false);
  };
  const updateCustomerCard = async (
    card_number: string,
    data: TCustomerCard_Optional
  ) => {
    setIsLoading(true);
    await updateCustomerCardInnerRoute(card_number, data);
    await fetchCustomerCards();
    setIsLoading(false);
  };
  const deleteCustomerCard = async (card_number: string) => {
    setIsLoading(true);
    await deleteCustomerCardInnerRoute(card_number);
    await fetchCustomerCards();
    setIsLoading(false);
  };

  // MARIIA
  const fetchMariia_1 = async () => {
    await getMariia1InnerRoute().then((res) => setMariia_1(res));
  };
  const fetchMariia_2 = async (category_name: string) => {
    await getMariia2InnerRoute(category_name).then((res) => setMariia_2(res));
  };

  return (
    <DataContext.Provider
      value={{
        isLoading,

        products,
        createProduct,
        updateProduct,
        deleteProduct,

        categories,
        createCategory,
        updateCategory,
        deleteCategory,

        customerCards,
        createCustomerCard,
        updateCustomerCard,
        deleteCustomerCard,

        mariia_1,
        mariia_2,
        fetchMariia_2,
      }}
    >
      {isReady ? children : null}
    </DataContext.Provider>
  );
};

export const useData = () => React.useContext<FetchType>(DataContext);
