import { Resend } from "resend";
import { NextResponse } from "next/server";

export const GET = async () => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";

  console.log("[TEST EMAIL] Starting test...");
  console.log("[TEST EMAIL] API Key exists:", !!process.env.RESEND_API_KEY);
  console.log("[TEST EMAIL] From:", fromEmail);

  try {
    const { data, error } = await resend.emails.send({
      from: `Lomhea Test <${fromEmail}>`,
      to: "admin@lomhea.com", // Adjust as needed
      subject: "Test Email from Lomhea",
      html: "<h1>It works!</h1>",
    });

    if (error) {
      console.error("[TEST EMAIL] Error:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    console.log("[TEST EMAIL] Success! ID:", data?.id);
    return NextResponse.json({ data });
  } catch (err: any) {
    console.error("[TEST EMAIL] Exception:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
