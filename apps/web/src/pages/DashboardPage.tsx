import { useState } from "react";
import { FileText, MessageSquare, LogOut } from "lucide-react";
import { removeToken } from "../lib/api.js";
import DocumentsTab from "../components/DocumentsTab.js";
import ChatTab from "../components/ChatTab.js";

type Props = {
  user: { id: string; email: string; organizationId: string };
  onLogout: () => void;
};

type Tab = "documents" | "chat";

export default function DashboardPage({ user, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("documents");

  function handleLogout() {
    removeToken();
    onLogout();
  }
  return (
    <div className="min-h-screen bg-gray-950 flex">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-lg font-bold text-white">Support Bot</h1>
          <p className="text-xs text-gray-400 mt-1 truncate">{user.email}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab("documents")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-x1 text-sm font-medium transition ${
              activeTab === "documents"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <FileText size={18} />
            Documents
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-x1 text-sm font-medium transition ${
              activeTab === "chat"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <MessageSquare size={18} />
            Chat
          </button>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-x1 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === "documents" && (
          <DocumentsTab tenantId={user.organizationId} />
        )}
        {activeTab === "chat" && <ChatTab tenantId={user.organizationId} />}
      </main>
    </div>
  );
}
