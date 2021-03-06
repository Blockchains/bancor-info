import { useEffect, useState } from 'react'
import fetchChartHome from '../bancor/chartHome'
import { dayjs } from '../bancor/utils'

export function useUniswapHistory(daysToQuery) {
  const [uniswapData, setUniswapData] = useState([])
  useEffect(() => {
    const fetchChartData = async function(daysToQuery) {
      try {
        // current time
        const utcEndTime = dayjs.utc()

        let utcStartTime
        // go back, go way way back
        switch (daysToQuery) {
          case 'all':
            utcStartTime = utcEndTime.subtract(1, 'year').startOf('year')
            break
          case '3months':
            utcStartTime = utcEndTime.subtract(3, 'month')
            break
          case '1month':
            utcStartTime = utcEndTime.subtract(1, 'month')
            break
          case '1week':
          default:
            utcStartTime = utcEndTime.subtract(7, 'day').startOf('day')
            break
        }
        const utcStartTimeTimestamp = utcStartTime.unix() * 1e3

        const data = await fetchChartHome().then(totals => {
          return Object.entries(totals).reduce((result, [timestamp, values]) => {
            if (dayjs(Number(timestamp)).isBefore(utcStartTimeTimestamp)) {
              return result
            }

            result.push({
              dayString: timestamp / 1e3,
              ethVolume: parseFloat(values.volumeETHInUnit),
              usdVolume: parseFloat(values.volumeUSDBInUnit),
              dailyEthVolume: parseFloat(values.volumeETHInUnit),
              dailyUSDVolume: parseFloat(values.volumeUSDBInUnit),
              usdLiquidity: parseFloat(values.liquidityUSDBInUnit),
              ethLiquidity: parseFloat(values.liquidityETHInUnit),
              txCount: 0
            })

            return result
          }, [])
        })

        setUniswapData(data)
      } catch (err) {
        console.log('error: ', err)
      }
    }
    fetchChartData(daysToQuery)
  }, [daysToQuery])

  return uniswapData
}
