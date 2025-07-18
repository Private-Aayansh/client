import { Platform } from 'react-native';
import { apiClient } from './api';
import { app, auth, db as firestore } from './firebase'; // Import the initialized instances

// Import Firebase Firestore functions
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
  updateDoc,
  increment,
  writeBatch,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  FieldValue,
} from '@react-native-firebase/firestore';

// Import Firebase Auth functions
import { signInWithCustomToken } from '@react-native-firebase/auth';

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderRole: 'farmer' | 'labour';
  message: string;
  timestamp: any;
  read: boolean;
}

export interface Chat {
  id: string;
  farmerId: string;
  farmerName: string;
  labourId: string;
  labourName: string;
  jobId: number;
  jobTitle: string;
  lastMessage?: string;
  lastMessageTime?: any;
  unreadCount: { [userId: string]: number };
  createdAt: any;
}

class FirebaseChatService {
  private firebaseToken: string | null = null;
  private tokenRefreshTimeout: NodeJS.Timeout | null = null;

  async initializeAuth(): Promise<boolean> {
    try {
      if (!firestore || !auth) {
        console.error('Firestore or Auth not initialized');
        return false;
      }

      const response = await apiClient.getFirebaseToken();
      this.firebaseToken = response.firebase_token;

      await signInWithCustomToken(auth, this.firebaseToken);
      console.log('Firebase authentication successful');
      this.scheduleTokenRefresh();
      return true;
    } catch (error) {
      console.error('Firebase auth initialization error:', error);
      return false;
    }
  }

  private scheduleTokenRefresh() {
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
    }
    const refreshInterval = (3600 - 300) * 1000; // 55 minutes
    this.tokenRefreshTimeout = setTimeout(async () => {
      await this.refreshAuthToken();
    }, refreshInterval);
  }

  async refreshAuthToken(): Promise<boolean> {
    try {
      if (!auth) {
        console.error('Auth not initialized, cannot refresh token.');
        return false;
      }
      if (auth.currentUser) {
        await auth.signOut();
      }

      const response = await apiClient.getFirebaseToken();
      this.firebaseToken = response.firebase_token;
      await signInWithCustomToken(auth, this.firebaseToken);
      this.scheduleTokenRefresh();
      return true;
    } catch (error) {
      console.error('Error refreshing Firebase custom token:', error);
      return false;
    }
  }

  async createOrGetChat(
    farmerId: string,
    farmerName: string,
    labourId: string,
    labourName: string,
    jobId: number,
    jobTitle: string
  ): Promise<string> {
    if (!firestore) throw new Error('Firestore not initialized');

    const chatId = `${farmerId}_${labourId}_${jobId}`;
    const chatRef = doc(firestore, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      await setDoc(chatRef, {
        farmerId,
        farmerName,
        labourId,
        labourName,
        jobId,
        jobTitle,
        unreadCount: {
          [farmerId]: 0,
          [labourId]: 0,
        },
        createdAt: serverTimestamp(),
      });
    }

    return chatId;
  }

  async sendMessage(
    chatId: string,
    senderId: string,
    senderName: string,
    senderRole: 'farmer' | 'labour',
    message: string
  ): Promise<void> {
    if (!firestore) throw new Error('Firestore not initialized');

    const receiverId = senderRole === 'farmer' ? chatId.split('_')[1] : chatId.split('_')[0];
    const batch = writeBatch(firestore);

    // Add message to the top-level 'messages' collection
    const messageRef = doc(collection(firestore, 'messages'));
    batch.set(messageRef, {
      chatId,
      senderId,
      senderName,
      senderRole,
      message,
      timestamp: serverTimestamp(),
      read: false,
    });

    // Update the chat document in the 'chats' collection
    const chatRef = doc(firestore, 'chats', chatId);
    batch.update(chatRef, {
      lastMessage: message,
      lastMessageTime: serverTimestamp(),
      [`unreadCount.${receiverId}`]: increment(1),
    });

    await batch.commit();
  }

  subscribeToMessages(chatId: string, callback: (messages: ChatMessage[]) => void): () => void {
    if (!firestore) throw new Error('Firestore not initialized');

    const messagesQuery = query(
      collection(firestore, 'messages'),
      where('chatId', '==', chatId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];
      callback(messages);
    }, async (error) => {
      console.error('Firestore messages subscription error:', error);
      if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
        const success = await this.refreshAuthToken();
        if (!success) {
          console.error('Failed to re-authenticate after Firestore error.');
        }
      }
    });

    return unsubscribe;
  }

  subscribeToChats(userId: string, callback: (chats: Chat[]) => void): () => void {
    if (!firestore) throw new Error('Firestore not initialized');

    const farmerQuery = query(
      collection(firestore, 'chats'),
      where('farmerId', '==', userId),
      orderBy('lastMessageTime', 'desc')
    );

    const labourQuery = query(
      collection(firestore, 'chats'),
      where('labourId', '==', userId),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubFarmer = onSnapshot(farmerQuery, (farmerSnapshot) => {
      const farmerChats = farmerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Chat);
      // This logic needs to be improved to combine results from both queries
      callback(farmerChats);
    });

    const unsubLabour = onSnapshot(labourQuery, (labourSnapshot) => {
      const labourChats = labourSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Chat);
      // This logic needs to be improved to combine results from both queries
      callback(labourChats);
    });

    // A more robust implementation would merge the results of both snapshots
    // before calling the callback, but this is a start.

    return () => {
      unsubFarmer();
      unsubLabour();
    };
  }

  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    if (!firestore) throw new Error('Firestore not initialized');

    const batch = writeBatch(firestore);

    const chatRef = doc(firestore, 'chats', chatId);
    batch.update(chatRef, {
      [`unreadCount.${userId}`]: 0,
    });

    const messagesQuery = query(
      collection(firestore, 'messages'),
      where('chatId', '==', chatId),
      where('senderId', '!=', userId),
      where('read', '==', false)
    );

    const messagesSnapshot = await getDocs(messagesQuery);
    messagesSnapshot.docs.forEach((docSnapshot) => {
      batch.update(docSnapshot.ref, { read: true });
    });

    await batch.commit();
  }
}

export const firebaseChatService = new FirebaseChatService();