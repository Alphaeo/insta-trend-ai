// src/pages/Chat.tsx
import React from "react";
import ChatRoom from "@/components/ui/ChatRoom";
import { MessageCircle, Users } from "lucide-react";

const Chat: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Community Chat</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Connect with other creators and share insights about social media trends.
        </p>
      </div>

      {/* Chat Room */}
      <div className="bg-card border border-border rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Live Community</h2>
            <p className="text-muted-foreground">Share ideas and get inspired</p>
          </div>
        </div>
        <ChatRoom />
      </div>
    </div>
  );
};

export default Chat;