import React, { useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const Loading = () => {
    const { path } = useParams();
    const navigate = useNavigate();
    const { fetchUserEnrolledCourses } = useContext(AppContext);

    useEffect(() => {
        if (path) {
            const timer = setTimeout(() => {
                if (fetchUserEnrolledCourses) {
                    fetchUserEnrolledCourses();
                }
                navigate(`/${path}`);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [path, navigate, fetchUserEnrolledCourses]);

    return (
        <div className='min-h-screen flex flex-col items-center justify-center gap-4 bg-white'>
            <div className='w-16 sm:w-20 aspect-square border-4 border-gray-300 border-t-4 border-t-blue-600 rounded-full animate-spin'>
            </div>
            {path && <p className='text-gray-500 font-medium text-sm'>Processing payment and redirecting...</p>}
        </div>
    );
};

export default Loading;