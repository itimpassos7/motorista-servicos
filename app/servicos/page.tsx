"use client";

import {
  Suspense,
  useEffect,
  useState
} from "react";

import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import Menu from "../components/Menu";


function FormularioServicos() {

  const searchParams = useSearchParams();

  const [usuario, setUsuario] = useState<any>(null);

  const [dia, setDia] = useState("");
  const [mes, setMes] = useState("");
  const [ano, setAno] = useState("");

  const [veiculo, setVeiculo] = useState("Carro");
  const [trajeto, setTrajeto] = useState("");

  const [kmInicial, setKmInicial] = useState("");
  const [kmFinal, setKmFinal] = useState("");

  const [valor, setValor] = useState("");
  const [obs, setObs] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [editando, setEditando] =
    useState<string | null>(null);


  useEffect(() => {

    async function iniciar() {

      const { data: userData } =
        await supabase.auth.getUser();

      if (!userData.user) {

        window.location.href = "/login";

        return;

      }

      setUsuario(userData.user);


      const id = searchParams.get("id");


      if (id) {

        setEditando(id);

        const data =
          searchParams.get("data") || "";

        const partes = data.split("-");


        if (partes.length === 3) {

          setAno(partes[0]);
          setMes(partes[1]);
          setDia(partes[2]);

        }


        setVeiculo(
          searchParams.get("veiculo") || "Carro"
        );


        setTrajeto(
          searchParams.get("trajeto") || ""
        );


        setKmInicial(
          searchParams.get("kmInicial") || ""
        );


        setKmFinal(
          searchParams.get("kmFinal") || ""
        );


        setValor(
          searchParams.get("valor") || ""
        );


        setObs(
          searchParams.get("obs") || ""
        );

      }


      setCarregando(false);

    }


    iniciar();

  }, [searchParams]);


  async function salvar() {

    if (!usuario) {

      alert("Usuário não carregado.");

      return;

    }


    if (
      !dia ||
      !mes ||
      !ano ||
      !trajeto
    ) {

      alert(
        "Preencha a data e o trajeto."
      );

      return;

    }


    const data =
      `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;


    const dados = {

      data,

      veiculo,

      trajeto,

      km_inicial:
        kmInicial === ""
          ? null
          : Number(kmInicial),

      km_final:
        kmFinal === ""
          ? null
          : Number(kmFinal),

      valor:
        valor === ""
          ? 0
          : Number(valor),

      observacao: obs,

      user_id: usuario.id

    };


    setSalvando(true);


    if (editando !== null) {

      const { error } = await supabase
        .from("servicos")
        .update(dados)
        .eq("id", editando)
        .eq("user_id", usuario.id);


      if (error) {

        alert(error.message);

        setSalvando(false);

        return;

      }


      alert(
        "Serviço atualizado com sucesso!"
      );


      window.location.href = "/lista";

      return;

    }


    const { error } = await supabase
      .from("servicos")
      .insert([dados]);


    if (error) {

      alert(error.message);

      setSalvando(false);

      return;

    }


    alert(
      "Serviço salvo com sucesso!"
    );


    limpar();

    setSalvando(false);

  }


  function limpar() {

    setDia("");
    setMes("");
    setAno("");

    setVeiculo("Carro");

    setTrajeto("");

    setKmInicial("");
    setKmFinal("");

    setValor("");

    setObs("");

    setEditando(null);

  }


  if (carregando) {

    return (

      <main
        style={{

          minHeight: "100vh",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          fontFamily: "Arial",

          background: "#f1f5f9"

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

          margin: "0 auto",

          boxSizing: "border-box"

        }}
      >


        <div
          style={{

            background: "#fff",

            padding: 20,

            borderRadius: 20,

            boxShadow:
              "0 5px 15px #0001",

            boxSizing: "border-box"

          }}
        >


          <h1
            style={{

              marginTop: 0,

              color: "#0f172a"

            }}
          >

            {editando
              ? "✏️ Editar Serviço"
              : "📝 Novo Serviço"}

          </h1>


          <label>
            Data
          </label>


          <div
            style={{

              display: "grid",

              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",

              gap: 10,

              margin:
                "8px 0 18px",

              width: "100%"

            }}
          >

            <input
              placeholder="Dia"

              maxLength={2}

              value={dia}

              onChange={(e) =>
                setDia(
                  e.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }

              style={inputStyle}

            />


            <input
              placeholder="Mês"

              maxLength={2}

              value={mes}

              onChange={(e) =>
                setMes(
                  e.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }

              style={inputStyle}

            />


            <input
              placeholder="Ano"

              maxLength={4}

              value={ano}

              onChange={(e) =>
                setAno(
                  e.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }

              style={inputStyle}

            />

          </div>


          <label>
            Veículo
          </label>


          <select
            value={veiculo}

            onChange={(e) =>
              setVeiculo(
                e.target.value
              )
            }

            style={{

              ...inputStyle,

              width: "100%",

              margin:
                "8px 0 18px"

            }}
          >

            <option>
              Carro
            </option>

            <option>
              Van
            </option>

          </select>


          <label>
            Trajeto
          </label>


          <input
            value={trajeto}

            onChange={(e) =>
              setTrajeto(
                e.target.value
              )
            }

            placeholder=
              "Campinas → Viracopos"

            style={{

              ...inputStyle,

              width: "100%",

              margin:
                "8px 0 18px"

            }}

          />


          <label>
            KM Inicial
          </label>


          <input
            type="number"

            value={kmInicial}

            onChange={(e) =>
              setKmInicial(
                e.target.value
              )
            }

            placeholder="Ex: 125430"

            style={{

              ...inputStyle,

              width: "100%",

              margin:
                "8px 0 18px"

            }}

          />


          <label>
            KM Final
          </label>


          <input
            type="number"

            value={kmFinal}

            onChange={(e) =>
              setKmFinal(
                e.target.value
              )
            }

            placeholder="Ex: 125580"

            style={{

              ...inputStyle,

              width: "100%",

              margin:
                "8px 0 18px"

            }}

          />


          <label>
            Valor
          </label>


          <input
            type="number"

            value={valor}

            onChange={(e) =>
              setValor(
                e.target.value
              )
            }

            placeholder="Ex: 250"

            style={{

              ...inputStyle,

              width: "100%",

              margin:
                "8px 0 18px"

            }}

          />


          <label>
            Observação
          </label>


          <textarea
            value={obs}

            onChange={(e) =>
              setObs(
                e.target.value
              )
            }

            placeholder=
              "Ex: cliente pagou em dinheiro"

            style={{

              ...inputStyle,

              width: "100%",

              minHeight: 100,

              margin:
                "8px 0 18px",

              resize: "vertical"

            }}

          />


          <button
            onClick={salvar}

            disabled={salvando}

            style={{

              width: "100%",

              padding: 16,

              borderRadius: 14,

              border: "none",

              background:
                salvando
                  ? "#94a3b8"
                  : "#16a34a",

              color: "#fff",

              fontWeight: "bold",

              fontSize: 16,

              cursor:
                salvando
                  ? "not-allowed"
                  : "pointer"

            }}
          >

            {salvando

              ? "Salvando..."

              : editando

                ? "✏️ Atualizar Serviço"

                : "✅ Salvar Serviço"}

          </button>


          {editando && (

            <button
              onClick={() =>
                window.location.href =
                  "/lista"
              }

              style={{

                width: "100%",

                marginTop: 10,

                padding: 14,

                borderRadius: 14,

                border: "none",

                background: "#64748b",

                color: "#fff",

                fontWeight: "bold",

                cursor: "pointer"

              }}
            >

              ↩️ Cancelar edição

            </button>

          )}


        </div>


      </main>

    </>

  );

}


const inputStyle = {

  padding: 14,

  borderRadius: 12,

  border:
    "1px solid #cbd5e1",

  fontSize: 16,

  boxSizing:
    "border-box" as const,

  width: "100%",

  minWidth: 0

};


export default function Servicos() {

  return (

    <Suspense
      fallback={

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

      }
    >

      <FormularioServicos />

    </Suspense>

  );

}

