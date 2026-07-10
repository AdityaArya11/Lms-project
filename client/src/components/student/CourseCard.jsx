import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import Rating from './Rating'

const CourseCard = ({ course }) => {
    const { currency } = useContext(AppContext);
    const { calculateRating } = useContext(AppContext)

    const averageRating = calculateRating(course)
    const discountedPrice = (course.coursePrice - (course.coursePrice * course.discount) / 100).toFixed(2)

    return (
        <Link
            to={'/course/' + course._id}
            onClick={() => scrollTo(0, 0)}
            className='border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 bg-white flex flex-col justify-between text-left group'
        >
            <div className='overflow-hidden w-full h-44 sm:h-48 bg-gray-100'>
                <img
                    src={course.courseThumbnail}
                    alt={course.courseTitle}
                    className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                    loading="lazy"
                />
            </div>
            <div className='p-5 flex flex-col flex-grow'>
                <h3 className='text-base font-semibold text-gray-800 line-clamp-2 min-h-[3rem] mb-2 leading-snug group-hover:text-blue-600 transition-colors duration-200'>
                    {course.courseTitle}
                </h3>
                <p className='text-xs text-gray-500 mb-3'>
                    By {typeof course.educator === 'object' ? course.educator.name : "GreatStack"}
                </p>
                <div className='flex items-center gap-1.5 mb-4'>
                    <span className='text-sm font-medium text-amber-500'>{averageRating.toFixed(1)}</span>
                    <Rating rating={averageRating} />
                    <span className='text-xs text-gray-400'>({course.courseRatings.length})</span>
                </div>
                <div className='mt-auto pt-2 flex items-baseline gap-2'>
                    <span className='text-base font-bold text-gray-900'>
                        {currency}{discountedPrice}
                    </span>
                    {course.discount > 0 && (
                        <span className='text-xs line-through text-gray-400'>
                            {currency}{course.coursePrice.toFixed(2)}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default CourseCard