import { profile } from 'console';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
    name: string;
    email: string;
    profilePic: string;
}

const Navbar: React.FC<NavbarProps> = ({ name, email, profilePic }) => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY >= 25 && window.scrollY < 100) {
                setScrolled(1);
            } else if (window.scrollY >= 100) {
                setScrolled(2);
            } else {
                setScrolled(0);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const navbarClass = `fixed w-full px-4 z-50 border-b-2 border-black bg-slate-200 ${scrolled == 1 ? 'bg-slate-800/25' : scrolled == 2 ? 'bg-slate-800/75' : 'bg-transparent'} flex justify-between transition-transform duration-200`;
    const buttonClass = `text-black 
                        hover:text-slate-800
                        active:bg-gradient-to-r active:from-slate-500 active:to-slate-800 active:scale-100
                        transition-transform duration-200`

    return (
        <nav className={`${navbarClass}`}>
            {/* Left section */}
            <a className="text-black text-2xl font-semibold p-2 my-auto hover:cursor-pointer" onClick={() => navigate("/")}>
                TimeTrek
            </a>

            {/* Right section */}
            <div className="flex space-x-4">
                <button className={buttonClass + " flex items-center"} onClick={() => { }}>
                    <div className={buttonClass + " text-sm text-right justify-end items-center flex-1"}>
                        <p>{name}</p>
                        <p>{email}</p>
                    </div>
                    <img src={profilePic} className="rounded-full border-2 border-black h-10 w-10 ml-2" />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;