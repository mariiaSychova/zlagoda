"use client"

import React from "react"
import "./AccountPage.css"
import { useAuth } from "@/context/AuthContext"

const AccountPage = () => {
    const { user, handleLogout } = useAuth()

    if (!user) return null

    return (
        <div className="account-container">
            <span>Id: {user.id_employee}</span>

            <br />

            <span>
                Name: {user.empl_surname} {user.empl_name}{" "}
                {user.empl_patronymic}
            </span>
            <span>Birthday: {user.date_of_birth}</span>

            <br />

            <span>Phone: {user.phone_number}</span>
            <span>
                Address: {user.city} {user.street}
            </span>
            <span>Zip: {user.zip_code}</span>

            <br />

            <span>Role: {user.empl_role}</span>
            <span>Salary: {user.salary}$</span>
            <span>Date of Start: {user.date_of_start}</span>

            <div className="logout-btn" onClick={handleLogout}>
                Logout
            </div>
        </div>
    )
}

export default AccountPage
