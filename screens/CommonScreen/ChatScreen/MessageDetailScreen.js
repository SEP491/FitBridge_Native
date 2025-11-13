import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  MessageBubble,
  BookingRequestCard,
} from "../../../components/ChatComponents";
import colors from "../../../constants/color";
import messageService from "../../../services/messageService";
import { useMessagingState } from "../../../context/messagingStateContext";
import {
  CLIENT_METHODS,
  HUB_METHODS,
} from "../../../services/signalR/Message/constants/hubMethods";
import { LIFECYCLE_METHODS } from "../../../services/signalR/Message/constants/lifecycleMethods";

export default function MessageDetailScreen({ route, navigation }) {
  const { conversationId, conversationTitle, conversationImg } =
    route.params || {};

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
  const [processingMessageId, setProcessingMessageId] = useState(null);

  const flatListRef = useRef(null);
  const currentUserId = "126ec3d4-4d34-45f2-bbf7-98b9a3dfc31c";
  const typingTimeoutRef = useRef(null);

  // Get messaging state context
  const { messagingService, connectionStatus } = useMessagingState();

  const isConnected = connectionStatus === "connected";

  // Join conversation on mount
  useEffect(() => {
    if (conversationId && isConnected && messagingService) {
      messagingService.addToGroup(conversationId);
      console.log("MessageDetailScreen: Joined conversation", conversationId);
    }

    // Leave conversation on unmount
    return () => {
      if (conversationId && isConnected && messagingService) {
        messagingService.removeFromGroup(conversationId);
        console.log("MessageDetailScreen: Left conversation", conversationId);
      }
    };
  }, [conversationId, isConnected, messagingService]);

  // Subscribe to real-time message events
  useEffect(() => {
    if (!isConnected || !conversationId || !messagingService) return;

    // Handle new message received
    const handleMessageReceived = (message) => {
      console.log("MessageDetailScreen: New message received", message);

      // Only add message if it belongs to this conversation
      if (message.conversationId === conversationId) {
        setMessages((prev) => {
          // Check if message already exists
          const exists = prev.some((m) => m.id === message.id);
          if (exists) return prev;

          // Add new message at the beginning (since list is inverted)
          return [message, ...prev];
        });

        // Mark as read if from other user
        if (message.senderId !== currentUserId) {
          markMessagesAsRead([message.id]);
        }
      }
    };

    // Handle message updated
    const handleMessageUpdated = (updatedMessage) => {
      console.log("MessageDetailScreen: Message updated", updatedMessage);

      if (updatedMessage.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === updatedMessage.id) {
              return {
                ...msg,
                content: updatedMessage.newContent || updatedMessage.content,
                isDeleted: updatedMessage.isDeleted || msg.isDeleted,
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
      console.log("MessageDetailScreen: User typing", typingData);

      if (
        typingData.conversationId === conversationId &&
        typingData.userId !== currentUserId
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
      console.log("MessageDetailScreen: Message status updated", statusUpdate);

      if (statusUpdate.conversationId === conversationId) {
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
      console.log("MessageDetailScreen: Reaction received", reactionData);

      if (reactionData.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === reactionData.messageId
              ? { ...msg, reaction: reactionData.reaction }
              : msg
          )
        );
      }
    };

    // Handle reaction removed
    const handleReactionRemoved = (reactionData) => {
      console.log("MessageDetailScreen: Reaction removed", reactionData);

      if (reactionData.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === reactionData.messageId ? { ...msg, reaction: null } : msg
          )
        );
      }
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
    messagingService.onEvent(LIFECYCLE_METHODS.ON_RECONNECTING, () =>
      fetchMessages(true)
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
      messagingService.offEvent(LIFECYCLE_METHODS.ON_RECONNECTING, () =>
        fetchMessages(true)
      );

      // Clear typing timeout on cleanup
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isConnected, conversationId, messagingService, currentUserId]);

  // Fetch messages on mount
  useEffect(() => {
    if (conversationId) {
      fetchMessages(true);
      markMessagesAsRead();
    }
  }, [conversationId]);

  // Fetch messages from API
  const fetchMessages = useCallback(
    async (isInitial = false) => {
      if (loading || !conversationId) return;

      try {
        setLoading(true);
        const params = {
          pageNumber: isInitial ? 1 : pageNumber,
          pageSize: 20,
        };

        const response = await messageService.getMessages(
          conversationId,
          params
        );
        const newMessages = response.items || response || [];

        if (isInitial) {
          setMessages(newMessages);
          setPageNumber(1);
        } else {
          // Filter out duplicates by ID
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const uniqueNewMessages = newMessages.filter(
              (m) => !existingIds.has(m.id)
            );
            return [...prev, ...uniqueNewMessages];
          });
        }

        setHasMore(newMessages.length >= 20);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    },
    [conversationId, pageNumber]
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
      }
    },
    [conversationId, messages, currentUserId]
  );

  // Handle load more messages
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPageNumber((prev) => prev + 1);
      fetchMessages(false);
    }
  }, [loading, hasMore, fetchMessages]);

  // Handle typing indicator with debounce
  const handleTyping = useCallback(
    (text) => {
      setInputText(text);

      if (isConnected && conversationId && messagingService) {
        // Clear previous timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Send typing indicator when user starts typing
        if (text.length > 0) {
          messagingService
            .invokeHubMethod(HUB_METHODS.USER_TYPING, conversationId, true)
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
                .invokeHubMethod(HUB_METHODS.USER_TYPING, conversationId, false)
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
            .invokeHubMethod(HUB_METHODS.USER_TYPING, conversationId, false)
            .catch((error) => {
              console.error(
                "MessageDetailScreen: Error sending typing indicator",
                error
              );
            });
        }
      }
    },
    [isConnected, conversationId, messagingService]
  );

  // Handle send message
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || sending || !conversationId) return;

    const messageContent = inputText.trim();
    const replyData = replyingTo
      ? {
          replyToMessageId: replyingTo.id,
          replyToMessageContent: replyingTo.content,
          replyToMessageMediaType: replyingTo.mediaType,
        }
      : {};

    // Clear input immediately for better UX
    setInputText("");
    setReplyingTo(null);

    try {
      setSending(true);

      const messageData = {
        conversationId,
        content: messageContent,
        mediaType: "Text",
        ...replyData,
      };

      const sentMessage = await messageService.sendMessage(messageData);

      // Add the sent message to the top of the list (check for duplicates)
      setMessages((prev) => {
        // Check if message already exists (e.g., from SignalR)
        if (prev.some((m) => m.id === sentMessage.id)) {
          return prev;
        }
        return [sentMessage, ...prev];
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore input on error
      setInputText(messageContent);
      if (replyData.replyToMessageId) {
        setReplyingTo(replyingTo);
      }
    } finally {
      setSending(false);
    }
  }, [inputText, replyingTo, conversationId, sending]);

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
                  requestStatus: action === "approve" ? "Accepted" : "Rejected",
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

  // Check if booking request is being processed
  const isProcessingBookingRequest = useCallback(
    (messageId) => {
      return processingMessageId === messageId;
    },
    [processingMessageId]
  );

  // Handle image press
  const handleImagePress = useCallback((imageUrl) => {
    setSelectedImage(imageUrl);
  }, []);

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
            onAction={handleBookingAction}
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
        />
      );
    },
    [currentUserId, handleBookingAction, handleImagePress]
  );

  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="caret-back" size={30} color="#ED2A46" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.headerCenter} activeOpacity={0.7}>
        <Image
          source={{ uri: conversationImg }}
          style={styles.headerAvatar}
          resizeMode="cover"
        />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{conversationTitle}</Text>
          <Text style={styles.headerSubtitle}>
            {typingStatus?.isTyping ? "Typing..." : "Active now"}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.headerButton}>
        <Ionicons name="ellipsis-vertical" size={22} color="#111827" />
      </TouchableOpacity>
    </View>
  );

  // Render input area
  const renderInputArea = () => (
    <View style={styles.inputContainer}>
      {/* Reply preview */}
      {replyingTo && (
        <View style={styles.replyPreviewContainer}>
          <View style={styles.replyPreviewContent}>
            <Text style={styles.replyPreviewLabel}>Replying to</Text>
            <Text style={styles.replyPreviewText} numberOfLines={1}>
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
        <TouchableOpacity style={styles.inputButton}>
          <Ionicons name="add-circle" size={28} color={colors.red} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.inputButton}>
          <Ionicons name="image" size={24} color={colors.red} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Type a message..."
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
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.inputButton}>
            <Ionicons name="mic" size={24} color={colors.red} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderHeader()}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => item.id || `message-${index}`}
          inverted
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            typingStatus?.isTyping ? (
              <View style={styles.typingIndicatorContainer}>
                <View style={styles.typingBubble}>
                  <View style={styles.typingDot} />
                  <View style={[styles.typingDot, styles.typingDotDelay1]} />
                  <View style={[styles.typingDot, styles.typingDotDelay2]} />
                </View>
              </View>
            ) : null
          }
          ListFooterComponent={
            loading ? (
              <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={colors.red} />
              </View>
            ) : null
          }
        />

        {renderInputArea()}
      </KeyboardAvoidingView>

      {renderImageViewer()}
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
    // paddingHorizontal: 16,
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
    alignItems: "flex-start",
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
});
