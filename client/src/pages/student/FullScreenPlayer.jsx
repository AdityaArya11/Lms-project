import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';
import {
  dbGetByLecture,
  dbAdd,
  dbDelete,
  captureFrame,
  generatePdfFromSnapshots,
} from '../../utils/screenshotUtils';
import './FullScreenPlayer.css';

const FullScreenPlayer = () => {
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const { enrolledCourses } = useContext(AppContext);

  const [courseData, setCourseData] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [allLectures, setAllLectures] = useState([]);
  const [currentLectureIndex, setCurrentLectureIndex] = useState(-1);
  const [snapshots, setSnapshots] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const youtubePlayerRef = useRef(null);

  // ── Operations: Course & Lecture resolution ──
  useEffect(() => {
    if (enrolledCourses && enrolledCourses.length > 0) {
      const course = enrolledCourses.find((c) => c._id === courseId);
      if (course) {
        setCourseData(course);
        const flatLectures = [];
        let foundLec = null;
        let foundIndex = -1;

        course.courseContent.forEach((chapter, chIdx) => {
          chapter.chapterContent.forEach((lec, lecIdx) => {
            const item = { ...lec, chapterTitle: chapter.chapterTitle, chapter: chIdx + 1, lecture: lecIdx + 1 };
            flatLectures.push(item);
            if (lec.lectureId === lectureId || lec._id === lectureId) {
              foundLec = item;
              foundIndex = flatLectures.length - 1;
            }
          });
        });

        setAllLectures(flatLectures);
        if (foundLec) {
          setPlayerData(foundLec);
          setCurrentLectureIndex(foundIndex);
        } else if (flatLectures.length > 0) {
          setPlayerData(flatLectures[0]);
          setCurrentLectureIndex(0);
        }
      }
    }
  }, [enrolledCourses, courseId, lectureId]);

  // ── Operations: Load snapshots ──
  const loadScreenshots = useCallback(async () => {
    const targetId = playerData?.lectureId || playerData?._id || lectureId;
    if (!targetId) return;
    try {
      const records = await dbGetByLecture(targetId);
      setSnapshots(records.sort((a, b) => b.createdAt - a.createdAt));
    } catch (e) {
      console.warn('Failed to load screenshots:', e);
    }
  }, [playerData, lectureId]);

  useEffect(() => {
    loadScreenshots();
  }, [loadScreenshots]);

  // ── Operations: Handle Take Snapshot ──
  const handleTakeSnapshot = async () => {
    if (!playerData) {
      toast.info('Please wait for the lecture video to load.');
      return;
    }

    setIsCapturing(true);

    let timestamp = '00:00';
    if (youtubePlayerRef.current) {
      try {
        const sec = await youtubePlayerRef.current.getCurrentTime();
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        timestamp = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
      } catch (_) {}
    }

    const imageDataUrl = await captureFrame();

    if (!imageDataUrl) {
      toast.error('Failed to capture frame. Please allow screen sharing when prompted.');
      setIsCapturing(false);
      return;
    }

    try {
      const targetLecId = playerData.lectureId || playerData._id || lectureId;
      await dbAdd({
        lectureId: targetLecId,
        courseId,
        lectureTitle: playerData.lectureTitle,
        chapterTitle: playerData.chapterTitle,
        timestamp,
        imageDataUrl,
        createdAt: Date.now(),
      });
      toast.success(`📷 Screenshot saved @ ${timestamp}`);
      await loadScreenshots();
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save screenshot locally.');
    } finally {
      setIsCapturing(false);
    }
  };

  // ── Operations: Handle Delete ──
  const handleDeleteSnapshot = async (id) => {
    try {
      await dbDelete(id);
      toast.info('Screenshot deleted.');
      await loadScreenshots();
    } catch (e) {
      setSnapshots(snapshots.filter((s) => s.id !== id));
    }
  };

  // ── Operations: Handle PDF Export ──
  const handleExportPDF = () => {
    generatePdfFromSnapshots(snapshots, courseData?.courseTitle, playerData?.lectureTitle);
  };

  // ── Operations: Switch Lecture ──
  const handleSwitchLecture = (newIndex) => {
    if (newIndex >= 0 && newIndex < allLectures.length) {
      const target = allLectures[newIndex];
      setCurrentLectureIndex(newIndex);
      setPlayerData(target);
      navigate(`/full-player/${courseId}/${target.lectureId || target._id}`, { replace: true });
    }
  };

  return (
    <div className="full-player-container">
      {/* Top Header Bar */}
      <div className="full-player-header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/player/${courseId}`)} className="btn-back">
            ← Back
          </button>
          {courseData && (
            <h1 className="text-sm font-bold text-slate-800 truncate max-w-[200px] sm:max-w-md hidden sm:block">
              {courseData.courseTitle}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <button disabled={isCapturing} onClick={handleTakeSnapshot} className="btn-snap">
            <span className="text-sm">📷</span>
            <span>{isCapturing ? 'Capturing...' : 'Snap'}</span>
          </button>

          {snapshots.length > 0 && (
            <button onClick={handleExportPDF} className="btn-pdf">
              <span>📄</span>
              <span>PDF ({snapshots.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Video & Content */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {playerData ? (
          <div className="space-y-5">
            {/* Video Player */}
            <div className="video-card">
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-black shadow-inner">
                <YouTube
                  videoId={playerData.lectureUrl ? playerData.lectureUrl.split('/').pop() : ''}
                  iframeClassName="w-full h-full aspect-video"
                  onReady={(e) => (youtubePlayerRef.current = e.target)}
                />
              </div>

              {/* Lecture Title & Controls */}
              <div className="p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-200 mt-2">
                <div>
                  <span className="text-[11px] font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded">
                    Chapter {playerData.chapter || 1} • Lecture {playerData.lecture || 1}
                  </span>
                  <h2 className="text-lg font-extrabold text-slate-900 mt-1">{playerData.lectureTitle}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentLectureIndex <= 0}
                    onClick={() => handleSwitchLecture(currentLectureIndex - 1)}
                    className="disabled:opacity-40 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                  >
                    ← Prev
                  </button>
                  <button
                    disabled={currentLectureIndex >= allLectures.length - 1}
                    onClick={() => handleSwitchLecture(currentLectureIndex + 1)}
                    className="disabled:opacity-40 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>

            {/* Screenshot Gallery */}
            <div className="gallery-card">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Screenshots ({snapshots.length})</h3>
                  <p className="text-xs text-slate-500">Stored locally in your browser • No upload needed</p>
                </div>
                {snapshots.length > 0 && (
                  <button onClick={handleExportPDF} className="btn-pdf">
                    <span>📄</span>
                    <span>Download PDF</span>
                  </button>
                )}
              </div>

              {snapshots.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-3">
                  {snapshots.map((snap, i) => (
                    <div key={snap.id || i} className="screenshot-tile">
                      {snap.imageDataUrl && (
                        <div
                          className="relative aspect-video bg-black overflow-hidden cursor-pointer"
                          onClick={() => setPreviewImage(snap.imageDataUrl)}
                        >
                          <img
                            src={snap.imageDataUrl}
                            alt="Captured frame"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-blue-600 font-mono text-white font-bold px-2 py-0.5 rounded shadow">
                            #{i + 1}
                          </span>
                        </div>
                      )}
                      <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                        <p className="text-xs font-bold text-slate-900 truncate">{snap.lectureTitle || playerData.lectureTitle}</p>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[10px] text-slate-500">
                          <span>⏱️ {snap.timestamp || '--:--'}</span>
                          <button
                            onClick={() => handleDeleteSnapshot(snap.id)}
                            className="text-slate-700 hover:text-red-600 cursor-pointer text-xs font-semibold"
                            title="Delete screenshot"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500 space-y-1 mt-3">
                  <span className="text-2xl block">📷</span>
                  <p className="font-semibold text-slate-800">No screenshots yet</p>
                  <p>
                    Click the <strong>"Snap"</strong> button in the top bar to capture the current video frame.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-slate-900 font-medium text-sm">Loading lecture video...</div>
        )}
      </div>

      {/* Lightbox Preview */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div
            className="relative max-w-5xl w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-2.5 text-white border-b border-slate-800 mb-2">
              <span className="text-xs font-bold text-slate-300">Screenshot Preview</span>
              <button onClick={() => setPreviewImage(null)} className="text-slate-400 hover:text-white font-bold px-2 py-1">
                ✕
              </button>
            </div>
            <img src={previewImage} alt="Full screenshot preview" className="w-full h-auto max-h-[80vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default FullScreenPlayer;
