import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  MessageBubble,
  BookingRequestCard,
} from "../../../components/ChatComponents";
import colors from "../../../constants/color";
import messageService from "../../../services/messageService";
import uploadImageService from "../../../services/uploadImageService";
import { useMessagingState } from "../../../context/messagingStateContext";
import { useTranslation } from "../../../hooks/useTranslation";
import LoadingIndicator from "../../../components/LoadingIndicator";
import {
  CLIENT_METHODS,
  HUB_METHODS,
} from "../../../services/signalR/Message/constants/hubMethods";
import { LIFECYCLE_METHODS } from "../../../services/signalR/Message/constants/lifecycleMethods";
import { fetchUserFromStorage } from "../../../lib";

export default function MessageDetailScreen({ route, navigation }) {
  const { t } = useTranslation();
  const {
    conversationId,
    conversationTitle,
    conversationImg,
    members,
    userPresences: initialUserPresences,
  } = route.params || {};

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [typingStatus, setTypingStatus] = useState(null);
  const [processingBookingRequestId, setProcessingBookingRequestId] =
    useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageActions, setShowMessageActions] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [messageLayout, setMessageLayout] = useState(null);
  const [showBookingRequestModal, setShowBookingRequestModal] = useState(false);
  const [editingBookingRequest, setEditingBookingRequest] = useState(null);
  const [bookingFormData, setBookingFormData] = useState(() => {
    const now = new Date();

    return {
      bookingName: "",
      bookingDate: now.toISOString().split("T")[0],
      startTime: "",
      endTime: "",
    };
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [userPresences, setUserPresences] = useState(
    initialUserPresences || {}
  );

  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const tempMessageTimeoutRef = useRef(null);
  const conversationIdRef = useRef(conversationId);
  const currentUserIdRef = useRef(currentUserId);

  // Get messaging state context
  const { messagingService, connectionStatus, setBypassAppStateChange } =
    useMessagingState();

  const isConnected = connectionStatus === "connected";

  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  const [customerPurchased, setCustomerPurchased] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(60); // Default to 60 minutes
  useEffect(() => {
    const fetchCustomerPurchased = async () => {
      const response = await messageService.checkCustomerPurchased({
        ptId: members.find((member) => member.role === "FreelancePT")?.userId,
      });
      setCustomerPurchased(response.data);
    };
    fetchCustomerPurchased();
  }, [members]);

  // Fetch session duration when booking modal opens
  useEffect(() => {
    const fetchSessionDuration = async () => {
      if (!showBookingRequestModal) return;

      const ptId = members.find(
        (member) => member.role === "FreelancePT"
      )?.userId;
      const userId = members.find(
        (member) => member.role === "Customer"
      )?.userId;

      try {
        const responseCheck = await messageService.checkCustomerPurchased(
          currentUserRole === "Customer" ? { ptId } : { customerId: userId }
        );

        if (responseCheck && responseCheck.data) {
          const duration =
            responseCheck.data?.duration || responseCheck.duration || 60;
          const durationMinutes = typeof duration === "number" ? duration : 60;
          setSessionDuration(durationMinutes);
        }
      } catch (error) {
        console.error("Error fetching session duration:", error);
        // Keep default 60 minutes on error
      }
    };

    fetchSessionDuration();
  }, [showBookingRequestModal, members, currentUserRole]);
  // Update refs when values change
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  // Clear messages when conversationId changes (e.g., after user switch)
  useEffect(() => {
    if (conversationId) {
      console.log(
        "MessageDetailScreen: ConversationId changed, clearing messages",
        conversationId
      );
      setMessages([]);
      setPageNumber(1);
      setHasMore(true);
    }
  }, [conversationId]);

  useEffect(() => {
    // Fetch current user ID from your auth context or service
    const fetchCurrentUser = async () => {
      try {
        const userData = await fetchUserFromStorage();
        if (userData) {
          setCurrentUserId(userData.id);
          setCurrentUserRole(userData.role);
          currentUserIdRef.current = userData.id;
        }
      } catch (error) {
        console.error("Error fetching current user", error);
      }
    };
    fetchCurrentUser();
  }, []);

  // Join conversation on mount and when conversationId changes
  useEffect(() => {
    const currentConvId = conversationIdRef.current;
    if (currentConvId && isConnected && messagingService) {
      const normalizedConvId = currentConvId.toString();
      messagingService.addToGroup(normalizedConvId);
    }

    // Leave conversation on unmount or when conversationId changes
    return () => {
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing indicator if active
      const convIdToLeave = conversationIdRef.current;
      if (convIdToLeave && isConnected && messagingService) {
        const normalizedConvId = convIdToLeave.toString();
        messagingService
          .invokeHubMethod(HUB_METHODS.USER_TYPING, {
            conversationId: normalizedConvId,
            isTyping: false,
          })
          .catch((error) => {
            console.error(
              "MessageDetailScreen: Error stopping typing on unmount",
              error
            );
          });
        messagingService.removeFromGroup(normalizedConvId);
      }
    };
  }, [conversationId, isConnected, messagingService]);

  // Subscribe to real-time message events
  useEffect(() => {
    if (!conversationId || !messagingService) {
      console.log(
        "MessageDetailScreen: Waiting for conversationId or messagingService"
      );
      return;
    }

    // Handle new message received
    const handleMessageReceived = (message) => {
      console.log("MessageDetailScreen: New message received", message, {
        messageConvId: message.conversationId,
        currentConvId: conversationIdRef.current,
        currentUserId: currentUserIdRef.current,
      });
      const messageConvId = message.conversationId?.toString();
      const currentConvId = conversationIdRef.current?.toString();

      // Only add message if it belongs to this conversation
      if (messageConvId && currentConvId && messageConvId === currentConvId) {
        setMessages((prev) => {
          // Check if message already exists (prevent duplicates)
          const exists = prev.some((m) => {
            const msgId = m.id?.toString();
            const newMsgId = message.id?.toString();
            return msgId === newMsgId;
          });

          if (exists) {
            return prev;
          }

          // Check if this is replacing a temp message
          // Look for temp messages with matching content and sender
          const tempMessageIndex = prev.findIndex(
            (m) =>
              m.id?.startsWith("temp_") &&
              m.senderId === message.senderId &&
              m.content === message.content &&
              Math.abs(new Date(m.createdAt) - new Date(message.createdAt)) <
                5000 // Within 5 seconds
          );

          if (tempMessageIndex !== -1) {
            // Clear timeout since we got the real message
            if (tempMessageTimeoutRef.current) {
              clearTimeout(tempMessageTimeoutRef.current);
              tempMessageTimeoutRef.current = null;
            }
            // Replace temp message with real message
            const newMessages = [...prev];
            newMessages[tempMessageIndex] = {
              ...message,
              isSending: false, // Remove sending flag
            };
            return newMessages;
          }

          // Add new message at the beginning (since list is inverted)
          return [{ ...message, isSending: false }, ...prev];
        });

        // Mark as read if from other user
        const currentUserIdValue = currentUserIdRef.current;
        if (message.senderId !== currentUserIdValue) {
          markMessagesAsRead([message.id]).catch((error) => {
            console.error("Error marking message as read:", error);
            // Silently fail - not critical
          });
        }
      } else {
        console.warn("MessageDetailScreen: Message conversationId mismatch", {
          messageConvId,
          currentConvId,
          messageId: message.id,
          messageSenderId: message.senderId,
          currentUserId: currentUserIdRef.current,
        });
      }
    };

    // Handle message updated
    const handleMessageUpdated = (updatedMessage) => {
      // Normalize conversationId for comparison
      const messageConvId = updatedMessage.conversationId?.toString();
      const currentConvId = conversationIdRef.current?.toString();

      if (messageConvId && currentConvId && messageConvId === currentConvId) {
        const isDeleted =
          updatedMessage.status === "Deleted" || updatedMessage.isDeleted;
        setMessages((prev) =>
          prev.map((msg) => {
            // Match by ID (handle both regular and temp message IDs)
            if (
              msg.id === updatedMessage.id ||
              (msg.id?.startsWith("temp_") &&
                updatedMessage.id &&
                msg.id.includes(updatedMessage.id))
            ) {
              return {
                ...msg,
                id: updatedMessage.id || msg.id, // Ensure we use the real ID
                content: isDeleted
                  ? "This message was deleted"
                  : updatedMessage.newContent ||
                    updatedMessage.content ||
                    msg.content,
                isDeleted: isDeleted,
                status: updatedMessage.status || msg.status,
                updatedAt: updatedMessage.updatedAt || new Date().toISOString(),
                bookingRequest:
                  updatedMessage.bookingRequest || msg.bookingRequest,
              };
            }
            return msg;
          })
        );
      }
    };

    // Handle typing indicator
    const handleTyping = (typingData) => {
      // Normalize conversationId for comparison
      const typingConvId = typingData.conversationId?.toString();
      const currentConvId = conversationIdRef.current?.toString();
      const currentUserIdValue = currentUserIdRef.current;

      if (
        typingConvId &&
        currentConvId &&
        typingConvId === currentConvId &&
        typingData.userId !== currentUserIdValue
      ) {
        setTypingStatus(typingData);

        // Clear typing status after 3 seconds of inactivity
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        if (typingData.isTyping) {
          typingTimeoutRef.current = setTimeout(() => {
            setTypingStatus(null);
          }, 3000);
        }
      }
    };

    // Handle message status update
    const handleStatusUpdate = (statusUpdate) => {
      // Normalize conversationId for comparison
      const statusConvId = statusUpdate.conversationId?.toString();
      const currentConvId = conversationIdRef.current?.toString();

      if (statusConvId && currentConvId && statusConvId === currentConvId) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (statusUpdate.messageIds?.includes(msg.id)) {
              return {
                ...msg,
                deliveryStatus: statusUpdate.status,
                isRead: true,
              };
            }
            return msg;
          })
        );
      }
    };

    // Handle reaction received
    const handleReactionReceived = (reactionData) => {
      // Only process reactions for messages in current conversation
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === reactionData.messageId
            ? { ...msg, reaction: reactionData.reaction }
            : msg
        )
      );
    };

    // Handle reaction removed
    const handleReactionRemoved = (reactionData) => {
      // Only process reactions for messages in current conversation
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === reactionData.messageId ? { ...msg, reaction: null } : msg
        )
      );
    };

    // Handle reconnecting
    const handleReconnecting = () => {
      fetchMessages(1, true);
    };

    // Handle user presence update
    const handleUserPresenceUpdate = (presenceData) => {
      // Validate presence data
      if (!presenceData || !presenceData.userId) {
        console.warn(
          "MessageDetailScreen: Invalid presence data received",
          presenceData
        );
        return;
      }

      // Update user presence state
      setUserPresences((prev) => ({
        ...prev,
        [presenceData.userId]: presenceData.isOnline === true,
      }));
    };

    // Subscribe to events using the functional API
    messagingService.onEvent(
      CLIENT_METHODS.MESSAGE_RECEIVED,
      handleMessageReceived
    );
    messagingService.onEvent(
      CLIENT_METHODS.MESSAGE_UPDATED,
      handleMessageUpdated
    );
    messagingService.onEvent(CLIENT_METHODS.USER_TYPING, handleTyping);
    messagingService.onEvent(
      CLIENT_METHODS.UPDATE_MESSAGE_STATUS,
      handleStatusUpdate
    );
    messagingService.onEvent(
      CLIENT_METHODS.REACTION_RECEIVED,
      handleReactionReceived
    );
    messagingService.onEvent(
      CLIENT_METHODS.REACTION_REMOVED,
      handleReactionRemoved
    );
    messagingService.onEvent(
      CLIENT_METHODS.USER_PRESENCE_UPDATE,
      handleUserPresenceUpdate
    );
    messagingService.onEvent(
      LIFECYCLE_METHODS.ON_RECONNECTING,
      handleReconnecting
    );

    // Cleanup subscriptions
    return () => {
      messagingService.offEvent(
        CLIENT_METHODS.MESSAGE_RECEIVED,
        handleMessageReceived
      );
      messagingService.offEvent(
        CLIENT_METHODS.MESSAGE_UPDATED,
        handleMessageUpdated
      );
      messagingService.offEvent(CLIENT_METHODS.USER_TYPING, handleTyping);
      messagingService.offEvent(
        CLIENT_METHODS.UPDATE_MESSAGE_STATUS,
        handleStatusUpdate
      );
      messagingService.offEvent(
        CLIENT_METHODS.REACTION_RECEIVED,
        handleReactionReceived
      );
      messagingService.offEvent(
        CLIENT_METHODS.REACTION_REMOVED,
        handleReactionRemoved
      );
      messagingService.offEvent(
        CLIENT_METHODS.USER_PRESENCE_UPDATE,
        handleUserPresenceUpdate
      );
      messagingService.offEvent(
        LIFECYCLE_METHODS.ON_RECONNECTING,
        handleReconnecting
      );

      // Clear typing timeout on cleanup
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Clear temp message timeout on cleanup
      if (tempMessageTimeoutRef.current) {
        clearTimeout(tempMessageTimeoutRef.current);
      }
    };
  }, [messagingService, markMessagesAsRead]); // Remove conversationId and currentUserId from deps to avoid stale closures

  // Fetch messages on mount
  useEffect(() => {
    if (conversationId) {
      fetchMessages(1, true);
      markMessagesAsRead();
    }
  }, [conversationId]);

  // Fetch messages from API
  const fetchMessages = useCallback(
    async (page = 1, isInitial = false) => {
      if ((isInitial ? loading : isLoadingMore) || !conversationId) return;

      try {
        if (isInitial) {
          setLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const params = {
          page: page,
          size: 20,
        };

        console.log("Fetching messages with params:", params);
        const response = await messageService.getMessages(
          conversationId,
          params
        );
        const allMessages = response.data || [];
        // Replace content for deleted messages
        const newMessages = allMessages.map((msg) => {
          if (msg.isDeleted) {
            return {
              ...msg,
              content: "This message was deleted",
            };
          }
          return msg;
        });

        if (isInitial) {
          setMessages(newMessages);
          setPageNumber(1);
        } else {
          // Filter out duplicates by ID and append to end (older messages)
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const uniqueNewMessages = newMessages.filter(
              (m) => !existingIds.has(m.id)
            );
            console.log("Adding", uniqueNewMessages.length, "unique messages");
            return [...prev, ...uniqueNewMessages];
          });
          // Update page number after successful load more
          setPageNumber(page);
        }

        setHasMore(newMessages.length >= 20);
      } catch (error) {
        console.error("Error fetching messages:", error);
        // Revert page number on error for load more operations
        if (!isInitial && page > 1) {
          setPageNumber(page - 1);
        }

        // Show error message only for initial load to avoid spamming user
        if (isInitial) {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Failed to load messages. Please check your connection and try again.";
          Alert.alert("Error", errorMessage, [
            { text: "OK", style: "cancel" },
            {
              text: "Retry",
              onPress: () => fetchMessages(1, true),
            },
          ]);
        }
      } finally {
        if (isInitial) {
          setLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [conversationId, loading, isLoadingMore]
  );

  // Mark messages as read
  const markMessagesAsRead = useCallback(
    async (messageIds = null) => {
      if (!conversationId) return;

      try {
        // Use provided IDs or collect from current messages
        const idsToMark =
          messageIds ||
          messages
            .filter((m) => m.id && m.senderId !== currentUserId && !m.isRead)
            .map((m) => m.id);

        if (idsToMark.length > 0) {
          await messageService.markAsRead({
            conversationId,
            messageIds: idsToMark,
          });
        }
      } catch (error) {
        console.error("Error marking messages as read:", error);
        // Silently fail - this is not critical for user experience
        // but log for debugging
      }
    },
    [conversationId, messages, currentUserId]
  );

  // Handle load more messages
  const handleLoadMore = useCallback(() => {
    if (!loading && !isLoadingMore && hasMore && conversationId) {
      const nextPage = pageNumber + 1;
      console.log("Loading more messages, page:", nextPage);
      // Update page number immediately to prevent race conditions
      setPageNumber(nextPage);
      fetchMessages(nextPage, false);
    }
  }, [
    loading,
    isLoadingMore,
    hasMore,
    pageNumber,
    fetchMessages,
    conversationId,
  ]);

  // Handle typing indicator with debounce
  const handleTyping = useCallback(
    (text) => {
      setInputText(text);

      const currentConvId = conversationIdRef.current;
      if (isConnected && currentConvId && messagingService) {
        const normalizedConvId = currentConvId.toString();
        // Clear previous timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Send typing indicator when user starts typing
        if (text.length > 0) {
          messagingService
            .invokeHubMethod(HUB_METHODS.USER_TYPING, {
              conversationId: normalizedConvId,
              isTyping: true,
            })
            .catch((error) => {
              console.error(
                "MessageDetailScreen: Error sending typing indicator",
                error
              );
            });

          // Auto-stop typing after 3 seconds
          typingTimeoutRef.current = setTimeout(() => {
            if (messagingService && isConnected) {
              messagingService
                .invokeHubMethod(HUB_METHODS.USER_TYPING, {
                  conversationId: normalizedConvId,
                  isTyping: false,
                })
                .catch((error) => {
                  console.error(
                    "MessageDetailScreen: Error stopping typing indicator",
                    error
                  );
                });
            }
          }, 3000);
        } else {
          messagingService
            .invokeHubMethod(HUB_METHODS.USER_TYPING, {
              conversationId: normalizedConvId,
              isTyping: false,
            })
            .catch((error) => {
              console.error(
                "MessageDetailScreen: Error sending typing indicator",
                error
              );
            });
        }
      }
    },
    [isConnected, messagingService]
  );

  // Handle image picker with temporary message approach
  const handlePickImage = useCallback(async () => {
    let tempMessageId = null;
    try {
      // Set bypass flag before opening picker
      if (setBypassAppStateChange) {
        setBypassAppStateChange(true);
      }

      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Permission to access gallery is required to send images.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => {
                if (Platform.OS === "ios") {
                  Linking.openURL("app-settings:");
                } else {
                  Linking.openSettings();
                }
              },
            },
          ]
        );
        if (setBypassAppStateChange) {
          setBypassAppStateChange(false);
        }
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      // Reset bypass flag after picker closes
      if (setBypassAppStateChange) {
        setBypassAppStateChange(false);
      }

      if (result.canceled || !result.assets || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];
      console.log("Picked image:", {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize,
      });

      // Create temporary message ID
      tempMessageId = `temp_${Date.now()}`;

      // Add temporary message to show immediately with loading state
      const tempMessage = {
        id: tempMessageId,
        conversationId: conversationId,
        senderId: currentUserId,
        senderName: "You",
        content: asset.uri, // Local URI for display
        mediaType: "Image",
        mediaUrl: asset.uri, // Use local URI initially
        messageType: "User",
        createdAt: new Date().toISOString(),
        isUploading: true, // Flag to show loading indicator
      };

      setMessages((prev) => [tempMessage, ...prev]);

      // Build FormData for upload
      const fileName =
        asset.fileName ||
        asset.uri.split("/").pop() ||
        `upload_${Date.now()}.jpg`;
      const fileExtension = fileName.split(".").pop()?.toLowerCase() || "jpg";

      let mimeType = asset.mimeType || "image/jpeg";
      if (!mimeType) {
        if (fileExtension === "png") {
          mimeType = "image/png";
        } else if (fileExtension === "jpg" || fileExtension === "jpeg") {
          mimeType = "image/jpeg";
        } else if (fileExtension === "gif") {
          mimeType = "image/gif";
        } else if (fileExtension === "webp") {
          mimeType = "image/webp";
        }
      }

      const formData = new FormData();
      formData.append("file", {
        uri:
          Platform.OS === "ios" ? asset.uri.replace("file://", "") : asset.uri,
        name: fileName,
        type: mimeType,
      });

      // Upload image
      const uploadResponse = await uploadImageService.uploadImage(formData);
      console.log("Upload response:", uploadResponse);

      if (!uploadResponse || !uploadResponse.data) {
        throw new Error("Failed to upload image: Invalid response from server");
      }

      const uploadedUrl = uploadResponse.data;

      // Send message with uploaded URL
      const messageData = {
        conversationId,
        content: uploadedUrl, // Use uploaded URL as content
        mediaType: "Image",
        mediaUrl: uploadedUrl, // Also set mediaUrl
        replyToMessageId: replyingTo?.id || null,
      };

      await messageService.sendMessage(messageData);

      // Remove temporary message - real message will come via SignalR
      setMessages((prev) => prev.filter((m) => m.id !== tempMessageId));

      console.log("Image sent successfully");
    } catch (error) {
      console.error("Error sending image:", error);

      // Remove temporary message on error
      if (tempMessageId) {
        setMessages((prev) => prev.filter((m) => m.id !== tempMessageId));
      }

      // Reset bypass flag on error
      if (setBypassAppStateChange) {
        setBypassAppStateChange(false);
      }

      // Safely extract error message with fallbacks
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send image. Please try again.";

      Alert.alert("Error", errorMessage, [{ text: "OK", style: "cancel" }]);
    }
  }, [conversationId, currentUserId, replyingTo, setBypassAppStateChange]);

  // Handle send message
  const handleSend = useCallback(async () => {
    const currentConvId = conversationIdRef.current;
    if (!inputText.trim() || sending || !currentConvId) return;

    const messageContent = inputText.trim();
    const normalizedConvId = currentConvId.toString();

    // Check if editing
    if (editingMessage) {
      try {
        setSending(true);
        setInputText("");
        const messageIdToUpdate = editingMessage.id;
        setEditingMessage(null);

        await messageService.updateMessage({
          messageId: messageIdToUpdate,
          conversationId: normalizedConvId,
          newContent: messageContent,
        });

        // Update local state in MessageDetailScreen
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageIdToUpdate
              ? { ...msg, content: messageContent, status: "Edited" }
              : msg
          )
        );

        // Manually trigger MESSAGE_UPDATED event for current user to update MessageScreen
        if (messagingService) {
          const updatedMessageEvent = {
            id: messageIdToUpdate,
            conversationId: normalizedConvId,
            content: messageContent,
            newContent: messageContent,
            status: "Edited",
          };
          messagingService.triggerCallback(
            CLIENT_METHODS.MESSAGE_UPDATED,
            updatedMessageEvent
          );
        }
      } catch (error) {
        console.error("Error editing message:", error);
        setInputText(messageContent);
        setEditingMessage(editingMessage);
        Alert.alert("Error", "Failed to edit message. Please try again.");
      } finally {
        setSending(false);
      }
      return;
    }

    const replyData = replyingTo
      ? {
          replyToMessageId: replyingTo.id,
          replyToMessageContent: replyingTo.content,
          replyToMessageMediaType: replyingTo.mediaType,
        }
      : {};

    // Stop typing indicator
    if (isConnected && messagingService && typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      messagingService
        .invokeHubMethod(HUB_METHODS.USER_TYPING, {
          conversationId: normalizedConvId,
          isTyping: false,
        })
        .catch((error) => {
          console.error(
            "MessageDetailScreen: Error stopping typing on send",
            error
          );
        });
    }

    // Clear input immediately for better UX
    setInputText("");
    setReplyingTo(null);

    // Create temporary message ID for optimistic update
    const tempMessageId = `temp_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Add temporary message immediately for optimistic UI update
    const tempMessage = {
      id: tempMessageId,
      conversationId: normalizedConvId,
      senderId: currentUserIdRef.current,
      senderName: "You",
      content: messageContent,
      mediaType: "Text",
      messageType: "User",
      createdAt: new Date().toISOString(),
      isSending: true, // Flag to show sending state
      replyToMessageId: replyData.replyToMessageId || null,
      replyToMessageContent: replyData.replyToMessageContent || null,
      replyToMessageMediaType: replyData.replyToMessageMediaType || null,
    };

    setMessages((prev) => {
      // Check if temp message already exists (shouldn't happen, but safety check)
      if (prev.some((m) => m.id === tempMessageId)) {
        return prev;
      }
      return [tempMessage, ...prev];
    });

    try {
      setSending(true);

      const messageData = {
        conversationId,
        content: messageContent,
        mediaType: "Text",
        ...replyData,
      };

      const sentMessage = await messageService.sendMessage(messageData);

      // Extract the actual message from response (handle different response structures)
      let actualMessage = null;
      if (sentMessage?.data) {
        actualMessage = sentMessage.data;
      } else if (sentMessage?.id) {
        actualMessage = sentMessage;
      } else if (sentMessage) {
        actualMessage = sentMessage;
      }

      // Replace temp message with real message when SignalR delivers it
      // For now, update the temp message with real data if we have it
      if (actualMessage && actualMessage.id) {
        setMessages((prev) => {
          // Check if real message already arrived via SignalR
          const realMessageExists = prev.some((m) => m.id === actualMessage.id);
          if (realMessageExists) {
            // Remove temp message, real one already exists
            return prev.filter((m) => m.id !== tempMessageId);
          }

          // Replace temp message with real message
          return prev.map((msg) => {
            if (msg.id === tempMessageId) {
              return {
                ...actualMessage,
                isSending: false,
              };
            }
            return msg;
          });
        });
      } else {
        // If we don't have the message data, just mark temp as not sending
        // SignalR will deliver it and replace the temp message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessageId ? { ...msg, isSending: false } : msg
          )
        );

        // Set a timeout to remove temp message if SignalR doesn't deliver within 10 seconds
        // This handles cases where SignalR connection is lost or delayed
        if (tempMessageTimeoutRef.current) {
          clearTimeout(tempMessageTimeoutRef.current);
        }
        tempMessageTimeoutRef.current = setTimeout(() => {
          setMessages((prev) => {
            const stillExists = prev.some((m) => m.id === tempMessageId);
            if (stillExists) {
              console.warn(
                "MessageDetailScreen: Temp message not replaced by SignalR, removing after timeout"
              );
              return prev.filter((m) => m.id !== tempMessageId);
            }
            return prev;
          });
        }, 10000); // 10 seconds timeout
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempMessageId));

      // Restore input on error
      setInputText(messageContent);
      if (replyData.replyToMessageId) {
        setReplyingTo(replyingTo);
      }

      // Show user-friendly error message
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send message. Please check your connection and try again.";
      Alert.alert("Error", errorMessage, [{ text: "OK", style: "cancel" }]);
    } finally {
      setSending(false);
    }
  }, [
    inputText,
    replyingTo,
    sending,
    editingMessage,
    isConnected,
    messagingService,
  ]);

  // Handle booking action
  const handleBookingAction = useCallback(
    async (bookingRequestId, action) => {
      console.log(`Booking ${action}:`, bookingRequestId);

      if (processingBookingRequestId) return;

      try {
        setProcessingBookingRequestId(bookingRequestId);

        if (action === "approve") {
          await messageService.approveBookingRequest(bookingRequestId);
        } else if (action === "reject") {
          await messageService.rejectBookingRequest(bookingRequestId);
        }

        // Update booking status locally - will also be updated via SignalR
        setMessages((prev) =>
          prev.map((msg) => {
            if (
              msg.bookingRequest?.bookingRequestId === bookingRequestId ||
              msg.bookingRequest?.id === bookingRequestId
            ) {
              return {
                ...msg,
                bookingRequest: {
                  ...msg.bookingRequest,
                  requestStatus: action === "approve" ? "Approved" : "Rejected",
                },
              };
            }
            return msg;
          })
        );
      } catch (error) {
        console.error(`Error ${action}ing booking request:`, error);
      } finally {
        setProcessingBookingRequestId(null);
      }
    },
    [processingBookingRequestId]
  );

  // Handle image press
  const handleImagePress = useCallback((imageUrl) => {
    setSelectedImage(imageUrl);
  }, []);

  // Handle message long press
  const handleMessageLongPress = useCallback((message, layout) => {
    if (message.isUploading || message.isDeleted) return;
    setSelectedMessage(message);
    setMessageLayout(layout);
    setShowMessageActions(true);
  }, []);

  // Handle edit message
  const handleEditMessage = useCallback(() => {
    if (!selectedMessage) return;
    setEditingMessage(selectedMessage);
    setInputText(selectedMessage.content);
    setShowMessageActions(false);
    setSelectedMessage(null);
  }, [selectedMessage]);

  // Handle delete message
  const handleDeleteMessage = useCallback(async () => {
    if (!selectedMessage) return;

    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setShowMessageActions(false);
              const messageId = selectedMessage.id;
              setSelectedMessage(null);

              await messageService.deleteMessage(messageId);

              // Update local state immediately for current user
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === messageId
                    ? {
                        ...msg,
                        content: "This message was deleted",
                        isDeleted: true,
                        status: "Deleted",
                      }
                    : msg
                )
              );
            } catch (error) {
              console.error("Error deleting message:", error);
              Alert.alert(
                "Error",
                "Failed to delete message. Please try again."
              );
            }
          },
        },
      ]
    );
  }, [selectedMessage]);

  // Handle react to message
  const handleReactMessage = useCallback(
    (reaction) => {
      if (!selectedMessage) return;

      const reactToMessage = async () => {
        const removeReaction = selectedMessage.reaction === reaction;

        try {
          const removeReaction = selectedMessage.reaction === reaction;

          const payload = {
            messageId: selectedMessage.id,
            conversationId: conversationId,
            reaction: reaction,
            removeReaction: removeReaction,
          };
          console.log("Reacting to message:", payload);
          const response = await messageService.reactMessage(payload);
          console.log("Reaction response:", response);
          // Update local state
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === selectedMessage.id
                ? { ...msg, reaction: removeReaction ? null : reaction }
                : msg
            )
          );

          // Close modals after reacting
          setShowReactionPicker(false);
          setShowMessageActions(false);
          setSelectedMessage(null);
        } catch (error) {
          console.error("Error reacting to message:", error);
          Alert.alert("Error", "Failed to react to message. Please try again.");
        }
      };

      reactToMessage();
    },
    [selectedMessage, conversationId]
  );

  // Handle reply to message
  const handleReplyToMessage = useCallback(() => {
    if (!selectedMessage) return;
    setReplyingTo(selectedMessage);
    setShowMessageActions(false);
    setSelectedMessage(null);
  }, [selectedMessage]);

  // Handle edit booking request (placeholder - not fully implemented)
  const handleEditBookingRequest = useCallback(async () => {
    // TODO: Implement booking request editing functionality
    Alert.alert(
      "Not Implemented",
      "Booking request editing is not yet available.",
      [{ text: "OK", style: "cancel" }]
    );
  }, []);

  // Handle send booking request
  const handleSendBookingRequest = useCallback(async () => {
    if (!bookingFormData.bookingName.trim()) {
      Alert.alert("Error", "Please enter a booking name");
      return;
    }

    try {
      setSending(true);
      const ptId = members.find(
        (member) => member.role === "FreelancePT"
      )?.userId;
      const userId = members.find(
        (member) => member.role === "Customer"
      )?.userId;

      // Check customer purchased first to get duration
      const responseCheck = await messageService.checkCustomerPurchased(
        currentUserRole === "Customer" ? { ptId } : { customerId: userId }
      );
      console.log("response check:", responseCheck);
      if (!responseCheck || !responseCheck.data) {
        Alert.alert(
          "Error",
          "You need to purchase a session with the PT before sending a booking request."
        );
        setSending(false);
        return;
      }

      // Extract duration and customerPurchasedId from response
      // Handle different response structures: data could be ID or object with id/duration
      const customerPurchasedId =
        typeof responseCheck.data === "object" && responseCheck.data?.id
          ? responseCheck.data.id
          : responseCheck.data;
      const duration = responseCheck.data?.sessionDurationInMinutes || 60; // fallback to 60 minutes if not provided
      const durationMinutes = typeof duration === "number" ? duration : 60;

      // Validate date is not in the past
      const selectedDate = new Date(bookingFormData.bookingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        Alert.alert("Invalid Date", "Booking date cannot be in the past.");
        setSending(false);
        return;
      }

      // Validate time if booking is today
      const isToday =
        bookingFormData.bookingDate === new Date().toISOString().split("T")[0];
      if (isToday) {
        if (!bookingFormData.startTime) {
          Alert.alert("Error", "Please select a start time.");
          setSending(false);
          return;
        }
        const [startHours, startMinutes] = bookingFormData.startTime
          .split(":")
          .map(Number);
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();

        const startTotalMinutes = startHours * 60 + startMinutes;
        const currentTotalMinutes = currentHours * 60 + currentMinutes;

        if (startTotalMinutes <= currentTotalMinutes) {
          Alert.alert("Invalid Time", "Start time must be in the future.");
          setSending(false);
          return;
        }
      }

      // Validate end time is at least duration minutes after start time
      if (!bookingFormData.startTime || !bookingFormData.endTime) {
        Alert.alert("Error", "Please select both start and end times.");
        setSending(false);
        return;
      }
      const [startHours, startMinutes] = bookingFormData.startTime
        .split(":")
        .map(Number);
      const [endHours, endMinutes] = bookingFormData.endTime
        .split(":")
        .map(Number);

      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;

      if (endTotalMinutes < startTotalMinutes + durationMinutes) {
        Alert.alert(
          "Invalid Time",
          `End time must be at least ${durationMinutes} minutes after start time.`
        );
        setSending(false);
        return;
      }

      setShowBookingRequestModal(false);

      const messageData = {
        conversationId,
        content: `Booking request: ${bookingFormData.bookingName}`,
        mediaType: "BookingRequest",
        customerPurchasedId: customerPurchasedId,
        createBookingRequest: {
          bookingName: bookingFormData.bookingName,
          bookingDate: bookingFormData.bookingDate,
          ptFreelanceStartTime: bookingFormData.startTime,
          ptFreelanceEndTime: bookingFormData.endTime,
        },
      };
      const response = await messageService.sendMessage(messageData);
      console.log("Booking request sent:", response);

      // Reset form
      const now = new Date();

      setBookingFormData({
        bookingName: "",
        bookingDate: now.toISOString().split("T")[0],
        startTime: "",
        endTime: "",
      });
    } catch (error) {
      console.error("Error sending booking request:", error);

      // Show detailed error message
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send booking request. Please check your connection and try again.";
      Alert.alert("Error", errorMessage, [{ text: "OK", style: "cancel" }]);
    } finally {
      setSending(false);
    }
  }, [
    bookingFormData,
    conversationId,
    currentUserId,
    currentUserRole,
    members,
  ]);

  // Render message item
  const renderMessage = useCallback(
    ({ item }) => {
      const isCurrentUser = item.senderId === currentUserId;

      // Render booking request card
      if (item.mediaType === "BookingRequest" && item.bookingRequest) {
        return (
          <BookingRequestCard
            bookingRequest={item.bookingRequest}
            isCurrentUser={isCurrentUser}
            currentUserRole={currentUserRole}
            onAction={handleBookingAction}
            // onEdit={(bookingRequest) => {
            //   setEditingBookingRequest(bookingRequest);

            //   // Parse the existing data safely
            //   const now = new Date();
            //   const currentHour = now.getHours();
            //   const currentMinute = now.getMinutes();

            //   let startDate = now.toISOString().split("T")[0];
            //   let startTime = `${(currentHour + 1)
            //     .toString()
            //     .padStart(2, "0")}:${currentMinute
            //     .toString()
            //     .padStart(2, "0")}:00`;
            //   let endTime = `${(currentHour + 2)
            //     .toString()
            //     .padStart(2, "0")}:${currentMinute
            //     .toString()
            //     .padStart(2, "0")}:00`;

            //   try {
            //     // Try to parse start date/time
            //     if (bookingRequest.startTime) {
            //       const parts = bookingRequest.startTime.split("T");
            //       if (parts.length === 2) {
            //         startDate = parts[0];
            //         startTime = parts[1].slice(0, 8);
            //       }
            //     } else if (bookingRequest.bookingDate) {
            //       startDate = bookingRequest.bookingDate.split("T")[0];
            //     }

            //     // Try to parse end time
            //     if (bookingRequest.endTime) {
            //       const parts = bookingRequest.endTime.split("T");
            //       if (parts.length === 2) {
            //         endTime = parts[1].slice(0, 8);
            //       }
            //     }
            //   } catch (error) {
            //     console.error("Error parsing booking request data:", error);
            //   }

            //   setBookingFormData({
            //     bookingName: bookingRequest.bookingName || "",
            //     bookingDate: startDate,
            //     startTime: startTime,
            //     endTime: endTime,
            //   });
            //   setShowBookingRequestModal(true);
            // }}
            senderAvatarUrl={item.senderAvatarUrl}
          />
        );
      }

      // Render regular message
      return (
        <MessageBubble
          message={item}
          isCurrentUser={isCurrentUser}
          onImagePress={handleImagePress}
          onReply={(msg) => setReplyingTo(msg)}
          onLongPress={handleMessageLongPress}
        />
      );
    },
    [
      currentUserId,
      handleBookingAction,
      handleImagePress,
      handleMessageLongPress,
    ]
  );

  // Render header
  const renderHeader = () => {
    // Get other user ID for 1-on-1 chats
    const getOtherUserId = () => {
      if (!members || members.length !== 2) return null;
      const otherMember = members.find((m) => {
        const memberId = typeof m === "string" ? m : m.userId || m.id;
        return memberId !== currentUserId;
      });
      return typeof otherMember === "string"
        ? otherMember
        : otherMember?.userId || otherMember?.id;
    };

    const otherUserId = getOtherUserId();
    const isOtherUserOnline = otherUserId ? userPresences[otherUserId] : false;

    // Get first letter of conversationTitle for avatar placeholder
    const getInitialLetter = () => {
      if (!conversationTitle || conversationTitle.trim() === "") return "?";
      return conversationTitle.trim().charAt(0).toUpperCase();
    };

    // Check if conversationImg is valid
    const hasValidImage = conversationImg && conversationImg.trim() !== "";

    const getSubtitleColor = () => {
      if (typingStatus?.isTyping) return "#6B7280";
      if (isOtherUserOnline) return "#10B981";
      if (connectionStatus === "reconnecting") return "#F59E0B";
      return "#9CA3AF";
    };

    return (
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="caret-back" size={30} color="#ED2A46" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerCenter} activeOpacity={0.7}>
          {hasValidImage ? (
            <Image
              source={{ uri: conversationImg }}
              style={styles.headerAvatar}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <Text style={styles.headerAvatarPlaceholderText}>
                {getInitialLetter()}
              </Text>
            </View>
          )}
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{conversationTitle}</Text>
            {/* <View style={styles.headerSubtitleRow}>
              {!typingStatus?.isTyping && (
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: isOtherUserOnline
                        ? "#10B981"
                        : "#9CA3AF",
                    },
                  ]}
                />
              )}
              <Text
                style={[styles.headerSubtitle, { color: getSubtitleColor() }]}
              >
                {typingStatus?.isTyping
                  ? t("chat.typing")
                  : isOtherUserOnline
                  ? t("chat.online")
                  : connectionStatus === "reconnecting"
                  ? t("messageScreen.reconnecting")
                  : t("chat.offline")}
              </Text>
            </View> */}
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-vertical" size={22} color="#111827" />
        </TouchableOpacity>
      </View>
    );
  };

  // Render input area
  const renderInputArea = () => (
    <View style={styles.inputContainer}>
      {/* Edit mode preview */}
      {editingMessage && (
        <View style={styles.replyPreviewContainer}>
          <View style={styles.replyPreviewContent}>
            <Text style={[styles.replyPreviewLabel, { color: "#F59E0B" }]}>
              {t("messageScreen.editingMessage")}
            </Text>
            <Text style={styles.replyPreviewText} numberOfLines={2}>
              {editingMessage.content}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setEditingMessage(null);
              setInputText("");
            }}
          >
            <Ionicons name="close" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}

      {/* Reply preview */}
      {replyingTo && !editingMessage && (
        <View style={styles.replyPreviewContainer}>
          <View style={styles.replyPreviewContent}>
            <Text style={styles.replyPreviewLabel}>
              {t("messageScreen.replyingTo")}
            </Text>
            <Text style={styles.replyPreviewText} numberOfLines={2}>
              {replyingTo.content}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setReplyingTo(null)}>
            <Ionicons name="close" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        {/* Only show booking button if conversation has Customer and FreelancePT, but no GymPT */}
        {(currentUserRole === "Customer" ||
          currentUserRole === "FreelancePT") &&
          members?.some((m) => m.role === "Customer") &&
          members?.some((m) => m.role === "FreelancePT") &&
          !members?.some((m) => m.role === "GymPT") && (
            <TouchableOpacity
              style={styles.inputButton}
              onPress={() => {
                setEditingBookingRequest(null);
                setBookingFormData({
                  bookingName: "",
                  bookingDate: new Date().toISOString().split("T")[0],
                  startTime: "",
                  endTime: "",
                });
                setShowBookingRequestModal(true);
              }}
            >
              <Ionicons name="calendar" size={28} color={colors.red} />
            </TouchableOpacity>
          )}

        <TouchableOpacity
          style={styles.inputButton}
          onPress={handlePickImage}
          disabled={sending}
        >
          <Ionicons name="image" size={24} color={colors.red} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder={t("chat.typeMessage")}
          placeholderTextColor="#9CA3AF"
          value={inputText}
          onChangeText={handleTyping}
          multiline
          maxLength={1000}
        />

        {inputText.trim() ? (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={sending}
          >
            {sending ? (
              <LoadingIndicator variant="button" />
            ) : (
              <Ionicons name="send" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.sendButton}>
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Inline message actions - Instagram style
  const renderMessageActions = () => {
    if (!showMessageActions || !selectedMessage) return null;

    const isCurrentUser = selectedMessage?.senderId === currentUserId;
    const reactions = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

    return (
      <Modal
        visible={showMessageActions}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowMessageActions(false);
          setSelectedMessage(null);
          setMessageLayout(null);
        }}
      >
        <TouchableOpacity
          style={styles.inlineActionOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowMessageActions(false);
            setSelectedMessage(null);
            setMessageLayout(null);
          }}
        >
          {/* Position message at its actual location */}
          <View
            style={[
              styles.messageInPlace,
              messageLayout && {
                position: "absolute",
                top: messageLayout.y,
                left: 0,
                right: 0,
                paddingHorizontal: 16,
              },
            ]}
          >
            {/* Reaction icons row - above message (for other users) */}
            {!isCurrentUser && (
              <View
                style={[
                  styles.inlineReactionsRow,
                  isCurrentUser
                    ? { alignSelf: "flex-end" }
                    : { alignSelf: "flex-start" },
                ]}
              >
                {reactions.map((reaction) => (
                  <TouchableOpacity
                    key={reaction}
                    style={[
                      styles.inlineReactionBtn,
                      selectedMessage?.reaction === reaction &&
                        styles.inlineReactionBtnActive,
                    ]}
                    onPress={() => handleReactMessage(reaction)}
                  >
                    <Text style={styles.inlineReactionEmoji}>{reaction}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Message bubble - at actual position */}
            <View
              style={[
                styles.focusedMessageBubble,
                isCurrentUser
                  ? styles.focusedMessageRight
                  : styles.focusedMessageLeft,
              ]}
            >
              {!isCurrentUser && (
                <Image
                  source={{ uri: selectedMessage.senderAvatarUrl }}
                  style={styles.focusedAvatar}
                  resizeMode="cover"
                />
              )}
              <View
                style={[
                  styles.focusedBubbleContent,
                  isCurrentUser
                    ? styles.focusedBubbleCurrentUser
                    : styles.focusedBubbleOtherUser,
                ]}
              >
                {selectedMessage?.mediaType === "Image" ? (
                  <Image
                    source={{
                      uri: selectedMessage.mediaUrl || selectedMessage.content,
                    }}
                    style={styles.focusedMessageImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Text
                    style={[
                      styles.focusedMessageText,
                      isCurrentUser && styles.focusedMessageTextRight,
                    ]}
                  >
                    {selectedMessage?.content}
                  </Text>
                )}
              </View>
              {isCurrentUser && (
                <Image
                  source={{ uri: selectedMessage.senderAvatarUrl }}
                  style={styles.focusedAvatarRight}
                  resizeMode="cover"
                />
              )}
            </View>

            {/* Action buttons row - directly below message */}
            <View
              style={[
                styles.inlineActionsRow,
                isCurrentUser
                  ? styles.inlineActionsRight
                  : styles.inlineActionsLeft,
              ]}
            >
              {/* Reply - for other users */}
              {!isCurrentUser && (
                <TouchableOpacity
                  style={styles.inlineActionBtn}
                  onPress={handleReplyToMessage}
                >
                  <Ionicons name="arrow-undo" size={20} color="#FFFFFF" />
                  <Text style={styles.inlineActionText}>
                    {t("messageScreen.reply")}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Edit - for current user text messages only */}
              {isCurrentUser &&
                selectedMessage?.mediaType === "Text" &&
                !selectedMessage?.isDeleted && (
                  <TouchableOpacity
                    style={styles.inlineActionBtn}
                    onPress={handleEditMessage}
                  >
                    <Ionicons name="create" size={20} color="#FFFFFF" />
                    <Text style={styles.inlineActionText}>
                      {t("messageScreen.edit")}
                    </Text>
                  </TouchableOpacity>
                )}

              {/* Delete - for current user (only if not already deleted) */}
              {isCurrentUser && !selectedMessage?.isDeleted && (
                <TouchableOpacity
                  style={styles.inlineActionBtn}
                  onPress={handleDeleteMessage}
                >
                  <Ionicons name="trash" size={20} color="#FFFFFF" />
                  <Text style={styles.inlineActionText}>
                    {t("chat.delete")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // Reaction picker modal
  const renderReactionPicker = () => {
    const reactions = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

    return (
      <Modal
        visible={showReactionPicker}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowReactionPicker(false);
          setSelectedMessage(null);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowReactionPicker(false);
            setSelectedMessage(null);
          }}
        >
          <View style={styles.reactionSheet}>
            <Text style={styles.reactionSheetTitle}>
              {t("messageScreen.chooseReaction")}
            </Text>
            <View style={styles.reactionGrid}>
              {reactions.map((reaction) => (
                <TouchableOpacity
                  key={reaction}
                  style={[
                    styles.reactionButton,
                    selectedMessage?.reaction === reaction &&
                      styles.reactionButtonActive,
                  ]}
                  onPress={() => handleReactMessage(reaction)}
                >
                  <Text style={styles.reactionEmoji}>{reaction}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // Image viewer modal
  const renderImageViewer = () => (
    <Modal
      visible={selectedImage !== null}
      transparent
      animationType="fade"
      onRequestClose={() => setSelectedImage(null)}
    >
      <View style={styles.imageViewerContainer}>
        <TouchableOpacity
          style={styles.imageViewerClose}
          onPress={() => setSelectedImage(null)}
        >
          <Ionicons name="close" size={32} color="#FFFFFF" />
        </TouchableOpacity>
        {selectedImage && (
          <Image
            source={{ uri: selectedImage }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        )}
      </View>
    </Modal>
  );

  // Helper function to format date for display (dd-mm-yyyy)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB");
    } catch (error) {
      return dateString;
    }
  };

  // Helper function to format time for display (HH:mm)
  const formatTimeForDisplay = (timeString) => {
    if (!timeString) return "";
    // Handle HH:mm:ss format
    const parts = timeString.split(":");
    return `${parts[0]}:${parts[1]}`;
  };

  // Helper function to get default start time (current time + 5 minutes)
  const getDefaultStartTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now;
  };

  // Booking request modal
  const renderBookingRequestModal = () => (
    <Modal
      visible={showBookingRequestModal}
      transparent
      animationType="fade"
      onRequestClose={() => {
        setShowBookingRequestModal(false);
        setEditingBookingRequest(null);
      }}
    >
      <View style={styles.bookingModalOverlay}>
        <View style={styles.bookingRequestSheet}>
          <View style={styles.bookingRequestHeader}>
            <Text style={styles.bookingRequestTitle}>
              {
                // editingBookingRequest
                // ? t("messageScreen.editBookingRequest") :
                t("messageScreen.createBookingRequest")
              }
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowBookingRequestModal(false);
                setEditingBookingRequest(null);
              }}
            >
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          <View style={styles.bookingRequestForm}>
            {/* Booking Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                {t("messageScreen.bookingName")}
              </Text>
              <TextInput
                style={styles.formInput}
                placeholder={t("messageScreen.enterBookingName")}
                value={bookingFormData.bookingName}
                onChangeText={(text) =>
                  setBookingFormData((prev) => ({ ...prev, bookingName: text }))
                }
              />
            </View>

            {/* Booking Date */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t("messageScreen.date")}</Text>
              <TouchableOpacity
                style={styles.formInputTouchable}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                <Text style={styles.formInputText}>
                  {formatDateForDisplay(bookingFormData.bookingDate)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Start Time */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                {t("messageScreen.startTime")}
              </Text>
              <TouchableOpacity
                style={styles.formInputTouchable}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color="#6B7280" />
                <Text
                  style={[
                    styles.formInputText,
                    !bookingFormData.startTime && styles.placeholderText,
                  ]}
                >
                  {formatTimeForDisplay(bookingFormData.startTime) ||
                    t("bookingRequest.selectStartTime")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* End Time (auto-calculated based on session duration) */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t("messageScreen.endTime")}</Text>
              <View style={styles.formInputTouchable}>
                <Ionicons name="time-outline" size={20} color="#6B7280" />
                <Text
                  style={[
                    styles.formInputText,
                    !bookingFormData.endTime && styles.placeholderText,
                  ]}
                >
                  {formatTimeForDisplay(bookingFormData.endTime) ||
                    t("bookingRequest.selectEndTime")}
                </Text>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={
                editingBookingRequest
                  ? handleEditBookingRequest
                  : handleSendBookingRequest
              }
              disabled={sending}
            >
              {sending ? (
                <LoadingIndicator variant="button" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {editingBookingRequest
                    ? t("messageScreen.updateRequest")
                    : t("messageScreen.sendRequest")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={(selectedDate) => {
          setShowDatePicker(false);
          if (selectedDate) {
            const formatted = selectedDate.toISOString().split("T")[0];
            setBookingFormData((prev) => ({
              ...prev,
              bookingDate: formatted,
            }));
          }
        }}
        onCancel={() => setShowDatePicker(false)}
        date={(() => {
          try {
            if (bookingFormData.bookingDate) {
              // Ensure date is in YYYY-MM-DD format
              const dateStr = bookingFormData.bookingDate.split("T")[0];
              const [year, month, day] = dateStr.split("-").map(Number);
              // JavaScript months are 0-indexed
              return new Date(year, month - 1, day);
            }
          } catch (error) {
            console.error("Error parsing date:", error);
          }
          return new Date();
        })()}
        minimumDate={new Date()}
        confirmTextIOS={t("messageScreen.confirm")}
        cancelTextIOS={t("chat.cancel")}
        headerTextIOS={t("messageScreen.selectDate")}
        display="spinner"
        isDarkModeEnabled={false}
        buttonTextColorIOS={colors.red}
      />

      {/* Start Time Picker Modal */}
      <DateTimePickerModal
        isVisible={showStartTimePicker}
        mode="time"
        onConfirm={(selectedTime) => {
          setShowStartTimePicker(false);
          if (selectedTime) {
            // Check if the selected date is today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selectedDateOnly = new Date(bookingFormData.bookingDate);
            selectedDateOnly.setHours(0, 0, 0, 0);

            const isToday = selectedDateOnly.getTime() === today.getTime();

            // If today, check if selected time is in the past
            if (isToday) {
              const now = new Date();
              const selectedDateTime = new Date();
              selectedDateTime.setHours(
                selectedTime.getHours(),
                selectedTime.getMinutes(),
                0,
                0
              );

              if (selectedDateTime < now) {
                Alert.alert(
                  t("common.error"),
                  t("bookingRequest.pastTimeError")
                );
                return;
              }
            }

            const hours = selectedTime.getHours().toString().padStart(2, "0");
            const minutes = selectedTime
              .getMinutes()
              .toString()
              .padStart(2, "0");
            const newStartTime = `${hours}:${minutes}:00`;

            // Auto-set end time based on session duration
            const endDateTime = new Date(selectedTime);
            endDateTime.setMinutes(endDateTime.getMinutes() + sessionDuration);
            const endHours = endDateTime.getHours().toString().padStart(2, "0");
            const endMinutes = endDateTime
              .getMinutes()
              .toString()
              .padStart(2, "0");
            const newEndTime = `${endHours}:${endMinutes}:00`;

            setBookingFormData((prev) => ({
              ...prev,
              startTime: newStartTime,
              endTime: newEndTime,
            }));
          }
        }}
        onCancel={() => setShowStartTimePicker(false)}
        date={getDefaultStartTime()}
        is24Hour={true}
        confirmTextIOS={t("messageScreen.confirm")}
        cancelTextIOS={t("chat.cancel")}
        headerTextIOS={t("messageScreen.selectStartTime")}
        display="spinner"
        isDarkModeEnabled={false}
        buttonTextColorIOS={colors.red}
      />

      {/* End Time Picker Modal */}
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {loading ? (
          <LoadingIndicator variant="page" />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => item.id || `message-${index}`}
            inverted
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListHeaderComponent={
              typingStatus?.isTyping ? (
                <View style={styles.typingIndicatorContainer}>
                  {conversationImg && conversationImg.trim() !== "" ? (
                    <Image
                      source={{ uri: conversationImg }}
                      style={styles.typingAvatar}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.typingAvatarPlaceholder}>
                      <Text style={styles.typingAvatarPlaceholderText}>
                        {conversationTitle && conversationTitle.trim() !== ""
                          ? conversationTitle.trim().charAt(0).toUpperCase()
                          : "?"}
                      </Text>
                    </View>
                  )}
                  <View style={styles.typingBubble}>
                    <View style={styles.typingDot} />
                    <View style={[styles.typingDot, styles.typingDotDelay1]} />
                    <View style={[styles.typingDot, styles.typingDotDelay2]} />
                  </View>
                </View>
              ) : null
            }
            ListFooterComponent={
              isLoadingMore ? <LoadingIndicator variant="inline" /> : null
            }
          />
        )}

        {renderInputArea()}
      </KeyboardAvoidingView>

      {renderImageViewer()}
      {renderMessageActions()}
      {renderReactionPicker()}
      {renderBookingRequestModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
  },
  initialLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
    transform: [{ scaleY: -1 }], // Flip it back since list is inverted
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  headerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#9CA3AF",
    justifyContent: "center",
    alignItems: "center",
  },
  headerAvatarPlaceholderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  headerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#10B981",
    marginTop: 2,
  },
  headerSubtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  messageList: {
    paddingVertical: 12,
  },
  inputContainer: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  replyPreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  replyPreviewContent: {
    flex: 1,
  },
  replyPreviewLabel: {
    fontSize: 12,
    color: colors.red,
    fontWeight: "600",
    marginBottom: 2,
  },
  replyPreviewText: {
    fontSize: 14,
    color: "#6B7280",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
    maxHeight: 100,
    marginHorizontal: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.red,
    justifyContent: "center",
    alignItems: "center",
  },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageViewerClose: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },
  typingIndicatorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  typingAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    marginRight: 8,
  },
  typingAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#9CA3AF",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  typingAvatarPlaceholderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  typingBubble: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6B7280",
    marginHorizontal: 2,
  },
  typingDotDelay1: {
    opacity: 0.7,
  },
  typingDotDelay2: {
    opacity: 0.4,
  },
  // Inline action styles - Instagram style
  inlineActionOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
  },
  messageInPlace: {
    // Position will be set dynamically
  },
  inlineReactionsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 30,
    padding: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  inlineReactionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    backgroundColor: "transparent",
  },
  inlineReactionBtnActive: {
    backgroundColor: "#FEE2E2",
    transform: [{ scale: 1.1 }],
  },
  inlineReactionEmoji: {
    fontSize: 24,
  },
  focusedMessageBubble: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  focusedMessageLeft: {
    alignSelf: "flex-start",
  },
  focusedMessageRight: {
    alignSelf: "flex-end",
  },
  focusedAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: "#E5E7EB",
  },
  focusedAvatarRight: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 8,
    backgroundColor: "#E5E7EB",
  },
  focusedBubbleContent: {
    padding: 12,
    borderRadius: 18,
    maxWidth: "80%",
  },
  focusedBubbleOtherUser: {
    backgroundColor: "#E5E7EB",
  },
  focusedBubbleCurrentUser: {
    backgroundColor: colors.red,
  },
  focusedMessageText: {
    fontSize: 15,
    color: "#111827",
  },
  focusedMessageTextRight: {
    color: "#FFFFFF",
  },
  focusedMessageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  inlineActionsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 24,
    padding: 4,
    backdropFilter: "blur(10px)",
  },
  inlineActionsLeft: {
    alignSelf: "flex-start",
  },
  inlineActionsRight: {
    alignSelf: "flex-end",
  },
  inlineActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  inlineActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  reactionSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  reactionSheetTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
  },
  reactionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: 12,
  },
  reactionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  reactionButtonActive: {
    backgroundColor: "#FEE2E2",
    borderWidth: 2,
    borderColor: "#EF4444",
  },
  reactionEmoji: {
    fontSize: 28,
  },
  bookingModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  bookingRequestSheet: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  bookingRequestHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  bookingRequestTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  bookingRequestForm: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  formInputTouchable: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  formInputText: {
    fontSize: 15,
    color: "#111827",
    marginLeft: 10,
    flex: 1,
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  submitButton: {
    backgroundColor: colors.red,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
