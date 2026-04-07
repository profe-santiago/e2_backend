import prisma from '../../utils/prisma';
import { CreateProyectoDto, UpdateProyectoDto, ProyectoQueryOptions } from './proyecto.types';

export class ProyectoRepository {
  async findAllPaginated(options: ProyectoQueryOptions) {
    const { page = 1, limit = 10, search, evento_id } = options;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.nombre = { contains: search };
    }
    if (evento_id) {
      where.evento_id = BigInt(evento_id);
    }

    const [count, rows] = await Promise.all([
      prisma.proyectos.count({ where }),
      prisma.proyectos.findMany({
        where,
        include: {
          equipos: true,
          eventos: true
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);

    return { count, rows };
  }

  async findById(id: number) {
    return prisma.proyectos.findUnique({
      where: { id: BigInt(id) },
      include: {
        equipos: {
          include: { equipo_miembros: true }
        },
        eventos: true,
        evaluaciones: {
          include: { evaluacion_criterios: true }
        }
      }
    });
  }

  async create(data: CreateProyectoDto) {
    return prisma.proyectos.create({
      data: {
        equipo_id: BigInt(data.equipo_id),
        evento_id: BigInt(data.evento_id),
        nombre: data.nombre,
        descripcion: data.descripcion,
        repositorio_url: data.repositorio_url,
        created_at: new Date(),
        updated_at: new Date(),
      }
    });
  }

  async update(id: number, data: UpdateProyectoDto) {
    const updateData: any = { updated_at: new Date() };
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.repositorio_url !== undefined) updateData.repositorio_url = data.repositorio_url;

    return prisma.proyectos.update({
      where: { id: BigInt(id) },
      data: updateData
    });
  }

  async delete(id: number) {
    return prisma.proyectos.delete({
      where: { id: BigInt(id) }
    });
  }
}
