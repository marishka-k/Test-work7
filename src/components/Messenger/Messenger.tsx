import { useCallback, useEffect, useReducer, useState } from 'react';
import { checkAccount, extractText, sendMessage, type NotificationBody } from '../../api/greenApi';
import { useNotifications } from '../../hooks/useNotifications';
import { chatsReducer } from '../../state/chatsReducer';
import type { Credentials } from '../../types';
import { cn } from '../../utils/cn';
import { formatPhone } from '../../utils/phone';
import { loadChats, saveChats } from '../../utils/storage';
import { nowSec } from '../../utils/time';
import { ChatView } from '../ChatView/ChatView';
import { Logo } from '../Logo/Logo';
import { Sidebar } from '../Sidebar/Sidebar';
import s from './Messenger.module.css';

interface Props {
  creds: Credentials;
  onLogout: () => void;
}

export function Messenger({ creds, onLogout }: Props) {
  const [chats, dispatch] = useReducer(chatsReducer, creds.idInstance, loadChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  useEffect(() => saveChats(creds.idInstance, chats), [creds.idInstance, chats]);

  // Обработка входящих уведомлений
  const handleNotification = useCallback(
    (body: NotificationBody) => {
      const isIncoming = body.typeWebhook === 'incomingMessageReceived';
      // outgoingMessageReceived — отправлено с телефона; свои API-сообщения уже есть в чате
      const isOutgoingFromPhone = body.typeWebhook === 'outgoingMessageReceived';
      if (!isIncoming && !isOutgoingFromPhone) return;

      const text = extractText(body);
      const sender = body.senderData;
      if (text === null || !sender?.chatId || !body.idMessage) return;

      const phone = sender.senderPhoneNumber ? String(sender.senderPhoneNumber) : undefined;
      dispatch({
        type: 'addMessage',
        chatId: sender.chatId,
        title: sender.senderContactName || sender.chatName || sender.senderName || (phone && formatPhone(phone)),
        phone: isIncoming ? phone : undefined,
        markUnread: isIncoming && sender.chatId !== activeChatId,
        message: {
          id: body.idMessage,
          text,
          timestamp: body.timestamp || nowSec(),
          direction: isIncoming ? 'in' : 'out',
          status: isIncoming ? undefined : 'sent',
        },
      });
    },
    [activeChatId],
  );

  const { status, error } = useNotifications(creds, handleNotification);

  const selectChat = (chatId: string) => {
    setActiveChatId(chatId);
    dispatch({ type: 'readChat', chatId });
  };

  // Создание чата по номеру: в MAX сообщения приходят с числовым chatId,
  // поэтому сначала узнаём его через CheckAccount; при неудаче — формат phone@c.us
  const createChat = async (phone: string) => {
    let chatId = `${phone}@c.us`;
    try {
      const account = await checkAccount(creds, phone);
      if (account && !account.exist) throw new Error('На этот номер не зарегистрирован аккаунт MAX');
      if (account?.chatId) chatId = account.chatId;
    } catch (e) {
      if ((e as Error).message.includes('не зарегистрирован')) throw e;
    }

    const existing = Object.values(chats).find((c) => c.chatId === chatId || c.phone === phone);
    if (existing) {
      selectChat(existing.chatId);
      return;
    }
    dispatch({ type: 'addChat', chatId, title: formatPhone(phone), phone });
    setActiveChatId(chatId);
  };

  const deliver = async (chatId: string, id: string, text: string) => {
    try {
      const { idMessage } = await sendMessage(creds, chatId, text);
      dispatch({ type: 'updateMessage', chatId, id, patch: { id: idMessage, status: 'sent', error: undefined } });
    } catch (e) {
      dispatch({ type: 'updateMessage', chatId, id, patch: { status: 'error', error: (e as Error).message } });
    }
  };

  const send = (text: string) => {
    if (!activeChatId) return;
    const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    dispatch({
      type: 'addMessage',
      chatId: activeChatId,
      message: { id, text, timestamp: nowSec(), direction: 'out', status: 'pending' },
    });
    void deliver(activeChatId, id, text);
  };

  const retry = (messageId: string) => {
    if (!activeChatId) return;
    const message = chats[activeChatId]?.messages.find((m) => m.id === messageId);
    if (!message) return;
    dispatch({ type: 'updateMessage', chatId: activeChatId, id: messageId, patch: { status: 'pending' } });
    void deliver(activeChatId, messageId, message.text);
  };

  // чат мог переехать на числовой chatId после первого ответа
  const activeChat = activeChatId ? chats[activeChatId] : undefined;
  useEffect(() => {
    if (activeChatId && !activeChat) {
      const moved = Object.values(chats).find((c) => c.phone && activeChatId.startsWith(c.phone));
      setActiveChatId(moved?.chatId ?? null);
    }
  }, [activeChatId, activeChat, chats]);

  return (
    <div className={cn(s.messenger, activeChat && s['messenger--chat-open'])}>
      <Sidebar
        chats={Object.values(chats)}
        activeChatId={activeChatId}
        status={status}
        statusError={error}
        idInstance={creds.idInstance}
        onSelect={selectChat}
        onCreateChat={createChat}
        onLogout={onLogout}
      />
      {activeChat ? (
        <ChatView chat={activeChat} onSend={send} onRetry={retry} onBack={() => setActiveChatId(null)} />
      ) : (
        <div className={s.messenger__empty}>
          <Logo size={72} />
          <p className={s['messenger__empty-text']}>Выберите чат или создайте новый по номеру телефона</p>
        </div>
      )}
    </div>
  );
}
