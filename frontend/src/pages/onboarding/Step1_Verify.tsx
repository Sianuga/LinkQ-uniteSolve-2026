import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Upload, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Step1_Verify() {
  const navigate = useNavigate();

  const goNext = () => navigate('/onboarding/avatar');

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
          Scan your European Student Identifier to verify your student status and unlock all features.
        </p>
      </div>

      {/* Camera frame */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-xs aspect-[4/3] relative"
      >
        {/* Dashed frame */}
        <div className="absolute inset-0 border-2 border-dashed border-secondary/50 rounded-[var(--radius-lg)] flex items-center justify-center bg-highlight/30">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-primary rounded-tl-[var(--radius-md)]" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-primary rounded-tr-[var(--radius-md)]" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-primary rounded-bl-[var(--radius-md)]" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-primary rounded-br-[var(--radius-md)]" />

          {/* Scan line animation */}
          <motion.div
            className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-secondary to-transparent"
            animate={{ y: [-60, 60] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          />

          <div className="text-center space-y-2 px-6">
            <Camera className="w-10 h-10 text-text-secondary/40 mx-auto" />
            <p className="text-xs text-text-secondary">
              Position your student ID within the frame
            </p>
          </div>
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="w-full max-w-xs space-y-3"
      >
        <Button
          size="lg"
          className="w-full"
          onClick={goNext}
        >
          <Camera className="w-4 h-4" />
          Scan Student ID
        </Button>

        <button
          onClick={goNext}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-secondary hover:text-primary transition-colors cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          Upload a photo instead
        </button>
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
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer group"
        >
          Skip for demo
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </motion.div>
    </div>
  );
}
