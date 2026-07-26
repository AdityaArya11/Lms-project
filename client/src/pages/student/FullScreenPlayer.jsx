import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import { AppContext } from '../../context/AppContext';
import AiTutorDrawer from '../../components/student/AiTutorDrawer';

// ── IndexedDB Helpers (no backend, no Cloudinary) ──
const DB_NAME = 'lms_screenshots_db';
const DB_VERSION = 1;
const STORE_NAME = 'screenshots';

const openDB = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('lectureId', 'lectureId', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const dbGetByLecture = async (lectureId) => {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const idx = tx.objectStore(STORE_NAME).index('lectureId');
    const req = idx.getAll(lectureId);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => resolve([]);
  });
};

const dbAdd = async (record) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).add(record);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

const dbDelete = async (id) => {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
  });
};

// ── Component ──
const FullScreenPlayer = () => {
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const { enrolledCourses, backendUrl } = useContext(AppContext);

  const [courseData, setCourseData] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [allLectures, setAllLectures] = useState([]);
  const [currentLectureIndex, setCurrentLectureIndex] = useState(-1);
  const [snapshots, setSnapshots] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const youtubePlayerRef = useRef(null);

  // Load course and find specific lecture
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

  // Load screenshots from IndexedDB
  const loadScreenshots = useCallback(async () => {
    const targetId = playerData?.lectureId || playerData?._id || lectureId;
    if (!targetId) return;
    try {
      const records = await dbGetByLecture(targetId);
      setSnapshots(records.sort((a, b) => b.createdAt - a.createdAt));
    } catch (e) {
      console.warn('Failed to load screenshots from IndexedDB:', e);
    }
  }, [playerData, lectureId]);

  useEffect(() => {
    loadScreenshots();
  }, [loadScreenshots]);

  // ── Screen capture (exact YouTube frame) ──
  const captureFrame = async () => {
    try {
      const playerContainer = document.querySelector('.aspect-video');

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' },
        preferCurrentTab: true,
      });

      const track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();
      stream.getTracks().forEach((t) => t.stop());

      const fullCanvas = document.createElement('canvas');
      fullCanvas.width = bitmap.width;
      fullCanvas.height = bitmap.height;
      const fullCtx = fullCanvas.getContext('2d');
      fullCtx.drawImage(bitmap, 0, 0);

      if (playerContainer) {
        const rect = playerContainer.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const cropX = Math.round(rect.left * dpr);
        const cropY = Math.round(rect.top * dpr);
        const cropW = Math.round(rect.width * dpr);
        const cropH = Math.round(rect.height * dpr);

        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = cropW;
        croppedCanvas.height = cropH;
        const croppedCtx = croppedCanvas.getContext('2d');
        croppedCtx.imageSmoothingEnabled = false;
        croppedCtx.drawImage(fullCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
        return croppedCanvas.toDataURL('image/png');
      }

      return fullCanvas.toDataURL('image/png');
    } catch (e) {
      console.log('Screen capture denied or unavailable:', e.message);
      // Fallback: try direct <video> (non-YouTube)
      const videoElement = document.querySelector('video');
      if (videoElement && videoElement.readyState >= 2) {
        try {
          await new Promise((r) => requestAnimationFrame(r));
          const w = videoElement.videoWidth || 1920;
          const h = videoElement.videoHeight || 1080;
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(videoElement, 0, 0, w, h);
          return canvas.toDataURL('image/png');
        } catch (_) {}
      }
      return '';
    }
  };

  // ── Take snapshot → IndexedDB ──
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
      console.error('IndexedDB save error:', err);
      toast.error('Failed to save screenshot locally.');
    } finally {
      setIsCapturing(false);
    }
  };

  // ── Delete snapshot from IndexedDB ──
  const handleDeleteSnapshot = async (id) => {
    try {
      await dbDelete(id);
      toast.info('Screenshot deleted.');
      await loadScreenshots();
    } catch (e) {
      setSnapshots(snapshots.filter((s) => s.id !== id));
    }
  };

  // ── Client-side PDF with jsPDF ──
  const exportToPDF = async () => {
    if (snapshots.length === 0) {
      toast.info('No screenshots to export.');
      return;
    }

    toast.info('Generating PDF...');

    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const usableW = pageW - margin * 2;

      // Title page header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 41, 59);
      pdf.text(courseData?.courseTitle || 'Lecture Screenshots', margin, 25);

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139);
      pdf.text(`${playerData?.lectureTitle || 'Lecture'} • ${snapshots.length} screenshots`, margin, 33);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, 39);

      pdf.setDrawColor(203, 213, 225);
      pdf.line(margin, 43, pageW - margin, 43);

      // Each screenshot gets its own page (except the first shares with header)
      for (let i = 0; i < snapshots.length; i++) {
        const snap = snapshots[i];

        if (i > 0) pdf.addPage();

        const startY = i === 0 ? 50 : 15;

        // Screenshot label
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(37, 99, 235);
        pdf.text(`Screenshot #${i + 1}`, margin, startY);

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(148, 163, 184);
        const timeStr = snap.timestamp || new Date(snap.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        pdf.text(`@ ${timeStr}`, margin + 35, startY);

        // Load image and draw preserving aspect ratio
        const imgY = startY + 5;
        const maxH = pageH - imgY - 20;

        try {
          const img = new Image();
          img.src = snap.imageDataUrl;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });

          const aspectRatio = img.naturalWidth / img.naturalHeight;
          let drawW = usableW;
          let drawH = drawW / aspectRatio;
          if (drawH > maxH) {
            drawH = maxH;
            drawW = drawH * aspectRatio;
          }

          const offsetX = margin + (usableW - drawW) / 2;
          pdf.addImage(snap.imageDataUrl, 'PNG', offsetX, imgY, drawW, drawH);
        } catch (imgErr) {
          pdf.setTextColor(239, 68, 68);
          pdf.text('Failed to load image', margin, imgY + 10);
        }
      }

      // Page numbers
      const totalPages = pdf.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(148, 163, 184);
        pdf.text(`Page ${p} of ${totalPages} • LMS Lecture Notes`, pageW / 2, pageH - 8, { align: 'center' });
      }

      pdf.save(`${playerData?.lectureTitle || 'lecture'}_screenshots.pdf`);
      toast.success('PDF downloaded!');
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF.');
    }
  };

  const handleSwitchLecture = (newIndex) => {
    if (newIndex >= 0 && newIndex < allLectures.length) {
      const target = allLectures[newIndex];
      setCurrentLectureIndex(newIndex);
      setPlayerData(target);
      navigate(`/full-player/${courseId}/${target.lectureId || target._id}`, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* ─── Top Header Bar with Snap Button ─── */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/player/${courseId}`)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-all cursor-pointer border border-slate-700"
          >
            ← Back
          </button>
          {courseData && (
            <h1 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md hidden sm:block">
              {courseData.courseTitle}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {/* 📷 SNAP BUTTON — fixed at top */}
          <button
            disabled={isCapturing}
            onClick={handleTakeSnapshot}
            className="disabled:opacity-50 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-500/20 flex items-center gap-1.5 border border-blue-500/30"
          >
            <span className="text-sm">📷</span>
            <span>{isCapturing ? 'Capturing...' : 'Snap'}</span>
          </button>

          {snapshots.length > 0 && (
            <button
              onClick={exportToPDF}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md border border-emerald-500/30"
            >
              <span>📄</span>
              <span>PDF ({snapshots.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {playerData ? (
          <div className="space-y-5">
            {/* Video Player */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 sm:p-3 shadow-2xl overflow-hidden">
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-black shadow-inner">
                <YouTube
                  videoId={playerData.lectureUrl ? playerData.lectureUrl.split('/').pop() : ''}
                  iframeClassName="w-full h-full aspect-video"
                  onReady={(e) => (youtubePlayerRef.current = e.target)}
                />
              </div>

              {/* Lecture Title & Navigation */}
              <div className="p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-800/80 mt-2">
                <div>
                  <span className="text-[11px] font-bold text-blue-400 bg-blue-950/80 border border-blue-800/50 px-2 py-0.5 rounded">
                    Chapter {playerData.chapter || 1} • Lecture {playerData.lecture || 1}
                  </span>
                  <h2 className="text-lg font-extrabold text-white mt-1">{playerData.lectureTitle}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentLectureIndex <= 0}
                    onClick={() => handleSwitchLecture(currentLectureIndex - 1)}
                    className="disabled:opacity-40 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 transition-all cursor-pointer"
                  >
                    ← Prev
                  </button>
                  <button
                    disabled={currentLectureIndex >= allLectures.length - 1}
                    onClick={() => handleSwitchLecture(currentLectureIndex + 1)}
                    className="disabled:opacity-40 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 transition-all cursor-pointer"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>

            {/* Screenshot Gallery */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-white">Screenshots ({snapshots.length})</h3>
                  <p className="text-xs text-slate-400">Stored locally in your browser • No upload needed</p>
                </div>
                {snapshots.length > 0 && (
                  <button
                    onClick={exportToPDF}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>📄</span>
                    <span>Download PDF</span>
                  </button>
                )}
              </div>

              {snapshots.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {snapshots.map((snap, i) => (
                    <div
                      key={snap.id || i}
                      className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col group hover:border-slate-700 transition-all"
                    >
                      {snap.imageDataUrl && (
                        <div
                          className="relative aspect-video bg-black overflow-hidden cursor-pointer"
                          onClick={() => setPreviewImage(snap.imageDataUrl)}
                        >
                          <img
                            src={snap.imageDataUrl}
                            alt="Captured frame"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-blue-600 font-mono text-white font-bold px-2 py-0.5 rounded shadow">
                            #{i + 1}
                          </span>
                        </div>
                      )}
                      <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                        <p className="text-xs font-bold text-slate-300 truncate">{snap.lectureTitle || playerData.lectureTitle}</p>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[10px] text-slate-500">
                          <span>⏱️ {snap.timestamp || '--:--'}</span>
                          <button
                            onClick={() => handleDeleteSnapshot(snap.id)}
                            className="text-slate-400 hover:text-red-400 cursor-pointer text-xs font-semibold"
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
                <div className="text-center py-8 bg-slate-950/60 rounded-xl border border-dashed border-slate-800 text-xs text-slate-400 space-y-1">
                  <span className="text-2xl block">📷</span>
                  <p className="font-semibold text-slate-300">No screenshots yet</p>
                  <p>
                    Click the <strong>"Snap"</strong> button in the top bar to capture the current video frame.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 font-medium text-sm">Loading lecture video...</div>
        )}
      </div>

      {/* Lightbox Preview */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
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

      {/* AI Tutor */}
      <AiTutorDrawer courseId={courseId} activeLecture={playerData} backendUrl={backendUrl} />
    </div>
  );
};

export default FullScreenPlayer;
