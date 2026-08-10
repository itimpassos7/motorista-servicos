"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Menu from "../components/Menu";

export default function Lista() {

  const [servicos, setServicos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {

    const { data: userData } =
      await supabase.auth.getUser();

    if (!userData.user) {

      window.location.href = "/login";

      return;

    }

    const { data, error } = await supabase
      .from("servicos")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("data", { ascending: false });

    if (error) {

      alert(error.message);

      setCarregando(false);

      return;

    }

    if (data) {

      setServicos(data);

    }

    setCarregando(false);

  }


  useEffect(() => {

    carregar();

  }, []);


  function dinheiro(valor: number) {

    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

  }


  function formatarData(data: string) {

    if (!data) return "";

    const [ano, mes, dia] = data.split("-");

    return `${dia}/${mes}/${ano}`;

  }


  function editar(item: any) {

    const parametros = new URLSearchParams();

    parametros.set("id", String(item.id));
    parametros.set("data", item.data || "");
    parametros.set("veiculo", item.veiculo || "Carro");
    parametros.set("trajeto", item.trajeto || "");
    parametros.set(
      "kmInicial",
      String(item.km_inicial ?? "")
    );
    parametros.set(
      "kmFinal",
      String(item.km_final ?? "")
    );
    parametros.set(
      "valor",
      String(item.valor ?? "")
    );
    parametros.set(
      "obs",
      item.observacao || ""
    );

    window.location.href =
      `/servicos?${parametros.toString()}`;

  }


  async function excluir(id: number) {

    const confirmar = window.confirm(
      "Deseja realmente excluir este serviço?"
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("servicos")
      .delete()
      .eq("id", id);

    if (error) {

      alert(error.message);

      return;

    }

    setServicos((lista) =>
      lista.filter((item) => item.id !== id)
    );

    alert("Serviço excluído!");

  }


  if (carregando) {

    return (

      <main
        style={{

          minHeight: "100vh",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          background: "#f1f5f9",

          fontFamily: "Arial"

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

          background: "#f1f5f9",

          padding: "80px 20px 30px",

          fontFamily: "Arial",

          maxWidth: 700,

          margin: "0 auto"

        }}
      >

        <h1
          style={{

            color: "#0f172a",

            marginBottom: 20

          }}
        >

          📋 Serviços Cadastrados

        </h1>


        {servicos.length === 0 ? (

          <div
            style={{

              background: "#fff",

              padding: 25,

              borderRadius: 20,

              textAlign: "center",

              color: "#64748b",

              boxShadow: "0 5px 15px #0001"

            }}
          >

            Nenhum serviço cadastrado.

          </div>

        ) : (

          servicos.map((item) => {

            const temKm =

              item.km_inicial !== null &&

              item.km_inicial !== undefined &&

              item.km_final !== null &&

              item.km_final !== undefined;


            const kmRodado = temKm

              ? Number(item.km_final) -
                Number(item.km_inicial)

              : 0;


            return (

              <div
                key={item.id}

                style={{

                  background: "#fff",

                  padding: 20,

                  marginBottom: 15,

                  borderRadius: 20,

                  boxShadow: "0 5px 15px #0002"

                }}
              >

                <h3
                  style={{

                    marginTop: 0,

                    color: "#0f172a"

                  }}
                >

                  {item.veiculo === "Van"
                    ? "🚐 Van"
                    : "🚗 Carro"}

                </h3>


                <p>

                  📅 <b>{formatarData(item.data)}</b>

                </p>


                <p>

                  📍 {item.trajeto}

                </p>


                {temKm && (

                  <p>

                    🛣️ KM Rodado:{" "}

                    <b>{kmRodado} km</b>

                  </p>

                )}


                <p
                  style={{

                    color: "#16a34a",

                    fontWeight: "bold",

                    fontSize: 18

                  }}
                >

                  💰{" "}
                  {dinheiro(
                    Number(item.valor || 0)
                  )}

                </p>


                {item.observacao && (

                  <p>

                    📝 {item.observacao}

                  </p>

                )}


                <div
                  style={{

                    marginTop: 15,

                    paddingTop: 15,

                    borderTop:
                      "1px solid #e5e7eb",

                    color: "#64748b",

                    fontSize: 14

                  }}
                >

                  KM Inicial:{" "}

                  <b>
                    {item.km_inicial ?? "-"}
                  </b>

                  {" | "}

                  KM Final:{" "}

                  <b>
                    {item.km_final ?? "-"}
                  </b>

                </div>


                {/* BOTÕES */}

                <div
                  style={{

                    display: "flex",

                    justifyContent:
                      "flex-end",

                    gap: 8,

                    marginTop: 15

                  }}
                >

                  <button
                    onClick={() =>
                      editar(item)
                    }

                    style={{

                      padding: "9px 14px",

                      border: "none",

                      borderRadius: 10,

                      background: "#f59e0b",

                      color: "#fff",

                      fontWeight: "bold",

                      fontSize: 13,

                      cursor: "pointer",

                      whiteSpace: "nowrap"

                    }}
                  >

                    ✏️ Editar

                  </button>


                  <button
                    onClick={() =>
                      excluir(item.id)
                    }

                    style={{

                      padding: "9px 14px",

                      border: "none",

                      borderRadius: 10,

                      background: "#ef4444",

                      color: "#fff",

                      fontWeight: "bold",

                      fontSize: 13,

                      cursor: "pointer",

                      whiteSpace: "nowrap"

                    }}
                  >

                    🗑️ Excluir

                  </button>

                </div>


              </div>

            );

          })

        )}


      </main>

    </>

  );

}

