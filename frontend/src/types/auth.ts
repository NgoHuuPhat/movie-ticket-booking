
interface ILogin {
  email: string
  password: string
}

interface ILoginProps {
  loginData: ILogin
  setLoginData: (data: ILogin) => void
  handleLogin: () => void
}

interface IRegister {
  name: string
  email: string
  phone: string
  dateOfBirth: Date | string
  password: string
  confirmPassword: string
}

interface IRegisterProps {
  registerData: IRegister
  setRegisterData: (data: IRegister) => void
  handleRegister: () => void
}

export type { ILogin, ILoginProps, IRegister, IRegisterProps }
