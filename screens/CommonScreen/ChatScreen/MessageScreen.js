import React, { useState, useCallback } from "react";
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
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import ConversationCard from "../../../components/ChatComponents/ConversationCard";
import colors from "../../../constants/color";

export default function MessageScreen({ navigation }) {
  const [conversations, setConversations] = useState(getMockConversations());
  const [filteredConversations, setFilteredConversations] = useState(
    getMockConversations()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch conversations (using mock data)
  const fetchConversations = useCallback(() => {
    setRefreshing(true);
    // Simulate loading delay
    setTimeout(() => {
      const mockData = getMockConversations();
      setConversations(mockData);
      setFilteredConversations(mockData);
      setRefreshing(false);
    }, 500);
  }, []);

  // Handle refresh
  const onRefresh = useCallback(() => {
    fetchConversations();
  }, [fetchConversations]);

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
  const handleConversationPress = (conversation) => {
    // Mark as read locally
    if (!conversation.isRead) {
      setConversations((prev) =>
        prev.map((c) => (c.id === conversation.id ? { ...c, isRead: true } : c))
      );
      setFilteredConversations((prev) =>
        prev.map((c) => (c.id === conversation.id ? { ...c, isRead: true } : c))
      );
    }

    // Navigate to chat screen with conversation data
    navigation.navigate("MessageDetailScreen", {
      conversationId: conversation.id,
      conversationTitle: conversation.title,
      conversationImg: conversation.conversationImg,
    });
  };

  // Handle create new conversation
  const handleCreateConversation = () => {
    // navigation.navigate("CreateConversation");
  };

  // Get unread count
  const unreadCount = conversations.filter((c) => !c.isRead).length;

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
            currentUserId="126ec3d4-4d34-45f2-bbf7-98b9a3dfc31c"
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          filteredConversations.length === 0 && styles.emptyList
        }
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.red}
            colors={[colors.red]}
          />
        }
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

// Mock data for development
const getMockConversations = () => [
  {
    id: "c2e60ad7-8f05-4ba7-afb9-3984251cc1bb",
    isGroup: false,
    title: "doe",
    updatedAt: "2025-11-12T06:52:19.347739Z",
    lastMessageContent: "doe has approved the booking request",
    lastMessageType: "System",
    lastMessageMediaType: "BookingRequest",
    lastMessageSenderName: "john",
    lastMessageSenderId: "126ec3d4-4d34-45f2-bbf7-98b9a3dfc31c",
    isRead: true,
    conversationImg:
      "https://images.unsplash.com/photo-1593483316242-efb5420596ca?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8b3JhbmdlJTIwY2F0fGVufDB8fDB8fHww&fm=jpg&q=60&w=3000",
    members: [
      {
        userId: "126ec3d4-4d34-45f2-bbf7-98b9a3dfc31c",
        username: "john",
        avatarUrl:
          "https://static.wikia.nocookie.net/gokurakugai/images/0/0a/Tao_Saotome_Portrait.png/revision/latest?cb=20240608031140",
        role: "Customer",
      },
      {
        userId: "126ec3d4-4d34-45f2-bbf7-98b9a3dfc31d",
        username: "doe",
        avatarUrl:
          "https://images.unsplash.com/photo-1593483316242-efb5420596ca?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8b3JhbmdlJTIwY2F0fGVufDB8fDB8fHww&fm=jpg&q=60&w=3000",
        role: "Pt",
      },
    ],
  },
  {
    id: "99e7ac6b-ad15-4d90-8dca-0361edf88321",
    isGroup: false,
    title: "jerry",
    updatedAt: "2025-11-12T06:44:34.819465Z",
    lastMessageContent: "Reply",
    lastMessageType: "User",
    lastMessageMediaType: "Text",
    lastMessageSenderName: "jerry",
    lastMessageSenderId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    isRead: false,
    conversationImg:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWYhiYyxVZlJb1tuhnhvf9tdim8ZrQWAqeyg&s",
    members: [
      {
        userId: "126ec3d4-4d34-45f2-bbf7-98b9a3dfc31c",
        username: "john",
        avatarUrl:
          "https://static.wikia.nocookie.net/gokurakugai/images/0/0a/Tao_Saotome_Portrait.png/revision/latest?cb=20240608031140",
        role: "Customer",
      },
      {
        userId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        username: "jerry",
        avatarUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWYhiYyxVZlJb1tuhnhvf9tdim8ZrQWAqeyg&s",
        role: "Customer",
      },
    ],
  },
  {
    id: "81cf7bac-583b-470f-9620-89220341328f",
    isGroup: false,
    title: "tom",
    updatedAt: "2025-11-10T11:16:54.104937Z",
    lastMessageContent: "yellow",
    lastMessageType: "User",
    lastMessageMediaType: "Text",
    lastMessageSenderName: "tom",
    lastMessageSenderId: "126ec3d4-4d34-45f2-bbf7-98b9a3dfc31e",
    isRead: true,
    conversationImg:
      "https://cdn.hanna-barberawiki.com/thumb/8/85/Tom_Cat.png/800px-Tom_Cat.png",
    members: [
      {
        userId: "126ec3d4-4d34-45f2-bbf7-98b9a3dfc31c",
        username: "john",
        avatarUrl:
          "https://static.wikia.nocookie.net/gokurakugai/images/0/0a/Tao_Saotome_Portrait.png/revision/latest?cb=20240608031140",
        role: "Customer",
      },
      {
        userId: "126ec3d4-4d34-45f2-bbf7-98b9a3dfc31e",
        username: "tom",
        avatarUrl:
          "https://cdn.hanna-barberawiki.com/thumb/8/85/Tom_Cat.png/800px-Tom_Cat.png",
        role: "Pt",
      },
    ],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
