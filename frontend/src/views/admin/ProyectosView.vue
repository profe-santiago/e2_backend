<template>
  <AppLayout>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.5rem">
      <div>
        <h2 style="font-size:1.5rem;font-weight:700">Proyectos</h2>
      </div>
      <nav style="font-size:.875rem;color:var(--text-muted);display:flex;gap:.5rem;align-items:center;margin-top:.25rem">
        <router-link to="/admin/dashboard" style="color:inherit;text-decoration:none" class="hover:text-indigo-600">Dashboard</router-link>
        <span>/</span>
        <span style="color:#4f46e5;font-weight:600">Proyectos</span>
      </nav>
    </div>
    <div class="table-container">
      <div v-if="loading" class="loading"><div class="spinner"></div></div>
      <table v-else>
        <thead><tr><th>Proyecto</th><th>Equipo</th><th>Evento</th><th>Repositorio</th></tr></thead>
        <tbody><tr v-for="p in proyectos" :key="p.id">
          <td style="font-weight:500">{{ p.nombre }}</td>
          <td>{{ p.equipo?.nombre || '-' }}</td>
          <td>{{ p.evento?.nombre || '-' }}</td>
          <td><a v-if="p.repositorio_url" :href="p.repositorio_url" target="_blank" style="color:#4f46e5;text-decoration:none;font-size:.875rem">🔗 Ver repositorio</a><span v-else style="color:#9ca3af">—</span></td>
        </tr></tbody>
      </table>
      <div v-if="!loading && !proyectos.length" class="empty-state"><h3>No hay proyectos registrados</h3></div>
    </div>
  </AppLayout>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../services/api'
const proyectos = ref([]); const loading = ref(true)
onMounted(async () => { try { const r = await api.get('/admin/proyectos'); proyectos.value=r.data.data.proyectos||r.data.data } catch(e){} finally { loading.value=false } })
</script>
