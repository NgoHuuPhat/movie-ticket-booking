import { Settings, Users, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import StaffLayout from '@/components/layout/StaffLayout'
import useAuthStore from '@/stores/useAuthStore'

const DashboardPage = () => {
  const { user } = useAuthStore()

  return (
    <StaffLayout>
      <div className="max-w-7xl">
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-purple-100 via-white to-pink-100 p-6 md:p-8 shadow-sm">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.hoTen}! 👋
            </h1>
            <p className="mt-2 text-gray-600">
              Here's what's happening with your projects today.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Total Users', value: '2,420', change: '+12%', color: 'bg-blue-500' },
              { title: 'Revenue', value: '$45,231', change: '+5%', color: 'bg-green-500' },
              { title: 'Orders', value: '1,420', change: '+8%', color: 'bg-purple-500' },
              { title: 'Growth', value: '12.5%', change: '+2%', color: 'bg-orange-500' },
            ].map((card, index) => (
              <Card key={index} className="shadow-purple-100/50 bg-white/50 hover:shadow-md hover:shadow-purple-100 transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{card.title}</p>
                      <p className="text-3xl font-bold">{card.value}</p>
                    </div>
                    <div className={`h-12 w-12 rounded-lg ${card.color} opacity-10`} />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <span className="text-green-600">{card.change}</span>
                    <span className="ml-2 text-gray-600">from last month</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white p-6 shadow-sm shadow-blue-100/50">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {[
                  'New user registered',
                  'Payment received from John Doe',
                  'System backup completed',
                  'New feature deployed',
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span>{activity}</span>
                    <span className="ml-auto text-gray-500">2h ago</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-lg bg-white p-6 shadow-sm shadow-blue-100/50">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Add New User
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Create Document
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  System Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  )
}

export default DashboardPage