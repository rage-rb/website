import { useEffect, useRef } from "react"
import { useColorMode } from "@docusaurus/theme-common"
import * as echarts from "echarts/core"

import { BarChart } from "echarts/charts"
import {
  TitleComponent,
  GridComponent,
} from "echarts/components"
import { LabelLayout, UniversalTransition } from "echarts/features"
import { CanvasRenderer } from "echarts/renderers"

echarts.use([
  BarChart,
  TitleComponent,
  GridComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
])

const BenchmarkResultChart = ({ title, units, railsVal, rageVal, isLog, datalabels }) => {
    const chartRef = useRef()
    const { colorMode } = useColorMode()

    // https://echarts.apache.org/en/option.html#series-bar.label.formatter
    const formatterOpts = datalabels && { formatter: (params => datalabels[params.dataIndex]) }

    useEffect(() => {
      const options = {
        xAxis: {
          type: "category",
          data: ["Rails", "Rage"],
        },
        yAxis: {
          type: isLog ? "log" : "value",
          name: units,
          nameLocation: "middle",
        },
        series: [
          {
            label: {
              show: true,
              position: "insideTop",
              fontStyle: "bold",
              ...formatterOpts,
            },
            data: [
              {
                value: railsVal,
                itemStyle: {
                  color: colorMode === "light" ? "#b0b0b0" : "#666565"
                }
              },
              {
                value: rageVal,
                itemStyle: {
                  color: colorMode === "light" ? "#ef4444" : "#dc2626"
                }
              },
            ],
            type: "bar"
          }
        ],
        title: {
          text: title,
        },
        backgroundColor: colorMode === "light" ? "#ffffff" : "#1b1b1d",
      }

      const chart = echarts.init(chartRef.current, colorMode)
      chart.setOption(options)

      return () => {
        chart?.dispose()
      }
    }, [colorMode])

    return (
      <div ref={chartRef} className="aspect-square" />
    )
}

export default BenchmarkResultChart
