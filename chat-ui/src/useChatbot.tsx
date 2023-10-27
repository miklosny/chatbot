import { useRef, useState } from "react";
import { MAX_INPUT_CHARACTERS } from "./constants";
import { useApiConversation } from "./useApiConversation";

export type UseChatbotProps = {
  serverBaseUrl?: string;
  shouldStream?: boolean;
  suggestedPrompts?: string[];
  apiCredentials: {
    "atlas-admin-api": {
      publicApiKey: string;
      privateApiKey: string;
      organizationId: string;
      projectId: string;
      clusterId: string;
    };
  };
};

export type ChatbotData = {
  awaitingReply: boolean;
  closeChat: () => boolean;
  conversation: ReturnType<typeof useApiConversation>;
  handleSubmit: (text: string) => void | Promise<void>;
  inputBarRef: React.RefObject<HTMLFormElement>;
  inputText: string;
  inputTextError: string;
  open: boolean;
  openChat: () => void;
  setInputText: (text: string) => void;
};

export function useChatbot(props: UseChatbotProps): ChatbotData {
  const conversation = useApiConversation({
    serverBaseUrl: props.serverBaseUrl,
    shouldStream: props.shouldStream,
    apiCredentials: props.apiCredentials,
  });
  const [open, setOpen] = useState(false);
  const [awaitingReply, setAwaitingReply] = useState(false);
  const inputBarRef = useRef<HTMLFormElement>(null);

  async function openChat() {
    if (open) {
      return;
    }
    setOpen(true);
    if (!conversation.conversationId) {
      await conversation.createConversation();
    }
  }

  function closeChat() {
    setOpen(false);
    return true;
  }

  const [inputData, setInputData] = useState({
    text: "",
    error: "",
  });
  const inputText = inputData.text;
  const inputTextError = inputData.error;
  function setInputText(text: string) {
    const isValid = text.length <= MAX_INPUT_CHARACTERS;
    setInputData({
      text,
      error: isValid
        ? ""
        : `Input must be less than ${MAX_INPUT_CHARACTERS} characters`,
    });
  }

  async function handleSubmit(text: string) {
    if (!conversation.conversationId) {
      console.error(`Cannot addMessage without a conversationId`);
      return;
    }
    if (inputData.error) {
      console.error(`Cannot addMessage with invalid input text`);
      return;
    }
    // Don't let users submit a message that is empty or only whitespace
    if (text.replace(/\s/g, "").length === 0) return;
    // Don't let users submit a message if we're already waiting for a reply
    if (awaitingReply) return;
    try {
      setInputText("");
      setAwaitingReply(true);
      openChat();
      await conversation.addMessage("user", text);
    } catch (e) {
      console.error(e);
    } finally {
      setAwaitingReply(false);
    }
  }

  return {
    awaitingReply,
    closeChat,
    conversation,
    handleSubmit,
    inputBarRef,
    inputText,
    inputTextError,
    open,
    openChat,
    setInputText,
  };
}
