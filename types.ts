
export type UserRole = 'ADMIN' | 'EDITOR' | 'PHOTOGRAPHER' | 'GUEST';
export type ChallengePhase = 'upload' | 'voting' | 'results';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  isApproved: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  uploadDeadline: number;
  votingDeadline: number;
  creatorId: string;
  maxPhotosPerUser: number; // New field for dynamic photo limits
}

export interface Photo {
  id: string;
  challengeId: string;
  userId: string;
  url: string;
  title: string;
  author: string;
  ratings: number[];
  createdAt: number;
  aiFeedback?: string;
}

export type SortOption = 'newest' | 'rating' | 'oldest';

export interface AppState {
  photos: Photo[];
  challenges: Challenge[];
  users: User[];
  currentUser: User | null;
  activeChallengeId: string | null;
  votedPhotoIds: string[]; // Track local votes to prevent double voting
}
