import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { Line } from 'rc-progress'
import Footer from '../../components/student/Footer'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyEnrollments = () => {

        const {enrolledCourses, calculateCourseDuration,navigate,userData,
            fetchUserEnrolledCourses, backendUrl,getToken ,calculateNoOfLectures  } = useContext(AppContext)

        const [progressArray,setProgressArray] = useState([])

        const getCourseProgress = async ()=>{
            try{
                const token = await getToken();
                const tempProgressArray =await Promise.all(
                    enrolledCourses.map(
                    async (course)=>{
                        const {data} = await axios.post(`${backendUrl}/api/user/get-course-progress`
                            , {courseId: course._id},{headers: {Authorization:`Bearer ${token}`}})

                             let totalLectures = calculateNoOfLectures(course);

             const lectureCompleted = data.progressData ? data.progressData.
             lectureCompleted.length : 0;

             return { totalLectures, lectureCompleted}
                            
                            
                    }
                )
            )
                
             setProgressArray(tempProgressArray);

            }catch (error){
              toast.error(error.message);
            }
        }

        useEffect(() => {
            if(userData){
                fetchUserEnrolledCourses()
            }
        },[userData])

         useEffect(() => {
            if(enrolledCourses.length > 0){
                getCourseProgress()
            }
        },[enrolledCourses])
           

    return (
        <>
        <div className='min-h-[80vh] bg-slate-50/50 py-10 md:px-24 px-6 max-w-7xl mx-auto'>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className='text-3xl font-extrabold text-slate-900 tracking-tight'>My Enrollments</h1>
                    <p className='text-sm text-slate-500 mt-1'>Track your course progress and continue learning</p>
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-full">
                    {enrolledCourses.length} Enrolled Courses
                </span>
            </div>

            {enrolledCourses.length === 0 ? (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-xs my-8 space-y-4">
                    <span className="text-4xl">🎓</span>
                    <h3 className="text-lg font-bold text-slate-800">No enrolled courses yet</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">Explore our wide selection of courses and start learning today!</p>
                    <button onClick={() => navigate('/course-list')} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold px-6 py-2.5 rounded-full shadow-sm hover:shadow cursor-pointer">
                        Explore Courses
                    </button>
                </div>
            ) : (
                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                    <table className='table-auto w-full text-left'>
                        <thead className='bg-slate-50/80 text-slate-700 border-b border-slate-200 text-xs font-bold uppercase tracking-wider'>
                            <tr>
                                <th className='px-6 py-4'>Course</th>
                                <th className='px-6 py-4 max-sm:hidden'>Duration</th>
                                <th className='px-6 py-4 max-sm:hidden'>Completed</th>
                                <th className='px-6 py-4 text-right sm:text-left'>Action</th>                        
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-slate-100 text-slate-700 text-sm'>
                            {enrolledCourses.map((course, index) => {
                                const percent = progressArray[index] && progressArray[index].totalLectures > 0 
                                    ? Math.round((progressArray[index].lectureCompleted * 100) / progressArray[index].totalLectures) 
                                    : 0;
                                const isCompleted = percent === 100;

                                return (
                                    <tr key={index} className='hover:bg-slate-50/60 transition-colors'>
                                        <td className='px-6 py-4 flex items-center gap-4'>
                                            <img src={course.courseThumbnail} alt='' className='w-16 sm:w-24 rounded-xl object-cover aspect-video shadow-xs border border-slate-100'/>
                                            <div className='flex-1 min-w-0'>
                                                <p className='font-bold text-slate-900 truncate mb-1.5 hover:text-indigo-600 cursor-pointer' onClick={() => navigate('/player/' + course._id)}>
                                                    {course.courseTitle}
                                                </p>
                                                <div className="w-full max-w-xs bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}`}
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                                <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">{percent}% completed</span>
                                            </div>
                                        </td>
                                        <td className='px-6 py-4 max-sm:hidden font-medium text-slate-600'>
                                            {calculateCourseDuration(course)}
                                        </td>
                                        <td className='px-6 py-4 max-sm:hidden font-medium text-slate-600'>
                                            {progressArray[index] ? `${progressArray[index].lectureCompleted} / ${progressArray[index].totalLectures}` : '0'} lectures
                                        </td>
                                        <td className='px-6 py-4 text-right sm:text-left'>
                                            <button 
                                                className={`px-5 py-2 rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer ${
                                                    isCompleted 
                                                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                }`}
                                                onClick={() => navigate('/player/' + course._id)}
                                            >
                                                {isCompleted ? '✓ Completed' : 'Continue Learning'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
        <Footer/>
        </>
    )
}

export default MyEnrollments