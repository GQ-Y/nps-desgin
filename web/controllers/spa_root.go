package controllers

import (
	"os"
	"path/filepath"
	"strings"

	"ehang.io/nps/lib/common"
	"github.com/astaxie/beego"
)

// SpaRootController 在未走 BaseController 鉴权链的情况下将根路径重定向到新管理端静态资源。
type SpaRootController struct {
	beego.Controller
}

// SpaAdminIndexExists 若存在 nps-desgin 构建产物，则根路径进入新面板。
func SpaAdminIndexExists() bool {
	p := filepath.Join(common.GetRunPath(), "web", "static", "spa", "index.html")
	_, err := os.Stat(p)
	return err == nil
}

// SpaAdminEntryPath 新管理端入口路径（含 web_base_url 前缀时带子路径）。
func SpaAdminEntryPath() string {
	base := strings.TrimSuffix(beego.AppConfig.String("web_base_url"), "/")
	if base != "" {
		return base + "/static/spa/"
	}
	return "/static/spa/"
}

// Get 重定向到 /static/spa/（支持 web_base_url 子路径）。
func (c *SpaRootController) Get() {
	c.Redirect(SpaAdminEntryPath(), 302)
}

// Head 与 Get 一致，避免 curl -I / 监控检查返回 404。
func (c *SpaRootController) Head() {
	c.Redirect(SpaAdminEntryPath(), 302)
}
