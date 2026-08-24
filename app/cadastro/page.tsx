"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function Cadastro() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();

    setErro("");
    setSucesso("");

    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não são iguais.");
      return;
    }

    setCarregando(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
        options: {
          data: {
            nome: nome.trim(),
          },
        },
      });

      if (error) {
        console.error("Erro ao criar conta:", error);

        if (
          error.message
            .toLowerCase()
            .includes("already registered")
        ) {
          setErro("Este e-mail já possui uma conta.");
        } else {
          setErro(error.message);
        }

        setCarregando(false);
        return;
      }

      if (!data.user) {
        setErro("Não foi possível criar a conta.");
        setCarregando(false);
        return;
      }

      /*
       * O sistema de 14 dias será iniciado pela página inicial
       * quando o usuário entrar pela primeira vez.
       */

      setSucesso(
        "Conta criada com sucesso! Você será enviado para o login."
      );

      setTimeout(() => {
        router.replace("/login");
      }, 1800);
    } catch (error) {
      console.error("Erro inesperado:", error);

      setErro(
        "Ocorreu um erro ao criar sua conta. Tente novamente."
      );

      setCarregando(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #020617 0%, #0f172a 45%, #172554 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Efeito de fundo */}
      <div
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "rgba(37, 99, 235, 0.18)",
          filter: "blur(70px)",
          top: -100,
          right: -80,
        }}
      />

      <div
        style={{
          position: "absolute",
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: "rgba(14, 165, 233, 0.12)",
          filter: "blur(70px)",
          bottom: -80,
          left: -70,
        }}
      />

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          background: "rgba(255,255,255,0.97)",
          borderRadius: 28,
          padding: "32px 28px",
          boxShadow:
            "0 25px 70px rgba(0,0,0,0.35)",
          position: "relative",
          zIndex: 1,
          boxSizing: "border-box",
        }}
      >
        {/* Logo */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 25,
          }}
        >
          <div
            style={{
              width: 70,
              height: 70,
              margin: "0 auto 14px",
              borderRadius: 20,
              background:
                "linear-gradient(135deg, #2563eb, #0ea5e9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              boxShadow:
                "0 12px 30px rgba(37,99,235,0.35)",
            }}
          >
            🚐
          </div>

          <h1
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            Criar sua conta
          </h1>

          <p
            style={{
              marginTop: 8,
              marginBottom: 0,
              color: "#64748b",
              fontSize: 14,
            }}
          >
            Comece a usar o RotaPro gratuitamente.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={cadastrar}>
          {/* Nome */}
          <label
            style={{
              display: "block",
              color: "#334155",
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 7,
            }}
          >
            Nome
          </label>

          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Digite seu nome"
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "15px 16px",
              borderRadius: 14,
              border: "1px solid #cbd5e1",
              background: "#f8fafc",
              color: "#0f172a",
              fontSize: 16,
              outline: "none",
              marginBottom: 17,
            }}
          />

          {/* E-mail */}
          <label
            style={{
              display: "block",
              color: "#334155",
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 7,
            }}
          >
            E-mail
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu e-mail"
            required
            autoComplete="email"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "15px 16px",
              borderRadius: 14,
              border: "1px solid #cbd5e1",
              background: "#f8fafc",
              color: "#0f172a",
              fontSize: 16,
              outline: "none",
              marginBottom: 17,
            }}
          />

          {/* Senha */}
          <label
            style={{
              display: "block",
              color: "#334155",
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 7,
            }}
          >
            Senha
          </label>

          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Mínimo de 6 caracteres"
            required
            minLength={6}
            autoComplete="new-password"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "15px 16px",
              borderRadius: 14,
              border: "1px solid #cbd5e1",
              background: "#f8fafc",
              color: "#0f172a",
              fontSize: 16,
              outline: "none",
              marginBottom: 17,
            }}
          />

          {/* Confirmar senha */}
          <label
            style={{
              display: "block",
              color: "#334155",
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 7,
            }}
          >
            Confirmar senha
          </label>

          <input
            type="password"
            value={confirmarSenha}
            onChange={(e) =>
              setConfirmarSenha(e.target.value)
            }
            placeholder="Digite a senha novamente"
            required
            minLength={6}
            autoComplete="new-password"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "15px 16px",
              borderRadius: 14,
              border: "1px solid #cbd5e1",
              background: "#f8fafc",
              color: "#0f172a",
              fontSize: 16,
              outline: "none",
              marginBottom: 18,
            }}
          />

          {/* Erro */}
          {erro && (
            <div
              style={{
                background: "#fef2f2",
                color: "#dc2626",
                border: "1px solid #fecaca",
                padding: 12,
                borderRadius: 12,
                fontSize: 14,
                marginBottom: 15,
                textAlign: "center",
              }}
            >
              ⚠️ {erro}
            </div>
          )}

          {/* Sucesso */}
          {sucesso && (
            <div
              style={{
                background: "#f0fdf4",
                color: "#15803d",
                border: "1px solid #bbf7d0",
                padding: 12,
                borderRadius: 12,
                fontSize: 14,
                marginBottom: 15,
                textAlign: "center",
              }}
            >
              ✅ {sucesso}
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={carregando}
            style={{
              width: "100%",
              padding: 16,
              border: "none",
              borderRadius: 14,
              background: carregando
                ? "#64748b"
                : "linear-gradient(135deg, #2563eb, #0ea5e9)",
              color: "#fff",
              fontSize: 17,
              fontWeight: 800,
              cursor: carregando
                ? "not-allowed"
                : "pointer",
              boxShadow: carregando
                ? "none"
                : "0 10px 25px rgba(37,99,235,0.30)",
            }}
          >
            {carregando
              ? "Criando conta..."
              : "Criar minha conta"}
          </button>
        </form>

        {/* Voltar para login */}
        <div
          style={{
            textAlign: "center",
            marginTop: 22,
            paddingTop: 20,
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: 14,
            }}
          >
            Já possui uma conta?
          </p>

          <Link
            href="/login"
            style={{
              display: "inline-block",
              marginTop: 8,
              color: "#2563eb",
              fontSize: 15,
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            ← Voltar para entrar
          </Link>
        </div>

        {/* Rodapé */}
        <div
          style={{
            textAlign: "center",
            marginTop: 22,
            color: "#94a3b8",
            fontSize: 12,
          }}
        >
          RotaPro
        </div>
      </div>
    </main>
  );
}

