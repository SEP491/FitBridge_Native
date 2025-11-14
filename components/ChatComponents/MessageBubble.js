import React, { useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatDistanceToNow } from "date-fns";

const { width } = Dimensions.get("window");

const MessageBubble = ({
  message,
  isCurrentUser,
  onImagePress,
  onReply,
  onLongPress,
}) => {
  const messageRef = useRef(null);

  const {
    content,
    createdAt,
    mediaType,
    mediaUrl,
    messageType,
    status,
    reaction,
    senderName,
    senderAvatarUrl,
    replyToMessageContent,
    replyToMessageMediaType,
    deliveryStatus,
    isUploading,
    isDeleted,
  } = message;

  // Handle long press with layout measurement
  const handleLongPress = () => {
    if (isUploading || !onLongPress) return;

    if (messageRef.current) {
      messageRef.current.measureInWindow((x, y, width, height) => {
        onLongPress(message, { x, y, width, height });
      });
    }
  };

  // Format time
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "";
    }
  };

  // System message (centered)
  if (messageType === "System") {
    return (
      <View style={styles.systemMessageContainer}>
        <View style={styles.systemMessageBubble}>
          <Text style={styles.systemMessageText}>{content}</Text>
        </View>
      </View>
    );
  }

  return (
    <View
      ref={messageRef}
      style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
      ]}
    >
      {/* Avatar for other user */}
      {!isCurrentUser && (
        <Image
          source={{
            uri: senderAvatarUrl,
          }}
          style={styles.avatar}
          resizeMode="cover"
        />
      )}

      <View style={styles.bubbleWrapper}>
        {/* Sender name for other user */}
        {!isCurrentUser && <Text style={styles.senderName}>{senderName}</Text>}

        {/* Reply preview */}
        {replyToMessageContent && (
          <View style={styles.replyPreview}>
            <View style={styles.replyLine} />
            <View style={styles.replyContent}>
              <Text style={styles.replyLabel}>Replying to</Text>
              <Text style={styles.replyText} numberOfLines={2}>
                {replyToMessageMediaType === "Image"
                  ? "📷 Photo"
                  : replyToMessageContent}
              </Text>
            </View>
          </View>
        )}

        {/* Message bubble */}
        <TouchableOpacity
          activeOpacity={1}
          onLongPress={handleLongPress}
          delayLongPress={500}
        >
          <View
            style={[
              styles.bubble,
              isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
              isDeleted && styles.deletedBubble,
            ]}
          >
            {/* Image message */}
            {mediaType === "Image" && !isDeleted && (
              <TouchableOpacity
                onPress={() =>
                  !isUploading &&
                  onImagePress &&
                  onImagePress(mediaUrl || content)
                }
                onLongPress={handleLongPress}
                delayLongPress={500}
                activeOpacity={0.9}
                disabled={isUploading}
              >
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: mediaUrl || content }}
                    style={styles.messageImage}
                    resizeMode="cover"
                  />
                  {isUploading && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator size="large" color="#FFFFFF" />
                      <Text style={styles.uploadingText}>Uploading...</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )}

            {/* Deleted message (for both text and image) */}
            {isDeleted && (
              <View style={styles.deletedMessageContainer}>
                <Ionicons
                  name="ban-outline"
                  size={16}
                  color="#9CA3AF"
                  style={styles.deletedIcon}
                />
                <Text
                  style={[
                    styles.messageText,
                    isCurrentUser
                      ? styles.currentUserText
                      : styles.otherUserText,
                    styles.deletedText,
                  ]}
                >
                  This message was deleted
                </Text>
              </View>
            )}

            {/* Text message */}
            {mediaType === "Text" && !isDeleted && (
              <View>
                <Text
                  style={[
                    styles.messageText,
                    isCurrentUser
                      ? styles.currentUserText
                      : styles.otherUserText,
                  ]}
                >
                  {content}
                </Text>
              </View>
            )}

            {/* Message info (time, status, edited) */}
            <View style={styles.messageInfo}>
              {status === "Edited" && (
                <Text
                  style={
                    (styles.editedText,
                    isCurrentUser
                      ? styles.currentUserEditedText
                      : styles.otherUserEditedText)
                  }
                >
                  Edited •{" "}
                </Text>
              )}
              <Text
                style={[
                  styles.timeText,
                  isCurrentUser
                    ? styles.currentUserTimeText
                    : styles.otherUserTimeText,
                ]}
              >
                {formatTime(createdAt)}
              </Text>
              {isCurrentUser && (
                <View style={styles.statusIcon}>
                  {deliveryStatus === "Sent" && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                  {deliveryStatus === "Read" && (
                    <Ionicons name="checkmark-done" size={14} color="#FFFFFF" />
                  )}
                </View>
              )}
            </View>

            {/* Reaction */}
            {reaction && (
              <View
                style={[
                  styles.reactionBubble,
                  isCurrentUser
                    ? styles.reactionBubbleRight
                    : styles.reactionBubbleLeft,
                ]}
              >
                <Text style={styles.reactionText}>{reaction}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Avatar for current user */}
      {isCurrentUser && (
        <Image
          source={{
            uri: senderAvatarUrl,
          }}
          style={styles.avatar}
          resizeMode="cover"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: "row",
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  currentUserContainer: {
    justifyContent: "flex-end",
  },
  otherUserContainer: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 8,
    backgroundColor: "#E5E7EB",
  },
  bubbleWrapper: {
    maxWidth: width * 0.7,
  },
  senderName: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
    marginLeft: 12,
  },
  replyPreview: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 8,
    padding: 8,
    marginBottom: 4,
  },
  replyLine: {
    width: 3,
    backgroundColor: "#ED2A46",
    borderRadius: 2,
    marginRight: 8,
  },
  replyContent: {
    // flex: 1,
  },
  replyLabel: {
    fontSize: 11,
    color: "#ED2A46",
    fontWeight: "600",
    marginBottom: 2,
  },
  replyText: {
    fontSize: 13,
    color: "#6B7280",
  },
  bubble: {
    borderRadius: 16,
    padding: 12,
    position: "relative",
  },
  currentUserBubble: {
    backgroundColor: "#ED2A46",
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: "#F3F4F6",
    borderBottomLeftRadius: 4,
  },
  deletedBubble: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    opacity: 0.7,
  },
  deletedMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  deletedIcon: {
    marginRight: 6,
  },
  deletedText: {
    fontStyle: "italic",
    color: "#9CA3AF",
  },
  imageContainer: {
    position: "relative",
  },
  messageImage: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 8,
    marginBottom: 4,
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 4,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadingText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  currentUserText: {
    color: "#FFFFFF",
  },
  otherUserText: {
    color: "#111827",
  },
  messageInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  editedText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
  },
  timeText: {
    fontSize: 11,
  },
  currentUserTimeText: {
    color: "#9CA3AF",
  },
  otherUserTimeText: {
    color: "#9CA3AF",
  },
  currentUserEditedText: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  otherUserEditedText: {
    color: "#6B7280",
  },
  statusIcon: {
    marginLeft: 4,
  },
  reactionBubble: {
    position: "absolute",
    bottom: -8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reactionBubbleLeft: {
    left: 12,
  },
  reactionBubbleRight: {
    right: 12,
  },
  reactionText: {
    fontSize: 14,
  },
  systemMessageContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  systemMessageBubble: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    maxWidth: width * 0.8,
  },
  systemMessageText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
});

export default MessageBubble;
