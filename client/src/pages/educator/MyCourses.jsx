import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import Loading from '../../components/student/Loading'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyCourses = () => {

    const { currency, backendUrl, getToken, isEducator } = useContext(AppContext)
    const [courses, setCourses] = useState(null)

    const fetchEducatorCourses = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get(backendUrl + '/api/educator/courses', {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                setCourses(data.courses.reverse())
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (isEducator) {
            fetchEducatorCourses()
        }
    }, [isEducator])

    return courses ? (
        <div className='min-h-[calc(100vh-160px)] flex flex-col justify-between p-4 md:p-8 pt-0 pb-10'>
            <div className='w-full'>
                <h2 className='pb-4 text-lg font-medium'>
                    My Courses
                </h2>
                <div className='flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md border border-gray-200 bg-white'>
                    <table className='md:table-auto table-fixed w-full overflow-hidden text-left'>
                        <thead className='text-gray-900 border-b border-gray-200 text-sm bg-gray-50'>
                            <tr>
                                <th className='px-4 py-3 font-semibold truncate'>All Courses</th>
                                <th className='px-4 py-3 font-semibold truncate'>Earnings</th>
                                <th className='px-4 py-3 font-semibold truncate'>Students</th>
                                <th className='px-4 py-3 font-semibold truncate'>Published On</th>
                            </tr>
                        </thead>
                        <tbody className='text-sm text-gray-500'>
                            {courses.map((course) => (
                                <tr key={course._id} className='border-b border-gray-200/80 hover:bg-gray-50/50 transition-colors'>
                                    <td className='md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3'>
                                        <img src={course.courseThumbnail} alt='' className='w-16 sm:w-20 md:w-24 rounded' />
                                        <div className='flex-1'>
                                            <p className='font-medium text-gray-800 max-sm:text-xs'>{course.courseTitle}</p>
                                        </div>
                                    </td>
                                    <td className='px-4 py-3 font-medium text-gray-800'>
                                        {currency}{Math.floor(course.enrolledStudents.length * (course.coursePrice - (course.coursePrice * course.discount / 100)))}
                                    </td>
                                    <td className='px-4 py-3 font-medium text-gray-800'>
                                        {course.enrolledStudents.length}
                                    </td>
                                    <td className='px-4 py-3 font-medium text-gray-800'>
                                        {new Date(course.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    ) : <Loading />
}

export default MyCourses