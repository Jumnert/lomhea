/**
 * Bakong Open API client for server-side payment verification.
 * Never call this directly from client components.
 */

const BAKONG_BASE_URL =
  process.env.BAKONG_BASE_URL || "https://sit-api-bakong.nbc.org.kh";
const BAKONG_EMAIL = process.env.BAKONG_EMAIL;
const BAKONG_STATIC_TOKEN = process.env.BAKONG_ACCESS_TOKEN;

export interface BakongResponse<T> {
  data: T | null;
  errorCode?: number | null;
  responseCode: number;
  responseMessage: string;
}

export interface BakongTokenData {
  token?: string;
  accessToken?: string;
  expiresAt?: number;
}

export interface BakongTransactionData {
  hash: string;
  fromAccountId: string;
  toAccountId: string;
  currency: "USD" | "KHR" | string;
  amount: number;
  description?: string;
}

export type BakongTransactionStatus = "SUCCESS" | "PENDING" | "FAILED";

export interface BakongTransactionCheckResult {
  status: BakongTransactionStatus;
  data: BakongTransactionData | null;
  responseCode: number;
  responseMessage: string;
}

function parseToken(result: BakongResponse<BakongTokenData>): string | null {
  return result.data?.token || result.data?.accessToken || null;
}

function inferStatus(
  result: BakongResponse<BakongTransactionData>,
): BakongTransactionStatus {
  if (result.responseCode === 0 && result.data) return "SUCCESS";

  const message = (result.responseMessage || "").toLowerCase();
  if (message.includes("not found") || message.includes("could not be found")) {
    return "PENDING";
  }
  if (message.includes("failed")) return "FAILED";

  return "PENDING";
}

export class BakongClient {
  private static token: string | null = null;
  private static tokenExpiresAtMs = 0;

  private static hasValidCachedToken() {
    const now = Date.now();
    return (
      this.token &&
      this.tokenExpiresAtMs > 0 &&
      this.tokenExpiresAtMs - now > 2 * 60 * 1000
    );
  }

  static async renewToken(force = false): Promise<string> {
    if (BAKONG_STATIC_TOKEN) {
      this.token = BAKONG_STATIC_TOKEN;
      this.tokenExpiresAtMs = Date.now() + 7 * 24 * 60 * 60 * 1000;
      return this.token;
    }

    if (!force && this.hasValidCachedToken()) {
      return this.token as string;
    }

    if (!BAKONG_EMAIL) {
      throw new Error(
        "Bakong token is missing. Set BAKONG_ACCESS_TOKEN or BAKONG_EMAIL.",
      );
    }

    const res = await fetch(`${BAKONG_BASE_URL}/v1/renew_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: BAKONG_EMAIL }),
      cache: "no-store",
    });

    const result: BakongResponse<BakongTokenData> = await res.json();
    const token = parseToken(result);

    if (!res.ok || !token) {
      throw new Error(
        `Bakong token renewal failed: ${result.responseMessage || "Unknown error"}`,
      );
    }

    this.token = token;
    this.tokenExpiresAtMs = result.data?.expiresAt || Date.now() + 89 * 86400000;
    return token;
  }

  static async checkTransactionStatus(input: {
    md5?: string;
    hash?: string;
  }): Promise<BakongTransactionCheckResult> {
    const isMd5Mode = Boolean(input.md5);
    const target = isMd5Mode
      ? `${BAKONG_BASE_URL}/v1/check_transaction_by_md5`
      : `${BAKONG_BASE_URL}/v1/check_transaction_by_hash`;

    const payload = isMd5Mode ? { md5: input.md5 } : { hash: input.hash };
    if (!payload.md5 && !payload.hash) {
      throw new Error("Missing md5/hash for Bakong transaction check.");
    }

    const runCheck = async (token: string) => {
      const res = await fetch(target, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const result: BakongResponse<BakongTransactionData> = await res.json();
      return { res, result };
    };

    let token = await this.renewToken();
    let { res, result } = await runCheck(token);

    if (res.status === 401) {
      token = await this.renewToken(true);
      ({ res, result } = await runCheck(token));
    }

    return {
      status: inferStatus(result),
      data: result.data,
      responseCode: result.responseCode,
      responseMessage: result.responseMessage,
    };
  }

  static async checkTransactionByMd5(md5: string) {
    const checked = await this.checkTransactionStatus({ md5 });
    return checked.status === "SUCCESS" ? checked.data : null;
  }
}
