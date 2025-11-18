import { useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import UserLayout from "@/components/layout/UserLayout";
import { Card, CardContent } from "@/components/ui/card";
import type { ILogin, IRegister } from "@/types/auth";

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [loginData, setLoginData] = useState<ILogin>({ email: "", password: "" });
  const [registerData, setRegisterData] = useState<IRegister>({
    name: "",
    email: "",
    password: "",
    phone: "",
    dateOfBirth: "",
    confirmPassword: ""
  });

  const handleLogin = () => {
    console.log("Đăng nhập:", loginData);
    alert("Đăng nhập thành công! 🎬");
  };

  const handleRegister = () => {
    if (registerData.password !== registerData.confirmPassword) {
      alert("Mật khẩu không khớp!");
      return;
    }
    console.log("Đăng ký:", registerData);
    alert("Đăng ký thành công! 🎉");
  };

  return (
    <UserLayout>
      {/* Background gradient orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500 rounded-full opacity-30 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 -right-40 w-96 h-96 bg-pink-500 rounded-full opacity-30 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 left-1/4 w-96 h-96 bg-blue-500/40 rounded-full opacity-30 blur-3xl animate-pulse"></div>
      </div>

      <div className="flex flex-col items-center mt-10 mb-30 px-4 md:px-0">
          <div className="w-full max-w-[500px] flex gap-2 mb-2">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-4 font-anton text-sm transition-all bg-white duration-300 rounded-xl ${
                activeTab === "login" ? "text-black " : "text-white/50 bg-white/0 hover:bg-white/20"
              }`}
            >
              ĐĂNG NHẬP
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-4 font-anton text-sm transition-all bg-white duration-300 rounded-xl ${
                activeTab === "register" ? "text-black" : "text-white/50 bg-white/0 hover:bg-white/20"
              }`}
            >
              ĐĂNG KÝ
            </button>
        </div>

        <Card className="w-full max-w-[500px]">
          <CardContent className="p-8">
            {activeTab === "login" ? (
              <LoginForm
                loginData={loginData}
                setLoginData={setLoginData}
                handleLogin={handleLogin}
              />
            ) : (
              <RegisterForm
                registerData={registerData}
                setRegisterData={setRegisterData}
                handleRegister={handleRegister}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
}

export default AuthPage;