import React from 'react'
import { assets } from '../../assets/assets'

const Companies = () => {
    return (
        <div className='py-14 w-full border-b border-slate-200/60 bg-slate-50/40'>
            <p className='text-center text-slate-500 font-semibold text-xs uppercase tracking-widest mb-6'>
                Trusted by learners from global leading teams
            </p>
            <div className='flex flex-wrap items-center justify-center gap-8 md:gap-16 max-w-6xl mx-auto px-6 opacity-75 hover:opacity-100 transition-opacity'> 
                <img src={assets.microsoft_logo} alt="Microsoft" className='w-20 md:w-28 grayscale hover:grayscale-0 transition-all cursor-pointer opacity-70 hover:opacity-100' />
                <img src={assets.accenture_logo} alt="Accenture" className='w-20 md:w-28 grayscale hover:grayscale-0 transition-all cursor-pointer opacity-70 hover:opacity-100' />
                <img src={assets.adobe_logo} alt="Adobe" className='w-20 md:w-28 grayscale hover:grayscale-0 transition-all cursor-pointer opacity-70 hover:opacity-100' />
                <img src={assets.walmart_logo} alt="Walmart" className='w-20 md:w-28 grayscale hover:grayscale-0 transition-all cursor-pointer opacity-70 hover:opacity-100' />
                <img src={assets.paypal_logo} alt="Paypal" className='w-20 md:w-28 grayscale hover:grayscale-0 transition-all cursor-pointer opacity-70 hover:opacity-100' />
            </div>
        </div>
    )
}

export default Companies