import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useFilter } from "@/context/FilterContext";
import { TProduct } from "@/types";
import React, { FC, useEffect, useState } from "react";

type Props = {
  item?: TProduct;
  state: "default" | "edit" | "add";
};

const ProductItem: FC<Props> = ({ item, state }) => {
  const { isAdmin } = useAuth();
  const { products, createProduct, updateProduct, deleteProduct, categories } =
    useData();
  const { editItemId, setEditItemId } = useFilter();

  const [editName, setEditName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState(-1);
  const [editDesc, setEditDesc] = useState("");
  const [editProducer, setEditProducer] = useState("");

  useEffect(() => {
    if (!item) return;

    if (state === "edit") {
      setEditName(item.product_name);
      setEditCategoryId(item.category_number);
      setEditDesc(item.characteristics);
      setEditProducer(item.producer);
    }
  }, [state]);

  if (state === "add") {
    if (!isAdmin) return null;

    const handleAdd = async () => {
      if (editItemId !== -1) return;

      const newId = (Math.max(...products.map((p) => p.id_product)) || 0) + 1;

      await createProduct({
        id_product: newId,
        category_number: 1,
        product_name: "",
        characteristics: "",
        producer: "",
      });
      setEditItemId(newId);
    };

    return <div className="item item-add" onClick={handleAdd} />;
  }

  if (!item) return null;

  const renderControlBtns = () => {
    if (!isAdmin || (editItemId !== -1 && editItemId !== item.id_product))
      return null;

    const handleSave = async () => {
      if (!editName || !editCategoryId || !editDesc) return;

      const isSame =
        editName === item.product_name &&
        editCategoryId === item.category_number &&
        editDesc === item.characteristics;

      if (!isSame) {
        await updateProduct(item.id_product, {
          category_number: editCategoryId,
          product_name: editName,
          characteristics: editDesc,
          producer: editProducer,
        });
      }

      setEditItemId(-1);
    };

    const handleEdit = () => setEditItemId(item.id_product);

    const handleDelete = () => deleteProduct(item.id_product);

    if (state === "edit") {
      return (
        <button className="save-item" onClick={handleSave}>
          S
        </button>
      );
    }

    return (
      <>
        <button className="edit-item" onClick={handleEdit}>
          E
        </button>
        <button className="delete-item" onClick={handleDelete}>
          x
        </button>
      </>
    );
  };

  if (state === "edit") {
    return (
      <div className="item item-edit">
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          placeholder="Name..."
        />
        <select
          onChange={(e) => {
            const newCategory = categories.find(
              (c) => c.category_number === +e.target.value
            );
            if (!newCategory) return;
            setEditCategoryId(newCategory.category_number);
          }}
        >
          {categories.map((category) => (
            <option
              key={category.category_number}
              value={category.category_number}
              selected={category.category_number === editCategoryId}
            >
              {category.category_name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          placeholder="Characteristics..."
        />
        <input
          type="text"
          value={editProducer}
          onChange={(e) => setEditProducer(e.target.value)}
          placeholder="Producer..."
        />

        {renderControlBtns()}
      </div>
    );
  }

  return (
    <div className="item product-item">
      {item.id_product ? <span>Id: {item.id_product}</span> : null}
      <span>Name: {item.product_name}</span>
      {item.category_number ? (
        <span>Category: {item.category_number}</span>
      ) : null}
      <span>Characteristics: {item.characteristics}</span>
      {item.producer ? <span>Producer: {item.producer}</span> : null}

      {renderControlBtns()}
    </div>
  );
};

export default ProductItem;
