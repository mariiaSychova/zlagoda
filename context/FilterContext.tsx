"use client"

import { TSortOption } from "@/components/common/Search/Search"
import React, { ReactNode, useEffect, useState } from "react"

type FetchType = {
    search: string
    sort: TSortOption
    sortOptions: TSortOption[]

    setSearch: (v: string) => void
    setSort: (v: TSortOption) => void
    setSortOptions: (v: TSortOption[]) => void

    filterCategoryId: number
    setFilterCategoryId: (v: number) => void

    editItemId: number
    setEditItemId: (v: number) => void

    handleClearFilter: () => void
    renderFilter: (v: ReactNode) => ReactNode
}

const defaultSortOption = {
    id: -1,
    name: "By Name",
    callback: () => 0,
}

export const FilterContext = React.createContext<FetchType>({
    search: "",
    sort: defaultSortOption,
    sortOptions: [],

    setSearch: () => {},
    setSort: () => {},
    setSortOptions: () => {},

    filterCategoryId: -1,
    setFilterCategoryId: () => {},

    editItemId: -1,
    setEditItemId: () => {},

    handleClearFilter: () => {},
    renderFilter: () => <></>,
})

export const FilterProvider = ({ children }: { children: ReactNode }) => {
    // search
    const [search, setSearch] = useState("")
    const [sort, setSort] = useState<TSortOption>(defaultSortOption)
    const [sortOptions, setSortOptions] = useState<TSortOption[]>([])

    // filters
    const [filterCategoryId, setFilterCategoryId] = useState(-1)

    // edit
    const [editItemId, setEditItemId] = useState(-1)

    useEffect(() => {
        if (sort.id === -1 && sortOptions.length) setSort(sortOptions[0])
    }, [sortOptions])

    const handleClearFilter = () => {
        setSearch("")
        if (sortOptions.length) setSort(sortOptions[0])
        setFilterCategoryId(-1)
    }

    const renderFilter = (content: ReactNode) => {
        return (
            <div className="page-filters">
                {content}

                <button className="clear-btn" onClick={handleClearFilter}>
                    Clear
                </button>
                <button className="export-btn" onClick={() => window.print()}>
                    Export
                </button>
            </div>
        )
    }

    return (
        <FilterContext.Provider
            value={{
                search,
                sort,
                sortOptions,

                setSearch,
                setSort,
                setSortOptions,

                filterCategoryId,
                setFilterCategoryId,

                editItemId,
                setEditItemId,

                handleClearFilter,
                renderFilter,
            }}
        >
            {children}
        </FilterContext.Provider>
    )
}

export const useFilter = () => React.useContext<FetchType>(FilterContext)
