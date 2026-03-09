import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom"

const DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT"];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
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
      console.log("logged User :", user)

      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      } else {
        navigate("/dashboard");
      }
    }
    else {
      if (!name.trim()) {
        toast({ title: "Name required", variant: "destructive" });
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(email, password, name, department);
      if (error) {
        toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account created!", description: "You can now sign in with your credentials." });
        setIsLogin(true);
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex w-full bg-[#f8fcf8]">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-24 py-12 relative">
        {/* <div className="absolute top-8 left-8 lg:left-12">
          <h1 className="text-2xl font-bold text-slate-800 tracking-wider">CREX</h1>
        </div> */}

        <div className="max-w-md w-full mx-auto">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-semibold mb-2 text-slate-900">
              {isLogin ? "Welcome Back" : "Create New Account"}
            </h2>
            <p className="text-slate-500">
              {isLogin ? "Please enter your details to sign in." : "Sign up and get started with your grievance portal."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1">
                <Label htmlFor="name" className="text-slate-600 ml-1">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Doe"
                  className="rounded-full bg-white border-slate-200 py-6 px-5 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-slate-400"
                  required
                />
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="email" className="text-slate-600 ml-1">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-full bg-white border-slate-200 py-6 px-5 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-slate-400"
                required
              />
            </div>

            <div className="space-y-1 relative">
              <Label htmlFor="password" className="text-slate-600 ml-1">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-full bg-white border-slate-200 py-6 px-5 pr-12 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-slate-400"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <Label className="text-slate-600 ml-1">Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="rounded-full bg-white border-slate-200 py-6 px-5 focus:ring-offset-0 focus:ring-1 focus:ring-slate-400">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              type="submit"
              className="w-full rounded-full bg-[#FAFA5F] hover:bg-[#Fefe40] text-black font-semibold py-6 text-lg mt-4 shadow-sm"
              disabled={submitting}
            >
              {submitting ? <Loader2 className="animate-spin mr-2" /> : isLogin ? "Sign In" : "Submit"}
            </Button>
            {isLogin && (
              <div className="text-right mt-3">
                <Link
                  to="/forgot-password"
                  className="text-sm text-slate-600 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            )}

          </form>


          {/* <div className="my-8 flex items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="mx-4 text-slate-400 text-sm">Or continue with</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" className="w-full rounded-full py-6 border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.013-1.133 8.053-3.24 2.067-2.067 2.72-5.36 2.053-9.84H12.48z" /></svg>
              Google
            </Button>
            <Button variant="outline" className="w-full rounded-full py-6 border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74.79 0 2.06-.7 3.32-.69 2.58.19 3.93 1.25 4.63 2.53-4.22 2.22-3.32 8.35 1.14 9.87-.76 1.89-1.8 3.51-4.17 3.51V20.28zm-3.59-15c-.29-1.92 1.54-3.48 3.24-3.48.24 1.63-1.35 3.32-3.24 3.48z" /></svg>
              Apple
            </Button>
          </div> */}

          <div className="mt-8 text-center text-sm text-slate-500">
            <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-slate-800 hover:underline">
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
            {/* <div className="mt-4 flex justify-between text-xs text-slate-400">
              <a href="#" className="hover:text-slate-600">Privacy Policy</a>
              <a href="#" className="hover:text-slate-600">Terms & Conditions</a>
            </div> */}
          </div>
        </div>
      </div>

      {/* Right Side - Visuals */}
      <div className="hidden lg:flex w-1/2 bg-slate-100 relative items-center justify-center overflow-hidden p-8">
        <div className="absolute inset-4 rounded-[40px] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
            alt="Students studying"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10"></div>
        </div>


      </div>
    </div>
  );
}
