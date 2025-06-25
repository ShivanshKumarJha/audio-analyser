'use client';
import React from 'react';
import styles from '../styles/Home.module.css';

interface Props {
  url: string;
}

const AudioPlayer: React.FC<Props> = ({ url }) => {
  return (
    <div className={styles.audioPlayer}>
      <audio controls src={url} />
    </div>
  );
};

export default AudioPlayer;
