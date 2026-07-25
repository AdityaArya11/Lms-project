import React, { useState, useEffect } from 'react'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ data }) => {

    const navigate = useNavigate();
    const [input, setInput] = useState(data ? data : '')

    const onSearchHandler = (e) => {
        e.preventDefault();
        if (input.trim()) {
            navigate('/course-list/' + input);
        } else {
            navigate('/course-list');
        }
    }

    useEffect(() => {
        setInput(data ? data : '');
    }, [data])


    return (
        <form
            onSubmit={onSearchHandler}
            className='flex items-center max-w-xl w-full md:h-14 h-12 bg-white/90 backdrop-blur-md rounded-full border border-slate-200/90 px-4 gap-3 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:border-slate-300 transition-all duration-300 group focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500'>
            <img src={assets.search_icon} alt="search_icon" className='w-5 h-5 opacity-60 group-focus-within:opacity-100 transition-opacity' />
            <input onChange={e => setInput(e.target.value)} value={input}
                type="text" placeholder='Search for courses, skills, topics...' className='flex-1 outline-none text-slate-700 text-sm md:text-base bg-transparent placeholder-slate-400 font-medium' />
            {input && (
                <button 
                    type="button" 
                    onClick={() => setInput('')}
                    className="text-slate-400 hover:text-slate-600 text-sm px-1 cursor-pointer"
                >
                    ✕
                </button>
            )}
            <button type='submit' className='bg-blue-600 hover:bg-blue-700 text-white md:px-7 px-5 md:py-2.5 py-1.5 rounded-full text-sm md:text-base font-semibold transition-all duration-200 active:scale-95 shadow-sm cursor-pointer'>Search</button>
        </form>
    )
}

export default SearchBar
