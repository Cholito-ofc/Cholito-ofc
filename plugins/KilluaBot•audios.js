let handler = async (m, { conn }) => {
  let chat = global.db?.data?.chats?.[m.chat] || {};
  if (!chat.audios) return; // Si no están activos, no responde

  let text = m.text?.toLowerCase();
  if (!text) return;

  const audios = {
    "tarado": "https://qu.ax/CoOd.mp3",
    "teamo": "https://cdn.russellxz.click/4a69e7be.mp3",
    "tka": "https://qu.ax/jakw.mp3",
    "hey": "https://qu.ax/AaBt.mp3",
    "freefire": "https://qu.ax/Dwqp.mp3",
    "feriado": "https://qu.ax/mFCT.mp3",
    "aguanta": "https://qu.ax/Qmz.mp3",
    "nadie te pregunto": "https://qu.ax/MrGg.mp3",
    "niconico": "https://qu.ax/YdVq.mp3",
    "no chupala": "https://qu.ax/iCRk.mp3",
    "no me hables": "https://qu.ax/xxtz.mp3",
    "no me hagas usar esto": "https://qu.ax/bzDa.mp3",
    "omg": "https://qu.ax/PfuN.mp3",
    "contexto": "https://qu.ax/YBzh.mp3",
    "pero esto": "https://qu.ax/javz.mp3",
    "pikachu": "https://qu.ax/wbAf.mp3",
    "pokemon": "https://qu.ax/kWLh.mp3",
    "verdad que te engañe": "https://qu.ax/yTid.mp3",
    "vivan los novios": "https://qu.ax/vHX.mp3",
    "una pregunta": "https://qu.ax/NHOM.mp3",
    "hermoso negro": "https://qu.ax/ExSQ.mp3",
    "buen dia grupo": "https://qu.ax/GoKq.mp3",
    "calla fan de bts": "https://qu.ax/oqNf.mp3",
    "cambiate a movistar": "https://qu.ax/RxJC.mp3",
    "corte corte": "https://qu.ax/hRuU.mp3",
    "el toxico": "https://qu.ax/WzBd.mp3",
    "elmo sabe donde vives": "https://qu.ax/YsLt.mp3",
    "en caso de una investigacion": "https://qu.ax/Syg.mp3",
    "no estes tite": "https://qu.ax/VrjA.mp3",
    "las reglas del grupo": "https://qu.ax/fwek.mp3",
    "me anda buscando anonymous": "https://qu.ax/MWJz.mp3",
    "motivacion": "https://qu.ax/MXnK.mp3",
    "muchachos escucharon": "https://qu.ax/dRVb.mp3",
    "nico nico": "https://qu.ax/OUyB.mp3",
    "no rompas mas": "https://qu.ax/ZkAp.mp3",
    "potasio": "https://qu.ax/vPoj.mp3",
    "que tal grupo": "https://qu.ax/lirF.mp3",
    "se estan riendo de mi": "https://qu.ax/XBXo.mp3",
    "su nivel de pendejo": "https://qu.ax/SUHo.mp3",
    "tal vez": "https://qu.ax/QMjH.mp3",
    "te gusta el pepino": "https://qu.ax/ddrn.mp3",
    "tengo los calzones": "https://qu.ax/pzRp.mp3",
    "entrada": "https://qu.ax/UpAC.mp3",
    "bien pensado woody": "https://qu.ax/nvxb.mp3",
    "esto va a ser epico papus": "https://qu.ax/Tabl.mp3",
    "fino señores": "https://qu.ax/hapR.mp3",
    "me voy": "https://qu.ax/iOky.mp3",
    "homero chino": "https://qu.ax/ebe.mp3",
    "jesucristo": "https://qu.ax/AWdx.mp3",
    "laoracion": "https://qu.ax/GeeA.mp3",
    "me pican los cocos": "https://qu.ax/UrNl.mp3",
    "takataka": "https://qu.ax/jakw.mp3"
  };

  if (text in audios) {
    conn.sendPresenceUpdate("recording", m.chat);
    await conn.sendFile(m.chat, audios[text], `${text}.mp3`, null, m, true, {
      type: "audioMessage"
    });
  }
};

handler.customPrefix = /^[\s\S]+$/i;
handler.command = new RegExp;

export default handler;