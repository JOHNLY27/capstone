import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"customer" | "rider" | "admin">("customer");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          role: userType.toUpperCase(),
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Authentication failed. Please verify your credentials.");
      }

      // Store auth session
      localStorage.setItem("token", resData.token);
      localStorage.setItem("role", resData.data.user.role);
      localStorage.setItem("userName", resData.data.user.name);

      // Navigate based on user role
      if (userType === "admin") {
        navigate("/admin");
      } else if (userType === "customer") {
        navigate("/customer");
      } else {
        navigate("/rider");
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setErrorMsg(err.message || "Unable to connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPrimaryColorClass = () => {
    if (userType === "customer") return "bg-[#0047AB] text-white shadow-lg";
    if (userType === "rider") return "bg-[#D4AF37] text-white shadow-lg";
    return "bg-indigo-600 text-white shadow-lg";
  };

  const getButtonBgClass = () => {
    if (userType === "customer") return "bg-[#0047AB] hover:bg-[#003380] shadow-[#0047AB]/30";
    if (userType === "rider") return "bg-[#D4AF37] hover:bg-[#B8962E] shadow-[#D4AF37]/30";
    return "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30";
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col justify-center p-6 max-w-md mx-auto w-full">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-28 h-28 mb-6 bg-white rounded-2xl p-1 shadow-xl border border-gray-200 flex items-center justify-center overflow-hidden">
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

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-xs font-semibold text-center animate-shake">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* User Type Switcher Tabs */}
          <div className="flex gap-1.5 bg-gray-200/50 p-1.5 rounded-xl border border-gray-200/20">
            <button
              type="button"
              onClick={() => setUserType("customer")}
              className={`flex-1 py-2.5 rounded-lg font-bold transition-all uppercase tracking-wider text-[10px] ${
                userType === "customer" ? "bg-[#0047AB] text-white shadow-md" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setUserType("rider")}
              className={`flex-1 py-2.5 rounded-lg font-bold transition-all uppercase tracking-wider text-[10px] ${
                userType === "rider" ? "bg-[#D4AF37] text-white shadow-md" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Rider
            </button>
            <button
              type="button"
              onClick={() => setUserType("admin")}
              className={`flex-1 py-2.5 rounded-lg font-bold transition-all uppercase tracking-wider text-[10px] ${
                userType === "admin" ? "bg-indigo-600 text-white shadow-md" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Admin
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none text-sm text-gray-800"
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
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none text-sm text-gray-800"
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
            disabled={isLoading}
            className={`w-full py-4 rounded-xl text-white font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center min-h-[56px] ${getButtonBgClass()} disabled:opacity-50`}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-t-2 border-r-2 border-white rounded-full animate-spin" />
            ) : (
              "Login"
            )}
          </button>
        </form>

        {userType !== "admin" && (
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
        )}

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
