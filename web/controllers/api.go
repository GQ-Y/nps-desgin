package controllers

import (
	"ehang.io/nps/lib/common"
	"ehang.io/nps/lib/file"
	"ehang.io/nps/lib/notify"
	"ehang.io/nps/server"
	"github.com/astaxie/beego"
)

// getParam 从 Query 或 Form 读取参数，兼容 POST form-urlencoded
func getParam(c *ApiController, key string) string {
	if v := c.Ctx.Input.Query(key); v != "" {
		return v
	}
	return c.Ctx.Request.FormValue(key)
}

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

// Notifications 返回最近 5 条系统通知（客户端上下线等）
func (c *ApiController) Notifications() {
	if c.GetSession("auth") != true {
		c.Ctx.Output.Status = 401
		c.Data["json"] = map[string]interface{}{"error": "unauthorized"}
		c.ServeJSON()
		return
	}
	list := notify.GetRecent(5)
	c.Data["json"] = list
	c.ServeJSON()
}

// PublicConfig 返回无需登录的公开配置（如登录页是否显示注册入口）
func (c *ApiController) PublicConfig() {
	allowUserRegister, _ := beego.AppConfig.Bool("allow_user_register")
	c.Data["json"] = map[string]interface{}{"allow_user_register": allowUserRegister}
	c.ServeJSON()
}

// Groups 返回分组树（需鉴权）
func (c *ApiController) Groups() {
	if c.GetSession("auth") != true {
		c.Ctx.Output.Status = 401
		c.Data["json"] = map[string]interface{}{"error": "unauthorized"}
		c.ServeJSON()
		return
	}
	list := server.GetGroupTree()
	c.Data["json"] = list
	c.ServeJSON()
}

// GroupAdd 添加分组
func (c *ApiController) GroupAdd() {
	if c.GetSession("auth") != true {
		c.Ctx.Output.Status = 401
		c.Data["json"] = map[string]interface{}{"error": "unauthorized"}
		c.ServeJSON()
		return
	}
	if c.GetSession("isAdmin") != true {
		c.Ctx.Output.Status = 403
		c.Data["json"] = map[string]interface{}{"error": "forbidden"}
		c.ServeJSON()
		return
	}
	parentId := common.GetIntNoErrByStr(getParam(c, "parent_id"))
	name := getParam(c, "name")
	sortOrder := common.GetIntNoErrByStr(getParam(c, "sort_order"))
	if name == "" {
		c.Data["json"] = map[string]interface{}{"status": 0, "msg": "name required"}
		c.ServeJSON()
		return
	}
	g := &file.ClientGroup{ParentId: parentId, Name: name, SortOrder: sortOrder}
	if err := file.GetDb().NewGroup(g); err != nil {
		c.Data["json"] = map[string]interface{}{"status": 0, "msg": err.Error()}
		c.ServeJSON()
		return
	}
	c.Data["json"] = map[string]interface{}{"status": 1, "msg": "ok", "id": g.Id}
	c.ServeJSON()
}

// GroupEdit 编辑分组
func (c *ApiController) GroupEdit() {
	if c.GetSession("auth") != true {
		c.Ctx.Output.Status = 401
		c.Data["json"] = map[string]interface{}{"error": "unauthorized"}
		c.ServeJSON()
		return
	}
	if c.GetSession("isAdmin") != true {
		c.Ctx.Output.Status = 403
		c.Data["json"] = map[string]interface{}{"error": "forbidden"}
		c.ServeJSON()
		return
	}
	id := common.GetIntNoErrByStr(getParam(c, "id"))
	name := getParam(c, "name")
	parentId := common.GetIntNoErrByStr(getParam(c, "parent_id"))
	sortOrder := common.GetIntNoErrByStr(getParam(c, "sort_order"))
	g, err := file.GetDb().GetGroup(id)
	if err != nil {
		c.Data["json"] = map[string]interface{}{"status": 0, "msg": err.Error()}
		c.ServeJSON()
		return
	}
	if name != "" {
		g.Name = name
	}
	g.ParentId = parentId
	g.SortOrder = sortOrder
	file.GetDb().UpdateGroup(g)
	c.Data["json"] = map[string]interface{}{"status": 1, "msg": "ok"}
	c.ServeJSON()
}

// GroupDel 删除分组
func (c *ApiController) GroupDel() {
	if c.GetSession("auth") != true {
		c.Ctx.Output.Status = 401
		c.Data["json"] = map[string]interface{}{"error": "unauthorized"}
		c.ServeJSON()
		return
	}
	if c.GetSession("isAdmin") != true {
		c.Ctx.Output.Status = 403
		c.Data["json"] = map[string]interface{}{"error": "forbidden"}
		c.ServeJSON()
		return
	}
	id := common.GetIntNoErrByStr(getParam(c, "id"))
	if err := file.GetDb().DelGroup(id); err != nil {
		c.Data["json"] = map[string]interface{}{"status": 0, "msg": err.Error()}
		c.ServeJSON()
		return
	}
	c.Data["json"] = map[string]interface{}{"status": 1, "msg": "ok"}
	c.ServeJSON()
}

// GroupMove 移动分组到新父级
func (c *ApiController) GroupMove() {
	if c.GetSession("auth") != true {
		c.Ctx.Output.Status = 401
		c.Data["json"] = map[string]interface{}{"error": "unauthorized"}
		c.ServeJSON()
		return
	}
	if c.GetSession("isAdmin") != true {
		c.Ctx.Output.Status = 403
		c.Data["json"] = map[string]interface{}{"error": "forbidden"}
		c.ServeJSON()
		return
	}
	id := common.GetIntNoErrByStr(getParam(c, "id"))
	newParentId := common.GetIntNoErrByStr(getParam(c, "parent_id"))
	if err := file.GetDb().MoveGroup(id, newParentId); err != nil {
		c.Data["json"] = map[string]interface{}{"status": 0, "msg": err.Error()}
		c.ServeJSON()
		return
	}
	c.Data["json"] = map[string]interface{}{"status": 1, "msg": "ok"}
	c.ServeJSON()
}

// GroupMoveClient 移动客户端到分组
func (c *ApiController) GroupMoveClient() {
	if c.GetSession("auth") != true {
		c.Ctx.Output.Status = 401
		c.Data["json"] = map[string]interface{}{"error": "unauthorized"}
		c.ServeJSON()
		return
	}
	clientId := common.GetIntNoErrByStr(getParam(c, "client_id"))
	groupId := common.GetIntNoErrByStr(getParam(c, "group_id"))
	if c.GetSession("isAdmin") != true {
		if sid := c.GetSession("clientId"); sid == nil || sid.(int) != clientId {
			c.Ctx.Output.Status = 403
			c.Data["json"] = map[string]interface{}{"error": "forbidden"}
			c.ServeJSON()
			return
		}
	}
	if err := file.GetDb().MoveClientToGroup(clientId, groupId); err != nil {
		c.Data["json"] = map[string]interface{}{"status": 0, "msg": err.Error()}
		c.ServeJSON()
		return
	}
	c.Data["json"] = map[string]interface{}{"status": 1, "msg": "ok"}
	c.ServeJSON()
}
