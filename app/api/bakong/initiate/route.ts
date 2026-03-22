import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import crypto from "crypto";

type KhqrSdk = {
  BakongKHQR: new () => {
    generateIndividual: (arg: unknown) => {
      status?: { code?: number };
      data?: { qr?: string; md5?: string };
    };
    generateMerchant: (arg: unknown) => {
      status?: { code?: number };
      data?: { qr?: string; md5?: string };
    };
  };
  IndividualInfo: new (
    accountId: string,
    merchantName: string,
    merchantCity: string,
    optionalData: Record<string, unknown>,
  ) => unknown;
  MerchantInfo: new (
    accountId: string,
    merchantName: string,
    merchantCity: string,
    merchantId: string,
    acquiringBank: string,
    optionalData: Record<string, unknown>,
  ) => unknown;
  khqrData: { currency: { usd: unknown; khr: unknown } };
};

async function generateKhqr(
  accountId: string,
  amount: number,
): Promise<{ qrString: string; md5: string }> {
  const sdk = (await import("bakong-khqr")) as unknown as KhqrSdk;
  const khqr = new sdk.BakongKHQR();

  const merchantName = process.env.BAKONG_MERCHANT_NAME || "Lomhea";
  const merchantCity = process.env.BAKONG_MERCHANT_CITY || "Phnom Penh";
  const optionalData = {
    currency: sdk.khqrData.currency.usd,
    amount,
    billNumber: `LOMHEA-${Date.now()}`,
    purposeOfTransaction: "Featured place promotion",
    expirationTimestamp: Date.now() + 10 * 60 * 1000,
    merchantCategoryCode: "5999",
  };

  const merchantId = process.env.BAKONG_MERCHANT_ID;
  const acquiringBank = process.env.BAKONG_ACQUIRING_BANK;

  const response =
    merchantId && acquiringBank
      ? khqr.generateMerchant(
          new sdk.MerchantInfo(
            accountId,
            merchantName,
            merchantCity,
            merchantId,
            acquiringBank,
            optionalData,
          ),
        )
      : khqr.generateIndividual(
          new sdk.IndividualInfo(
            accountId,
            merchantName,
            merchantCity,
            optionalData,
          ),
        );

  const qrString = response?.data?.qr;
  const md5 = response?.data?.md5;
  const code = response?.status?.code;

  if (!qrString || !md5 || code !== 0) {
    throw new Error("KHQR generation failed");
  }

  return { qrString, md5 };
}

function generateMockKhqr(accountId: string, amount: number) {
  const payload = `00020101021229${String(accountId.length).padStart(2, "0")}${accountId}520459995303840540${amount.toFixed(2)}5802KH5910Lomhea6010PhnomPenh6304FAKE`;
  const md5 = crypto.createHash("md5").update(payload).digest("hex");
  return { qrString: payload, md5 };
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { placeId, amount } = await request.json();
    if (!placeId || typeof placeId !== "string") {
      return NextResponse.json({ error: "Invalid placeId" }, { status: 400 });
    }
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const place = await prisma.place.findUnique({
      where: { id: placeId },
      select: { id: true },
    });
    if (!place) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    const BAKONG_ACCOUNT = process.env.BAKONG_ACCOUNT_ID || "lomhea@devb";

    let qrString = "";
    let md5 = "";
    try {
      // Generate real KHQR that Bakong apps can scan.
      ({ qrString, md5 } = await generateKhqr(BAKONG_ACCOUNT, amount));
    } catch (error) {
      const allowMock = process.env.BAKONG_ALLOW_MOCK_QR === "true";
      if (allowMock) {
        ({ qrString, md5 } = generateMockKhqr(BAKONG_ACCOUNT, amount));
      } else {
        return NextResponse.json(
          {
            error:
              "Real KHQR generation failed. Install/configure bakong-khqr and Bakong merchant env vars.",
          },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      qrString,
      md5,
      amount,
      currency: "USD",
      expiresAt: Date.now() + 10 * 60 * 1000,
      placeId: place.id,
    });
  } catch (error) {
    return NextResponse.json({ error: "Initiation failed" }, { status: 500 });
  }
}
