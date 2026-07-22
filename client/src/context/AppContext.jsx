import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useAuth,useUser } from "@clerk/clerk-react";
export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {

    const currency = import.meta.env.VITE_CURRENCY
    const navigate = useNavigate()
     const {getToken} = useAuth()
     const{user} = useUser()
    const [allCourses, setAllCourses] = useState([]);
    const [isEducator, setIsEducator] = useState(true);
    const [enrolledCourses, setEnrolledCourses] = useState([]);


    const fetchAllCourses = async () => {
                setAllCourses(dummyCourses);
    };

    useEffect(() => {
        fetchAllCourses();
    }, []);


    const calculateRating = (course) => {
        if (!course.courseRatings || course.courseRatings.length === 0) return 0;
        const totalRating = course.courseRatings.reduce((sum, val) => sum + val.rating, 0);
        return totalRating / course.courseRatings.length;
    };

    const calculateChapterTime = (chapter) => {
        let time = 0;
        chapter.chapterContent.forEach(lecture => {
            time += lecture.lectureDuration;
        });
        return humanizeDuration(time * 60 * 1000, { units: ['h', 'm'] });
    };

    const calculateNoOfLectures = (course) => {
        let noOfLectures = 0;
        course.courseContent.forEach(chapter => {
            if (Array.isArray(chapter.chapterContent)) {
                noOfLectures += chapter.chapterContent.length;
            }
        });
        return noOfLectures;
    };

    //Fetch enrolled courses
    const fetchUserEnrolledCourses = async () => {
        setEnrolledCourses(dummyCourses)
    }

    useEffect(() => {
        fetchAllCourses()
        fetchUserEnrolledCourses()
    }, [])

        const logToken = async()=>{

        console.log(await getToken());
        }
        
        useEffect(()=>{
            if(user){
                logToken()
                
            }
        },[user])



    const calculateCourseDuration = (course) => {
        let time = 0;
        course.courseContent.map(chapter => {
            chapter.chapterContent.map(lecture => {
                time += lecture.lectureDuration;
            });
        });
        return humanizeDuration(time * 60 * 1000, { units: ['h', 'm'] });
    };



    const value = {
        currency,
        allCourses,
        navigate,
        calculateRating,
        calculateChapterTime,
        calculateNoOfLectures,
        calculateCourseDuration,
        isEducator,
        setIsEducator,
        enrolledCourses,
        fetchUserEnrolledCourses,
        getToken
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};