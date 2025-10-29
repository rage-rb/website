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

const BenchmarkResultChart = ({ title, units, xAxis = ["Rails", "Rage"], values, datalabels, isLog = false, rotateLabels = false }) => {
    const chartRef = useRef()
    const { colorMode } = useColorMode()

    // https://echarts.apache.org/en/option.html#series-bar.label.formatter
    const formatterOpts = datalabels && { formatter: (params => datalabels[params.dataIndex]) }

    const labelOpts = rotateLabels && { axisLabel: { interval: 0, rotate: 30 } }

    useEffect(() => {
      const data = values.map((value, i) => {
        let background

        if (xAxis[i].includes("Rage")) {
          background = colorMode === "light" ? "#ef4444" : "#dc2626"
        } else {
          background = colorMode === "light" ? "#b0b0b0" : "#666565"
        }

        return {
          value,
          itemStyle: { color: background },
        }
      })

      const options = {
        xAxis: {
          type: "category",
          data: xAxis,
          ...labelOpts,
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
            type: "bar",
            data,
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
