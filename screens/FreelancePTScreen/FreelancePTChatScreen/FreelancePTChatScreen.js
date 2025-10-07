import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useTranslation } from '../../../hooks/useTranslation';
import Icon from 'react-native-vector-icons/FontAwesome';

const FreelancePTChatScreen = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm looking for a personal trainer for strength training. Are you available?",
      isClient: true,
      clientName: "John Smith",
      timestamp: new Date(Date.now() - 3600000),
      avatar: null
    },
    {
      id: 2,
      text: "Hello John! Yes, I'm available for strength training sessions. I have 5+ years of experience. What are your fitness goals?",
      isClient: false,
      timestamp: new Date(Date.now() - 3500000)
    },
    {
      id: 3,
      text: "I want to build muscle mass and improve my overall strength. I can train 3-4 times per week.",
      isClient: true,
      clientName: "John Smith",
      timestamp: new Date(Date.now() - 3400000)
    },
    {
      id: 4,
      text: "Perfect! I can create a customized strength training program for you. My rate is $50 per session. Would you like to schedule a consultation?",
      isClient: false,
      timestamp: new Date(Date.now() - 3300000)
    },
    {
      id: 5,
      text: "That sounds great! When are you available for the consultation?",
      isClient: true,
      clientName: "John Smith",
      timestamp: new Date(Date.now() - 1800000)
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const flatListRef = useRef(null);

  const clients = [
    { id: 1, name: 'John Smith', lastMessage: 'That sounds great! When are you...', unread: 2, online: true },
    { id: 2, name: 'Sarah Johnson', lastMessage: 'Thanks for the great session today!', unread: 0, online: false },
    { id: 3, name: 'Mike Wilson', lastMessage: 'Can we reschedule tomorrow\'s session?', unread: 1, online: true },
    { id: 4, name: 'Emma Davis', lastMessage: 'What should I eat before training?', unread: 3, online: false },
  ];

  useEffect(() => {
    if (selectedClient === null && clients.length > 0) {
      setSelectedClient(clients[0]);
    }
  }, []);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        text: newMessage.trim(),
        isClient: false,
        timestamp: new Date()
      };
      
      setMessages([...messages, message]);
      setNewMessage('');
      
      // Auto scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const MessageBubble = ({ message }) => (
    <View style={[
      styles.messageBubble,
      message.isClient ? styles.clientMessage : styles.trainerMessage
    ]}>
      {message.isClient && (
        <Text style={styles.clientName}>{message.clientName}</Text>
      )}
      <Text style={[
        styles.messageText,
        message.isClient ? styles.clientMessageText : styles.trainerMessageText
      ]}>
        {message.text}
      </Text>
      <Text style={[
        styles.timestamp,
        message.isClient ? styles.clientTimestamp : styles.trainerTimestamp
      ]}>
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );

  const ClientItem = ({ client, isSelected, onPress }) => (
    <TouchableOpacity 
      style={[styles.clientItem, isSelected && styles.selectedClientItem]}
      onPress={onPress}
    >
      <View style={styles.clientAvatar}>
        <Text style={styles.clientAvatarText}>
          {client.name.split(' ').map(n => n[0]).join('')}
        </Text>
        {client.online && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.clientInfo}>
        <View style={styles.clientHeader}>
          <Text style={styles.clientNameText}>{client.name}</Text>
          {client.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{client.unread}</Text>
            </View>
          )}
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {client.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Clients List */}
      <View style={styles.clientsList}>
        <View style={styles.clientsHeader}>
          <Text style={styles.clientsTitle}>Clients</Text>
          <TouchableOpacity style={styles.newChatButton}>
            <Icon name="plus" size={16} color="#ED2A46" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={clients}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ClientItem
              client={item}
              isSelected={selectedClient?.id === item.id}
              onPress={() => setSelectedClient(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Chat Area */}
      <View style={styles.chatArea}>
        {selectedClient ? (
          <>
            {/* Chat Header */}
            <View style={styles.chatHeader}>
              <View style={styles.chatHeaderInfo}>
                <Text style={styles.chatHeaderName}>{selectedClient.name}</Text>
                <Text style={styles.chatHeaderStatus}>
                  {selectedClient.online ? 'Online' : 'Last seen recently'}
                </Text>
              </View>
              <TouchableOpacity style={styles.callButton}>
                <Icon name="phone" size={20} color="#ED2A46" />
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <MessageBubble message={item} />}
              style={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {/* Message Input */}
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.inputContainer}
            >
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.messageInput}
                  value={newMessage}
                  onChangeText={setNewMessage}
                  placeholder="Type a message..."
                  placeholderTextColor="#999"
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity 
                  style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
                  onPress={sendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Icon name="send" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </>
        ) : (
          <View style={styles.noChatSelected}>
            <Icon name="comments" size={50} color="#ccc" />
            <Text style={styles.noChatText}>Select a client to start chatting</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
  },
  clientsList: {
    width: '35%',
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  clientsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  clientsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  newChatButton: {
    padding: 8,
  },
  clientItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedClientItem: {
    backgroundColor: '#f5f5f5',
  },
  clientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ED2A46',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  clientAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  clientInfo: {
    flex: 1,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  clientNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  unreadBadge: {
    backgroundColor: '#ED2A46',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 12,
    color: '#666',
  },
  chatArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  chatHeaderStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  callButton: {
    padding: 8,
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
  },
  clientMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
  },
  trainerMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#ED2A46',
  },
  clientName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  clientMessageText: {
    color: '#333',
  },
  trainerMessageText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  clientTimestamp: {
    color: '#999',
  },
  trainerTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 14,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#ED2A46',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  noChatSelected: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noChatText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});

export default FreelancePTChatScreen;