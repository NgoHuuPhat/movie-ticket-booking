import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { IRegisterProps } from "@/types/auth";

const RegisterForm = ({ registerData, setRegisterData, handleRegister }: IRegisterProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-name" className="text-sm font-medium text-gray-700">
          Họ và tên
          <span className="text-red-500">*</span>
        </Label>
        <div className="relative group">
          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-hover:text-purple-500" />
          <Input
            id="register-name"
            type="text"
            placeholder="Nguyễn Văn A"
            value={registerData.name}
            onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
            className="pl-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email" className="text-sm font-medium text-gray-700">
          Email
          <span className="text-red-500">*</span>
        </Label>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-hover:text-purple-500" />
          <Input
            id="register-email"
            type="email"
            placeholder="example@email.com"
            value={registerData.email}
            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
            className="pl-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password" className="text-sm font-medium text-gray-700">
          Mật khẩu
          <span className="text-red-500">*</span>
        </Label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-hover:text-purple-500" />
          <Input
            id="register-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={registerData.password}
            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-confirm" className="text-sm font-medium text-gray-700">
          Xác nhận mật khẩu
          <span className="text-red-500">*</span>
        </Label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-hover:text-purple-500" />
          <Input
            id="register-confirm"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={registerData.confirmPassword}
            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
            className="pl-12 pr-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          checked={acceptedTerms}
          onCheckedChange={(checked) => setAcceptedTerms(!!checked)}
        />
        <Label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer my-2">
          Tôi đồng ý với <span className="text-purple-600 font-medium">Điều khoản sử dụng</span> và <span className="text-purple-600 font-medium">Chính sách bảo mật</span>.
        </Label>
      </div>

      <Button
        onClick={handleRegister}
        disabled={!acceptedTerms}
        variant="gradYOB"
        className="w-full h-12"
      >
        <span className="flex items-center font-anton justify-center gap-2 text-base">
          TẠO TÀI KHOẢN
        </span>
      </Button>
    </div>
  );
}

export default RegisterForm;