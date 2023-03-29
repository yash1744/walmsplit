import React from 'react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'


const Nav = () => {
    const [accessToken, setAccessToken] = useState("");

    useEffect(() => {
        const access_token = localStorage.getItem("access_token")
            ? localStorage.getItem("access_token")
            : "";
        setAccessToken(access_token);
    }, [])
    const Logout = () => {
        localStorage.clear()
        window.location.href = "/";
    }
    return (
        <div className="bg-white p-4  sticky z-10 top-0 shadow-md left-0 right-0 text-center  border-b align-center" style={{display:"flex", justifyContent:"center"}}>
            <div style={{ flex: 2, display: 'flex', justifyContent: "center", alignItems: "center" }}>
                <Link to="/" style={{ textDecoration: "none", color: "darkmagenta" }} className="text-2xl bold font-bold"> WALMART SPLIT</Link>
            </div>
            {accessToken && <div onClick={Logout}>
                <button className="hoverbutton dark ">Logout from Splitwise</button>
            </div>}
        </div>
    )
}

export default Nav