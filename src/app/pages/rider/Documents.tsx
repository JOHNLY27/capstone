import { Link } from "react-router";
import { FileText, CheckCircle, AlertCircle, Upload, ChevronLeft } from "lucide-react";

export function RiderDocuments() {
  const documents = [
    {
      id: "1",
      name: "Driver's License",
      status: "verified",
      expiryDate: "June 15, 2027",
      uploaded: "Jan 15, 2026",
    },
    {
      id: "2",
      name: "Vehicle Registration",
      status: "verified",
      expiryDate: "Dec 31, 2026",
      uploaded: "Jan 15, 2026",
    },
    {
      id: "3",
      name: "Plate Number",
      status: "verified",
      expiryDate: "N/A",
      uploaded: "Jan 15, 2026",
    },
    {
      id: "4",
      name: "Insurance",
      status: "pending",
      expiryDate: "Pending review",
      uploaded: "May 1, 2026",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#050A18] text-white p-6">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/rider/profile" className="p-2 -ml-2 rounded-full hover:bg-white/10">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold">Documents</h1>
        </div>
        <p className="text-[#D4AF37] text-sm uppercase font-bold tracking-wider">Verification status</p>
      </div>

      <div className="p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">Keep Your Documents Updated</p>
              <p className="text-sm text-blue-700 mt-1">
                Make sure all your documents are valid and up to date to continue accepting orders.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      doc.status === "verified"
                        ? "bg-[#D4AF37]/10"
                        : "bg-yellow-100"
                    }`}
                  >
                    <FileText
                      className={`w-5 h-5 ${
                        doc.status === "verified"
                          ? "text-[#D4AF37]"
                          : "text-yellow-600"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Uploaded: {doc.uploaded}
                    </p>
                    <p className="text-sm text-gray-600">Expires: {doc.expiryDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.status === "verified" ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
              </div>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                  doc.status === "verified"
                    ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {doc.status === "verified" ? "Verified" : "Pending Review"}
              </span>
            </div>
          ))}
        </div>

        <button className="w-full mt-6 bg-[#050A18] text-[#D4AF37] border border-[#D4AF37]/50 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#0a1229] transition-all">
          <Upload className="w-5 h-5" />
          Upload New Document
        </button>
      </div>
    </div>
  );
}
