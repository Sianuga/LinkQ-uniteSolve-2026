import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Upload, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type VerifyStage = 'idle' | 'uploading' | 'verifying' | 'done';

export default function Step1_Verify() {
  const navigate = useNavigate();

  const goNext = () => navigate('/onboarding/modules');

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<VerifyStage>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>('');

  const isImage = useMemo(() => (file ? file.type.startsWith('image/') : false), [file]);
  const isPdf = useMemo(() => (file ? file.type === 'application/pdf' : false), [file]);

  const previewUrl = useMemo(() => {
    if (!file || !isImage) return '';
    return URL.createObjectURL(file);
  }, [file, isImage]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function startFakeVerify(selected: File) {
    setError('');
    setFile(selected);
    setStage('uploading');
    setProgress(8);

    // Fake flow: upload → verify → success
    window.setTimeout(() => {
      setStage('verifying');
      setProgress(45);
    }, 550);

    window.setTimeout(() => {
      setProgress(78);
    }, 1200);

    window.setTimeout(() => {
      setStage('done');
      setProgress(100);
    }, 1800);

    window.setTimeout(() => {
      goNext();
    }, 2200);
  }

  function onPickFile(f: File | null | undefined) {
    if (!f) return;
    const ok =
      f.type.startsWith('image/') ||
      f.type === 'application/pdf' ||
      // Some browsers may not set MIME type for camera captures.
      /\.(png|jpe?g|webp|heic|heif|pdf)$/i.test(f.name);

    if (!ok) {
      setError('Please upload an image or PDF.');
      return;
    }

    startFakeVerify(f);
  }

  const isBusy = stage !== 'idle';

  return (
    <div className="flex flex-col items-center gap-6 h-full">
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-highlight mb-2"
        >
          <Camera className="w-7 h-7 text-primary" />
        </motion.div>
        <h1 className="text-2xl font-bold text-text-primary">
          Verify Your Student ID
        </h1>
        <p className="text-sm text-text-secondary max-w-xs">
          Upload or capture your Student ID to verify your student status and unlock all features.
        </p>
      </div>

      {/* Camera frame */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-xs aspect-[4/3] relative"
      >
        <div className="absolute inset-0 border-2 border-dashed border-secondary/50 rounded-[var(--radius-lg)] flex items-center justify-center bg-highlight/30 overflow-hidden">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-primary rounded-tl-[var(--radius-md)]" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-primary rounded-tr-[var(--radius-md)]" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-primary rounded-bl-[var(--radius-md)]" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-primary rounded-br-[var(--radius-md)]" />

          {/* Preview */}
          {file && isImage ? (
            <img
              src={previewUrl}
              alt="Student ID preview"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}

          {/* Scan line animation (only when idle) */}
          {!file && !isBusy ? (
            <motion.div
              className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-secondary to-transparent"
              animate={{ y: [-60, 60] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            />
          ) : null}

          {/* Overlay text */}
          {!isBusy ? (
            <div className="relative z-10 text-center space-y-2 px-6">
              <Camera className="w-10 h-10 text-text-secondary/40 mx-auto" />
              <p className="text-xs text-text-secondary">
                {file
                  ? (isPdf ? 'PDF selected — ready to verify' : 'Image selected — ready to verify')
                  : 'Capture or upload your student ID'}
              </p>
            </div>
          ) : null}

          {/* Verification progress overlay */}
          {isBusy ? (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center px-6">
              <div className="w-full max-w-[18rem] space-y-2">
                <p className="text-sm font-semibold text-text-primary">
                  {stage === 'uploading' ? 'Sending to backend…' : stage === 'verifying' ? 'Verifying…' : 'Verified'}
                </p>
                <div className="h-2 w-full rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-text-secondary">
                  {stage === 'done' ? 'Continuing…' : 'This is a demo verification step.'}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="w-full max-w-xs space-y-3"
      >
        {/* Hidden inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => onPickFile(e.currentTarget.files?.[0])}
        />
        <input
          ref={uploadInputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => onPickFile(e.currentTarget.files?.[0])}
        />

        <Button
          size="lg"
          className="w-full"
          disabled={isBusy}
          onClick={() => cameraInputRef.current?.click()}
        >
          <Camera className="w-4 h-4" />
          {isBusy ? 'Processing…' : 'Take a photo'}
        </Button>

        <button
          onClick={() => uploadInputRef.current?.click()}
          disabled={isBusy}
          className="w-full flex items-center justify-center gap-2 py-2.5 min-h-[44px] text-sm font-medium text-secondary hover:text-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4" />
          Upload image or PDF
        </button>

        {error ? (
          <p className="text-xs text-red-600 text-center">{error}</p>
        ) : null}
      </motion.div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Skip for demo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="pb-4"
      >
        <button
          onClick={goNext}
          className="flex items-center gap-1.5 min-h-[44px] text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer group"
        >
          Skip for demo
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </motion.div>
    </div>
  );
}
