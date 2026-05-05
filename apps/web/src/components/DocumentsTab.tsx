import { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { api } from "../lib/api.js";

type Document = {
  id: string;
  name: string;
  status: string;
  createdAt: string;
};

type Props = {
  tenantId: string;
};

export default function DocumentsTab({ tenantId }: Props) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      const result = await api.documents.list();
      setDocuments(result.documents);
    } catch (err) {
      setError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      await api.documents.upload(file);
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.documents.delete(id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      setError("Failed to delete document");
    }
  }

  function StatusIcon({ status }: { status: string }) {
    if (status === "ready")
      return <CheckCircle size={16} className="text-green-400" />;
    if (status === "processing" || status === "pending")
      return <Clock size={16} className="text-yellow-400" />;
    return <XCircle size={16} className="text-red-400" />;
  }
  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-v-3x1 mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2x1 font-bold text-white">Documents</h2>
            <p className="text-gray-400 mt-1">
              Upload documents to train your support bot
            </p>
          </div>
          <label
            className={`flex items-center gap-2 px-5 py-2.5 rounded-x1 text-sm font-medium cursor-pointer transition ${
              uploading
                ? "bg-blue-600/50 text-white/50 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
          >
            <Upload size={16} />
            {uploading ? "Uploading..." : "Upload document"}
            <input
              type="file"
              accept=".txt, .md"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-x1 px-4 py-3 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText size={48} className="text-gray-700 mb-4" />
            <p className="text-gray-400 font-medium">No documents yet</p>
            <p className="text-gray-600 text-sm mt-1">
              Upload a text or markdown file to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-x1 px-5 py-4"
              >
                <FileText size={20} className="text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{doc.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon status={doc.status} />
                  <span className="text-xs text-gray-400 capitalize">
                    {doc.status}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
