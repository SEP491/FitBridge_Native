import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatDistanceToNow } from "date-fns";

const ConversationCard = ({
  conversation,
  onPress,
  currentUserId,
  userPresences = {},
}) => {
  const {
    id,
    isGroup,
    title,
    updatedAt,
    lastMessageContent,
    lastMessageType,
    lastMessageMediaType,
    lastMessageSenderName,
    lastMessageSenderId,
    isRead,
    conversationImg,
    members,
  } = conversation;

  // Get other user ID (for non-group chats)
  const getOtherUserId = () => {
    if (isGroup || !members || members.length !== 2) return null;
    const otherMember = members.find((m) => {
      // Handle if member is an object with userId or id property
      const memberId = typeof m === "string" ? m : m.userId || m.id;
      return memberId !== currentUserId;
    });
    // Return the userId or id from the member object
    return typeof otherMember === "string"
      ? otherMember
      : otherMember?.userId || otherMember?.id;
  };

  const otherUserId = getOtherUserId();
  const isOnline = otherUserId ? userPresences[otherUserId] : false;

  // Get first letter of title for avatar placeholder
  const getInitialLetter = () => {
    if (!title || title.trim() === "") return "?";
    return title.trim().charAt(0).toUpperCase();
  };

  // Check if conversationImg is valid
  const hasValidImage = conversationImg && conversationImg.trim() !== "";

  // Format the last message time
  const formatTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "";
    }
  };

  // Format last message preview
  const getLastMessagePreview = () => {
    if (lastMessageType === "System") {
      return lastMessageContent;
    }

    const senderPrefix =
      lastMessageSenderId === currentUserId
        ? "You: "
        : `${lastMessageSenderName}: `;

    switch (lastMessageMediaType) {
      case "Text":
        return `${senderPrefix}${lastMessageContent}`;
      case "Image":
        return `${senderPrefix}📷 Photo`;
      case "Video":
        return `${senderPrefix}🎥 Video`;
      case "Audio":
        return `${senderPrefix}🎵 Audio`;
      case "BookingRequest":
        return lastMessageContent;
      default:
        return lastMessageContent;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, !isRead && styles.unreadContainer]}
      onPress={() => onPress(conversation)}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {hasValidImage ? (
          <Image
            source={{ uri: conversationImg }}
            style={styles.avatar}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>
              {getInitialLetter()}
            </Text>
          </View>
        )}
        {!isRead && <View style={styles.unreadBadge} />}
        {!isGroup && isOnline && <View style={styles.onlineIndicator} />}
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text
            style={[styles.title, !isRead && styles.unreadTitle]}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text style={styles.time}>{formatTime(updatedAt)}</Text>
        </View>

        <View style={styles.messageRow}>
          <Text
            style={[styles.lastMessage, !isRead && styles.unreadMessage]}
            numberOfLines={2}
          >
            {getLastMessagePreview()}
          </Text>
          {!isRead && (
            <View style={styles.unreadIndicator}>
              <View style={styles.unreadDot} />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  unreadContainer: {
    backgroundColor: "#F9FAFB",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E5E7EB",
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#9CA3AF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholderText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  unreadBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#ED2A46",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    fontWeight: "700",
    color: "#000000",
  },
  time: {
    fontSize: 12,
    color: "#6B7280",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lastMessage: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
    marginRight: 8,
  },
  unreadMessage: {
    fontWeight: "600",
    color: "#374151",
  },
  unreadIndicator: {
    marginLeft: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ED2A46",
  },
});

export default ConversationCard;
