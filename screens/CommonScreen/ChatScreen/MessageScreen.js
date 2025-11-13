import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import ConversationCard from "../../../components/ChatComponents/ConversationCard";
import colors from "../../../constants/color";
import messageService from "../../../services/messageService";
import { useMessagingState } from "../../../context/messagingStateContext";
import { CLIENT_METHODS } from "../../../services/signalR/Message/constants/hubMethods";
import { LIFECYCLE_METHODS } from "../../../services/signalR/Message/constants/lifecycleMethods";

export default function MessageScreen({ navigation }) {
  // const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const currentUserId = "126ec3d4-4d34-45f2-bbf7-98b9a3dfc31c";

  // Get messaging state context
  const {
    conversations,
    messagingService,
    activeConversation,
    setConversations,
    setActiveConversation,
    addConversation,
    connectionStatus,
  } = useMessagingState();

  const isConnected = connectionStatus === "connected";

  // Use refs to avoid stale closure in event handlers
  const conversationsRef = useRef(conversations);
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations(true);
  }, []);

  // Function to find and update conversation in state
  const findAndUpdateConversation = useCallback(
    (message) => {
      const conversationId = message.conversationId;

      setConversations((prev) => {
        const convo = prev.find((conv) => conv.id === conversationId);

        if (convo) {
          // Update existing conversation
          const updatedConversations = prev.map((conv) => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                lastMessageContent: message.content,
                lastMessageType: message.messageType,
                lastMessageMediaType: message.mediaType,
                lastMessageSenderName: message.senderName,
                lastMessageSenderId: message.senderId,
                updatedAt: message.createdAt,
                isRead: message.senderId === currentUserId, // Mark as unread if from other user
              };
            }
            return conv;
          });

          // Sort by latest message time
          return updatedConversations.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          );
        } else {
          // Add new conversation if message includes conversation data
          if (message.newConversation) {
            const newConversation = {
              id: conversationId,
              isGroup: message.newConversation.isGroup || false,
              isRead: false,
              title: message.senderName || message.newConversation.title,
              updatedAt: message.createdAt,
              lastMessageContent: message.content,
              lastMessageType: message.messageType,
              lastMessageMediaType: message.mediaType,
              lastMessageSenderName: message.senderName,
              lastMessageSenderId: message.senderId,
              conversationImg: message.newConversation.conversationImg || null,
            };
            const newConversations = [...prev, newConversation];
            return newConversations.sort(
              (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
            );
          }
          return prev;
        }
      });

      // Also update filtered conversations if search is active
      if (searchQuery) {
        setFilteredConversations((prev) => {
          const convo = prev.find((conv) => conv.id === conversationId);

          if (convo) {
            const updatedConversations = prev.map((conv) => {
              if (conv.id === conversationId) {
                return {
                  ...conv,
                  lastMessageContent: message.content,
                  lastMessageType: message.messageType,
                  lastMessageMediaType: message.mediaType,
                  lastMessageSenderName: message.senderName,
                  lastMessageSenderId: message.senderId,
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
    [currentUserId, searchQuery]
  );

  // Subscribe to real-time message events
  useEffect(() => {
    if (!isConnected || !messagingService) return;

    // Handle new message received
    const handleMessageReceived = (message) => {
      console.log("MessageScreen: New message received", message);
      findAndUpdateConversation(message);
    };

    // Handle message updated
    const handleMessageUpdated = (updatedMessage) => {
      console.log("MessageScreen: Message updated", updatedMessage);

      // Update conversation if it's the last message
      setConversations((prev) =>
        prev.map((conv) => {
          if (
            conv.id === updatedMessage.conversationId &&
            conv.lastMessageId === updatedMessage.id
          ) {
            return {
              ...conv,
              lastMessageContent:
                updatedMessage.content || updatedMessage.newContent,
            };
          }
          return conv;
        })
      );

      setFilteredConversations((prev) =>
        prev.map((conv) => {
          if (
            conv.id === updatedMessage.conversationId &&
            conv.lastMessageId === updatedMessage.id
          ) {
            return {
              ...conv,
              lastMessageContent:
                updatedMessage.content || updatedMessage.newContent,
            };
          }
          return conv;
        })
      );
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
    messagingService.onEvent(LIFECYCLE_METHODS.ON_RECONNECTING, () =>
      fetchConversations(true)
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
      messagingService.offEvent(LIFECYCLE_METHODS.ON_RECONNECTING, () =>
        fetchConversations(true)
      );
    };
  }, [isConnected, messagingService, findAndUpdateConversation]);

  // Fetch conversations from API
  const fetchConversations = useCallback(
    async (isRefresh = false) => {
      if (loading) return;

      try {
        isRefresh ? setRefreshing(true) : setLoading(true);

        const params = {
          pageNumber: isRefresh ? 1 : pageNumber,
          pageSize: 20,
        };

        const response = await messageService.getConversations(params); // Handle paginated response
        const newConversations = response.items || response || [];

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
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [pageNumber]
  );

  // Handle refresh
  const onRefresh = useCallback(() => {
    fetchConversations(true);
  }, [fetchConversations]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPageNumber((prev) => prev + 1);
      fetchConversations(false);
    }
  }, [loading, hasMore, fetchConversations]);

  // Handle search
  const handleSearch = useCallback(
    (text) => {
      setSearchQuery(text);

      if (text.trim() === "") {
        setFilteredConversations(conversations);
      } else {
        const filtered = conversations.filter(
          (conversation) =>
            conversation.title.toLowerCase().includes(text.toLowerCase()) ||
            conversation.members.some((member) =>
              member.username.toLowerCase().includes(text.toLowerCase())
            )
        );
        setFilteredConversations(filtered);
      }
    },
    [conversations]
  );

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
      }
    }

    // Navigate to chat screen with conversation data
    navigation.navigate("MessageDetailScreen", {
      conversationId: conversation.id,
      conversationTitle: conversation.title,
      conversationImg: conversation.conversationImg,
    });
  };

  // Get unread count
  const unreadCount = conversations.filter((c) => !c.isRead).length;

  // Handle create conversation (placeholder)
  const handleCreateConversation = () => {
    console.log("Create new conversation");
    // TODO: Navigate to user selection screen or implement create conversation flow
  };

  // Render search bar
  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search-outline" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
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

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={80} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>
        {searchQuery ? "No conversations found" : "No messages yet"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? "Try searching with a different name"
          : "Start a conversation to connect with others"}
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={handleCreateConversation}
        >
          <Text style={styles.emptyButtonText}>Start Conversation</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderSearchBar()}

      <FlatList
        data={filteredConversations}
        renderItem={({ item }) => (
          <ConversationCard
            conversation={item}
            onPress={handleConversationPress}
            currentUserId={currentUserId}
          />
        )}
        keyExtractor={(item, index) => item.id || `conversation-${index}`}
        contentContainerStyle={
          filteredConversations.length === 0 && styles.emptyList
        }
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={
          loading && !refreshing ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color={colors.red} />
            </View>
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

      {/* Floating Create Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateConversation}
        activeOpacity={0.8}
      >
        <Ionicons name="create-outline" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
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
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: colors.red,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
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
});
