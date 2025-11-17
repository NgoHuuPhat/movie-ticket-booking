import { Routes, Route } from "react-router-dom"
import AuthPage from "@/pages/AuthPage"
import { Toaster } from "sonner"

function App() {
  return (
    <>
      <Toaster position="top-center" richColors/>
      <Routes>
        <Route path="/" element={<AuthPage />} />
      </Routes>
    </>
  )
}

export default App
