import React, { useState, useEffect, useRef, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { TouchableWithoutFeedback } from "react-native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  ActivityIndicator,
  Animated,
  Image,
  Dimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import chatbotService from "../../../services/chatbotService";
import { useLocationContext } from "../../../context/LocationContext";
import { useTranslation } from "../../../hooks/useTranslation";
import { t } from "../../../i18n";
import {
  GymCardsList,
  TrainerCardsList,
} from "../../../components/ChatComponents";
import { useRevenueCat } from "../../../context/RevenueCatContext";
import LoadingIndicator from "../../../components/LoadingIndicator";
import { useUser } from "../../../context/UserContext";

const { width } = Dimensions.get("window");
const MarkdownText = ({ text, style }) => {
  const parseMarkdownText = (text) => {
    const elements = [];
    let currentIndex = 0;
    let key = 0;

    // Split text by markdown patterns - order matters: bold first, then italic
    const patterns = [
      { regex: /\*\*(.*?)\*\*/g, type: "bold" },
      { regex: /(?<!\*)\*(?!\*)([^*]+?)\*(?!\*)/g, type: "italic" }, // Improved regex to avoid conflicts
    ];

    // Find all markdown matches
    const matches = [];
    patterns.forEach((pattern) => {
      let match;
      pattern.regex.lastIndex = 0; // Reset regex state
      while ((match = pattern.regex.exec(text)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          content: match[1] || match[2], // Handle different capture groups
          type: pattern.type,
          original: match[0],
        });
      }
    });

    // Sort matches by position
    matches.sort((a, b) => a.start - b.start);

    // Remove overlapping matches (prioritize bold over italic)
    const filteredMatches = [];
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      let overlaps = false;

      for (let j = 0; j < filteredMatches.length; j++) {
        const existing = filteredMatches[j];
        if (current.start < existing.end && current.end > existing.start) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        filteredMatches.push(current);
      }
    }

    // Build elements array
    let lastIndex = 0;

    filteredMatches.forEach((match) => {
      // Add text before match
      if (match.start > lastIndex) {
        const beforeText = text.substring(lastIndex, match.start);
        if (beforeText) {
          elements.push(
            <Text key={key++} style={style}>
              {beforeText}
            </Text>
          );
        }
      }

      // Add formatted text
      const formattedStyle = [style];
      if (match.type === "bold") {
        formattedStyle.push(styles.boldText);
      } else if (match.type === "italic") {
        formattedStyle.push(styles.italicText);
      } else if (match.type === "code") {
        formattedStyle.push(styles.codeText);
      }

      elements.push(
        <Text key={key++} style={formattedStyle}>
          {match.content}
        </Text>
      );

      lastIndex = match.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (remainingText) {
        elements.push(
          <Text key={key++} style={style}>
            {remainingText}
          </Text>
        );
      }
    }

    return elements.length > 0
      ? elements
      : [
          <Text key={0} style={style}>
            {text}
          </Text>,
        ];
  };

  return <Text style={style}>{parseMarkdownText(text)}</Text>;
};

// Typing indicator component similar to Facebook Messenger
const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animation1 = animateDot(dot1, 0);
    const animation2 = animateDot(dot2, 200);
    const animation3 = animateDot(dot3, 400);

    animation1.start();
    animation2.start();
    animation3.start();

    return () => {
      animation1.stop();
      animation2.stop();
      animation3.stop();
    };
  }, []);

  return (
    <View style={styles.typingContainer}>
      <View style={styles.aiAvatar}>
        <Ionicons name="sparkles" size={16} color="#EF4444" />
      </View>
      <View style={styles.typingBubble}>
        <View style={styles.typingDots}>
          <Animated.View
            style={[
              styles.typingDot,
              {
                opacity: dot1,
                transform: [
                  {
                    scale: dot1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.3],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.typingDot,
              {
                opacity: dot2,
                transform: [
                  {
                    scale: dot2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.3],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.typingDot,
              {
                opacity: dot3,
                transform: [
                  {
                    scale: dot3.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.3],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

// Floating Clear Button Component
const FloatingClearButton = ({ onPress, isVisible }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  return (
    <Animated.View
      style={[
        styles.floatingButton,
        {
          opacity: fadeAnim,
          transform: [
            {
              scale: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        },
      ]}
      pointerEvents={isVisible ? "auto" : "none"}
    >
      <TouchableOpacity
        style={styles.clearButton}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Ionicons name="trash-outline" size={24} color="#EF4444" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ChatbotScreen({ navigation }) {
  const { location, hasLocation, coordinates } = useLocationContext();
  const { t } = useTranslation();
  const [coords, setCoords] = useState({});
  // Add navigation prop
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  // One thread ID per chat session for conversation persistence
  const generateThreadId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback: pseudo-UUID using timestamp and random numbers
    const timestamp = Date.now().toString(16);
    const random = Math.random().toString(16).substring(2, 10);
    const random2 = Math.random().toString(16).substring(2, 10);
    return `${timestamp}-${random}-${random2}`;
  };
  const threadIdRef = useRef(generateThreadId());
  const flatListRef = useRef(null);
  const textInputRef = useRef(null);
  const { isPremiumUser, presentPaywall } = useRevenueCat();
  const { avatarUrl } = useUser();
  // Initialize greeting message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: t("chat.aiGreeting"),
          isAI: true,
          timestamp: new Date(),
        },
      ]);
    }
  }, [t]);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Update location from context when available
  useFocusEffect(
    useCallback(() => {
      if (hasLocation && coordinates) {
        console.log("� Using location from context:", coordinates);
        setCoords(coordinates);
      } else {
        // Use default coordinates (Ho Chi Minh City center) as fallback
        console.log("🔄 No location available, using default coordinates");
        const defaultCoords = {
          latitude: 10.776889,
          longitude: 106.700981,
        };
        setCoords(defaultCoords);
        console.log("📍 Set default location:", defaultCoords);
      }
    }, [hasLocation, coordinates])
  );

  // Format messages for API conversation history
  const formatConversationHistory = (messages) => {
    return messages
      .filter((msg) => msg.role) // Only include messages with roles
      .map((msg) => ({
        role: msg.role,
        content: msg.text,
        timestamp: msg.timestamp
          ? msg.timestamp.toISOString()
          : new Date().toISOString(),
      }));
  };

  // Streaming API call function
  const callChatAPI = async (prompt) => {
    console.log("📡 Starting stream request:", {
      message: prompt,
      thread_id: threadIdRef.current,
      coords: coords,
    });

    return new Promise((resolve, reject) => {
      let accumulatedText = "";
      let aiMessageId = "ai-" + Date.now();
      let gyms = null;
      let trainers = null;
      let finalReport = "";

      // Create initial AI message with empty text (will be updated as tokens stream in)
      const initialAiMessage = {
        id: aiMessageId,
        text: "",
        isAI: true,
        timestamp: new Date(),
        role: "assistant",
        isStreaming: true,
      };

      // Add the initial message to state
      setMessages((prev) => [...prev, initialAiMessage]);

      // Token callback - update message text in real-time
      const onToken = (token, data) => {
        console.log(
          "📝 Received token:",
          token,
          "| Accumulated:",
          accumulatedText + token,
          "| Full data:",
          data
        );
        accumulatedText += token;

        // Update the message text in real-time
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, text: accumulatedText, isStreaming: true }
              : msg
          )
        );
      };

      // Event callback - handle other events
      const onEvent = (eventType, data) => {
        console.log(`📨 SSE Event: ${eventType}`, data);

        switch (eventType) {
          case "done":
            // Extract structured data from done event if available
            if (data && typeof data === "object") {
              if (data.gyms) gyms = data.gyms;
              if (data.trainers) trainers = data.trainers;
              if (data.final_report) finalReport = data.final_report;
            }

            // Finalize the message with any structured data
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? {
                      ...msg,
                      text: accumulatedText || msg.text,
                      isStreaming: false,
                      gyms: gyms || null,
                      hasGyms: gyms && gyms.length > 0,
                      trainers: trainers || null,
                      hasTrainers: trainers && trainers.length > 0,
                    }
                  : msg
              )
            );
            resolve({
              message: accumulatedText,
              gyms: gyms,
              trainers: trainers,
              final_report: finalReport,
            });
            break;

          case "error":
            // Handle error
            const errorMessage = {
              id: "error-" + Date.now(),
              text: t("chat.connectionError"),
              isAI: true,
              timestamp: new Date(),
              role: "assistant",
              isError: true,
            };
            // Remove streaming message and add error
            setMessages((prev) =>
              prev.filter((msg) => msg.id !== aiMessageId).concat(errorMessage)
            );
            reject(new Error(data.error || "Streaming error occurred"));
            break;

          case "node_end":
          case "tool_start":
          case "tool_end":
            // Log these events but don't update UI
            console.log(`🔧 Tool event: ${eventType}`, data);
            break;

          default:
            // Handle any other events
            console.log(`ℹ️ Unknown event: ${eventType}`, data);
        }
      };

      // Start streaming with coordinates
      chatbotService
        .streamMessage(prompt, threadIdRef.current, onToken, onEvent, coords)
        .catch((error) => {
          console.error("Streaming failed:", error);
          // Remove streaming message on error
          setMessages((prev) => prev.filter((msg) => msg.id !== aiMessageId));
          reject(error);
        });
    });
  };

  // Handle gym card press
  const handleGymPress = (gym) => {
    // Navigate to gym detail screen
    navigation.navigate(t("navigation.home"), {
      screen: "GymDetailScreen",
      params: { gymId: gym.id },
    });
  };

  // Handle trainer card press (can be expanded later if needed)
  const handleTrainerPress = (trainer) => {
    // For now, this can be left empty or show a message
    // You can implement navigation to PT profile if needed
    console.log("Trainer pressed:", trainer);
  };

  const handleClearChat = () => {
    Alert.alert(t("chat.clearChat"), t("chat.clearChatConfirm"), [
      {
        text: t("chat.cancel"),
        style: "cancel",
      },
      {
        text: t("chat.delete"),
        style: "destructive",
        onPress: () => {
          // Reset conversation messages
          setMessages([
            {
              id: 1,
              text: t("chat.aiGreeting"),
              isAI: true,
              timestamp: new Date(),
            },
          ]);
          // Generate a new thread ID so subsequent messages start a fresh conversation
          threadIdRef.current = generateThreadId();
        },
      },
    ]);
  };

  const sendMessage = async () => {
    if (inputText.trim() === "" || isLoading) return;

    const userMessage = {
      id: "user-" + Date.now(),
      text: inputText,
      isAI: false,
      timestamp: new Date(),
      role: "user",
    };

    const userPrompt = inputText.trim();
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await callChatAPI(userPrompt);

      // After streaming completes, update the final message with any additional data (gyms, trainers, etc.)
      if (response.gyms || response.trainers) {
        setMessages((prev) =>
          prev.map((msg) => {
            // Find the last AI message (the one that was streaming)
            if (
              msg.isAI &&
              msg.role === "assistant" &&
              !msg.hasGyms &&
              !msg.hasTrainers
            ) {
              return {
                ...msg,
                gyms: response.gyms || null,
                hasGyms: response.gyms && response.gyms.length > 0,
                trainers: response.trainers || null,
                hasTrainers: response.trainers && response.trainers.length > 0,
              };
            }
            return msg;
          })
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Error message is already handled in callChatAPI's onEvent callback
      // But we can show an alert for critical errors
      Alert.alert(
        t("chat.connectionErrorTitle"),
        t("chat.serverConnectionFailed")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item, index }) => (
    <View style={styles.messageWrapper}>
      {/* Date separator */}
      {(index === 0 ||
        new Date(item.timestamp).toDateString() !==
          new Date(messages[index - 1].timestamp).toDateString()) && (
        <View style={styles.dateSeparator}>
          <Text style={styles.dateText}>
            {new Date(item.timestamp).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </Text>
        </View>
      )}

      <View
        style={[
          styles.messageContainer,
          item.isAI ? styles.aiMessage : styles.userMessage,
        ]}
      >
        {item.isAI && (
          <View style={[styles.aiAvatar, item.isError && styles.errorAvatar]}>
            {item.isError ? (
              <Text style={styles.avatarText}>⚠️</Text>
            ) : (
              <Ionicons name="sparkles" size={20} color="#EF4444" />
            )}
          </View>
        )}
        <View>
          <View
            style={[
              styles.messageBubble,
              item.isAI ? styles.aiBubble : styles.userBubble,
              item.isError && styles.errorBubble,
            ]}
          >
            {/* <Text
              style={[
                styles.messageText,
                item.isAI ? styles.aiText : styles.userText,
                item.isError && styles.errorText,
              ]}
            >
              {item.text}
            </Text> */}
            <MarkdownText
              text={item.text}
              style={[
                styles.messageText,
                item.isAI ? styles.aiText : styles.userText,
                item.isError && styles.errorText,
              ]}
            />
            {/* Timestamp */}
            <View style={styles.timestampContainer}>
              <Text
                style={[
                  styles.timestamp,
                  item.isAI ? styles.aiTimestamp : styles.userTimestamp,
                ]}
              >
                {new Date(item.timestamp).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>

          {/* Render gym cards if available */}
          {item.hasGyms && item.gyms && (
            <GymCardsList gyms={item.gyms} onGymPress={handleGymPress} />
          )}

          {/* Render trainer cards if available */}
          {item.hasTrainers && item.trainers && (
            <TrainerCardsList
              trainers={item.trainers}
              onTrainerPress={handleTrainerPress}
              onGymPress={handleGymPress}
            />
          )}
        </View>
        {!item.isAI && (
          <View style={styles.userAvatar}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.userAvatarImage}
                defaultSource={require("../../../assets/images/icon.png")}
              />
            ) : (
              <Ionicons name="person-circle" size={32} color="#666" />
            )}
          </View>
        )}
      </View>
    </View>
  );

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  // Auto scroll when new messages are added
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timer);
  }, [messages]);

  const handleInputFocus = () => {
    setTimeout(
      () => {
        scrollToBottom();
      },
      Platform.OS === "ios" ? 50 : 100
    );
  };

  const handleSendMessage = () => {
    console.log("isPremiumUser:", isPremiumUser);
    if (isPremiumUser) {
      sendMessage();
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
    } else {
      presentPaywall();
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateContent}>
        <View style={styles.emptyStateIconContainer}>
          <Ionicons name="barbell" size={64} color="#EF4444" />
        </View>
        <Text style={styles.emptyStateTitle}>
          Chào mừng đến với FitBridge AI!
        </Text>
        <Text style={styles.emptyStateSubtitle}>
          Tôi có thể giúp bạn tìm phòng gym, tư vấn tập luyện và dinh dưỡng
        </Text>
        <View style={styles.suggestedQuestions}>
          <Text style={styles.suggestedTitle}>Gợi ý câu hỏi:</Text>
          <View style={styles.questionTags}>
            <Text style={styles.questionTag}>🏃 Tìm phòng gym gần đây</Text>
            <Text style={styles.questionTag}>💪 Lịch tập cho người mới</Text>
            <Text style={styles.questionTag}>🥗 Chế độ dinh dưỡng</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 0}
        >
          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id.toString()}
            style={styles.messagesList}
            contentContainerStyle={[
              styles.messagesContainer,
              messages.length <= 1 && styles.emptyMessagesContainer,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={Keyboard.dismiss}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
            ListFooterComponent={isLoading ? <TypingIndicator /> : null}
            ListEmptyComponent={messages.length <= 1 ? renderEmptyState : null}
          />

          {/* Floating Clear Button - Only show when there are more than 1 message */}
          <FloatingClearButton
            onPress={handleClearChat}
            isVisible={messages.length > 1 && keyboardHeight === 0}
          />

          {/* Input Area */}
          <View
            style={[
              styles.inputContainer,
              Platform.OS === "android" &&
                keyboardHeight > 0 && {
                  marginBottom: 0,
                },
            ]}
          >
            {/* <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity> */}

            <TextInput
              ref={textInputRef}
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Hỏi về gym, tập luyện, dinh dưỡng..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
              onFocus={handleInputFocus}
              textAlignVertical="top"
              returnKeyType="default"
              returnKeyLabel="gửi"
              enablesReturnKeyAutomatically={false}
              blurOnSubmit={false}
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  opacity: inputText.trim() && !isLoading ? 1 : 0.5,
                  backgroundColor: isLoading ? "#9CA3AF" : "#3B82F6",
                },
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? (
                <LoadingIndicator variant="button" />
              ) : (
                <Ionicons name="send" size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  wrapper: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  messagesContainer: {
    // paddingVertical: 16,
    // paddingBottom: 20,
    // flexGrow: 1,
  },
  emptyMessagesContainer: {
    justifyContent: "center",
  },
  messageWrapper: {
    marginVertical: 2,
    marginHorizontal: 16,
  },
  // Date separator styles
  dateSeparator: {
    alignItems: "center",
    marginVertical: 16,
  },
  dateText: {
    backgroundColor: "#E5E7EB",
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "500",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    maxWidth: "90%",
    marginVertical: 4,
  },
  aiMessage: {
    alignSelf: "flex-start",
    justifyContent: "flex-start",
  },
  userMessage: {
    alignSelf: "flex-end",
    justifyContent: "flex-end",
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginTop: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  errorAvatar: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    marginTop: 4,
    shadowColor: "#EF4444",
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  userAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },

  messageBubble: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 20,
    maxWidth: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  aiBubble: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  userBubble: {
    backgroundColor: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
    backgroundColor: "#EF4444",
    borderTopRightRadius: 8,
  },
  errorBubble: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  aiText: {
    color: "#1F2937",
  },
  userText: {
    color: "#fff",
    fontWeight: "500",
  },
  errorText: {
    color: "#DC2626",
  },
  // Timestamp styles
  timestampContainer: {
    alignItems: "flex-end",
  },
  timestamp: {
    fontSize: 11,
    fontWeight: "400",
  },
  aiTimestamp: {
    color: "#9CA3AF",
    alignSelf: "flex-start",
  },
  userTimestamp: {
    color: "rgba(255, 255, 255, 0.8)",
    alignSelf: "flex-end",
  },
  // Empty state styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyStateContent: {
    alignItems: "center",
    maxWidth: 300,
  },
  emptyStateIconContainer: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  suggestedQuestions: {
    width: "100%",
  },
  suggestedTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    textAlign: "center",
  },
  questionTags: {
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  questionTag: {
    backgroundColor: "#ffffff",
    color: "#4B5563",
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  // Floating Clear Button styles
  floatingButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    zIndex: 1000,
  },
  clearButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  // Typing indicator styles
  typingContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 4,
    marginHorizontal: 16,
    maxWidth: "85%",
    alignSelf: "flex-start",
  },
  typingBubble: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderTopLeftRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  typingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#9CA3AF",
    marginHorizontal: 3,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    minHeight: 60,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },

  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    backgroundColor: "#F3F4F6",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1F2937",
    paddingTop: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    shadowColor: "#3B82F6",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },

  boldText: {
    fontWeight: "700",
  },
  italicText: {
    fontStyle: "italic",
  },
});
