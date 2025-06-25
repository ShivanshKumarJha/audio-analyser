'use client';
import React, { ChangeEvent } from 'react';
import styles from '../styles/Home.module.css';

interface Props {
  onUpload: (file: File) => void;
}

const FileUpload: React.FC<Props> = ({ onUpload }) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className={styles.uploadBox}>
      <input type="file" accept=".mp3,.wav" onChange={handleChange} />
    </div>
  );
};

export default FileUpload;
