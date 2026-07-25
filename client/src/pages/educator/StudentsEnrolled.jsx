import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import Loading from '../../components/student/Loading'
import axios from 'axios'
import { toast } from 'react-toastify'

const StudentsEnrolled = () => {

    const {backendUrl,getToken,isEducator} = useContext(AppContext)
    const [enrolledStudents, setEnrolledStudents] = useState(null)
    const { allCourses } = useContext(AppContext)

    const fetchEnrolledStudents = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get(backendUrl + '/api/educator/enrolled-students',
                { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                setEnrolledStudents(data.enrolledStudents.reverse())
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (isEducator) {
            fetchEnrolledStudents()
        }
    }, [isEducator])

    return enrolledStudents ? (
        <div className='min-h-[calc(100vh-160px)] flex flex-col justify-between p-4 md:p-8 pt-0 pb-10'>
            <div className='w-full'>
                <h2 className='pb-4 text-lg font-medium'>
                    Students Enrolled
                </h2>
                <div className='flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md border border-gray-200 bg-white'>
                    <table className='md:table-auto table-fixed w-full overflow-hidden text-left'>
                        <thead className='text-gray-900 border-b border-gray-200 text-sm bg-gray-50'>
                            <tr>
                                <th className='px-4 py-3 font-semibold truncate'>#</th>
                                <th className='px-4 py-3 font-semibold truncate'>Student Name</th>
                                <th className='px-4 py-3 font-semibold truncate'>Course Title</th>
                                <th className='px-4 py-3 font-semibold truncate'>Date</th>
                            </tr>
                        </thead>
                        <tbody className='text-sm text-gray-500'>
                            {enrolledStudents.map((item, index) => (
                                <tr key={index} className='border-b border-gray-200/80 hover:bg-gray-50/50 transition-colors'>
                                    <td className='px-4 py-3 font-medium text-gray-800'>{index + 1}</td>
                                    <td className='md:px-4 pl-2 md:pl-4 py-3 flex items-center gap-3'>
                                        <img src={item.student?.imageUrl || assets.profile_img} alt="" className='w-8 h-8 rounded-full object-cover border border-gray-200' />
                                        <span className='font-semibold text-gray-800'>{item.student?.name || 'Student'}</span>
                                    </td>
                                    <td className='px-4 py-3 font-medium text-gray-800'>
                                        {item.courseTitle}
                                    </td>
                                    <td className='px-4 py-3 font-medium text-gray-800'>
                                        {new Date(item.purchaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
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

export default StudentsEnrolled