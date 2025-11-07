"use client"

import { useState } from "react"
import { Search, Send, MoreVertical, Phone, Video, Info, Paperclip, Image as ImageIcon, Smile } from "lucide-react"

// Hardcoded data for demonstration
const CONVERSATIONS = [
  {
    id: "1",
    otherUser: {
      id: "user1",
      name: "Priya Sharma",
      avatar: "PS",
      online: true,
    },
    product: {
      id: "prod1",
      title: "iPhone 14 Pro Max 256GB",
      price: 899,
      image: "📱",
    },
    lastMessage: "Is it still available?",
    lastMessageTime: "2m ago",
    unreadCount: 2,
    messages: [
      {
        id: "m1",
        senderId: "user1",
        text: "Hi! I'm interested in the iPhone. Does it come with original accessories?",
        timestamp: "10:30 AM",
        isOwn: false,
      },
      {
        id: "m2",
        senderId: "me",
        text: "Yes! It includes the original box, charging cable, and unused earphones. Phone is in excellent condition.",
        timestamp: "10:32 AM",
        isOwn: true,
      },
      {
        id: "m3",
        senderId: "user1",
        text: "Is it still available?",
        timestamp: "10:45 AM",
        isOwn: false,
      },
    ],
  },
  {
    id: "2",
    otherUser: {
      id: "user2",
      name: "Rahul Verma",
      avatar: "RV",
      online: false,
    },
    product: {
      id: "prod2",
      title: "Sony WH-1000XM5 Headphones",
      price: 299,
      image: "🎧",
    },
    lastMessage: "Can we meet tomorrow?",
    lastMessageTime: "1h ago",
    unreadCount: 0,
    messages: [
      {
        id: "m6",
        senderId: "user2",
        text: "Are the headphones still under warranty?",
        timestamp: "Yesterday, 4:20 PM",
        isOwn: false,
      },
      {
        id: "m7",
        senderId: "me",
        text: "Yes! Only used for 3 months, still under warranty. Works perfectly.",
        timestamp: "Yesterday, 4:25 PM",
        isOwn: true,
      },
      {
        id: "m8",
        senderId: "user2",
        text: "Can we meet tomorrow?",
        timestamp: "1h ago",
        isOwn: false,
      },
    ],
  },
  {
    id: "3",
    otherUser: {
      id: "user3",
      name: "Ananya Patel",
      avatar: "AP",
      online: true,
    },
    product: {
      id: "prod3",
      title: "MacBook Air M2 2023",
      price: 1199,
      image: "💻",
    },
    lastMessage: "Thanks for the info!",
    lastMessageTime: "3h ago",
    unreadCount: 0,
    messages: [
      {
        id: "m10",
        senderId: "user3",
        text: "How many charging cycles does the MacBook have?",
        timestamp: "3h ago",
        isOwn: false,
      },
      {
        id: "m11",
        senderId: "me",
        text: "It has only 42 cycles. Battery health is at 98%.",
        timestamp: "3h ago",
        isOwn: true,
      },
      {
        id: "m12",
        senderId: "user3",
        text: "Thanks for the info!",
        timestamp: "3h ago",
        isOwn: false,
      },
    ],
  },
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(CONVERSATIONS[0])
  const [messageText, setMessageText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredConversations = CONVERSATIONS.filter((conv) =>
    conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.product.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // In a real app, this would send the message
      console.log("Sending message:", messageText)
      setMessageText("")
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Conversations List */}
      <div className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-heading mb-4" style={{ fontFamily: "var(--font-heading)" }}>Messages</h1>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-button"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-background transition-colors border-b border-gray-100 ${
                selectedConversation.id === conversation.id ? "bg-background" : ""
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-button flex items-center justify-center text-white font-semibold">
                  {conversation.otherUser.avatar}
                </div>
                {conversation.otherUser.online && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>

              {/* Conversation Info */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-heading truncate">
                    {conversation.otherUser.name}
                  </h3>
                  <span className="text-xs text-subheading ml-2 flex-shrink-0">
                    {conversation.lastMessageTime}
                  </span>
                </div>
                
                <p className="text-sm text-text truncate mb-1">
                  {conversation.product.image} {conversation.product.title}
                </p>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-subheading truncate">
                    {conversation.lastMessage}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <span className="ml-2 flex-shrink-0 w-5 h-5 bg-button text-white text-xs rounded-full flex items-center justify-center">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-button flex items-center justify-center text-white font-semibold">
                {selectedConversation.otherUser.avatar}
              </div>
              {selectedConversation.otherUser.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>

            <div>
              <h2 className="font-semibold text-heading">
                {selectedConversation.otherUser.name}
              </h2>
              <p className="text-sm text-subheading">
                {selectedConversation.otherUser.online ? "Active now" : "Offline"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Info className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Product Info Banner */}
        <div className="px-4 py-3 bg-background border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{selectedConversation.product.image}</div>
            <div>
              <h3 className="font-semibold text-heading">
                {selectedConversation.product.title}
              </h3>
              <p className="text-lg font-bold text-button">
                ${selectedConversation.product.price}
              </p>
            </div>
          </div>
          <button className="px-4 py-2 bg-button text-white rounded-lg hover:bg-button-hover transition-colors" style={{ fontFamily: "var(--font-button)" }}>
            View Product
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedConversation.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] ${
                  message.isOwn
                    ? "bg-button text-white rounded-t-2xl rounded-l-2xl rounded-br-md"
                    : "bg-gray-100 text-text rounded-t-2xl rounded-r-2xl rounded-bl-md"
                }`}
              >
                <p className="px-4 py-2.5 text-sm leading-relaxed">{message.text}</p>
                <p
                  className={`px-4 pb-2 text-xs ${
                    message.isOwn ? "text-white/80" : "text-subheading"
                  }`}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-end gap-2">
            {/* Attachment Buttons */}
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
              <Paperclip className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
              <ImageIcon className="w-5 h-5 text-gray-600" />
            </button>

            {/* Message Input */}
            <div className="flex-1 relative">
              <textarea
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                rows={1}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-button resize-none max-h-32"
                style={{ minHeight: "48px" }}
              />
            </div>

            {/* Emoji Button */}
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
              <Smile className="w-5 h-5 text-gray-600" />
            </button>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
              className="p-3 bg-button text-white rounded-xl hover:bg-button-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-subheading mt-2 ml-2">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
