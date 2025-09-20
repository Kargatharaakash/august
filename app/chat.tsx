import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  StatusBar,
  Animated,
  Keyboard,
  Alert,
  Easing,
  Dimensions,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import Icons from '@/constants/Icons';
import Strings from '@/constants/Strings';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { v4 as uuidv4 } from 'uuid';
import { BlurView } from 'expo-blur';

import { useTheme } from '@/contexts/ThemeContext';
import Typography from '@/constants/Typography';
import Spacing from '@/constants/Spacing';
import { Message, Chat, MessageAttachment } from '@/types';
import { saveChat, getChats, deleteChat as deleteChatFromStorage } from '@/services/storage';
import { sendChatMessage, convertImageToBase64 } from '@/services/groq';

// Get screen dimensions for responsive design
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive sizing calculations
const HEADER_TITLE_FONT_SIZE = SCREEN_WIDTH * 0.055; // 5.5% of screen width
const MESSAGE_FONT_SIZE = SCREEN_WIDTH * 0.04; // 4% of screen width
const MESSAGE_LINE_HEIGHT = SCREEN_WIDTH * 0.055; // 5.5% of screen width
const INPUT_FONT_SIZE = SCREEN_WIDTH * 0.04; // 4% of screen width
const NOTIFICATION_FONT_SIZE = SCREEN_WIDTH * 0.035; // 3.5% of screen width
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.8; // 80% of screen width (max 300)
const CHAT_HISTORY_PREVIEW_FONT_SIZE = SCREEN_WIDTH * 0.035; // 3.5% of screen width
const CHAT_HISTORY_DATE_FONT_SIZE = SCREEN_WIDTH * 0.03; // 3% of screen width
const NEW_CHAT_BUTTON_FONT_SIZE = SCREEN_WIDTH * 0.04; // 4% of screen width
const ATTACHMENT_PREVIEW_SIZE = SCREEN_WIDTH * 0.15; // 15% of screen width
const ATTACHMENT_PREVIEW_RADIUS = ATTACHMENT_PREVIEW_SIZE / 8;
const REMOVE_ATTACHMENT_SIZE = SCREEN_WIDTH * 0.045; // 4.5% of screen width
const REMOVE_ATTACHMENT_RADIUS = REMOVE_ATTACHMENT_SIZE / 2;
const SCROLL_BUTTON_SIZE = SCREEN_WIDTH * 0.1; // 10% of screen width
const SCROLL_BUTTON_RADIUS = SCROLL_BUTTON_SIZE / 2;
const ACTION_BUTTON_SIZE = SCREEN_WIDTH * 0.07; // 7% of screen width
const ACTION_BUTTON_RADIUS = ACTION_BUTTON_SIZE / 2;
const SEND_BUTTON_SIZE = SCREEN_WIDTH * 0.1; // 10% of screen width
const SEND_BUTTON_RADIUS = SEND_BUTTON_SIZE / 2;
const ATTACH_BUTTON_SIZE = SCREEN_WIDTH * 0.08; // 8% of screen width
const ATTACH_BUTTON_RADIUS = ATTACH_BUTTON_SIZE / 2;
const INPUT_CONTAINER_MIN_HEIGHT = SCREEN_WIDTH * 0.14; // 14% of screen width
const INPUT_CONTAINER_RADIUS = INPUT_CONTAINER_MIN_HEIGHT / 2;
const MESSAGE_BUBBLE_RADIUS = SCREEN_WIDTH * 0.045; // 4.5% of screen width
const USER_BUBBLE_RADIUS_CORNER = SCREEN_WIDTH * 0.01; // 1% of screen width
const ASSISTANT_BUBBLE_RADIUS_CORNER = SCREEN_WIDTH * 0.01; // 1% of screen width
const ATTACHMENT_IMAGE_WIDTH = SCREEN_WIDTH * 0.75; // 75% of screen width
const ATTACHMENT_IMAGE_HEIGHT = SCREEN_WIDTH * 0.53; // 53% of screen width
const ATTACHMENT_IMAGE_RADIUS = SCREEN_WIDTH * 0.03; // 3% of screen width
const CHAT_HISTORY_ICON_SIZE = SCREEN_WIDTH * 0.08; // 8% of screen width
const CHAT_HISTORY_ICON_RADIUS = CHAT_HISTORY_ICON_SIZE / 2;
const SIDEBAR_HEADER_FONT_SIZE = SCREEN_WIDTH * 0.045; // 4.5% of screen width
const SIDEBAR_TITLE_FONT_SIZE = SCREEN_WIDTH * 0.05; // 5% of screen width

export default function ChatScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { i18n, t } = useTranslation();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [fullText, setFullText] = useState('');
  const [typingSpeed, setTypingSpeed] = useState(30); // ms per character
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set());
  const [dislikedMessages, setDislikedMessages] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const currentLanguage = i18n.language;
  const styles = getStyles(theme);
  
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const typingAnimation = useRef<NodeJS.Timeout | null>(null);
  const notificationAnimatedValue = useRef(new Animated.Value(-100)).current;
  const sidebarAnimatedValue = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const dot1Animation = useRef(new Animated.Value(0)).current;
  const dot2Animation = useRef(new Animated.Value(0)).current;
  const dot3Animation = useRef(new Animated.Value(0)).current;

  // Animate typing dots
  useEffect(() => {
    const animateDots = () => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(dot1Animation, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot2Animation, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
              delay: 200,
            }),
            Animated.timing(dot3Animation, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
              delay: 400,
            }),
          ]),
          Animated.parallel([
            Animated.timing(dot1Animation, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
              delay: 600,
            }),
            Animated.timing(dot2Animation, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
              delay: 800,
            }),
            Animated.timing(dot3Animation, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
              delay: 1000,
            }),
          ]),
        ])
      ).start();
    };

    animateDots();

    return () => {
      dot1Animation.stopAnimation();
      dot2Animation.stopAnimation();
      dot3Animation.stopAnimation();
    };
  }, []);

  // Simulate typing animation for AI responses
  const startTypingAnimation = (text: string) => {
    setFullText(text);
    setTypingText('');
    let index = 0;
    
    // Clear any existing animation
    if (typingAnimation.current) {
      clearInterval(typingAnimation.current);
    }
    
    // Start new animation
    typingAnimation.current = setInterval(() => {
      if (index < text.length) {
        setTypingText(prev => prev + text[index]);
        index++;
      } else {
        // Animation complete
        if (typingAnimation.current) {
          clearInterval(typingAnimation.current);
          typingAnimation.current = null;
        }
        setIsTyping(false);
      }
    }, typingSpeed);
  };
  
  // Improved notification animation with better timing and easing
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    
    // Animate in with better spring physics
    Animated.spring(notificationAnimatedValue, {
      toValue: 0,
      useNativeDriver: true,
      tension: 120,
      friction: 12,
      restSpeedThreshold: 0.01,
      restDisplacementThreshold: 0.1,
    }).start();
    
    // Auto hide after 3 seconds with smoother timing
    setTimeout(() => {
      Animated.timing(notificationAnimatedValue, {
        toValue: -100,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }).start(() => {
        setNotification(null);
      });
    }, 3000);
  };

  // Manual Keyboard handling - THE FIX
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );
    
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
    loadAllChatsHistory();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  const loadChatHistory = async () => {
    try {
      const chats = await getChats();
      if (chats && chats.length > 0) {
        // Use the most recent chat
        const recentChat = chats[0];
        setCurrentChat(recentChat);
        setMessages(recentChat.messages);
      } else {
        // Create a new chat if no history exists
        createNewChat();
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      // Create a new chat if loading fails
      createNewChat();
    }
  };

  const loadAllChatsHistory = async () => {
    try {
      const chats = await getChats();
      setChatHistory(chats || []);
    } catch (error) {
      console.error('Failed to load all chats history:', error);
      setChatHistory([]);
    }
  };

  const createNewChat = async () => {
    const newChat: Chat = {
      id: uuidv4(),
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCurrentChat(newChat);
    setMessages([]);
    
    // Add welcome message
    const welcomeMessage: Message = {
      id: uuidv4(),
      content: Strings.chatWelcome,
      sender: 'assistant',
      timestamp: new Date(),
      status: 'sent' as const,
    };
    
    setMessages([welcomeMessage]);
    await saveChat({...newChat, messages: [welcomeMessage]});
    
    // Update chat history
    await loadAllChatsHistory();
  };

  const handleSendMessage = async () => {
    if ((!inputText.trim() && attachments.length === 0) || isLoading) return;
    
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newMessage: Message = {
      id: uuidv4(),
      content: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };
    
    // Clear input and attachments
    setInputText('');
    setAttachments([]);
    
    // Add message to state
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    
    // Update and save chat
    if (currentChat) {
      const updatedChat: Chat = {
        ...currentChat,
        messages: updatedMessages,
        updatedAt: new Date(),
      };
      setCurrentChat(updatedChat);
      await saveChat(updatedChat);
    }
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    try {
      setIsLoading(true);
      setIsTyping(true);
      
      // Mark message as sent immediately
      const sentMessage = {...newMessage, status: 'sent' as const};
      const updatedMessagesWithSent = [...messages, sentMessage];
      setMessages(updatedMessagesWithSent);
      
      // Add a temporary "thinking" message
      const tempId = uuidv4();
      const typingMessage: Message = {
        id: tempId,
        content: 'Thinking...',
        sender: 'assistant',
        timestamp: new Date(),
        status: 'typing',
      };
      
      setMessages(prev => [...prev, typingMessage]);
      
      // Prepare messages for Llama 4 Scout with proper text + image format
      const messageHistory: import('@/services/groq').ChatMessage[] = [];
      
      for (const msg of updatedMessages) {
        if (msg.attachments && msg.attachments.length > 0) {
          // Convert image to base64 for Llama 4 Scout
          const base64Image = await convertImageToBase64(msg.attachments[0].uri);
          
          const chatMessage: import('@/services/groq').ChatMessage = {
            role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
            content: [
              {
                type: 'text',
                text: msg.content || 'What do you see in this image?',
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image,
                },
              },
            ],
          };
          messageHistory.push(chatMessage);
        } else {
          // Regular text message for Llama 4 Scout
          const chatMessage: import('@/services/groq').ChatMessage = {
            role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.content || '',
          };
          messageHistory.push(chatMessage);
        }
      }
      
      // Get AI response with current language
      const languageMapping: { [key: string]: string } = {
        'en': 'English',
        'es': 'Spanish', 
        'fr': 'French',
        'de': 'German',
        'zh': 'Chinese',
        'hi': 'Hindi',
        'ar': 'Arabic'
      };
      
      const languageName = languageMapping[currentLanguage] || 'English';
      const response = await sendChatMessage(messageHistory, languageName);
      
      // Start typing animation
      setIsTyping(true);
      startTypingAnimation(response);
      
      // Create response message
      const responseMessage: Message = {
        id: uuidv4(),
        content: response,
        sender: 'assistant',
        timestamp: new Date(),
        status: 'sent' as const,
      };
      
      // Remove typing message and add real response
      setMessages(prev => 
        prev.filter(msg => msg.id !== tempId).concat(responseMessage)
      );
      
      // Update and save chat with final messages
      if (currentChat) {
        const finalMessages = [...updatedMessages, responseMessage];
        const finalChat: Chat = {
          ...currentChat,
          messages: finalMessages,
          updatedAt: new Date(),
        };
        setCurrentChat(finalChat);
        await saveChat(finalChat);
        
        // Update chat history
        await loadAllChatsHistory();
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handlePickImage = async () => {
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newAttachment: MessageAttachment = {
        id: uuidv4(),
        uri: result.assets[0].uri,
        type: 'image',
        name: result.assets[0].fileName || 'image.jpg',
      };
      
      setAttachments([...attachments, newAttachment]);
    }
  };

  const removeAttachment = (id: string) => {
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setAttachments(attachments.filter(attachment => attachment.id !== id));
  };

  const handleCopyMessage = async (message: string) => {
    try {
      await Clipboard.setStringAsync(message);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      showNotification('Message copied to clipboard', 'success');
    } catch (error) {
      console.error('Failed to copy message:', error);
      showNotification('Failed to copy message', 'error');
    }
  };

  const handleLikeMessage = (messageId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setLikedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
        showNotification('Like removed', 'success');
      } else {
        newSet.add(messageId);
        // Remove from disliked if it was disliked
        setDislikedMessages(prevDisliked => {
          const newDislikedSet = new Set(prevDisliked);
          newDislikedSet.delete(messageId);
          return newDislikedSet;
        });
        showNotification('Message liked', 'success');
      }
      return newSet;
    });
  };

  const handleDislikeMessage = (messageId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setDislikedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
        showNotification('Dislike removed', 'success');
      } else {
        newSet.add(messageId);
        // Remove from liked if it was liked
        setLikedMessages(prevLiked => {
          const newLikedSet = new Set(prevLiked);
          newLikedSet.delete(messageId);
          return newLikedSet;
        });
        showNotification('Message disliked', 'success');
      }
      return newSet;
    });
  };

  const toggleSidebar = () => {
    const toValue = showSidebar ? -SIDEBAR_WIDTH : 0;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.spring(sidebarAnimatedValue, {
      toValue,
      useNativeDriver: true,
      tension: 150,
      friction: 15,
      restSpeedThreshold: 0.01,
      restDisplacementThreshold: 0.1,
    }).start();
    
    setShowSidebar(!showSidebar);
  };

  const selectChat = async (chat: Chat) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setCurrentChat(chat);
    setMessages(chat.messages);
    toggleSidebar(); // Close sidebar after selection
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const deleteChat = async (chatId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      // Delete from storage
      await deleteChatFromStorage(chatId);
      
      // Update local state
      const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
      setChatHistory(updatedHistory);
      
      // If current chat is deleted, create new one
      if (currentChat?.id === chatId) {
        await createNewChat();
      }
      
      showNotification('Chat deleted', 'success');
    } catch (error) {
      console.error('Failed to delete chat:', error);
      showNotification('Failed to delete chat', 'error');
    }
  };

  const formatChatPreview = (messages: Message[]) => {
    if (messages.length === 0) return 'New chat';
    const lastMessage = messages[messages.length - 1];
    const preview = lastMessage.content.substring(0, 50);
    return preview.length === 50 ? preview + '...' : preview;
  };

  const formatChatDate = (date: Date) => {
    const now = new Date();
    const chatDate = new Date(date);
    const diffInDays = Math.floor((now.getTime() - chatDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return chatDate.toLocaleDateString();
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    const isTyping = item.status === 'typing';
    const hasImage = item.attachments && item.attachments.length > 0;
    
    // Define markdown styles
    const markdownStyles = {
      text: {
        fontSize: MESSAGE_FONT_SIZE,
        lineHeight: MESSAGE_LINE_HEIGHT,
        fontFamily: Typography.fontFamily.regular,
        color: isUser ? theme.colors.text.inverse : theme.colors.text.primary,
      },
      strong: {
        fontFamily: Typography.fontFamily.bold,
        fontWeight: Typography.fontWeight.bold as '700',
      },
      em: {
        fontFamily: Typography.fontFamily.regular,
        fontStyle: 'italic' as 'italic',
      },
      heading1: {
        fontSize: MESSAGE_FONT_SIZE * 1.5,
        fontFamily: Typography.fontFamily.bold,
        marginVertical: 10,
      },
      heading2: {
        fontSize: MESSAGE_FONT_SIZE * 1.3,
        fontFamily: Typography.fontFamily.bold,
        marginVertical: 8,
      },
      heading3: {
        fontSize: MESSAGE_FONT_SIZE * 1.1,
        fontFamily: Typography.fontFamily.bold,
        marginVertical: 6,
      },
      paragraph: {
        marginVertical: 2,
      },
      list_item: {
        marginVertical: 2,
      },
    };
    
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.assistantMessageContainer
      ]}>
        {/* Display images */}
        {hasImage && (
          <View style={styles.imageContainer}>
            {item.attachments?.map(attachment => (
              <Image
                key={attachment.id}
                source={{ uri: attachment.uri }}
                style={styles.attachmentImage}
                resizeMode="cover"
              />
            ))}
          </View>
        )}
        
        {/* Message bubble */}
        {item.content.trim() !== '' && (
          <View style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble
          ]}>
            {isTyping ? (
              <View style={styles.typingContainer}>
                <Text style={[styles.messageText, { fontSize: MESSAGE_FONT_SIZE, lineHeight: MESSAGE_LINE_HEIGHT }]}>{typingText}</Text>
                <View style={styles.typingDots}>
                  <Animated.View 
                    style={[styles.dot, styles.dot1, { 
                      opacity: dot1Animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1]
                      }),
                      transform: [{
                        scale: dot1Animation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.2]
                        })
                      }]
                    }]}
                  />
                  <Animated.View 
                    style={[styles.dot, styles.dot2, { 
                      opacity: dot2Animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1]
                      }),
                      transform: [{
                        scale: dot2Animation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.2]
                        })
                      }]
                    }]}
                  />
                  <Animated.View 
                    style={[styles.dot, styles.dot3, { 
                      opacity: dot3Animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1]
                      }),
                      transform: [{
                        scale: dot3Animation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.2]
                        })
                      }]
                    }]}
                  />
                </View>
              </View>
            ) : (
              <Markdown
                style={markdownStyles}
                onLinkPress={(url) => {
                  // Handle link press if needed
                  return false;
                }}
              >
                {item.content}
              </Markdown>
            )}
          </View>
        )}
        
        {/* Action bar for non-typing messages */}
        {!isTyping && item.content.trim() !== '' && (
          <View style={styles.actionBar}>
            <View style={styles.actionButtons}>
              {!isUser && (
                <>
                  <TouchableOpacity 
                    style={[styles.actionButton, likedMessages.has(item.id) && styles.actionButtonActive]}
                    onPress={() => handleLikeMessage(item.id)}
                  >
                    <Icons.ThumbsUp 
                      size={16} 
                      color={likedMessages.has(item.id) ? theme.colors.primary[500] : theme.colors.text.secondary} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, dislikedMessages.has(item.id) && styles.actionButtonActive]}
                    onPress={() => handleDislikeMessage(item.id)}
                  >
                    <Icons.ThumbsDown 
                      size={16} 
                      color={dislikedMessages.has(item.id) ? theme.colors.error : theme.colors.text.secondary} 
                    />
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleCopyMessage(item.content)}
              >
                <Icons.Copy size={16} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.messageTime}>
              {formatMessageTime(item.timestamp, isUser)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageTime = (date: Date, isUser: boolean) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    let timeText = '';
    
    if (diffInMinutes < 1) {
      timeText = 'Just now';
    } else if (diffInMinutes < 60) {
      timeText = `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      timeText = `${diffInHours}h ago`;
    } else if (diffInDays === 1) {
      timeText = 'Yesterday';
    } else if (diffInDays < 7) {
      timeText = `${diffInDays}d ago`;
    } else {
      timeText = messageDate.toLocaleDateString();
    }
    
    const actionText = isUser ? 'Sent' : 'Received';
    return `${actionText} ${timeText}`;
  };

  return (
    <SafeAreaView 
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
      edges={['left', 'right', 'bottom']}
    >
      <StatusBar barStyle={theme.mode === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
      
      {/* Top Notification */}
      {notification && (
        <Animated.View 
          style={[
            styles.notificationContainer,
            {
              backgroundColor: notification.type === 'success' ? theme.colors.success : theme.colors.error,
              transform: [{ translateY: notificationAnimatedValue }]
            }
          ]}
        >
          <Text style={styles.notificationText}>{notification.message}</Text>
        </Animated.View>
      )}
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.sidebarToggle}
          onPress={toggleSidebar}
        >
          <Icons.Menu size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat</Text>
        <TouchableOpacity 
          style={styles.newChatButton}
          onPress={createNewChat}
        >
          <Icons.Add size={24} color={theme.colors.primary[500]} />
        </TouchableOpacity>
      </View>
      
      {/* Premium Sidebar */}
      <Animated.View 
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: sidebarAnimatedValue }]
          }
        ]}
      >
        <BlurView intensity={95} style={styles.sidebarBlur}>
          <View style={styles.sidebarContent}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Chat History</Text>
              <TouchableOpacity 
                style={styles.sidebarCloseButton}
                onPress={toggleSidebar}
              >
                <Icons.Close size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={chatHistory}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.chatHistoryList}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.chatHistoryItem,
                    currentChat?.id === item.id && styles.chatHistoryItemActive
                  ]}
                  onPress={() => selectChat(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.chatHistoryItemContent}>
                    <View style={styles.chatHistoryIcon}>
                      <Icons.Chat size={16} color={theme.colors.primary[500]} />
                    </View>
                    <View style={styles.chatHistoryText}>
                      <Text 
                        style={[
                          styles.chatHistoryPreview,
                          currentChat?.id === item.id && styles.chatHistoryPreviewActive
                        ]}
                        numberOfLines={2}
                      >
                        {formatChatPreview(item.messages)}
                      </Text>
                      <Text style={styles.chatHistoryDate}>
                        {formatChatDate(item.updatedAt)}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.deleteChatButton}
                    onPress={() => deleteChat(item.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Icons.Delete size={14} color={theme.colors.error} />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyChatHistory}>
                  <Icons.Chat size={48} color={theme.colors.text.tertiary} />
                  <Text style={styles.emptyChatHistoryText}>No chat history yet</Text>
                  <Text style={styles.emptyChatHistorySubtext}>Start a conversation to see it here</Text>
                </View>
              )}
            />
            
            <View style={styles.sidebarFooter}>
              <TouchableOpacity 
                style={styles.newChatButtonSidebar}
                onPress={() => {
                  createNewChat();
                  toggleSidebar();
                }}
              >
                <Icons.Add size={18} color={theme.colors.text.inverse} />
                <Text style={styles.newChatButtonText}>New Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Animated.View>
      
      {/* Overlay when sidebar is open */}
      {showSidebar && (
        <TouchableOpacity 
          style={styles.sidebarOverlay}
          onPress={toggleSidebar}
          activeOpacity={1}
        />
      )}
      
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.messageList, { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 80 : 80}]}
          showsVerticalScrollIndicator={false}
          onScroll={(event) => {
            const offsetY = event.nativeEvent.contentOffset.y;
            setShowScrollButton(offsetY < -50);
          }}
        />
        
        {showScrollButton && (
          <TouchableOpacity 
            style={styles.scrollToBottomButton}
            onPress={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
              setShowScrollButton(false);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Icons.ArrowDown size={20} color={theme.colors.text.inverse} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Bottom input area - properly themed */}
      <View style={[
        styles.bottomContainer, 
        { 
          backgroundColor: theme.colors.background,
          marginBottom: keyboardHeight // Adjust position based on keyboard height
        }
      ]}>
        {attachments.length > 0 && (
          <View style={styles.attachmentsPreviewContainer}>
            {attachments.map(attachment => (
              <View key={attachment.id} style={styles.attachmentPreview}>
                <Image
                  source={{ uri: attachment.uri }}
                  style={styles.attachmentPreviewImage}
                />
                <TouchableOpacity
                  style={styles.removeAttachmentButton}
                  onPress={() => removeAttachment(attachment.id)}
                >
                  <Text style={styles.removeAttachmentText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        
        <View style={styles.inputContainerWrapper}>
          <View style={styles.inputContainer}>
            <TouchableOpacity 
              style={styles.attachButton}
              onPress={handlePickImage}
            >
              <Icons.Gallery size={22} color={theme.colors.primary[600]} />
            </TouchableOpacity>
            
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder={t('chat.inputPlaceholder')}
              placeholderTextColor={theme.colors.text.secondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              onFocus={() => {
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }}
            />
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() && attachments.length === 0) ? styles.sendButtonDisabled : {}
              ]}
              onPress={handleSendMessage}
              disabled={(!inputText.trim() && attachments.length === 0) || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.colors.text.inverse} />
              ) : (
                <Icons.Send 
                  size={18} 
                  color={(!inputText.trim() && attachments.length === 0) 
                    ? (theme.mode === 'dark' ? '#ffffff' : '#000000')
                    : theme.colors.text.inverse
                  } 
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  sidebarToggle: {
    padding: Spacing.sm,
    borderRadius: 12,
    backgroundColor: theme.colors.primary[50],
  },
  headerTitle: {
    fontSize: HEADER_TITLE_FONT_SIZE,
    fontFamily: Typography.fontFamily.bold,
    color: theme.colors.text.primary,
  },
  newChatButton: {
    padding: Spacing.sm,
    borderRadius: 12,
    backgroundColor: theme.colors.primary[50],
  },
  messageList: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  messageContainer: {
    marginBottom: Spacing.lg,
    width: '100%',
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  assistantMessageContainer: {
    alignItems: 'flex-start',
  },
  imageContainer: {
    marginBottom: Spacing.sm,
  },
  attachmentImage: {
    width: ATTACHMENT_IMAGE_WIDTH,
    height: ATTACHMENT_IMAGE_HEIGHT,
    borderRadius: ATTACHMENT_IMAGE_RADIUS,
    marginBottom: Spacing.xs,
  },
  messageBubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: MESSAGE_BUBBLE_RADIUS,
  },
  userBubble: {
    backgroundColor: theme.colors.primary[500],
    borderBottomRightRadius: USER_BUBBLE_RADIUS_CORNER,
    maxWidth: '85%',
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: ASSISTANT_BUBBLE_RADIUS_CORNER,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: '100%',
  },
  messageText: {
    fontSize: MESSAGE_FONT_SIZE,
    lineHeight: MESSAGE_LINE_HEIGHT,
    fontFamily: Typography.fontFamily.regular,
  },
  userText: {
    color: theme.colors.text.inverse,
  },
  assistantText: {
    color: theme.colors.text.primary,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    marginLeft: Spacing.xs,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.text.secondary,
    marginHorizontal: 1,
  },
  dot1: {
    opacity: 0.7,
  },
  dot2: {
    opacity: 0.5,
  },
  dot3: {
    opacity: 0.3,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
    borderRadius: ACTION_BUTTON_RADIUS,
    backgroundColor: 'transparent',
    width: ACTION_BUTTON_SIZE,
    height: ACTION_BUTTON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonActive: {
    backgroundColor: theme.colors.primary[50],
  },
  messageTime: {
    fontSize: Typography.fontSize.xs,
    color: theme.colors.text.secondary,
    fontFamily: Typography.fontFamily.regular,
  },
  scrollToBottomButton: {
    position: 'absolute',
    right: 20,
    bottom: 120,
    width: SCROLL_BUTTON_SIZE,
    height: SCROLL_BUTTON_SIZE,
    borderRadius: SCROLL_BUTTON_RADIUS,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomContainer: {
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  inputContainerWrapper: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: theme.mode === 'dark' ? theme.colors.surface : 'rgba(255, 255, 255, 0.95)',
    borderRadius: INPUT_CONTAINER_RADIUS,
    borderWidth: 2,
    borderColor: theme.colors.primary[200],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: INPUT_CONTAINER_MIN_HEIGHT,
    shadowColor: theme.colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  attachButton: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
    alignSelf: 'center',
    borderRadius: ATTACH_BUTTON_RADIUS,
    backgroundColor: theme.colors.primary[50],
    width: ATTACH_BUTTON_SIZE,
    height: ATTACH_BUTTON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: INPUT_FONT_SIZE,
    fontFamily: Typography.fontFamily.regular,
    color: theme.colors.text.primary,
    maxHeight: 120,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: 20,
  },
  sendButton: {
    backgroundColor: theme.colors.primary[500],
    width: SEND_BUTTON_SIZE,
    height: SEND_BUTTON_SIZE,
    borderRadius: SEND_BUTTON_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
    alignSelf: 'center',
    shadowColor: theme.colors.primary[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.surfaceSecondary,
  },
  attachmentsPreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  attachmentPreview: {
    width: ATTACHMENT_PREVIEW_SIZE,
    height: ATTACHMENT_PREVIEW_SIZE,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
    borderRadius: ATTACHMENT_PREVIEW_RADIUS,
    overflow: 'hidden',
    position: 'relative',
  },
  attachmentPreviewImage: {
    width: '100%',
    height: '100%',
  },
  removeAttachmentButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: REMOVE_ATTACHMENT_SIZE,
    height: REMOVE_ATTACHMENT_SIZE,
    borderRadius: REMOVE_ATTACHMENT_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeAttachmentText: {
    color: theme.colors.text.inverse,
    fontSize: REMOVE_ATTACHMENT_SIZE * 0.6,
    fontWeight: 'bold',
  },
  notificationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    zIndex: 1000,
    elevation: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  notificationText: {
    color: theme.colors.text.inverse,
    fontSize: NOTIFICATION_FONT_SIZE,
    fontFamily: Typography.fontFamily.medium,
    textAlign: 'center',
  },
  // Sidebar Styles
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    zIndex: 999,
    elevation: 999,
  },
  sidebarBlur: {
    flex: 1,
    backgroundColor: theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
  },
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 998,
    elevation: 998,
  },
  sidebarContent: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sidebarTitle: {
    fontSize: SIDEBAR_TITLE_FONT_SIZE,
    fontFamily: Typography.fontFamily.bold,
    color: theme.colors.text.primary,
  },
  sidebarCloseButton: {
    padding: Spacing.sm,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceSecondary,
  },
  chatHistoryList: {
    paddingVertical: Spacing.md,
    flexGrow: 1,
  },
  chatHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  chatHistoryItemActive: {
    backgroundColor: theme.colors.primary[50],
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
  },
  chatHistoryItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatHistoryIcon: {
    width: CHAT_HISTORY_ICON_SIZE,
    height: CHAT_HISTORY_ICON_SIZE,
    borderRadius: CHAT_HISTORY_ICON_RADIUS,
    backgroundColor: theme.colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  chatHistoryText: {
    flex: 1,
  },
  chatHistoryPreview: {
    fontSize: CHAT_HISTORY_PREVIEW_FONT_SIZE,
    fontFamily: Typography.fontFamily.medium,
    color: theme.colors.text.primary,
    marginBottom: Spacing.xs,
  },
  chatHistoryPreviewActive: {
    color: theme.colors.primary[600],
  },
  chatHistoryDate: {
    fontSize: CHAT_HISTORY_DATE_FONT_SIZE,
    fontFamily: Typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },
  deleteChatButton: {
    padding: Spacing.xs,
    borderRadius: 6,
    backgroundColor: theme.colors.error + '10',
  },
  emptyChatHistory: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl * 2,
  },
  emptyChatHistoryText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: theme.colors.text.tertiary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  emptyChatHistorySubtext: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  sidebarFooter: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  newChatButtonSidebar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[500],
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 16,
    shadowColor: theme.colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  newChatButtonText: {
    fontSize: NEW_CHAT_BUTTON_FONT_SIZE,
    fontFamily: Typography.fontFamily.bold,
    color: theme.colors.text.inverse,
    marginLeft: Spacing.sm,
  },
});