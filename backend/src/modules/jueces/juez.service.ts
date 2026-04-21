import { JuezRepository } from './juez.repository';
import { StoreEvaluacionDto } from './juez.types';

const juezRepository = new JuezRepository();

export class JuezService {
  async getDashboardData(userId: number) {
    const eventos = await juezRepository.getDashboardData(userId);
    return { success: true, data: { eventos } };
  }

  async getEvento(eventoId: number, juezId: number) {
    const data = await juezRepository.getEvento(eventoId, juezId);
    if (!data) throw { status: 404, message: 'Evento no encontrado' };
    return { success: true, data };
  }


  async getEvaluacionData(proyectoId: number, juezId: number) {
    const data = await juezRepository.getEvaluacionData(proyectoId, juezId);
    if (!data) throw { status: 404, message: 'Proyecto no encontrado' };

    return { success: true, data };
  }

  async storeEvaluacion(proyectoId: number, juezId: number, dto: StoreEvaluacionDto) {
    await juezRepository.storeEvaluacion(proyectoId, juezId, dto);
    return { success: true, message: 'Evaluación guardada.' };
  }
}
