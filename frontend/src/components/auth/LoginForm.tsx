import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ILoginProps } from "@/types/auth";

const LoginForm = ({ loginData, setLoginData, handleLogin }: ILoginProps) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <div className="space-y-8">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">
          Email
          <span className="text-red-500">*</span>
        </Label>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-hover:text-purple-500" />
          <Input
            id="login-email"
            type="email"
            placeholder="example@email.com"
            value={loginData.email}
            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
            className="pl-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all"
            required
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1">
        <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">
          Mật khẩu
          <span className="text-red-500">*</span>
        </Label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-hover:text-purple-500" />
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            className="pl-12 pr-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex justify-end mt-4 font-medium">
          <a
            href="/forgot-password"
            className="text-sm text-purple-500 hover:underline"
          >
            Quên mật khẩu?
          </a>
        </div>
      </div>

      <Button
        onClick={handleLogin}
        variant="gradYOB"
        className="w-full h-12"
      >
        <span className="flex items-center font-anton justify-center gap-2 text-base">
          ĐĂNG NHẬP NGAY
        </span>
      </Button>
    </div>
  );
};

export default LoginForm;
