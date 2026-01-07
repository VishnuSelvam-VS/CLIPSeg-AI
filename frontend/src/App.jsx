import React, { useState, useRef, useEffect, useCallback } from 'react';

// Icons
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
);
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
);
const EraserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
    <path d="M22 21H7" />
    <path d="m5 11 9 9" />
  </svg>
);
const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" /></svg>
);
const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
);
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
);
const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);
const MinusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
);
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
);
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>
);
const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
);
const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
);
const HistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>
);

// Quick preset prompts
const QUICK_PRESETS = [
  { label: '👤 Person', value: 'person' },
  { label: '🚗 Car', value: 'car' },
  { label: '🐕 Dog', value: 'dog' },
  { label: '🐱 Cat', value: 'cat' },
  { label: '🌳 Tree', value: 'tree' },
  { label: '🏠 Building', value: 'building' },
  { label: '☁️ Sky', value: 'sky' },
  { label: '🌊 Water', value: 'water' },
  { label: '🛣️ Road', value: 'road' },
  { label: '🌸 Flower', value: 'flower' },
  { label: '✈️ Plane', value: 'airplane' },
  { label: '📱 Phone', value: 'phone' },
];

// Overlay color presets
const OVERLAY_COLORS = [
  { name: 'Magenta', value: '#ff00ff' },
  { name: 'Cyan', value: '#00ffff' },
  { name: 'Lime', value: '#00ff00' },
  { name: 'Orange', value: '#ff6600' },
  { name: 'Blue', value: '#0066ff' },
  { name: 'Red', value: '#ff0000' },
];

function App() {
  // Core State
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageInfo, setImageInfo] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [threshold, setThreshold] = useState(0.5);
  const [useSam, setUseSam] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [processingTime, setProcessingTime] = useState(null);

  // View State
  const [sliderPosition, setSliderPosition] = useState(50);
  const [activeTab, setActiveTab] = useState('view');
  const [viewMode, setViewMode] = useState('slider'); // 'slider', 'toggle', 'sidebyside'
  const [showOverlay, setShowOverlay] = useState(true);
  const [overlayColor, setOverlayColor] = useState('#ff00ff');

  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [brushMode, setBrushMode] = useState('add');
  const [brushSize, setBrushSize] = useState(20);
  const [editedMask, setEditedMask] = useState(null);

  // Studio State
  const [studioOptions, setStudioOptions] = useState({
    blur: 0,
    grayscale: false,
    bgColor: 'transparent',
    bgImage: null,
    strokeWidth: 0,
    strokeColor: '#ffffff',
    shadowBlur: 0,
    shadowColor: '#8b5cf6'
  });
  const [inpainting, setInpainting] = useState(false);

  // Generative Fill State
  const [genFillPrompt, setGenFillPrompt] = useState('');
  const [genFillStrength, setGenFillStrength] = useState(0.85);
  const [genFillLoading, setGenFillLoading] = useState(false);
  const [capabilities, setCapabilities] = useState({ sam: false, generative_fill: false });

  // Gallery State
  const [showGallery, setShowGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);

  // Fetch Gallery
  const fetchGallery = async () => {
    try {
      const res = await fetch('/gallery');
      const data = await res.json();
      setGalleryImages(data);
    } catch (e) {
      console.error("Gallery fetch failed", e);
    }
  };

  useEffect(() => {
    if (showGallery) fetchGallery();
  }, [showGallery]);

  // Fetch Capabilities
  useEffect(() => {
    fetch('/capabilities')
      .then(res => res.json())
      .then(data => setCapabilities(data))
      .catch(err => console.error("Failed to fetch capabilities:", err));
  }, []);



  // History
  const [history, setHistory] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');

  // Refs
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const studioCanvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const dropZoneRef = useRef(null);

  // Drag and Drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      processImageFile(files[0]);
    }
  }, []);

  const processImageFile = (file) => {
    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setResult(null);
    setActiveTab('view');

    // Get image dimensions
    const img = new Image();
    img.onload = () => {
      setImageInfo({
        width: img.width,
        height: img.height,
        size: (file.size / 1024).toFixed(1) + ' KB',
        name: file.name
      });
    };
    img.src = url;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Handle segmentation
  const handleSegment = async () => {
    if (!selectedImage || !prompt) return;

    setLoading(true);
    const startTime = Date.now();

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('prompt', prompt);
      formData.append('threshold', threshold);
      formData.append('use_sam', useSam);
      formData.append('visualization', 'all');

      const response = await fetch('/segment', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      const elapsed = Date.now() - startTime;
      setProcessingTime(elapsed);

      if (data.success) {
        setResult(data);
        setActiveTab('view');
        // Add to history
        setHistory(prev => [...prev.slice(-9), {
          prompt,
          confidence: data.confidence,
          time: elapsed,
          timestamp: new Date().toLocaleTimeString()
        }]);
      } else {
        console.error('Segmentation failed:', data.error);
        alert('Segmentation failed: ' + data.error);
      }
    } catch (e) {
      console.error('Error during segmentation:', e);
      alert('Error connecting to backend. Make sure the server is running.');
    }
    setLoading(false);
  };

  // Download functions
  const handleDownload = () => {
    if (!result?.visualizations?.overlay) return;
    const link = document.createElement('a');
    link.href = result.visualizations.overlay;
    link.download = `segmented_${prompt}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRemoveBackground = () => {
    if (!result?.visualizations?.transparent) return;
    const link = document.createElement('a');
    link.href = result.visualizations.transparent;
    link.download = `transparent_${prompt}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy to clipboard
  const handleCopyToClipboard = async () => {
    if (!result?.visualizations?.transparent) return;

    try {
      const response = await fetch(result.visualizations.transparent);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus(''), 2000);
    } catch (e) {
      // Fallback for browsers that don't support clipboard API
      setCopyStatus('Copy not supported');
      setTimeout(() => setCopyStatus(''), 2000);
    }
  };

  // Slider movement for comparison view
  const handleMouseMove = (e) => {
    if (!containerRef.current || viewMode !== 'slider') return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleTouchMove = (e) => {
    if (!containerRef.current || viewMode !== 'slider') return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  // Canvas drawing functions
  const startDrawing = (e) => {
    isDrawingRef.current = true;
    draw(e);
  };

  const draw = (e) => {
    if (!isDrawingRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);

    if (brushMode === 'add') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    } else {
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx.globalCompositeOperation = 'destination-out';
    }

    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const handleSaveMask = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    setEditedMask(dataUrl);
    if (result) {
      setResult({
        ...result,
        visualizations: {
          ...result.visualizations,
          mask: dataUrl
        }
      });
    }
    setActiveTab('view');
    setIsEditing(false);
  };

  // Initialize editor canvas
  useEffect(() => {
    if (activeTab === 'edit' && canvasRef.current && result?.visualizations?.mask && previewUrl) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.src = previewUrl;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        const maskImg = new Image();
        maskImg.src = result.visualizations.mask;
        maskImg.onload = () => {
          ctx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
        };
      };
    }
  }, [activeTab, result, previewUrl]);

  // Studio Effect Renderer
  useEffect(() => {
    if (activeTab === 'studio' && studioCanvasRef.current && result?.visualizations?.mask && previewUrl) {
      const canvas = studioCanvasRef.current;
      const ctx = canvas.getContext('2d');

      const img = new Image();
      const maskImg = new Image();
      const bgImg = new Image();

      img.src = previewUrl;
      maskImg.src = result.visualizations.mask;
      if (studioOptions.bgImage) {
        bgImg.src = studioOptions.bgImage;
        bgImg.crossOrigin = "Anonymous";
      }

      const promises = [
        new Promise(r => { img.onload = r; }),
        new Promise(r => { maskImg.onload = r; })
      ];
      if (studioOptions.bgImage) {
        promises.push(new Promise(r => { bgImg.onload = r; }));
      }

      Promise.all(promises).then(() => {
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.save();
        if (studioOptions.bgImage) {
          const scale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
          const x = (canvas.width / 2) - (bgImg.width / 2) * scale;
          const y = (canvas.height / 2) - (bgImg.height / 2) * scale;
          ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);
        } else if (studioOptions.bgColor !== 'transparent') {
          ctx.fillStyle = studioOptions.bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          if (studioOptions.blur > 0 || studioOptions.grayscale) {
            ctx.filter = `blur(${studioOptions.blur}px) grayscale(${studioOptions.grayscale ? 100 : 0}%)`;
          }
          ctx.drawImage(img, 0, 0);
          ctx.filter = 'none';
        }
        ctx.restore();

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        tempCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
        tempCtx.globalCompositeOperation = 'source-in';
        tempCtx.drawImage(img, 0, 0);

        ctx.save();
        if (studioOptions.shadowBlur > 0) {
          ctx.shadowBlur = studioOptions.shadowBlur;
          ctx.shadowColor = studioOptions.shadowColor;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.drawImage(tempCanvas, 0, 0);
        }
        ctx.restore();

        if (studioOptions.strokeWidth > 0) {
          ctx.save();
          const s = studioOptions.strokeWidth;
          ctx.shadowColor = studioOptions.strokeColor;
          ctx.shadowBlur = 0;
          const steps = 8;
          for (let i = 0; i < steps; i++) {
            const angle = (i / steps) * 2 * Math.PI;
            ctx.drawImage(tempCanvas, Math.cos(angle) * s, Math.sin(angle) * s);
          }
          ctx.restore();
        }

        ctx.drawImage(tempCanvas, 0, 0);
      });
    }
  }, [activeTab, result, previewUrl, studioOptions]);

  const handleDownloadStudio = () => {
    if (!studioCanvasRef.current) return;
    const link = document.createElement('a');
    link.href = studioCanvasRef.current.toDataURL('image/png');
    link.download = `studio_${prompt}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInpaint = async () => {
    if (!selectedImage || !result?.visualizations?.mask) {
      alert('Please generate a segmentation first');
      return;
    }

    setInpainting(true);
    try {
      const base64Data = result.visualizations.mask.split(',')[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const maskBlob = new Blob([bytes], { type: 'image/png' });

      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('mask', maskBlob, 'mask.png');
      formData.append('radius', '5');

      const response = await fetch('/inpaint', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        const link = document.createElement('a');
        link.href = data.image;
        link.download = `erased_${prompt}_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert('Magic Eraser complete! Check your downloads.');
      } else {
        alert('Inpainting failed: ' + (data.error || 'Unknown error'));
      }
    } catch (e) {
      console.error("Inpainting failed:", e);
      alert('Magic Eraser failed: ' + e.message);
    }
    setInpainting(false);
  };

  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setStudioOptions(prev => ({ ...prev, bgImage: url, bgColor: 'transparent' }));
    }
  };

  // Confidence bar color
  const getConfidenceColor = (conf) => {
    if (conf >= 0.7) return 'bg-green-500';
    if (conf >= 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Generative Fill Handler
  const handleGenerativeFill = async () => {
    if (!selectedImage || !result?.visualizations?.mask || !genFillPrompt) {
      alert('Please generate a segmentation first and enter a prompt for Generative Fill');
      return;
    }

    setGenFillLoading(true);
    try {
      // Convert mask to blob
      const base64Data = result.visualizations.mask.split(',')[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const maskBlob = new Blob([bytes], { type: 'image/png' });

      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('mask', maskBlob, 'mask.png');
      formData.append('prompt', genFillPrompt);
      formData.append('strength', genFillStrength);
      formData.append('steps', 20);

      const response = await fetch('/generative-fill', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        // Download the result
        const link = document.createElement('a');
        link.href = data.image;
        link.download = `genfill_${genFillPrompt.slice(0, 20)}_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert('🎨 Generative Fill complete! Check your downloads.');
      } else {
        alert('Generative Fill failed: ' + (data.error || 'Unknown error'));
      }
    } catch (e) {
      console.error("Generative Fill failed:", e);
      alert('Generative Fill failed: ' + e.message);
    }
    setGenFillLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-primary/30 overflow-x-hidden relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay"></div>
        {/* Neon Grid Lines (CSS based simple grid) */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]"></div>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto p-4 md:p-8">

        {/* Header - Minimal & Floating */}
        {/* Header - Minimal & Floating */}
        <header className="flex items-center justify-between mb-8 pl-4 pr-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative w-12 h-12 bg-[#0a0a1f] rounded-full border border-white/10 flex items-center justify-center">
                <BrainIcon />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-0.5" style={{ textShadow: '0 0 20px rgba(0,243,255,0.3)' }}>
                CLIPSeg AI
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${capabilities.device?.includes('cuda') ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500'}`}></span>
                  {capabilities.device?.includes('cuda') ? 'GPU ACTIVE' : 'CPU MODE'}
                </div>
                {capabilities.sam && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">SAM 2.1</span>
                )}
                {capabilities.generative_fill && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary">GEN FILL</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowGallery(!showGallery)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${showGallery ? 'bg-primary text-black border-primary' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
          >
            {showGallery ? '← Back to Editor' : '📂 View Gallery'}
          </button>
        </header>

        {showGallery ? (
          <div className="min-h-[600px] p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Batch Gallery</h2>
              <button onClick={fetchGallery} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-slate-400 transition-colors">↻ Refresh</button>
            </div>

            {galleryImages.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <div className="text-4xl mb-4">📂</div>
                <p>No processed images found yet.</p>
                <p className="text-xs mt-2">Run the automation script to populate this gallery.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {galleryImages.map((img, idx) => (
                  <div key={idx} className="group relative bg-[#0a0a1f] rounded-xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-xl">
                    <div className="aspect-square bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTAgMGgyMHYyMEgwVjB6IiBmaWxsPSIjMWExYTFiIi8+PHBhdGggZD0iTTAgMGwxMCAxMEgwVjB6IiBmaWxsPSIjMjIyIi8+PC9zdmc+')]">
                      <img src={img.url} alt={img.name} className="w-full h-full object-contain p-2" loading="lazy" />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a href={img.url} download className="p-2 bg-primary text-black rounded-lg hover:bg-white transition-colors" title="Download">
                        <DownloadIcon />
                      </a>
                    </div>
                    <div className="p-3 border-t border-white/5 bg-[#050511]">
                      <p className="text-xs text-slate-300 truncate" title={img.name}>{img.name}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{new Date(img.timestamp * 1000).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[600px]">

            {/* LEFT PANEL - CONTROLS */}
            <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">

              {/* Upload Card */}
              <div
                ref={dropZoneRef}
                className={`relative bg-[#0a0a1f]/60 backdrop-blur-md rounded-3xl p-6 border transition-all duration-300 group
                ${isDragging
                    ? 'border-primary shadow-[0_0_30px_rgba(0,243,255,0.2)]'
                    : 'border-white/5 hover:border-white/10'
                  }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <ImageIcon /> Upload Image
                  </h2>
                </div>

                <div className="relative aspect-[3/2] rounded-2xl border-2 border-dashed border-white/10 bg-black/20 overflow-hidden flex flex-col items-center justify-center transition-colors group-hover:border-primary/50 group-hover:bg-primary/5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />

                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="text-center p-6 space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/5">
                        <UploadIcon />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Drop Image here</p>
                        <p className="text-xs text-slate-500 mt-1">or click to browse</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls Card */}
              <div className="flex-1 bg-[#0a0a1f]/60 backdrop-blur-md rounded-3xl p-6 border border-white/5 flex flex-col gap-6">

                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <SparklesIcon /> Describe Target
                  </h2>
                </div>

                {/* Chips */}
                <div className="flex flex-wrap gap-2">
                  {QUICK_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setPrompt(preset.value)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-300
                      ${prompt === preset.value
                          ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/50 text-primary shadow-[0_0_15px_rgba(0,243,255,0.3)]'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'
                        }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Type any object..."
                    className="relative w-full bg-[#050511] text-white border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-primary/50 transition-colors placeholder:text-slate-600"
                  />
                </div>

                {/* Sensitivity */}
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-medium text-slate-400">
                    <span>Sensitivity</span>
                    <span className="text-primary">{threshold.toFixed(2)}</span>
                  </div>
                  <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.05"
                      value={threshold}
                      onChange={(e) => setThreshold(parseFloat(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-100"
                      style={{ width: `${((threshold - 0.1) / 0.8) * 100}%` }}
                    />
                  </div>
                  {/* Visual waveform placeholder if needed, or simple ticks */}
                  <div className="flex justify-between px-1">
                    {[...Array(20)].map((_, i) => (
                      <div key={i} className={`w-[1px] h-1 ${i % 5 === 0 ? 'bg-white/20 h-2' : 'bg-white/5'}`} />
                    ))}
                  </div>
                </div>

                {/* Toggle */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div>
                    <span className="text-sm font-medium text-white block">High Precision (SAM)</span>
                    <span className="text-xs text-slate-500">Refines edges utilizing SAM 2.1</span>
                  </div>
                  <button
                    onClick={() => setUseSam(!useSam)}
                    className={`w-14 h-7 rounded-full transition-all duration-300 relative ${useSam ? 'bg-primary/20 border border-primary/50' : 'bg-white/10 border border-white/10'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 shadow-lg ${useSam ? 'left-8 bg-primary shadow-[0_0_10px_rgba(0,243,255,0.5)]' : 'left-1 bg-slate-400'}`} />
                  </button>
                </div>

                <div className="mt-auto">
                  <button
                    onClick={handleSegment}
                    disabled={loading || !selectedImage || !prompt}
                    className={`relative w-full py-4 rounded-2xl font-bold text-sm tracking-wide uppercase overflow-hidden group transition-all
                  ${loading || !selectedImage || !prompt
                        ? 'bg-white/5 text-slate-600 cursor-not-allowed'
                        : 'text-white shadow-[0_0_20px_rgba(112,0,255,0.4)] hover:shadow-[0_0_30px_rgba(0,243,255,0.6)]'
                      }`}
                  >
                    {(loading || (selectedImage && prompt)) && (
                      <div className="absolute inset-0 bg-gradient-to-r from-secondary via-primary to-secondary w-[200%] animate-[shimmer_3s_infinite_linear]" style={{ transform: 'translateX(-50%)' }} />
                    )}
                    <div className={`absolute inset-[1px] ${loading ? 'bg-[#0a0a1f]' : 'bg-[#0a0a1f]/90'} rounded-2xl flex items-center justify-center transition-colors group-hover:bg-transparent`}>
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 relative z-10">
                          <SparklesIcon /> Generate Segmentation
                        </span>
                      )}
                    </div>
                  </button>
                </div>

              </div>
            </div>

            {/* RIGHT PANEL - RESULTS */}
            <div className="lg:col-span-8 h-full flex flex-col">
              <div className="relative flex-1 bg-[#0a0a1f]/60 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">

                {/* Result Header */}
                <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
                  <div className="pointer-events-auto flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white px-4 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10">Results</h3>
                  </div>

                  {result && (
                    <div className="pointer-events-auto flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10">
                      {['slider', 'toggle', 'sidebyside'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setViewMode(mode)}
                          className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${viewMode === mode ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                          title={mode}
                        >
                          {mode === 'slider' ? '↔' : mode === 'toggle' ? '👁' : '⊞'}
                        </button>
                      ))}
                      <div className="w-[1px] h-4 bg-white/20 mx-1" />
                      {['view', 'edit', 'studio'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => { setActiveTab(tab); setIsEditing(tab === 'edit'); }}
                          className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${activeTab === tab
                            ? 'bg-primary text-black shadow-[0_0_10px_rgba(0,243,255,0.4)]'
                            : 'text-slate-400 hover:text-white'
                            }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Main Canvas */}
                <div className="flex-1 relative flex items-center justify-center bg-black/40">
                  {/* Grid Pattern Background */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}></div>

                  {result && previewUrl ? (
                    <div className="relative w-full h-full max-h-full p-6 flex flex-col items-center justify-center">
                      <div className="relative shadow-2xl shadow-black/50 rounded-lg overflow-hidden border border-white/10 max-h-full max-w-full">
                        {activeTab === 'studio' ? (
                          <div className="relative">
                            <canvas ref={studioCanvasRef} className="max-w-full max-h-[70vh] object-contain" />
                          </div>
                        ) : activeTab === 'edit' ? (
                          <div className="relative max-w-full max-h-[70vh]" ref={containerRef}>
                            <img src={previewUrl} className="max-w-full max-h-[70vh] opacity-50 block" />
                            <canvas
                              ref={canvasRef}
                              onMouseDown={startDrawing}
                              onMouseMove={draw}
                              onMouseUp={stopDrawing}
                              onMouseLeave={stopDrawing}
                              className="absolute inset-0 w-full h-full cursor-crosshair"
                            />
                          </div>
                        ) : viewMode === 'sidebyside' ? (
                          <div className="flex gap-4 max-h-[70vh]">
                            <img src={previewUrl} className="max-w-full h-full object-contain rounded border border-white/5" />
                            <img src={result.visualizations.overlay} className="max-w-full h-full object-contain rounded border border-white/5" />
                          </div>
                        ) : viewMode === 'slider' ? (
                          <div ref={containerRef} className="relative max-w-full max-h-[70vh] cursor-col-resize group" onMouseMove={handleMouseMove} onTouchMove={handleTouchMove}>
                            <img src={previewUrl} className="max-w-full max-h-full block select-none" draggable="false" />
                            {/* Overlay Image Clipped */}
                            <div className="absolute inset-0 overflow-hidden select-none" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
                              <img src={result.visualizations.overlay} className="w-full h-full object-contain" draggable="false" />
                            </div>
                            {/* Slider Line */}
                            <div className="absolute inset-y-0 w-1 bg-white/50 backdrop-blur-sm z-30" style={{ left: `${sliderPosition}%` }}>
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white/10 backdrop-blur-md border border-white/50 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                                <div className="w-1 h-4 border-l border-r border-white/50 mx-auto" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img src={showOverlay ? result.visualizations.overlay : previewUrl} className="max-w-full max-h-[70vh]" />
                        )}
                      </div>

                      {/* Floating Action Bar at bottom of image area */}
                      {activeTab !== 'studio' && (
                        <div className="absolute bottom-8 z-30 flex items-center gap-4 bg-[#0a0a1f]/80 backdrop-blur-xl px-2 py-2 rounded-2xl border border-white/10 shadow-xl transform translate-y-0 opacity-100 transition-all">
                          <button onClick={handleRemoveBackground} className="flex flex-col items-center justify-center w-16 h-14 rounded-xl hover:bg-white/10 text-xs text-slate-300 gap-1 transition-colors">
                            <EraserIcon />
                            <span>Cutout</span>
                          </button>
                          <div className="w-px h-8 bg-white/10" />
                          <button onClick={handleInpaint} className="flex flex-col items-center justify-center w-16 h-14 rounded-xl hover:bg-white/10 text-xs text-slate-300 gap-1 transition-colors">
                            <SparklesIcon />
                            <span>Eraser</span>
                          </button>
                          <div className="w-px h-8 bg-white/10" />
                          <button onClick={handleDownload} className="flex flex-col items-center justify-center w-16 h-14 rounded-xl bg-primary/20 hover:bg-primary/30 text-xs text-primary font-medium gap-1 transition-colors border border-primary/20">
                            <DownloadIcon />
                            <span>Save</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center space-y-4 opacity-50">
                      <div className="w-32 h-32 rounded-full border-4 border-white/5 mx-auto flex items-center justify-center animate-[pulse_4s_infinite]">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 blur-xl" />
                      </div>
                      <p className="text-slate-500 font-mono text-sm">Waiting for input...</p>
                    </div>
                  )}
                </div>

                {/* Studio Controls Panel (if active) */}
                {activeTab === 'studio' && result && (
                  <div className="border-t border-white/10 bg-[#050511]/90 backdrop-blur-xl p-6 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                      {/* Left Column: Background & Effects */}
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Background</label>
                          <div className="flex gap-2">
                            <button onClick={() => setStudioOptions({ ...studioOptions, bgImage: null, bgColor: 'transparent' })} className="w-10 h-10 rounded border border-white/20 hover:border-primary flex items-center justify-center transition-colors">✕</button>
                            {['#000', '#fff', '#00f3ff', '#7000ff'].map(c => (
                              <button key={c} onClick={() => setStudioOptions({ ...studioOptions, bgImage: null, bgColor: c })} className="w-10 h-10 rounded border border-white/10 hover:scale-110 transition-transform" style={{ background: c }} />
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-[10px] text-slate-500"><span>Blur</span><span>{studioOptions.blur}px</span></div>
                            <input type="range" max="20" value={studioOptions.blur} onChange={e => setStudioOptions({ ...studioOptions, blur: parseInt(e.target.value) })} className="w-full h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-[10px] text-slate-500"><span>Glow</span><span>{studioOptions.shadowBlur}px</span></div>
                            <input type="range" max="50" value={studioOptions.shadowBlur} onChange={e => setStudioOptions({ ...studioOptions, shadowBlur: parseInt(e.target.value) })} className="w-full h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-secondary" />
                          </div>
                        </div>
                        <button onClick={handleDownloadStudio} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-white/20">
                          Download Art
                        </button>
                      </div>

                      {/* Right Column: Generative Fill */}
                      <div className="space-y-4 p-4 bg-gradient-to-br from-secondary/10 to-primary/10 rounded-2xl border border-white/10 relative overflow-hidden">
                        <div className="flex items-center gap-2">
                          <SparklesIcon />
                          <label className="text-sm font-bold text-white">Generative Fill</label>
                          <span className="text-[10px] px-2 py-0.5 bg-secondary/30 text-secondary rounded-full">AI</span>
                        </div>
                        <p className="text-[11px] text-slate-400">Replace the selected area with AI-generated content</p>

                        {!capabilities.generative_fill ? (
                          <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
                            <span className="text-2xl mb-2">⚠️</span>
                            <p className="text-sm font-bold text-white">Feature Unavailable</p>
                            <p className="text-[10px] text-slate-400 mt-1">Requires GPU (CUDA) & Diffusers installed on the server.</p>
                          </div>
                        ) : null}

                        <div className="flex gap-2 mb-2 overflow-x-auto pb-2 custom-scrollbar">
                          {[
                            { id: 'realistic', label: '📸 Realism', add: 'realistic, 8k, photorealistic' },
                            { id: 'cinematic', label: '🎬 Cinematic', add: 'cinematic lighting, dramatic, movie scene' },
                            { id: 'cyberpunk', label: '🌃 Cyberpunk', add: 'neon lights, cyberpunk, futuristic, glowing' },
                            { id: 'anime', label: '🎌 Anime', add: 'anime style, vibrant colors, studio ghibli' },
                            { id: 'painting', label: '🎨 Art', add: 'oil painting, artistic, brush strokes' }
                          ].map(style => (
                            <button
                              key={style.id}
                              onClick={() => setGenFillPrompt(prev => prev ? `${prev}, ${style.add}` : style.add)}
                              className="px-2 py-1 text-[10px] whitespace-nowrap bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-colors"
                            >
                              {style.label}
                            </button>
                          ))}
                        </div>

                        <input
                          type="text"
                          value={genFillPrompt}
                          onChange={(e) => setGenFillPrompt(e.target.value)}
                          placeholder="Describe what you want to see..."
                          className="w-full bg-black/40 text-white border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary/50 transition-colors placeholder:text-slate-600"
                        />

                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>Creativity</span>
                            <span>{Math.round(genFillStrength * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="1"
                            step="0.05"
                            value={genFillStrength}
                            onChange={e => setGenFillStrength(parseFloat(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-secondary"
                          />
                        </div>

                        <button
                          onClick={handleGenerativeFill}
                          disabled={genFillLoading || !genFillPrompt}
                          className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
                            ${genFillLoading || !genFillPrompt
                              ? 'bg-white/5 text-slate-600 cursor-not-allowed'
                              : 'bg-gradient-to-r from-secondary to-primary text-white hover:shadow-[0_0_20px_rgba(112,0,255,0.4)]'
                            }`}
                        >
                          {genFillLoading ? (
                            <>
                              <span className="w-2 h-2 bg-white rounded-full animate-bounce" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <SparklesIcon /> Fill with AI
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            </div>


          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-between items-center text-[10px] text-slate-600 uppercase tracking-widest font-medium">
          <p>Privacy • Terms</p>
          <p>Built with ❤️ by You</p>
        </div>

      </div>
    </div>
  );
}

export default App;
