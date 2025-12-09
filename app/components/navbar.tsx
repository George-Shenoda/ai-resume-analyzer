import {Link} from "react-router";
import React from "react";

export default function Navbar() {
    return (
        <nav className="navbar">
            <Link to="/" >
                <p className="text-2xl text-gradient font-bold">Resumes</p>
            </Link>
            <Link to="/upload" className="primary-button w-fit">
                Upload Resume
            </Link>
        </nav>
    )
}