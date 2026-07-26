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
        <div className='md:w-64 w-16 text-sm font-medium border-r border-slate-200/80 flex flex-col min-h-screen pt-6 bg-white space-y-1.5 shrink-0'>
            {menuItems.map((item) => (
                <NavLink
                    to={item.path}
                    key={item.name}
                    end={item.path === '/educator'}
                    className={({ isActive }) => `flex items-center gap-3.5 py-3 px-4 md:px-6 border-r-[3px] transition-all ${isActive
                            ? 'bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-600 text-indigo-700 font-bold'
                            : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                >
                    <img src={item.icon} alt="" className='w-5 h-5 opacity-70 group-hover:opacity-100' />
                    <span className='hidden md:block'>{item.name}</span>
                </NavLink>
            ))}
        </div>
    )
}

export default Sidebar