import { NextResponse, type NextRequest } from "next/server";
import { homepageLinkHeaderValue } from "@/lib/agent-discovery";
import { resolvePageMarkdown } from "@/lib/landing-markdown";
import {
  markdownResponseHeaders,
  prefersMarkdown,
} from "@/lib/markdown-negotiation";

/**
 * - Link headers na homepage (RFC 8288 / RFC 9727)
 * - Markdown for Agents: Accept: text/markdown → text/markdown
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accept = request.headers.get("accept");

  if (prefersMarkdown(accept)) {
    const markdown = resolvePageMarkdown(pathname);
    if (markdown) {
      const headers = new Headers(markdownResponseHeaders(markdown));
      if (pathname === "/") {
        headers.set("Link", homepageLinkHeaderValue());
      }
      return new NextResponse(markdown, { status: 200, headers });
    }
  }

  const response = NextResponse.next();

  if (pathname === "/") {
    response.headers.set("Link", homepageLinkHeaderValue());
    // Variantes HTML vs markdown devem ser cacheadas separadamente
    const vary = response.headers.get("Vary");
    response.headers.set(
      "Vary",
      vary?.includes("Accept") ? vary : vary ? `${vary}, Accept` : "Accept",
    );
  }

  return response;
}

export const config = {
  matcher: ["/"],
};
