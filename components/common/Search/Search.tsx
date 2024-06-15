"use client"

import React, { FC } from "react"
import "./Search.css"
import { useFilter } from "@/context/FilterContext"

export type TSortOption = {
    id: number
    name: string
    callback: (a: any, b: any) => number
}

type Props = {
    items: any[]
}

const Search: FC<Props> = ({ items }) => {
    const { search, sort, sortOptions, setSearch, setSort } = useFilter()

    return (
        <div className="column">
            <input
                className="search-input"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
            />

            <div className="row">
                <div className="numOfItems">{items.length} Items</div>

                <select
                    className="sort"
                    onChange={(e) => {
                        const newSort = sortOptions.find(
                            (s) => s.id === +e.target.value
                        )
                        if (newSort) setSort(newSort)
                    }}
                >
                    {sortOptions.map((so) => (
                        <option
                            key={so.id}
                            value={so.id}
                            selected={so.id === sort.id}
                        >
                            {so.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}

export default Search
