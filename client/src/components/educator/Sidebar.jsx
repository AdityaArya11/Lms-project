import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const Sidebar = () => {
    const { isEducator } = useContext(AppContext)

    const menuItems = [
        { name: 'Dashboard', path: '/educator', icon: assets.home_icon },
        { name: 'Add Course', path: '/educator/add-course', icon: assets.add_icon },
        { name: 'My Courses', path: '/educator/my-courses', icon: assets.my_course_icon },
        { name: 'Students Enrolled', path: '/educator/students-enrolled', icon: assets.person_tick_icon },

    ]

    return isEducator && (
        <div className='md:w-64 w-16 text-base border-r border-gray-200 flex flex-col min-h-screen pt-5 bg-white'>
            {menuItems.map((item) => (
                <NavLink
                    to={item.path}
                    key={item.name}
                    end={item.path === '/educator'}
                    className={({ isActive }) => `flex items-center gap-3 py-3 px-4 md:px-6 border-r-[4px] ${isActive ? 'bg-blue-50 border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                >
                    <img src={item.icon} alt="" className='w-6 h-6' />
                    <span className='hidden md:block'>{item.name}</span>
                </NavLink>
            ))}
        </div>
    )
}

export default Sidebar