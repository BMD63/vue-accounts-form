function genId(): string {
  return 'acc_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
export default genId;