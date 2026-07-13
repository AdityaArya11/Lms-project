import React, { useContext, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import humanizeDuration from 'humanize-duration'
import YouTube from 'react-youtube'
import Footer from '../../components/student/Footer'
import Rating from '../../components/student/Rating'

const Player = () => {

     
    const{enrolledCourses, calculateChapterTime} =useContext(AppContext)
    const{courseId} =useParams()
    const [courseData,setCourseData] =useState(null)
    const [openSections,setOpenSections] =useState({})
    const [playerData,setPlayerData] =useState(null)




    const getCourseData = () => {
        if (enrolledCourses.length > 0) {
            const course = enrolledCourses.find(item => item._id === courseId)
            setCourseData(course)
        }
    }

    const toggleSection = (index) => {
        setOpenSections((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    useEffect(() => {
        getCourseData()
    }, [enrolledCourses, courseId])


    return (
        <>
        <div className='p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10
        md:px-36'>
            {/* left column*/}
            <div className='text-gray-800'>
              <h2 className='text-xl font-semibold '>Course Structure</h2>
               <div className='pt-6'>
                {courseData && courseData.courseContent.map((chapter, index) => (
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
                                                {lecture.lectureUrl && (
                                                    <p 
                                                    onClick={()=> setPlayerData({
                                                        ...lecture, chapter: index + 1, lecture: lectureindex + 1
                                                     })}
                                                        
                                                    
                                                    className='text-blue-600 font-semibold cursor-pointer hover:underline bg-blue-50 px-2 py-0.5 rounded'>
                                                        Watch
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
            <div className='flex items-center gap-2 py-3 mt-10'>
                <h1 className='text-xl font-bold'>Rate this Course</h1>
                <Rating rating ={0}/>
            </div>
            </div>
            {/* right column*/}
            <div className='md:mt-10'>
                {playerData ? (
                    <div>
                      <YouTube videoId={playerData.lectureUrl.split('/').pop()} 
                        iframeClassName="w-full aspect-video"/>
                        <div className='flex justify-between items-center mt-1'>
                            <p>{playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}</p>
                            <button className='text-blue-600'>Mark Complete</button>
                        </div>
                    </div>
                )
                :
               <img src={courseData? courseData.courseThumbnail: ''} alt="" /> 
               }
            </div>
        </div>
        <Footer/>
        </>
    )
}

export default Player