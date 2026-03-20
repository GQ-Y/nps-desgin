package routers

import (
	"ehang.io/nps/web/controllers"
	"github.com/astaxie/beego"
)

func Init() {
	web_base_url := beego.AppConfig.String("web_base_url")
	if len(web_base_url) > 0 {
		ns := beego.NewNamespace(web_base_url,
			beego.NSRouter("/", &controllers.IndexController{}, "*:Index"),
			beego.NSRouter("/api/dashboard", &controllers.ApiController{}, "get:Dashboard"),
			beego.NSRouter("/api/notifications", &controllers.ApiController{}, "get:Notifications"),
			beego.NSRouter("/api/public-config", &controllers.ApiController{}, "get:PublicConfig"),
			beego.NSRouter("/api/groups", &controllers.ApiController{}, "get:Groups"),
			beego.NSRouter("/api/groups/add", &controllers.ApiController{}, "post:GroupAdd"),
			beego.NSRouter("/api/groups/edit", &controllers.ApiController{}, "post:GroupEdit"),
			beego.NSRouter("/api/groups/del", &controllers.ApiController{}, "post:GroupDel"),
			// 使用 move-group 而非 move：部分环境下路径段 "move" 无法正确注册为路由
			beego.NSRouter("/api/groups/move-group", &controllers.ApiController{}, "post:GroupMove"),
			beego.NSRouter("/api/groups/move-client", &controllers.ApiController{}, "post:GroupMoveClient"),
			beego.NSRouter("/api/user/change-password", &controllers.ApiController{}, "post:UserChangePassword"),
			beego.NSAutoRouter(&controllers.IndexController{}),
			beego.NSAutoRouter(&controllers.LoginController{}),
			beego.NSAutoRouter(&controllers.ClientController{}),
			beego.NSAutoRouter(&controllers.AuthController{}),
		)
		beego.AddNamespace(ns)
	} else {
		beego.Router("/", &controllers.IndexController{}, "*:Index")
		beego.Router("/api/dashboard", &controllers.ApiController{}, "get:Dashboard")
		beego.Router("/api/notifications", &controllers.ApiController{}, "get:Notifications")
		beego.Router("/api/public-config", &controllers.ApiController{}, "get:PublicConfig")
		beego.Router("/api/groups", &controllers.ApiController{}, "get:Groups")
		beego.Router("/api/groups/add", &controllers.ApiController{}, "post:GroupAdd")
		beego.Router("/api/groups/edit", &controllers.ApiController{}, "post:GroupEdit")
		beego.Router("/api/groups/del", &controllers.ApiController{}, "post:GroupDel")
		beego.Router("/api/groups/move-group", &controllers.ApiController{}, "post:GroupMove")
		beego.Router("/api/groups/move-client", &controllers.ApiController{}, "post:GroupMoveClient")
		beego.Router("/api/user/change-password", &controllers.ApiController{}, "post:UserChangePassword")
		beego.AutoRouter(&controllers.IndexController{})
		beego.AutoRouter(&controllers.LoginController{})
		beego.AutoRouter(&controllers.ClientController{})
		beego.AutoRouter(&controllers.AuthController{})
	}
}
