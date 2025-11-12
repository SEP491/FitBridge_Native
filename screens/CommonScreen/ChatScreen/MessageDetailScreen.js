import React, { useState, useRef, useCallback } from "react";
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
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  MessageBubble,
  BookingRequestCard,
} from "../../../components/ChatComponents";
import colors from "../../../constants/color";

export default function MessageDetailScreen({ route, navigation }) {
  const { conversationId, conversationTitle, conversationImg } =
    route.params || {};

  const [messages, setMessages] = useState(getMockMessages());
  const [inputText, setInputText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const flatListRef = useRef(null);
  const currentUserId = "126ec3d4-4d34-45f2-bbf7-98b9a3dfc31c"; // john

  // Handle send message
  const handleSend = useCallback(() => {
    if (inputText.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        content: inputText.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: null,
        isDeleted: false,
        mediaType: "Text",
        messageType: "User",
        conversationId: conversationId,
        deliveryStatus: "Sent",
        status: null,
        replyToMessageId: replyingTo?.id || null,
        replyToMessageContent: replyingTo?.content || null,
        replyToMessageMediaType: replyingTo?.mediaType || null,
        senderId: currentUserId,
        reaction: null,
        senderName: "john",
        senderAvatarUrl:
          "https://static.wikia.nocookie.net/gokurakugai/images/0/0a/Tao_Saotome_Portrait.png/revision/latest?cb=20240608031140",
        bookingRequest: null,
      };

      setMessages((prev) => [newMessage, ...prev]);
      setInputText("");
      setReplyingTo(null);
    }
  }, [inputText, replyingTo, conversationId, currentUserId]);

  // Handle booking action
  const handleBookingAction = useCallback((bookingRequestId, action) => {
    console.log(`Booking ${action}:`, bookingRequestId);
    // Update booking status locally
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.bookingRequest?.bookingRequestId === bookingRequestId) {
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
  }, []);

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
          <Text style={styles.headerSubtitle}>Active now</Text>
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
          onChangeText={setInputText}
          multiline
          maxLength={1000}
        />

        {inputText.trim() ? (
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={20} color="#FFFFFF" />
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
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        />

        {renderInputArea()}
      </KeyboardAvoidingView>

      {renderImageViewer()}
    </SafeAreaView>
  );
}

// Mock messages data
const getMockMessages = () => [
  {
    id: "23475a5f-77a5-4336-bf7c-167b5db46f22",
    content: "john has approved the booking request",
    createdAt: "2025-11-12T07:35:56.005688Z",
    updatedAt: null,
    isDeleted: false,
    mediaType: "Text",
    messageType: "System",
    conversationId: "c2e60ad7-8f05-4ba7-afb9-3984251cc1bb",
    deliveryStatus: "None",
    status: null,
    replyToMessageId: null,
    replyToMessageContent: null,
    replyToMessageMediaType: null,
    senderId: null,
    reaction: null,
    senderName: null,
    senderAvatarUrl: null,
    bookingRequest: null,
  },
  {
    id: "904617f3-7c8a-44c1-8690-a656ec7e2b91",
    content: "doe has edited the booking request",
    createdAt: "2025-11-12T07:35:41.202868Z",
    updatedAt: null,
    isDeleted: false,
    mediaType: "Text",
    messageType: "System",
    conversationId: "c2e60ad7-8f05-4ba7-afb9-3984251cc1bb",
    deliveryStatus: "None",
    status: null,
    replyToMessageId: null,
    replyToMessageContent: null,
    replyToMessageMediaType: null,
    senderId: null,
    reaction: null,
    senderName: null,
    senderAvatarUrl: null,
    bookingRequest: null,
  },
  {
    id: "ee8dc1d5-a597-4803-ae0a-28727caa4c89",
    content: "",
    createdAt: "2025-11-12T07:35:23.515165Z",
    updatedAt: null,
    isDeleted: false,
    mediaType: "BookingRequest",
    messageType: "User",
    conversationId: "c2e60ad7-8f05-4ba7-afb9-3984251cc1bb",
    deliveryStatus: "Sent",
    status: null,
    replyToMessageId: null,
    replyToMessageContent: null,
    replyToMessageMediaType: null,
    senderId: "126ec3d4-4d34-45f2-bbf7-98b9a3dfc31c",
    reaction: null,
    senderName: "john",
    senderAvatarUrl:
      "https://static.wikia.nocookie.net/gokurakugai/images/0/0a/Tao_Saotome_Portrait.png/revision/latest?cb=20240608031140",
    bookingRequest: {
      bookingRequestId: "019a76fd-9c7d-710d-99cc-ee13382759f2",
      requestStatus: "Approved",
      requestType: "PtUpdate",
      startTime: "09:00:00",
      endTime: "09:30:00",
      bookingDate: "2025-11-14",
      targetBookingId: null,
      note: null,
      bookingName: "Initial Consultation1231",
    },
  },
  {
    id: "235240bd-6a6d-4f9b-9ddd-3f5d8b1a53ae",
    content: "john has created a booking request",
    createdAt: "2025-11-12T07:35:18.517562Z",
    updatedAt: null,
    isDeleted: false,
    mediaType: "Text",
    messageType: "System",
    conversationId: "c2e60ad7-8f05-4ba7-afb9-3984251cc1bb",
    deliveryStatus: "None",
    status: null,
    replyToMessageId: null,
    replyToMessageContent: null,
    replyToMessageMediaType: null,
    senderId: null,
    reaction: null,
    senderName: null,
    senderAvatarUrl: null,
    bookingRequest: null,
  },
  {
    id: "629e95ad-22c1-4cd9-9dca-ba75ef8eb903",
    content:
      "https://res.cloudinary.com/dfdq4xhtm/image/upload/v1762932866/FitBridge/small-orange-kitten_43d5a8d0-102f-4868-a515-e51d1c2d3563.png",
    createdAt: "2025-11-12T07:34:27.099918Z",
    updatedAt: null,
    isDeleted: false,
    mediaType: "Image",
    messageType: "User",
    conversationId: "c2e60ad7-8f05-4ba7-afb9-3984251cc1bb",
    deliveryStatus: "Sent",
    status: null,
    replyToMessageId: null,
    replyToMessageContent: null,
    replyToMessageMediaType: null,
    senderId: "126ec3d4-4d34-45f2-bbf7-98b9a3dfc31c",
    reaction: null,
    senderName: "john",
    senderAvatarUrl:
      "https://static.wikia.nocookie.net/gokurakugai/images/0/0a/Tao_Saotome_Portrait.png/revision/latest?cb=20240608031140",
    bookingRequest: null,
  },
  {
    id: "16eed9a8-9c65-4618-beb8-91315f60141f",
    content: "bye",
    createdAt: "2025-11-12T07:33:47.257775Z",
    updatedAt: "2025-11-12T07:34:07.083923Z",
    isDeleted: false,
    mediaType: "Text",
    messageType: "User",
    conversationId: "c2e60ad7-8f05-4ba7-afb9-3984251cc1bb",
    deliveryStatus: "Sent",
    status: "Edited",
    replyToMessageId: "27c838c2-def9-4ddd-b5b1-070a828de890",
    replyToMessageContent: "herere",
    replyToMessageMediaType: "Text",
    senderId: "126ec3d4-4d34-45f2-bbf7-98b9a3dfc31c",
    reaction: null,
    senderName: "john",
    senderAvatarUrl:
      "https://static.wikia.nocookie.net/gokurakugai/images/0/0a/Tao_Saotome_Portrait.png/revision/latest?cb=20240608031140",
    bookingRequest: null,
  },
  {
    id: "e5625877-2592-4ec2-af6b-dbe288998b9b",
    content: "helo",
    createdAt: "2025-11-12T07:32:52.618247Z",
    updatedAt: "2025-11-12T07:34:03.976634Z",
    isDeleted: false,
    mediaType: "Text",
    messageType: "User",
    conversationId: "c2e60ad7-8f05-4ba7-afb9-3984251cc1bb",
    deliveryStatus: "Sent",
    status: "Edited",
    replyToMessageId: null,
    replyToMessageContent: null,
    replyToMessageMediaType: null,
    senderId: "126ec3d4-4d34-45f2-bbf7-98b9a3dfc31c",
    reaction: "👍",
    senderName: "john",
    senderAvatarUrl:
      "https://static.wikia.nocookie.net/gokurakugai/images/0/0a/Tao_Saotome_Portrait.png/revision/latest?cb=20240608031140",
    bookingRequest: null,
  },
  {
    id: "e81fd15f-f48a-430e-acca-2db3f068b2f2",
    content: "Here 123",
    createdAt: "2025-11-12T07:32:46.422474Z",
    updatedAt: "2025-11-12T07:33:35.319065Z",
    isDeleted: false,
    mediaType: "Text",
    messageType: "User",
    conversationId: "c2e60ad7-8f05-4ba7-afb9-3984251cc1bb",
    deliveryStatus: "None",
    status: "Edited",
    replyToMessageId: null,
    replyToMessageContent: null,
    replyToMessageMediaType: null,
    senderId: "126ec3d4-4d34-45f2-bbf7-98b9a3dfc31d",
    reaction: null,
    senderName: "doe",
    senderAvatarUrl:
      "https://images.unsplash.com/photo-1593483316242-efb5420596ca?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8b3JhbmdlJTIwY2F0fGVufDB8fDB8fHww&fm=jpg&q=60&w=3000",
    bookingRequest: null,
  },
  {
    id: "f83e25ad-ac87-455b-b59e-1aa8e08fc652",
    content: "doe has approved the booking request",
    createdAt: "2025-11-12T06:52:19.347739Z",
    updatedAt: null,
    isDeleted: false,
    mediaType: "Text",
    messageType: "System",
    conversationId: "c2e60ad7-8f05-4ba7-afb9-3984251cc1bb",
    deliveryStatus: "Read",
    status: null,
    replyToMessageId: null,
    replyToMessageContent: null,
    replyToMessageMediaType: null,
    senderId: null,
    reaction: null,
    senderName: null,
    senderAvatarUrl: null,
    bookingRequest: null,
  },
  {
    id: "27c838c2-def9-4ddd-b5b1-070a828de890",
    content: "herere",
    createdAt: "2025-11-12T06:51:15.47732Z",
    updatedAt: null,
    isDeleted: false,
    mediaType: "Text",
    messageType: "User",
    conversationId: "c2e60ad7-8f05-4ba7-afb9-3984251cc1bb",
    deliveryStatus: "Sent",
    status: null,
    replyToMessageId: null,
    replyToMessageContent: null,
    replyToMessageMediaType: null,
    senderId: "126ec3d4-4d34-45f2-bbf7-98b9a3dfc31c",
    reaction: null,
    senderName: "john",
    senderAvatarUrl:
      "https://static.wikia.nocookie.net/gokurakugai/images/0/0a/Tao_Saotome_Portrait.png/revision/latest?cb=20240608031140",
    bookingRequest: null,
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
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
});
