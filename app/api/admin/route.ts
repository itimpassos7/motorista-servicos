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

function verificarConfiguracao() {
  if (
    !supabaseUrl ||
    !serviceRoleKey ||
    !adminEmail
  ) {
    return false;
  }

  return true;
}

async function verificarAdmin(request: Request) {
  const authorization =
    request.headers.get("authorization");

  if (!authorization) {
    return null;
  }

  const token = authorization.replace(
    "Bearer ",
    ""
  );

  if (!token) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  if (
    user.email?.toLowerCase() !==
    adminEmail.toLowerCase()
  ) {
    return null;
  }

  return user;
}

// ============================================================
// LISTAR CLIENTES
// ============================================================

export async function GET(request: Request) {
  try {
    if (!verificarConfiguracao()) {
      return NextResponse.json(
        {
          error:
            "Configuração do administrador não encontrada.",
        },
        { status: 500 }
      );
    }

    const admin = await verificarAdmin(request);

    if (!admin) {
      return NextResponse.json(
        {
          error: "Acesso negado.",
        },
        { status: 403 }
      );
    }

    const {
      data: assinaturas,
      error: erroAssinaturas,
    } = await supabaseAdmin
      .from("assinaturas")
      .select(
        "user_id, status, trial_started_at, trial_ends_at, updated_at"
      )
      .order("updated_at", {
        ascending: false,
      });

    if (erroAssinaturas) {
      console.error(
        "Erro ao buscar assinaturas:",
        erroAssinaturas
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível buscar as assinaturas.",
        },
        { status: 500 }
      );
    }

    const usuarios: any[] = [];

    let pagina = 1;

    while (true) {
      const {
        data,
        error,
      } =
        await supabaseAdmin.auth.admin.listUsers({
          page: pagina,
          perPage: 1000,
        });

      if (error) {
        console.error(
          "Erro ao buscar usuários:",
          error
        );

        return NextResponse.json(
          {
            error:
              "Não foi possível buscar os usuários.",
          },
          { status: 500 }
        );
      }

      usuarios.push(...data.users);

      if (
        data.users.length < 1000
      ) {
        break;
      }

      pagina++;
    }

    const clientes = usuarios.map((usuario) => {
      const assinatura =
        assinaturas?.find(
          (item) =>
            item.user_id === usuario.id
        );

      return {
        id: usuario.id,
        nome:
          usuario.user_metadata?.nome ||
          usuario.user_metadata?.name ||
          "Sem nome",
        email: usuario.email || "",
        criado_em:
          usuario.created_at,
        ultimo_login:
          usuario.last_sign_in_at || null,

        status:
          assinatura?.status ||
          "sem_assinatura",

        trial_started_at:
          assinatura?.trial_started_at ||
          null,

        trial_ends_at:
          assinatura?.trial_ends_at ||
          null,

        updated_at:
          assinatura?.updated_at ||
          null,
      };
    });

    return NextResponse.json({
      clientes,
    });
  } catch (error) {
    console.error(
      "Erro no painel administrativo:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Erro interno do servidor.",
      },
      { status: 500 }
    );
  }
}

// ============================================================
// ALTERAR ASSINATURA
// ============================================================

export async function POST(request: Request) {
  try {
    if (!verificarConfiguracao()) {
      return NextResponse.json(
        {
          error:
            "Configuração do administrador não encontrada.",
        },
        { status: 500 }
      );
    }

    const admin = await verificarAdmin(request);

    if (!admin) {
      return NextResponse.json(
        {
          error: "Acesso negado.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const userId = body.userId;
    const acao = body.acao;

    if (!userId || !acao) {
      return NextResponse.json(
        {
          error:
            "Usuário ou ação não informado.",
        },
        { status: 400 }
      );
    }

    if (
      ![
        "ativar",
        "bloquear",
        "renovar",
      ].includes(acao)
    ) {
      return NextResponse.json(
        {
          error: "Ação inválida.",
        },
        { status: 400 }
      );
    }

    // ========================================================
    // ATIVAR
    // ========================================================

    if (acao === "ativar") {
      const agora = new Date();

      const fim = new Date(
        agora.getTime() +
          30 * 24 * 60 * 60 * 1000
      );

      const { error } =
        await supabaseAdmin
          .from("assinaturas")
          .upsert(
            {
              user_id: userId,
              status: "active",
              trial_started_at:
                agora.toISOString(),
              trial_ends_at:
                fim.toISOString(),
              updated_at:
                agora.toISOString(),
            },
            {
              onConflict: "user_id",
            }
          );

      if (error) {
        console.error(
          "Erro ao ativar cliente:",
          error
        );

        return NextResponse.json(
          {
            error:
              "Não foi possível ativar o cliente.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        mensagem:
          "Cliente ativado por 30 dias.",
      });
    }

    // ========================================================
    // RENOVAR
    // ========================================================

    if (acao === "renovar") {
      const agora = new Date();

      const fim = new Date(
        agora.getTime() +
          30 * 24 * 60 * 60 * 1000
      );

      const { error } =
        await supabaseAdmin
          .from("assinaturas")
          .update({
            status: "active",
            trial_ends_at:
              fim.toISOString(),
            updated_at:
              agora.toISOString(),
          })
          .eq("user_id", userId);

      if (error) {
        console.error(
          "Erro ao renovar cliente:",
          error
        );

        return NextResponse.json(
          {
            error:
              "Não foi possível renovar o cliente.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        mensagem:
          "Cliente renovado por 30 dias.",
      });
    }

    // ========================================================
    // BLOQUEAR
    // ========================================================

    if (acao === "bloquear") {
      const { error } =
        await supabaseAdmin
          .from("assinaturas")
          .update({
            status: "expired",
            updated_at:
              new Date().toISOString(),
          })
          .eq("user_id", userId);

      if (error) {
        console.error(
          "Erro ao bloquear cliente:",
          error
        );

        return NextResponse.json(
          {
            error:
              "Não foi possível bloquear o cliente.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        mensagem:
          "Cliente bloqueado.",
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Erro administrativo:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Erro interno do servidor.",
      },
      { status: 500 }
    );
  }
}

