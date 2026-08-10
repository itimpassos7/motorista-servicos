"use client";

import Menu from "./components/Menu";
import Link from "next/link";

export default function Home(){

  return (

    <>

      <Menu />


      <main

      style={{

        minHeight:"100vh",

        background:"linear-gradient(135deg,#f8fafc,#e2e8f0)",

        padding:"80px 20px 20px",

        fontFamily:"Arial"

      }}

      >


        <div

        style={{

          background:"#fff",

          padding:25,

          borderRadius:20,

          boxShadow:"0 5px 20px #0002",

          textAlign:"center"

        }}

        >


          <h1

          style={{

            color:"#0f172a"

          }}

          >

            🚐 Registro de Serviços

          </h1>


          <p

          style={{

            color:"#64748b"

          }}

          >

            Cadastre seus serviços rapidamente

          </p>



          <Link

href="/servicos"

style={{

  display:"block",

  marginTop:30,

  width:"100%",

  padding:18,

  borderRadius:15,

  background:"#16a34a",

  color:"#fff",

  fontSize:18,

  fontWeight:"bold",

  textDecoration:"none"

}}

>

  ➕ Novo Serviço

</Link>


        </div>


      </main>


    </>

  );

}