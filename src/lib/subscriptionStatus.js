let currentIssue = null;
const listeners = new Set();

export function setSubscriptionIssue(issue) {
  currentIssue = issue;
  listeners.forEach((cb) => cb(currentIssue));
}

export function clearSubscriptionIssue() {
  setSubscriptionIssue(null);
}

export function getSubscriptionIssue() {
  return currentIssue;
}

export function onSubscriptionIssue(callback) {
  listeners.add(callback);
  callback(currentIssue); // deliver current state immediately on subscribe
  return () => listeners.delete(callback);
}