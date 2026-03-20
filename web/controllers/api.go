package controllers

import (
	"ehang.io/nps/server"
	"github.com/astaxie/beego"
)

// ApiController 提供 JSON API，供 React 前端调用
// 鉴权失败时返回 401，不重定向
type ApiController struct {
	beego.Controller
}

// Dashboard 返回仪表盘数据 JSON
func (c *ApiController) Dashboard() {
	if c.GetSession("auth") != true {
		c.Ctx.Output.Status = 401
		c.Data["json"] = map[string]interface{}{"error": "unauthorized"}
		c.ServeJSON()
		return
	}
	c.Data["json"] = server.GetDashboardData()
	c.ServeJSON()
}
