"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import Menu from "../components/Menu";
import * as XLSX from "xlsx-js-style";

export default function Relatorio() {
  const [servicos, setServicos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = String(
    hoje.getMonth() + 1
  ).padStart(2, "0");

  const [anoSelecionado, setAnoSelecionado] =
    useState(String(anoAtual));

  const [mesSelecionado, setMesSelecionado] =
    useState(mesAtual);

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

  /*
    ========================================================
    ANOS DISPONÍVEIS
    ========================================================
  */

  const anosDisponiveis = useMemo(() => {
    const anos = new Set<number>();

    anos.add(anoAtual);

    servicos.forEach((item) => {
      if (!item.data) return;

      const ano = Number(
        String(item.data).slice(0, 4)
      );

      if (
        Number.isInteger(ano) &&
        ano >= 2000 &&
        ano <= 2100
      ) {
        anos.add(ano);
      }
    });

    return Array.from(anos).sort(
      (a, b) => b - a
    );
  }, [servicos, anoAtual]);

  /*
    ========================================================
    MESES
    ========================================================
  */

  const meses = [
    {
      valor: "01",
      nome: "Janeiro"
    },
    {
      valor: "02",
      nome: "Fevereiro"
    },
    {
      valor: "03",
      nome: "Março"
    },
    {
      valor: "04",
      nome: "Abril"
    },
    {
      valor: "05",
      nome: "Maio"
    },
    {
      valor: "06",
      nome: "Junho"
    },
    {
      valor: "07",
      nome: "Julho"
    },
    {
      valor: "08",
      nome: "Agosto"
    },
    {
      valor: "09",
      nome: "Setembro"
    },
    {
      valor: "10",
      nome: "Outubro"
    },
    {
      valor: "11",
      nome: "Novembro"
    },
    {
      valor: "12",
      nome: "Dezembro"
    }
  ];

  const mesNome =
    meses.find(
      (item) =>
        item.valor === mesSelecionado
    )?.nome || "";

  /*
    ========================================================
    PERÍODO SELECIONADO
    ========================================================
  */

  const periodo =
    `${anoSelecionado}-${mesSelecionado}`;

  const servicosMes = servicos.filter(
    (item) =>
      item.data?.startsWith(periodo)
  );

  const faturamento =
    servicosMes.reduce(
      (total, item) =>
        total +
        Number(item.valor || 0),
      0
    );

  const kmRodados =
    servicosMes.reduce(
      (total, item) => {
        const inicial = Number(
          item.km_inicial || 0
        );

        const final = Number(
          item.km_final || 0
        );

        if (final >= inicial) {
          return (
            total +
            (final - inicial)
          );
        }

        return total;
      },
      0
    );

  const carros =
    servicosMes.filter(
      (item) =>
        item.veiculo === "Carro"
    ).length;

  const vans =
    servicosMes.filter(
      (item) =>
        item.veiculo === "Van"
    ).length;

  const media =
    servicosMes.length
      ? faturamento /
        servicosMes.length
      : 0;

  function dinheiro(valor: number) {
    return valor.toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL"
      }
    );
  }

  function formatarData(
    data: string
  ) {
    if (!data) return "";

    const [
      ano,
      mesData,
      dia
    ] = data.split("-");

    return `${dia}/${mesData}/${ano}`;
  }

  /*
    ========================================================
    EXPORTAR EXCEL
    ========================================================
  */

  async function exportarExcel() {
    if (
      servicosMes.length === 0
    ) {
      alert(
        "Não existem serviços neste mês."
      );

      return;
    }

    try {
      const dados =
        servicosMes.map(
          (item) => {
            const kmInicial =
              Number(
                item.km_inicial || 0
              );

            const kmFinal =
              Number(
                item.km_final || 0
              );

            const kmServico =
              kmFinal >= kmInicial
                ? kmFinal -
                  kmInicial
                : 0;

            return {
              Data:
                formatarData(
                  item.data
                ).toUpperCase(),

              Veículo:
                (
                  item.veiculo ||
                  ""
                ).toUpperCase(),

              Trajeto:
                (
                  item.trajeto ||
                  ""
                ).toUpperCase(),

              "KM Inicial":
                kmInicial,

              "KM Final":
                kmFinal,

              "KM Rodados":
                kmServico,

              Valor:
                Number(
                  item.valor || 0
                ),

              Observação:
                (
                  item.observacao ||
                  ""
                ).toUpperCase()
            };
          }
        );

      const totalKm =
        dados.reduce(
          (total, item) =>
            total +
            Number(
              item[
                "KM Rodados"
              ] || 0
            ),
          0
        );

      const totalFaturamento =
        dados.reduce(
          (total, item) =>
            total +
            Number(
              item.Valor || 0
            ),
          0
        );

      const planilha =
        XLSX.utils.json_to_sheet(
          dados
        );

      const ultimaLinha =
        dados.length + 1;

      const linhaTotal =
        ultimaLinha + 1;

      planilha["!cols"] = [
        { wch: 14 },
        { wch: 14 },
        { wch: 38 },
        { wch: 14 },
        { wch: 14 },
        { wch: 15 },
        { wch: 18 },
        { wch: 45 }
      ];

      const azul = "2563EB";
      const azulClaro = "DBEAFE";
      const verdeClaro = "DCFCE7";
      const verdeEscuro =
        "166534";
      const amarelo = "F59E0B";
      const branco = "FFFFFF";
      const cinzaClaro =
        "F8FAFC";
      const cinzaBorda =
        "CBD5E1";
      const preto = "1E293B";

      const borda = {
        top: {
          style: "thin",
          color: cinzaBorda
        },
        bottom: {
          style: "thin",
          color: cinzaBorda
        },
        left: {
          style: "thin",
          color: cinzaBorda
        },
        right: {
          style: "thin",
          color: cinzaBorda
        }
      };

      const colunas = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H"
      ];

      colunas.forEach(
        (coluna) => {
          const celula =
            planilha[
              `${coluna}1`
            ];

          if (!celula) return;

          celula.s = {
            fill: {
              fgColor: {
                rgb: azul
              }
            },

            font: {
              bold: true,
              color: branco,
              sz: 12
            },

            alignment: {
              horizontal:
                "center",
              vertical:
                "center"
            },

            border: borda
          };
        }
      );

      for (
        let linha = 2;
        linha <= ultimaLinha;
        linha++
      ) {
        const fundo =
          linha % 2 === 0
            ? branco
            : cinzaClaro;

        colunas.forEach(
          (coluna) => {
            const celula =
              planilha[
                `${coluna}${linha}`
              ];

            if (!celula) return;

            celula.s = {
              fill: {
                fgColor: {
                  rgb: fundo
                }
              },

              font: {
                color: preto,
                sz: 11
              },

              alignment: {
                vertical:
                  "center",

                horizontal:
                  coluna === "C" ||
                  coluna === "H"
                    ? "left"
                    : "center"
              },

              border: borda
            };
          }
        );

        [
          "D",
          "E",
          "F"
        ].forEach(
          (coluna) => {
            const celula =
              planilha[
                `${coluna}${linha}`
              ];

            if (!celula) return;

            celula.s = {
              fill: {
                fgColor: {
                  rgb:
                    azulClaro
                }
              },

              font: {
                color: azul,
                bold: true
              },

              alignment: {
                horizontal:
                  "center",
                vertical:
                  "center"
              },

              border: borda
            };
          }
        );

        const valor =
          planilha[
            `G${linha}`
          ];

        if (valor) {
          valor.z =
            "R$ #,##0.00";

          valor.s = {
            fill: {
              fgColor: {
                rgb:
                  verdeClaro
              }
            },

            font: {
              color:
                verdeEscuro,
              bold: true,
              sz: 11
            },

            alignment: {
              horizontal:
                "center",
              vertical:
                "center"
            },

            border: borda
          };
        }
      }

      planilha[
        `A${linhaTotal}`
      ] = {
        t: "s",
        v: "TOTAL DO MÊS"
      };

      planilha[
        `F${linhaTotal}`
      ] = {
        t: "n",
        v: totalKm
      };

      planilha[
        `G${linhaTotal}`
      ] = {
        t: "n",
        v:
          totalFaturamento,
        z:
          "R$ #,##0.00"
      };

      colunas.forEach(
        (coluna) => {
          const celula =
            planilha[
              `${coluna}${linhaTotal}`
            ];

          if (!celula) return;

          celula.s = {
            fill: {
              fgColor: {
                rgb: amarelo
              }
            },

            font: {
              bold: true,
              color: branco,
              sz: 12
            },

            alignment: {
              horizontal:
                "center",
              vertical:
                "center"
            },

            border: borda
          };
        }
      );

      planilha[
        `F${linhaTotal}`
      ].s = {
        fill: {
          fgColor: {
            rgb: azul
          }
        },

        font: {
          bold: true,
          color: branco,
          sz: 12
        },

        alignment: {
          horizontal:
            "center",
          vertical:
            "center"
        },

        border: borda
      };

      planilha[
        `G${linhaTotal}`
      ].s = {
        fill: {
          fgColor: {
            rgb:
              verdeEscuro
          }
        },

        font: {
          bold: true,
          color: branco,
          sz: 12
        },

        alignment: {
          horizontal:
            "center",
          vertical:
            "center"
        },

        border: borda
      };

      planilha["!ref"] =
        `A1:H${linhaTotal}`;

      planilha[
        "!autofilter"
      ] = {
        ref:
          `A1:H${ultimaLinha}`
      };

      planilha[
        "!freeze"
      ] = {
        xSplit: 0,
        ySplit: 1
      };

      const livro =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        livro,
        planilha,
        "Serviços"
      );

      const arquivo =
        XLSX.write(livro, {
          bookType: "xlsx",
          type: "array"
        });

      const bytes =
        new Uint8Array(
          arquivo
        );

      let binario = "";

      const tamanho =
        0x8000;

      for (
        let i = 0;
        i < bytes.length;
        i += tamanho
      ) {
        const pedaco =
          bytes.subarray(
            i,
            Math.min(
              i + tamanho,
              bytes.length
            )
          );

        binario +=
          String.fromCharCode(
            ...pedaco
          );
      }

      const base64 =
        btoa(binario);

      const nomeArquivo =
        `Relatorio_Servicos_${anoSelecionado}-${mesSelecionado}.xlsx`;

      const canalFlutter =
        (window as any)
          .RotaProDownload;

      if (
        canalFlutter &&
        typeof canalFlutter.postMessage ===
          "function"
      ) {
        canalFlutter.postMessage(
          JSON.stringify({
            nome: nomeArquivo,
            arquivo: base64
          })
        );

        return;
      }

      const blob =
        new Blob(
          [arquivo],
          {
            type:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        nomeArquivo;

      link.style.display =
        "none";

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      setTimeout(() => {
        URL.revokeObjectURL(
          url
        );
      }, 1000);
    } catch (error) {
      console.error(
        "Erro ao exportar Excel:",
        error
      );

      alert(
        "Não foi possível gerar o arquivo Excel. Tente novamente."
      );
    }
  }

  if (carregando) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          background:
            "#f1f5f9",
          fontFamily:
            "Arial"
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
          minHeight:
            "100vh",
          background:
            "#f1f5f9",
          padding:
            "80px 20px 30px",
          fontFamily:
            "Arial",
          maxWidth: 700,
          margin:
            "0 auto"
        }}
      >
        <h1
          style={{
            color:
              "#0f172a",
            marginBottom:
              20
          }}
        >
          📊 Relatório
        </h1>

        {/* SELETOR DE PERÍODO */}
        <div
          style={{
            background:
              "#fff",
            padding: 20,
            borderRadius:
              20,
            boxShadow:
              "0 5px 15px #0001",
            marginBottom:
              20
          }}
        >
          <div
            style={{
              color:
                "#334155",
              fontWeight:
                "bold",
              marginBottom:
                12
            }}
          >
            📅 Período do relatório
          </div>

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "1fr 1.4fr",
              gap: 12
            }}
          >
            {/* ANO */}
            <div>
              <label
                style={{
                  display:
                    "block",
                  fontSize:
                    13,
                  fontWeight:
                    "bold",
                  color:
                    "#64748b",
                  marginBottom:
                    6
                }}
              >
                Ano
              </label>

              <select
                value={
                  anoSelecionado
                }
                onChange={(e) =>
                  setAnoSelecionado(
                    e.target.value
                  )
                }
                style={{
                  width:
                    "100%",
                  height: 52,
                  padding:
                    "0 12px",
                  borderRadius:
                    12,
                  border:
                    "1px solid #cbd5e1",
                  background:
                    "#f8fafc",
                  color:
                    "#0f172a",
                  fontSize:
                    16,
                  fontWeight:
                    "bold",
                  outline:
                    "none",
                  cursor:
                    "pointer"
                }}
              >
                {anosDisponiveis.map(
                  (ano) => (
                    <option
                      key={ano}
                      value={String(
                        ano
                      )}
                    >
                      {ano}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* MÊS */}
            <div>
              <label
                style={{
                  display:
                    "block",
                  fontSize:
                    13,
                  fontWeight:
                    "bold",
                  color:
                    "#64748b",
                  marginBottom:
                    6
                }}
              >
                Mês
              </label>

              <select
                value={
                  mesSelecionado
                }
                onChange={(e) =>
                  setMesSelecionado(
                    e.target.value
                  )
                }
                style={{
                  width:
                    "100%",
                  height: 52,
                  padding:
                    "0 12px",
                  borderRadius:
                    12,
                  border:
                    "1px solid #cbd5e1",
                  background:
                    "#f8fafc",
                  color:
                    "#0f172a",
                  fontSize:
                    16,
                  fontWeight:
                    "bold",
                  outline:
                    "none",
                  cursor:
                    "pointer"
                }}
              >
                {meses.map(
                  (item) => (
                    <option
                      key={
                        item.valor
                      }
                      value={
                        item.valor
                      }
                    >
                      {item.nome}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div
            style={{
              marginTop:
                14,
              padding:
                "12px 15px",
              borderRadius:
                12,
              background:
                "#eff6ff",
              border:
                "1px solid #bfdbfe",
              color:
                "#1e40af",
              textAlign:
                "center",
              fontWeight:
                "bold"
            }}
          >
            📊 Relatório de{" "}
            {mesNome}{" "}
            {anoSelecionado}
          </div>

          <button
            onClick={
              exportarExcel
            }
            style={{
              width:
                "100%",
              marginTop:
                15,
              padding: 16,
              borderRadius:
                14,
              border:
                "none",
              background:
                "#2563eb",
              color:
                "#fff",
              fontSize:
                16,
              fontWeight:
                "bold",
              cursor:
                "pointer"
            }}
          >
            📊 Exportar Excel do mês
          </button>
        </div>

        {/* CARDS */}
        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(2, 1fr)",
            gap: 12
          }}
        >
          <div
            style={
              cardStyle
            }
          >
            <div
              style={
                tituloStyle
              }
            >
              💰 Faturamento
            </div>

            <h2
              style={{
                color:
                  "#16a34a",
                marginBottom:
                  0
              }}
            >
              {dinheiro(
                faturamento
              )}
            </h2>
          </div>

          <div
            style={
              cardStyle
            }
          >
            <div
              style={
                tituloStyle
              }
            >
              📋 Serviços
            </div>

            <h2
              style={{
                marginBottom:
                  0
              }}
            >
              {
                servicosMes.length
              }
            </h2>
          </div>

          <div
            style={
              cardStyle
            }
          >
            <div
              style={
                tituloStyle
              }
            >
              🛣️ KM Rodados
            </div>

            <h2
              style={{
                marginBottom:
                  0
              }}
            >
              {
                kmRodados
              }{" "}
              km
            </h2>
          </div>

          <div
            style={
              cardStyle
            }
          >
            <div
              style={
                tituloStyle
              }
            >
              📈 Média/Serviço
            </div>

            <h2
              style={{
                color:
                  "#2563eb",
                marginBottom:
                  0
              }}
            >
              {dinheiro(
                media
              )}
            </h2>
          </div>
        </div>

        {/* VEÍCULOS */}
        <div
          style={{
            background:
              "#fff",
            padding: 20,
            borderRadius:
              20,
            marginTop:
              20,
            boxShadow:
              "0 5px 15px #0001"
          }}
        >
          <h2>
            🚗🚐 Veículos
          </h2>

          <p>
            🚗 Carro:
            <b>
              {" "}
              {carros}
            </b>{" "}
            serviços
          </p>

          <p>
            🚐 Van:
            <b>
              {" "}
              {vans}
            </b>{" "}
            serviços
          </p>
        </div>

        {/* SERVIÇOS */}
        <div
          style={{
            background:
              "#fff",
            padding: 20,
            borderRadius:
              20,
            marginTop:
              20,
            boxShadow:
              "0 5px 15px #0001"
          }}
        >
          <h2>
            📋 Serviços do mês
          </h2>

          {servicosMes.length ===
          0 ? (
            <p
              style={{
                color:
                  "#64748b"
              }}
            >
              Nenhum serviço
              neste mês.
            </p>
          ) : (
            servicosMes.map(
              (item) => (
                <div
                  key={
                    item.id
                  }
                  style={{
                    padding:
                      "15px 0",
                    borderBottom:
                      "1px solid #e5e7eb"
                  }}
                >
                  <b>
                    {item.veiculo ===
                    "Van"
                      ? "🚐 Van"
                      : "🚗 Carro"}
                  </b>

                  <p
                    style={{
                      margin:
                        "6px 0"
                    }}
                  >
                    📅{" "}
                    {formatarData(
                      item.data
                    )}
                  </p>

                  <p
                    style={{
                      margin:
                        "6px 0"
                    }}
                  >
                    📍{" "}
                    {
                      item.trajeto
                    }
                  </p>

                  <p
                    style={{
                      margin:
                        "6px 0"
                    }}
                  >
                    🛣️ KM:{" "}
                    {
                      item.km_inicial ??
                      "-"
                    }
                    {" → "}
                    {
                      item.km_final ??
                      "-"
                    }
                  </p>

                  <p
                    style={{
                      margin:
                        "6px 0",
                      color:
                        "#16a34a",
                      fontWeight:
                        "bold"
                    }}
                  >
                    💰{" "}
                    {dinheiro(
                      Number(
                        item.valor ||
                          0
                      )
                    )}
                  </p>

                  {item.observacao && (
                    <p
                      style={{
                        margin:
                          "6px 0",
                        color:
                          "#64748b"
                      }}
                    >
                      📝{" "}
                      {
                        item.observacao
                      }
                    </p>
                  )}
                </div>
              )
            )
          )}
        </div>
      </main>
    </>
  );
}

const cardStyle = {
  background:
    "#fff",
  padding: 18,
  borderRadius:
    18,
  boxShadow:
    "0 5px 15px #0001"
};

const tituloStyle = {
  color:
    "#64748b"
};