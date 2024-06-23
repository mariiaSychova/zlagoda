"use client";
import Header from "@/components/common/Header/Header";
import CustomerCardTable from "@/components/pages/CustomerCardsPage/CustomerCardTable";
import { useData } from "@/context/DataContext";
import React from "react";

const page = () => {
  const { mariia_1 } = useData();

  return (
    <div className="page-container">
      <Header />

      <CustomerCardTable
        customerCards={mariia_1 as any}
        editingCardNumber={null}
        errors={{}}
        handleEdit={() => {}}
        handleDelete={() => {}}
        handleSave={() => {}}
        handleChange={() => {}}
      />
    </div>
  );
};

export default page;
