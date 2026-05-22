import { useNavigate } from "react-router";
import { ChevronLeft, Shield, Lock, Eye, Trash2 } from "lucide-react";

export function RiderPrivacySettings() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#050A18] text-white p-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Privacy & Security</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <button 
            onClick={() => alert("Redirecting to Change Password...")}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <p className="font-semibold text-gray-900">Change Password</p>
                <p className="text-xs text-gray-500">Update your rider account password</p>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
          </button>

          <button 
            onClick={() => alert("Setting up Two-Factor Authentication...")}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500">Secure your account with 2FA</p>
              </div>
            </div>
            <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded">Off</span>
          </button>

          <button 
            onClick={() => alert("Managing Data & Permissions...")}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <p className="font-semibold text-gray-900">Data & Permissions</p>
                <p className="text-xs text-gray-500">Manage your data usage</p>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
          </button>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <button 
            onClick={() => alert("Are you sure you want to delete your rider account? This will permanently remove your earnings history.")}
            className="w-full flex items-center gap-3 p-4 text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span className="font-semibold">Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
