"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Menu from "./components/Menu";
import Link from "next/link";
import { supabase } from "../lib/supabase";

type Assinatura = {
  status: "trial" | "active" | "expired";
  trial_ends_at: string;
};

export default function Home() {
  const router = useRouter();

  const [carregando, setCarregando] = useState(true);
  const [bloqueado, setBloqueado] = useState(false);
  const [tempoRestante, setTempoRestante] = useState("");

  useEffect(() => {
    let intervalo: ReturnType<typeof setInterval> | undefined;

    async function verificarUsuario() {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
          router.replace("/login");
          return;
        }

        const user = data.user;

        let { data: assinatura, error: erroAssinatura } =
          await supabase
            .from("assinaturas")
            .select("status, trial_ends_at")
            .eq("user_id", user.id)
            .maybeSingle();

        // Novo usuário: cria período gratuito de 14 dias
        if (!assinatura && !erroAssinatura) {
          const inicio = new Date();

          const fim = new Date(
            inicio.getTime() + 14 * 24 * 60 * 60 * 1000
          );

          const { data: novaAssinatura, error: erroCriacao } =
            await supabase
              .from("assinaturas")
              .insert({
                user_id: user.id,
                status: "trial",
                trial_started_at: inicio.toISOString(),
                trial_ends_at: fim.toISOString(),
              })
              .select("status, trial_ends_at")
              .single();

          if (erroCriacao) {
            console.error("Erro ao criar teste:", erroCriacao);
            setCarregando(false);
            return;
          }

          assinatura = novaAssinatura;
        }

        if (!assinatura) {
          setCarregando(false);
          return;
        }

        // Usuário ativo: acesso permanente
        if (assinatura.status === "active") {
          setBloqueado(false);
          setTempoRestante("");
          setCarregando(false);

          if (intervalo) {
            clearInterval(intervalo);
          }

          return;
        }

        // Verifica o prazo do teste
        const verificarPrazo = async () => {
          const agora = new Date();
          const fim = new Date(assinatura!.trial_ends_at);

          const diferenca = fim.getTime() - agora.getTime();

          // Teste expirado
          if (diferenca <= 0) {
            await supabase
              .from("assinaturas")
              .update({
                status: "expired",
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", user.id);

            setBloqueado(true);
            setTempoRestante("Teste encerrado");
            setCarregando(false);

            if (intervalo) {
              clearInterval(intervalo);
            }

            return;
          }

          // Calcula os dias restantes
          const dias = Math.ceil(
            diferenca / (1000 * 60 * 60 * 24)
          );

          if (dias === 1) {
            setTempoRestante("1 dia restante");
          } else {
            setTempoRestante(`${dias} dias restantes`);
          }

          setBloqueado(false);
          setCarregando(false);
        };

        await verificarPrazo();

        // Atualiza uma vez por minuto
        intervalo = setInterval(verificarPrazo, 60000);
      } catch (erro) {
        console.error("Erro ao verificar assinatura:", erro);
        setCarregando(false);
      }
    }

    verificarUsuario();

    return () => {
      if (intervalo) {
        clearInterval(intervalo);
      }
    };
  }, [router]);

  // Carregando
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

  // Usuário bloqueado
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
            boxShadow: "0 25px 70px rgba(0,0,0,0.35)",
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
            Seu período de teste do RotaPro terminou.
          </p>

          <p
            style={{
              color: "#475569",
              lineHeight: 1.6,
            }}
          >
            Para continuar usando o RotaPro,
            entre em contato conosco.
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
              border: "1px solid #cbd5e1",
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

  // Usuário liberado
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
            boxShadow: "0 5px 20px #0002",
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

          {tempoRestante && (
            <div
              style={{
                marginTop: 20,
                padding: "16px 18px",
                borderRadius: 14,
                background:
                  "linear-gradient(135deg,#eff6ff,#f0f9ff)",
                border: "1px solid #bfdbfe",
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
                Você está usando o RotaPro gratuitamente.
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

