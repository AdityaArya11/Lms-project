import React, { useContext, useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import humanizeDuration from 'humanize-duration'
import YouTube from 'react-youtube'
import Footer from '../../components/student/Footer'
import Rating from '../../components/student/Rating'
import { toast } from 'react-toastify'
import Loading from '../../components/student/Loading'
import axios from 'axios'
import { getYouTubeId } from '../../utils/screenshotUtils'

const Player = () => {

    const {enrolledCourses, calculateChapterTime, formatLectureDuration, backendUrl, getToken, userData,
        fetchUserEnrolledCourses} = useContext(AppContext)
    const navigate = useNavigate();
    const {courseId} = useParams()
    const [courseData, setCourseData] = useState(null)
    const [openSections, setOpenSections] = useState({})
    const [playerData, setPlayerData] = useState(null)
    const [progressData, setProgressData] = useState(null)
    const [initialRating, setInitialRating] = useState(0)

    const youtubePlayerRef = useRef(null)
    const playerCardRef = useRef(null)

    const getCourseData = () => {
        enrolledCourses.map((course) => {
            if (course._id === courseId) {
                setCourseData(course)
                course.courseRatings && course.courseRatings.map((item) => {
                    if (item.userId === userData?._id) {
                        setInitialRating(item.rating)
                    }
                })
            }
        })
    }

    const toggleSection = (index) => {
        setOpenSections((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    useEffect(() => {
        if (enrolledCourses.length > 0) {
            getCourseData()
        }
    }, [enrolledCourses, courseId, userData])

    const markLectureAsCompleted = async (lectureId) => {
        try {
            const token = await getToken()
            const { data } = await axios.post(backendUrl + '/api/user/update-course-progress', {
                courseId, lectureId
            }, { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                toast.success(data.message)
                getCourseProgress()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getCourseProgress = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.post(backendUrl + '/api/user/get-course-progress',
                { courseId }, { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                setProgressData(data.progressData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleRate = async (rating) => {
        try {
            const token = await getToken()
            const { data } = await axios.post(backendUrl + '/api/user/add-rating',
                { courseId, rating }, { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                toast.success(data.message)
                fetchUserEnrolledCourses()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        getCourseProgress()
    }, [])

    return courseData ? (
        <>
        <div className='min-h-screen bg-slate-50/60 pb-16'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-8 flex flex-col-reverse lg:grid lg:grid-cols-12 gap-8'>
                {/* Left column - Course Structure */}
                <div className='lg:col-span-7 text-slate-800 space-y-6'>
                    
                    {/* Header Action Bar */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">{courseData.courseTitle}</h1>
                            <p className="text-xs text-slate-500 font-medium">Instructor: {courseData.educator?.name || 'Instructor'}</p>
                        </div>
                    </div>

                    {/* Course Structure */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className='text-xl font-extrabold text-slate-900'>Course Structure</h2>
                            {progressData && (
                                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                                    {progressData.lectureCompleted ? progressData.lectureCompleted.length : 0} Lectures Completed
                                </span>
                            )}
                        </div>

                        <div className='space-y-3'>
                            {courseData && courseData.courseContent.map((chapter, index) => (
                                <div key={index} className='border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs hover:border-slate-300 transition-all'>
                                    <div
                                        className='flex items-center justify-between px-5 py-4 bg-slate-50/70 hover:bg-slate-100/60 cursor-pointer select-none transition-colors'
                                        onClick={() => toggleSection(index)}
                                    >
                                        <div className='flex items-center gap-3'>
                                            <img
                                                src={assets.down_arrow_icon}
                                                alt="arrow"
                                                className={`w-4 h-4 transition-transform duration-300 ${openSections[index] ? 'rotate-180' : ''}`}
                                            />
                                            <p className='font-bold text-slate-800 text-sm md:text-base'>{index + 1}. {chapter.chapterTitle}</p>
                                        </div>
                                        <p className='text-xs text-slate-500 font-medium'>
                                            {chapter.chapterContent.length} lectures • {calculateChapterTime(chapter)}
                                        </p>
                                    </div>

                                    <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-screen' : 'max-h-0'}`}>
                                        <ul className='list-none p-0 px-5 py-1 border-t border-slate-100 text-slate-600 bg-white divide-y divide-slate-100'>
                                            {chapter.chapterContent.map((lecture, lectureindex) => (
                                                <li key={lectureindex} className='flex items-center gap-3 py-3 hover:bg-slate-50/50 px-2 rounded-lg transition-colors'>
                                                    <img 
                                                        src={progressData && progressData.lectureCompleted.includes(lecture.lectureId) ? assets.blue_tick_icon : assets.play_icon} 
                                                        alt="play icon" 
                                                        className='w-4 h-4 opacity-80 shrink-0' 
                                                    />
                                                    <div className='flex-1 flex justify-between items-center min-w-0'>
                                                        <p 
                                                            onClick={() => navigate(`/full-player/${courseId}/${lecture.lectureId || lecture._id}`)}
                                                            className='font-medium text-slate-800 text-sm hover:text-indigo-600 transition-colors cursor-pointer truncate pr-2'
                                                        >
                                                            {lecture.lectureTitle}
                                                        </p>
                                                        <div className='flex items-center gap-3 text-xs text-slate-500 shrink-0'>
                                                            {lecture.lectureUrl && (
                                                                <button 
                                                                    onClick={() => navigate(`/full-player/${courseId}/${lecture.lectureId || lecture._id}`)}
                                                                    className='text-indigo-600 font-bold hover:bg-indigo-50 px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-indigo-100'
                                                                >
                                                                    Play Video
                                                                </button>
                                                            )}
                                                            <span className='font-medium text-slate-400'>{formatLectureDuration(lecture.lectureDuration)}</span>
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

                    {/* Rating Container */}
                    <div className='bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between'>
                        <div>
                            <h3 className='text-base font-bold text-slate-900'>Rate this Course</h3>
                            <p className='text-xs text-slate-500 mt-0.5'>Share your experience to help improve future content</p>
                        </div>
                        <Rating rating={initialRating} onRate={handleRate}/> 
                    </div>
                </div>

                {/* Right column - Video Player Container */}
                <div className='lg:col-span-5'>
                    <div className="sticky top-24 space-y-4">
                        {playerData ? (
                            <div ref={playerCardRef} className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden p-3 space-y-3">
                                <div className="rounded-xl overflow-hidden bg-slate-950 aspect-video shadow-inner">
                                    <YouTube 
                                        videoId={getYouTubeId(playerData.lectureUrl)} 
                                        iframeClassName="w-full h-full aspect-video"
                                        onReady={(event) => { youtubePlayerRef.current = event.target }}
                                    />
                                </div>
                                <div className='px-2 pt-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3'>
                                    <div>
                                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                                            Chapter {playerData.chapter} • Lecture {playerData.lecture}
                                        </span>
                                        <h3 className="font-bold text-slate-900 text-base mt-1 leading-snug">{playerData.lectureTitle}</h3>
                                    </div>
                                    <button 
                                        onClick={() => markLectureAsCompleted(playerData.lectureId)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0 ${
                                            progressData && progressData.lectureCompleted.includes(playerData.lectureId)
                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                                        }`}
                                    >
                                        {progressData && progressData.lectureCompleted.includes(playerData.lectureId) ? '✓ Completed' : 'Mark Complete'}
                                    </button>
                                </div>

                                {/* Fullscreen Player Button */}
                                <div className="border-t border-slate-100 pt-3 px-2">
                                    <button
                                        onClick={() => navigate(`/full-player/${courseId}/${playerData.lectureId || playerData._id}`)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
                                    >
                                        <span>🖥️</span>
                                        <span>Open Fullscreen Video Player</span>
                                    </button>
                                </div>

                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm overflow-hidden text-center space-y-4">
                                <img src={courseData ? courseData.courseThumbnail : ''} alt="Thumbnail" className="w-full rounded-xl object-cover h-56 shadow-xs" />
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Ready to start learning?</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Click any lecture from the left structure to open the Fullscreen Video Player.</p>
                                </div>
                                {courseData && courseData.courseContent && courseData.courseContent[0]?.chapterContent[0] && (
                                    <button
                                        onClick={() => {
                                            const firstLec = courseData.courseContent[0].chapterContent[0];
                                            navigate(`/full-player/${courseId}/${firstLec.lectureId || firstLec._id}`);
                                        }}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                                    >
                                        <span>▶</span>
                                        <span>Start First Lecture</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <Footer/>
        </>
    ) : <Loading/>
}

export default Player