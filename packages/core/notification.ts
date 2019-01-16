export type Handler = (value: string) => void

interface Subscribers {
  [name: string]: Handler[]
}

export default class Notification {
  private subscribers: Subscribers = {}

  publish(name: string, value: any) {
    const subs = this.subscribers[name]
    if (!subs) return
    for (const sub of subs.slice()) {
      try {
        sub.call(null, value)
      } catch (err) { /** fall through */}
    }
  }

  subscribe(name: string, handler: Handler) {
    if (typeof handler !== 'function') return
    if (!this.subscribers[name]) {
      this.subscribers[name] = []
    }
    this.subscribers[name].push(handler)
  }

  unsubscribe(name: string, handler: Handler) {
    const subs = this.subscribers[name]
    if (!subs) return
    subs.splice(subs.indexOf(handler), 1)
    if (subs.length === 0) delete this.subscribers[name]
  }
}
