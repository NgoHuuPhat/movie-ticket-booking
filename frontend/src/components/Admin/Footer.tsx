import { 
  Github,
  Twitter,
  Mail
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const Footer = () => {
  return (
    <footer className="border-t bg-white">
      <div className="container px-4 py-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-gradient-to-r from-blue-500 to-purple-600" />
              <span className="font-bold">MyApp</span>
            </div>
            <p className="text-sm text-gray-600">
              Building amazing experiences for our users every day.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Product</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-gray-600 hover:text-gray-900">Features</a>
              <a href="#" className="block text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="#" className="block text-gray-600 hover:text-gray-900">Documentation</a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Company</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-gray-600 hover:text-gray-900">About</a>
              <a href="#" className="block text-gray-600 hover:text-gray-900">Blog</a>
              <a href="#" className="block text-gray-600 hover:text-gray-900">Careers</a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Support</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-gray-600 hover:text-gray-900">Help Center</a>
              <a href="#" className="block text-gray-600 hover:text-gray-900">Contact</a>
              <a href="#" className="block text-gray-600 hover:text-gray-900">Status</a>
            </div>
          </div>
        </div>

        <Separator className="my-6" />
        
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-gray-600">
            © 2024 MyApp. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm">
            <a href="#" className="text-gray-600 hover:text-gray-900">Privacy</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Terms</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer