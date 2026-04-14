export const SUPPORT_THREAD_ID = "support";
export const SUPPORT_CHAT_STORAGE_KEY = "rentup:support_chat_active";

export function isSupportChatActive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SUPPORT_CHAT_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function activateSupportChat(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SUPPORT_CHAT_STORAGE_KEY, "1");
    window.dispatchEvent(new Event("rentup-support-chat"));
  } catch {
    /* ignore */
  }
}

export interface MessageThreadPreview {
  id: string;
  participantName: string;
  /** When set, UI shows `t(participantNameKey)` instead of `participantName`. */
  participantNameKey?: string;
  initial: string;
  avatarBg: string;
  previewKey: string;
  productLineKey: string;
  time: string;
  timeBadge?: "yesterday" | null;
  unread?: number;
  readReceipt?: boolean;
}

export const supportThreadPreview: MessageThreadPreview = {
  id: SUPPORT_THREAD_ID,
  participantName: "support",
  participantNameKey: "messagesSupportParticipantName",
  initial: "R",
  avatarBg: "bg-emerald-950",
  previewKey: "messagesSupportPreview",
  productLineKey: "messagesSupportProductLine",
  time: "—",
};

export const messageThreads: MessageThreadPreview[] = [
  {
    id: "t1",
    participantName: "Tomer Tenenbaum",
    initial: "T",
    avatarBg: "bg-violet-600",
    previewKey: "messagesPreview1",
    productLineKey: "messagesThreadProduct1",
    time: "15:23",
    unread: 1,
  },
  {
    id: "t2",
    participantName: "Anita Cruz",
    initial: "A",
    avatarBg: "bg-pink-500",
    previewKey: "messagesPreview2",
    productLineKey: "messagesThreadProduct2",
    time: "12:05",
    timeBadge: "yesterday",
  },
  {
    id: "t3",
    participantName: "Noah Pierre",
    initial: "N",
    avatarBg: "bg-teal-600",
    previewKey: "messagesPreview3",
    productLineKey: "messagesThreadProduct3",
    time: "09:41",
    readReceipt: true,
  },
  {
    id: "t4",
    participantName: "Lucy Bond",
    initial: "L",
    avatarBg: "bg-orange-500",
    previewKey: "messagesPreview4",
    productLineKey: "messagesThreadProduct4",
    time: "11/10",
  },
];

export type ChatBubbleFrom = "me" | "them";

export interface ChatBubble {
  id: string;
  from: ChatBubbleFrom;
  bodyKey: string;
  /** Literal clock label (mock). */
  time?: string;
  /** Locale key for the timestamp label. */
  timeKey?: string;
}

/** Same short scripted thread for every conversation (mock). */
export function getThreadBubbles(threadId: string): ChatBubble[] {
  if (threadId === SUPPORT_THREAD_ID) {
    return [{ id: "sup1", from: "them", bodyKey: "messagesSupportWelcome", timeKey: "messagesSupportWelcomeTime" }];
  }
  return [
    { id: "m1", from: "them", bodyKey: "messagesBubbleThem1", time: "15:18" },
    { id: "m2", from: "me", bodyKey: "messagesBubbleMe1", time: "15:19" },
    { id: "m3", from: "them", bodyKey: "messagesBubbleThem2", time: "15:21" },
    { id: "m4", from: "me", bodyKey: "messagesBubbleMe2", time: "15:23" },
  ];
}

export function getThreadPreview(id: string): MessageThreadPreview | undefined {
  if (id === SUPPORT_THREAD_ID) return supportThreadPreview;
  return messageThreads.find((thread) => thread.id === id);
}
