import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import ConversationCard from "../../../components/ChatComponents/ConversationCard";
import ConversationSkeleton from "../../../components/ChatComponents/ConversationSkeleton";
import CreateConversationModal from "../../../components/ChatComponents/CreateConversationModal";
import colors from "../../../constants/color";
import messageService from "../../../services/messageService";
import { useMessagingState } from "../../../context/messagingStateContext";
import { CLIENT_METHODS } from "../../../services/signalR/Message/constants/hubMethods";
import { LIFECYCLE_METHODS } from "../../../services/signalR/Message/constants/lifecycleMethods";
import { fetchUserFromStorage } from "../../../lib";
import { useTranslation } from "../../../hooks/useTranslation";
import LoadingIndicator from "../../../components/LoadingIndicator";

export default function MessageScreen({ navigation }) {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [userPresences, setUserPresences] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  useEffect(() => {
    // Fetch current user ID from your auth context or service
    const fetchCurrentUser = async () => {
      try {
        const userData = await fetchUserFromStorage();
        if (userData) {
          setCurrentUserId(userData.id);
          setCurrentUserRole(userData.role);
        }
      } catch (error) {
        console.error("Error fetching current user", error);
      }
    };
    fetchCurrentUser();
  }, []);
  // Get messaging state context
  const { messagingService, connectionStatus } = useMessagingState();

  const isConnected = connectionStatus === "connected";


  // Use refs to avoid stale closure in event handlers
  const conversationsRef = useRef(conversations);
  const searchQueryRef = useRef(searchQuery);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations(false);
  }, []);

  // Sync filteredConversations with conversations when there's no search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === "") {
      setFilteredConversations(conversations);
    }
  }, [conversations, searchQuery]);

  // Function to find and update conversation in state
  const findAndUpdateConversation = useCallback(
    (message) => {
      const conversationId = message.conversationId;

      if (!conversationId) {
        console.warn("MessageScreen: Message missing conversationId, skipping update");
        return;
      }

      setConversations((prev) => {
        // Normalize IDs for comparison
        const normalizeId = (id) => id?.toString();
        const targetId = normalizeId(conversationId);
        
        const convo = prev.find((conv) => {
          const convId = normalizeId(conv.id);
          return convId === targetId;
        });

        if (convo) {
          // Update existing conversation
          const updatedConversations = prev.map((conv) => {
            const convId = normalizeId(conv.id);
            if (convId === targetId) {
              const isDeleted =
                message.status === "Deleted" || message.isDeleted;
              return {
                ...conv,
                lastMessageContent: isDeleted
                  ? "This message was deleted"
                  : message.content,
                lastMessageType: message.messageType,
                lastMessageMediaType: message.mediaType,
                lastMessageSenderName: message.senderName,
                lastMessageSenderId: message.senderId,
                lastMessageId: message.id,
                lastMessageStatus: message.status,
                lastMessageIsDeleted: isDeleted,
                updatedAt: message.createdAt || message.updatedAt || new Date().toISOString(),
                isRead: message.senderId === currentUserId,
              };
            }
            return conv;
          });

          // Sort by latest message time
          return updatedConversations.sort(
            (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
          );
        } else {
          // Add new conversation if message includes conversation data
          if (message.newConversation) {
            const newConversation = {
              id: conversationId,
              isGroup: message.newConversation.isGroup || false,
              isRead: false,
              title: message.senderName || message.newConversation.title,
              updatedAt: message.createdAt || new Date().toISOString(),
              lastMessageContent: message.content,
              lastMessageType: message.messageType,
              lastMessageMediaType: message.mediaType,
              lastMessageSenderName: message.senderName,
              lastMessageSenderId: message.senderId,
              conversationImg: message.newConversation.conversationImg || null,
              members: message.newConversation.members || [],
            };
            const newConversations = [...prev, newConversation];
            return newConversations.sort(
              (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
            );
          }
          return prev;
        }
      });

      // Also update filtered conversations if search is active
      const currentSearchQuery = searchQueryRef.current;
      if (currentSearchQuery) {
        setFilteredConversations((prev) => {
          const convo = prev.find(
            (conv) =>
              conv.id === conversationId ||
              conv.id?.toString() === conversationId?.toString()
          );

          if (convo) {
            const updatedConversations = prev.map((conv) => {
              if (
                conv.id === conversationId ||
                conv.id?.toString() === conversationId?.toString()
              ) {
                const isDeleted =
                  message.status === "Deleted" || message.isDeleted;
                return {
                  ...conv,
                  lastMessageContent: isDeleted
                    ? "This message was deleted"
                    : message.content,
                  lastMessageType: message.messageType,
                  lastMessageMediaType: message.mediaType,
                  lastMessageSenderName: message.senderName,
                  lastMessageSenderId: message.senderId,
                  lastMessageId: message.id,
                  lastMessageStatus: message.status,
                  lastMessageIsDeleted: isDeleted,
                  updatedAt: message.createdAt,
                  isRead: message.senderId === currentUserId,
                };
              }
              return conv;
            });

            return updatedConversations.sort(
              (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
            );
          }
          return prev;
        });
      }
    },
    [currentUserId]
  );

  // Subscribe to real-time message events
  useEffect(() => {
    if (!messagingService) {
      return;
    }


    // Handle new message received
    const handleMessageReceived = (message) => {
      findAndUpdateConversation(message);
    };

    // Handle message updated
    const handleMessageUpdated = (updatedMessage) => {

      const isDeleted =
        updatedMessage.status === "Deleted" || updatedMessage.isDeleted;
      const updatedContent = isDeleted
        ? "This message was deleted"
        : updatedMessage.newContent || updatedMessage.content;

      // Update conversation's last message content
      setConversations((prev) =>
        prev.map((conv) => {
          // Match by conversationId and either lastMessageId or if it's the most recent
          if (conv.id === updatedMessage.conversationId) {
            // Update if lastMessageId matches, or if no lastMessageId is set
            if (
              !conv.lastMessageId ||
              conv.lastMessageId === updatedMessage.id
            ) {
              return {
                ...conv,
                lastMessageContent: updatedContent,
                lastMessageId: updatedMessage.id,
              };
            }
          }
          return conv;
        })
      );

      setFilteredConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === updatedMessage.conversationId) {
            if (
              !conv.lastMessageId ||
              conv.lastMessageId === updatedMessage.id
            ) {
              return {
                ...conv,
                lastMessageContent: updatedContent,
                lastMessageId: updatedMessage.id,
              };
            }
          }
          return conv;
        })
      );
    };

    // Handle reconnecting
    const handleReconnecting = () => {
      // Use a small delay to avoid race conditions during reconnection
      setTimeout(() => {
        fetchConversations(false).catch((error) => {
          console.error("Error refetching conversations on reconnect:", error);
          // Silently fail - will retry on next reconnection
        });
      }, 1000);
    };

    // Handle user presence update
    const handleUserPresenceUpdate = (presenceData) => {
      console.log("MessageScreen: User presence update", presenceData);

      // Validate presence data
      if (!presenceData || !presenceData.userId) {
        console.warn(
          "MessageScreen: Invalid presence data received",
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
      messagingService.offEvent(
        CLIENT_METHODS.USER_PRESENCE_UPDATE,
        handleUserPresenceUpdate
      );
      messagingService.offEvent(
        LIFECYCLE_METHODS.ON_RECONNECTING,
        handleReconnecting
      );
    };
  }, [messagingService, currentUserId, findAndUpdateConversation]);

  // Fetch conversations from API
  const fetchConversations = useCallback(
    async (isRefresh = false) => {
      if (loading) return;

      try {
        isRefresh ? setRefreshing(true) : setLoading(true);

        const params = {
          page: isRefresh ? 1 : pageNumber,
          size: 50,
        };

        const response = await messageService.getConversations(params); // Handle paginated response
        const fetchedConversations = response.data.items || [];

        // Process conversations to handle deleted messages
        const newConversations = fetchedConversations.map((conv) => {
          const isLastMessageDeleted =
            conv.lastMessageStatus === "Deleted" || conv.lastMessageIsDeleted;

          if (isLastMessageDeleted) {
            return {
              ...conv,
              lastMessageContent: "This message was deleted",
            };
          }
          return conv;
        });

        if (isRefresh) {
          setConversations(newConversations);
          setFilteredConversations(newConversations);
          setPageNumber(1);
          setHasMore(newConversations.length >= 20);
        } else {
          // Filter out duplicates by ID
          setConversations((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const uniqueNewConversations = newConversations.filter(
              (c) => !existingIds.has(c.id)
            );
            return [...prev, ...uniqueNewConversations];
          });
          setFilteredConversations((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const uniqueNewConversations = newConversations.filter(
              (c) => !existingIds.has(c.id)
            );
            return [...prev, ...uniqueNewConversations];
          });
          setHasMore(newConversations.length >= 20);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
        // Keep existing data on error
        // Show error message only on initial load or refresh
        if (isRefresh || pageNumber === 1) {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Failed to load conversations. Please check your connection and try again.";
          // Use a timeout to avoid showing alert during rapid refreshes
          setTimeout(() => {
            Alert.alert("Error", errorMessage, [
              { text: "OK", style: "cancel" },
              {
                text: "Retry",
                onPress: () => fetchConversations(true),
              },
            ]);
          }, 100);
        }
      } finally {
        setTimeout(() => {
          setLoading(false);
          setRefreshing(false);
        }, 1500);
      }
    },
    [pageNumber]
  );

  // Handle refresh
  const onRefresh = useCallback(() => {
    fetchConversations(false);
  }, [fetchConversations]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPageNumber((prev) => prev + 1);
      fetchConversations(false);
    }
  }, [loading, hasMore, fetchConversations]);

  // Handle search
  const handleSearch = useCallback((text) => {
    setSearchQuery(text);

    if (text.trim() === "") {
      setFilteredConversations(conversationsRef.current);
    } else {
      const filtered = conversationsRef.current.filter(
        (conversation) =>
          conversation.title.toLowerCase().includes(text.toLowerCase()) ||
          conversation.members.some((member) =>
            member.username.toLowerCase().includes(text.toLowerCase())
          )
      );
      setFilteredConversations(filtered);
    }
  }, []);

  // Handle conversation press
  const handleConversationPress = async (conversation) => {
    if (!conversation.isRead) {
      try {
        await messageService.markAsRead({
          conversationId: conversation.id,
          messageIds: [],
        });

        // Update local state
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversation.id ? { ...c, isRead: true } : c
          )
        );
        setFilteredConversations((prev) =>
          prev.map((c) =>
            c.id === conversation.id ? { ...c, isRead: true } : c
          )
        );
      } catch (error) {
        console.error("Error marking conversation as read:", error);
        // Continue navigation even if marking as read fails
        // Silently fail - not critical for user experience
      }
    }

    // Navigate to chat screen with conversation data
    navigation.navigate("MessageDetailScreen", {
      conversationId: conversation.id,
      conversationTitle: conversation.title,
      conversationImg: conversation.conversationImg,
      members: conversation.members,
      userPresences: userPresences,
    });
  };

  // Get unread count
  const unreadCount = conversations.filter((c) => !c.isRead).length;

  // Handle create conversation
  const handleCreateConversation = () => {
    setCreateModalVisible(true);
  };

  // Handle conversation created callback
  const handleConversationCreated = (conversationData) => {
    // Refresh conversations list
    fetchConversations(true);

    // Navigate to the new conversation
    if (conversationData?.id) {
      navigation.navigate("MessageDetailScreen", {
        conversationId: conversationData.id,
        conversationTitle: conversationData.title || "New Conversation",
        conversationImg: conversationData.conversationImg || null,
        members: conversationData.members || [],
      });
    }
  };

  // Render search bar
  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search-outline" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder={t("messageScreen.searchPlaceholder")}
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Render AI chatbot card
  const renderAIChatbot = () => (
    <TouchableOpacity
      style={styles.aiChatbotCard}
      onPress={() => navigation.navigate("ChatbotScreen")}
      activeOpacity={0.7}
    >
      <View style={styles.aiChatbotIconContainer}>
        <Ionicons name="sparkles" size={24} color="#007AFF" />
      </View>
      <View style={styles.aiChatbotContent}>
        <Text style={styles.aiChatbotTitle}>
          {t("messageScreen.aiChatbot")}
        </Text>
        <Text style={styles.aiChatbotDesc}>
          {t("messageScreen.aiChatbotDesc")}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  // Render loading state with skeleton
  const renderLoadingState = () => (
    <FlatList
      data={Array.from({ length: 8 })}
      renderItem={() => <ConversationSkeleton />}
      keyExtractor={(_, index) => `skeleton-${index}`}
      contentContainerStyle={styles.skeletonContainer}
      showsVerticalScrollIndicator={false}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Connection status banner */}
      {connectionStatus !== "connected" && (
        <View
          style={[
            styles.connectionBanner,
            {
              backgroundColor:
                connectionStatus === "reconnecting" ? "#FEF3C7" : "#FEE2E2",
            },
          ]}
        >
          <Ionicons
            name={
              connectionStatus === "reconnecting" ? "sync" : "cloud-offline"
            }
            size={16}
            color={connectionStatus === "reconnecting" ? "#F59E0B" : "#EF4444"}
          />
          <Text
            style={[
              styles.connectionBannerText,
              {
                color:
                  connectionStatus === "reconnecting" ? "#F59E0B" : "#EF4444",
              },
            ]}
          >
            {connectionStatus === "reconnecting"
              ? t("messageScreen.reconnecting")
              : t("messageScreen.offline")}
          </Text>
        </View>
      )}

      {renderSearchBar()}

      {loading && !refreshing ? (
        renderLoadingState()
      ) : (
        <>
          {currentUserRole === "Customer" && renderAIChatbot()}
          <FlatList
            data={filteredConversations}
            renderItem={({ item }) => (
              <ConversationCard
                conversation={item}
                onPress={handleConversationPress}
                currentUserId={currentUserId}
                userPresences={userPresences}
              />
            )}
            keyExtractor={(item, index) => item.id || `conversation-${index}`}
            ListFooterComponent={
              loading && !refreshing ? (
                <LoadingIndicator variant="inline" />
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.red}
                colors={[colors.red]}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateConversation}
        activeOpacity={0.8}
      >
        <Ionicons name="create-outline" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <CreateConversationModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onConversationCreated={handleConversationCreated}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  connectionBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  connectionBannerText: {
    fontSize: 13,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  skeletonContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
  aiChatbotCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  aiChatbotIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  aiChatbotContent: {
    flex: 1,
  },
  aiChatbotTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  aiChatbotDesc: {
    fontSize: 13,
    color: "#6B7280",
  },
  unreadBadge: {
    backgroundColor: colors.red,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 24,
    alignItems: "center",
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#111827",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.red,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  testButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    alignItems: "center",
  },
  testButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
