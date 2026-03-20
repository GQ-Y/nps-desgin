package controllers

import (
	"ehang.io/nps/lib/common"
	"ehang.io/nps/server"
	"github.com/astaxie/beego"
)

// ApiController 提供 JSON API，供 React 前端调用
// 鉴权失败时返回 401，不重定向
type ApiController struct {
	beego.Controller
}

// Dashboard 返回仪表盘数据 JSON，合并配置项供前端使用
func (c *ApiController) Dashboard() {
	if c.GetSession("auth") != true {
		c.Ctx.Output.Status = 401
		c.Data["json"] = map[string]interface{}{"error": "unauthorized"}
		c.ServeJSON()
		return
	}
	data := server.GetDashboardData()
	// 合并配置项
	allowFlowLimit, _ := beego.AppConfig.Bool("allow_flow_limit")
	allowRateLimit, _ := beego.AppConfig.Bool("allow_rate_limit")
	allowConnLimit, _ := beego.AppConfig.Bool("allow_connection_num_limit")
	allowTunnelLimit, _ := beego.AppConfig.Bool("allow_tunnel_num_limit")
	allowUserLogin, _ := beego.AppConfig.Bool("allow_user_login")
	allowMultiIP, _ := beego.AppConfig.Bool("allow_multi_ip")
	allowLocalProxy, _ := beego.AppConfig.Bool("allow_local_proxy")
	httpsJustProxy, _ := beego.AppConfig.Bool("https_just_proxy")
	systemInfoDisplay, _ := beego.AppConfig.Bool("system_info_display")
	allowUserRegister, _ := beego.AppConfig.Bool("allow_user_register")
	allowUserChangeUsername, _ := beego.AppConfig.Bool("allow_user_change_username")
	isAdmin := true
	if v := c.GetSession("isAdmin"); v != nil {
		isAdmin = v.(bool)
	}
	ip := common.GetIpByAddr(c.Ctx.Request.Host)
	data["allow_flow_limit"] = allowFlowLimit
	data["allow_rate_limit"] = allowRateLimit
	data["allow_connection_num_limit"] = allowConnLimit
	data["allow_tunnel_num_limit"] = allowTunnelLimit
	data["allow_user_login"] = allowUserLogin
	data["allow_multi_ip"] = allowMultiIP
	data["allow_local_proxy"] = allowLocalProxy
	data["https_just_proxy"] = httpsJustProxy
	data["system_info_display"] = systemInfoDisplay
	data["allow_user_register"] = allowUserRegister
	data["allow_user_change_username"] = allowUserChangeUsername
	data["isAdmin"] = isAdmin
	data["ip"] = ip
	data["p"] = server.Bridge.TunnelPort
	data["bridgeType"] = beego.AppConfig.String("bridge_type")
	if common.IsWindows() {
		data["win"] = ".exe"
	} else {
		data["win"] = ""
	}
	c.Data["json"] = data
	c.ServeJSON()
}

// PublicConfig 返回无需登录的公开配置（如登录页是否显示注册入口）
func (c *ApiController) PublicConfig() {
	allowUserRegister, _ := beego.AppConfig.Bool("allow_user_register")
	c.Data["json"] = map[string]interface{}{"allow_user_register": allowUserRegister}
	c.ServeJSON()
}
