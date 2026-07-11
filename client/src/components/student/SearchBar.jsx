import React, { useState, useEffect } from 'react'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom';

const SearchBar = ({data}) => {

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
            className='flex items-center max-w-md w-full md:h-14 h-12 bg-white rounded-full border border-gray-300 px-4 gap-3 shadow-md'>
            <img src={assets.search_icon} alt="search_icon" className='w-5 h-5' />
            <input onChange={e=>setInput(e.target.value)} value={input}
             type="text" placeholder='Search Courses' className='flex-1 outline-none text-gray-500 text-sm md:text-base bg-transparent' />
            <button type='submit' className='bg-blue-600 text-white md:px-6 px-4 md:py-2 py-1.5 rounded-full text-sm md:text-base font-medium hover:bg-blue-700 transition-all duration-200 active:scale-95 shadow-sm hover:shadow'>Search</button>
        </form>
    )
}

export default SearchBar
