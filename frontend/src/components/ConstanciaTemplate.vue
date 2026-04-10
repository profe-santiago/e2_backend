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
            <div :class="['achievement', `achievement-${posicion}`]">{{ textoLogro }}</div>
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
    
    // Configuración optimizada para evitar hojas extra y desajustes
    const opt = {
      margin:       0,
      filename:     `Constancia_${equipo.value.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 1.0 },
      html2canvas:  { 
        scale: 2,
        useCORS: true,
        logging: false,
        scrollY: 0,
        scrollX: 0,
        windowWidth: 1120,
        windowHeight: 791
      },
      jsPDF:        { unit: 'px', format: [1120, 791], orientation: 'landscape' },
      pagebreak:    { mode: 'avoid-all' }
    };

    // Hacer visible el nodo en una posición fija pero DETRÁS de todo para evitar el parpadeo
    node.style.visibility = 'visible';
    node.style.position = 'fixed';
    node.style.top = '0';
    node.style.left = '0';
    node.style.zIndex = '-1000'; // Detrás de la UI

    html2pdf().set(opt).from(node.children[0]).output('bloburl').then((url) => {
        window.open(url, '_blank');
        
        // Restaurar estado oculto después de un breve delay para asegurar la captura
        setTimeout(() => {
            node.style.visibility = 'hidden';
            node.style.position = 'absolute';
            node.style.left = '-9999px';
            node.style.top = '-9999px';
            node.style.zIndex = '-100';
        }, 500);
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
  width: 1120px; 
  height: 791px;
  background: white;
  z-index: -100;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.constancia-body {
  font-family: 'Figtree', 'Helvetica', Arial, sans-serif;
  text-align: center;
  padding: 45px;
  /* Reducimos ligeramente el tamaño visual para que quepa holgadamente en el PDF de 1120x791 */
  width: 1118px;
  height: 789px;
  border: 12px double #1e293b;
  box-sizing: border-box;
  background: white;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  margin: 0;
}

/* Decorative inner border */
.constancia-body::after {
  content: '';
  position: absolute;
  inset: 15px;
  border: 2px solid #cbd5e1;
  pointer-events: none;
}

.constancia-body .header { margin-top: 15px; width: 100%; z-index: 10; }
.constancia-body .logo { font-size: 24px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.2em; }

.constancia-body .title { 
  font-size: 52px; 
  font-weight: 700; 
  color: #0f172a; 
  margin: 8px 0; 
  font-family: 'Georgia', 'Times New Roman', serif; 
  letter-spacing: 0.05em;
  z-index: 10;
}

.constancia-body .subtitle { font-size: 19px; color: #64748b; margin: 4px 0; font-weight: 500; z-index: 10; }

.constancia-body .recipient { 
  font-size: 36px; 
  font-weight: 800; 
  color: #1e293b; 
  margin: 8px 0; 
  border-bottom: 3px solid #e1e8f0; 
  display: inline-block; 
  padding-bottom: 8px; 
  max-width: 85%;
  z-index: 10;
}

.members-large small, .members-list small { 
  font-size: 17px; 
  color: #475569; 
  display: block; 
  font-style: italic; 
  max-width: 850px; 
  margin: 8px auto 0; 
  line-height: 1.5;
  z-index: 10;
}

.award-text-section { width: 100%; margin: 8px 0; z-index: 10; }

.constancia-body .achievement { 
  font-size: 38px; 
  font-weight: 800; 
  margin: 12px 0; 
  text-transform: uppercase; 
  letter-spacing: 0.15em; 
  text-shadow: 1px 1px 0px rgba(0,0,0,0.05);
}

.achievement-1 { color: #ca8a04; } /* Gold */
.achievement-2 { color: #64748b; } /* Silver */
.achievement-3 { color: #b45309; } /* Bronze */
.achievement-null { color: #64748b; }

.constancia-body .event { 
  font-size: 28px; 
  font-weight: 800; 
  color: #4f46e5; 
  margin-top: 8px; 
  display: block;
}

.bottom-section {
  position: relative;
  width: 100%;
  margin-top: auto;
  padding-bottom: 25px;
  z-index: 10;
}

.constancia-body .date { 
  font-size: 16px; 
  color: #94a3b8; 
  margin-bottom: 30px;
  font-weight: 600;
}

.constancia-body .signatures { 
  width: 100%; 
  display: flex; 
  justify-content: space-around; 
  padding: 0 80px; 
  box-sizing: border-box;
}

.constancia-body .sig-block { 
  width: 300px; 
  color: #1e293b;
  font-weight: 700;
  font-size: 16px;
}

.constancia-body .line { 
  width: 100%; 
  border-top: 2px solid #334155; 
  margin: 0 auto 12px auto; 
}
</style>
