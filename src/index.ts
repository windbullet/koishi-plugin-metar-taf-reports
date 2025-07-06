import { Context, Schema, h } from 'koishi'

export const name = 'metar-taf-reports'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context) {
  ctx.command("weather-reports <code:string>", "通过ICAO或IATA获取METAR和TAF气象报文")
    .alias("获取气象报文")
    .example("weather-reports ZBAA")
    .action(async ({ session }, code) => {
      let flightRules = "无"
      let metar = "无"
      let taf = "无"

      try {
        const metarRes = await ctx.http.get(`https://avwx.rest/api/metar/${code}?token=CWns3LbEAzpOo0LnurgHxfWe9J6XZWQpL5esheXo9c4`)

        if (metarRes.error) {
          if (metarRes.error.includes("is not a valid")) {
            return h.quote(session.messageId) + "不是合法的ICAO或IATA代码"
          } else {
            return h.quote(session.messageId) + metarRes.error
          }
        }

        flightRules = metarRes.flight_rules
        metar = metarRes.raw
      } catch (e) {
        if (e.message !== "Unexpected end of JSON input") {
          return `${h.quote(session.messageId)}${e.name}: ${e.message}`
        }
      }

      try {
        const tafRes = await ctx.http.get(`https://avwx.rest/api/taf/${code}?token=CWns3LbEAzpOo0LnurgHxfWe9J6XZWQpL5esheXo9c4`)
        if (tafRes.error) return h.quote(session.messageId) + tafRes.error
        taf = tafRes.raw
      } catch (e) {
        if (e.message !== "Unexpected end of JSON input") {
          return `${h.quote(session.messageId)}${e.name}: ${e.message}`
        }
      }

      return `${h.quote(session.messageId)}
飞行规则：${flightRules ?? "无"}

METAR：${metar ?? "无"}

TAF：${taf ?? "无"}`
    })
}
