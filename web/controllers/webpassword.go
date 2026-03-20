package controllers

import (
	"errors"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"sync"

	"ehang.io/nps/lib/common"
	"github.com/astaxie/beego"
)

var (
	webPasswordMu       sync.RWMutex
	webPasswordOverride string
)

// EffectiveWebPassword 返回当前生效的 Web 管理密码：改密后进程内覆盖优先于配置文件。
func EffectiveWebPassword() string {
	webPasswordMu.RLock()
	defer webPasswordMu.RUnlock()
	if webPasswordOverride != "" {
		return webPasswordOverride
	}
	return beego.AppConfig.String("web_password")
}

// SetWebPasswordOverride 在成功写入 nps.conf 后同步内存，使新密码立即生效而无需重启。
func SetWebPasswordOverride(pw string) {
	webPasswordMu.Lock()
	defer webPasswordMu.Unlock()
	webPasswordOverride = pw
}

// SaveWebPasswordToConf 将 web_password 写回 conf/nps.conf（正则替换整行）。
func SaveWebPasswordToConf(newPassword string) error {
	if strings.ContainsAny(newPassword, "\r\n") {
		return errors.New("密码不能包含换行")
	}
	path := filepath.Join(common.GetRunPath(), "conf", "nps.conf")
	b, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	content := string(b)
	re := regexp.MustCompile(`(?m)^(\s*web_password\s*=\s*).*$`)
	if !re.MatchString(content) {
		return errors.New("配置文件中未找到 web_password")
	}
	content = re.ReplaceAllStringFunc(content, func(line string) string {
		sub := re.FindStringSubmatch(line)
		if len(sub) < 2 {
			return line
		}
		return sub[1] + newPassword
	})
	return os.WriteFile(path, []byte(content), 0644)
}
