import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminEmail = process.env.ADMIN_EMAIL!;

const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function GET(request: Request) {
  try {
    if (
      !supabaseUrl ||
      !serviceRoleKey ||
      !adminEmail
    ) {
      return NextResponse.json(
        {
          isAdmin: false,
          error: "Configuração administrativa ausente.",
        },
        { status: 500 }
      );
    }

    // =========================================================
    // PEGAR TOKEN DO USUÁRIO
    // =========================================================

    const authorization =
      request.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json({
        isAdmin: false,
      });
    }

    const token = authorization.replace(
      /^Bearer\s+/i,
      ""
    );

    if (!token) {
      return NextResponse.json({
        isAdmin: false,
      });
    }

    // =========================================================
    // VALIDAR USUÁRIO
    // =========================================================

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      console.error(
        "Erro ao verificar usuário admin:",
        error
      );

      return NextResponse.json({
        isAdmin: false,
      });
    }

    // =========================================================
    // VERIFICAR E-MAIL DO ADMIN
    // =========================================================

    const isAdmin =
      user.email?.toLowerCase() ===
      adminEmail.toLowerCase();

    console.log(
      "Verificação admin:",
      user.email,
      "=>",
      isAdmin
    );

    return NextResponse.json({
      isAdmin,
      email: user.email,
    });
  } catch (error) {
    console.error(
      "Erro na API /api/admin/me:",
      error
    );

    return NextResponse.json(
      {
        isAdmin: false,
      },
      { status: 500 }
    );
  }
}