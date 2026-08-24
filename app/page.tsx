"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Menu from "./components/Menu";
import Link from "next/link";
import { supabase } from "../lib/supabase";

type Assinatura = {
  status: "trial" | "active" | "expired";
  trial_ends_at: string | null;
};

export default function Home() {
  const router = useRouter();

  const [carregando, setCarregando] = useState(true);
  const [bloqueado, setBloqueado] = useState(false);
  const [tempoRestante, setTempoRestante] = useState("");
  const [statusAssinatura, setStatusAssinatura] =
    useState<"trial" | "active" | "expired" | null>(null);

  useEffect(() => {
    let intervalo: ReturnType<typeof setInterval> | undefined;

    async function verificarUsuario() {
      try {
        const {
          data: { user },
          error: erroUsuario,
        } = await supabase.auth.getUser();

        if (erroUsuario || !user) {
          router.replace("/login");
          return;
        }

        // =====================================================
        // BUSCAR ASSINATURA
        // =====================================================

        const { data: assinatura, error: erroAssinatura } =
          await supabase
            .from("assinaturas")
            .select("status, trial_ends_at")
            .eq("user_id", user.id)
            .maybeSingle();

        if (erroAssinatura) {
          console.error(
            "Erro ao buscar assinatura:",
            erroAssinatura
          );

          setErroInterno();
          return;
        }

        // =====================================================
        // SE NÃO POSSUI ASSINATURA
        // =====================================================

        if (!assinatura) {
          console.error(
            "Usuário autenticado não possui assinatura."
          );

          setBloqueado(true);
          setStatusAssinatura("expired");
          setTempoRestante("Assinatura não encontrada");
          setCarregando(false);

          return;
        }

        // =====================================================
        // ASSINATURA ATIVA
        // =====================================================

        if (assinatura.status === "active") {
          setStatusAssinatura("active");
          setBloqueado(false);
          setTempoRestante("");
          setCarregando(false);

          if (intervalo) {
            clearInterval(intervalo);
          }

          return;
        }

        // =====================================================
        // ASSINATURA EXPIRADA
        // =====================================================

        if (assinatura.status === "expired") {
          setStatusAssinatura("expired");
          setBloqueado(true);
          setTempoRestante("Teste encerrado");
          setCarregando(false);

          if (intervalo) {
            clearInterval(intervalo);
          }

          return;
        }

        // =====================================================
        // TRIAL
        // =====================================================

        if (assinatura.status === "trial") {
          setStatusAssinatura("trial");

          const verificarPrazo = () => {
            const agora = new Date();

            if (!assinatura.trial_ends_at) {
              console.error(
                "Trial sem data de encerramento."
              );

              setBloqueado(true);
              setTempoRestante("Teste encerrado");
              setCarregando(false);

              return;
            }

            const fim = new Date(
              assinatura.trial_ends_at
            );

            const diferenca =
              fim.getTime() - agora.getTime();

            // =================================================
            // TRIAL EXPIRADO
            // =================================================

            if (diferenca <= 0) {
              setStatusAssinatura("expired");
              setBloqueado(true);
              setTempoRestante("Teste encerrado");
              setCarregando(false);

              if (intervalo) {
                clearInterval(intervalo);
              }

              return;
            }

            // =================================================
            // TRIAL AINDA ATIVO
            // =================================================

            const dias = Math.ceil(
              diferenca /
                (1000 * 60 * 60 * 24)
            );

            if (dias <= 1) {
              setTempoRestante(
                "1 dia restante"
              );
            } else {
              setTempoRestante(
                `${dias} dias restantes`
              );
            }

            setBloqueado(false);
            setCarregando(false);
          };

          verificarPrazo();

          // Atualiza o contador a cada minuto
          intervalo = setInterval(
            verificarPrazo,
            60000
          );

          return;
        }

        // =====================================================
        // STATUS DESCONHECIDO
        // =====================================================

        console.error(
          "Status de assinatura desconhecido:",
          assinatura.status
        );

        setBloqueado(true);
        setStatusAssinatura("expired");
        setTempoRestante(
          "Assinatura inválida"
        );
        setCarregando(false);
      } catch (erro) {
        console.error(
          "Erro ao verificar assinatura:",
          erro
        );

        setErroInterno();
      }
    }

    function setErroInterno() {
      setBloqueado(true);
      setStatusAssinatura("expired");
      setTempoRestante(
        "Não foi possível verificar sua assinatura."
      );
      setCarregando(false);
    }

    verificarUsuario();

    return () => {
      if (intervalo) {
        clearInterval(intervalo);
      }
    };
  }, [router]);

  // ===========================================================
  // CARREGANDO
  // ===========================================================

  if (carregando) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f1f5f9",
          fontFamily: "Arial",
          color: "#64748b",
        }}
      >
        Verificando acesso ao RotaPro...
      </main>
    );
  }

  // ===========================================================
  // USUÁRIO BLOQUEADO
  // ===========================================================

  if (bloqueado) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg,#020617,#0f172a,#172554)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          fontFamily: "Arial",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 430,
            background: "#fff",
            borderRadius: 24,
            padding: 30,
            textAlign: "center",
            boxShadow:
              "0 25px 70px rgba(0,0,0,0.35)",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: 70,
              height: 70,
              margin: "0 auto 20px",
              borderRadius: 20,
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
            }}
          >
            🔒
          </div>

          <h1
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: 25,
            }}
          >
            Período de teste encerrado
          </h1>

          <p
            style={{
              color: "#64748b",
              lineHeight: 1.6,
              marginTop: 15,
            }}
          >
            Seu período de 14 dias grátis
            chegou ao fim.
          </p>

          <p
            style={{
              color: "#64748b",
              lineHeight: 1.6,
            }}
          >
            Continue usando o RotaPro para
            controlar seus serviços, registrar
            suas viagens e acompanhar seus
            resultados.
          </p>

          <div
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 14,
              background: "#f8fafc",
              border:
                "1px solid #e2e8f0",
            }}
          >
            <strong
              style={{
                display: "block",
                color: "#0f172a",
                fontSize: 18,
              }}
            >
              R$ 10,00 por mês
            </strong>

            <span
              style={{
                display: "block",
                marginTop: 5,
                color: "#64748b",
                fontSize: 14,
              }}
            >
              Sem complicação.
            </span>
          </div>

          <p
            style={{
              color: "#475569",
              lineHeight: 1.6,
              marginTop: 20,
            }}
          >
            Fale conosco pelo WhatsApp para
            ativar seu acesso.
          </p>

          <a
            href="https://wa.me/5519981997304"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              marginTop: 25,
              padding: 16,
              borderRadius: 14,
              background: "#16a34a",
              color: "#fff",
              fontSize: 17,
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            💬 Falar com o RotaPro
          </a>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace("/login");
            }}
            style={{
              width: "100%",
              marginTop: 12,
              padding: 14,
              borderRadius: 14,
              border:
                "1px solid #cbd5e1",
              background: "#f8fafc",
              color: "#475569",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Sair da conta
          </button>
        </div>
      </main>
    );
  }

  // ===========================================================
  // USUÁRIO LIBERADO
  // ===========================================================

  return (
    <>
      <Menu />

      <main
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg,#f8fafc,#e2e8f0)",
          padding: "80px 20px 20px",
          fontFamily: "Arial",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: 25,
            borderRadius: 20,
            boxShadow:
              "0 5px 20px #0002",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              color: "#0f172a",
            }}
          >
            🚐 RotaPro
          </h1>

          <p
            style={{
              color: "#64748b",
            }}
          >
            Cadastre seus serviços rapidamente
          </p>

          {/* AVISO DO TRIAL */}

          {statusAssinatura === "trial" &&
            tempoRestante && (
              <div
                style={{
                  marginTop: 20,
                  padding: "16px 18px",
                  borderRadius: 14,
                  background:
                    "linear-gradient(135deg,#eff6ff,#f0f9ff)",
                  border:
                    "1px solid #bfdbfe",
                  color: "#1e40af",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: "bold",
                    marginBottom: 5,
                  }}
                >
                  🎁 Período gratuito
                </div>

                <div
                  style={{
                    fontSize: 15,
                    color: "#475569",
                  }}
                >
                  Você está usando o
                  RotaPro gratuitamente.
                </div>

                <div
                  style={{
                    marginTop: 8,
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#1d4ed8",
                  }}
                >
                  {tempoRestante}
                </div>
              </div>
            )}

          {/* AVISO DE USUÁRIO PAGANTE */}

          {statusAssinatura === "active" && (
            <div
              style={{
                marginTop: 20,
                padding: "14px 18px",
                borderRadius: 14,
                background: "#f0fdf4",
                border:
                  "1px solid #bbf7d0",
                color: "#166534",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                }}
              >
                ✅ Assinatura ativa
              </div>

              <div
                style={{
                  marginTop: 4,
                  fontSize: 14,
                }}
              >
                Seu acesso ao RotaPro está
                liberado.
              </div>
            </div>
          )}

          <Link
            href="/servicos"
            style={{
              display: "block",
              marginTop: 30,
              width: "100%",
              padding: 18,
              borderRadius: 15,
              background: "#16a34a",
              color: "#fff",
              fontSize: 18,
              fontWeight: "bold",
              textDecoration: "none",
              boxSizing: "border-box",
            }}
          >
            ➕ Novo Serviço
          </Link>
        </div>
      </main>
    </>
  );
}