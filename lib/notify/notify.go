package notify

import (
	"sync"
	"time"
)

// Notification 系统通知（客户端上下线等）
type Notification struct {
	Id        int64     `json:"id"`
	Type      string    `json:"type"` // online, offline
	ClientId  int       `json:"client_id"`
	Remark    string    `json:"remark"`
	Addr      string    `json:"addr"`
	CreatedAt time.Time `json:"created_at"`
}

const maxNotifications = 50

var (
	notifMu       sync.RWMutex
	notifications []Notification
	notifIdSeq    int64
)

func init() {
	notifications = make([]Notification, 0, maxNotifications)
}

// Add 添加一条通知
func Add(typ string, clientId int, remark, addr string) {
	notifMu.Lock()
	defer notifMu.Unlock()
	notifIdSeq++
	n := Notification{
		Id:        notifIdSeq,
		Type:      typ,
		ClientId:  clientId,
		Remark:    remark,
		Addr:      addr,
		CreatedAt: time.Now(),
	}
	notifications = append(notifications, n)
	if len(notifications) > maxNotifications {
		notifications = notifications[len(notifications)-maxNotifications:]
	}
}

// GetRecent 获取最近 limit 条通知（按时间倒序）
func GetRecent(limit int) []Notification {
	notifMu.RLock()
	defer notifMu.RUnlock()
	if limit <= 0 {
		limit = 5
	}
	start := len(notifications) - limit
	if start < 0 {
		start = 0
	}
	result := make([]Notification, 0, limit)
	for i := len(notifications) - 1; i >= start && len(result) < limit; i-- {
		result = append(result, notifications[i])
	}
	return result
}
