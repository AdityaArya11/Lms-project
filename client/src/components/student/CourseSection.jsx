import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import CourseCard from './CourseCard'

const CourseSection = () => {
    const { allCourses } = useContext(AppContext)

    return (
        <div className='py-16 md:px-40 px-8 w-full flex flex-col items-center'>
            <h2 className='text-3xl font-semibold text-gray-800'>
                Explore the most popular courses
            </h2>
            <p className='text-sm md:text-base text-gray-500 mt-2 max-w-md text-center'>
                Discover a wide range of courses taught by expert instructors. Start your learning journey today.
            </p>

            <div className='grid grid-cols-auto sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-10 w-full max-w-6xl'>
                {allCourses.slice(0, 4).map((course, index) => (
                    <CourseCard key={index} course={course} />
                ))}
            </div>

            <Link
                to={'/course-list'}
                onClick={() => scrollTo(0, 0)}
                className='text-gray-500 border border-gray-300 px-10 py-3 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-all duration-200 shadow-sm font-medium'
            >
                Show all courses
            </Link>
        </div>
    )
}

export default CourseSection