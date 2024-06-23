"use client";
import Header from "@/components/common/Header/Header";
import ProductItem from "@/components/pages/ProductsPage/ProductItem";
import { useData } from "@/context/DataContext";
import React from "react";
import "../../components/pages/ProductsPage/ProductsPage.css";

const page = () => {
  const { isLoading, categories, mariia_2, fetchMariia_2 } = useData();

  return (
    <div className="page-container">
      <Header />

      <div className={`page-inner-container ${isLoading ? "loading" : ""}`}>
        <div>
          {categories.map((category) => (
            <div
              key={category.category_number}
              onClick={() => fetchMariia_2(category.category_name)}
            >
              {category.category_name}
            </div>
          ))}
        </div>

        <div className="page-content">
          <div className="page-grid print">
            {mariia_2.map((el) => (
              <ProductItem
                item={{
                  ...el,
                  id_product: -1,
                  category_number: -1,
                  producer: "",
                }}
                state={"default"}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
