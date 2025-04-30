import { collection, doc, setDoc, getDoc, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface FlashcardDeck {
  id?: string;
  title: string;
  description?: string;
  userId: string;
  cards: {
    question: string;
    answer: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserProfile {
  id?: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const dbService = {
  // Create a new user profile
  createUserProfile: async (userId: string, userData: UserProfile) => {
    return setDoc(doc(db, 'users', userId), {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  },
  
  // Get user profile
  getUserProfile: async (userId: string) => {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  },
  
  // Create a new flashcard deck
  createFlashcardDeck: async (deckData: FlashcardDeck) => {
    const decksRef = collection(db, 'flashcardDecks');
    return addDoc(decksRef, {
      ...deckData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  },
  
  // Get user's flashcard decks
  getUserDecks: async (userId: string) => {
    const decksRef = collection(db, 'flashcardDecks');
    const q = query(decksRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },
  
  // Get a specific flashcard deck
  getDeck: async (deckId: string) => {
    const docRef = doc(db, 'flashcardDecks', deckId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }
}; 