import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { assets, dummyDashboardData } from '../../assets/assets'
import Loading from '../../components/student/Loading'

const Dashboard = () => {
    const { currency } = useContext(AppContext)
    const navigate = useNavigate()
    const [dashBoardData, setDashBoardData] = useState(null)
    
    const fetchDashboardData = async () => {
        setDashBoardData(dummyDashboardData)
    }
    
    useEffect(() => {
        fetchDashboardData()
    }, [])

    return dashBoardData ? (
        <div className='p-6 sm:p-10 space-y-8'>
            <div className='flex flex-wrap items-center gap-6'>
                <div className='flex items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-sm min-w-[240px] flex-1'>
                    <img src={assets.appointments_icon} alt="appointments_icon" className='w-12 h-12' />
                    <div>
                        <p className='text-2xl font-bold text-gray-800'>{dashBoardData.totalCourses}</p>
                        <p className='text-sm text-gray-500 font-medium'>Total Courses</p>
                    </div>
                </div>
                
                <div className='flex items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-sm min-w-[240px] flex-1'>
                    <img src={assets.patients_icon} alt="patients_icon" className='w-12 h-12' />
                    <div>
                        <p className='text-2xl font-bold text-gray-800'>{dashBoardData.enrolledStudentsData.length}</p>
                        <p className='text-sm text-gray-500 font-medium'>Total Students</p>
                    </div>
                </div>
                
                <div className='flex items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-sm min-w-[240px] flex-1'>
                    <img src={assets.earning_icon} alt="earning_icon" className='w-12 h-12' />
                    <div>
                        <p className='text-2xl font-bold text-gray-800'>{currency}{dashBoardData.totalEarnings.toFixed(2)}</p>
                        <p className='text-sm text-gray-500 font-medium'>Total Earnings</p>
                    </div>
                </div>
            </div>
            
            <div className='w-full'>
                <h2 className='text-lg font-bold text-gray-800 mb-4'>Latest Enrollments</h2>
                <div className='bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm'>
                    <table className='w-full text-left table-auto border-collapse'>
                        <thead className='bg-gray-50 text-gray-700 text-sm font-semibold border-b border-gray-200/80'>
                            <tr>
                                <th className='px-6 py-4'>#</th>
                                <th className='px-6 py-4'>Student Name</th>
                                <th className='px-6 py-4'>Course Title</th>
                            </tr>
                        </thead>
                        <tbody className='text-sm text-gray-600 divide-y divide-gray-150'>
                            {dashBoardData.enrolledStudentsData.slice(0, 5).map((item, index) => (
                                <tr key={index} className='hover:bg-gray-50/50 transition-colors'>
                                    <td className='px-6 py-4 font-semibold'>{index + 1}</td>
                                    <td className='px-6 py-4 flex items-center gap-3'>
                                        <img src={item.student.imageUrl} alt="" className='w-8 h-8 rounded-full object-cover border border-gray-200' />
                                        <span className='font-bold text-gray-800'>{item.student.name}</span>
                                    </td>
                                    <td className='px-6 py-4 font-medium'>{item.courseTitle}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    ) : <Loading />
}

export default Dashboard