const $ = (id) => document.getElementById(id);

const TEXTOS = {
  es: {
    lang: "es-CO",
    niveles: { baja: "Baja", normal: "Normal", alta: "Alta", acido: "Ácido", alcalino: "Alcalino" },
    reporte: (t, h, p) => `El invernadero tiene Temperatura ${t}, Humedad ${h} y pH ${p}`,
    sinDatos: "Primero debe leer los datos.",
    sinVoz: "Este navegador no admite síntesis de voz.",
  },
  en: {
    lang: "en-US",
    niveles: { baja: "Low", normal: "Normal", alta: "High", acido: "Acidic", alcalino: "Alkaline" },
    reporte: (t, h, p) => `The greenhouse has ${t} Temperature, ${h} Humidity and ${p} pH`,
    sinDatos: "Please read the data first.",
    sinVoz: "This browser does not support speech synthesis.",
  },
};

const RANGOS = {
  temperatura: { min: 18, max: 28 },  // °C
  humedad: { min: 40, max: 70 },      // % HR
  ph: { min: 5.5, max: 6.5 },         // solución nutritiva / sustrato
};

function clasificar(valor, { min, max }) {
  if (valor < min) return "baja";
  if (valor > max) return "alta";
  return "normal";
}

let lectura = null;

function leerSensores() {
  return {
    temperatura: Math.round(10 + Math.random() * 25),         // 10–35 °C
    humedad: Math.round(25 + Math.random() * 60),             // 25–85 %
    ph: Math.round((4.5 + Math.random() * 3.5) * 10) / 10,    // 4.5–8.0
  };
}

function construirReporte(idioma) {
  const T = TEXTOS[idioma];
  const n = T.niveles;
  const t = n[clasificar(lectura.temperatura, RANGOS.temperatura)];
  const h = n[clasificar(lectura.humedad, RANGOS.humedad)];
  const clasePh = clasificar(lectura.ph, RANGOS.ph);
  const p = clasePh === "baja" ? n.acido : clasePh === "alta" ? n.alcalino : n.normal;
  return T.reporte(t, h, p);
}

function actualizarReporte() {
  if (!lectura) return;
  $("reporte").value = construirReporte($("idioma").value);
  document.documentElement.lang = $("idioma").value;
}

$("btnLeer").addEventListener("click", () => {
  lectura = leerSensores();
  $("temperatura").value = lectura.temperatura;
  $("humedad").value = lectura.humedad;
  $("ph").value = lectura.ph;
  actualizarReporte();
});

$("idioma").addEventListener("change", actualizarReporte);

$("btnReporte").addEventListener("click", () => {
  const idioma = $("idioma").value;
  const T = TEXTOS[idioma];
  if (!lectura) { alert(T.sinDatos); return; }
  if (!("speechSynthesis" in window)) { alert(T.sinVoz); return; }

  const voz = new SpeechSynthesisUtterance($("reporte").value);
  voz.lang = T.lang;
  // Si existe una voz instalada para ese idioma, se usa; si no, el navegador elige una por defecto
  const voces = window.speechSynthesis.getVoices();
  const elegida = voces.find((v) => v.lang === T.lang) || voces.find((v) => v.lang.startsWith(idioma));
  if (elegida) voz.voice = elegida;

  window.speechSynthesis.cancel(); // evita que se encolen reportes
  window.speechSynthesis.speak(voz);
});

if ("speechSynthesis" in window) window.speechSynthesis.onvoiceschanged = () => {};
