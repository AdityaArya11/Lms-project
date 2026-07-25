import React from 'react'
import { assets } from '../../assets/assets'
import { useUser, UserButton } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'

const Navbar = () => {
    const { user } = useUser()
    return (
        <div className='flex items-center justify-between px-6 sm:px-10 py-3.5 border-b border-slate-300/70 bg-slate-100/90 backdrop-blur-lg sticky top-0 z-30 shadow-xs'>
            <Link to="/">
                <img src={assets.logo} alt="logo" className='w-28 lg:w-32 hover:opacity-90 transition-opacity' />
            </Link>
            <div className='flex items-center gap-4'>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                    Educator Portal
                </span>
                <p className='text-sm text-slate-700 font-semibold max-sm:hidden'>Hi, {user ? user.fullName : 'Instructor'}!</p>
                {user ? <UserButton /> : <img className='w-8 h-8 rounded-full object-cover ring-2 ring-indigo-100' src={assets.profile_img} alt="profile img" />}
            </div>
        </div>
    )
}

export default Navbar