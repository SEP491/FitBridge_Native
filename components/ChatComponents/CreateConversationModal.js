import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Image,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import messageService from "../../services/messageService";
import colors from "../../constants/color";
import { fetchUserFromStorage } from "../../lib";

const CreateConversationModal = ({
  visible,
  onClose,
  onConversationCreated,
}) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGroup, setIsGroup] = useState(false);
  const [initialMessage, setInitialMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [creating, setCreating] = useState(false);
  const pageNumberRef = useRef(1);

  // Fetch current user ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userData = await fetchUserFromStorage();
        setCurrentUserId(userData.id);
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error fetching current user", error);
      }
    };
    if (visible) {
      fetchCurrentUser();
    }
  }, [visible]);

  // Fetch users when modal opens
  useEffect(() => {
    if (visible) {
      fetchUsers(true);
    } else {
      // Reset state when modal closes
      setUsers([]);
      setSelectedUsers([]);
      setSearchQuery("");
      setIsGroup(false);
      setInitialMessage("");
      setPageNumber(1);
      pageNumberRef.current = 1;
      setHasMore(true);
    }
  }, [visible]);

  // Update ref when pageNumber changes
  useEffect(() => {
    pageNumberRef.current = pageNumber;
  }, [pageNumber]);

  // Fetch users
  const fetchUsers = async (reset = false, searchText = null) => {
    if (fetchingUsers) return;

    try {
      setFetchingUsers(true);
      const currentPage = reset ? 1 : pageNumberRef.current;
      const search = searchText !== null ? searchText : searchQuery;
      const params = {
        pageNumber: currentPage,
        pageSize: 20,
        ...(search && { searchQuery: search }),
      };

      const response = await messageService.getUsersConversations(params);
      const fetchedUsers = response.data?.items || [];

      // Filter out current user
      const filteredUsers = fetchedUsers.filter(
        (user) => user.id !== currentUserId
      );

      if (reset) {
        setUsers(filteredUsers);
        setPageNumber(1);
        pageNumberRef.current = 1;
      } else {
        setUsers((prev) => [...prev, ...filteredUsers]);
        const nextPage = pageNumberRef.current + 1;
        setPageNumber(nextPage);
        pageNumberRef.current = nextPage;
      }

      setHasMore(filteredUsers.length >= 20);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setFetchingUsers(false);
    }
  };

  // Search users
  useEffect(() => {
    if (visible) {
      const timeoutId = setTimeout(() => {
        fetchUsers(true, searchQuery);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, visible]);

  // Toggle user selection
  const toggleUserSelection = (user) => {
    if (selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // Handle create conversation
  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) {
      return;
    }

    // For non-group conversations, only one user should be selected
    if (!isGroup && selectedUsers.length !== 1) {
      return;
    }

    // For group conversations, at least 2 users are required
    if (isGroup && selectedUsers.length < 2) {
      return;
    }

    try {
      setCreating(true);

      // Format members according to API requirements
      // Always include current user as a member
      const members = [];

      if (currentUserId && currentUser) {
        members.push({
          memberId: currentUser.id,
          memberName: currentUser.fullName || "",
          memberAvatarUrl: currentUser.avatarUrl || "",
        });
      }

      selectedUsers.forEach((user) => {
        // Avoid any accidental duplication
        if (user.id === currentUserId) return;

        members.push({
          memberId: user.id,
          memberName: user.fullName,
          memberAvatarUrl: user.avatarUrl || "",
        });
      });

      const conversationData = {
        isGroup,
        members,
        newMessageContent: initialMessage || "Hello!",
        groupImage: isGroup ? null : null, // Can be extended later for group images
      };

      const response = await messageService.createConversation(
        conversationData
      );

      // Reset modal state
      setSelectedUsers([]);
      setInitialMessage("");
      setIsGroup(false);

      // Call callback with created conversation
      if (onConversationCreated) {
        onConversationCreated(response.data);
      }

      onClose();
    } catch (error) {
      console.error("Error creating conversation:", error);
      // You might want to show an error message to the user here
    } finally {
      setCreating(false);
    }
  };

  // Render user item
  const renderUserItem = ({ item }) => {
    const isSelected = selectedUsers.some((u) => u.id === item.id);

    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected && styles.userItemSelected]}
        onPress={() => toggleUserSelection(item)}
        activeOpacity={0.7}
      >
        <View style={styles.userAvatarContainer}>
          {item.avatarUrl ? (
            <Image
              source={{ uri: item.avatarUrl }}
              style={styles.userAvatar}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.userAvatarPlaceholder}>
              <Ionicons name="person" size={24} color={colors.red} />
            </View>
          )}
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.fullName}</Text>
          <Text style={styles.userRole}>{item.userRole}</Text>
        </View>

        {isSelected && (
          <View style={styles.checkmarkContainer}>
            <Ionicons name="checkmark-circle" size={24} color={colors.red} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render footer
  const renderFooter = () => {
    if (!fetchingUsers) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.red} />
      </View>
    );
  };

  const canCreate =
    selectedUsers.length > 0 &&
    (!isGroup ? selectedUsers.length === 1 : selectedUsers.length >= 2);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>New Conversation</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-circle-outline" size={28} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search-outline" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search users..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Group Toggle */}
          <View style={styles.groupToggleContainer}>
            <View style={styles.groupToggleInfo}>
              <Text style={styles.groupToggleLabel}>Group Conversation</Text>
              <Text style={styles.groupToggleHint}>
                {isGroup
                  ? "Select multiple users"
                  : "Select one user for direct message"}
              </Text>
            </View>
            <Switch
              value={isGroup}
              onValueChange={setIsGroup}
              trackColor={{ false: "#D1D5DB", true: colors.red }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Initial Message Input */}
          <View style={styles.messageInputContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder="Initial message (optional)"
              placeholderTextColor="#9CA3AF"
              value={initialMessage}
              onChangeText={setInitialMessage}
              multiline
              maxLength={500}
            />
          </View>

          {/* Selected Users Count */}
          {selectedUsers.length > 0 && (
            <View style={styles.selectedCountContainer}>
              <Text style={styles.selectedCountText}>
                {selectedUsers.length} user
                {selectedUsers.length !== 1 ? "s" : ""} selected
              </Text>
            </View>
          )}

          {/* Users List */}
          <FlatList
            data={users}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            ListFooterComponent={renderFooter}
            onEndReached={() => {
              if (hasMore && !fetchingUsers) {
                fetchUsers(false);
              }
            }}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              !fetchingUsers ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                  <Text style={styles.emptyText}>No users found</Text>
                </View>
              ) : null
            }
          />

          {/* Create Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.createButton,
                (!canCreate || creating) && styles.createButtonDisabled,
              ]}
              onPress={handleCreateConversation}
              disabled={!canCreate || creating}
              activeOpacity={0.8}
            >
              {creating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.createButtonText}>Create Conversation</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  groupToggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  groupToggleInfo: {
    flex: 1,
  },
  groupToggleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  groupToggleHint: {
    fontSize: 13,
    color: "#6B7280",
  },
  messageInputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  messageInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    minHeight: 44,
    maxHeight: 100,
    textAlignVertical: "top",
  },
  selectedCountContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F0F9FF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  selectedCountText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.red,
  },
  listContent: {
    paddingVertical: 8,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  userItemSelected: {
    backgroundColor: "#F0F9FF",
  },
  userAvatarContainer: {
    marginRight: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E5E7EB",
  },
  userAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 2,
  },
  userRole: {
    fontSize: 13,
    color: "#6B7280",
  },
  checkmarkContainer: {
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  createButton: {
    backgroundColor: colors.red,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  createButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
});

export default CreateConversationModal;
