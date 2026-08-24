"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Cliente = {
  id: string;
  user_id: string;
  email: string;
  status: string;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string | null;
  assinatura_id: string | null;
};

export default function Admin() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarClientes() {
    setCarregando(true);
    setErro("");
    setMensagem("");

    try {
      const { data, error } =
        await supabase.rpc("admin_list_clientes");

      if (error) {
        console.error(error);

        setErro(
          "Não foi possível carregar os clientes: " +
            error.message
        );

        setCarregando(false);
        return;
      }

      setClientes((data || []) as Cliente[]);
    } catch (e) {
      console.error(e);

      setErro(
        "Erro inesperado ao carregar o painel."
      );
    }

    setCarregando(false);
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  // =====================================================
  // ATIVAR CLIENTE
  // =====================================================

  async function ativarCliente(cliente: Cliente) {
    setMensagem("");
    setErro("");

    const { error } = await supabase.rpc(
      "admin_ativar_cliente",
      {
        p_user_id: cliente.user_id,
      }
    );

    if (error) {
      console.error(error);

      setErro(
        "Não foi possível ativar o cliente: " +
          error.message
      );

      return;
    }

    setMensagem(
      "Cliente ativado definitivamente com sucesso."
    );

    await carregarClientes();
  }

  // =====================================================
  // BLOQUEAR CLIENTE
  // =====================================================

  async function bloquearCliente(cliente: Cliente) {
    setMensagem("");
    setErro("");

    if (!cliente.assinatura_id) {
      setErro(
        "Esse usuário ainda não possui uma assinatura."
      );

      return;
    }

    const { error } = await supabase.rpc(
      "admin_bloquear_cliente",
      {
        p_user_id: cliente.user_id,
      }
    );

    if (error) {
      console.error(error);

      setErro(
        "Não foi possível bloquear o cliente: " +
          error.message
      );

      return;
    }

    setMensagem("Cliente bloqueado com sucesso.");

    await carregarClientes();
  }

  // =====================================================
  // DATA
  // =====================================================

  function formatarData(data: string | null) {
    if (!data) return "-";

    return new Date(data).toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  }

  // =====================================================
  // STATUS
  // =====================================================

  function statusTexto(status: string) {
    if (status === "active") {
      return "Pagante";
    }

    if (status === "trial") {
      return "Em teste";
    }

    if (status === "expired") {
      return "Bloqueado";
    }

    return status;
  }

  function statusCor(status: string) {
    if (status === "active") {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    if (status === "trial") {
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
      };
    }

    return {
      background: "#fee2e2",
      color: "#991b1b",
    };
  }

  // =====================================================
  // CONTADORES
  // =====================================================

  const totalClientes = clientes.length;

  const clientesTeste = clientes.filter(
    (cliente) => cliente.status === "trial"
  ).length;

  const clientesPagantes = clientes.filter(
    (cliente) => cliente.status === "active"
  ).length;

  const clientesBloqueados = clientes.filter(
    (cliente) => cliente.status === "expired"
  ).length;

  // =====================================================
  // TELA
  // =====================================================

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#020617,#0f172a,#172554)",
        padding: "30px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >

        {/* CABEÇALHO */}

        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: 25,
            marginBottom: 20,
            boxShadow:
              "0 20px 50px rgba(0,0,0,0.25)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 15,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  color: "#0f172a",
                  fontSize: 28,
                }}
              >
                🚐 RotaPro Admin
              </h1>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "#64748b",
                }}
              >
                Gerenciamento de clientes e assinaturas
              </p>
            </div>

            <button
              onClick={carregarClientes}
              style={{
                border: "none",
                background: "#2563eb",
                color: "#fff",
                padding: "12px 18px",
                borderRadius: 12,
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              🔄 Atualizar
            </button>
          </div>
        </div>

        {/* MENSAGEM */}

        {mensagem && (
          <div
            style={{
              background: "#dcfce7",
              color: "#166534",
              padding: 15,
              borderRadius: 14,
              marginBottom: 15,
              fontWeight: "bold",
            }}
          >
            ✅ {mensagem}
          </div>
        )}

        {/* ERRO */}

        {erro && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: 15,
              borderRadius: 14,
              marginBottom: 15,
            }}
          >
            ⚠️ {erro}
          </div>
        )}

        {/* CARDS */}

        {!carregando && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(180px,1fr))",
              gap: 15,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 18,
                padding: 20,
              }}
            >
              <div style={{ color: "#64748b" }}>
                Clientes
              </div>

              <strong
                style={{
                  display: "block",
                  marginTop: 5,
                  fontSize: 30,
                  color: "#0f172a",
                }}
              >
                {totalClientes}
              </strong>
            </div>

            <div
              style={{
                background: "#fff",
                borderRadius: 18,
                padding: 20,
              }}
            >
              <div style={{ color: "#64748b" }}>
                Em teste
              </div>

              <strong
                style={{
                  display: "block",
                  marginTop: 5,
                  fontSize: 30,
                  color: "#2563eb",
                }}
              >
                {clientesTeste}
              </strong>
            </div>

            <div
              style={{
                background: "#fff",
                borderRadius: 18,
                padding: 20,
              }}
            >
              <div style={{ color: "#64748b" }}>
                Pagantes
              </div>

              <strong
                style={{
                  display: "block",
                  marginTop: 5,
                  fontSize: 30,
                  color: "#16a34a",
                }}
              >
                {clientesPagantes}
              </strong>
            </div>

            <div
              style={{
                background: "#fff",
                borderRadius: 18,
                padding: 20,
              }}
            >
              <div style={{ color: "#64748b" }}>
                Bloqueados
              </div>

              <strong
                style={{
                  display: "block",
                  marginTop: 5,
                  fontSize: 30,
                  color: "#dc2626",
                }}
              >
                {clientesBloqueados}
              </strong>
            </div>
          </div>
        )}

        {/* CLIENTES */}

        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: 20,
            boxShadow:
              "0 20px 50px rgba(0,0,0,0.20)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: "#0f172a",
            }}
          >
            Clientes
          </h2>

          {carregando ? (
            <div
              style={{
                textAlign: "center",
                padding: 40,
                color: "#64748b",
              }}
            >
              Carregando clientes...
            </div>
          ) : clientes.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 40,
                color: "#64748b",
              }}
            >
              Nenhum cliente encontrado.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: 12,
              }}
            >
              {clientes.map((cliente) => {
                const cor = statusCor(
                  cliente.status
                );

                return (
                  <div
                    key={cliente.user_id}
                    style={{
                      border:
                        "1px solid #e2e8f0",
                      borderRadius: 18,
                      padding: 18,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        gap: 15,
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            display: "block",
                            color: "#0f172a",
                            fontSize: 16,
                          }}
                        >
                          {cliente.email}
                        </strong>

                        <span
                          style={{
                            display: "block",
                            marginTop: 6,
                            color: "#64748b",
                            fontSize: 12,
                          }}
                        >
                          Cadastro:{" "}
                          {formatarData(
                            cliente.created_at
                          )}
                        </span>

                        {cliente.status ===
                          "trial" &&
                          cliente.trial_ends_at && (
                            <span
                              style={{
                                display: "block",
                                marginTop: 4,
                                color: "#64748b",
                                fontSize: 12,
                              }}
                            >
                              Teste até:{" "}
                              {formatarData(
                                cliente.trial_ends_at
                              )}
                            </span>
                          )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            ...cor,
                            padding:
                              "7px 12px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: "bold",
                          }}
                        >
                          {statusTexto(
                            cliente.status
                          )}
                        </span>

                        {cliente.status !==
                          "active" && (
                          <button
                            onClick={() =>
                              ativarCliente(
                                cliente
                              )
                            }
                            style={{
                              border: "none",
                              background:
                                "#16a34a",
                              color: "#fff",
                              padding:
                                "9px 13px",
                              borderRadius: 10,
                              fontWeight:
                                "bold",
                              cursor:
                                "pointer",
                            }}
                          >
                            💰 Ativar
                          </button>
                        )}

                        {cliente.status ===
                          "active" && (
                          <button
                            onClick={() =>
                              bloquearCliente(
                                cliente
                              )
                            }
                            style={{
                              border: "none",
                              background:
                                "#dc2626",
                              color: "#fff",
                              padding:
                                "9px 13px",
                              borderRadius: 10,
                              fontWeight:
                                "bold",
                              cursor:
                                "pointer",
                            }}
                          >
                            🔒 Bloquear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}