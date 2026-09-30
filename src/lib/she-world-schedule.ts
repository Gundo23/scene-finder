export function sheWorldSchedule(pageText: string) {
  return {
    thursday: /\bevery thursday\b/i.test(pageText) ||
      /\bthursday'?s?\s+2\s*pm\s*-\s*2\s*am\s+weekly\b/i.test(pageText),
    saturday: /\bevery saturday\b/i.test(pageText) ||
      /\bsaturday'?s?\s+8\s*pm\s*-\s*3\s*am\s+weekly\b/i.test(pageText),
    firstMonday: /\b1st\s+monday\s+monthly\s+5\s*pm\s*-\s*1\s*am\b/i.test(pageText),
  }
}
