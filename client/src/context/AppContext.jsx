import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {

    const currency = import.meta.env.VITE_CURRENCY
    const navigate = useNavigate()

    const [allCourses, setAllCourses] = useState([]);
    const [isEducator, setIsEducator] = useState(true);

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


    const calculateNoOfLectures = (course) => {
        let noOfLectures = 0;
        course.courseContent.forEach(chapter => {
            if (Array.isArray(chapter.chapterContent)) {
                noOfLectures += chapter.chapterContent.length;
            }
        });
        return noOfLectures;
    };


    const calculateCourseDuration = (course) => {
        let time = 0;
        course.courseContent.forEach(chapter => {
            chapter.chapterContent.forEach(lecture => {
                time += lecture.lectureDuration;
            });
        });
        return time;
    };

    const value = {
        currency,
        allCourses,
        navigate,
        calculateRating,
        calculateNoOfLectures,
        calculateCourseDuration,
        isEducator,
        setIsEducator
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};