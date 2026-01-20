import { useState, useEffect } from "react"
import { TrendingUp, ShoppingCart, Ticket, DollarSign, Users, RefreshCw, Trophy, TrendingDown, Brain, Loader2 } from "lucide-react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from "chart.js"
import { Pie, Line } from "react-chartjs-2"
import {
  getRevenueStatisticsAdmin,
  getTicketSalesStatisticsAdmin,
  getProductSalesStatisticsAdmin,
  getNewUsersStatisticsAdmin,
  getTopMoviesAdmin,
  getPaymentMethodsAdmin,
  getRevenueTimeSeriesAdmin,
  getRevenueByTypeAdmin,
  getYearInvoicesAdmin,
  revenueAnalysisAIAdmin
} from "@/services/api"
import AdminLayout from "@/components/layout/AdminLayout"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Button } from "@/components/ui/button"
import { handleError } from "@/utils/handleError.utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Markdown from "react-markdown"

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title)

export interface TopMovie {
  maPhim: string
  tenPhim: string
  anhBia: string
  countTicketSold: number
}

export interface PaymentMethod {
  methodPayment: string
  count: number
}

export interface RevenueTimeSeries {
  hour: string
  revenue: number
}

export interface RevenueByType {
  type: string
  revenue: number
}

const DashboardPage = () => {
  const [timeFilter, setTimeFilter] = useState("day")
  const [yearForRevenueType, setYearForRevenueType] = useState(new Date().getFullYear().toString())
  const [yearForPayment, setYearForPayment] = useState(new Date().getFullYear().toString())
  const [availableYears, setAvailableYears] = useState<number[]>([])

  const [aiAnalysis, setAiAnalysis] = useState<string>("")
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [loadingAI, setLoadingAI] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingTimeSeries, setLoadingTimeSeries] = useState(true)
  const [loadingRevenueType, setLoadingRevenueType] = useState(true)
  const [loadingPayment, setLoadingPayment] = useState(true)
  const [loadingMovies, setLoadingMovies] = useState(true)
  
  const [error, setError] = useState<string | null>(null)
  
  const [stats, setStats] = useState({
    ticketSales: 0,
    productSales: 0,
    revenue: 0,
    newUsers: 0
  })
  
  const [revenueTimeSeries, setRevenueTimeSeries] = useState<RevenueTimeSeries[]>([])
  const [revenueByType, setRevenueByType] = useState<RevenueByType[]>([])
  const [topMovies, setTopMovies] = useState<TopMovie[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])

  // Fetch available years on mount
  useEffect(() => {
    fetchAvailableYears()
  }, [])

  // Fetch stats and time series when timeFilter changes
  useEffect(() => {
    fetchStatsData()
  }, [timeFilter])

  // Fetch revenue type when year changes
  useEffect(() => {
    fetchRevenueTypeData()
  }, [yearForRevenueType])

  // Fetch payment methods when year changes
  useEffect(() => {
    fetchPaymentData()
  }, [yearForPayment])

  // Fetch movies once on mount
  useEffect(() => {
    fetchMoviesData()
  }, [])

  useEffect(() => {
    fetchTimeSeriesData()
  }, [])

  const fetchAIAnalysis = async () => {
    setIsAIModalOpen(true)
    setLoadingAI(true)
    setAiError(null)

    try {
      const res = await revenueAnalysisAIAdmin(timeFilter)
      setAiAnalysis(res.answer)
    } catch (error) {
      console.error("AI analysis error:", error)
      setAiError(handleError(error))
    } finally {
      setLoadingAI(false)
    }
  }

  const fetchAvailableYears = async () => {
    try {
      const years = await getYearInvoicesAdmin()
      setAvailableYears(years || [])
      
      // Set default year if current year not in list
      const currentYear = new Date().getFullYear()
      if (years && years.length > 0 && !years.includes(currentYear)) {
        setYearForRevenueType(years[years.length - 1].toString())
        setYearForPayment(years[years.length - 1].toString())
      }
    } catch (error) {
      console.error("Error fetching years:", error)
    }
  }

  const fetchStatsData = async () => {
    setLoadingStats(true)
    try {
      const [ticketSales, productSales, revenue, newUsers] = await Promise.all([
        getTicketSalesStatisticsAdmin(timeFilter),
        getProductSalesStatisticsAdmin(timeFilter),
        getRevenueStatisticsAdmin(timeFilter),
        getNewUsersStatisticsAdmin(timeFilter)
      ])

      setStats({
        ticketSales: Number(ticketSales) || 0,
        productSales: Number(productSales) || 0,
        revenue: Number(revenue) || 0,
        newUsers: Number(newUsers) || 0
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
      setError("Không thể tải dữ liệu thống kê.")
    } finally {
      setLoadingStats(false)
    }
  }

  const fetchTimeSeriesData = async () => {
    setLoadingTimeSeries(true)
    try {
      const timeSeries = await getRevenueTimeSeriesAdmin()
      setRevenueTimeSeries(timeSeries || [])
    } catch (error) {
      console.error("Error fetching time series:", error)
    } finally {
      setLoadingTimeSeries(false)
    }
  }

  const fetchRevenueTypeData = async () => {
    setLoadingRevenueType(true)
    try {
      const byType = await getRevenueByTypeAdmin(yearForRevenueType)
      setRevenueByType(byType || [])
    } catch (error) {
      console.error("Error fetching revenue type:", error)
    } finally {
      setLoadingRevenueType(false)
    }
  }

  const fetchPaymentData = async () => {
    setLoadingPayment(true)
    try {
      const payments = await getPaymentMethodsAdmin(yearForPayment)
      setPaymentMethods(payments || [])
    } catch (error) {
      console.error("Error fetching payment methods:", error)
    } finally {
      setLoadingPayment(false)
    }
  }

  const fetchMoviesData = async () => {
    setLoadingMovies(true)
    try {
      const movies = await getTopMoviesAdmin()
      setTopMovies(movies || [])
    } catch (error) {
      console.error("Error fetching movies:", error)
    } finally {
      setLoadingMovies(false)
    }
  }

  const fetchAllData = () => {
    fetchStatsData()
    fetchTimeSeriesData()
    fetchRevenueTypeData()
    fetchPaymentData()
    fetchMoviesData()
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString("vi-VN") + " VNĐ"
  }

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toString()
  }

  const revenueTimeChartData = {
    labels: revenueTimeSeries.map(d => d.hour),
    datasets: [{
      label: "Doanh thu (VNĐ)",
      data: revenueTimeSeries.map(d => d.revenue),
      borderColor: "rgb(124, 58, 237)",
      backgroundColor: "rgba(124, 58, 237, 0.05)",
      tension: 0.4,
      fill: true,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: "rgb(124, 58, 237)",
      pointHoverBorderColor: "white",
      pointHoverBorderWidth: 2
    }]
  }

  const revenueTypeChartData = {
    labels: revenueByType.map(d => d.type === "Ticket Sales" ? "Vé" : "Combo/Sản phẩm"),
    datasets: [{
      data: revenueByType.map(d => d.revenue),
      backgroundColor: [
        "rgba(59, 130, 246, 0.8)",
        "rgba(16, 185, 129, 0.8)"
      ],
      borderColor: [
        "rgb(59, 130, 246)",
        "rgb(16, 185, 129)"
      ],
      borderWidth: 2,
      hoverOffset: 15
    }]
  }

  const paymentMethodChartData = {
    labels: paymentMethods.map(p => {
      if (p.methodPayment === "VNPAY") return "VNPay"
      if (p.methodPayment === "MOMO") return "MoMo"
      if (p.methodPayment === "TIENMAT") return "Tiền mặt"
      return p.methodPayment
    }),
    datasets: [{
      data: paymentMethods.map(p => p.count),
      backgroundColor: [
        "rgba(139, 92, 246, 0.8)",
        "rgba(245, 158, 11, 0.8)",
        "rgba(236, 72, 153, 0.8)"
      ],
      borderColor: [
        "rgb(139, 92, 246)",
        "rgb(245, 158, 11)",
        "rgb(236, 72, 153)"
      ],
      borderWidth: 2,
      hoverOffset: 15
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          usePointStyle: true,
          pointStyle: "circle" as const
        }
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        borderRadius: 8,
        titleFont: {
          size: 13,
          weight: "bold" as const
        },
        bodyFont: {
          size: 12
        }
      }
    }
  }

  const isLoading = loadingStats || loadingTimeSeries || loadingRevenueType || loadingPayment || loadingMovies

  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-red-600 mb-4 text-lg font-semibold">{error}</p>
            <Button 
              onClick={fetchAllData}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Thử lại
            </Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header Section */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-purple-100 via-white to-pink-100 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="flex gap-3">
              <Button
                onClick={fetchAllData}
                disabled={isLoading}
                className="border border-gray-300 bg-white hover:bg-gray-100 text-gray-700"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Làm mới
              </Button>

              

              <NativeSelect
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.currentTarget.value)}
                className="bg-white shadow-none"
              >
                <NativeSelectOption value="day" className="text-black">Hôm nay</NativeSelectOption>
                <NativeSelectOption value="week" className="text-black">Tuần này</NativeSelectOption>
                <NativeSelectOption value="month" className="text-black">Tháng này</NativeSelectOption>
                <NativeSelectOption value="year" className="text-black">Năm này</NativeSelectOption>
              </NativeSelect>

              <Button
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md"
                onClick={fetchAIAnalysis}
              >
                <Brain className="h-4 w-4 mr-2" /> 
                AI phân tích doanh thu
              </Button>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              { 
                title: "Tổng số vé bán ra", 
                value: stats.ticketSales + " vé", 
                icon: Ticket,
                bg: "bg-gradient-to-br from-rose-500/80 to-fuchsia-900",
                iconBg: "bg-white/30",
                textColor: "text-white"
              },
              { 
                title: "Tổng số hóa đơn sản phẩm bán ra", 
                value: stats.productSales + " đơn", 
                icon: ShoppingCart,
                bg: "bg-gradient-to-br from-violet-400/80 to-violet-800",
                iconBg: "bg-white/30",
                textColor: "text-white"
              },
              { 
                title: "Tổng doanh thu", 
                value: formatCurrency(stats.revenue), 
                icon: DollarSign,
                bg: "bg-gradient-to-br from-cyan-400/80 to-sky-700",
                iconBg: "bg-white/30",
                textColor: "text-white"
              },
              { 
                title: "Khách hàng mới", 
                value: stats.newUsers, 
                icon: Users,
                bg: "bg-gradient-to-br from-yellow-300/80 to-orange-600",
                iconBg: "bg-white/30",
                textColor: "text-white"
              },
            ].map((card, index) => {
              const Icon = card.icon
              return (
                <div
                  key={index}
                  className={`${card.bg} rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${card.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-6 w-6 ${card.textColor}`} />
                    </div>
                  </div>
                  <p className={`text-sm font-medium ${card.textColor} mb-1`}>{card.title}</p>
                  <p className={`text-3xl font-bold ${card.textColor}`}>
                    {loadingStats ? (
                      <span className="inline-block w-28 h-9 bg-white/30 rounded-lg animate-pulse"></span>
                    ) : (
                      card.value
                    )}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Revenue Time Chart - Full Width */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Doanh thu theo giờ</h2>
              <p className="text-sm text-gray-500">Thống kê trong ngày hôm nay</p>
            </div>
          </div>
          <div className="h-80">
            {loadingTimeSeries ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
              </div>
            ) : (
              <Line data={revenueTimeChartData} options={{
                ...chartOptions,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: "rgba(0, 0, 0, 0.05)"
                    },
                    ticks: {
                      callback: (value) => formatNumber(Number(value)),
                      font: {
                        size: 11
                      }
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    },
                    ticks: {
                      font: {
                        size: 11
                      }
                    }
                  }
                }
              }} />
            )}
          </div>
        </div>

        {/* Two Pie Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Doanh thu theo loại</h2>
                <p className="text-sm text-gray-500">Phân loại vé và sản phẩm</p>
              </div>
              <NativeSelect
                value={yearForRevenueType}
                onChange={(e) => setYearForRevenueType(e.currentTarget.value)}
                className="w-28 text-sm"
                disabled={loadingRevenueType}
              >
                {availableYears.map(year => (
                  <NativeSelectOption key={year} value={year.toString()}>
                    {year}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div className="h-72">
              {loadingRevenueType ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                </div>
              ) : (
                <Pie data={revenueTypeChartData} options={chartOptions} />
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Phương thức thanh toán</h2>
                <p className="text-sm text-gray-500">Thống kê giao dịch</p>
              </div>
              <NativeSelect
                value={yearForPayment}
                onChange={(e) => setYearForPayment(e.currentTarget.value)}
                className="w-28 text-sm"
                disabled={loadingPayment}
              >
                {availableYears.map(year => (
                  <NativeSelectOption key={year} value={year.toString()}>
                    {year}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div className="h-72">
              {loadingPayment ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
                </div>
              ) : (
                <Pie data={paymentMethodChartData} options={chartOptions} />
              )}
            </div>
          </div>
        </div>

        {/* Top Movies Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Trophy className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Top 5 phim bán chạy nhất</h2>
              <p className="text-sm text-gray-500">Xếp hạng theo số vé bán ra</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {loadingMovies ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-3 animate-pulse">
                  <div className="aspect-[2/3] bg-gray-200 rounded-xl"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))
            ) : topMovies.length > 0 ? (
              topMovies.map((movie, index) => (
                <div 
                  key={movie.maPhim}
                  className="group relative"
                >
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-md group-hover:shadow-2xl transition-all duration-300">
                    <img 
                      src={movie.anhBia} 
                      alt={movie.tenPhim}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/300x450?text=No+Image"
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Ranking Badge */}
                    <div className={`absolute top-3 left-3 w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg ${
                      index === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600" :
                      index === 1 ? "bg-gradient-to-br from-gray-300 to-gray-500" :
                      index === 2 ? "bg-gradient-to-br from-orange-400 to-orange-600" :
                      "bg-gradient-to-br from-blue-500 to-purple-600"
                    }`}>
                      {index + 1}
                    </div>

                    {/* Ticket Count Badge */}
                    <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Ticket className="h-4 w-4 text-blue-600" />
                          <span className="text font-bold text-gray-900">{movie.countTicketSold.toLocaleString()}</span>
                        </div>
                        <span className="text text-gray-500">vé</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-snug group-hover:text-purple-600 transition-colors">
                      {movie.tenPhim}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Ticket className="h-3 w-3" />
                      <span className="font-medium text-gray-700">{movie.countTicketSold.toLocaleString()}</span>
                      <span>tickets</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-5 text-center py-12 text-gray-500">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Không có dữ liệu phim</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Revenue Analysis Section */}
        <Dialog open={isAIModalOpen} onOpenChange={setIsAIModalOpen}>
          <DialogContent className="md:max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-indigo-600" />
                Phân tích doanh thu thông minh (AI)
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4 overflow-y-auto max-h-[70vh]">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-indigo-100 min-h-[180px] prose prose-indigo max-w-none">
                {loadingAI ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-4">
                    <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                    <p className="text-gray-600">AI đang phân tích dữ liệu doanh thu...</p>
                  </div>
                ) : aiError ? (
                  <div className="text-center py-8 text-red-600">
                    <p className="font-medium">{aiError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={fetchAIAnalysis}
                    >
                      Thử lại
                    </Button>
                  </div>
                ) : aiAnalysis ? (
                  <div className="whitespace-pre-wrap leading-relaxed text-gray-800">
                    <Markdown>{aiAnalysis}</Markdown>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                    <Brain className="h-12 w-12 mb-3 opacity-40" />
                    <p>Lỗi khi phân tích dữ liệu doanh thu bằng AI</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

export default DashboardPage