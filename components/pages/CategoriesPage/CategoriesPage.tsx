"use client"

import React, { useEffect, useMemo } from "react"
import "./CategoriesPage.css"
import Search, { TSortOption } from "@/components/common/Search/Search"
import { useFilter } from "@/context/FilterContext"
import { useData } from "@/context/DataContext"
import CategoryItem from "./CategoryItem"
import { TCategory } from "@/types"

const sortOptions: TSortOption[] = [
    {
        id: 1,
        name: "By ID ASC",
        callback: (a: TCategory, b: TCategory) =>
            a.category_number - b.category_number,
    },
    {
        id: 2,
        name: "By ID DSC",
        callback: (a: TCategory, b: TCategory) =>
            b.category_number - a.category_number,
    },
    {
        id: 3,
        name: "By Name ASC",
        callback: (a: TCategory, b: TCategory) =>
            a.category_name.localeCompare(b.category_name),
    },
    {
        id: 4,
        name: "By Name DSC",
        callback: (a: TCategory, b: TCategory) =>
            b.category_name.localeCompare(a.category_name),
    },
]

const CategoriesPage = () => {
    const { isLoading, categories } = useData()
    const { search, sort, setSortOptions, renderFilter, editItemId } =
        useFilter()

    useEffect(() => {
        setSortOptions(sortOptions)
    }, [])

    const filterCategoryItems = useMemo(() => {
        const result = categories.filter((item) =>
            item.category_name.includes(search)
        )

        result.sort(sort.callback)

        return result
    }, [categories, search, sort])

    const renderFilterContent = () => {
        return <></>
    }

    return (
        <div className={`page-inner-container ${isLoading ? "loading" : ""}`}>
            <Search items={filterCategoryItems} />

            <div className="page-content">
                {renderFilter(renderFilterContent())}

                <div className="page-grid print">
                    {filterCategoryItems.map((item) => (
                        <CategoryItem
                            item={item}
                            state={
                                editItemId === item.category_number
                                    ? "edit"
                                    : "default"
                            }
                        />
                    ))}

                    <CategoryItem state="add" />
                </div>
            </div>
        </div>
    )
}

export default CategoriesPage
