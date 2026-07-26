import { jsPDF } from 'jspdf';
import { toast } from 'react-toastify';

// ── IndexedDB Configuration ──
const DB_NAME = 'lms_screenshots_db';
const DB_VERSION = 1;
const STORE_NAME = 'screenshots';

export const openDB = () =>
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

export const dbGetByLecture = async (lectureId) => {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const idx = tx.objectStore(STORE_NAME).index('lectureId');
    const req = idx.getAll(lectureId);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => resolve([]);
  });
};

export const dbAdd = async (record) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).add(record);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

export const dbDelete = async (id) => {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
  });
};

// ── Screen Frame Capture Operation ──
export const captureFrame = async () => {
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

// ── Client-side PDF Generation Operation ──
export const generatePdfFromSnapshots = async (snapshots, courseTitle, lectureTitle) => {
  if (!snapshots || snapshots.length === 0) {
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

    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text(courseTitle || 'Lecture Screenshots', margin, 25);

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text(`${lectureTitle || 'Lecture'} • ${snapshots.length} screenshots`, margin, 33);
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, 39);

    pdf.setDrawColor(203, 213, 225);
    pdf.line(margin, 43, pageW - margin, 43);

    for (let i = 0; i < snapshots.length; i++) {
      const snap = snapshots[i];
      if (i > 0) pdf.addPage();

      const startY = i === 0 ? 50 : 15;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(37, 99, 235);
      pdf.text(`Screenshot #${i + 1}`, margin, startY);

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(148, 163, 184);
      const timeStr = snap.timestamp || new Date(snap.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      pdf.text(`@ ${timeStr}`, margin + 35, startY);

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

    const totalPages = pdf.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      pdf.setPage(p);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(148, 163, 184);
      pdf.text(`Page ${p} of ${totalPages} • LMS Lecture Notes`, pageW / 2, pageH - 8, { align: 'center' });
    }

    pdf.save(`${lectureTitle || 'lecture'}_screenshots.pdf`);
    toast.success('PDF downloaded!');
  } catch (err) {
    console.error('PDF generation error:', err);
    toast.error('Failed to generate PDF.');
  }
};
