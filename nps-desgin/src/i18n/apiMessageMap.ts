import type { TFunction } from 'i18next';

/** 登录接口等返回的固定英文文案 → i18n key（随当前语言显示） */
const LOGIN_API_MSG_TO_KEY: Record<string, string> = {
  'username or password incorrect': 'login.wrongCredential',
};

export function translateLoginApiMessage(msg: string | undefined, t: TFunction): string {
  if (msg == null || msg === '') return t('login.wrongCredential');
  const key = LOGIN_API_MSG_TO_KEY[msg];
  if (key) return t(key);
  return msg;
}
