'use client';

import React, { useState } from 'react';
import styles from './styles/Home.module.css';
import FileUpload from './components/FileUpload'
import AudioPlayer from './components/AudioPlayer';
import FeedbackResult from './components/FeedbackResult';

export default function HomePage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (file: File) => {
    setAudioFile(file);
    setAudioUrl(URL.createObjectURL(file));
    setResult(null);
  };

  const handleProcess = async () => {
    if (!audioFile) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', audioFile);

    const res = await fetch('/api/analyze-call', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>AI Feedback Analyzer</h1>
      <FileUpload onUpload={handleFileUpload} />
      {audioUrl && <AudioPlayer url={audioUrl} />}
      {audioFile && (
        <button className={styles.button} onClick={handleProcess} disabled={loading}>
          {loading ? 'Processing...' : 'Process'}
        </button>
      )}
      {result && <FeedbackResult data={result} />}
    </main>
  );
}