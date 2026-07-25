import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import CourseCard from './CourseCard'

const CourseSection = () => {
    const { allCourses } = useContext(AppContext)

    return (
        <div className='w-full bg-slate-50/70 py-20 border-b border-slate-200/60'>
            <div className='md:px-24 px-6 w-full flex flex-col items-center max-w-7xl mx-auto'>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3 border border-blue-100">
                🔥 Top Rated Learning
            </div>
            
            <h2 className='text-3xl md:text-4xl font-extrabold text-slate-900 text-center tracking-tight'>
                Explore Popular Courses
            </h2>
            
            <p className='text-sm md:text-base text-slate-600 mt-3 max-w-xl text-center leading-relaxed font-normal'>
                Discover hand-crafted courses taught by industry expert instructors across technology, business, and design.
            </p>

            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 my-12 w-full'>
                {allCourses.slice(0, 4).map((course, index) => (
                    <CourseCard key={index} course={course} />
                ))}
            </div>

            <Link
                to={'/course-list'}
                onClick={() => window.scrollTo(0, 0)}
                className='inline-flex items-center gap-2 text-slate-700 bg-white border border-slate-300 px-8 py-3 rounded-full hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 transition-all duration-200 shadow-sm font-semibold text-sm cursor-pointer'
            >
                <span>Browse All Courses</span>
                <span>→</span>
            </Link>
        </div>
    </div>
    )
}

export default CourseSection