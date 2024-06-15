import { useAuth } from "@/context/AuthContext"
import { useData } from "@/context/DataContext"
import { useFilter } from "@/context/FilterContext"
import { TCategory } from "@/types"
import React, { FC, useEffect, useState } from "react"

type Props = {
    item?: TCategory
    state: "default" | "edit" | "add"
}

const CategoryItem: FC<Props> = ({ item, state }) => {
    const { isAdmin } = useAuth()
    const { categories, createCategory, updateCategory, deleteCategory } =
        useData()
    const { editItemId, setEditItemId } = useFilter()

    const [editName, setEditName] = useState("")

    useEffect(() => {
        if (!item) return

        if (state === "edit") {
            setEditName(item.category_name)
        }
    }, [state])

    if (state === "add") {
        if (!isAdmin) return null

        const handleAdd = async () => {
            if (editItemId !== -1) return

            const newId =
                (Math.max(...categories.map((p) => p.category_number)) || 0) + 1

            await createCategory({
                category_number: newId,
                category_name: "",
            })
            setEditItemId(newId)
        }

        return <div className="item item-add" onClick={handleAdd} />
    }

    if (!item) return null

    const renderControlBtns = () => {
        const isOtherItemEditing =
            editItemId !== -1 && editItemId !== item.category_number

        if (!isAdmin || isOtherItemEditing) return null

        const handleSave = async () => {
            if (!editName) return

            const isSame = editName === item.category_name

            if (!isSame) {
                await updateCategory(item.category_number, {
                    category_name: editName,
                })
            }

            setEditItemId(-1)
        }

        const handleEdit = () => setEditItemId(item.category_number)

        const handleDelete = () => deleteCategory(item.category_number)

        if (state === "edit") {
            return (
                <button className="save-item" onClick={handleSave}>
                    S
                </button>
            )
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
        )
    }

    if (state === "edit") {
        return (
            <div className="item item-edit">
                <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Name..."
                />

                {renderControlBtns()}
            </div>
        )
    }

    return (
        <div className="item category-item">
            <span>Id: {item.category_number}</span>
            <span>Name: {item.category_name}</span>

            {renderControlBtns()}
        </div>
    )
}

export default CategoryItem
