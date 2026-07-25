import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useClerk, useUser } from '@clerk/clerk-react'
import { assets } from '../../assets/assets'

const CallToAction = () => {
    const navigate = useNavigate()
    const { openSignIn } = useClerk()
    const { isSignedIn } = useUser()

    const handleGetStarted = () => {
        window.scrollTo(0, 0)
        if (isSignedIn) {
            navigate('/course-list')
        } else {
            openSignIn()
        }
    }

    const handleExploreCatalog = () => {
        window.scrollTo(0, 0)
        navigate('/course-list')
    }

    return (
        <div className='w-full py-16 px-6 md:px-24 max-w-7xl mx-auto'>
            <div className='flex flex-col items-center text-center gap-6 py-16 px-8 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden border border-slate-800'>
                <h2 className='text-2xl sm:text-4xl md:text-5xl font-extrabold max-w-2xl leading-tight tracking-tight'>
                    Start Your Learning Journey Today
                </h2>
                
                <p className='text-slate-300 text-sm sm:text-base max-w-xl font-normal leading-relaxed'>
                    Join thousands of professionals mastering new technologies with structured courses, hands-on projects, and expert guidance.
                </p>
                
                <div className='flex flex-wrap justify-center items-center gap-4 mt-2'>
                    <button 
                        onClick={handleGetStarted}
                        className='px-8 py-3.5 rounded-full text-slate-900 bg-white font-bold text-sm shadow-md hover:bg-slate-100 hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95'
                    >
                        Get Started Now
                    </button>
                    <button 
                        onClick={handleExploreCatalog}
                        className='flex items-center gap-2 px-6 py-3.5 rounded-full text-white bg-slate-800 hover:bg-slate-700 font-semibold text-sm transition-all duration-200 cursor-pointer border border-slate-700 active:scale-95'
                    >
                        <span>Explore Catalog</span>
                        <img src={assets.arrow_icon} alt="arrow_icon" className="w-3.5 h-3.5 invert" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CallToAction