"use client"

import React, { useEffect, useMemo } from "react"
import "./ProductsPage.css"
import ProductItem from "./ProductItem"
import Search, { TSortOption } from "@/components/common/Search/Search"
import { TProduct } from "@/types"
import { useData } from "@/context/DataContext"
import { useFilter } from "@/context/FilterContext"

const sortOptions: TSortOption[] = [
    {
        id: 1,
        name: "By ID ASC",
        callback: (a: TProduct, b: TProduct) => a.id_product - b.id_product,
    },
    {
        id: 2,
        name: "By ID DSC",
        callback: (a: TProduct, b: TProduct) => b.id_product - a.id_product,
    },
    {
        id: 3,
        name: "By Name ASC",
        callback: (a: TProduct, b: TProduct) =>
            a.product_name.localeCompare(b.product_name),
    },
    {
        id: 4,
        name: "By Name DSC",
        callback: (a: TProduct, b: TProduct) =>
            b.product_name.localeCompare(a.product_name),
    },
]

const ProductsPage = () => {
    const { isLoading, products, categories } = useData()
    const {
        search,
        sort,
        filterCategoryId,
        setFilterCategoryId,
        setSortOptions,
        renderFilter,
        editItemId,
    } = useFilter()

    useEffect(() => {
        setSortOptions(sortOptions)
    }, [])

    const filterProductItems = useMemo(() => {
        const result = products
            .filter((item) => item.product_name.includes(search))
            .filter(
                (item) =>
                    item.category_number === filterCategoryId ||
                    filterCategoryId === -1
            )
        result.sort(sort.callback)
        return result
    }, [products, search, sort, filterCategoryId])

    const existingCategories = useMemo(() => {
        const uniqueCategoryIds = Array.from(
            new Set(products.map((item) => item.category_number))
        )
        return categories.filter((category) =>
            uniqueCategoryIds.includes(category.category_number)
        )
    }, [products])

    const renderFilterContent = () => {
        return (
            <div className="categories">
                <div className="title">Category</div>

                {existingCategories.map((category) => (
                    <div
                        key={category.category_number}
                        className={`category ${
                            category.category_number === filterCategoryId
                                ? "selected"
                                : ""
                        }`}
                        onClick={() =>
                            setFilterCategoryId(category.category_number)
                        }
                    >
                        {category.category_name}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className={`page-inner-container ${isLoading ? "loading" : ""}`}>
            <Search items={filterProductItems} />

            <div className="page-content">
                {renderFilter(renderFilterContent())}

                <div className="page-grid print">
                    {filterProductItems.map((item) => (
                        <ProductItem
                            item={item}
                            state={
                                editItemId === item.id_product
                                    ? "edit"
                                    : "default"
                            }
                        />
                    ))}

                    <ProductItem state={"add"} />
                </div>
            </div>
        </div>
    )
}

export default ProductsPage
