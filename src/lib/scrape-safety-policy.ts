export function scrapeSafetyPolicy(input: {
  previousCount: number
  stagedCount: number
  failedPageCount: number
  candidateAttempts: number
  qualityReviewCount: number
}) {
  const blocking: string[] = []
  const advisory: string[] = []
  const { previousCount, stagedCount } = input

  // Missing results cannot remove published future events. Publish any
  // individually approved new events, even when another page failed.
  if (previousCount > 0 && stagedCount === 0) {
    advisory.push(`Future events dropped from ${previousCount} to 0; existing events preserved`)
  }
  if (previousCount >= 5 && stagedCount > 0 && stagedCount < Math.ceil(previousCount * 0.4)) {
    advisory.push(`Future event count dropped by more than 60% (${previousCount} → ${stagedCount}); existing events preserved`)
  }
  if (input.failedPageCount >= 3 && stagedCount < previousCount) {
    advisory.push(`${input.failedPageCount} source pages failed during the scrape; approved events can still publish`)
  }

  // A huge batch could fill the public calendar with plausible but incorrect
  // entries. Keep the whole batch held until its source/parser is reviewed.
  if (previousCount >= 5 && stagedCount > Math.max(previousCount * 3, previousCount + 50)) {
    blocking.push(`Future event count spiked unexpectedly (${previousCount} → ${stagedCount})`)
  }
  if (stagedCount > 300 && (previousCount === 0 || stagedCount > previousCount * 1.5)) {
    blocking.push(`Scrape produced an unusually large future event set (${stagedCount})`)
  }

  const qualityReviewReason = input.candidateAttempts >= 8 && input.qualityReviewCount >= 3 &&
    input.qualityReviewCount / input.candidateAttempts >= 0.35
      ? `Data quality guard held ${input.qualityReviewCount} of ${input.candidateAttempts} candidates for individual review`
      : null
  if (qualityReviewReason) advisory.push(qualityReviewReason)

  return { blocking, advisory, qualityReviewReason }
}

export function alertReasonKey(reasons: string[]) {
  return reasons.map((reason) => reason.replace(/\d+/g, '#')).sort().join('|')
}

export function shouldCountMissingEvents(input: {
  stagedCount: number
  failedPageCount: number
  errorCount: number
  publishErrors: number
  qualityReviewCount: number
  rejectedAttempts: number
}) {
  return input.stagedCount > 0 && input.failedPageCount === 0 &&
    input.errorCount === 0 && input.publishErrors === 0 &&
    input.qualityReviewCount === 0 && input.rejectedAttempts === 0
}
