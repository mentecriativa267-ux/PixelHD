import React, { useState, useRef, useEffect } from 'react';
import { Download, Eraser, RotateCcw, Palette, Sparkles, ImagePlus } from 'lucide-react';

const PRESETS = [
  { id: 'transparent', label: 'Transparente', value: null },
  { id: 'white', label: 'Branco', value: '#ffffff' },
  { id: 'dark', label: 'Dark', value: '#0f172a' },
  { id: 'grad1', label: 'Indigo', value: 'linear-gradient(135deg,#4f46e5,#9333ea)' },
  { id: 'grad2', label: 'Sunset', value: 'linear-gradient(135deg,#f97316,#db2777)' },
];

export default function MagicEditor({ imageUrl }) {
  const canvasRef = useRef(null);
  const bgRef = useRef(null);
  const [selectedBg, setSelectedBg] = useState(PRESETS);
  const [customBg, setCustomBg] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [brush, setBrush] = useState(24);
  const [drawing, setDrawing] = useState(false);

  const loadImg = () => {
    const c = canvasRef.current;
    if (!c || !imageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { c.width = img.naturalWidth; c.height = img.naturalHeight; c.getContext('2d').drawImage(img, 0, 0); };
    img.src = imageUrl;
  };
  useEffect(() => { loadImg(); }, [imageUrl]);

  const erase = (e) => {
    if (!drawing) return;
    const c = canvasRef.current, r = c.getBoundingClientRect(), ctx = c.getContext('2d');
    const cx = e.touches ? e.touches.clientX : e.clientX, cy = e.touches ? e.touches.clientY : e.clientY;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(((cx - r.left) / r.width) * c.width, ((cy - r.top) / r.height) * c.height, (brush / 400) * c.width, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  };

  const downloadHD = () => {
    const fg = canvasRef.current, out = document.createElement('canvas');
    out.width = fg.width; out.height = fg.height;
    const ctx = out.getContext('2d');
    const save = () => { ctx.drawImage(fg, 0, 0); const a = document.createElement('a'); a.download = 'PixelHD.png'; a.href = out.toDataURL('image/png', 1.0); a.click(); };
    if (customBg) { const bg = new Image(); bg.crossOrigin = 'anonymous'; bg.onload = () => { ctx.drawImage(bg, 0, 0, out.width, out.height); save(); }; bg.src = customBg; }
    else if (selectedBg.value) { ctx.fillStyle = selectedBg.value.startsWith('linear') ? '#4f46e5' : selectedBg.value; ctx.fillRect(0, 0, out.width, out.height); save(); }
    else save();
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border text-xs">
        <div className="flex items-center gap-2"><Eraser className="w-4 h-4 text-indigo-600" /><span>Apagador:</span><input type="range" min="8" max="60" value={brush} onChange={e => setBrush(+e.target.value)} className="w-20" /></div>
        <button onClick={loadImg} className="flex items-center gap-1 px-2 py-1 bg-white border rounded"><RotateCcw className="w-3 h-3" />Resetar</button>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <Palette className="w-4 h-4 text-slate-500" />
        {PRESETS.map(b => <button key={b.id} onClick={() => { setSelectedBg(b); setCustomBg(null); }} style={{ background: b.value || '#fff' }} className={`px-2 py-1 rounded border ${selectedBg.id === b.id && !customBg ? 'ring-2 ring-indigo-600' : ''} ${b.id === 'dark' || b.id.startsWith('grad') ? 'text-white' : ''}`}>{b.label}</button>)}
        <button onClick={() => bgRef.current?.click()} className="flex items-center gap-1 px-2 py-1 rounded border border-dashed"><ImagePlus className="w-3 h-3" />Foto</button>
        <input ref={bgRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files && setCustomBg(URL.createObjectURL(e.target.files))} />
      </div>
      <div className="flex gap-2">
        <input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Gerar fundo com IA (ex: escritorio moderno)..." className="flex-1 text-xs px-3 py-2 rounded-xl border" />
        <button onClick={() => prompt.trim() && setCustomBg(`https://pollinations.ai{encodeURIComponent(prompt)}?width=1280&height=1280&nologo=true`)} className="bg-indigo-600 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" />Gerar</button>
      </div>
      <div style={{ background: customBg ? `url(${customBg}) center/cover` : (selectedBg.value || undefined) }} className={`rounded-2xl overflow-hidden border flex justify-center max-h-72 ${!customBg && !selectedBg.value ? 'checkerboard' : ''}`}>
        <canvas ref={canvasRef} onMouseDown={() => setDrawing(true)} onMouseUp={() => setDrawing(false)} onMouseLeave={() => setDrawing(false)} onMouseMove={erase} onTouchStart={() => setDrawing(true)} onTouchEnd={() => setDrawing(false)} onTouchMove={erase} className="max-h-72 w-auto object-contain cursor-crosshair" />
      </div>
      <button onClick={downloadHD} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2"><Download className="w-4 h-4" />Baixar em HD (Grátis)</button>
    </div>
  );
}
