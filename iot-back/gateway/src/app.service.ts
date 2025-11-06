import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class GatewayService {
  private prisma = new PrismaClient();

  // Enregistrer ou mettre à jour un thing
  async register(thing: any) {
    const existing = await this.prisma.thing.findFirst({
      where: { name: thing.name },
    });

    if (existing) {
      return this.prisma.thing.update({
        where: { id: existing.id },
        data: {
          url: thing.url,
          type: thing.type,
          state: thing.state || existing.state,
        },
      });
    }

    return this.prisma.thing.create({
      data: {
        name: thing.name,
        url: thing.url,
        type: thing.type,
        state: thing.state || {},
      },
    });
  }

  async getAll() {
    return this.prisma.thing.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getOne(id: number) {
    return this.prisma.thing.findUnique({ where: { id } });
  }

  async updateState(id: number, newState: any) {
    return this.prisma.thing.update({
      where: { id }, // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: { state: newState },
    });
  }

  // Communication avec les services
  async callAction(id: number, action: string, body: any = {}) {
    const thing = await this.getOne(id);
    if (!thing) throw new Error('Thing not found');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data } = await axios.post(
      `${thing.url}/${thing.type}/actions/${action}`,
      body,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data;
  }

  async getProperty(id: number, prop: string) {
    const thing = await this.getOne(id);
    if (!thing) throw new Error('Thing not found');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data } = await axios.get(
      `${thing.url}/${thing.type}/properties/${prop}`,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data;
  }
  async getAllPropertys(id: number) {
    const thing = await this.getOne(id);
    if (!thing) throw new Error('Thing not found');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data } = await axios.get(`${thing.url}/${thing.type}/properties`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data;
  }
}
