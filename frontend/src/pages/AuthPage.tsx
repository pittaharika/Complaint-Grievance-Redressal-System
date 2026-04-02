import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import sideimage from "../assets/Aside - Left Side_ Visual Narrative.png";

const DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT"];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isLogin) {
      const { user, error } = await signIn(email, password);
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        navigate("/dashboard");
      }
    } else {
      if (!name.trim()) {
        toast({ title: "Name required", variant: "destructive" });
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(email, password, name, department);
      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account created!",
          description: "You can now sign in with your credentials.",
        });
        setIsLogin(true);
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex w-full font-sans">
      {/* Left Side - Dark blue branded panel */}
      <div className="hidden lg:flex w-[45%] relative flex-col justify-between p-10 overflow-hidden">
        {/* Background image with dark overlay */}
        <div className="absolute inset-0">
          <img
            src={sideimage}
            alt="Institutional building"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-[55%] flex flex-col justify-between bg-white px-8 lg:px-16 py-10">
        <div /> {/* spacer top */}
        <div className="max-w-md w-full mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {isLogin ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-gray-500 text-sm">
              {isLogin
                ? "Sign in to your GrievancePro account."
                : "Join the next generation of institutional governance."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name - signup only */}
            {!isLogin && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="h-11 rounded-lg border-gray-200 bg-white px-4 text-sm focus-visible:ring-1 focus-visible:ring-[#1a237e] focus-visible:ring-offset-0"
                  required
                />
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Institutional Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@institution.edu"
                className="h-11 rounded-lg border-gray-200 bg-white px-4 text-sm focus-visible:ring-1 focus-visible:ring-[#1a237e] focus-visible:ring-offset-0"
                required
              />
            </div>

            {/* Department - signup only */}
            {!isLogin && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Department
                </Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="h-11 rounded-lg border-gray-200 bg-white px-4 text-sm focus:ring-1 focus:ring-[#1a237e] focus:ring-offset-0 text-gray-500">
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-lg border-gray-200 bg-white px-4 pr-11 text-sm focus-visible:ring-1 focus-visible:ring-[#1a237e] focus-visible:ring-offset-0"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 rounded-lg bg-[#1a237e] hover:bg-[#283593] text-white font-semibold text-sm mt-2 flex items-center justify-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight size={16} />
                </>
              )}
            </Button>

            {isLogin && (
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-[#1a237e] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            )}
          </form>

          {/* Toggle login/signup */}
          <p className="mt-6 text-center text-sm text-gray-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-[#1a237e] hover:underline"
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
