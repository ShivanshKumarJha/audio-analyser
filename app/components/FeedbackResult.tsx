'use client';
import React from 'react';
import styles from '../styles/Home.module.css';

interface Props {
  data: {
    scores: Record<string, number>;
    overallFeedback: string;
    observation: string;
  };
}

const FeedbackResult: React.FC<Props> = ({ data }) => {
  return (
    <div className={styles.resultBox}>
      <h2>Scores</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data.scores).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Overall Feedback</h3>
      <p>{data.overallFeedback}</p>
      <h3>Observation</h3>
      <p>{data.observation}</p>
    </div>
  );
};

export default FeedbackResult;
