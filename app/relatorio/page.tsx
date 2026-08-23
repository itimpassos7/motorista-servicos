"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Menu from "../components/Menu";
import * as XLSX from "xlsx-js-style";

export default function Relatorio() {
  const [servicos, setServicos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [mes, setMes] = useState(
    new Date().toISOString().slice(0, 7)
  );

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

  const servicosMes = servicos.filter((item) =>
    item.data?.startsWith(mes)
  );

  const faturamento = servicosMes.reduce(
    (total, item) =>
      total + Number(item.valor || 0),
    0
  );

  const kmRodados = servicosMes.reduce(
    (total, item) => {
      const inicial = Number(
        item.km_inicial || 0
      );

      const final = Number(
        item.km_final || 0
      );

      if (final >= inicial) {
        return total + (final - inicial);
      }

      return total;
    },
    0
  );

  const carros = servicosMes.filter(
    (item) => item.veiculo === "Carro"
  ).length;

  const vans = servicosMes.filter(
    (item) => item.veiculo === "Van"
  ).length;

  const media = servicosMes.length
    ? faturamento / servicosMes.length
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

  function formatarData(data: string) {
    if (!data) return "";

    const [ano, mes, dia] =
      data.split("-");

    return `${dia}/${mes}/${ano}`;
  }

  async function exportarExcel() {
    if (servicosMes.length === 0) {
      alert(
        "Não existem serviços neste mês."
      );

      return;
    }

    try {
      /*
        ========================================================
        PREPARA OS DADOS
        ========================================================
      */

      const dados = servicosMes.map((item) => {
        const kmInicial = Number(
          item.km_inicial || 0
        );

        const kmFinal = Number(
          item.km_final || 0
        );

        const kmServico =
          kmFinal >= kmInicial
            ? kmFinal - kmInicial
            : 0;

        return {
          Data: formatarData(
            item.data
          ).toUpperCase(),

          Veículo: (
            item.veiculo || ""
          ).toUpperCase(),

          Trajeto: (
            item.trajeto || ""
          ).toUpperCase(),

          "KM Inicial": kmInicial,

          "KM Final": kmFinal,

          "KM Rodados": kmServico,

          Valor: Number(
            item.valor || 0
          ),

          Observação: (
            item.observacao || ""
          ).toUpperCase()
        };
      });

      /*
        ========================================================
        TOTAIS
        ========================================================
      */

      const totalKm = dados.reduce(
        (total, item) =>
          total +
          Number(
            item["KM Rodados"] || 0
          ),
        0
      );

      const totalFaturamento =
        dados.reduce(
          (total, item) =>
            total +
            Number(item.Valor || 0),
          0
        );

      /*
        ========================================================
        CRIA PLANILHA
        ========================================================
      */

      const planilha =
        XLSX.utils.json_to_sheet(dados);

      const ultimaLinha =
        dados.length + 1;

      const linhaTotal =
        ultimaLinha + 1;

      /*
        ========================================================
        LARGURA DAS COLUNAS
        ========================================================
      */

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

      /*
        ========================================================
        CORES
        ========================================================
      */

      const azul = "2563EB";
      const azulClaro = "DBEAFE";
      const verdeClaro = "DCFCE7";
      const verdeEscuro = "166534";
      const amarelo = "F59E0B";
      const branco = "FFFFFF";
      const cinzaClaro = "F8FAFC";
      const cinzaBorda = "CBD5E1";
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

      /*
        ========================================================
        CABEÇALHO
        ========================================================
      */

      colunas.forEach((coluna) => {
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
            horizontal: "center",
            vertical: "center"
          },

          border: borda
        };
      });

      /*
        ========================================================
        DADOS
        ========================================================
      */

      for (
        let linha = 2;
        linha <= ultimaLinha;
        linha++
      ) {
        const fundo =
          linha % 2 === 0
            ? branco
            : cinzaClaro;

        colunas.forEach((coluna) => {
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
              vertical: "center",

              horizontal:
                coluna === "C" ||
                coluna === "H"
                  ? "left"
                  : "center"
            },

            border: borda
          };
        });

        /*
          KM
        */

        ["D", "E", "F"].forEach(
          (coluna) => {
            const celula =
              planilha[
                `${coluna}${linha}`
              ];

            if (!celula) return;

            celula.s = {
              fill: {
                fgColor: {
                  rgb: azulClaro
                }
              },

              font: {
                color: azul,
                bold: true
              },

              alignment: {
                horizontal: "center",
                vertical: "center"
              },

              border: borda
            };
          }
        );

        /*
          VALOR
        */

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
                rgb: verdeClaro
              }
            },

            font: {
              color: verdeEscuro,
              bold: true,
              sz: 11
            },

            alignment: {
              horizontal: "center",
              vertical: "center"
            },

            border: borda
          };
        }
      }

      /*
        ========================================================
        TOTAL DO MÊS
        ========================================================
      */

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
        v: totalFaturamento,
        z: "R$ #,##0.00"
      };

      /*
        ========================================================
        ESTILO DO TOTAL
        ========================================================
      */

      colunas.forEach((coluna) => {
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
            horizontal: "center",
            vertical: "center"
          },

          border: borda
        };
      });

      /*
        TOTAL KM
      */

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
          horizontal: "center",
          vertical: "center"
        },

        border: borda
      };

      /*
        TOTAL FATURAMENTO
      */

      planilha[
        `G${linhaTotal}`
      ].s = {
        fill: {
          fgColor: {
            rgb: verdeEscuro
          }
        },

        font: {
          bold: true,
          color: branco,
          sz: 12
        },

        alignment: {
          horizontal: "center",
          vertical: "center"
        },

        border: borda
      };

      /*
        ========================================================
        FILTRO
        ========================================================
      */

      planilha["!ref"] =
        `A1:H${linhaTotal}`;

      planilha["!autofilter"] = {
        ref: `A1:H${ultimaLinha}`
      };

      /*
        ========================================================
        CONGELAR CABEÇALHO
        ========================================================
      */

      planilha["!freeze"] = {
        xSplit: 0,
        ySplit: 1
      };

      /*
        ========================================================
        CRIA LIVRO
        ========================================================
      */

      const livro =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        livro,
        planilha,
        "Serviços"
      );

      /*
        ========================================================
        GERA O XLSX EM ARRAY
        ========================================================
      */

      const arquivo =
        XLSX.write(livro, {
          bookType: "xlsx",
          type: "array"
        });

      /*
        ========================================================
        CONVERTE PARA BASE64
        ========================================================
      */

      const bytes =
        new Uint8Array(arquivo);

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

        binario += String.fromCharCode(
          ...pedaco
        );
      }

      const base64 =
        btoa(binario);

      const nomeArquivo =
        `Relatorio_Servicos_${mes}.xlsx`;

      /*
        ========================================================
        INTEGRAÇÃO COM O APLICATIVO ROTAPRO
        ========================================================
      */

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

      /*
        ========================================================
        CASO NÃO ESTEJA NO APLICATIVO
        DOWNLOAD NORMAL DO NAVEGADOR
        ========================================================
      */

      const blob =
        new Blob(
          [arquivo],
          {
            type:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          }
        );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

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
        URL.revokeObjectURL(url);
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
          📊 Relatório
        </h1>

        <div
          style={{
            background: "#fff",
            padding: 20,
            borderRadius: 20,
            boxShadow: "0 5px 15px #0001",
            marginBottom: 20
          }}
        >
          <label>
            📅 Escolha o mês
          </label>

          <input
            type="month"
            value={mes}
            onChange={(e) =>
              setMes(e.target.value)
            }
            style={{
              width: "100%",
              padding: 14,
              marginTop: 8,
              borderRadius: 12,
              border:
                "1px solid #cbd5e1",
              fontSize: 16,
              boxSizing:
                "border-box"
            }}
          />

          <button
            onClick={exportarExcel}
            style={{
              width: "100%",
              marginTop: 15,
              padding: 16,
              borderRadius: 14,
              border: "none",
              background: "#2563eb",
              color: "#fff",
              fontSize: 16,
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            📊 Exportar Excel do mês
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2, 1fr)",
            gap: 12
          }}
        >
          <div style={cardStyle}>
            <div style={tituloStyle}>
              💰 Faturamento
            </div>

            <h2
              style={{
                color: "#16a34a",
                marginBottom: 0
              }}
            >
              {dinheiro(faturamento)}
            </h2>
          </div>

          <div style={cardStyle}>
            <div style={tituloStyle}>
              📋 Serviços
            </div>

            <h2
              style={{
                marginBottom: 0
              }}
            >
              {servicosMes.length}
            </h2>
          </div>

          <div style={cardStyle}>
            <div style={tituloStyle}>
              🛣️ KM Rodados
            </div>

            <h2
              style={{
                marginBottom: 0
              }}
            >
              {kmRodados} km
            </h2>
          </div>

          <div style={cardStyle}>
            <div style={tituloStyle}>
              📈 Média/Serviço
            </div>

            <h2
              style={{
                color: "#2563eb",
                marginBottom: 0
              }}
            >
              {dinheiro(media)}
            </h2>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            padding: 20,
            borderRadius: 20,
            marginTop: 20,
            boxShadow: "0 5px 15px #0001"
          }}
        >
          <h2>
            🚗🚐 Veículos
          </h2>

          <p>
            🚗 Carro:
            <b> {carros}</b> serviços
          </p>

          <p>
            🚐 Van:
            <b> {vans}</b> serviços
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            padding: 20,
            borderRadius: 20,
            marginTop: 20,
            boxShadow: "0 5px 15px #0001"
          }}
        >
          <h2>
            📋 Serviços do mês
          </h2>

          {servicosMes.length === 0 ? (
            <p
              style={{
                color: "#64748b"
              }}
            >
              Nenhum serviço neste mês.
            </p>
          ) : (
            servicosMes.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: "15px 0",
                  borderBottom:
                    "1px solid #e5e7eb"
                }}
              >
                <b>
                  {item.veiculo === "Van"
                    ? "🚐 Van"
                    : "🚗 Carro"}
                </b>

                <p
                  style={{
                    margin: "6px 0"
                  }}
                >
                  📅 {formatarData(item.data)}
                </p>

                <p
                  style={{
                    margin: "6px 0"
                  }}
                >
                  📍 {item.trajeto}
                </p>

                <p
                  style={{
                    margin: "6px 0"
                  }}
                >
                  🛣️ KM:{" "}
                  {item.km_inicial ?? "-"}
                  {" → "}
                  {item.km_final ?? "-"}
                </p>

                <p
                  style={{
                    margin: "6px 0",
                    color: "#16a34a",
                    fontWeight: "bold"
                  }}
                >
                  💰{" "}
                  {dinheiro(
                    Number(
                      item.valor || 0
                    )
                  )}
                </p>

                {item.observacao && (
                  <p
                    style={{
                      margin: "6px 0",
                      color: "#64748b"
                    }}
                  >
                    📝 {item.observacao}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
}

const cardStyle = {
  background: "#fff",
  padding: 18,
  borderRadius: 18,
  boxShadow:
    "0 5px 15px #0001"
};

const tituloStyle = {
  color: "#64748b"
};