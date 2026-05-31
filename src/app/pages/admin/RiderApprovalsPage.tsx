import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  FileText, 
  MapPin, 
  AlertCircle,
  Clock,
  ThumbsUp
} from 'lucide-react';

interface RiderDocument {
  id: string;
  userId: string;
  licenseNumber: string;
  plateNumber: string;
  vehicleModel: string;
  licenseImage?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user: {
    name: string;
    email: string;
    phone: string;
    isVerified: boolean;
  };
}

export const RiderApprovalsPage: React.FC = () => {
  const [documents, setDocuments] = useState<RiderDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/admin/documents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setDocuments(data.data.documents);
      }
    } catch (err) {
      console.error('Error fetching rider documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleVerify = async (id: string, status: 'APPROVED' | 'REJECTED', riderName: string) => {
    const confirmation = window.confirm(
      `Are you sure you want to ${status === 'APPROVED' ? 'APPROVE' : 'REJECT'} the rider application of ${riderName}?`
    );
    if (!confirmation) return;

    setActioningId(id);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/admin/documents/${id}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update rider document status.');
      }

      // Refresh documents
      await fetchDocuments();
      alert(`Rider ${riderName} has been successfully ${status === 'APPROVED' ? 'Approved & Activated' : 'Rejected'}.`);
    } catch (err: any) {
      console.error('Verification error:', err);
      alert(err.message || 'Error occurred while verifying rider.');
    } finally {
      setActioningId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-indigo-500 animate-spin" />
          <div className="absolute inset-0 m-auto w-6 h-6 rounded-full bg-indigo-500/20 blur-sm" />
        </div>
      </div>
    );
  }

  const pendingDocs = documents.filter(doc => doc.status === 'PENDING');
  const pastDocs = documents.filter(doc => doc.status !== 'PENDING');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#111827]/40 p-6 rounded-2xl border border-gray-800/40 backdrop-blur-md">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
          Rider Document Verifications
        </h2>
        <p className="text-gray-400 text-sm mt-1 font-medium">
          Review, approve, or decline incoming driver registration profiles for Butuan City.
        </p>
      </div>

      {/* Lightbox / Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 transition-all">
          <div className="relative bg-[#111827] border border-gray-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl p-6">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>Rider Document Preview</span>
            </h4>
            
            <div className="w-full h-[400px] bg-gray-950 rounded-2xl overflow-hidden border border-gray-850 flex items-center justify-center relative">
              <img
                src={
                  selectedImage.startsWith('http') || selectedImage.startsWith('data:') 
                    ? selectedImage 
                    : 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=800'
                }
                alt="Document Preview"
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=800';
                }}
              />
            </div>
            
            <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center">
              <p className="text-xs text-indigo-300 font-semibold">
                Verify license details and safety features before approving rider account.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Verifications */}
      <div className="bg-[#111827]/40 border border-gray-800/40 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-gray-200">
            Pending Applications ({pendingDocs.length})
          </h3>
        </div>

        {pendingDocs.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-gray-900/10 border border-dashed border-gray-800 rounded-xl">
            <ThumbsUp className="w-12 h-12 text-indigo-400/80 mb-3 animate-bounce" />
            <p className="text-gray-200 font-extrabold text-base">All caught up!</p>
            <p className="text-gray-500 text-xs mt-1">There are no pending rider registration files awaiting review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800/60 text-gray-400 text-[10px] font-bold tracking-widest uppercase">
                  <th className="py-4 px-4">Rider Details</th>
                  <th className="py-4 px-4">Driver License</th>
                  <th className="py-4 px-4">Plate Number</th>
                  <th className="py-4 px-4">Vehicle Details</th>
                  <th className="py-4 px-4">Submitted Date</th>
                  <th className="py-4 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {pendingDocs.map((doc) => (
                  <tr key={doc.id} className="text-sm text-gray-300 hover:bg-gray-800/15 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-bold text-white text-base">{doc.user?.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{doc.user?.email}</p>
                      <p className="text-xs text-gray-400 font-semibold">{doc.user?.phone}</p>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-gray-200">
                      <div className="flex flex-col gap-1">
                        <span>{doc.licenseNumber}</span>
                        {doc.licenseImage ? (
                          <button
                            onClick={() => setSelectedImage(doc.licenseImage || null)}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 mt-0.5 underline transition-colors"
                          >
                            <FileText className="w-3 h-3" />
                            <span>View Document Photo</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-500 italic">No image uploaded</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs font-bold text-indigo-400 uppercase">{doc.plateNumber}</td>
                    <td className="py-4 px-4">
                      <span className="bg-gray-800 border border-gray-700/40 text-gray-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                        {doc.vehicleModel}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-400 font-medium">
                      {new Date(doc.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleVerify(doc.id, 'APPROVED', doc.user?.name)}
                          disabled={actioningId === doc.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold uppercase transition-all shadow-md shadow-emerald-600/10 hover:scale-[1.03]"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleVerify(doc.id, 'REJECTED', doc.user?.name)}
                          disabled={actioningId === doc.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold uppercase transition-all shadow-md shadow-red-600/10 hover:scale-[1.03]"
                        >
                          <X className="w-4 h-4" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review History */}
      {pastDocs.length > 0 && (
        <div className="bg-[#111827]/40 border border-gray-800/40 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-bold text-gray-200">Verification History</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800/60 text-gray-400 text-[10px] font-bold tracking-widest uppercase">
                  <th className="py-4 px-4">Rider Details</th>
                  <th className="py-4 px-4">Driver License</th>
                  <th className="py-4 px-4">Plate Number</th>
                  <th className="py-4 px-4">Vehicle Details</th>
                  <th className="py-4 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {pastDocs.map((doc) => (
                  <tr key={doc.id} className="text-sm text-gray-400 hover:bg-gray-800/10 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-semibold text-gray-300">{doc.user?.name}</p>
                      <p className="text-xs text-gray-500">{doc.user?.email}</p>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs">{doc.licenseNumber}</td>
                    <td className="py-4 px-4 font-mono text-xs uppercase">{doc.plateNumber}</td>
                    <td className="py-4 px-4 text-xs font-semibold">{doc.vehicleModel}</td>
                    <td className="py-4 px-4">
                      {doc.status === 'APPROVED' ? (
                        <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                          Verified & Active
                        </span>
                      ) : (
                        <span className="bg-red-500/10 border border-red-500/25 text-red-400 text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                          Rejected
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
