import { EventoRepository } from './evento.repository';
import { CreateEventoDto, UpdateEventoDto, EventoQueryOptions } from './evento.types';

const eventoRepository = new EventoRepository();

export class EventoService {
  async getAllEventos(options: EventoQueryOptions) {
    const { count, rows } = await eventoRepository.findAllPaginated(options);
    const limit = options.limit || 10;
    const page = options.page || 1;

    return {
      success: true,
      data: {
        eventos: rows.map((e) => ({
          ...e,
          id: Number(e.id),
        })),
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      },
    };
  }

  async getEventoById(id: number) {
    const evento = await eventoRepository.findById(id);
    if (!evento) {
      throw { status: 404, message: 'Evento no encontrado' };
    }

    const formattedEvento = {
      ...evento,
      id: Number(evento.id),
      // Frontend expects criterio_evaluacion array
      criterio_evaluacion: evento.evaluacion_criterios.map((c: any) => ({
        ...c,
        id: Number(c.id),
        evento_id: Number(c.evento_id),
        ponderacion: Number(c.ponderacion)
      })),
      // Frontend expects jueces array
      jueces: evento.evento_jueces.map((ej: any) => ({
        id: Number(ej.users.id),
        name: ej.users.name,
        email: ej.users.email,
      })),
    };

    return { success: true, data: formattedEvento };
  }

  async createEvento(data: CreateEventoDto) {
    const evento = await eventoRepository.create({
      nombre: data.nombre,
      descripcion: data.descripcion,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      max_jueces: data.max_jueces,
    });

    if (data.jueces && data.jueces.length > 0) {
      await eventoRepository.setJueces(Number(evento.id), data.jueces);
    }

    return {
      success: true,
      message: 'Evento creado exitosamente.',
      data: { ...evento, id: Number(evento.id) },
    };
  }

  async updateEvento(id: number, data: UpdateEventoDto) {
    const evento = await eventoRepository.findById(id);
    if (!evento) {
      throw { status: 404, message: 'Evento no encontrado' };
    }

    await eventoRepository.update(id, data);

    if (data.jueces) {
      await eventoRepository.setJueces(id, data.jueces);
    }

    return { success: true, message: 'Evento actualizado exitosamente.' };
  }

  async deleteEvento(id: number) {
    const evento = await eventoRepository.findById(id);
    if (!evento) {
      throw { status: 404, message: 'Evento no encontrado' };
    }

    await eventoRepository.delete(id);
    return { success: true, message: 'Evento eliminado exitosamente.' };
  }

  async addJuezToEvento(eventoId: number, userId: number) {
    const eventoRes = await this.getEventoById(eventoId);
    const evento = eventoRes.data;

    // 1. Validar límite máximo
    const currentCount = evento.jueces?.length || 0;
    const limit = evento.max_jueces || 5;

    if (currentCount >= limit) {
      throw { status: 400, message: `Capacidad máxima alcanzada (${limit} jueces).` };
    }

    // 2. Validar si ya está asignado
    const alreadyAsigned = evento.jueces?.find((j: any) => j.id === userId);
    if (alreadyAsigned) {
      throw { status: 400, message: 'El juez ya está asignado a este evento.' };
    }

    await eventoRepository.addJuez(eventoId, userId);
    return { success: true, message: 'Juez asignado correctamente.' };
  }

  async removeJuezFromEvento(eventoId: number, userId: number) {
    await eventoRepository.removeJuez(eventoId, userId);
    return { success: true, message: 'Juez removido correctamente.' };
  }

  async getAvailableJueces() {
    const jueces = await eventoRepository.getAvailableJueces();
    return {
      success: true,
      data: jueces.map((j) => ({
        id: Number(j.id),
        name: j.name,
        email: j.email,
      })),
    };
  }
}
