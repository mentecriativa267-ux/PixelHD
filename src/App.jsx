import React, { useState, useRef } from 'react';
import { removeBackground } from '@imgly/background-removal';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import MagicEditor from './components/tools/MagicEditor';
import { Upload, Layers, Sparkles, Eraser, Image as ImageIcon, LayoutTemplate, Code2, Loader2, Check } from 'lucide-react';

export default function App() {
  const [tab, setTab] = useState('remove');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [resultUrl, setResultUrl] = useState(null);
  const inputRef = useRef(null);

  const handleSingle = async (file) => {
    if (!file) return;
    setLoading(true); setResultUrl(null);
    try {
      if (tab === 'optimize') {
        setStatus('Otimizando em WebP HD...');
        const comp = await imageCompression(file, { maxSizeMB: 1, useWebWorker: true, fileType: 'image/webp' });
        setResultUrl(URL.createObjectURL(comp));
      } else {
        setStatus('Removendo fundo em HD (100% no navegador)...');
        const blob = await removeBackground(file, { output: { format: 'image/png', quality: 1.0 } });
        setResultUrl(URL.createObjectURL(blob));
      }
    } catch (e) { alert('Erro: ' + e.message); }
    finally { setLoading(false); setStatus(''); }
  };

  const handleBatch = async (files) => {
    if (!files.length) return;
    setLoading(true);
    const zip = new JSZip();
    try {
      for (let i = 0; i < files.length; i++) {
        setStatus(`Processando lote (${i + 1}/${files.length}) em HD...`);
        const blob = await removeBackground(files[i], { output: { format: 'image/png', quality: 1.0 } });
        zip.file(`PixelHD_${files[i].name.replace(/\.[^/.]+$/, '')}.png`, blob);
      }
      const z = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(z); a.download = 'PixelHD_Lote.zip'; a.click();
    } catch (e) { alert('Erro no lote: ' + e.message); }
    finally { setLoading(false); setStatus(''); }
  };

  const tools = [
    { id: 'remove', label: 'Remover Fundo HD', icon: Sparkles },
    { id: 'batch', label: 'Em Lote (ZIP)', icon: Layers },
    { id: 'optimize', label: 'Otimizar WebP', icon: ImageIcon },
    { id: 'erase', label: 'Remover Distrações', icon: Eraser },
    { id: 'templates', label: 'Posts & Vídeos', icon: LayoutTemplate },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-extrabold text-xl">
            <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-lg">Pixel</span><span>HD</span>
            <span className="text-[10px] uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">100% Free HD</span>
          </div>
          <a href="https://Code2.com" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
            <Code2 className="w-4 h-4" /> Open Source
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Remova fundos e crie artes <span className="text-indigo-600">sempre em HD</span>.
            </h1>
            <p className="text-slate-600 text-sm sm:text-base mb-5">
              Sem limites de resolução, sem créditos e rodando 100% no seu navegador. Crie posts, vídeos e apresentações com IA.
            </p>
            <div className="rounded-2xl overflow-hidden shadow-md border bg-slate-900 max-w-md">
              <video preload="none" className="w-full h-auto rounded-4xl" autoPlay playsInline loop muted src="/vite/assets/canva_pro_plan-044adb7e.mp4" id="canvaProVideo" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border">
            <div className="flex flex-wrap gap-1.5 mb-4">
              {tools.map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.id} onClick={() => { setTab(t.id); setResultUrl(null); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${tab === t.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    <Icon className="w-3.5 h-3.5" /> {t.label}
                  </button>
                );
              })}
            </div>

            <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/40 rounded-2xl p-8 text-center cursor-pointer">
              <input ref={inputRef} type="file" accept="image/*" multiple={tab === 'batch'} className="hidden"
                onChange={e => tab === 'batch' ? handleBatch(Array.from(e.target.files)) : handleSingle(e.target.files[0])} />
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
              </div>
              <p className="font-bold text-sm">{loading ? status : tab === 'batch' ? 'Selecione várias fotos para Lote HD (ZIP)' : 'Faça upload de uma imagem em alta resolução'}</p>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG ou WebP • Download sempre na resolução original</p>
            </div>

            {!resultUrl && !loading && (
              <div className="mt-5 flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border">
                <div className="w-16 h-16 rounded-xl checkerboard overflow-hidden shrink-0 border">
                  <img src="https://unsplash.com" alt="Exemplo Homem 25-35 anos" className="w-full h-full object-cover" />
                </div>
                <div className="text-xs">
                  <span className="font-bold block">Teste instantâneo em HD</span>
                  <span className="text-slate-500">Retrato limpo pronto para posts, YouTube ou apresentações sem perda de pixels.</span>
                </div>
              </div>
            )}

            {resultUrl && <MagicEditor imageUrl={resultUrl} />}
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-50 h-9 bg-slate-900/95 text-white border-t border-slate-800 flex items-center justify-center px-4 text-xs">
        <div className="max-w-6xl w-full flex items-center justify-between">
          <span className="truncate text-slate-300">⚡ <strong>PixelHD Open Source:</strong> Espaço reservado para seu banner fixo (36px).</span>
          <a href="https://Code2.com" target="_blank" rel="noreferrer" className="ml-3 shrink-0 bg-indigo-500 text-white font-semibold px-2.5 py-0.5 rounded text-[11px] flex items-center gap-1">
            <Check className="w-3 h-3" /> Code2
          </a>
        </div>
      </footer>
    </div>
  );
}
