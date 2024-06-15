"use client"

import React, { FC } from "react"
import "./LoginPage.css"
import { useAuth } from "@/context/AuthContext"

type Props = object

const LoginPage: FC<Props> = ({}) => {
    const {
        email,
        setEmail,
        password,
        setPassword,
        isLoading,
        error,
        handleLogin,
    } = useAuth()

    return (
        <div className={`login-container ${isLoading ? "loading" : ""}`}>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
            />

            {error ? <div className="error">{error}</div> : null}

            <button className="submit" onClick={handleLogin}>
                Login
            </button>
        </div>
    )
}

export default LoginPage
