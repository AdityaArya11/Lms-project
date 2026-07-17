import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { dummyStudentEnrolled } from '../../assets/assets'
import Loading from '../../components/student/Loading'

const StudentsEnrolled = () => {
    const [enrolledStudents, setEnrolledStudents] = useState(null)
    const { allCourses } = useContext(AppContext)

    const fetchEnrolledStudentsData = async () => {
        setEnrolledStudents(dummyStudentEnrolled)
    }

    useEffect(() => {
        fetchEnrolledStudentsData()
    }, [])

    return enrolledStudents ? (
        <div className='min-h-screen flex flex-col justify-between p-4 md:p-8 pt-0'>
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
                                        <img src={item.student.imageUrl} alt="" className='w-8 h-8 rounded-full object-cover border border-gray-200' />
                                        <span className='font-semibold text-gray-800'>{item.student.name}</span>
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