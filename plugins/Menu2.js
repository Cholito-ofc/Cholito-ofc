const handler = async (m, { conn }) => {
  const sender = m.sender || m.key?.participant || m.key?.remoteJid || "";
  const senderNumber = sender.split("@")[0];

  const img = 'https://i.ibb.co/4jft6vs/file.jpg';

  const texto = `┏━━━━━━━━━━━━━━━━━⬣
┃  *🗣️  M E N Ú - A U D I O S*
┗━━━━━━━━━━━━━━━━━⬣
*「 .on audios 」para activar*

1. _Takataka_  
2. _Tarado_  
3. _TKA_  
4. _Hey_  
5. _Freefire_  
6. _Feriado_  
7. _Aguanta_  
8. _Nadie te preguntó_  
9. _Niconico_  
10. _No, chupala_  
11. _No me hables_  
12. _No me hagas usar esto_  
13. _OMG_  
14. _Contexto_  
15. _Pero esto_  
16. _Pikachu_  
17. _Pokemon_  
18. _Verdad que te engañé_  
19. _¡Vivan los novios!_  
20. _Una pregunta_  
21. _Hermoso negro_  
22. _Buen día grupo_  
23. _Calla fan de BTS_  
24. _Cámbiate a Movistar_  
25. _Corte corte_  
26. _El tóxico_  
27. _Elmo sabe dónde vives_  
28. _En caso de investigación_  
29. _No estés triste_  
30. _Las reglas del grupo_  
31. _Me anda buscando Anonymous_  
32. _Motivación_  
33. _Muchachos escucharon..._  
34. _Nico nico_  
35. _No rompas más_  
36. _Potasio_  
37. _¿Qué tal grupo?_  
38. _Se están riendo de mí_  
39. _Su nivel de pendejo_  
40. _Tal vez_  
41. _¿Te gusta el pepino?_  
42. _Tengo los calzones_  
43. _Entrada_  
44. _Bien pensado Woody_  
45. _Esto va a ser épico papus_  
46. _Fino señores_  
47. _Me voy_  
48. _Homero chino_  
49. _Jesucristo_  
50. _La oración_  
51. _Me pican los cocos_  
52. _Te amo_  

*╰▸ No es necesario usar prefijos 「 ./# 」*
`;

  const fkontak = {
    key: {
      participants: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "Killua"
    },
    message: {
      contactMessage: {
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Killua;;;\nFN:KilluaBot\nitem1.TEL;waid=${senderNumber}:${senderNumber}\nitem1.X-ABLabel:Usuario\nEND:VCARD`
      }
    }
  };

  await conn.sendFile(m.chat, img, 'menu.jpg', texto, m, null, fkontak);
};

handler.command = ['menu2', 'menuaudios'];
handler.tags = ['main', 'audios'];
handler.help = ['menuaudios'];

module.exports = handler;