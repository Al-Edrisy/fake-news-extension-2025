import { FactCheckResult } from '@/types';

const API_URL = 'http://localhost:5000/api/claims/verify';

export const verifyClaim = async (claim: string): Promise<FactCheckResult> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ claim })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as FactCheckResult;
  } catch (error) {
    console.error('Verification failed:', error);
    throw new Error('Failed to verify claim. Please try again later.');
  }
};