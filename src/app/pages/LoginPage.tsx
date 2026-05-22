import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"customer" | "rider">("customer");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userType === "customer") {
      navigate("/customer");
    } else {
      navigate("/rider");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col justify-center p-6 max-w-md mx-auto w-full">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-28 h-28 mb-6 bg-white rounded-2xl p-1 shadow-xl border border-[#D4AF37]/20 flex items-center justify-center overflow-hidden">
             <img 
              src="/logo.png" 
              alt="Fetch Me Up Logo" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-[10px] font-black text-[#0047AB] uppercase">Logo</div>';
                }
              }}
            />
          </div>
          <h1 className="text-3xl font-black text-[#0047AB] mb-1 italic uppercase tracking-tighter">Welcome Back</h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Access your command center</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="flex gap-2 bg-gray-200/50 p-1.5 rounded-xl">
            <button
              type="button"
              onClick={() => setUserType("customer")}
              className={`flex-1 py-2.5 rounded-lg font-bold transition-all uppercase tracking-[0.2em] text-[10px] ${
                userType === "customer"
                  ? "bg-[#0047AB] text-white shadow-lg"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setUserType("rider")}
              className={`flex-1 py-2.5 rounded-lg font-bold transition-all uppercase tracking-[0.2em] text-[10px] ${
                userType === "rider"
                  ? "bg-[#D4AF37] text-white shadow-lg"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Rider
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-4 rounded-xl text-white font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 ${
              userType === "customer"
                ? "bg-[#0047AB] hover:bg-[#003380] shadow-[#0047AB]/30"
                : "bg-[#D4AF37] hover:bg-[#B8962E] shadow-[#D4AF37]/30"
            }`}
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              to={userType === "customer" ? "/signup/customer" : "/signup/rider"}
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>

        <Link
          to="/"
          className="mt-8 text-center text-gray-500 hover:text-gray-700"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
