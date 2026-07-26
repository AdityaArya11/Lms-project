import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useAuth,useUser } from "@clerk/clerk-react";
import axios from 'axios'
import { toast } from "react-toastify";


export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
     
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001'
    const currency = import.meta.env.VITE_CURRENCY || '$'
    const navigate = useNavigate()
     const {getToken} = useAuth()
     const{user} = useUser()
    const [allCourses, setAllCourses] = useState([]);
    const [isEducator, setIsEducator] = useState(false);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [userData, setUserData] = useState(null);

    const fetchAllCourses = async () => {
        try {
            const url = `${backendUrl}/api/course/all`;
            const { data } = await axios.get(url);

            if (data && data.success) {
                setAllCourses(data.courses || []);
            } else if (data) {
                toast.error(data.message || 'Failed to load courses');
            }
        } catch (error) {
            console.error("Error fetching all courses:", error);
            toast.error(error.message);
        }
    };

    //fetch user data

    const fetchUserData = async () => {

        if(user.publicMetadata.role === 'educator')
        {
            setIsEducator(true)
        }
    
        try {
            const token = await getToken();
            console.log("Clerk Auth Token:", token);

            const {data} = await axios.get(backendUrl +'/api/user/data',{headers:
                {Authorization:`Bearer ${token}`}})

                if(data.success){
                    setUserData(data.userData || data.user)
                }else{
                    toast.error(data.message)
                }
                
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        fetchAllCourses();
    }, []);


    const calculateRating = (course) => {
        if (!course.courseRatings || course.courseRatings.length === 0) return 0;
        const totalRating = course.courseRatings.reduce((sum, val) => sum + val.rating, 0);
        return Math.floor(totalRating / course.courseRatings.length);
    };

    const formatLectureDuration = (duration) => {
        const num = Number(duration) || 0;
        if (num <= 0) return '0m';
        const minutes = num > 100 ? num / 60 : num;
        return humanizeDuration(Math.round(minutes * 60 * 1000), { units: ['h', 'm'], round: true });
    };

    const calculateChapterTime = (chapter) => {
        let timeInMinutes = 0;
        if (chapter && Array.isArray(chapter.chapterContent)) {
            chapter.chapterContent.forEach(lecture => {
                const num = Number(lecture.lectureDuration) || 0;
                timeInMinutes += num > 100 ? num / 60 : num;
            });
        }
        return humanizeDuration(Math.round(timeInMinutes * 60 * 1000), { units: ['h', 'm'], round: true });
    };

    const calculateNoOfLectures = (course) => {
        let noOfLectures = 0;
        if (course && Array.isArray(course.courseContent)) {
            course.courseContent.forEach(chapter => {
                if (Array.isArray(chapter.chapterContent)) {
                    noOfLectures += chapter.chapterContent.length;
                }
            });
        }
        return noOfLectures;
    };

    //Fetch enrolled courses
    const fetchUserEnrolledCourses = async () => {
        try{

            const token = await getToken();
        const {data} = await axios.get(backendUrl+'/api/user/enrolled-courses',
            {headers: {Authorization:`Bearer ${token}`}})
            if(data.success){
                setEnrolledCourses(data.enrolledCourses.reverse());
            }else{
                toast.error(data.message)
            }
         }catch(error)
        {
            toast.error(error.message)
        }
        
    }

    useEffect(() => {
        if (user) {
            fetchUserData()
            fetchUserEnrolledCourses()
        }
    }, [user])

    const calculateCourseDuration = (course) => {
        let timeInMinutes = 0;
        if (course && Array.isArray(course.courseContent)) {
            course.courseContent.forEach(chapter => {
                if (Array.isArray(chapter.chapterContent)) {
                    chapter.chapterContent.forEach(lecture => {
                        const num = Number(lecture.lectureDuration) || 0;
                        timeInMinutes += num > 100 ? num / 60 : num;
                    });
                }
            });
        }
        return humanizeDuration(Math.round(timeInMinutes * 60 * 1000), { units: ['h', 'm'], round: true });
    };



    const value = {
        currency,
        allCourses,
        navigate,
        calculateRating,
        calculateChapterTime,
        formatLectureDuration,
        calculateNoOfLectures,
        calculateCourseDuration,
        isEducator,
        setIsEducator,
        enrolledCourses,
        fetchUserEnrolledCourses,
        getToken,
        backendUrl,
        userData,
        setUserData,
        fetchAllCourses
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};