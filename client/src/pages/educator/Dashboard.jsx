import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'
import Loading from '../../components/student/Loading'
import axios from 'axios'
import { toast } from 'react-toastify'

const Dashboard = () => {

    
    const { currency, backendUrl,isEducator,getToken} = useContext(AppContext)
    const navigate = useNavigate()
    const [dashBoardData, setDashBoardData] = useState(null)

    const fetchDashboardData = async () => {
      try{
        const token =await getToken()
        const { data }=await axios.get(backendUrl + '/api/educator/dashboard',
            {headers:{Authorization:`Bearer ${token}`}}
          )

            if (data.success){
                setDashBoardData(data.dashboardData || data.dashBoardData)
            }else{
                toast.error(data.message)
            }
      
      }catch (error){
          toast.error(error.message)
      }
    }

    useEffect(() => {
        if(isEducator){

            fetchDashboardData()
        }
       
    }, [isEducator])

    return dashBoardData ? (
        <div className='p-6 sm:p-10 space-y-8 min-h-[calc(100vh-160px)] pb-10 bg-slate-50/40'>
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Overview Dashboard</h1>
                <p className="text-xs text-slate-500 mt-1 font-medium">Performance summary of your active courses & enrollments</p>
            </div>

            <div className='flex flex-wrap items-center gap-6'>
                <div className='flex items-center gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs hover:shadow-md transition-shadow min-w-[240px] flex-1'>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold border border-blue-100">
                        📚
                    </div>
                    <div>
                        <p className='text-2xl font-extrabold text-slate-900'>{dashBoardData.totalCourses}</p>
                        <p className='text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5'>Total Courses</p>
                    </div>
                </div>

                <div className='flex items-center gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs hover:shadow-md transition-shadow min-w-[240px] flex-1'>
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold border border-indigo-100">
                        👨‍🎓
                    </div>
                    <div>
                        <p className='text-2xl font-extrabold text-slate-900'>{dashBoardData.enrolledStudentsData ? dashBoardData.enrolledStudentsData.length : 0}</p>
                        <p className='text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5'>Total Students</p>
                    </div>
                </div>

                <div className='flex items-center gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs hover:shadow-md transition-shadow min-w-[240px] flex-1'>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold border border-emerald-100">
                        💰
                    </div>
                    <div>
                        <p className='text-2xl font-extrabold text-slate-900'>{currency}{dashBoardData.totalEarnings ? dashBoardData.totalEarnings.toFixed(2) : '0.00'}</p>
                        <p className='text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5'>Total Revenue</p>
                    </div>
                </div>
            </div>

            <div className='w-full space-y-4'>
                <h2 className='text-lg font-bold text-slate-900'>Latest Enrollments</h2>
                <div className='bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs'>
                    <table className='w-full text-left table-auto border-collapse'>
                        <thead className='bg-slate-50/80 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200/80'>
                            <tr>
                                <th className='px-6 py-4'>#</th>
                                <th className='px-6 py-4'>Student Name</th>
                                <th className='px-6 py-4'>Course Title</th>
                            </tr>
                        </thead>
                        <tbody className='text-sm text-slate-600 divide-y divide-slate-100'>
                            {dashBoardData.enrolledStudentsData && dashBoardData.enrolledStudentsData.slice(0, 5).map((item, index) => (
                                <tr key={index} className='hover:bg-slate-50/60 transition-colors'>
                                    <td className='px-6 py-4 font-semibold text-slate-400'>{index + 1}</td>
                                    <td className='px-6 py-4 flex items-center gap-3'>
                                        <img src={item.student.imageUrl} alt="" className='w-8 h-8 rounded-full object-cover border border-slate-200' />
                                        <span className='font-bold text-slate-900'>{item.student.name}</span>
                                    </td>
                                    <td className='px-6 py-4 font-medium text-slate-700'>{item.courseTitle}</td>
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