import mongoose from "mongoose";

const lecturSchema = new mongoose.Schema({
    lectureId: { type: String, required: true },
    lectureTitle: { type: String, required: true },
    lectureDuration: { type: String, required: true },
    lectureURL: { type: String, required: true },
    isPreview: { type: Boolean, required: true },
    lectureOreder: { type: Number, required: true }
},{_id:false})


const chapterSchema = new mongoose.Schema({
    chapterId: { type: String, required: true },
    chapterOrder: { type: Number, required: true },
    chapterTitle: { type: String, required: true },
    chapterContent: [lecturSchema]
}, { _id: false })

const ratingSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    rating: { type: Number, min:1,max:5 }
},{_id:false})

const courseSchema = new mongoose.Schema({
    courseTitle: { type: String, required: true },
    courseDescription: { type: String, required: true },
    courseThumbnail: { type: String, required: true },
    coursePrice: { type: Number, required: true },
    isPublished: { type: Boolean, default: false },
    discount: { type: Number, default: 0 },
    courseContent: [chapterSchema],
    courseRatings: [ratingSchema],
    educator: { type: String, ref: 'User', required: true },
    enrolledStudents: [{ type: String, ref: 'User' }]}, { timestamps: true, minimize: false })

const Course = mongoose.model("Course", courseSchema)
export default Course