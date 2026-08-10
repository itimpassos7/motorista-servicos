"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Login() {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [carregando, setCarregando] =
    useState(false);

  const [erro, setErro] =
    useState("");


  async function entrar(
    e: React.FormEvent
  ) {

    e.preventDefault();

    setErro("");
    setCarregando(true);

    const { error } =
      await supabase.auth.signInWithPassword({

        email,
        password: senha

      });

    if (error) {

      setErro(
        "E-mail ou senha incorretos."
      );

      setCarregando(false);

      return;

    }

    window.location.href = "/";

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

        overflow: "hidden"

      }}
    >

      {/* Efeitos de fundo */}

      <div
        style={{

          position: "absolute",

          width: 300,

          height: 300,

          borderRadius: "50%",

          background:
            "rgba(37, 99, 235, 0.18)",

          filter: "blur(70px)",

          top: -100,

          right: -80

        }}
      />

      <div
        style={{

          position: "absolute",

          width: 250,

          height: 250,

          borderRadius: "50%",

          background:
            "rgba(14, 165, 233, 0.12)",

          filter: "blur(70px)",

          bottom: -80,

          left: -70

        }}
      />


      {/* Card de login */}

      <div
        style={{

          width: "100%",

          maxWidth: 420,

          background:
            "rgba(255,255,255,0.97)",

          borderRadius: 28,

          padding: "35px 28px",

          boxShadow:
            "0 25px 70px rgba(0,0,0,0.35)",

          position: "relative",

          zIndex: 1,

          boxSizing: "border-box"

        }}
      >


        {/* Logo */}

        <div
          style={{

            textAlign: "center",

            marginBottom: 30

          }}
        >

          <div
            style={{

              width: 76,

              height: 76,

              margin:
                "0 auto 16px",

              borderRadius: 22,

              background:
                "linear-gradient(135deg, #2563eb, #0ea5e9)",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              fontSize: 40,

              boxShadow:
                "0 12px 30px rgba(37,99,235,0.35)"

            }}
          >
            🚐
          </div>


          <h1
            style={{

              margin: 0,

              color: "#0f172a",

              fontSize: 30,

              fontWeight: 800,

              letterSpacing:
                "-0.5px"

            }}
          >
            RotaPro
          </h1>


          <p
            style={{

              marginTop: 8,

              marginBottom: 0,

              color: "#64748b",

              fontSize: 15

            }}
          >
            Controle seus serviços.
            Simplifique sua rotina.
          </p>

        </div>


        {/* Formulário */}

        <form onSubmit={entrar}>

          <label
            style={{

              display: "block",

              color: "#334155",

              fontSize: 14,

              fontWeight: 700,

              marginBottom: 7

            }}
          >
            E-mail
          </label>


          <input
            type="email"

            value={email}

            onChange={(e) =>
              setEmail(e.target.value)
            }

            placeholder="Digite seu e-mail"

            required

            style={{

              width: "100%",

              boxSizing: "border-box",

              padding:
                "15px 16px",

              borderRadius: 14,

              border:
                "1px solid #cbd5e1",

              background: "#f8fafc",

              color: "#0f172a",

              fontSize: 16,

              outline: "none",

              marginBottom: 18

            }}
          />


          <label
            style={{

              display: "block",

              color: "#334155",

              fontSize: 14,

              fontWeight: 700,

              marginBottom: 7

            }}
          >
            Senha
          </label>


          <input
            type="password"

            value={senha}

            onChange={(e) =>
              setSenha(e.target.value)
            }

            placeholder="Digite sua senha"

            required

            style={{

              width: "100%",

              boxSizing: "border-box",

              padding:
                "15px 16px",

              borderRadius: 14,

              border:
                "1px solid #cbd5e1",

              background: "#f8fafc",

              color: "#0f172a",

              fontSize: 16,

              outline: "none",

              marginBottom: 18

            }}
          />


          {/* Erro */}

          {erro && (

            <div
              style={{

                background: "#fef2f2",

                color: "#dc2626",

                border:
                  "1px solid #fecaca",

                padding: 12,

                borderRadius: 12,

                fontSize: 14,

                marginBottom: 15,

                textAlign: "center"

              }}
            >
              ⚠️ {erro}
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

              background:
                carregando
                  ? "#64748b"
                  : "linear-gradient(135deg, #2563eb, #0ea5e9)",

              color: "#fff",

              fontSize: 17,

              fontWeight: 800,

              cursor:
                carregando
                  ? "not-allowed"
                  : "pointer",

              boxShadow:
                carregando
                  ? "none"
                  : "0 10px 25px rgba(37,99,235,0.30)"

            }}
          >

            {carregando
              ? "Entrando..."
              : "Entrar"}

          </button>

        </form>


        {/* Rodapé */}

        <div
          style={{

            textAlign: "center",

            marginTop: 25,

            paddingTop: 20,

            borderTop:
              "1px solid #e2e8f0",

            color: "#94a3b8",

            fontSize: 12

          }}
        >

          RotaPro

        </div>

      </div>

    </main>

  );

}

