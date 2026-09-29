const POST_URN_PATTERN = /^urn:li:(activity|share|ugcPost):\d+$/;

/**
 * Turns the post a command was given into the parameter pair the API expects.
 *
 * Post commands take one positional value, and a post is addressable by URL or by URN, so which of
 * the two was typed is decided here rather than by asking for separate flags.
 */
export function buildPostTarget(value: string): { postUrl: string } | { postUrn: string } {
  return POST_URN_PATTERN.test(value) ? { postUrn: value } : { postUrl: value };
}
