"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Menu from "./components/Menu";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function Home() {
  const router = useRouter();

  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function verificarUsuario() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/login");
        return;
      }

      setCarregando(false);
    }

    verificarUsuario();
  }, [router]);

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
        Carregando...
      </main>
    );
  }

  return (
    <>
      <Menu />

      <main
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg,#f8fafc,#e2e8f0)",
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