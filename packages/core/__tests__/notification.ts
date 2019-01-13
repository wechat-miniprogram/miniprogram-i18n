import Notification from '../notification'

test('Notification', () => {
  const notification = new Notification()
  const newLocale = 'zh-CN'
  let value
  const handler = (val: any) => {
    value = val
  }
  notification.subscribe('localeChange', handler)
  notification.public('localeChange', newLocale)
  expect(value).toEqual(newLocale)

  notification.unsubscribe('localeChange', handler)
  notification.public('localeChange', 'en-US')
  expect(value).toEqual(newLocale)
})
