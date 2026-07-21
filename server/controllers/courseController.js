import Course from "../models/course.js";

// Get all published courses
export const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({})
            .select(['-courseContent', '-enrolledStudents'])
            .populate('educator');

        res.json({
            success: true,
            courses
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Get course by ID with protected non-preview lecture URLs
export const getCourseId = async (req, res) => {
    try {
        const { id } = req.params;

        const courseData = await Course.findById(id).populate('educator');

        if (!courseData) {
            return res.json({
                success: false,
                message: "Course not found"
            });
        }

        // Remove lectureUrl if isPreviewFree is false
        courseData.courseContent.forEach(chapter => {
            chapter.chapterContent.forEach(lecture => {
                if (!lecture.isPreviewFree && !lecture.isPreview) {
                    lecture.lectureUrl = "";
                    if (lecture.lectureURL) lecture.lectureURL = "";
                }
            });
        });

        res.json({
            success: true,
            courseData
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Export alias for getCourseById
export const getCourseById = getCourseId;