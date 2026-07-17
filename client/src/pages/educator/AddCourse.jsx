import React, { useEffect, useRef, useState } from 'react'
import uniqid from 'uniqid'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { assets } from '../../assets/assets'

const AddCourse = () => {

    const quillRef = useRef(null);
    const editorRef = useRef(null);

    const [courseTitle, setCourseTitle] = useState("");
    const [chapters, setChapters] = useState([]);
    const [image, setImage] = useState(null);
    const [coursePrice, setCoursePrice] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [showPop, setShowPop] = useState(false);
    const [currentChapterId, setCurrentChapterId] = useState(null);

    const [lectureDetails, setLectureDetails] = useState({
        lectureTitle: '',
        lectureDuration: '',
        lectureUrl: '',
        isPreviewFree: false,
    });

    const handleChapter = (action, chapterId) => {
        if (action === 'add') {
            const title = prompt("Enter Chapter Name:");
            if (title) {
                const newChapter = {
                    chapterId: uniqid(),
                    chapterTitle: title,
                    chapterOrder: chapters.length + 1,
                    chapterContent: [],
                    collapsed: false
                };
                setChapters([...chapters, newChapter]);
            }
        } else if (action === 'remove') {
            setChapters(chapters.filter((chapter) => chapter.chapterId !== chapterId));
        }
    }

    const handleLecture = (action, chapterId, lectureIndex) => {
        if (action === 'add') {
            setChapters(
                chapters.map((chapter) => {
                    if (chapter.chapterId === chapterId) {
                        return {
                            ...chapter,
                            chapterContent: [...chapter.chapterContent, {
                                ...lectureDetails,
                                lectureId: uniqid(),
                                lectureOrder: chapter.chapterContent.length + 1
                            }]
                        }
                    }
                    return chapter;
                })
            );
            setShowPop(false);
            setLectureDetails({
                lectureTitle: '',
                lectureDuration: '',
                lectureUrl: '',
                isPreviewFree: false,
            });
        } else if (action === 'remove') {
            setChapters(
                chapters.map((chapter) => {
                    if (chapter.chapterId === chapterId) {
                        return {
                            ...chapter,
                            chapterContent: chapter.chapterContent.filter((_, index) => index !== lectureIndex)
                        }
                    }
                    return chapter;
                })
            );
        }
    }

    const toggleChapter = (index) => {
        setChapters(
            chapters.map((chapter, i) =>
                i === index ? { ...chapter, collapsed: !chapter.collapsed } : chapter
            )
        )
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        // submit form logic
    }

    useEffect(() => {
        // initiate quill only once
        if (!quillRef.current && editorRef.current) {
            quillRef.current = new Quill(editorRef.current, {
                theme: 'snow'
            });
        }
    }, []);

    return (
        <div className='h-screen overflow-y-scroll flex flex-col justify-between p-4 md:p-8 pt-0 font-sans'>
            <form onSubmit={handleSubmit} className='max-w-3xl w-full text-gray-500 space-y-5' >
                <div className='flex flex-col gap-1'>
                    <p>Course Title</p>
                    <input onChange={e => setCourseTitle(e.target.value)} value={courseTitle} type='text' placeholder='Type here' className='outline-none border border-gray-300 p-2.5 rounded w-full text-gray-800' required />
                </div>

                <div className='flex flex-col gap-1'>
                    <p>Course Description</p>
                    <div ref={editorRef} className='min-h-40 bg-white border border-gray-300 rounded' ></div>
                </div>

                <div className='flex flex-wrap items-center gap-10'>
                    <div className='flex flex-col gap-1'>
                        <p>Course Price</p>
                        <input type='number' placeholder='0' onChange={e => setCoursePrice(e.target.value)} className='outline-none w-28 border border-gray-300 p-2.5 rounded text-gray-800' />
                    </div>

                    <div className='flex flex-col gap-1'>
                        <p>Course Thumbnail</p>
                        <div className='flex items-center gap-3'>
                            <label htmlFor="thumbnail" className='cursor-pointer flex items-center gap-3'>
                                <span className='text-gray-500'>Course Thumbnail</span>
                                <div className='bg-blue-500 p-2 rounded text-white flex items-center justify-center w-10 h-10 hover:bg-blue-600 transition'>
                                    <img src={assets.file_upload_icon} alt="" className='w-5 h-5 filter invert' />
                                </div>
                                <input type='file' id='thumbnail' onChange={e => setImage(e.target.files[0])} accept="image/*" hidden />
                            </label>
                            {image && <img src={URL.createObjectURL(image)} alt="" className='max-h-10 rounded' />}
                        </div>
                    </div>
                </div>

                <div className='flex flex-col gap-1'>
                    <p>Discount %</p>
                    <input type='number' placeholder='0' onChange={e => setDiscount(e.target.value)} className='outline-none w-28 border border-gray-300 p-2.5 rounded text-gray-800' />
                </div>

                {/* adding chapters */}
                <div className='w-full text-gray-700'>
                    {chapters.map((chapter, chapterIndex) => (
                        <div key={chapterIndex} className='bg-white border border-gray-200 rounded my-2'>
                            <div className='flex items-center justify-between p-4 border-b border-gray-150/80'>
                                <div className='flex items-center gap-2'>
                                    <img
                                        src={assets.dropdown_icon}
                                        onClick={() => toggleChapter(chapterIndex)}
                                        alt=""
                                        className={`w-4 h-4 cursor-pointer transition-all ${chapter.collapsed ? "-rotate-90" : ""}`}
                                    />
                                    <span className='font-semibold'>{chapterIndex + 1} {chapter.chapterTitle}</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <span className='text-gray-500 text-sm'>{chapter.chapterContent.length} Lectures</span>
                                    <img
                                        src={assets.cross_icon}
                                        onClick={() => handleChapter('remove', chapter.chapterId)}
                                        alt=""
                                        className='cursor-pointer w-4 h-4 hover:scale-110 transition'
                                    />
                                </div>
                            </div>
                            {!chapter.collapsed && (
                                <div className="p-4 bg-gray-50/50">
                                    {chapter.chapterContent.map((lecture, lectureIndex) => (
                                        <div key={lectureIndex} className="flex justify-between items-center mb-2 text-sm text-gray-600">
                                            <span>{lectureIndex + 1} {lecture.lectureTitle} - {lecture.lectureDuration} mins - <a href={lecture.lectureUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Link</a> - {lecture.isPreviewFree ? 'Free Preview' : 'Paid'}</span>
                                            <img
                                                src={assets.cross_icon}
                                                onClick={() => handleLecture('remove', chapter.chapterId, lectureIndex)}
                                                alt=""
                                                className='cursor-pointer w-3.5 h-3.5 hover:scale-115 transition'
                                            />
                                        </div>
                                    ))}
                                    <div
                                        onClick={() => { setCurrentChapterId(chapter.chapterId); setShowPop(true); }}
                                        className='inline-flex items-center gap-2 mt-2 cursor-pointer text-gray-700 bg-gray-100 px-3 py-1.5 rounded hover:bg-gray-200 transition text-sm font-medium'
                                    >
                                        + Add Lecture
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    <div
                        onClick={() => handleChapter('add')}
                        className='w-full bg-blue-50 text-blue-600 border border-blue-200 p-2.5 rounded hover:bg-blue-100 transition cursor-pointer text-center mt-4 font-medium'
                    >
                        + Add Chapter
                    </div>
                </div>

                <button type='submit' className='bg-black text-white px-8 py-2 rounded font-semibold hover:bg-gray-800 transition'>ADD</button>
            </form>

            {showPop && (
                <div className='fixed inset-0 bg-black/40 z-50 flex items-center justify-center'>
                    <div className='bg-white p-6 rounded-lg w-full max-w-80 shadow-lg relative text-gray-700'>
                        <div className='flex justify-between items-center mb-4'>
                            <h2 className='text-lg font-semibold'>Add Lecture</h2>
                            <img src={assets.cross_icon} onClick={() => setShowPop(false)} alt="" className='cursor-pointer w-4 h-4' />
                        </div>

                        <div className='mb-3'>
                            <p className='text-sm font-medium mb-1'>Lecture Title</p>
                            <input
                                type="text"
                                className="w-full border rounded py-1.5 px-3 outline-none focus:border-blue-500 text-gray-800"
                                value={lectureDetails.lectureTitle}
                                onChange={(e) => setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })}
                            />
                        </div>

                        <div className='mb-3'>
                            <p className='text-sm font-medium mb-1'>Duration (minutes)</p>
                            <input
                                type="number"
                                className="w-full border rounded py-1.5 px-3 outline-none focus:border-blue-500 text-gray-800"
                                value={lectureDetails.lectureDuration}
                                onChange={(e) => setLectureDetails({ ...lectureDetails, lectureDuration: e.target.value })}
                            />
                        </div>

                        <div className='mb-3'>
                            <p className='text-sm font-medium mb-1'>Lecture URL</p>
                            <input
                                type="text"
                                className="w-full border rounded py-1.5 px-3 outline-none focus:border-blue-500 text-gray-800"
                                value={lectureDetails.lectureUrl}
                                onChange={(e) => setLectureDetails({ ...lectureDetails, lectureUrl: e.target.value })}
                            />
                        </div>

                        <div className='mb-5 flex items-center gap-2'>
                            <input
                                type="checkbox"
                                id="isPreviewFree"
                                className='w-4 h-4 cursor-pointer'
                                checked={lectureDetails.isPreviewFree}
                                onChange={(e) => setLectureDetails({ ...lectureDetails, isPreviewFree: e.target.checked })}
                            />
                            <label htmlFor="isPreviewFree" className='text-sm cursor-pointer select-none'>Is Preview Free?</label>
                        </div>

                        <button
                            type="button"
                            className='w-full py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 transition'
                            onClick={() => handleLecture('add', currentChapterId)}
                        >
                            Add
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AddCourse