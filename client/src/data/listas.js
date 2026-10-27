import { usuario } from "./usuario";

export const listas = [
  {
  id: 10,
  titulo: "Favoritos do momento",
  descricao: "Tudo que eu mais amei nos últimos meses, de livros a jogos. Uma lista para quem quer conhecer meu gosto.",
  autor: { usuario: usuario.usuario, foto: usuario.foto },
  obraIds: [1, 2, 3, 4, 5],
},
{
  id: 11,
  titulo: "Para ler em 2026",
  descricao: "",
  autor: { usuario: usuario.usuario, foto: usuario.foto },
  obraIds: [2, 4, 6],
},
{
  id: 12,
  titulo: "Jogos de fim de semana",
  descricao: "",
  autor: { usuario: usuario.usuario, foto: usuario.foto },
  obraIds: [5],
},
{
  id: 13,
  titulo: "Lista",
  descricao: "",
  autor: { usuario: usuario.usuario, foto: usuario.foto },
  obraIds: [],
},
{
  id: 14,
  titulo: "Séries que me marcaram",
  descricao: "",
  autor: { usuario: usuario.usuario, foto: usuario.foto },
  obraIds: [3, 4],
},
{
  id: 15,
  titulo: "Releituras",
  descricao: "Livros que eu leria de novo.",
  autor: { usuario: usuario.usuario, foto: usuario.foto },
  obraIds: [1, 2],
},
{
  id: 16,
  titulo: "Clássicos",
  descricao: "O básico bem feito.",
  autor: { usuario: usuario.usuario, foto: usuario.foto },
  obraIds: [1],
},
{
  id: 17,
  titulo: "Lista número oito",
  descricao: "só para testar a paginação.",
  autor: { usuario: usuario.usuario, foto: usuario.foto },
  obraIds: [6, 5],
},
];