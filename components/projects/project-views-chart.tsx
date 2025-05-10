"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { subDays, format } from "date-fns"

interface ProjectViewsChartProps {
  projectId: string
}

export function ProjectViewsChart({ projectId }: ProjectViewsChartProps) {
  const supabase = createClientComponentClient<Database>()
  const [viewsData, setViewsData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchViewsData = async () => {
      setIsLoading(true)

      try {
        // Get the last 30 days
        const endDate = new Date()
        const startDate = subDays(endDate, 30)

        // Format dates for Postgres
        const startDateStr = startDate.toISOString()
        const endDateStr = endDate.toISOString()

        // Get views by date
        const { data, error } = await supabase
          .from("project_views")
          .select("view_date, id")
          .eq("project_id", projectId)
          .gte("viewed_at", startDateStr)
          .lte("viewed_at", endDateStr)
          .order("view_date", { ascending: true })

        if (error) throw error

        // Process data for the chart
        const viewsByDate = data.reduce((acc: Record<string, number>, view) => {
          const date = view.view_date
          acc[date] = (acc[date] || 0) + 1
          return acc
        }, {})

        // Create an array for the last 30 days
        const chartData = []
        for (let i = 0; i < 30; i++) {
          const date = format(subDays(endDate, 29 - i), "yyyy-MM-dd")
          chartData.push({
            date,
            views: viewsByDate[date] || 0,
            displayDate: format(new Date(date), "MMM d"),
          })
        }

        setViewsData(chartData)
      } catch (error) {
        console.error("Error fetching views data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchViewsData()
  }, [projectId, supabase])

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={viewsData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
          <YAxis allowDecimals={false} />
          <Tooltip
            formatter={(value: number) => [`${value} views`, "Views"]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Line type="monotone" dataKey="views" stroke="#8884d8" activeDot={{ r: 8 }} name="Views" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
