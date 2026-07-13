import React from 'react'
import { dummyEducatorData, assets } from '../../assets/assets'
import { useUser, UserButton } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'

const Navbar = () => {
    const educatorData = dummyEducatorData
    const { user } = useUser()
    return (
        <div className='flex items-center justify-between px-4 sm:px-8 py-3 border-b border-gray-200 bg-white'>
            <Link to="/">
                <img src={assets.logo} alt="logo" className='w-28 lg:w-32' />
            </Link>
            <div className='flex items-center gap-3'>
                <p className='text-sm text-gray-700 max-sm:hidden'>Hi! {user ? user.fullName : 'Developer'}</p>
                {user ? <UserButton /> : <img className='w-8 h-8 rounded-full object-cover' src={assets.profile_img} alt="profile img" />}
            </div>
        </div>
    )
}

export default Navbar