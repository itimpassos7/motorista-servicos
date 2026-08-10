"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function Menu() {

  const [aberto, setAberto] =
    useState(false);


  async function sair() {

    await supabase.auth.signOut();

    window.location.href = "/login";

  }


  return (

    <>

      <button
        onClick={() =>
          setAberto(true)
        }

        style={{

          position: "fixed",

          top: 20,

          right: 20,

          zIndex: 1000,

          background: "#0f172a",

          color: "#fff",

          border: "none",

          padding: "12px 15px",

          borderRadius: 12,

          fontSize: 20,

          cursor: "pointer",

          boxShadow:
            "0 5px 15px rgba(0,0,0,0.15)"

        }}
      >

        ☰

      </button>


      {aberto && (

        <div
          style={{

            position: "fixed",

            inset: 0,

            background: "rgba(0,0,0,0.35)",

            zIndex: 999

          }}

          onClick={() =>
            setAberto(false)
          }
        >

          <aside
            onClick={(e) =>
              e.stopPropagation()
            }

            style={{

              width: 280,

              height: "100%",

              background: "#fff",

              padding: 25,

              boxShadow:
                "5px 0 20px rgba(0,0,0,0.15)",

              boxSizing: "border-box"

            }}
          >

            <div
              style={{

                display: "flex",

                alignItems: "center",

                gap: 12,

                marginBottom: 20

              }}
            >

              <div
                style={{

                  width: 48,

                  height: 48,

                  borderRadius: 14,

                  background:
                    "linear-gradient(135deg, #2563eb, #0ea5e9)",

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                  fontSize: 25

                }}
              >

                🚐

              </div>


              <div>

                <h2
                  style={{

                    margin: 0,

                    color: "#0f172a",

                    fontSize: 22

                  }}
                >

                  RotaPro

                </h2>


                <span
                  style={{

                    color: "#64748b",

                    fontSize: 12

                  }}
                >

                  Gestão de serviços

                </span>

              </div>

            </div>


            <hr
              style={{

                border: "none",

                borderTop:
                  "1px solid #e2e8f0",

                marginBottom: 20

              }}
            />


            <nav
              style={{

                display: "flex",

                flexDirection: "column",

                gap: 10

              }}
            >

              <Link
                href="/"

                onClick={() =>
                  setAberto(false)
                }

                style={linkStyle}
              >

                🏠

                <span>
                  Início
                </span>

              </Link>


              <Link
                href="/servicos"

                onClick={() =>
                  setAberto(false)
                }

                style={linkStyle}
              >

                ➕

                <span>
                  Novo Serviço
                </span>

              </Link>


              <Link
                href="/lista"

                onClick={() =>
                  setAberto(false)
                }

                style={linkStyle}
              >

                📋

                <span>
                  Serviços
                </span>

              </Link>


              <Link
                href="/relatorio"

                onClick={() =>
                  setAberto(false)
                }

                style={linkStyle}
              >

                📊

                <span>
                  Relatório
                </span>

              </Link>


              <button
                onClick={sair}

                style={{

                  ...linkStyle,

                  width: "100%",

                  border: "none",

                  background: "none",

                  cursor: "pointer"

                }}
              >

                🚪

                <span>
                  Sair
                </span>

              </button>

            </nav>


            <div
              style={{

                position: "absolute",

                bottom: 25,

                color: "#94a3b8",

                fontSize: 12

              }}
            >

              RotaPro

            </div>

          </aside>

        </div>

      )}

    </>

  );

}


const linkStyle = {

  display: "flex",

  alignItems: "center",

  gap: 12,

  padding: "13px 12px",

  borderRadius: 12,

  textDecoration: "none",

  color: "#334155",

  fontSize: 16,

  fontWeight: 600,

  textAlign: "left" as const

};

