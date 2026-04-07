<template>
  <div class="constancia-print-wrapper" aria-hidden="true" ref="constanciaNode">
    <div v-if="proyecto" class="constancia-body">
      <div class="header">
          <div class="logo">Sistema de Gestión de Proyectos</div>
      </div>

      <div class="title">CONSTANCIA DE {{ esGanador ? 'LOGRO' : 'PARTICIPACIÓN' }}</div>

      <p class="subtitle">{{ esGanador ? 'Se otorga el presente reconocimiento al equipo:' : 'Se otorga el presente documento al equipo:' }}</p>

      <div class="recipient">{{ equipo }}</div>

      <div v-if="esGanador" class="members-large">
          <p class="subtitle" style="margin-bottom: 8px;">Y a sus integrantes:</p>
          <small>{{ integrantesList }}</small>
      </div>
      <div v-else class="members-list">
          <p class="subtitle" style="margin-bottom: 8px;">Integrantes:</p>
          <small>{{ integrantesList }}</small>
      </div>

      <div class="award-text-section">
        <template v-if="esGanador">
            <p class="subtitle">Por haber obtenido el:</p>
            <div class="achievement">{{ textoLogro }}</div>
            <p class="subtitle">Con el proyecto "<strong>{{ proyecto.nombre }}</strong>" en el evento:</p>
        </template>
        <template v-else>
            <p class="subtitle" style="margin-top: 15px; margin-bottom: 15px;">Por su participación con el proyecto "<strong>{{ proyecto.nombre }}</strong>"</p>
            <p class="subtitle">en el evento:</p>
        </template>
        <div class="event">{{ eventoNombre }}</div>
      </div>

      <div class="bottom-section">
        <div class="date">
            Expedido el {{ fechaActual }}
        </div>

        <div class="signatures">
            <div class="sig-block">
                <div class="line"></div>
                <div>Director del Evento</div>
            </div>
            <div class="sig-block">
                <div class="line"></div>
                <div>Comité Evaluador</div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import html2pdf from 'html2pdf.js'

const props = defineProps({
  proyecto: Object,
  posicion: Number,
  eventoNombre: String
})

const constanciaNode = ref(null)

const esGanador = computed(() => {
  return props.posicion <= 3
})

const equipo = computed(() => {
  if (!props.proyecto) return ''
  return props.proyecto.equipo || 'Equipo sin nombre'
})

const textoLogro = computed(() => {
  switch(props.posicion) {
    case 1: return 'PRIMER LUGAR';
    case 2: return 'SEGUNDO LUGAR';
    case 3: return 'TERCER LUGAR';
    default: return 'PARTICIPACIÓN';
  }
})

const integrantesList = computed(() => {
  if(!props.proyecto || !props.proyecto.integrantes) return ''
  return props.proyecto.integrantes.map(m => m.name).join(', ')
})

const fechaActual = computed(() => {
  const d = new Date()
  const opciones = { day: 'numeric', month: 'long', year: 'numeric' }
  const fecha = d.toLocaleDateString('es-ES', opciones)
  // Forzar formato "d de mes del YYYY" eliminando cualquier coma
  const stringFecha = fecha.replace(',', '')
  const partes = stringFecha.split(' ')
  if(partes.length >= 3) {
      if(partes.includes('de')) return stringFecha
      return `${partes[0]} de ${partes[1]} del ${partes[2]}`
  }
  return stringFecha
})

const descargarPDF = () => {
    if(!constanciaNode.value) return;
    
    const node = constanciaNode.value;
    node.style.visibility = 'visible';
    node.style.position = 'relative';
    node.style.left = '0';
    node.style.top = '0';

    const opt = {
      margin:       0,
      filename:     `Constancia_${equipo.value}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, logging: false },
      jsPDF:        { unit: 'px', format: [1122, 793], orientation: 'landscape' }
    };

    html2pdf().set(opt).from(node.children[0]).save().then(() => {
        node.style.visibility = 'hidden';
        node.style.position = 'absolute';
        node.style.left = '-9999px';
        node.style.top = '-9999px';
    });
}
defineExpose({ descargarPDF })
</script>

<style scoped>
.constancia-print-wrapper {
  position: absolute;
  left: -9999px;
  top: -9999px;
  visibility: hidden;
  width: 1122px; 
  height: 793px;
  background: white;
  z-index: -100;
}

.constancia-body {
  font-family: 'Helvetica', Arial, sans-serif;
  text-align: center;
  padding: 40px;
  border: 15px double #1a202c;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background: white;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}

.constancia-body .header { margin-bottom: 5px; margin-top: 10px; width: 100%; }
.constancia-body .logo { font-size: 26px; font-weight: bold; color: #4a5568; text-transform: uppercase; }

.constancia-body .title { font-size: 44px; font-weight: bold; color: #2d3748; margin: 15px 0; font-family: 'Georgia', serif; }
.constancia-body .subtitle { font-size: 18px; color: #718096; margin: 5px 0; }
.constancia-body .recipient { font-size: 28px; font-weight: bold; color: #1a202c; margin: 15px 0; border-bottom: 2px solid #cbd5e0; display: inline-block; padding-bottom: 5px; max-width: 90%; }

.members-large small, .members-list small { font-size: 16px; color: #4a5568; display: block; font-style: italic; max-width: 800px; margin: 0 auto; line-height: 1.5; }
.members-list { margin-bottom: 10px; width: 100%; }

.award-text-section { width: 100%; margin: 15px 0; }
.constancia-body .achievement { font-size: 30px; font-weight: bold; color: #d69e2e; margin: 15px 0; text-transform: uppercase; letter-spacing: 2px; }
.constancia-body .event { font-size: 24px; font-weight: bold; color: #2b6cb0; margin-top: 10px; }

.bottom-section {
  position: relative;
  height: 100px;
  width: 100%;
  margin-top: 20px;
  margin-bottom: 10px;
}

.constancia-body .date { position: absolute; top: 0; left: 0; right: 0; font-size: 14px; color: #718096; }
.constancia-body .signatures { position: absolute; bottom: 0; width: 100%; display: flex; justify-content: space-around; padding: 0 50px; box-sizing: border-box;}
.constancia-body .sig-block { width: 40%; }
.constancia-body .line { width: 220px; border-top: 1px solid #000; margin: 0 auto 10px auto; }
</style>
