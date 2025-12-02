import React, { useState, useRef, useEffect } from 'react';

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
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
);
const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
);
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);
const MinusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
);

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [containerWidth, setContainerWidth] = useState(0);
  const [threshold, setThreshold] = useState(0.35);
  const [useSam, setUseSam] = useState(true);

  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [brushMode, setBrushMode] = useState('add'); // 'add' or 'subtract'
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        console.log('Container width:', width);
        setContainerWidth(width);
      }
    };

    // Update on mount and when result changes
    updateContainerWidth();

    // Add resize listener
    window.addEventListener('resize', updateContainerWidth);

    // Small delay to ensure container is rendered
    const timer = setTimeout(updateContainerWidth, 100);

    return () => {
      window.removeEventListener('resize', updateContainerWidth);
      clearTimeout(timer);
    };
  }, [result]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleSegment = async () => {
    if (!selectedImage || !prompt) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('prompt', prompt);
    formData.append('threshold', threshold);
    formData.append('use_sam', useSam);
    formData.append('visualization', 'all');

    try {
      const response = await fetch('http://localhost:8000/segment', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log('API Response:', data);
      console.log('Response status:', response.status);
      console.log('Response OK:', response.ok);

      if (data.success) {
        console.log('Setting result:', data);
        console.log('Has overlay?', !!data.visualizations?.overlay);
        console.log('Preview URL exists?', !!previewUrl);
        setResult(data);
        // Reset slider to middle position
        setSliderPosition(50);
      } else {
        console.error('API returned success=false:', data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      setSliderPosition((x / rect.width) * 100);
    }
  };

  const handleTouchMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
      setSliderPosition((x / rect.width) * 100);
    }
  };

  // Initialize Canvas when entering edit mode
  useEffect(() => {
    if (isEditing && canvasRef.current && result?.visualizations?.mask && containerRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Set canvas size to match displayed image
      canvas.width = containerRef.current.offsetWidth;
      canvas.height = containerRef.current.offsetHeight;

      const img = new Image();
      img.onload = () => {
        // Draw the mask
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Apply color to the white parts of the mask
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = 'rgba(139, 92, 246, 0.5)'; // Violet-500 with 50% opacity
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Reset composite operation
        ctx.globalCompositeOperation = 'source-over';
      };
      img.src = result.visualizations.mask;
    }
  }, [isEditing, result]);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath(); // Reset path
  };

  const draw = (e) => {
    if (!isDrawing && e.type !== 'mousedown') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    // Handle both mouse and touch events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (brushMode === 'add') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
    } else {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleSaveMask = () => {
    if (!canvasRef.current) return;

    // Get the modified mask as base64
    const newOverlay = canvasRef.current.toDataURL('image/png');

    // Update the result state
    setResult(prev => ({
      ...prev,
      visualizations: {
        ...prev.visualizations,
        overlay: newOverlay,
        // We update transparent too for the download button
        transparent: newOverlay // Note: This is a simplification, ideally we'd re-mask the original
      }
    }));

    setIsEditing(false);
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

  const handleDownload = () => {
    if (!result?.visualizations?.overlay) return;

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = result.visualizations.overlay;
    link.download = `segmented_${prompt}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="text-slate-800">
              <BrainIcon />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">CLIPSeg AI</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">Modern Workspace</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Upload Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Upload Image</h2>
              <div className="relative group">
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 transition-colors hover:border-violet-400 bg-[#FDFBF7]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center text-center">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-64 rounded-md object-contain shadow-sm"
                      />
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 text-slate-400">
                          <UploadIcon />
                        </div>
                        <p className="text-sm text-slate-600 font-medium">Drop image here</p>
                        <p className="text-xs text-slate-400 mt-1">or Browse</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Describe Target Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Describe Target</h2>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {['Person', 'Car', 'Sky'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setPrompt(tag)}
                      className="px-3 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter target to segment..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all text-sm"
                />

                <div className="mt-4 pt-4 border-t border-slate-50">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-medium text-slate-600">Sensitivity Threshold</label>
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{threshold}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={threshold}
                    onChange={(e) => setThreshold(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-slate-400">Loose (More)</span>
                    <span className="text-[10px] text-slate-400">Strict (Less)</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block">High Precision Mode</label>
                    <span className="text-[10px] text-slate-400">Use SAM for sharper edges (Slower)</span>
                  </div>
                  <button
                    onClick={() => setUseSam(!useSam)}
                    className={`w-10 h-6 rounded-full transition-colors relative ${useSam ? 'bg-violet-600' : 'bg-slate-200'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${useSam ? 'left-5' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleSegment}
              disabled={loading || !selectedImage || !prompt}
              className={`w-full py-3.5 px-4 rounded-lg text-white font-medium text-sm shadow-md transition-all
                ${loading || !selectedImage || !prompt
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]'
                }`}
            >
              {loading ? 'Processing...' : 'Generate Segmentation'}
            </button>
          </div>

          {/* Right Column - Results */}
          <div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Results</h2>

              <div className="flex-1 min-h-[400px] bg-[#FDFBF7] rounded-lg border border-slate-100 overflow-hidden relative flex items-center justify-center">
                {result && previewUrl ? (
                  isEditing ? (
                    <div className="relative w-full h-full" ref={containerRef}>
                      {/* Background Image */}
                      <img
                        src={previewUrl}
                        alt="Original"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                      />
                      {/* Canvas Layer */}
                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full object-contain cursor-crosshair touch-none"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                      />
                      {/* Toolbar */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-xl p-2 flex items-center gap-2 border border-slate-100 z-20">
                        <button
                          onClick={() => setBrushMode('add')}
                          className={`p-2 rounded-full transition-colors ${brushMode === 'add' ? 'bg-violet-100 text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
                          title="Add to mask"
                        >
                          <PlusIcon />
                        </button>
                        <button
                          onClick={() => setBrushMode('subtract')}
                          className={`p-2 rounded-full transition-colors ${brushMode === 'subtract' ? 'bg-red-100 text-red-600' : 'text-slate-400 hover:text-slate-600'}`}
                          title="Remove from mask"
                        >
                          <MinusIcon />
                        </button>
                        <div className="w-px h-6 bg-slate-200 mx-1" />
                        <input
                          type="range"
                          min="5"
                          max="50"
                          value={brushSize}
                          onChange={(e) => setBrushSize(parseInt(e.target.value))}
                          className="w-24 mx-2 accent-violet-600"
                        />
                        <div className="w-px h-6 bg-slate-200 mx-1" />
                        <button
                          onClick={handleSaveMask}
                          className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                          title="Save changes"
                        >
                          <SaveIcon />
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                          title="Cancel"
                        >
                          <XIcon />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      ref={containerRef}
                      className="relative w-full h-full cursor-col-resize select-none"
                      onMouseMove={handleMouseMove}
                      onTouchMove={handleTouchMove}
                    >
                      {/* Background Image (Original) */}
                      <img
                        src={previewUrl}
                        alt="Original"
                        className="absolute inset-0 w-full h-full object-contain"
                      />

                      {/* Foreground Image (Segmented) - Clipped */}
                      <div
                        className="absolute inset-0 overflow-hidden"
                        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                      >
                        <img
                          src={result.visualizations.overlay}
                          alt="Segmented"
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      </div>

                      {/* Slider Handle */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize shadow-xl z-10 flex items-center justify-center pointer-events-none"
                        style={{ left: `${sliderPosition}%` }}
                      >
                        <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center -ml-3.5 text-slate-600 pointer-events-auto">
                          <div className="flex gap-0.5">
                            <ChevronLeftIcon />
                            <ChevronRightIcon />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-center p-10">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <BrainIcon />
                    </div>
                    <p className="text-slate-400 text-sm">Results will appear here</p>
                  </div>
                )}
              </div>

              {result && (
                <div className="mt-4 flex justify-end gap-2">
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      <EditIcon />
                      Edit Mask
                    </button>
                  )}
                  <button
                    onClick={handleRemoveBackground}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
                    title="Download with background removed"
                  >
                    <EraserIcon />
                    Remove BG
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors shadow-sm"
                  >
                    <DownloadIcon />
                    Download Overlay
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="mt-12 bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">About</h3>
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            This application uses CLIPSeg for zero-shot image segmentation with text prompts. Enter any object or concept, and the AI will highlight it in your image.
          </p>
          <p className="text-xs text-slate-400">
            Paper: <a href="https://arxiv.org/abs/2112.10003" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">Image Segmentation Using Text and Image Prompts (CVPR 2022)</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
