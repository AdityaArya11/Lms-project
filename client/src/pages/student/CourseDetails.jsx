import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../../context/AppContext';
import Loading from '../../components/student/Loading';

import { assets } from '../../assets/assets';
import humanizeDuration from 'humanize-duration';
import Rating from '../../components/student/Rating';
import Footer from '../../components/student/Footer';
import YouTube from 'react-youtube';

const CourseDetails = () => {

    const { id } = useParams()

    const [courseData, setCourseData] = useState(null);
    const [openSections, setOpenSections] = useState({});
    const [isAllreadyEnrolled, setIsAllreadyEnrolled] = useState(false)
    const [playerData, setPlayerData] = useState(null)


    const { allCourses, calculateRating, calculateNoOfLectures, calculateChapterTime, calculateCourseDuration, currency } = useContext(AppContext)

    const fetchCourseData = async () => {
        const findCourse = allCourses.find(course => course._id == id)
        setCourseData(findCourse);
    }


    useEffect(() => {
        fetchCourseData()
    }, [allCourses, id])

    const averageRating = courseData ? calculateRating(courseData) : 0
    const discountedPrice = courseData ? (courseData.coursePrice - (courseData.coursePrice * courseData.discount) / 100).toFixed(2) : 0



    const toggleSection = (index) => {
        setOpenSections((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    return courseData ? (
        <>
            <div className='w-full min-h-screen flex md:flex-row flex-col text-left relative z-10 bg-transparent'>
                {/* Left column - 50% width on desktop */}
                <div className='md:w-1/2 w-full bg-slate-50/80 md:px-20 px-6 py-12 md:py-24 z-10 border-r border-slate-100 flex justify-end'>
                    <div className='max-w-xl w-full'>
                        <h1 className='md:text-4xl text-2xl font-extrabold text-gray-900 leading-tight'>
                            {courseData.courseTitle}
                        </h1>
                        <p
                            className='pt-4 md:text-base text-sm text-gray-600 leading-relaxed'
                            dangerouslySetInnerHTML={{ __html: courseData.courseDescription.slice(0, 200) }}
                        ></p>

                        {/* review and ratings */}
                        <div className='flex items-center flex-wrap gap-2.5 pt-4 pb-2 text-sm text-gray-500'>
                            <div className='flex items-center gap-1 text-amber-500 font-semibold'>
                                <p>{averageRating.toFixed(1)}</p>
                                <div className='flex gap-0.5'>
                                    {[...Array(5)].map((_, i) => (
                                        <img
                                            key={i}
                                            src={i < Math.floor(averageRating) ? assets.star : assets.star_blank}
                                            alt=''
                                            className='w-3.5 h-3.5'
                                        />
                                    ))}
                                </div>
                            </div>
                            <span className='text-gray-300'>|</span>
                            <p className='text-blue-600 font-medium hover:underline cursor-pointer'>
                                {courseData.courseRatings.length} {courseData.courseRatings.length > 1 ? 'ratings' : 'rating'}
                            </p>
                            <span className='text-gray-300'>|</span>
                            <p className='font-medium text-gray-700'>
                                {courseData.enrolledStudents.length.toLocaleString()} {courseData.enrolledStudents.length > 1 ? 'students enrolled' : 'student enrolled'}
                            </p>
                        </div>

                        <p className='text-sm text-gray-700 mt-2'>
                            <b>Course created by</b> <span className='font-semibold text-blue-600 hover:underline cursor-pointer'>Aditya Arya</span>
                        </p>

                        <div className='pt-10 text-gray-800 w-full'>
                            <h2 className='text-2xl font-bold text-gray-900'>Course Structure</h2>
                            <p className='text-sm text-gray-500 pt-1'>
                                {courseData.courseContent.length} sections • {calculateNoOfLectures(courseData)} lectures • {calculateCourseDuration(courseData)} total length
                            </p>

                            <div className='pt-6'>
                                {courseData.courseContent.map((chapter, index) => (
                                    <div key={index} className='border border-gray-200 bg-white rounded-xl mb-3 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200'>
                                        <div
                                            className='flex items-center justify-between px-6 py-4 bg-gray-50/50 hover:bg-gray-100/50 cursor-pointer select-none transition-colors duration-150'
                                            onClick={() => toggleSection(index)}
                                        >
                                            <div className='flex items-center gap-3'>
                                                <img
                                                    src={assets.down_arrow_icon}
                                                    alt="arrow"
                                                    className={`w-4.5 transition-transform duration-300 ${openSections[index] ? 'rotate-180' : ''}`}
                                                />
                                                <p className='font-semibold text-gray-800 text-sm md:text-base'>{index + 1}. {chapter.chapterTitle}</p>
                                            </div>
                                            <p className='text-xs md:text-sm text-gray-500 font-medium'>
                                                {chapter.chapterContent.length} lectures • {calculateChapterTime(chapter)}
                                            </p>
                                        </div>
                                        <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-screen' : 'max-h-0'}`}>
                                            <ul className='list-none p-0 px-6 py-1 border-t border-gray-100 text-gray-600 bg-white divide-y divide-gray-50'>
                                                {chapter.chapterContent.map((lecture, lectureindex) => (
                                                    <li key={lectureindex} className='flex items-start gap-3 py-3'>
                                                        <img src={assets.play_icon} alt="play" className='w-4.5 h-4.5 mt-0.5 opacity-70' />
                                                        <div className='flex-1 flex justify-between items-center'>
                                                            <p className='font-medium text-gray-800 text-sm hover:text-blue-600 transition-colors duration-150 cursor-pointer'>{lecture.lectureTitle}</p>
                                                            <div className='flex items-center gap-3 text-xs text-gray-500'>
                                                                {lecture.isPreviewFree && (
                                                                    <p 
                                                                    onClick={()=> setPlayerData({
                                                                        videoId: lecture.lectureUrl.split('/').pop()
                                                                    })}
                                                                        
                                                                    
                                                                    className='text-blue-600 font-semibold cursor-pointer hover:underline bg-blue-50 px-2 py-0.5 rounded'>
                                                                        Preview
                                                                    </p>
                                                                )}
                                                                <p className='font-medium'>{humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ['h', 'm'], round: true })}</p>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='pt-8 pb-12 text-gray-800'>
                            <h3 className='text-2xl font-bold text-gray-900 mb-4'>Course Description</h3>
                            <div
                                className='rich-text text-gray-600 leading-relaxed text-sm md:text-base'
                                dangerouslySetInnerHTML={{ __html: courseData.courseDescription }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Right column - 50% width on desktop */}
                <div className='md:w-1/2 w-full bg-white md:px-20 px-6 py-12 md:py-24 z-10 flex justify-start'>
                    <div className='max-w-md w-full sticky top-28'>
                        <div className='relative overflow-hidden rounded-2xl mb-6 shadow-md border border-gray-100 group'>
                           {
                             playerData ?
                               <YouTube videoId={playerData.videoId} opts={{ playerVars: { autoplay: 1}}} iframeClassName="w-full aspect-video"/>
                              : <img
                                src={courseData.courseThumbnail}
                                alt={courseData.courseTitle}
                                className='w-full h-auto object-cover transform group-hover:scale-102 transition-transform duration-500'
                            />
                           }
                           
                           
                            
                        </div>

                        <div className='flex items-center gap-2 text-red-600 bg-red-50 px-3.5 py-2.5 rounded-xl text-xs font-semibold mb-5 w-fit shadow-sm border border-red-100/50'>
                          <img className='w-4 h-4 animate-pulse' src={assets.time_left_clock_icon} alt="time left icon" />

                            <p><span className='font-bold'>5-Day </span>left at this price</p>
                        </div>

                        <div className='flex items-baseline gap-3 mb-6'>
                            <span className='text-4xl font-black text-gray-900 tracking-tight'>
                                {currency}{(courseData.coursePrice - (courseData.coursePrice * courseData.discount) / 100).toFixed(2)}
                            </span>
                            {courseData.discount > 0 && (
                                <>
                                    <span className='text-lg line-through text-gray-400 font-semibold'>
                                        {currency}{courseData.coursePrice.toFixed(2)}
                                    </span>
                                    <span className='bg-green-100 text-green-700 text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-sm'>
                                        {courseData.discount}% OFF
                                    </span>
                                </>
                            )}
                        </div>

                        <div className='grid grid-cols-3 gap-2 py-4 border-t border-b border-gray-100 text-gray-600 mb-6 text-sm font-medium'>
                            <div className='flex flex-col items-center gap-1.5 text-center border-r border-gray-100'>
                                <div className='flex items-center gap-1 text-amber-500'>
                                    <img src={assets.star} alt="star icon" className='w-4 h-4' />
                                    <span className='font-extrabold text-gray-900'>{averageRating.toFixed(1)}</span>
                                </div>
                                <span className='text-[10px] uppercase tracking-wider text-gray-400 font-bold'>Rating</span>
                            </div>
                            <div className='flex flex-col items-center gap-1.5 text-center border-r border-gray-100'>
                                <div className='flex items-center gap-1 text-gray-700'>
                                    <img src={assets.time_clock_icon} alt="clock icon" className='w-4 h-4' />
                                    <span className='font-extrabold text-gray-900'>{calculateCourseDuration(courseData)}</span>
                                </div>
                                <span className='text-[10px] uppercase tracking-wider text-gray-400 font-bold'>Duration</span>
                            </div>
                            <div className='flex flex-col items-center gap-1.5 text-center'>
                                <div className='flex items-center gap-1 text-gray-700'>
                                    <img src={assets.lesson_icon} alt="lesson icon" className='w-4 h-4' />
                                    <span className='font-extrabold text-gray-900'>{calculateNoOfLectures(courseData)}</span>
                                </div>
                                <span className='text-[10px] uppercase tracking-wider text-gray-400 font-bold'>Lectures</span>
                            </div>
                        </div>

                        <button className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl text-base font-bold hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-0.5 transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 active:translate-y-0'>
                            {!isAllreadyEnrolled ? "Enroll Now" : "Go To Course"}
                        </button>

                        <div className='pt-8 border-t border-gray-100 mt-8'>
                            <p className='font-extrabold text-gray-800 mb-5 text-sm uppercase tracking-widest text-left'>What's in the course</p>
                            <ul className='space-y-4 text-sm text-gray-600 text-left'>
                                <li className='flex items-center gap-3.5'>
                                    <img src={assets.blue_tick_icon} alt="tick" className='w-4 h-4 flex-shrink-0' />
                                    <span className='font-medium'>Life time access with free updates</span>
                                </li>
                                <li className='flex items-center gap-3.5'>
                                    <img src={assets.blue_tick_icon} alt="tick" className='w-4 h-4 flex-shrink-0' />
                                    <span className='font-medium'>Mobile and Desktop access</span>
                                </li>
                                <li className='flex items-center gap-3.5'>
                                    <img src={assets.blue_tick_icon} alt="tick" className='w-4 h-4 flex-shrink-0' />
                                    <span className='font-medium'>Certificate on completion</span>
                                </li>
                                <li className='flex items-center gap-3.5'>
                                    <img src={assets.blue_tick_icon} alt="tick" className='w-4 h-4 flex-shrink-0' />
                                    <span className='font-medium'>Access to private community</span>
                                </li>
                                <li className='flex items-center gap-3.5'>
                                    <img src={assets.blue_tick_icon} alt="tick" className='w-4 h-4 flex-shrink-0' />
                                    <span className='font-medium'>30-day money-back guarantee</span>
                                </li>
                                <li className='flex items-center gap-3.5'>
                                    <img src={assets.blue_tick_icon} alt="tick" className='w-4 h-4 flex-shrink-0' />
                                    <span className='font-medium'>Quizzes, assignments, and capstone project</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    ) : <Loading />
}

export default CourseDetails