import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import SearchBar from '../../components/student/SearchBar'
import { useParams } from 'react-router-dom'
import CourseCard from '../../components/student/CourseCard'
import { assets } from '../../assets/assets'
import Footer from '../../components/student/Footer'

const CoursesList = () => {

    const { navigate, allCourses } = useContext(AppContext)
    const { input } = useParams()
    const [filteredCourse, setFilteredCourse] = useState([])

    useEffect(() => {
        if (Array.isArray(allCourses)) {
            const tempCourses = [...allCourses];
            if (input) {
                setFilteredCourse(
                    tempCourses.filter(
                        item => item.courseTitle && item.courseTitle.toLowerCase().includes(input.toLowerCase())
                    )
                );
            } else {
                setFilteredCourse(tempCourses);
            }
        }
    }, [allCourses, input]);

    return (
        <>
            <div className='relative md:px-24 px-6 pt-12 text-left max-w-7xl mx-auto min-h-[70vh]'>
                <div className='flex md:flex-row flex-col gap-6 items-start justify-between w-full mb-8'>
                    <div>
                        <h1 className='text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight'>Course Catalog</h1>
                        <p className='text-slate-500 text-sm mt-1'>
                            <span className='text-blue-600 cursor-pointer font-medium hover:underline'
                                onClick={() => navigate('/')}>Home</span> / <span className='font-medium text-slate-700'>Courses</span>
                        </p>
                    </div>
                    <SearchBar data={input} />
                </div>

                {input && (
                    <div className='inline-flex items-center gap-3 px-3.5 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-slate-700 text-xs font-semibold mb-6'>
                        <span>Search: "{input}"</span>
                        <button 
                            onClick={() => navigate('/course-list')}
                            className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {filteredCourse.length > 0 ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-8 gap-7'>
                        {filteredCourse.map((course, index) => <CourseCard key={index} course={course} />)}
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-xs my-8 space-y-4 max-w-md mx-auto">
                        <span className="text-4xl">🔍</span>
                        <h3 className="text-lg font-bold text-slate-800">No Courses Found</h3>
                        <p className="text-sm text-slate-500">
                            {input ? `No courses matching "${input}". Try searching for something else.` : 'No courses available at the moment. Please check back soon!'}
                        </p>
                        {input && (
                            <button 
                                onClick={() => navigate('/course-list')} 
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-all cursor-pointer shadow-xs"
                            >
                                View All Courses
                            </button>
                        )}
                    </div>
                )}
            </div>
            <Footer />
        </>
    )
}

export default CoursesList