import React from 'react'
import { assets } from '../../assets/assets'

const Footer = () => {
    return (
        <footer className='flex flex-col-reverse md:flex-row items-center justify-between px-8 border-t border-gray-200 py-4 bg-white text-gray-500 text-xs md:text-sm mt-auto w-full'>
            <div className='flex items-center gap-3'>
                <img src={assets.logo} alt="logo" className='w-24 hidden md:block' />
                <div className='hidden md:block h-7 w-px bg-gray-200'></div>
                <p className='text-xs md:text-sm text-gray-500'>Copyright 2026 © Aditya Arya. All rights reserved.</p>
            </div>

            <div className='flex items-center gap-3 max-md:mb-4'>
                <a href="#"><img src={assets.facebook_icon} alt="facebook" className='w-5 opacity-70 hover:opacity-100 transition' /></a>
                <a href="#"><img src={assets.instagram_icon} alt="instagram" className='w-5 opacity-70 hover:opacity-100 transition' /></a>
                <a href="#"><img src={assets.twitter_icon} alt="twitter" className='w-5 opacity-70 hover:opacity-100 transition' /></a>
            </div>
        </footer>
    )
}

export default Footer