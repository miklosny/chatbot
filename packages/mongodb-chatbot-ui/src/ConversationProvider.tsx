import { createContext } from "react";
import {
  useConversation,
  defaultConversationState,
  Conversation,
} from "./useConversation";

export const ConversationContext = createContext<Conversation>({
  ...defaultConversationState,
  createConversation: async () => {
    return;
  },
  addMessage: async () => {
    return;
  },
  modifyMessage: async () => {
    return;
  },
  deleteMessage: async () => {
    return;
  },
  rateMessage: async () => {
    return;
  },
  commentMessage: async () => {
    return;
  },
  endConversationWithError: () => {
    return;
  },
});

export default function ConversationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const providerValue = useConversation();

  return (
    <ConversationContext.Provider value={providerValue}>
      {children}
    </ConversationContext.Provider>
  );
}
