import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import Rating from './Rating'

const CourseCard = ({ course }) => {
    const { currency, calculateRating } = useContext(AppContext);

    const averageRating = calculateRating(course)
    const discountedPrice = (course.coursePrice - (course.coursePrice * course.discount) / 100).toFixed(2)

    return (
        <Link
            to={'/course/' + course._id}
            onClick={() => scrollTo(0, 0)}
            className='border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white flex flex-col justify-between text-left group relative'
        >
            <div className='overflow-hidden w-full h-44 sm:h-48 bg-slate-100 relative'>
                <img
                    src={course.courseThumbnail}
                    alt={course.courseTitle}
                    className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                    loading="lazy"
                />
                {course.discount > 0 && (
                    <span className="absolute top-3 left-3 bg-red-600 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-md shadow-xs">
                        {course.discount}% OFF
                    </span>
                )}
            </div>
            
            <div className='p-5 flex flex-col flex-grow'>
                <h3 className='text-base font-bold text-slate-800 line-clamp-2 min-h-[3rem] mb-2 leading-snug group-hover:text-blue-600 transition-colors duration-200'>
                    {course.courseTitle}
                </h3>
                
                <p className='text-xs text-slate-500 mb-3 flex items-center gap-1.5 font-medium'>
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                        {course.educator.name ? course.educator.name.charAt(0) : 'I'}
                    </span>
                    {course.educator.name}
                </p>

                <div className='flex items-center gap-1.5 mb-4'>
                    <span className='text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded'>{averageRating.toFixed(1)}</span>
                    <Rating rating={averageRating} />
                    <span className='text-xs text-slate-400 font-medium'>({course.courseRatings ? course.courseRatings.length : 0})</span>
                </div>

                <div className='mt-auto pt-3 border-t border-slate-100 flex items-center justify-between'>
                    <div className="flex items-baseline gap-2">
                        <span className='text-lg font-extrabold text-slate-900'>
                            {currency}{discountedPrice}
                        </span>
                        {course.discount > 0 && (
                            <span className='text-xs line-through text-slate-400 font-medium'>
                                {currency}{course.coursePrice.toFixed(2)}
                            </span>
                        )}
                    </div>
                    <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                        Explore →
                    </span>
                </div>
            </div>
        </Link>
    )
}

export default CourseCard