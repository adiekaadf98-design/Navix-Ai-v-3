import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  Unsubscribe,
  disableNetwork 
} from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { ChatSession, ChatMessage, Attachment } from '../types';
import { CachedMediaItem, saveMediaToVault } from '../utils/mediaStorage';
import { AuthService } from './auth';

class FirestoreSyncService {
  private activeListener: Unsubscribe | null = null;
  private isSyncing = false;
  private quotaExceeded = false;
  private deletedSessionIds: Set<string> = new Set();
  private deletedMessageIds: Set<string> = new Set();
  private clearedSessionTimestamps: Map<string, number> = new Map();

  private markQuotaExceeded(): void {
    if (!this.quotaExceeded) {
      this.quotaExceeded = true;
      this.unsubscribe();
      disableNetwork(db).catch(() => {});
    }
  }

  constructor() {
    try {
      const storedDeleted = localStorage.getItem('navix_tombstone_sessions');
      if (storedDeleted) {
        const parsed = JSON.parse(storedDeleted);
        if (Array.isArray(parsed)) {
          this.deletedSessionIds = new Set(parsed);
        }
      }
      const storedDeletedMsgs = localStorage.getItem('navix_tombstone_messages');
      if (storedDeletedMsgs) {
        const parsedMsgs = JSON.parse(storedDeletedMsgs);
        if (Array.isArray(parsedMsgs)) {
          this.deletedMessageIds = new Set(parsedMsgs);
        }
      }
      const storedCleared = localStorage.getItem('navix_cleared_sessions');
      if (storedCleared) {
        const parsedCleared = JSON.parse(storedCleared);
        if (typeof parsedCleared === 'object' && parsedCleared !== null) {
          this.clearedSessionTimestamps = new Map(Object.entries(parsedCleared));
        }
      }
    } catch (_) {}
  }

  /**
   * Mark a session ID as permanently deleted to prevent zombie restoration
   */
  public markSessionDeleted(sessionId: string): void {
    if (!sessionId) return;
    this.deletedSessionIds.add(sessionId);
    try {
      localStorage.setItem('navix_tombstone_sessions', JSON.stringify(Array.from(this.deletedSessionIds).slice(-200)));
    } catch (_) {}
  }

  public isSessionDeleted(sessionId: string): boolean {
    return this.deletedSessionIds.has(sessionId);
  }

  /**
   * Mark an individual message as permanently deleted
   */
  public markMessageDeleted(sessionId: string, messageId: string): void {
    if (!sessionId || !messageId) return;
    const key = `${sessionId}:${messageId}`;
    this.deletedMessageIds.add(key);
    try {
      localStorage.setItem('navix_tombstone_messages', JSON.stringify(Array.from(this.deletedMessageIds).slice(-500)));
    } catch (_) {}
  }

  public isMessageDeleted(sessionId: string, messageId: string): boolean {
    return this.deletedMessageIds.has(`${sessionId}:${messageId}`);
  }

  /**
   * Mark a session as cleared at a given timestamp
   */
  public markSessionCleared(sessionId: string, timestamp: number = Date.now()): void {
    if (!sessionId) return;
    this.clearedSessionTimestamps.set(sessionId, timestamp);
    try {
      const obj = Object.fromEntries(this.clearedSessionTimestamps.entries());
      localStorage.setItem('navix_cleared_sessions', JSON.stringify(obj));
    } catch (_) {}
  }

  public isMessageCleared(sessionId: string, messageTimestamp?: Date | string): boolean {
    if (!sessionId) return false;
    const clearedAt = this.clearedSessionTimestamps.get(sessionId);
    if (!clearedAt) return false;
    if (!messageTimestamp) return true;
    const msgTime = new Date(messageTimestamp).getTime();
    return msgTime <= clearedAt;
  }

  /**
   * Get effective user identifier for Firestore scoping
   */
  public getUserId(): string | null {
    if (auth.currentUser?.uid) {
      return auth.currentUser.uid;
    }
    const localUser = AuthService.getCurrentUser();
    if (localUser?.id) {
      return localUser.id;
    }
    return null;
  }

  /**
   * Check if Firestore cloud sync is active
   */
  public isCloudReady(): boolean {
    return !!this.getUserId();
  }

  /**
   * Save or update a single session in Firestore cloud
   */
  public async saveSession(session: ChatSession): Promise<void> {
    if (this.quotaExceeded) return;
    const userId = this.getUserId();
    if (!userId || !session.id) return;

    const sessionPath = `users/${userId}/sessions/${session.id}`;
    const lastMsg = session.messages.length > 0 
      ? session.messages[session.messages.length - 1].text.slice(0, 500) 
      : '';

    try {
      const sessionDocRef = doc(db, 'users', userId, 'sessions', session.id);
      await setDoc(sessionDocRef, {
        id: session.id,
        title: session.title || 'Obrolan Baru',
        userId: userId,
        createdAt: session.updatedAt ? new Date(session.updatedAt).toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastMessageText: lastMsg
      }, { merge: true });

      // Save only the last message to avoid massive batch writes on every session update
      if (session.messages && session.messages.length > 0) {
        const lastMessage = session.messages[session.messages.length - 1];
        if (lastMessage) {
          await this.saveMessage(session.id, lastMessage);
        }
      }
    } catch (err: any) {
      if (err?.message?.includes('resource-exhausted') || err?.message?.includes('Quota limit exceeded')) {
        this.markQuotaExceeded();
      }
      handleFirestoreError(err, OperationType.WRITE, sessionPath);
    }
  }

  /**
   * Save an individual message to session's subcollection
   */
  public async saveMessage(sessionId: string, message: ChatMessage): Promise<void> {
    if (this.quotaExceeded) return;
    const userId = this.getUserId();
    if (!userId || !sessionId || !message.id) return;

    const messagePath = `users/${userId}/sessions/${sessionId}/messages/${message.id}`;
    try {
      const msgDocRef = doc(db, 'users', userId, 'sessions', sessionId, 'messages', message.id);
      
      // Clean large binary data from attachments to respect 1MB document limit
      const cleanAttachmentsSummary = message.attachments?.map(att => ({
        type: att.type,
        mimeType: att.mimeType,
        name: att.name || 'attachment',
        url: att.url?.startsWith('data:') ? 'base64_data_omitted' : (att.url || '')
      })) || [];

      await setDoc(msgDocRef, {
        id: message.id,
        sessionId: sessionId,
        userId: userId,
        role: message.role,
        text: message.text || '',
        timestamp: message.timestamp ? new Date(message.timestamp).toISOString() : new Date().toISOString(),
        attachmentsSummary: cleanAttachmentsSummary.length > 0 ? JSON.stringify(cleanAttachmentsSummary).slice(0, 900) : '',
        thinkingState: message.thinkingState ? JSON.stringify(message.thinkingState) : ''
      }, { merge: true });
    } catch (err: any) {
      if (err?.message?.includes('resource-exhausted') || err?.message?.includes('Quota limit exceeded')) {
        this.markQuotaExceeded();
      }
      handleFirestoreError(err, OperationType.WRITE, messagePath);
    }
  }

  /**
   * Delete a session and its subcollection from Firestore permanently
   */
  public async deleteSession(sessionId: string): Promise<void> {
    const userId = this.getUserId();
    if (!sessionId) return;
    this.markSessionDeleted(sessionId);

    if (this.quotaExceeded || !userId) return;

    const sessionPath = `users/${userId}/sessions/${sessionId}`;
    try {
      // 1. Delete all messages inside session
      const msgsRef = collection(db, 'users', userId, 'sessions', sessionId, 'messages');
      const msgsSnapshot = await getDocs(msgsRef);
      const deletePromises = msgsSnapshot.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);

      // 2. Delete session doc
      await deleteDoc(doc(db, 'users', userId, 'sessions', sessionId));
      console.log(`[Firestore Sync] Session ${sessionId} permanently deleted from cloud.`);
    } catch (err: any) {
      if (err?.message?.includes('resource-exhausted') || err?.message?.includes('Quota limit exceeded')) {
        this.markQuotaExceeded();
      }
      handleFirestoreError(err, OperationType.DELETE, sessionPath);
    }
  }

  /**
   * Permanently delete a single message from Firestore
   */
  public async deleteSingleMessage(sessionId: string, messageId: string): Promise<void> {
    const userId = this.getUserId();
    if (!sessionId || !messageId) return;
    this.markMessageDeleted(sessionId, messageId);

    if (this.quotaExceeded || !userId) return;

    const messagePath = `users/${userId}/sessions/${sessionId}/messages/${messageId}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'sessions', sessionId, 'messages', messageId));
      console.log(`[Firestore Sync] Message ${messageId} deleted permanently.`);
    } catch (err: any) {
      if (err?.message?.includes('resource-exhausted') || err?.message?.includes('Quota limit exceeded')) {
        this.markQuotaExceeded();
      }
      handleFirestoreError(err, OperationType.DELETE, messagePath);
    }
  }

  /**
   * Permanently delete all messages in a session from Firestore
   */
  public async clearSessionMessages(sessionId: string): Promise<void> {
    const userId = this.getUserId();
    if (!sessionId) return;
    this.markSessionCleared(sessionId);

    if (this.quotaExceeded || !userId) return;

    const sessionPath = `users/${userId}/sessions/${sessionId}`;
    try {
      // 1. Delete all message subdocuments
      const msgsRef = collection(db, 'users', userId, 'sessions', sessionId, 'messages');
      const msgsSnapshot = await getDocs(msgsRef);
      const deletePromises = msgsSnapshot.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);

      // 2. Update session doc to have empty lastMessageText
      const sessionDocRef = doc(db, 'users', userId, 'sessions', sessionId);
      await setDoc(sessionDocRef, {
        lastMessageText: '',
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log(`[Firestore Sync] All messages cleared permanently for session ${sessionId}.`);
    } catch (err: any) {
      if (err?.message?.includes('resource-exhausted') || err?.message?.includes('Quota limit exceeded')) {
        this.markQuotaExceeded();
      }
      handleFirestoreError(err, OperationType.WRITE, sessionPath);
    }
  }

  /**
   * Fetch all cloud sessions and messages for the current user
   */
  public async loadAllSessions(): Promise<ChatSession[]> {
    if (this.quotaExceeded) return [];
    const userId = this.getUserId();
    if (!userId) return [];

    const sessionsPath = `users/${userId}/sessions`;
    try {
      const sessionsRef = collection(db, 'users', userId, 'sessions');
      const snapshot = await getDocs(sessionsRef);

      if (snapshot.empty) return [];

      const sessions: ChatSession[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const sessionId = data.id || docSnap.id;

        // Skip permanently deleted sessions
        if (this.isSessionDeleted(sessionId)) {
          continue;
        }

        // Fetch messages for this session
        let messages: ChatMessage[] = [];
        try {
          const msgsRef = collection(db, 'users', userId, 'sessions', sessionId, 'messages');
          const msgsSnap = await getDocs(msgsRef);
          messages = msgsSnap.docs.map(mDoc => {
            const mData = mDoc.data();
            let attachments: Attachment[] | undefined = undefined;
            if (mData.attachmentsSummary) {
              try {
                attachments = JSON.parse(mData.attachmentsSummary);
              } catch (_) {}
            }
            let thinkingState = undefined;
            if (mData.thinkingState) {
              try {
                thinkingState = typeof mData.thinkingState === 'string' ? JSON.parse(mData.thinkingState) : mData.thinkingState;
              } catch (_) {}
            }
            return {
              id: mData.id || mDoc.id,
              role: mData.role || 'user',
              text: mData.text || '',
              attachments,
              thinkingState,
              timestamp: mData.timestamp ? new Date(mData.timestamp) : new Date()
            };
          })
          .filter(m => !this.isMessageDeleted(sessionId, m.id) && !this.isMessageCleared(sessionId, m.timestamp))
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        } catch (e) {
          console.warn(`Failed to fetch messages for session ${sessionId}:`, e);
        }

        sessions.push({
          id: sessionId,
          title: data.title || 'Obrolan Baru',
          messages: messages,
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
        });
      }

      // Sort sessions by latest updatedAt
      sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      return sessions;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, sessionsPath);
      return [];
    }
  }

  /**
   * Save a generated multimedia asset reference to the cloud Media Vault
   */
  public async saveMediaVaultItem(item: { id: string; type: string; prompt: string; mediaUrl: string; createdAt?: number }): Promise<void> {
    if (this.quotaExceeded) return;
    const userId = this.getUserId();
    if (!userId || !item.id) return;

    // Store full media URLs or base64 data directly in Firestore (safe within 1MB document limit)
    let safeUrl = item.mediaUrl;
    if (safeUrl && safeUrl.startsWith('data:') && safeUrl.length > 850000) {
      // Only for extremely huge data over 850KB, preserve in local vault
      safeUrl = 'local_vault_only';
    }

    const mediaPath = `users/${userId}/mediaVault/${item.id}`;
    try {
      const mediaDocRef = doc(db, 'users', userId, 'mediaVault', item.id);
      await setDoc(mediaDocRef, {
        id: item.id,
        userId: userId,
        type: item.type || 'image',
        prompt: (item.prompt || '').slice(0, 3900),
        mediaUrl: safeUrl,
        createdAt: item.createdAt || Date.now()
      }, { merge: true });
      console.log(`[Navix Cloud Vault] Multimedia asset ${item.id} safely synced to Firestore.`);
    } catch (err: any) {
      if (err?.message?.includes('resource-exhausted') || err?.message?.includes('Quota limit exceeded')) {
        this.markQuotaExceeded();
      }
      handleFirestoreError(err, OperationType.WRITE, mediaPath);
    }
  }

  /**
   * Load all media vault items from Firestore and cache them into local IndexedDB
   */
  public async loadAllMediaVault(): Promise<CachedMediaItem[]> {
    const userId = this.getUserId();
    if (!userId) return [];

    const mediaPath = `users/${userId}/mediaVault`;
    try {
      const mediaRef = collection(db, 'users', userId, 'mediaVault');
      const snapshot = await getDocs(mediaRef);

      const items: CachedMediaItem[] = [];
      for (const docSnap of snapshot.docs) {
        const d = docSnap.data();
        const mediaUrlFromCloud = d.mediaUrl || '';
        const mediaItem: CachedMediaItem = {
          id: d.id || docSnap.id,
          type: d.type || 'image',
          prompt: d.prompt || '',
          mediaUrl: mediaUrlFromCloud,
          createdAt: d.createdAt || Date.now()
        };
        items.push(mediaItem);
        // Only save to local device vault if cloud has a real valid URL/data (not 'local_vault_only')
        if (mediaUrlFromCloud && mediaUrlFromCloud !== 'local_vault_only') {
          saveMediaToVault(mediaItem.id, mediaItem).catch(() => {});
        }
      }
      return items;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, mediaPath);
      return [];
    }
  }

  /**
   * Subscribe to real-time session changes from Firestore across devices/tabs
   */
  public subscribeToSessions(onSync: (cloudSessions: ChatSession[]) => void): Unsubscribe | null {
    if (this.quotaExceeded) return null;
    const userId = this.getUserId();
    if (!userId) return null;

    if (this.activeListener) {
      this.activeListener();
      this.activeListener = null;
    }

    const sessionsRef = collection(db, 'users', userId, 'sessions');
    this.activeListener = onSnapshot(sessionsRef, async () => {
      if (this.isSyncing || this.quotaExceeded) return;
      this.isSyncing = true;
      try {
        const sessions = await this.loadAllSessions();
        onSync(sessions);
      } catch (err: any) {
        if (err?.message?.includes('resource-exhausted') || err?.message?.includes('Quota limit exceeded') || err?.code === 'resource-exhausted') {
          this.quotaExceeded = true;
          this.unsubscribe();
        }
        console.warn('Real-time session snapshot sync error:', err);
      } finally {
        this.isSyncing = false;
      }
    }, (error: any) => {
      if (error?.message?.includes('resource-exhausted') || error?.message?.includes('Quota limit exceeded') || error?.code === 'resource-exhausted') {
        this.quotaExceeded = true;
        this.unsubscribe();
      }
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/sessions`);
    });

    return this.activeListener;
  }

  public unsubscribe(): void {
    if (this.activeListener) {
      this.activeListener();
      this.activeListener = null;
    }
  }
}

export const firestoreSync = new FirestoreSyncService();
